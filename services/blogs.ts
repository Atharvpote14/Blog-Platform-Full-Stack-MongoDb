import { api } from "./api";
import type {
  ApiResponse,
  Blog,
  BlogListResponse,
  Comment,
  GetBlogsParams,
  LikeResponse,
} from "@/types";

export const blogsApi = {
  async getBlogs(params: GetBlogsParams = {}): Promise<BlogListResponse> {
    const res = await api.get<BlogListResponse>("/blogs", { params });
    return res.data;
  },

  async getBlog(id: string): Promise<Blog> {
    const res = await api.get<ApiResponse<Blog>>(`/blogs/${id}`);
    return res.data.data;
  },

  async createBlog(formData: FormData): Promise<Blog> {
    const res = await api.post<ApiResponse<Blog>>("/blogs", formData);
    return res.data.data;
  },

  async updateBlog(id: string, formData: FormData): Promise<Blog> {
    const res = await api.put<ApiResponse<Blog>>(`/blogs/${id}`, formData);
    return res.data.data;
  },

  async deleteBlog(id: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/blogs/${id}`);
  },

  async toggleLike(id: string): Promise<LikeResponse> {
    const res = await api.post<ApiResponse<LikeResponse>>(`/blogs/${id}/like`);
    return res.data.data;
  },

  async addComment(id: string, text: string): Promise<Comment> {
    const res = await api.post<ApiResponse<Comment>>(`/blogs/${id}/comments`, {
      text,
    });
    return res.data.data;
  },

  async deleteComment(id: string): Promise<void> {
    await api.delete<ApiResponse<null>>(`/comments/${id}`);
  },

  async getMyBlogs(userId: string, limit = 100): Promise<Blog[]> {
    const pages = Math.ceil(limit / 50);
    const collected: Blog[] = [];
    for (let page = 1; page <= pages; page++) {
      const res = await this.getBlogs({ page, limit: 50, sort: "latest" });
      collected.push(
        ...res.data.filter(
          (blog) =>
            (typeof blog.author === "string" ? blog.author : blog.author._id) ===
            userId
        )
      );
    }
    return collected.slice(0, limit);
  },
};
