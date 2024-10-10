import api from './api';

// Function to upload a file for admin
export const uploadFile = async (file: File): Promise<void> => {
    const formData = new FormData();
    formData.append('file', file);

    try {
        await api.post('/admin/audio/upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

// Function to fetch a random unclassified file for classification
export const fetchRandomFile = async () => {
    try {
        const response = await api.get('/classification/random');
        return response.data;
    } catch (error) {
        console.error('Error fetching random file:', error);
        throw error;
    }
};

// Function to classify a file with a selected category
export const classifyFile = async (fileId: number, category: string): Promise<void> => {
    try {
        await api.post(`/classification/${fileId}`, { category });
    } catch (error) {
        console.error('Error classifying file:', error);
        throw error;
    }
};

export const fetchClassificationHistory = async (page = 0, pageSize = 10) => {
    try {
        const response = await api.get('/classification/history', {
            params: { page, pageSize },
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching classification history:', error);
        throw error;
    }
};

// export const fetchFiles = async (page: number, pageSize: number) => {
//     try {
//         const response = await api.get('/admin/audio', {
//             params: { page, pageSize }
//         });
//         return response.data;
//     } catch (error) {
//         console.error('Error fetching files:', error);
//         throw error;
//     }
// };

export const fetchFiles = async (page: number, pageSize: number, filename: string = '') => {
    try {
        const response = await api.get('/admin/audio', {
            params: { page, pageSize, filename }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching files:', error);
        throw error;
    }
};

export const deleteFile = async (id: number): Promise<void> => {
    try {
        await api.delete(`/admin/audio/${id}`);
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

interface UpdatedFileData {
    currentCategory?: string;
    filename?: string;
}

export const updateFile = async (id: number, updatedFile: UpdatedFileData): Promise<void> => {
    try {
        const response = await api.put(`/admin/audio/${id}`, updatedFile);
        return response.data;
    } catch (error) {
        console.error('Error updating file:', error);
        throw error;
    }
};

export const fetchDashboardStats = async () => {
    const response = await api.get('/admin/audio/stats');
    return response.data;
};

export const deleteAllFiles = async (): Promise<void> => {
    try {
        await api.delete('/admin/audio');
    } catch (error) {
        console.error('Error deleting all files:', error);
        throw error;
    }
};

export const deleteMultipleFiles = async (fileIds: number[]): Promise<void> => {
    try {
        await api.delete('/admin/audio/multiple', {
            data: { ids: fileIds },
        });
    } catch (error) {
        console.error('Error deleting multiple files:', error);
        throw error;
    }
};

export const updateMultipleFiles = async (fileIds: number[], currentCategory: string): Promise<void> => {
    try {
        await api.put('/admin/audio/multiple', {
            ids: fileIds,
            currentCategory,
        });
    } catch (error) {
        console.error('Error updating multiple files:', error);
        throw error;
    }
};