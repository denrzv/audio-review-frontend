import api from './api';

export const login = async (username: string, password: string) => {
    const response = await api.post('/auth/login', { username, password });
    return response.data; // Return the entire response containing both token and authorities
};

export const register = async (username: string, password: string) => {
    return api.post('/auth/register', { username, password });
};

export const registerUser = async (username: string, password: string) => {
    await api.post('/auth/register', { username, password });
};