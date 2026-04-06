/**
 * notificaciones.js — Notifications Page
 * /tecnico/notificaciones
 */
import { html, raw } from '../utils/safe-html.js';
import { appStore } from '../store.js';
import { api } from '../api.js';
import { navigate } from '../router.js';
import { SkeletonLoader } from '../error-handler.js';

export function Notificaciones(container, ctx) {
  let notifications = [];

  container.innerHTML = SkeletonLoader('dashboard');

  async function loadData() {
    try {
      const data = await api.get('/notifications');
      if (Array.isArray(data)) {
        notifications = data;
        appStore.set({ notifications: data });
      }
    } catch { /* use empty */ }
    render();
  }

  function render() {
    const unread = notifications.filter(n => !n.read);
    const todayStr = new Date().toISOString().slice(0, 10);
    const yesterdayStr = new Date(Date.now() - 864e5).toISOString().slice(0, 10);
    const today = notifications.filter(n => n.date === todayStr);
    const yesterday = notifications.filter(n => n.date === yesterdayStr);
    const older = notifications.filter(n => n.date < yesterdayStr);

    container.innerHTML = `
      <div style="padding: 0;">
        <nav style="display: flex; gap: var(--space-2); font-size: 10px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant); margin-bottom: var(--space-2);">
          <span>DASHBOARD</span> / <span>T\u00c9CNICO</span> / <span style="color: var(--primary);">NOTIFICACIONES</span>
        </nav>
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-6);">
          <div style="display: flex; align-items: center; gap: var(--space-4);">
            <h1 style="font-size: var(--text-3xl); font-weight: 800; color: white;">Notificaciones</h1>
            ${unread.length > 0 ? `<span style="background: var(--primary-alpha-20); color: var(--primary); font-size: var(--text-xs); font-weight: 600; padding: var(--space-1) var(--space-3); border-radius: var(--radius-full);">${unread.length} nuevas</span>` : ''}
          </div>
          ${unread.length > 0 ? `<button data-action="mark-all-read" class="btn btn--ghost" style="font-size: var(--text-xs);">
            <span class="material-symbols-outlined" style="font-size: var(--icon-size-sm, 16px);">done_all</span>
            Marcar todas le\u00eddas
          </button>` : ''}
        </div>

        ${renderGroup('Hoy', today)}
        ${renderGroup('Ayer', yesterday)}
        ${renderGroup('Anteriores', older)}

        ${notifications.length === 0 ? `
          <div style="text-align: center; padding: var(--space-16) 0; color: var(--on-surface-variant);">
            <span class="material-symbols-outlined" style="font-size: 48px; display: block; margin-bottom: var(--space-4);">notifications_off</span>
            <p style="font-size: var(--text-base);">No tienes notificaciones</p>
          </div>
        ` : ''}
      </div>
    `;
  }

  function renderGroup(label, items) {
    if (!items.length) return '';
    return `
      <div style="margin-bottom: var(--space-6);">
        <h3 style="font-size: var(--text-xs); font-family: var(--font-mono); text-transform: uppercase; color: var(--on-surface-variant); margin-bottom: var(--space-3); letter-spacing: 0.1em;">${label}</h3>
        <div style="display: flex; flex-direction: column; gap: var(--space-2);">
          ${items.map(n => renderNotifCard(n)).join('')}
        </div>
      </div>
    `;
  }

  function renderNotifCard(n) {
    const iconColors = {
      check_circle: 'var(--success)',
      person_add: 'var(--primary)',
      auto_awesome: 'var(--warning)',
      update: 'var(--info)',
      school: 'var(--tertiary)',
      route: 'var(--secondary)',
    };
    const color = iconColors[n.icon] || 'var(--on-surface-variant)';
    const unreadStyle = n.read ? '' : 'background: linear-gradient(90deg, color-mix(in srgb, var(--primary) 12%, var(--surface-container)) 0%, var(--surface-container) 100%);';

    // escape text content
    const div = document.createElement('div');
    div.textContent = n.title;
    const safeTitle = div.innerHTML;
    div.textContent = n.body;
    const safeBody = div.innerHTML;
    div.textContent = n.time;
    const safeTime = div.innerHTML;

    return `
      <div data-action="go-notif" data-link-to="${n.linkTo || ''}" style="display: flex; align-items: flex-start; gap: var(--space-4); padding: var(--space-4); background: var(--surface-container); border-radius: var(--radius-md); cursor: pointer; transition: all var(--ease-fast); ${unreadStyle}" onmouseover="this.style.background='var(--surface-high)'" onmouseout="this.style.background='var(--surface-container)'">
        <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background: color-mix(in srgb, ${color} 15%, transparent); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span class="material-symbols-outlined" style="font-size: 20px; color: ${color}; font-variation-settings: 'FILL' 1;">${n.icon}</span>
        </div>
        <div style="flex: 1; min-width: 0;">
          <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: 2px;">
            <span style="font-size: var(--text-sm); font-weight: 600; color: white;">${safeTitle}</span>
            ${!n.read ? '<span style="font-size: 9px; background: var(--primary); color: var(--on-primary); padding: 1px 6px; border-radius: var(--radius-full); font-weight: 700;">NUEVO</span>' : ''}
          </div>
          <p style="font-size: var(--text-xs); color: var(--on-surface-variant); line-height: 1.5; margin-bottom: var(--space-1);">${safeBody}</p>
          <span style="font-size: 10px; color: var(--on-surface-variant);">${safeTime}</span>
        </div>
      </div>
    `;
  }

  function handleClick(e) {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;

    if (actionEl.dataset.action === 'go-notif' && actionEl.dataset.linkTo) {
      navigate(actionEl.dataset.linkTo);
    }
    if (actionEl.dataset.action === 'mark-all-read') {
      notifications = notifications.map(n => ({ ...n, read: true }));
      appStore.set({ unreadCount: 0, notifications });
      render();
    }
  }

  container.addEventListener('click', handleClick);
  loadData();

  return () => {
    container.removeEventListener('click', handleClick);
  };
}
