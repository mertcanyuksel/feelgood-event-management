import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || '/api';

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Redirect to login if unauthorized
      window.location.href = '/';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (username, password) =>
    api.post('/auth/login', { username, password }),

  logout: () =>
    api.post('/auth/logout'),

  checkAuth: () =>
    api.get('/auth/check')
};

// Events API
export const eventsAPI = {
  getEvents: () =>
    api.get('/events'), // No pagination - returns ALL data

  getEventById: (id) =>
    api.get(`/events/${id}`),

  createEvent: (data) =>
    api.post('/events', data),

  updateEvent: (id, data) =>
    api.put(`/events/${id}`, data)
};

// Reference data API (for dropdowns)
export const referenceAPI = {
  getBudgets: () =>
    api.get('/budgets'),

  getSalutations: () =>
    api.get('/salutations'),

  getBusinessCards: () =>
    api.get('/businesscards')
};

export default api;
