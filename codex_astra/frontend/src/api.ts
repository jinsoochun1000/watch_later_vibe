import axios from 'axios';
import { create } from 'zustand';

export type Post = { id: number; title: string; videoUrl: string; videoId: string; content: string; status: 'NEW' | 'DONE'; author: string; createdAt: string; updatedAt: string; version: number };
export type PostInput = Pick<Post, 'title' | 'videoUrl' | 'content' | 'status'> & { version?: number };
type Session = { accessToken: string; username: string };
export const useAuth = create<{ session: Session | null; ready: boolean; set: (session: Session | null) => void }>((set) => ({
  session: null, ready: false, set: (session) => set({ session, ready: true }),
}));
export const api = axios.create({ baseURL: '/api', withCredentials: true, headers: { 'X-Requested-With': 'XMLHttpRequest' } });
let refreshPromise: Promise<Session | null> | null = null;
export function refresh() {
  if (!refreshPromise) refreshPromise = api.post<Session>('/auth/refresh').then(({ data }) => { useAuth.getState().set(data); return data; })
    .catch(() => { useAuth.getState().set(null); return null; }).finally(() => { refreshPromise = null; });
  return refreshPromise;
}
api.interceptors.request.use((config) => {
  const token = useAuth.getState().session?.accessToken;
  if (token && !config.url?.startsWith('/auth/')) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, async (error) => {
  const config = error.config;
  if (error.response?.status === 401 && config && !config.url?.startsWith('/auth/') && !config.retried) {
    config.retried = true;
    if (await refresh()) return api(config);
  }
  return Promise.reject(error);
});
export async function login(username: string, password: string) {
  const { data } = await api.post<Session>('/auth/login', { username, password }); useAuth.getState().set(data);
}
export async function logout() { await api.post('/auth/logout'); useAuth.getState().set(null); }
export function errorMessage(error: unknown) {
  return axios.isAxiosError(error) ? error.response?.data?.message || '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.' : '요청을 처리하지 못했습니다.';
}
