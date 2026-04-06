import { html, raw } from '../../utils/safe-html.js';
import { api } from '../../api.js';
import { appStore } from '../../store.js';

export function NotificationPanel(notifications = []) {
  const unreadCount = notifications.filter(n => !n.read).length;

  return html`
    <div class="notification-panel" role="menu" aria-label="Notificaciones">
      <div class="notification-panel__header">
        <h3 class="notification-panel__title">Notificaciones</h3>
        ${raw(unreadCount > 0 ? html`<span class="notification-panel__badge">${String(unreadCount)}</span>` : '')}
      </div>
      <div class="notification-panel__list">
        ${raw(notifications.length === 0
          ? html`<div class="notification-panel__empty">Sin notificaciones</div>`
          : notifications.map(n => html`
            <div class="notification-panel__item ${n.read ? '' : 'notification-panel__item--unread'}" data-action="notification" data-id="${n.id}">
              <span class="material-symbols-outlined notification-panel__icon" aria-hidden="true">${n.icon || 'notifications'}</span>
              <div class="notification-panel__content">
                <span class="notification-panel__item-title">${n.title}</span>
                <span class="notification-panel__item-body">${n.body}</span>
                <span class="notification-panel__time">${n.time}</span>
              </div>
              ${raw(!n.read ? html`<div class="notification-panel__dot"></div>` : '')}
            </div>
          `).join('')
        )}
      </div>
      ${raw(unreadCount > 0 ? html`
        <div class="notification-panel__footer">
          <button class="notification-panel__mark-read" data-action="mark-all-read">Marcar todas como leidas</button>
        </div>
      ` : '')}
    </div>
  `;
}
