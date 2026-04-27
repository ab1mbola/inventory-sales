import axios from 'axios';

// Dynamically use the current hostname (localhost or IP address)
// to ensure mobile devices on the same network can reach the backend.
// On Vercel, we use the route prefix defined in vercel.json
const API_URL = import.meta.env.DEV 
  ? `http://${window.location.hostname}:3001/api`
  : '/_/backend/api';

export const api = axios.create({
  baseURL: API_URL,
});
