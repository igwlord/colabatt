/**
 * safe-html.js — XSS Protection via Tagged Template Literals
 *
 * Usage:
 *   import { html, raw } from './utils/safe-html.js';
 *   html`<div>${userInput}</div>`  // auto-escaped
 *   html`<div>${raw(trustedHtml)}</div>`  // bypass for trusted content
 */

const ESC_MAP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} str
 * @returns {string}
 */
export function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ESC_MAP[c]);
}

/**
 * Tagged template literal that auto-escapes all interpolated values.
 * Returns a string with HTML-safe content.
 *
 * @param {TemplateStringsArray} strings
 * @param {...*} values
 * @returns {string}
 */
export function html(strings, ...values) {
  return strings.reduce((result, str, i) => {
    if (i >= values.length) return result + str;

    const val = values[i];

    // Allow raw HTML (trusted content)
    if (val && val.__raw === true) {
      return result + str + val.value;
    }

    // Handle null/undefined gracefully
    if (val == null) {
      return result + str + '';
    }

    // Handle arrays (for .map().join('') patterns)
    if (Array.isArray(val)) {
      return result + str + val.join('');
    }

    // Escape everything else
    return result + str + escapeHtml(val);
  }, '');
}

/**
 * Mark a value as raw/trusted HTML (bypasses escaping).
 * Only use for content you have already sanitized or generated yourself.
 *
 * @param {string} value
 * @returns {{ __raw: true, value: string }}
 */
export function raw(value) {
  return { __raw: true, value: String(value ?? '') };
}
