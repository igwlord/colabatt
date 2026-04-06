/**
 * input.js — Form Input Components
 */

import { html, raw } from '../../utils/safe-html.js';

/**
 * Text input field.
 * @param {Object} props
 * @param {string} props.name
 * @param {string} props.label
 * @param {string} [props.type='text']
 * @param {string} [props.value='']
 * @param {string} [props.placeholder='']
 * @param {boolean} [props.required=false]
 * @param {string} [props.error] - Error message
 * @returns {string}
 */
export function Input({ name, label, type = 'text', value = '', placeholder = '', required = false, error }) {
  return html`
    <div class="form-group">
      <label class="form-label" for="field-${name}">
        ${label}${raw(required ? '<span class="form-required" aria-hidden="true">*</span>' : '')}
      </label>
      <input
        id="field-${name}"
        name="${name}"
        type="${type}"
        class="input ${raw(error ? 'input--error' : '')}"
        value="${value}"
        placeholder="${placeholder}"
        ${raw(required ? 'required' : '')}
        aria-describedby="${raw(error ? `error-${name}` : '')}"
        ${raw(error ? 'aria-invalid="true"' : '')}
      />
      ${raw(error ? `<div class="form-error" id="error-${name}"><span class="material-symbols-outlined">error</span>${error}</div>` : '')}
    </div>
  `;
}

/**
 * Textarea field.
 * @param {Object} props
 * @param {string} props.name
 * @param {string} props.label
 * @param {string} [props.value='']
 * @param {string} [props.placeholder='']
 * @param {number} [props.rows=4]
 * @param {boolean} [props.required=false]
 * @param {string} [props.error]
 * @returns {string}
 */
export function Textarea({ name, label, value = '', placeholder = '', rows = 4, required = false, error }) {
  return html`
    <div class="form-group">
      <label class="form-label" for="field-${name}">
        ${label}${raw(required ? '<span class="form-required" aria-hidden="true">*</span>' : '')}
      </label>
      <textarea
        id="field-${name}"
        name="${name}"
        class="input textarea ${raw(error ? 'input--error' : '')}"
        rows="${rows}"
        placeholder="${placeholder}"
        ${raw(required ? 'required' : '')}
        aria-describedby="${raw(error ? `error-${name}` : '')}"
        ${raw(error ? 'aria-invalid="true"' : '')}
      >${value}</textarea>
      ${raw(error ? `<div class="form-error" id="error-${name}"><span class="material-symbols-outlined">error</span>${error}</div>` : '')}
    </div>
  `;
}

/**
 * Select dropdown.
 * @param {Object} props
 * @param {string} props.name
 * @param {string} props.label
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} [props.value='']
 * @param {boolean} [props.required=false]
 * @param {string} [props.error]
 * @returns {string}
 */
export function Select({ name, label, options, value = '', required = false, error }) {
  return html`
    <div class="form-group">
      <label class="form-label" for="field-${name}">
        ${label}${raw(required ? '<span class="form-required" aria-hidden="true">*</span>' : '')}
      </label>
      <select
        id="field-${name}"
        name="${name}"
        class="input select ${raw(error ? 'input--error' : '')}"
        ${raw(required ? 'required' : '')}
        aria-describedby="${raw(error ? `error-${name}` : '')}"
        ${raw(error ? 'aria-invalid="true"' : '')}
      >
        <option value="" disabled ${raw(!value ? 'selected' : '')}>Seleccionar...</option>
        ${raw(options.map((opt) =>
          `<option value="${opt.value}" ${opt.value === value ? 'selected' : ''}>${opt.label}</option>`
        ).join(''))}
      </select>
      ${raw(error ? `<div class="form-error" id="error-${name}"><span class="material-symbols-outlined">error</span>${error}</div>` : '')}
    </div>
  `;
}
