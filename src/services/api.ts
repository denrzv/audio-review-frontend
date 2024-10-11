import axios from 'axios';

const baseURL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

const api = axios.create({
    baseURL,
});

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

export const checkBackendHealth = async () => {
    try {
        const response = await api.get('/actuator/health');
        return response.status === 200;
    } catch (error) {
        console.error(error);
        return false;
    }
};

export default api;