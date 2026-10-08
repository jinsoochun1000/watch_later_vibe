import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';
import type { WatchLaterItem, WatchLaterCreateInput, WatchLaterUpdateInput, LoginResponse, AuthUser } from '../types';

export const apiClient = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().token;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const api = {
  // Auth
  login: async (loginId: string, userPw: string): Promise<LoginResponse> => {
    const res = await apiClient.post<LoginResponse>('/auth/login', { loginId, userPw });
    return res.data;
  },

  getCurrentUser: async (): Promise<AuthUser> => {
    const res = await apiClient.get<AuthUser>('/auth/me');
    return res.data;
  },

  // WatchLater
  getPosts: async (): Promise<WatchLaterItem[]> => {
    const res = await apiClient.get<WatchLaterItem[]>('/watchlater');
    return res.data;
  },

  getPost: async (id: number): Promise<WatchLaterItem> => {
    const res = await apiClient.get<WatchLaterItem>(`/watchlater/${id}`);
    return res.data;
  },

  createPost: async (data: WatchLaterCreateInput): Promise<WatchLaterItem> => {
    const res = await apiClient.post<WatchLaterItem>('/watchlater', data);
    return res.data;
  },

  updatePost: async (id: number, data: WatchLaterUpdateInput): Promise<WatchLaterItem> => {
    const res = await apiClient.put<WatchLaterItem>(`/watchlater/${id}`, data);
    return res.data;
  },

  toggleStatus: async (id: number): Promise<WatchLaterItem> => {
    const res = await apiClient.patch<WatchLaterItem>(`/watchlater/${id}/toggle-status`);
    return res.data;
  },

  deletePost: async (id: number): Promise<{ success: boolean; message: string }> => {
    const res = await apiClient.delete<{ success: boolean; message: string }>(`/watchlater/${id}`);
    return res.data;
  },
};
