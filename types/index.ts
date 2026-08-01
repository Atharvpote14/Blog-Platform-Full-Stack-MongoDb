export type Role = "user" | "admin";

export interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string;
  role: Role;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  text: string;
  author: User | string;
  blog: string;
  createdAt: string;
  updatedAt: string;
}

export type Visibility = "public" | "private";

export interface Blog {
  _id: string;
  title: string;
  content: string;
  category: string;
  visibility: Visibility;
  coverImage: string;
  author: User | string;
  likes: string[];
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

export interface BlogListResponse {
  success: boolean;
  count: number;
  total: number;
  totalPages: number;
  currentPage: number;
  data: Blog[];
}

export interface LikeResponse {
  likes: number;
  isLiked: boolean;
}

export interface GetBlogsParams {
  search?: string;
  category?: string;
  sort?: "latest" | "oldest" | "popular";
  page?: number;
  limit?: number;
  author?: string;
  visibility?: Visibility;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ProfilePayload {
  name?: string;
  email?: string;
}
