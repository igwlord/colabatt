/**
 * modal.js — Modal Component with Glassmorphism
 * Features: focus trap, Escape to close, backdrop click to close
 */

import { html, raw } from '../../utils/safe-html.js';
import { trapFocus } from '../../utils/dom.js';
import { appStore } from '../../store.js';

/**
 * Open a modal.
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.bodyHtml - Pre-rendered HTML for the body
 * @param {string} [props.footerHtml] - Pre-rendered HTML for the footer
 * @param {string} [props.size='md'] - 'sm' | 'md' | 'lg'
 * @returns {function(): void} close function
 */
export function openModal({ title, bodyHtml, footerHtml, size = 'md' }) {
  const root = document.getElementById('modal-root');
  if (!root) return () => {};

  root.innerHTML = html`
    <div class="modal__overlay" data-action="close-modal">
      <div class="modal__panel modal__panel--${size}" role="dialog" aria-modal="true" aria-label="${title}">
        <div class="modal__header">
          <h3 class="modal__title">${title}</h3>
          <button class="modal__close" data-action="close-modal" aria-label="Cerrar">
            <span class="material-symbols-outlined" aria-hidden="true">close</span>
          </button>
        </div>
        <div class="modal__body">
          ${raw(bodyHtml)}
        </div>
        ${raw(footerHtml ? `<div class="modal__footer">${footerHtml}</div>` : '')}
      </div>
    </div>
  `;

  root.classList.add('active');
  root.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';

  const panel = root.querySelector('.modal__panel');
  const releaseFocus = trapFocus(panel);

  // Store previous focus to restore on close
  const previousFocus = document.activeElement;

  function close() {
    root.classList.remove('active');
    root.innerHTML = '';
    root.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    releaseFocus();
    appStore.set({ modalOpen: null });
    if (previousFocus) previousFocus.focus();
  }

  // Close on backdrop click
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-action="close-modal"]') && !e.target.closest('.modal__panel')) {
      close();
    }
    if (e.target.closest('.modal__close')) {
      close();
    }
  });

  // Close on Escape
  function onEscape(e) {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', onEscape);
    }
  }
  document.addEventListener('keydown', onEscape);

  return close;
}

/**
 * Close the currently open modal.
 */
export function closeModal() {
  const root = document.getElementById('modal-root');
  if (root) {
    root.classList.remove('active');
    root.innerHTML = '';
    root.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  appStore.set({ modalOpen: null });
}
