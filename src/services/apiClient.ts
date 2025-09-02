// apiClient.ts
import axios from 'axios';
// import { getAuthToken } from './auth'; // Your function to get the stored token
import { baseURL } from '../helpers/constants';
import { useAuth } from '../Context/AuthContext';
import { getAuthToken } from '../helpers/helpers';

const apiClient = axios.create({
  baseURL: `${baseURL}/api`, // Replace with your API base URL
  timeout: 10000, // 10 seconds
});



// Add request interceptor for automatic token insertion
apiClient.interceptors.request.use(
  async (config) => {
    const token = await getAuthToken();
    console.log(token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle global errors here (e.g., token expiration)
    if (error.response?.status === 401) {
      // Handle unauthorized error (e.g., redirect to login)
    }
    return Promise.reject(error);
  }
);

export default apiClient;