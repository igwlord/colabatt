/**
 * icon.js — Material Symbols Icon Component
 */

import { html } from '../../utils/safe-html.js';

/**
 * @param {Object} props
 * @param {string} props.name - Material icon name
 * @param {boolean} [props.filled=false]
 * @param {string} [props.size] - CSS size override
 * @param {string} [props.color] - CSS color override
 * @returns {string}
 */
export function Icon({ name, filled = false, size, color }) {
  const style = [
    filled ? "font-variation-settings: 'FILL' 1;" : '',
    size ? `font-size: ${size};` : '',
    color ? `color: ${color};` : '',
  ].filter(Boolean).join(' ');

  return html`<span class="material-symbols-outlined" aria-hidden="true"${style ? ` style="${style}"` : ''}>${name}</span>`;
}
