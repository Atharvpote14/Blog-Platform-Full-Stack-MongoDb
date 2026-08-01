import { API_BASE_URL } from "@/services/api";

export function apiOrigin(): string {
  return (API_BASE_URL ?? "").replace(/\/api\/?$/, "");
}

export function resolveImageUrl(src?: string | null): string {
  if (!src) return "";
  const normalized = src.replace(/\\/g, "/");
  if (/^(https?:)?\/\//.test(normalized)) return normalized;
  if (/^(blob|data):/i.test(normalized)) return normalized;
  const origin = apiOrigin();
  if (!origin) return normalized;
  return `${origin}/${normalized.replace(/^\/+/, "")}`;
}
