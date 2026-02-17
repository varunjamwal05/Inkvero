import axios from "axios";

const API = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "https://inkvero-2.onrender.com/api/v1", // Fallback for safety, but env var is preferred
    withCredentials: true
});

export default API;
