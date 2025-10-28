/* PetFinder Demo Frontend (no backend)
 - Stores posts in localStorage
 - Renders map with Leaflet
 - Filters by topic, attributes, user, distance
 - Geolocation support, toast notifications
*/

const state = {
  topic: 'lost',
  posts: [],
  filters: {},
  userLocation: null,
  map: null,
  markers: [],
};

const el = (sel) => document.querySelector(sel);
const els = (sel) => Array.from(document.querySelectorAll(sel));

function toast(msg) {
  const t = el('#toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// Seed with some demo posts on first load
function seedDemoPosts() {
  const key = 'pf_posts';
  const existed = localStorage.getItem(key);
  if (existed) return;
  const now = Date.now();
  const demo = [
    {
      id: crypto.randomUUID(),
      topic: 'Lost',
      title: 'Lost golden retriever near Retiro Park',
      species: 'Dog',
      breed: 'Golden Retriever',
      color: 'Golden',
      size: 'Large',
      gender: 'Male',
      description: 'Friendly, has blue collar. Name: Max.',
      photo:
          'https://images.unsplash.com/photo-1558944351-cacc37b77d4d?q=80&w=800&auto=format&fit=crop',
      contact: 'anna@example.com',
      user: 'anna',
      lat: 40.415363,
      lng: -3.68463,
      locationQuery: 'Parque de El Retiro, Madrid',
      createdAt: now - 1000 * 60 * 60 * 5
    },
    {
      id: crypto.randomUUID(),
      topic: 'Found',
      title: 'Found small black cat in Lavapiés',
      species: 'Cat',
      breed: 'Domestic',
      color: 'Black',
      size: 'Small',
      gender: 'Unknown',
      description: 'Very calm, no collar. Safe at my place.',
      photo:
          'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?q=80&w=800&auto=format&fit=crop',
      contact: 'leo@example.com',
      user: 'leo',
      lat: 40.40894,
      lng: -3.70081,
      locationQuery: 'Lavapiés, Madrid',
      createdAt: now - 1000 * 60 * 60 * 28
    },
    {
      id: crypto.randomUUID(),
      topic: 'Adoption',
      title: 'Puppies looking for a loving home',
      species: 'Dog',
      breed: 'Mixed',
      color: 'Brown',
      size: 'Medium',
      gender: 'Unknown',
      description: 'Vaccinated and playful. 3 months old.',
      photo:
          'https://images.unsplash.com/photo-1507146426996-ef05306b995a?q=80&w=800&auto=format&fit=crop',
      contact: 'rescue@example.org',
      user: 'rescue_org',
      lat: 40.43294,
      lng: -3.6426,
      locationQuery: 'Madrid',
      createdAt: now - 1000 * 60 * 60 * 48
    }
  ];
  localStorage.setItem(key, JSON.stringify(demo));
}

function loadPosts() {
  const raw = localStorage.getItem('pf_posts');
  state.posts = raw ? JSON.parse(raw) : [];
}

function savePosts() {
  localStorage.setItem('pf_posts', JSON.stringify(state.posts));
}

function initMap() {
  state.map = L.map('map').setView([40.4168, -3.7038], 12);  // Madrid default
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
     maxZoom: 19,
     attribution: '&copy; OpenStreetMap contributors'
   }).addTo(state.map);
}

function clearMarkers() {
  state.markers.forEach(m => m.remove());
  state.markers = [];
}

function addMarkers(posts) {
  clearMarkers();
  posts.forEach(p => {
    if (typeof p.lat === 'number' && typeof p.lng === 'number') {
      const marker = L.marker([p.lat, p.lng]).addTo(state.map).bindPopup(`
        <strong>${p.title}</strong><br/>
        <span class="badge ${p.topic.toLowerCase()}">${p.topic}</span>
        <div style="margin-top:6px">${p.locationQuery || ''}</div>
      `);
      state.markers.push(marker);
    }
  });
}

function formatDistanceKm(a, b) {
  if (!a || !b) return null;
  const R = 6371;
  const dLat = (b.lat - a.lat) * Math.PI / 180;
  const dLon = (b.lng - a.lng) * Math.PI / 180;
  const s1 = Math.sin(dLat / 2) ** 2 +
      Math.cos(a.lat * Math.PI / 180) * Math.cos(b.lat * Math.PI / 180) *
          Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(s1), Math.sqrt(1 - s1));
  return R * c;
}

