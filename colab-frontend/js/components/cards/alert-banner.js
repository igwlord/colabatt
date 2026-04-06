/**
 * alert-banner.js — Alert Banner Component
 * Critical delay alerts, warnings, info banners.
 */

import { html, raw } from '../../utils/safe-html.js';

/**
 * @param {Object} props
 * @param {string} props.title
 * @param {string} props.message
 * @param {'error'|'warning'|'info'} [props.type='error']
 * @param {string} [props.actionLabel] - e.g. "Resolve Now"
 * @param {string} [props.actionId] - data-id for the action
 * @returns {string}
 */
export function AlertBanner({ title, message, type = 'error', actionLabel, actionId }) {
  const icon = type === 'error' ? 'warning'
    : type === 'warning' ? 'info'
    : 'info';

  return html`
    <div class="alert-banner alert-banner--${type}" role="alert">
      <div class="alert-banner__left">
        <div class="alert-banner__icon">
          <span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;" aria-hidden="true">${icon}</span>
        </div>
        <div class="alert-banner__text">
          <h3 class="alert-banner__title">${title}</h3>
          <p class="alert-banner__message">${message}</p>
        </div>
      </div>
      ${raw(actionLabel ? `
        <button
          class="alert-banner__action"
          data-action="alert-action"
          data-id="${actionId || ''}"
        >${actionLabel}</button>
      ` : '')}
    </div>
  `;
}
