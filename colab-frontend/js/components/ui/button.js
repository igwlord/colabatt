/**
 * button.js — Button Component
 */

import { html, raw } from '../../utils/safe-html.js';

/**
 * @param {Object} props
 * @param {string} props.label
 * @param {'primary'|'secondary'|'ghost'|'error'} [props.variant='primary']
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {string} [props.icon] - Material icon name
 * @param {boolean} [props.iconOnly]
 * @param {boolean} [props.full] - Full width
 * @param {boolean} [props.disabled]
 * @param {string} [props.action] - data-action value
 * @param {string} [props.dataId] - data-id value
 * @param {string} [props.type='button']
 * @returns {string}
 */
export function Button({
  label,
  variant = 'primary',
  size = 'md',
  icon,
  iconOnly = false,
  full = false,
  disabled = false,
  action,
  dataId,
  type = 'button',
}) {
  const classes = [
    'btn',
    `btn--${variant}`,
    size !== 'md' ? `btn--${size}` : '',
    full ? 'btn--full' : '',
    iconOnly ? 'btn--icon' : '',
  ].filter(Boolean).join(' ');

  return html`
    <button
      type="${type}"
      class="${classes}"
      ${raw(disabled ? 'disabled' : '')}
      ${raw(action ? `data-action="${action}"` : '')}
      ${raw(dataId ? `data-id="${dataId}"` : '')}
      ${raw(iconOnly ? `aria-label="${label}"` : '')}
    >
      ${raw(icon ? `<span class="material-symbols-outlined" aria-hidden="true">${icon}</span>` : '')}
      ${raw(iconOnly ? '' : `<span>${label}</span>`)}
    </button>
  `;
}
