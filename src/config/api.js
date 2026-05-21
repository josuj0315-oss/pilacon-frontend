const rawApiBaseUrl = import.meta.env.VITE_API_BASE_URL;

export const API_BASE_URL = rawApiBaseUrl ? String(rawApiBaseUrl).trim().replace(/\/$/, "") : "";

if (!API_BASE_URL) {
  throw new Error("VITE_API_BASE_URL is required");
}
