import api from './api';

export const fetchCategories = async () => {
    const response = await api.get('/admin/categories');
    return response.data;
};

export const addCategory = async (category: { name: string; shortcut: string }) => {
    await api.post('/admin/categories', category);
};

export const editCategory = async (id: number, category: { name: string; shortcut: string }) => {
    await api.put(`/admin/categories/${id}`, category);
};

export const deleteCategory = async (id: number) => {
    await api.delete(`/admin/categories/${id}`);
};
