import { html, raw } from '../../utils/safe-html.js';
import { appStore } from '../../store.js';

export function NotificationPanel(notifications = []) {
  const unreadCount = notifications.filter(n => !n.read).length;

  const todayStr = new Date().toISOString().slice(0, 10);
  const yesterdayStr = new Date(Date.now() - 864e5).toISOString().slice(0, 10);

  const groups = [
    { label: 'Hoy', items: notifications.filter(n => n.date === todayStr) },
    { label: 'Ayer', items: notifications.filter(n => n.date === yesterdayStr) },
    { label: 'Anterior', items: notifications.filter(n => n.date && n.date < yesterdayStr) },
  ].filter(g => g.items.length);

  function renderItem(n) {
    return html`
      <div class="notification-panel__item ${n.read ? '' : 'notification-panel__item--unread'}" data-action="notification" data-id="${n.id}">
        <span class="material-symbols-outlined notification-panel__icon" aria-hidden="true">${n.icon || 'notifications'}</span>
        <div class="notification-panel__content">
          <div style="display:flex;align-items:center;gap:6px;">
            <span class="notification-panel__item-title">${n.title}</span>
            ${raw(!n.read ? `<span style="font-size:9px;font-weight:700;font-family:var(--font-mono);color:var(--on-primary);background:var(--primary);padding:1px 5px;border-radius:var(--radius-full);letter-spacing:.05em;flex-shrink:0;">NUEVA</span>` : '')}
          </div>
          <span class="notification-panel__item-body">${n.body}</span>
          <span class="notification-panel__time">${n.time}</span>
        </div>
        ${raw(!n.read ? html`<div class="notification-panel__dot"></div>` : '')}
      </div>
    `;
  }

  function renderGroup(label, items) {
    return `
      <div style="padding:var(--space-2) var(--space-5) var(--space-1);font-size:10px;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.08em;color:var(--on-surface-variant);">${label}</div>
      ${items.map(n => renderItem(n)).join('')}
    `;
  }

  const listContent = notifications.length === 0
    ? html`<div class="notification-panel__empty">Sin notificaciones</div>`
    : (groups.length
        ? groups.map(g => renderGroup(g.label, g.items)).join('')
        : notifications.map(n => renderItem(n)).join(''));

  return html`
    <div class="notification-panel" role="menu" aria-label="Notificaciones">
      <div class="notification-panel__header">
        <h3 class="notification-panel__title">Notificaciones</h3>
        ${raw(unreadCount > 0 ? html`<span class="notification-panel__badge">${String(unreadCount)}</span>` : '')}
      </div>
      <div class="notification-panel__list">
        ${raw(listContent)}
      </div>
      ${raw(unreadCount > 0 ? html`
        <div class="notification-panel__footer">
          <button class="notification-panel__mark-read" data-action="mark-all-read">Marcar todas como leídas</button>
        </div>
      ` : '')}
    </div>
  `;
}
