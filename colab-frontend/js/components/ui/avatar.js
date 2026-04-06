/**
 * avatar.js — Avatar Component
 */

import { html, raw } from '../../utils/safe-html.js';

/**
 * @param {Object} props
 * @param {string} [props.src] - Image URL
 * @param {string} props.name - Full name (for alt text and fallback initials)
 * @param {'sm'|'md'|'lg'} [props.size='md']
 * @param {'free'|'partial'|'busy'} [props.status] - Status dot
 * @returns {string}
 */
export function Avatar({ src, name, size = 'md', status }) {
  const initials = name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return html`
    <div class="avatar avatar--${size}" aria-label="${name}">
      ${raw(src
        ? `<img src="${src}" alt="${name}" class="avatar__img" />`
        : `<span class="avatar__initials">${initials}</span>`
      )}
      ${raw(status
        ? `<span class="avatar__status avatar__status--${status}" aria-label="Estado: ${status === 'free' ? 'disponible' : status === 'partial' ? 'parcial' : 'ocupado'}"></span>`
        : ''
      )}
    </div>
  `;
}

/**
 * Avatar stack (overlapping avatars).
 * @param {Array<{src?: string, name: string}>} members
 * @param {number} [max=4]
 * @returns {string}
 */
export function AvatarStack(members, max = 4) {
  const visible = members.slice(0, max);
  const overflow = members.length - max;

  return html`
    <div class="avatar-stack" aria-label="${members.length} miembros">
      ${raw(visible.map((m) => Avatar({ ...m, size: 'sm' })).join(''))}
      ${raw(overflow > 0
        ? `<span class="avatar avatar--sm avatar__overflow">+${overflow}</span>`
        : ''
      )}
    </div>
  `;
}
