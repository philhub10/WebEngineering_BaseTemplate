// Origin of the API, set at build time via "define" in angular.json:
// '' (default) means same origin, behind the dev proxy or nginx;
// 'http://localhost:3000' (cross-origin build) calls the API directly,
// so the browser applies CORS.
declare const API_BASE_URL: string;

export function apiUrl(path: string): string {
  return `${API_BASE_URL}${path}`;
}

// For requests that need the session cookie. 'include' also sends it in the
// cross-origin build (same-origin is the fetch default).
export const withCookie = { credentials: 'include' } as const;
