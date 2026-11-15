// lib/api.ts — single fetch wrapper for the OneWater API.
// Throws ApiError with a customer-readable message for any non-2xx response.

export const API_URL = import.meta.env.VITE_API_URL || '';

export class ApiError extends Error {
  status: number;
  code?: string;
  fieldErrors: Record<string, string>;
  constructor(status: number, message: string, code?: string, fieldErrors: Record<string, string> = {}) {
    super(message);
    this.status = status;
    this.code = code;
    this.fieldErrors = fieldErrors;
  }
}

const NETWORK_MESSAGE = "We couldn't reach our server. Please check your connection and try again, or WhatsApp us.";

export async function api<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  const { json, headers, ...rest } = init;
  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, {
      ...rest,
      headers: { ...(json !== undefined ? { 'Content-Type': 'application/json' } : {}), ...headers },
      body: json !== undefined ? JSON.stringify(json) : rest.body,
    });
  } catch {
    throw new ApiError(0, NETWORK_MESSAGE, 'NetworkError');
  }
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const fieldErrors: Record<string, string> = {};
    for (const e of data?.errors ?? []) if (e.field && !fieldErrors[e.field]) fieldErrors[e.field] = e.message;
    const first = Object.values(fieldErrors)[0];
    throw new ApiError(res.status, data?.message || first || 'Something went wrong. Please try again.', data?.error, fieldErrors);
  }
  return data as T;
}

// ── Admin ────────────────────────────────────────────────────────────────
const TOKEN_KEY = 'ow_admin_token';
export const adminToken = {
  get: () => sessionStorage.getItem(TOKEN_KEY),
  set: (t: string) => sessionStorage.setItem(TOKEN_KEY, t),
  clear: () => { sessionStorage.removeItem(TOKEN_KEY); localStorage.removeItem(TOKEN_KEY); localStorage.removeItem('ow_admin_user'); },
};

/** Fired when any admin call returns 401 so the shell can show the login screen. */
export const ADMIN_LOGOUT_EVENT = 'ow-admin-logout';

export async function adminApi<T = unknown>(path: string, init: RequestInit & { json?: unknown } = {}): Promise<T> {
  try {
    return await api<T>(`/api/admin${path}`, {
      ...init,
      headers: { ...init.headers, Authorization: `Bearer ${adminToken.get() ?? ''}` },
    });
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      adminToken.clear();
      window.dispatchEvent(new Event(ADMIN_LOGOUT_EVENT));
    }
    throw err;
  }
}
