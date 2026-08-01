import axios from "axios";

export function formatDate(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

export function readingTime(content: string): string {
  const wordsPerMinute = 200;
  const words = content.trim().split(/\s+/).length;
  const minutes = Math.max(1, Math.ceil(words / wordsPerMinute));
  return `${minutes} min read`;
}

export function formatCount(count: number): string {
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function getInitials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { message?: string; errors?: { message?: string }[] }
      | undefined;

    if (data?.errors?.length) {
      return data.errors
        .map((e) => e.message)
        .filter(Boolean)
        .join(". ");
    }
    if (data?.message) return data.message;
    if (error.code === "ECONNABORTED") {
      return "Request timed out. Please try again.";
    }
    if (!error.response) {
      return "Cannot reach the server. Please check your connection and try again.";
    }
    switch (error.response.status) {
      case 401:
        return "Your session has expired. Please log in again.";
      case 403:
        return "You don't have permission to do that.";
      case 404:
        return "The requested resource was not found.";
      case 429:
        return "Too many requests. Please try again later.";
      case 500:
        return "Something went wrong on our server. Please try again.";
      default:
        return "Something went wrong. Please try again.";
    }
  }
  return "Unexpected error occurred.";
}
