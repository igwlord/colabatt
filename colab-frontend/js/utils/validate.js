/**
 * validate.js — Lightweight Form Validator (~80 lines)
 * Zero dependencies. Uses Constraint Validation API where possible.
 */

import { escapeHtml } from './safe-html.js';

/**
 * @typedef {Object} ValidationRule
 * @property {boolean} [required]
 * @property {number} [minLength]
 * @property {number} [maxLength]
 * @property {number} [min]
 * @property {number} [max]
 * @property {RegExp} [pattern]
 * @property {string} [message] - Custom error message
 * @property {function(string): string|null} [custom] - Custom validator
 */

/**
 * Validate a single field value against rules.
 * @param {string} value
 * @param {ValidationRule} rules
 * @returns {string|null} Error message or null if valid
 */
export function validateField(value, rules) {
  const v = (value ?? '').trim();

  if (rules.required && !v) {
    return rules.message || 'Este campo es requerido';
  }
  if (rules.minLength && v.length < rules.minLength) {
    return `Mínimo ${rules.minLength} caracteres`;
  }
  if (rules.maxLength && v.length > rules.maxLength) {
    return `Máximo ${rules.maxLength} caracteres`;
  }
  if (rules.min !== undefined && Number(v) < rules.min) {
    return `El valor mínimo es ${rules.min}`;
  }
  if (rules.max !== undefined && Number(v) > rules.max) {
    return `El valor máximo es ${rules.max}`;
  }
  if (rules.pattern && !rules.pattern.test(v)) {
    return rules.message || 'Formato inválido';
  }
  if (rules.custom) {
    return rules.custom(v);
  }

  return null;
}

/**
 * Validate an entire form object.
 * @param {Object<string, string>} formData
 * @param {Object<string, ValidationRule>} schema
 * @returns {{ valid: boolean, errors: Object<string, string> }}
 */
export function validateForm(formData, schema) {
  const errors = {};

  for (const [field, rules] of Object.entries(schema)) {
    const error = validateField(formData[field], rules);
    if (error) errors[field] = error;
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

/**
 * Show validation error on a form field.
 * @param {HTMLElement} input
 * @param {string} message
 */
export function showFieldError(input, message) {
  input.classList.add('input--error');

  // Remove existing error
  const existing = input.parentElement.querySelector('.form-error');
  if (existing) existing.remove();

  const errorEl = document.createElement('div');
  errorEl.className = 'form-error';
  errorEl.innerHTML = `<span class="material-symbols-outlined">error</span>${escapeHtml(message)}`;
  input.parentElement.appendChild(errorEl);
}

/**
 * Clear validation error from a field.
 * @param {HTMLElement} input
 */
export function clearFieldError(input) {
  input.classList.remove('input--error');
  const existing = input.parentElement.querySelector('.form-error');
  if (existing) existing.remove();
}
