/**
 * badge.js — Badge / Status Tag Component
 */

import { html } from '../../utils/safe-html.js';

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {'urgente'|'normal'|'critico'|'success'|'warning'|'info'|'on-track'|'delayed'|'completed'} [props.variant='info']
 * @returns {string}
 */
export function Badge({ label, variant = 'info' }) {
  return html`<span class="badge badge--${variant}">${label}</span>`;
}