function applyFilters() {
  const f = state.filters;
  const topic = state.topic;
  let list = state.posts.filter(p => p.topic.toLowerCase() === topic);
  const terms = ['species', 'breed', 'color', 'size', 'gender'];
  terms.forEach(k => {
    const v = (f[k] || '').trim().toLowerCase();
    if (v) list = list.filter(p => (p[k] || '').toLowerCase().includes(v));
  });
  if (f.user) {
    const u = f.user.trim().toLowerCase();
    list = list.filter(p => (p.user || '').toLowerCase().includes(u));
  }
  if (f.dateFrom)
    list = list.filter(p => p.createdAt >= new Date(f.dateFrom).getTime());
  if (f.dateTo)
    list = list.filter(
        p => p.createdAt <=
            new Date(f.dateTo).getTime() + 24 * 60 * 60 * 1000 - 1);

  // Nearby filter
  if (f.nearby && f.center && f.radiusKm) {
    list = list.map(p => ({
                      ...p,
                      _dist: (typeof p.lat === 'number' &&
                              typeof p.lng === 'number') ?
                          formatDistanceKm(f.center, {lat: p.lat, lng: p.lng}) :
                          null
                    }))
               .filter(p => p._dist != null && p._dist <= f.radiusKm);
  }

  // Sorting
  const sort = el('#sort-select').value;
  if (sort === 'new') {
    list.sort((a, b) => b.createdAt - a.createdAt);
  } else if (sort === 'near' && f.center) {
    list.sort((a, b) => {
      const da = formatDistanceKm(f.center, {lat: a.lat, lng: a.lng}) ?? 1e9;
      const db = formatDistanceKm(f.center, {lat: b.lat, lng: b.lng}) ?? 1e9;
      return da - db;
    });
  }

  return list;
}

function renderPosts() {
  const list = applyFilters();
  const ul = el('#posts-list');
  ul.innerHTML = '';
  if (!list.length) {
    ul.innerHTML =
        '<li class="card" style="text-align:center">No posts match your filters.</li>';
  }
  list.forEach(p => {
    const li = document.createElement('li');
    li.className = 'post';
    const when = new Date(p.createdAt).toLocaleString();
    const dist = (state.filters.center) ?
        formatDistanceKm(state.filters.center, {lat: p.lat, lng: p.lng}) :
        null;
    li.innerHTML = `
      <img class="photo" src="${
        p.photo ||
        'https://images.unsplash.com/photo-1516728778615-2d590ea1855e?q=80&w=600&auto=format&fit=crop'}" alt="">
      <div class="info">
        <div class="title">${p.title}</div>
        <div class="meta">
          <span class="badge ${p.topic.toLowerCase()}">${p.topic}</span>
          <span>${p.species || ''} ${p.breed ? '· ' + p.breed : ''}</span>
          <span>${p.color || ''} ${p.size ? '· ' + p.size : ''} ${
        p.gender ? '· ' + p.gender : ''}</span>
          <span>by ${p.user || 'anon'}</span>
          <span>${when}</span>
          ${dist != null ? `<span>${dist.toFixed(1)} km away</span>` : ''}
        </div>
        <div>${p.description || ''}</div>
        <div class="meta">
          ${
        p.locationQuery ? `<span class="badge">📍 ${p.locationQuery}</span>` :
                          ''}
          ${
        (typeof p.lat === 'number' && typeof p.lng === 'number') ?
            `<span class="badge">${p.lat.toFixed(4)}, ${
                p.lng.toFixed(4)}</span>` :
            ''}
          ${p.contact ? `<a href="#" class="badge">📞 ${p.contact}</a>` : ''}
        </div>
      </div>`;
    ul.appendChild(li);
  });
  addMarkers(list);
}

function readFiltersFromForm() {
  const form = el('#filters-form');
  const fd = new FormData(form);
  const f = Object.fromEntries(fd.entries());
  const nearby = el('#nearby-toggle').checked;
  const radiusKm = parseFloat(f.radius || '');
  state.filters = {
    species: f.species || '',
    breed: f.breed || '',
    color: f.color || '',
    size: f.size || '',
    gender: f.gender || '',
    user: f.user || '',
    dateFrom: f.dateFrom || '',
    dateTo: f.dateTo || '',
    nearby,
    center: nearby ? (state.userLocation || null) : null,
    radiusKm: nearby && radiusKm ? radiusKm : null,
  };
}

