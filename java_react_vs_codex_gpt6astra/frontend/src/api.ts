import axios, { AxiosError } from 'axios';
import { useAuth } from './auth';
import type { Post, PostInput } from './types';

const authApi = axios.create({ baseURL: '/api/auth', withCredentials: true, headers: { 'X-Watchlater-Client': '1' }, timeout: 10000 });
export const api = axios.create({ baseURL: '/api', withCredentials: true, timeout: 15000 });
interface Session { accessToken: string; username: string }
let refreshing: Promise<void> | null = null;
export function restoreSession() {
  if (!refreshing) {
    refreshing = authApi.post<Session>('/refresh').then(({ data }) => {
      useAuth.getState().setSession(data.accessToken, data.username);
    }).catch((error: unknown) => { useAuth.getState().clear(); throw error; }).finally(() => { refreshing = null; });
  }
  return refreshing;
}
api.interceptors.request.use((config) => {
  const token = useAuth.getState().accessToken;
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});
api.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const original = error.config as (NonNullable<typeof error.config> & { retried?: boolean }) | undefined;
  if (error.response?.status === 401 && original && !original.retried && useAuth.getState().accessToken) {
    original.retried = true;
    await restoreSession();
    return api(original);
  }
  return Promise.reject(error);
});
export async function login(username: string, password: string) {
  const { data } = await authApi.post<Session>('/login', { username, password });
  useAuth.getState().setSession(data.accessToken, data.username);
}
export async function logout() {
  await authApi.post('/logout');
  useAuth.getState().clear();
}
export const postsApi = {
  list: async () => (await api.get<Post[]>('/posts')).data,
  create: async (input: PostInput) => (await api.post<Post>('/posts', input)).data,
  update: async (id: number, input: PostInput) => (await api.put<Post>(`/posts/${id}`, input)).data,
  delete: async (id: number) => { await api.delete(`/posts/${id}`); },
};
export function errorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    if (error.response?.data?.message) return String(error.response.data.message);
    if (error.response?.status === 401) return '로그인이 필요합니다. 다시 로그인해 주세요.';
    if (error.response?.status === 403) return '요청 권한 또는 서버 접속 주소를 확인해 주세요.';
    if (error.response?.status === 404) return '게시물이 삭제되었거나 존재하지 않습니다.';
  }
  return '서버에 연결할 수 없습니다. 잠시 후 다시 시도해 주세요.';
}
