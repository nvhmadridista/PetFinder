import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a request interceptor to add the auth token to headers
api.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    });

export const authService = {
  login: (email, password) => api.post('/auth/login', {email, password}),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
};

export const postService = {
  getAllPosts: (params) => api.get('/posts', {params}),
  getPostById: (id) => api.get(`/posts/${id}`),
  createPost: (postData) => {
    // If postData contains files, we need to use multipart/form-data
    // But for now assuming JSON or handling it in component
    return api.post('/posts', postData);
  },
  updatePost: (id, postData) => api.put(`/posts/${id}`, postData),
  deletePost: (id) => api.delete(`/posts/${id}`),
};

export const petService = {
  getPetByPostId: (postId) => api.get(`/pets/post/${postId}`),
};

export default api;