function bindEvents() {
  // Topic tabs
  els('.tab').forEach(btn => btn.addEventListener('click', () => {
    els('.tab').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected', 'false');
    });
    btn.classList.add('active');
    btn.setAttribute('aria-selected', 'true');
    state.topic = btn.dataset.topic;
    renderPosts();
  }));

  // Filters
  el('#filters-form').addEventListener('submit', (e) => {
    e.preventDefault();
    readFiltersFromForm();
    renderPosts();
  });
  el('#filters-form').addEventListener('reset', () => {
    setTimeout(() => {
      state.filters = {};
      el('#nearby-toggle').checked = false;
      renderPosts();
    }, 0);
  });

  // Sort and refresh
  el('#sort-select').addEventListener('change', renderPosts);
  el('#btn-refresh').addEventListener('click', () => {
    loadPosts();
    renderPosts();
    toast('Feed refreshed');
  });

  // Geolocation buttons
  el('#btn-locate').addEventListener('click', async () => {
    const loc = await getUserLocation();
    if (loc) {
      state.userLocation = loc;
      toast('Location set');
      if (state.map) state.map.setView([loc.lat, loc.lng], 13);
    }
  });
  el('#nearby-toggle').addEventListener('change', () => {
    readFiltersFromForm();
    renderPosts();
  });

  // New post modal
  el('#btn-new-post')
      .addEventListener('click', () => el('#post-modal').showModal());
  el('#close-modal').addEventListener('click', () => el('#post-modal').close());
  el('#cancel-post').addEventListener('click', () => el('#post-modal').close());
  el('#modal-use-location').addEventListener('click', async () => {
    const loc = await getUserLocation();
    if (loc) {
      const form = el('#post-form');
      form.lat.value = loc.lat;
      form.lng.value = loc.lng;
      toast('Coordinates filled');
    }
  });
  el('#post-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const form = e.target;
    const fd = new FormData(form);
    const data = Object.fromEntries(fd.entries());
    const lat = parseFloat(data.lat);
    const lng = parseFloat(data.lng);
    const post = {
      id: crypto.randomUUID(),
      topic: data.topic,
      title: data.title,
      species: data.species || '',
      breed: data.breed || '',
      color: data.color || '',
      size: data.size || '',
      gender: data.gender || '',
      description: data.description || '',
      photo: data.photo || '',
      contact: data.contact || '',
      user: 'you',
      locationQuery: data.locationQuery || '',
      lat: isFinite(lat) ? lat : undefined,
      lng: isFinite(lng) ? lng : undefined,
      createdAt: Date.now(),
    };
    state.posts.unshift(post);
    savePosts();
    renderPosts();
    el('#post-modal').close();
    notifyNewPost(post);
    form.reset();
    toast('Post published');
  });

  // Notifications
  el('#btn-notify').addEventListener('click', enableNotifications);
}

async function getUserLocation() {
  if (!('geolocation' in navigator)) {
    toast('Geolocation not supported');
    return null;
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({lat: pos.coords.latitude, lng: pos.coords.longitude});
        },
        () => {
          toast('Unable to get location');
          resolve(null);
        },
        {enableHighAccuracy: true, timeout: 8000});
  });
}

function enableNotifications() {
  if (!('Notification' in window)) {
    toast('Notifications not supported');
    return;
  }
  if (Notification.permission === 'granted') {
    toast('Already enabled');
    return;
  }
  Notification.requestPermission().then((perm) => {
    if (perm === 'granted')
      toast('Notifications enabled');
    else
      toast('Notifications blocked');
  });
}

function notifyNewPost(post) {
  const title = `[${post.topic}] ${post.title}`;
  if ('Notification' in window && Notification.permission === 'granted') {
    const body =
        `${post.species || ''} ${post.breed || ''} ${post.color || ''}`.trim();
    const n = new Notification(title, {body, icon: post.photo || undefined});
    setTimeout(() => n.close(), 5000);
  } else {
    toast(`${title} posted`);
  }
}

function init() {
  seedDemoPosts();
  loadPosts();
  initMap();
  bindEvents();
  renderPosts();
}

window.addEventListener('DOMContentLoaded', init);
