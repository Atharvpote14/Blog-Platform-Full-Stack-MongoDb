import { api } from "./api";
import type { ApiResponse, ProfilePayload, User } from "@/types";

export const usersApi = {
  async getProfile(): Promise<User> {
    const res = await api.get<ApiResponse<User>>("/users/profile");
    return res.data.data;
  },

  async updateProfile(payload: ProfilePayload | FormData): Promise<User> {
    const res = await api.put<ApiResponse<User>>("/users/profile", payload);
    return res.data.data;
  },

  async deleteProfile(): Promise<void> {
    await api.delete<ApiResponse<null>>("/users/profile");
  },
};
