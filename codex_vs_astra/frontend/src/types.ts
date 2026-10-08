export type PostStatus = 'NEW' | 'DONE';
export interface Post {
  id: number; title: string; videoUrl: string; content: string | null;
  status: PostStatus; author: string; createdAt: string; updatedAt: string; version: number;
}
export interface PostInput { title: string; videoUrl: string; content: string; status: PostStatus; version?: number }
