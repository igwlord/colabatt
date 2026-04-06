/**
 * mock-api.js — Fetch interceptor for development
 * Intercepts /api/* requests and returns mock data with simulated latency.
 * ┌─────────────────────────────────────────────────┐
 * │  DEV ONLY — Remove this module for production.  │
 * └─────────────────────────────────────────────────┘
 */

const originalFetch = window.fetch;
const MOCK_DELAY = 300;

const handlers = [];

/**
 * Register a mock route handler.
 * @param {string} method - HTTP method (GET, POST, etc.)
 * @param {string} path - Route pattern (supports :param)
 * @param {function} handler - Returns { data, status }
 */
export function mockRoute(method, path, handler) {
  const paramNames = [];
  const regexStr = path.replace(/:([^/]+)/g, (_, name) => {
    paramNames.push(name);
    return '([^/]+)';
  });
  const regex = new RegExp(`^${regexStr}$`);
  handlers.push({ method, regex, paramNames, handler });
}

/**
 * Match a path against a route pattern.
 */
function matchPath(regex, paramNames, pathname) {
  const match = pathname.match(regex);
  if (!match) return null;
  const params = {};
  paramNames.forEach((name, i) => {
    params[name] = match[i + 1];
  });
  return params;
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Override global fetch
window.fetch = async function (url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  let pathname;

  try {
    pathname = typeof url === 'string'
      ? new URL(url, location.origin).pathname
      : url.pathname;
  } catch {
    return originalFetch.call(window, url, options);
  }

  // Only intercept /api/* requests
  if (!pathname.startsWith('/api')) {
    return originalFetch.call(window, url, options);
  }

  const apiPath = pathname.replace('/api', '');

  for (const route of handlers) {
    if (route.method !== method) continue;

    const params = matchPath(route.regex, route.paramNames, apiPath);
    if (params !== null) {
      await delay(MOCK_DELAY);

      let body = null;
      try {
        body = options.body ? JSON.parse(options.body) : null;
      } catch { /* ignore */ }

      const searchParams = typeof url === 'string'
        ? new URL(url, location.origin).searchParams
        : new URLSearchParams();
      const query = Object.fromEntries(searchParams);

      const result = route.handler({ params, body, query });

      return new Response(JSON.stringify(result.data), {
        status: result.status || 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  // Unmatched API route
  return new Response(JSON.stringify({ error: 'Not found' }), {
    status: 404,
    headers: { 'Content-Type': 'application/json' },
  });
};
