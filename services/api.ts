import axios from "axios";
import type { AxiosError } from "axios";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const SESSION_EXPIRED_EVENT = "blogsphere:session-expired";

const AUTH_PROBE_PATHS = [
  "/auth/login",
  "/auth/register",
  "/auth/me",
  "/auth/logout",
];

let redirectingToLogin = false;

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 20000,
});

api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      const url = error.config?.url ?? "";
      const isAuthProbe = AUTH_PROBE_PATHS.some((path) => url.includes(path));
      if (!isAuthProbe && !redirectingToLogin) {
        redirectingToLogin = true;
        window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
        setTimeout(() => {
          redirectingToLogin = false;
        }, 4000);
      }
    }
    return Promise.reject(error);
  }
);

export default api;
