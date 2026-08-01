const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000/api";

export function apiOrigin(): string {
  return API_BASE.replace(/\/api\/?$/, "");
}

export function resolveImageUrl(src?: string | null): string {
  if (!src) return "";
  if (/^(https?:)?\/\//.test(src)) return src;
  return `${apiOrigin()}/${src.replace(/^\/+/, "")}`;
}
