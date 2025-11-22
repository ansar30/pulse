import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LoginRequest, RegisterRequest, LoginResponse, ApiResponse } from '@business-app/types';
import Constants from 'expo-constants';

// Get API URL from environment variables with proper fallback
const getApiUrl = () => {
    // Try Expo Constants first (works in all Expo environments)
    const expoApiUrl = Constants.expoConfig?.extra?.apiUrl;
    if (expoApiUrl) {
        console.log('[API Client] Using API URL from Expo config:', expoApiUrl);
        return expoApiUrl;
    }

    // Fallback to process.env for web platform
    if (typeof process !== 'undefined' && process.env?.EXPO_PUBLIC_API_URL) {
        console.log('[API Client] Using API URL from process.env:', process.env.EXPO_PUBLIC_API_URL);
        return process.env.EXPO_PUBLIC_API_URL;
    }

    // Default fallback
    const defaultUrl = 'http://localhost:3001';
    console.log('[API Client] Using default API URL:', defaultUrl);
    return defaultUrl;
};

const API_URL = getApiUrl();

const apiClient = axios.create({
    baseURL: `${API_URL}/api/v1`,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
    async (config) => {
        try {
            const authData = await AsyncStorage.getItem('auth-storage');
            if (authData) {
                const { state } = JSON.parse(authData);
                if (state?.accessToken) {
                    config.headers.Authorization = `Bearer ${state.accessToken}`;
                }
            }
        } catch (error) {
            console.error('Failed to retrieve auth token:', error);
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
    (response) => response,
    async (error) => {
        if (error.response?.status === 401) {
            // Clear tokens
            await AsyncStorage.removeItem('auth-storage');
        }
        return Promise.reject(error);
    }
);

export const authApi = {
    register: async (data: RegisterRequest) => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/register', data);
        return response.data;
    },

    login: async (data: LoginRequest) => {
        const response = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', data);
        return response.data;
    },
};

export const projectsApi = {
    getAll: async (tenantId: string) => {
        const response = await apiClient.get(`/tenants/${tenantId}/projects`);
        return response.data;
    },

    getOne: async (tenantId: string, projectId: string) => {
        const response = await apiClient.get(`/tenants/${tenantId}/projects/${projectId}`);
        return response.data;
    },

    create: async (tenantId: string, data: any) => {
        const response = await apiClient.post(`/tenants/${tenantId}/projects`, data);
        return response.data;
    },

    update: async (tenantId: string, projectId: string, data: any) => {
        const response = await apiClient.patch(`/tenants/${tenantId}/projects/${projectId}`, data);
        return response.data;
    },

    delete: async (tenantId: string, projectId: string) => {
        const response = await apiClient.delete(`/tenants/${tenantId}/projects/${projectId}`);
        return response.data;
    },
};

export const usersApi = {
    getAll: async (tenantId: string) => {
        const response = await apiClient.get(`/tenants/${tenantId}/users`);
        return response.data;
    },

    getOne: async (tenantId: string, userId: string) => {
        const response = await apiClient.get(`/tenants/${tenantId}/users/${userId}`);
        return response.data;
    },

    update: async (tenantId: string, userId: string, data: any) => {
        const response = await apiClient.patch(`/tenants/${tenantId}/users/${userId}`, data);
        return response.data;
    },

    changePassword: async (tenantId: string, userId: string, currentPassword: string, newPassword: string) => {
        const response = await apiClient.patch(`/tenants/${tenantId}/users/${userId}`, {
            currentPassword,
            password: newPassword,
        });
        return response.data;
    },

    uploadProfileImage: async (tenantId: string, userId: string, avatarBase64: string) => {
        const response = await apiClient.post(`/tenants/${tenantId}/users/${userId}/avatar`, {
            avatar: avatarBase64,
        });
        return response.data;
    },

    removeProfileImage: async (tenantId: string, userId: string) => {
        const response = await apiClient.delete(`/tenants/${tenantId}/users/${userId}/avatar`);
        return response.data;
    },

    delete: async (tenantId: string, userId: string) => {
        const response = await apiClient.delete(`/tenants/${tenantId}/users/${userId}`);
        return response.data;
    },
};

export const chatApi = {
    // Channels
    getChannels: async (tenantId: string) => {
        const response = await apiClient.get(`/tenants/${tenantId}/chat/channels`);
        return response.data;
    },

    getDirectMessages: async (tenantId: string) => {
        const response = await apiClient.get(`/tenants/${tenantId}/chat/direct-messages`);
        return response.data;
    },

    createChannel: async (tenantId: string, data: { name: string; description?: string; type?: string }) => {
        const response = await apiClient.post(`/tenants/${tenantId}/chat/channels`, data);
        return response.data;
    },

    getChannel: async (tenantId: string, channelId: string) => {
        const response = await apiClient.get(`/tenants/${tenantId}/chat/channels/${channelId}`);
        return response.data;
    },

    // Messages
    getMessages: async (tenantId: string, channelId: string, limit?: number, before?: string) => {
        const params = new URLSearchParams();
        if (limit) params.append('limit', limit.toString());
        if (before) params.append('before', before);
        const response = await apiClient.get(
            `/tenants/${tenantId}/chat/channels/${channelId}/messages?${params.toString()}`
        );
        return response.data;
    },

    sendMessage: async (tenantId: string, channelId: string, data: { content: string; type?: string }) => {
        const response = await apiClient.post(`/tenants/${tenantId}/chat/channels/${channelId}/messages`, data);
        return response.data;
    },

    markAsRead: async (tenantId: string, channelId: string) => {
        const response = await apiClient.patch(`/tenants/${tenantId}/chat/channels/${channelId}/read`, {});
        return response.data;
    },

    deleteMessage: async (tenantId: string, messageId: string) => {
        const response = await apiClient.delete(`/tenants/${tenantId}/chat/messages/${messageId}`);
        return response.data;
    },

    // Channel membership
    joinChannel: async (tenantId: string, channelId: string) => {
        const response = await apiClient.post(`/tenants/${tenantId}/chat/channels/${channelId}/join`);
        return response.data;
    },

    leaveChannel: async (tenantId: string, channelId: string) => {
        const response = await apiClient.post(`/tenants/${tenantId}/chat/channels/${channelId}/leave`);
        return response.data;
    },

    getAvailableChannels: async (tenantId: string) => {
        const response = await apiClient.get(`/tenants/${tenantId}/chat/channels/available`);
        return response.data;
    },

    addChannelMembers: async (tenantId: string, channelId: string, userIds: string[]) => {
        const response = await apiClient.post(`/tenants/${tenantId}/chat/channels/${channelId}/members`, { userIds });
        return response.data;
    },

    removeChannelMember: async (tenantId: string, channelId: string, userId: string) => {
        const response = await apiClient.delete(`/tenants/${tenantId}/chat/channels/${channelId}/members/${userId}`);
        return response.data;
    },

    deleteChannel: async (tenantId: string, channelId: string) => {
        const response = await apiClient.delete(`/tenants/${tenantId}/chat/channels/${channelId}`);
        return response.data;
    },
};

export const adminApi = {
    // Super Admin - Tenants
    getAllTenants: async () => {
        const response = await apiClient.get('/admin/tenants');
        return response.data;
    },

    // Super Admin - Create Tenant
    createTenant: async (data: { name: string; planId?: string; status?: string }) => {
        const response = await apiClient.post('/admin/tenants', data);
        return response.data;
    },

    // Super Admin - Update Tenant
    updateTenant: async (tenantId: string, data: any) => {
        const response = await apiClient.patch(`/admin/tenants/${tenantId}`, data);
        return response.data;
    },

    // Super Admin - Delete Tenant
    deleteTenant: async (tenantId: string) => {
        const response = await apiClient.delete(`/admin/tenants/${tenantId}`);
        return response.data;
    },

    // Super Admin - All Users
    getAllUsers: async () => {
        const response = await apiClient.get('/admin/users');
        return response.data;
    },

    // Super Admin - Create User
    createUser: async (data: {
        email: string;
        password: string;
        firstName: string;
        lastName: string;
        role: string;
        tenantId: string;
    }) => {
        const response = await apiClient.post('/admin/users', data);
        return response.data;
    },

    // Super Admin - Update User
    updateUser: async (userId: string, data: any) => {
        const response = await apiClient.patch(`/admin/users/${userId}`, data);
        return response.data;
    },

    // Admin - Update Role
    updateUserRole: async (userId: string, role: string) => {
        const response = await apiClient.patch(`/admin/users/${userId}/role`, { role });
        return response.data;
    },

    // Super Admin - Delete User
    deleteUser: async (userId: string) => {
        const response = await apiClient.delete(`/admin/users/${userId}`);
        return response.data;
    },

    // Super Admin - Reset User Password
    resetUserPassword: async (userId: string, password: string) => {
        const response = await apiClient.patch(`/admin/users/${userId}`, { password });
        return response.data;
    },

    // Super Admin - Analytics
    getAnalytics: async () => {
        const response = await apiClient.get('/admin/analytics');
        return response.data;
    },

    // Create DM
    createDirectMessage: async (tenantId: string, recipientId: string) => {
        const response = await apiClient.post(`/tenants/${tenantId}/chat/direct-messages`, { recipientId });
        return response.data;
    },
};

export default apiClient;

