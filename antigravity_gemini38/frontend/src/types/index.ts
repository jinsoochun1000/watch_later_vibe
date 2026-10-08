export type PostStatus = 'NEW' | 'COMPLETED';

export interface User {
  username: string;
  role: string;
  createdAt?: string;
}

export interface Post {
  id: number;
  title: string;
  videoUrl: string;
  content: string;
  status: PostStatus;
  statusDescription: string;
  author: string;
  youtubeVideoId?: string;
  thumbnailUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PostCreatePayload {
  title: string;
  videoUrl: string;
  content?: string;
  status: PostStatus;
}

export interface PostUpdatePayload {
  title: string;
  videoUrl: string;
  content?: string;
  status: PostStatus;
}

export interface PostStatistics {
  totalCount: number;
  newCount: number;
  completedCount: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  username: string;
  role: string;
}
