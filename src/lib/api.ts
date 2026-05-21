export const API_BASE_URL = "";

export function apiUrl(path: string): string {
  const normalised = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${normalised}`;
}
