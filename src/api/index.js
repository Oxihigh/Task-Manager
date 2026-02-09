import axios from 'axios';

const api = axios.create({
    baseURL: 'http://localhost:3000',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor to inject User-Id
api.interceptors.request.use((config) => {
    const userId = localStorage.getItem('userId');
    if (userId) {
        config.headers['User-Id'] = userId;
    }
    return config;
});

export const taskApi = {
    // Tasks
    getTasks: async () => {
        const response = await api.get('/tasks?_sort=createdAt&_order=desc');
        return response.data;
    },
    getTask: async (id) => {
        const response = await api.get(`/tasks/${id}`);
        return response.data;
    },
    createTask: async (data) => {
        const response = await api.post('/tasks', data);
        return response.data;
    },
    updateTask: async (id, patch) => {
        const response = await api.patch(`/tasks/${id}`, patch);
        return response.data;
    },
    deleteTask: async (id) => {
        await api.delete(`/tasks/${id}`);
    },

    // Bulk
    bulkOperation: async (payload) => {
        const response = await api.post('/bulk', payload);
        return response.data;
    },

    // Comments
    addComment: async (taskId, text, parentId = null) => {
        const payload = { text };
        if (parentId) payload.parentId = parentId;
        const response = await api.post(`/tasks/${taskId}/comments`, payload);
        return response.data;
    },

    // Dashboard
    getDashboard: async () => {
        const response = await api.get('/dashboard');
        return response.data;
    },

    // Auth
    login: async (userId) => {
        const response = await api.post('/login', { userId });
        return response.data;
    },

    // Utils
    getUsers: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    createUser: async (user) => {
        const response = await api.post('/users', user);
        return response.data;
    }
};
