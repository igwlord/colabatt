/**
 * progress-bar.js — Progress Bar Component
 */

import { html } from '../../utils/safe-html.js';

/**
 * @param {Object} props
 * @param {number} props.value - 0-100
 * @param {'primary'|'success'|'warning'|'error'} [props.variant='primary']
 * @param {string} [props.label] - Accessible label
 * @returns {string}
 */
export function ProgressBar({ value, variant = 'primary', label }) {
  const clamped = Math.max(0, Math.min(100, value));
  return html`
    <div
      class="progress-bar progress-bar--${variant}"
      role="progressbar"
      aria-valuenow="${clamped}"
      aria-valuemin="0"
      aria-valuemax="100"
      aria-label="${label || `${clamped}% completado`}"
    >
      <div class="progress-bar__fill" style="width: ${clamped}%"></div>
    </div>
  `;
}
