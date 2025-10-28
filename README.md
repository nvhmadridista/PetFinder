# PetFinder — Lost & Found Pets (Frontend Demo)

A modern, responsive, front‑end only prototype to help communities find lost pets and reunite found pets with their owners. Posts are stored in the browser (localStorage). A Leaflet map shows last‑known locations. No backend required.

## Features

- Topic tabs: Lost, Found, Adoption
- Post feed with photo, details, contact, timestamps
- Create Post modal (stores to localStorage)
- Map with markers for post locations (Leaflet + OpenStreetMap)
- Filtering by species, breed, color, size, gender, user, date range
- “Only in my area” distance filter using browser geolocation + radius (km)
- Sort by Newest or Nearest
- In‑app toasts and optional browser notifications for new posts

## Quick start

1. Clone or download this folder.
2. Serve it as a static site (recommended for geolocation/notifications):
   - Any static HTTP server works (e.g., `localhost`).
3. Open `index.html` in a modern browser.

Notes:

- Geolocation generally requires HTTPS or `http://localhost`.
- Browser notifications require permission (click the Notifications button in the header).

## Project structure

```
PetFinder/
├─ index.html
└─ assets/
   ├─ css/
   │  └─ styles.css
   ├─ img/
   │  └─ paw.svg
   └─ js/
      └─ app.js
```

## How it works

- Storage: Posts are kept under the `pf_posts` key in `localStorage`. On first load, demo posts are seeded.
- Map: Leaflet renders OpenStreetMap tiles. Posts with latitude/longitude show as markers with popups.
- Filters: UI filters (sidebar) narrow the feed by topic, attributes, user, and dates.
- Nearby filter: Toggle “Only in my area” and set a radius (km). Uses your current coordinates if permission is granted. Sorting by Nearest uses the same center.
- Notifications: Enabling notifications triggers a browser notification when you create a post; otherwise a toast appears.

### Post data model

Each post is a JSON object like:

```json
{
  "id": "uuid",
  "topic": "Lost | Found | Adoption",
  "title": "string",
  "species": "Dog | Cat | Bird | Other",
  "breed": "string",
  "color": "string",
  "size": "Small | Medium | Large",
  "gender": "Male | Female | Unknown",
  "description": "string",
  "photo": "https://...",
  "contact": "string",
  "user": "string",
  "locationQuery": "free‑text location",
  "lat": 40.4168,
  "lng": -3.7038,
  "createdAt": 1730080000000
}
```

## Usage tips

- Creating posts: Use the New post button. For map markers, provide coordinates manually or click “Use my location” to fill lat/lng.
- Filtering by area: Toggle “Only in my area”, set a radius, and optionally click “Use my location” in Filters to center the search.
- Refresh: The Refresh button re‑reads from `localStorage` (useful after manual storage changes).
- Clearing demo data: Clear site data for the origin in your browser or run `localStorage.removeItem('pf_posts')` in DevTools.

## Limitations (demo)

- No backend or authentication; data persists only in your browser.
- The “Location” text fields are not geocoded yet; use coordinates for map placement and distance queries.
- Geolocation may be blocked without HTTPS/localhost.
- Browser notifications depend on user permission and browser support.

## Roadmap

- Real backend (auth, CRUD, image upload)
- Geocoding/Reverse geocoding of addresses
- Realtime updates (WebSocket/Firebase) and subscriptions by area/topic
- Sharing deep links and public post pages
- Accessibility enhancements and i18n

## Credits

- Map: Leaflet ©, Tiles © OpenStreetMap contributors
- Font: Inter (Google Fonts)

## License

For demo and educational purposes only. No license specified.
