import axios from 'axios';
import { useAuthStore } from '../store/authStore';
import type { ApiResponse, LoginResponse, Post, PostCreatePayload, PostStatistics, PostStatus, PostUpdatePayload } from '../types';

export const apiClient = axios.create({
  baseURL: '/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor: Attach JWT token if present
apiClient.interceptors.request.use((config) => {
  const token = useAuthStore.getState().accessToken;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor: Handle 401 with refresh attempt
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
      originalRequest._retry = true;
      try {
        const refreshRes = await axios.post<ApiResponse<LoginResponse>>('/api/auth/refresh', {}, { withCredentials: true });
        if (refreshRes.data.success && refreshRes.data.data?.accessToken) {
          const newToken = refreshRes.data.data.accessToken;
          useAuthStore.getState().setToken(newToken);
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          return apiClient(originalRequest);
        }
      } catch (refreshErr) {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

// Auth APIs
export const authApi = {
  login: async (username: string, password: string) => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/login', { username, password });
    return res.data;
  },
  refresh: async () => {
    const res = await apiClient.post<ApiResponse<LoginResponse>>('/auth/refresh');
    return res.data;
  },
  logout: async () => {
    const res = await apiClient.post<ApiResponse<void>>('/auth/logout');
    return res.data;
  },
  getMe: async () => {
    const res = await apiClient.get<ApiResponse<{ username: string; role: string; createdAt: string }>>('/auth/me');
    return res.data;
  },
};

// Post APIs
export const postApi = {
  getAllPosts: async (keyword?: string, status?: PostStatus) => {
    const params: Record<string, string> = {};
    if (keyword) params.keyword = keyword;
    if (status) params.status = status;
    const res = await apiClient.get<ApiResponse<Post[]>>('/posts', { params });
    return res.data.data;
  },
  getPost: async (id: number) => {
    const res = await apiClient.get<ApiResponse<Post>>(`/posts/${id}`);
    return res.data.data;
  },
  createPost: async (payload: PostCreatePayload) => {
    const res = await apiClient.post<ApiResponse<Post>>('/posts', payload);
    return res.data.data;
  },
  updatePost: async (id: number, payload: PostUpdatePayload) => {
    const res = await apiClient.put<ApiResponse<Post>>(`/posts/${id}`, payload);
    return res.data.data;
  },
  deletePost: async (id: number) => {
    const res = await apiClient.delete<ApiResponse<void>>(`/posts/${id}`);
    return res.data;
  },
  getStatistics: async () => {
    const res = await apiClient.get<ApiResponse<PostStatistics>>('/posts/statistics');
    return res.data.data;
  },
};
