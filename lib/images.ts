const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export function apiOrigin(): string {
  return API_BASE.replace(/\/api\/?$/, "");
}

export function resolveImageUrl(src?: string | null): string {
  if (!src) return "";
  const normalized = src.replace(/\\/g, "/");
  if (/^(https?:)?\/\//.test(normalized)) return normalized;
  if (/^(blob|data):/i.test(normalized)) return normalized;
  return `${apiOrigin()}/${normalized.replace(/^\/+/, "")}`;
}
