/**
 * api.js — Fetch Wrapper with SAML Session Auth
 * Uses credentials: 'include' for cookie-based sessions (NOT JWT).
 */

const BASE_URL = '/api';

/**
 * Custom API error class
 */
export class ApiError extends Error {
  constructor(status, body) {
    super(body?.message || body?.error || `HTTP ${status}`);
    this.status = status;
    this.body = body;
  }
}

/**
 * Core request function.
 * @param {string} endpoint
 * @param {RequestInit} options
 * @returns {Promise<any>}
 */
async function request(endpoint, options = {}) {
  const { signal, ...restOptions } = options;

  const config = {
    credentials: 'include', // Cookie-based session auth (SAML 2.0)
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    signal,
    ...restOptions,
  };

  // Remove Content-Type for FormData
  if (options.body instanceof FormData) {
    delete config.headers['Content-Type'];
  }

  const res = await fetch(`${BASE_URL}${endpoint}`, config);

  // Handle auth redirect
  if (res.status === 401) {
    window.location.href = `${BASE_URL}/auth/saml/login`;
    throw new ApiError(401, { error: 'Unauthorized' });
  }

  // Parse response
  if (!res.ok) {
    let body;
    try {
      body = await res.json();
    } catch {
      body = { error: `HTTP ${res.status}` };
    }
    throw new ApiError(res.status, body);
  }

  // 204 No Content
  if (res.status === 204) return null;

  return res.json();
}

/**
 * API client with convenience methods.
 */
export const api = {
  get: (url, options) => request(url, { method: 'GET', ...options }),

  post: (url, data, options) =>
    request(url, { method: 'POST', body: JSON.stringify(data), ...options }),

  put: (url, data, options) =>
    request(url, { method: 'PUT', body: JSON.stringify(data), ...options }),

  patch: (url, data, options) =>
    request(url, { method: 'PATCH', body: JSON.stringify(data), ...options }),

  delete: (url, options) => request(url, { method: 'DELETE', ...options }),
};
