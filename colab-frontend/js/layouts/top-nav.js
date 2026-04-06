/**
 * top-nav.js — TopNavBar Layout Component
 * Fixed header with logo, search, and user avatar.
 */

import { html, raw } from '../utils/safe-html.js';
import { appStore } from '../store.js';

/**
 * Render the top navigation bar.
 * @param {HTMLElement} container - The #top-nav element
 */
export function renderTopNav(container) {
  const user = appStore.get('user');

  container.innerHTML = html`
    <div class="topnav__left">
      <h1 class="topnav__logo">
        <a href="/tecnico/oportunidades" data-link aria-label="CoLab Hub - Inicio" style="display: flex; align-items: center; gap: var(--space-2);">
          <img src="img/att.png" alt="AT&amp;T" style="height: 28px; width: auto; filter: brightness(0) invert(1);" />
          CoLab Hub
        </a>
      </h1>
    </div>
    <div class="topnav__center">
      <div class="topnav__search">
        <span class="material-symbols-outlined topnav__search-icon" aria-hidden="true">search</span>
        <input
          type="search"
          class="topnav__search-input"
          placeholder="Buscar t${raw('&eacute;')}cnico, proyecto o BU..."
          aria-label="Buscar en la plataforma"
        />
      </div>
    </div>
    <div class="topnav__right">
      <button class="topnav__icon-btn" aria-label="Configuraci${raw('&oacute;')}n" data-action="settings">
        <span class="material-symbols-outlined">settings</span>
      </button>
      <button class="topnav__avatar" aria-label="Perfil de ${user.name}" data-action="profile">
        ${raw(user.avatarUrl
          ? `<img src="${user.avatarUrl}" alt="" role="presentation" class="topnav__avatar-img" />`
          : `<span class="topnav__avatar-fallback" aria-hidden="true">${getInitials(user.name)}</span>`
        )}
      </button>
    </div>
  `;

  // ── Search input → store binding ──
  const searchInput = container.querySelector('.topnav__search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      appStore.set({ searchQuery: e.target.value.trim().toLowerCase() });
    });
  }
}

function getInitials(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}
