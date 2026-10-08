export interface WatchLaterItem {
  postId: number;
  title: string;
  videoUrl: string;
  content: string;
  viewCnt: number;
  regUserId: number;
  authorName: string;
  authorLoginId: string;
  watchYn: 'N' | 'Y';
  delYn: 'N' | 'Y';
  regDt: string;
  uptDt: string;
  youtubeVideoId: string | null;
}

export interface WatchLaterCreateInput {
  title: string;
  videoUrl: string;
  content: string;
  watchYn: 'N' | 'Y';
}

export interface WatchLaterUpdateInput {
  title: string;
  videoUrl: string;
  content: string;
  watchYn: 'N' | 'Y';
}

export interface AuthUser {
  userId: number;
  loginId: string;
  userNm: string;
}

export interface LoginResponse {
  accessToken: string;
  tokenType: string;
  userId: number;
  loginId: string;
  userNm: string;
}
