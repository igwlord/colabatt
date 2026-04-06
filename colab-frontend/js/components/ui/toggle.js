/**
 * toggle.js — Toggle Switch & Radio Group Components
 */

import { html, raw } from '../../utils/safe-html.js';

/**
 * Toggle switch.
 * @param {Object} props
 * @param {string} props.name
 * @param {string} props.label
 * @param {boolean} [props.checked=false]
 * @returns {string}
 */
export function Toggle({ name, label, checked = false }) {
  return html`
    <label class="toggle" for="toggle-${name}">
      <input
        type="checkbox"
        id="toggle-${name}"
        name="${name}"
        role="switch"
        class="toggle__input"
        ${raw(checked ? 'checked' : '')}
        aria-checked="${checked ? 'true' : 'false'}"
      />
      <span class="toggle__slider" aria-hidden="true"></span>
      <span class="toggle__label">${label}</span>
    </label>
  `;
}

/**
 * Radio group (visual selector, e.g., urgency).
 * @param {Object} props
 * @param {string} props.name
 * @param {string} props.label
 * @param {Array<{value: string, label: string, description?: string}>} props.options
 * @param {string} [props.value='']
 * @returns {string}
 */
export function RadioGroup({ name, label, options, value = '' }) {
  return html`
    <fieldset class="radio-group" role="radiogroup" aria-label="${label}">
      <legend class="form-label">${label}</legend>
      <div class="radio-group__options">
        ${raw(options.map((opt) => `
          <label class="radio-group__option ${opt.value === value ? 'radio-group__option--selected' : ''}">
            <input
              type="radio"
              name="${name}"
              value="${opt.value}"
              class="radio-group__input"
              ${opt.value === value ? 'checked' : ''}
            />
            <span class="radio-group__label">${opt.label}</span>
            ${opt.description ? `<span class="radio-group__desc">${opt.description}</span>` : ''}
          </label>
        `).join(''))}
      </div>
    </fieldset>
  `;
}
