/**
 * mis-proyectos.js — My Projects Page
 * /tecnico/mis-proyectos
 */
import { html, raw } from '../utils/safe-html.js';
import { appStore } from '../store.js';
import { api } from '../api.js';
import { SkeletonLoader } from '../error-handler.js';

export function MisProyectos(container, ctx) {
  let projects = [];

  container.innerHTML = SkeletonLoader('dashboard');

  async function loadData() {
    try {
      const data = await api.get('/projects');
      if (Array.isArray(data)) projects = data;
    } catch { /* empty */ }
    render();
  }

  function render() {
    const activeCount = projects.filter(p => p.status === 'activo').length;
    const totalHours = projects.reduce((sum, p) => sum + p.hoursWeek, 0);
    const nextDeadline = projects
      .filter(p => p.nextMilestoneDate)
      .sort((a, b) => a.nextMilestoneDate.localeCompare(b.nextMilestoneDate))[0];

    container.innerHTML = `
      <div style="padding: 0;">
        <nav style="display: flex; gap: var(--space-2); font-size: 10px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant); margin-bottom: var(--space-2);">
          <span>DASHBOARD</span> / <span>TÉCNICO</span> / <span style="color: var(--primary);">MIS PROYECTOS</span>
        </nav>
        <h1 style="font-size: var(--text-3xl); font-weight: 800; color: white; margin-bottom: var(--space-6);">Mis Proyectos</h1>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4); margin-bottom: var(--space-8);">
          ${kpiCard('folder_open', 'Proyectos Activos', String(activeCount), activeCount > 0 ? 'En ejecución' : 'Sin proyectos')}
          ${kpiCard('schedule', 'Horas Comprometidas', totalHours + 'h/sem', 'De ' + appStore.get('user').availableHours + 'h disponibles')}
          ${kpiCard('event', 'Próximo Milestone', nextDeadline ? nextDeadline.nextMilestoneDate : '—', nextDeadline ? escapeHtml(nextDeadline.nextMilestone) : 'Sin milestones')}
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--space-4);">
          ${projects.length === 0 ? `
            <div style="text-align: center; padding: var(--space-16) 0; color: var(--on-surface-variant);">
              <span class="material-symbols-outlined" style="font-size: 48px; display: block; margin-bottom: var(--space-4);">work_off</span>
              <p style="font-size: var(--text-base);">No tienes proyectos activos</p>
              <p style="font-size: var(--text-sm); margin-top: var(--space-2);">Explora las oportunidades disponibles para postularte</p>
            </div>
          ` : projects.map(p => projectCard(p)).join('')}
        </div>
      </div>
    `;
  }

  function kpiCard(icon, label, value, subtitle) {
    return `
      <div style="background: linear-gradient(135deg, var(--surface-container) 0%, color-mix(in srgb, var(--primary) 4%, var(--surface-container)) 100%); border-radius: var(--radius-lg); padding: var(--space-5);">
        <div style="font-size: var(--text-xs); color: var(--on-surface-variant); text-transform: uppercase; font-family: var(--font-mono); margin-bottom: var(--space-2); display: flex; align-items: center; gap: var(--space-2);">
          <span class="material-symbols-outlined" style="font-size: 16px; color: var(--primary);">${icon}</span>
          ${escapeHtml(label)}
        </div>
        <div style="font-size: var(--text-2xl); font-weight: 800; color: white; margin-bottom: var(--space-1);">${escapeHtml(value)}</div>
        <div style="font-size: 10px; color: var(--on-surface-variant);">${subtitle}</div>
      </div>
    `;
  }

  function projectCard(p) {
    const statusColors = { activo: 'var(--success)', pausado: 'var(--warning)', completado: 'var(--primary)' };
    const statusColor = statusColors[p.status] || 'var(--on-surface-variant)';

    return `
      <div style="background: var(--surface-container); border-radius: var(--radius-lg); padding: var(--space-5);">
        <div style="display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: var(--space-4);">
          <div>
            <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-2);">
              <h3 style="font-size: var(--text-lg); font-weight: 700; color: white;">${escapeHtml(p.title)}</h3>
              <span style="font-size: 10px; color: ${statusColor}; background: color-mix(in srgb, ${statusColor} 15%, transparent); padding: 2px var(--space-2); border-radius: var(--radius-full); text-transform: uppercase; font-weight: 600;">${escapeHtml(p.status)}</span>
            </div>
            <div style="display: flex; align-items: center; gap: var(--space-3); font-size: var(--text-xs); color: var(--on-surface-variant);">
              <span style="background: var(--primary-alpha-10); color: var(--primary); padding: 2px var(--space-2); border-radius: var(--radius-sm); font-family: var(--font-mono);">${escapeHtml(p.buName)}</span>
              <span>Rol: <strong style="color: white;">${escapeHtml(p.role)}</strong></span>
              <span>${p.hoursWeek}h/sem</span>
              <span>${p.teamSize} miembros</span>
            </div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: var(--text-2xl); font-weight: 800; color: var(--primary);">${p.progress}%</div>
          </div>
        </div>

        <div style="height: 6px; background: var(--surface-low); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--space-4);">
          <div style="height: 100%; width: ${p.progress}%; background: linear-gradient(90deg, var(--primary), var(--primary-container)); border-radius: var(--radius-full); transition: width 0.5s ease;"></div>
        </div>

        <div style="display: flex; align-items: center; justify-content: space-between;">
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
            ${p.skills.map(s => `<span style="font-size: var(--text-xs); background: var(--surface-low); color: var(--on-surface-variant); padding: 2px var(--space-2); border-radius: var(--radius-sm);">${escapeHtml(s)}</span>`).join('')}
          </div>
          <div style="font-size: 10px; color: var(--on-surface-variant); text-align: right;">
            <span class="material-symbols-outlined" style="font-size: 12px; vertical-align: middle;">event</span>
            Próximo: ${escapeHtml(p.nextMilestone || '—')} · ${p.nextMilestoneDate || '—'}
          </div>
        </div>

        <div style="margin-top: var(--space-3); padding-top: var(--space-3); border-top: 1px solid var(--outline-alpha-10); display: flex; align-items: center; gap: var(--space-2); font-size: var(--text-xs); color: var(--on-surface-variant);">
          <span class="material-symbols-outlined" style="font-size: 14px; color: var(--primary);">badge</span>
          Manager: <span style="color: white;">${escapeHtml(p.managerName)}</span>
          <span style="margin-left: var(--space-2);">Inicio: ${p.startDate} → ${p.endDate}</span>
        </div>
      </div>
    `;
  }

  function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
  }

  loadData();

  return () => {};
}
