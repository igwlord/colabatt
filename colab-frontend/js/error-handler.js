/**
 * error-handler.js — Global Error Handling
 */

import { showToast } from './utils/dom.js';
import { ApiError } from './api.js';
import { html } from './utils/safe-html.js';

/**
 * Handle API errors by status code.
 * @param {ApiError} err
 * @returns {Object|null} Validation errors for 422, null otherwise
 */
export function handleApiError(err) {
  if (!(err instanceof ApiError)) {
    console.error('Unexpected error:', err);
    showToast('Error inesperado. Intenta de nuevo.', 'error');
    return null;
  }

  switch (err.status) {
    case 401:
      // Already handled by api.js redirect
      break;
    case 403:
      showToast('No tienes permiso para esta acción.', 'error');
      break;
    case 404:
      showToast('Recurso no encontrado.', 'error');
      break;
    case 422:
      // Validation errors — return to caller for field-level display
      return err.body?.errors || {};
    case 429:
      showToast('Demasiadas solicitudes. Espera un momento.', 'warning');
      break;
    default:
      showToast('Error del servidor. Contacta soporte.', 'error');
  }

  return null;
}

/**
 * Render an error state in a container.
 * @param {string} message
 * @returns {string} HTML
 */
export function ErrorState(message) {
  return html`
    <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 40vh; text-align: center;">
      <span class="material-symbols-outlined" style="font-size: 48px; color: var(--outline-variant); margin-bottom: var(--space-4);">cloud_off</span>
      <h3 style="color: white; margin-bottom: var(--space-2);">${message}</h3>
      <p style="color: var(--on-surface-variant); font-size: var(--text-sm);">Verifica tu conexión e intenta de nuevo.</p>
    </div>
  `;
}

/**
 * Render a loading skeleton.
 * @param {'dashboard'|'cards'|'form'} type
 * @returns {string} HTML
 */
export function SkeletonLoader(type = 'dashboard') {
  if (type === 'dashboard') {
    return `
      <div style="display: flex; flex-direction: column; gap: var(--space-6);">
        <div class="skeleton skeleton--title" style="width: 300px;"></div>
        <div class="grid-3">
          <div class="skeleton skeleton--card"></div>
          <div class="skeleton skeleton--card"></div>
          <div class="skeleton skeleton--card"></div>
        </div>
        <div style="display: flex; gap: var(--space-2);">
          <div class="skeleton" style="width: 80px; height: 32px; border-radius: var(--radius-full);"></div>
          <div class="skeleton" style="width: 100px; height: 32px; border-radius: var(--radius-full);"></div>
          <div class="skeleton" style="width: 90px; height: 32px; border-radius: var(--radius-full);"></div>
        </div>
        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          <div class="skeleton" style="height: 80px;"></div>
          <div class="skeleton" style="height: 80px;"></div>
          <div class="skeleton" style="height: 80px;"></div>
        </div>
      </div>
    `;
  }

  if (type === 'cards') {
    return `
      <div class="grid-4">
        <div class="skeleton skeleton--card" style="height: 280px;"></div>
        <div class="skeleton skeleton--card" style="height: 280px;"></div>
        <div class="skeleton skeleton--card" style="height: 280px;"></div>
        <div class="skeleton skeleton--card" style="height: 280px;"></div>
      </div>
    `;
  }

  return `
    <div style="max-width: 640px; margin: 0 auto; display: flex; flex-direction: column; gap: var(--space-6);">
      <div class="skeleton skeleton--title"></div>
      <div class="skeleton" style="height: 120px;"></div>
      <div class="skeleton" style="height: 60px;"></div>
      <div class="skeleton" style="height: 60px;"></div>
    </div>
  `;
}

// ── Global error handlers ──
window.addEventListener('unhandledrejection', (e) => {
  console.error('Unhandled promise rejection:', e.reason);
  // Don't show toast for AbortError (expected on navigation)
  if (e.reason?.name !== 'AbortError') {
    showToast('Error inesperado. Intenta recargar la página.', 'error');
  }
});

window.addEventListener('error', (e) => {
  console.error('Uncaught error:', e.error);
});

/**
 * Retry an async function with exponential backoff.
 * Only retries on network errors and 5xx server errors.
 * @param {function(): Promise} fn
 * @param {Object} options
 * @returns {Promise}
 */
export async function withRetry(fn, { maxAttempts = 3, delay = 1000, backoff = 2 } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      const isRetryable = !err.status || err.status >= 500;
      if (attempt === maxAttempts || !isRetryable) throw err;
      await new Promise((r) => setTimeout(r, delay * Math.pow(backoff, attempt - 1)));
    }
  }
}
