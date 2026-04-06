/**
 * dependency-card.js — Dependency Card Component
 * Shows task progress, status badge, team avatars, and deadline.
 */

import { html, raw } from '../../utils/safe-html.js';
import { ProgressBar } from '../ui/progress-bar.js';
import { AvatarStack } from '../ui/avatar.js';

/**
 * @param {Object} props
 * @param {string} props.id
 * @param {string} props.title
 * @param {string} props.taskId - e.g. "FB-204"
 * @param {string} props.description
 * @param {string} props.icon - Material icon name
 * @param {'on-track'|'delayed'|'pending'|'completed'} props.status
 * @param {number} props.progress - 0-100
 * @param {Array<{name: string, src?: string}>} [props.members=[]]
 * @param {string} props.dueDate - e.g. "Oct 12, 2024"
 * @returns {string}
 */
export function DependencyCard({ id, title, taskId, description, icon, status, progress, members = [], dueDate }) {
  const statusLabel = {
    'on-track': 'ON TRACK',
    'delayed': 'DELAYED',
    'pending': 'PENDING',
    'completed': 'COMPLETED',
  }[status] || status.toUpperCase();

  const statusColor = {
    'on-track': 'primary',
    'delayed': 'error',
    'pending': 'on-surface-variant',
    'completed': 'success',
  }[status] || 'primary';

  const barVariant = status === 'delayed' ? 'error'
    : status === 'pending' ? 'warning'
    : status === 'completed' ? 'success'
    : 'primary';

  const isDelayed = status === 'delayed';

  return html`
    <div class="dependency-card ${raw(isDelayed ? 'dependency-card--delayed' : '')}" data-id="${id}">
      <div class="dependency-card__header">
        <div class="dependency-card__icon-group">
          <div class="dependency-card__icon" style="background: rgba(var(--${statusColor}-rgb, 76, 214, 251), 0.1);">
            <span class="material-symbols-outlined" style="color: var(--${statusColor});" aria-hidden="true">${icon}</span>
          </div>
          <div>
            <h4 class="dependency-card__title">${title}</h4>
            <p class="dependency-card__task-id">Task ID: ${taskId}</p>
          </div>
        </div>
        <span class="badge badge--${status === 'on-track' ? 'on-track' : status === 'delayed' ? 'critico' : status === 'completed' ? 'completed' : 'info'}">${statusLabel}</span>
      </div>
      <p class="dependency-card__desc">${description}</p>
      <div class="dependency-card__progress">
        <div class="dependency-card__progress-header">
          <span class="dependency-card__progress-label">Progress</span>
          <span class="dependency-card__progress-value">${progress}%</span>
        </div>
        ${raw(ProgressBar({ value: progress, variant: barVariant }))}
      </div>
      <div class="dependency-card__footer">
        ${raw(AvatarStack(members))}
        <div class="dependency-card__date ${raw(isDelayed ? 'dependency-card__date--delayed' : '')}">
          <span class="material-symbols-outlined" style="font-size: 14px;" aria-hidden="true">calendar_today</span>
          <span>${dueDate}</span>
        </div>
      </div>
    </div>
  `;
}
