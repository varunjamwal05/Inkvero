import axios from 'axios';

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1',
    withCredentials: true, // Send cookies
    headers: {
        'Content-Type': 'application/json',
    },
});

// Response interceptor for token refresh
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // specific error code from backend
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            (error.response.data?.code === 'AUTH_TOKEN_EXPIRED' || error.response.data?.message === 'Not authorized to access this route')
        ) {
            originalRequest._retry = true;

            try {
                const { data } = await api.get('/auth/refresh');
                const newAccessToken = data.accessToken;

                // Update header
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh failed (token expired/revoked) logic e.g. logout
                return Promise.reject(refreshError);
            }
        }
        return Promise.reject(error);
    }
);

export default api;
