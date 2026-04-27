import axios from 'axios';

// Dynamically use the current hostname (localhost or IP address)
// to ensure mobile devices on the same network can reach the backend.
const API_URL = `http://${window.location.hostname}:3001/api`;

export const api = axios.create({
  baseURL: API_URL,
});
