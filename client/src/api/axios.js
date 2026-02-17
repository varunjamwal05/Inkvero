import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://inkvero-2.onrender.com/api/v1", // Fallback for safety, but env var is preferred
    withCredentials: true
});

API.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
}, (error) => {
    return Promise.reject(error);
});

export default API;
