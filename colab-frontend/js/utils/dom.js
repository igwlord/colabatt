/**
 * dom.js — DOM Utilities
 * updateSection, delegateEvents, focusTrap
 */

import { escapeHtml } from './safe-html.js';

/**
 * Update only a specific section of the page instead of full re-render.
 * @param {string} sectionId - ID of the section element
 * @param {string} newHtml - New HTML content
 */
export function updateSection(sectionId, newHtml) {
  const el = document.getElementById(sectionId);
  if (el) el.innerHTML = newHtml;
}

/**
 * Set up event delegation on a container.
 * Listens for clicks on elements with [data-action] attributes.
 *
 * @param {HTMLElement} container
 * @param {Object<string, function(HTMLElement, Event): void>} handlers
 * @returns {function(): void} cleanup function
 */
export function delegateEvents(container, handlers) {
  function handleEvent(e) {
    const el = e.target.closest('[data-action]');
    if (!el || !container.contains(el)) return;

    const action = el.dataset.action;
    if (handlers[action]) {
      handlers[action](el, e);
    }
  }

  container.addEventListener('click', handleEvent);

  // Also handle keyboard activation (Enter/Space) for accessibility
  const handleKeydown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const el = e.target.closest('[data-action]');
      if (el && container.contains(el)) {
        e.preventDefault();
        const action = el.dataset.action;
        if (handlers[action]) {
          handlers[action](el, e);
        }
      }
    }
  };
  container.addEventListener('keydown', handleKeydown);

  return () => {
    container.removeEventListener('click', handleEvent);
    container.removeEventListener('keydown', handleKeydown);
  };
}

/**
 * Trap focus within an element (for modals).
 * @param {HTMLElement} element
 * @returns {function(): void} cleanup function to remove trap
 */
export function trapFocus(element) {
  const focusableSelectors = 'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

  function handleKeydown(e) {
    if (e.key !== 'Tab') return;

    const focusable = Array.from(element.querySelectorAll(focusableSelectors));
    if (focusable.length === 0) return;

    const first = focusable[0];
    const last = focusable[focusable.length - 1];

    if (e.shiftKey) {
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  element.addEventListener('keydown', handleKeydown);

  // Focus the first focusable element
  const firstFocusable = element.querySelector(focusableSelectors);
  if (firstFocusable) {
    requestAnimationFrame(() => firstFocusable.focus());
  }

  return () => {
    element.removeEventListener('keydown', handleKeydown);
  };
}

/**
 * Show a toast notification
 * @param {string} message
 * @param {'info'|'success'|'error'|'warning'} type
 * @param {number} duration - ms before auto-dismiss
 */
export function showToast(message, type = 'info', duration = 4000) {
  const root = document.getElementById('toast-root');
  if (!root) return;

  const toast = document.createElement('div');
  toast.className = `alert-banner alert-banner--${type}`;
  toast.setAttribute('role', 'alert');
  toast.style.cssText = 'min-width: 320px; animation: slideIn 0.3s ease;';
  toast.innerHTML = `
    <div class="alert-banner__left">
      <span class="material-symbols-outlined" style="font-size: 20px; color: var(--${type === 'info' ? 'primary' : type});">${
        type === 'success' ? 'check_circle' :
        type === 'error' ? 'error' :
        type === 'warning' ? 'warning' : 'info'
      }</span>
      <span style="font-size: var(--text-base); color: var(--on-surface);">${escapeHtml(message)}</span>
    </div>
  `;

  root.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transition = 'opacity 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, duration);
}
