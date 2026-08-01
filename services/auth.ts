import { api } from "./api";
import type { ApiResponse, LoginPayload, RegisterPayload, User } from "@/types";

export const authApi = {
  async register(payload: RegisterPayload): Promise<User> {
    const res = await api.post<ApiResponse<User>>("/auth/register", payload);
    return res.data.data;
  },

  async login(payload: LoginPayload): Promise<User> {
    const res = await api.post<ApiResponse<User>>("/auth/login", payload);
    return res.data.data;
  },

  async logout(): Promise<void> {
    await api.post<ApiResponse<null>>("/auth/logout");
  },

  async me(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/auth/me");
    return res.data.data;
  },
};
