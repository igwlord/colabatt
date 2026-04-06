/**
 * side-nav.js — SideNavBar Layout Component
 * Fixed sidebar with navigation links, CTA button, and bottom actions.
 */

import { html, raw } from '../utils/safe-html.js';
import { appStore } from '../store.js';
import { navigate } from '../router.js';

/**
 * Navigation items configuration.
 * Each item defines its route, icon, label, and optional role restriction.
 */
const NAV_ITEMS = [
  {
    route: '/tecnico/dashboard',
    icon: 'space_dashboard',
    label: 'Dashboard',
    roles: ['technician', 'manager', 'admin'],
    filled: true,
  },
  {
    route: '/tecnico/oportunidades',
    icon: 'engineering',
    label: 'Oportunidades',
    roles: ['technician', 'manager', 'admin'],
  },
  {
    route: '/tecnico/mis-proyectos',
    icon: 'hub',
    label: 'Mis Proyectos',
    roles: ['technician', 'manager', 'admin'],
  },
  {
    route: '/tecnico/notificaciones',
    icon: 'notifications_active',
    label: 'Notificaciones',
    roles: ['technician', 'manager', 'admin'],
  },
  {
    route: '/manager/dashboard',
    icon: 'dashboard',
    label: 'Manager Dashboard',
    roles: ['manager', 'admin'],
  },
  {
    route: '/manager/planificacion',
    icon: 'event_available',
    label: 'Planificaci\u00f3n',
    roles: ['manager', 'admin'],
  },
  {
    route: '/manager/analytics',
    icon: 'analytics',
    label: 'Team Analytics',
    roles: ['manager', 'admin'],
  },
];

/**
 * Render the inner HTML of the side nav based on the current user role.
 * @param {HTMLElement} container
 */
function renderInnerHTML(container) {
  const user = appStore.get('user');

  container.innerHTML = html`
    <div class="sidenav__header" style="display: flex; align-items: center; justify-content: space-between;">
      <div style="display: flex; align-items: center; gap: var(--space-3);">
        <div class="sidenav__logo-icon">
          <span class="material-symbols-outlined" aria-hidden="true">hub</span>
        </div>
        <div>
          <h2 class="sidenav__title">Enterprise Hub</h2>
          <p class="sidenav__subtitle">Precision Console</p>
        </div>
      </div>
      <button class="sidenav__toggle" data-action="toggle-sidebar" aria-label="Colapsar men${raw('&uacute;')}" style="background: none; border: none; color: var(--on-surface-variant); cursor: pointer; padding: var(--space-1); border-radius: var(--radius-sm); transition: all var(--ease-fast);">
        <span class="material-symbols-outlined" style="font-size: 18px;">menu_open</span>
      </button>
    </div>
    <nav class="sidenav__nav" aria-label="Navegaci${raw('&oacute;')}n principal">
      ${raw(NAV_ITEMS
        .filter((item) => item.roles.includes(user.role))
        .map((item) => html`
          <a
            href="${item.route}"
            data-link
            data-route="${item.route}"
            class="sidenav__link"
            aria-current="false"
          >
            <span class="material-symbols-outlined"
              ${raw(item.filled ? ' style="font-variation-settings: \'FILL\' 1;"' : '')}
            >${item.icon}</span>
            <span class="sidenav__link-text">${item.label}</span>
          </a>
        `).join('')
      )}
    </nav>
    <div class="sidenav__bottom">
      <button
        class="sidenav__cta"
        data-action="new-request"
        aria-label="Crear nueva solicitud"
      >
        <span class="material-symbols-outlined" aria-hidden="true">add_circle</span>
        <span>Nueva Solicitud</span>
      </button>
      <div class="sidenav__bottom-links">
        <a href="/api/auth/logout" class="sidenav__bottom-link">
          <span class="material-symbols-outlined" aria-hidden="true">logout</span>
          <span>Cerrar sesi${raw('&oacute;')}n</span>
        </a>
      </div>
    </div>
  `;
}

/**
 * Render the side navigation bar.
 * @param {HTMLElement} container - The #side-nav element
 * @returns {function(): void} unsubscribe function
 */
export function renderSideNav(container) {
  // Initial render
  renderInnerHTML(container);

  // Event delegation for sidenav actions (set up once)
  function handleClick(e) {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;

    if (actionEl.dataset.action === 'toggle-sidebar') {
      e.preventDefault();
      const collapsed = !appStore.get('sideNavCollapsed');
      appStore.set({ sideNavCollapsed: collapsed });
      document.body.classList.toggle('sidebar-collapsed', collapsed);
    }

    if (actionEl.dataset.action === 'new-request') {
      e.preventDefault();
      const role = appStore.get('user').role;
      if (role === 'manager' || role === 'admin') {
        navigate('/manager/nueva-necesidad');
      } else {
        navigate('/tecnico/oportunidades');
      }
    }
  }

  container.addEventListener('click', handleClick);

  // Subscribe to user changes, re-render only when role changes
  let previousRole = appStore.get('user').role;
  const unsubscribe = appStore.on('user', (user) => {
    if (user.role !== previousRole) {
      previousRole = user.role;
      renderInnerHTML(container);
    }
  });

  // Return cleanup function
  return () => {
    unsubscribe();
    container.removeEventListener('click', handleClick);
  };
}
