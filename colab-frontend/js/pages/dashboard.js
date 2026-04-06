/**
 * dashboard.js — Technician Dashboard Home
 * /tecnico/dashboard
 */
import { appStore } from '../store.js';
import { api } from '../api.js';
import { navigate } from '../router.js';
import { SkeletonLoader, ErrorState } from '../error-handler.js';

export function Dashboard(container, ctx) {
  let data = null;

  container.innerHTML = SkeletonLoader('dashboard');

  async function loadData() {
    try {
      data = await api.get('/dashboard');
    } catch (err) {
      if (err?.name !== 'AbortError') {
        container.innerHTML = ErrorState('No se pudo cargar el dashboard. Intenta de nuevo.');
        return;
      }
    }
    render();
  }

  function render() {
    if (!data) return;
    const user = appStore.get('user');
    const hour = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos d\u00edas' : hour < 18 ? 'Buenas tardes' : 'Buenas noches';

    const statusColor = user.status === 'free' ? 'var(--success)' : user.status === 'partial' ? 'var(--warning)' : 'var(--error)';
    const statusLabel = user.status === 'free' ? 'Disponible' : user.status === 'partial' ? 'Parcial' : 'Ocupado';

    container.innerHTML = `
      <div style="padding: 0;">

        <!-- Welcome -->
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-8);">
          <div>
            <p style="font-size: var(--text-xs); font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant); margin-bottom: var(--space-1);">${esc(greeting)}, ${esc(user.name.split(' ')[0])}</p>
            <h1 style="font-size: var(--text-3xl); font-weight: 800; color: white;">Dashboard</h1>
          </div>
          <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-2) var(--space-4); background: var(--surface-container); border-radius: var(--radius-lg);">
            <span style="width: 8px; height: 8px; border-radius: 50%; background: ${statusColor};"></span>
            <span style="font-size: var(--text-xs); font-weight: 600; color: ${statusColor}; font-family: var(--font-mono); text-transform: uppercase;">${esc(statusLabel)}</span>
            <span style="color: var(--outline-alpha-20);">|</span>
            <span style="font-size: var(--text-xs); font-family: var(--font-mono); color: var(--on-surface-variant);"><span style="color: white; font-weight: 700;">${user.availableHours}h</span>/sem</span>
          </div>
        </div>

        <!-- KPIs -->
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: var(--space-4); margin-bottom: var(--space-8);">
          ${(data.kpis || []).map(k => kpiCard(k)).join('')}
        </div>

        <!-- Two columns: Projects + Activity -->
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-6); margin-bottom: var(--space-8);">

          <!-- Active Projects -->
          <div style="background: var(--surface-container); border-radius: var(--radius-lg); padding: var(--space-5);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-5);">
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <span class="material-symbols-outlined" style="font-size: 18px; color: var(--primary);">folder_open</span>
                <h3 style="font-size: var(--text-sm); font-weight: 700; color: white;">Proyectos Activos</h3>
              </div>
              <button data-action="go" data-link="/tecnico/mis-proyectos" style="font-size: 10px; color: var(--primary); background: none; border: none; cursor: pointer; font-family: var(--font-mono); text-transform: uppercase;">Ver todos →</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-4);">
              ${!data.activeProjects?.length
                ? `<p style="color:var(--on-surface-variant);font-size:var(--text-sm);padding:var(--space-4);">Sin proyectos activos</p>`
                : data.activeProjects.map(p => projectMini(p)).join('')}
            </div>
          </div>

          <!-- Recent Activity -->
          <div style="background: var(--surface-container); border-radius: var(--radius-lg); padding: var(--space-5);">
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-5);">
              <div style="display: flex; align-items: center; gap: var(--space-2);">
                <span class="material-symbols-outlined" style="font-size: 18px; color: var(--primary);">notifications</span>
                <h3 style="font-size: var(--text-sm); font-weight: 700; color: white;">Actividad Reciente</h3>
              </div>
              <button data-action="go" data-link="/tecnico/notificaciones" style="font-size: 10px; color: var(--primary); background: none; border: none; cursor: pointer; font-family: var(--font-mono); text-transform: uppercase;">Ver todas →</button>
            </div>
            <div style="display: flex; flex-direction: column; gap: var(--space-3);">
              ${!data.recentActivity?.length
                ? `<p style="color:var(--on-surface-variant);font-size:var(--text-sm);padding:var(--space-4);">Sin actividad reciente</p>`
                : data.recentActivity.map(a => activityItem(a)).join('')}
            </div>
          </div>
        </div>

        <!-- Copilot Insight -->
        <div style="background: linear-gradient(135deg, color-mix(in srgb, var(--primary) 8%, var(--surface-container)) 0%, color-mix(in srgb, var(--primary) 2%, var(--surface-container)) 100%); border-radius: var(--radius-lg); padding: var(--space-5); margin-bottom: var(--space-8); display: flex; align-items: flex-start; gap: var(--space-4);">
          <div style="width: 40px; height: 40px; border-radius: var(--radius-md); background: linear-gradient(135deg, var(--primary) 0%, var(--primary-container) 100%); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
            <img src="img/copilot.svg" alt="" style="width: 22px; height: 22px;" />
          </div>
          <div style="flex: 1;">
            <div style="display: flex; align-items: center; gap: var(--space-2); margin-bottom: var(--space-2);">
              <span style="font-size: var(--text-sm); font-weight: 700; color: white;">${esc(data.copilotInsight.title)}</span>
              <span style="font-size: 9px; background: var(--primary); color: var(--on-primary); padding: 1px 6px; border-radius: var(--radius-full); font-weight: 700;">AI</span>
            </div>
            <p style="font-size: var(--text-xs); color: var(--on-surface-variant); line-height: 1.6; margin-bottom: var(--space-3);">${esc(data.copilotInsight.body)}</p>
            <button data-action="go" data-link="${data.copilotInsight.actionLink}" style="font-size: var(--text-xs); color: var(--primary); background: color-mix(in srgb, var(--primary) 10%, transparent); border: none; padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); cursor: pointer; font-weight: 600;">${esc(data.copilotInsight.action)}</button>
          </div>
        </div>

        <!-- Top Opportunities -->
        <div>
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-5);">
            <div style="display: flex; align-items: center; gap: var(--space-2);">
              <span class="material-symbols-outlined" style="font-size: 18px; color: var(--primary);">auto_awesome</span>
              <h3 style="font-size: var(--text-sm); font-weight: 700; color: white;">Oportunidades Recomendadas</h3>
            </div>
            <button data-action="go" data-link="/tecnico/oportunidades" style="font-size: 10px; color: var(--primary); background: none; border: none; cursor: pointer; font-family: var(--font-mono); text-transform: uppercase;">Ver todas →</button>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4);">
            ${data.topOpportunities.map(o => opportunityMini(o)).join('')}
          </div>
        </div>
      </div>
    `;
  }

  function kpiCard(k) {
    const colors = { primary: 'var(--primary)', secondary: 'var(--secondary)', success: 'var(--success)', warning: 'var(--warning)', error: 'var(--error)' };
    const color = colors[k.accentColor] || 'var(--primary)';
    return `
      <div style="background: linear-gradient(135deg, color-mix(in srgb, ${color} 8%, var(--surface-low)) 0%, var(--surface-low) 100%); border-radius: var(--radius-lg); padding: var(--space-5);">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
          <span style="font-size: 10px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant);">${esc(k.title)}</span>
          <span class="material-symbols-outlined" style="font-size: 18px; color: ${color}; font-variation-settings: 'FILL' 1;">${k.icon}</span>
        </div>
        <div style="font-size: var(--text-2xl); font-weight: 800; color: white; margin-bottom: var(--space-1);">${esc(k.value)}</div>
        <div style="font-size: 10px; color: ${color};">${esc(k.trend)}</div>
      </div>
    `;
  }

  function projectMini(p) {
    return `
      <div data-action="go" data-link="/tecnico/mis-proyectos" style="padding: var(--space-3); background: var(--surface-low); border-radius: var(--radius-md); cursor: pointer; transition: background var(--ease-fast);" onmouseover="this.style.background='var(--surface-high)'" onmouseout="this.style.background='var(--surface-low)'">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-2);">
          <span style="font-size: var(--text-sm); font-weight: 600; color: white;">${esc(p.title)}</span>
          <span style="font-size: var(--text-sm); font-weight: 800; color: var(--primary);">${p.progress}%</span>
        </div>
        <div style="height: 4px; background: var(--surface-lowest); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--space-2);">
          <div style="height: 100%; width: ${p.progress}%; background: linear-gradient(90deg, var(--primary), var(--primary-container)); border-radius: var(--radius-full);"></div>
        </div>
        <div style="display: flex; align-items: center; justify-content: space-between; font-size: 10px; color: var(--on-surface-variant);">
          <span>${esc(p.buName)} · ${esc(p.role)}</span>
          <span>${esc(p.nextMilestoneDate)}</span>
        </div>
      </div>
    `;
  }

  function activityItem(a) {
    return `
      <div style="display: flex; align-items: flex-start; gap: var(--space-3); padding: var(--space-2) 0;">
        <div style="width: 32px; height: 32px; border-radius: var(--radius-md); background: color-mix(in srgb, ${a.color} 12%, transparent); display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
          <span class="material-symbols-outlined" style="font-size: 16px; color: ${a.color}; font-variation-settings: 'FILL' 1;">${a.icon}</span>
        </div>
        <div style="flex: 1; min-width: 0;">
          <span style="font-size: var(--text-xs); font-weight: 600; color: white;">${esc(a.title)}</span>
          <p style="font-size: 10px; color: var(--on-surface-variant); margin-top: 1px;">${esc(a.body)}</p>
        </div>
        <span style="font-size: 10px; color: var(--on-surface-variant); flex-shrink: 0;">${esc(a.time)}</span>
      </div>
    `;
  }

  function opportunityMini(o) {
    const priorityColors = { urgente: 'var(--warning)', critico: 'var(--error)', normal: 'var(--on-surface-variant)' };
    const pColor = priorityColors[o.priority] || 'var(--on-surface-variant)';
    return `
      <div data-action="go-opp" data-id="${o.id}" style="background: var(--surface-container); border-radius: var(--radius-lg); padding: var(--space-5); cursor: pointer; transition: background var(--ease-fast);" onmouseover="this.style.background='var(--surface-high)'" onmouseout="this.style.background='var(--surface-container)'">
        <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: var(--space-3);">
          <span style="font-size: 10px; color: ${pColor}; text-transform: uppercase; font-weight: 700; font-family: var(--font-mono);">${esc(o.priority)}</span>
          <span style="font-size: var(--text-xs); font-weight: 800; color: var(--primary);">${o.match}% match</span>
        </div>
        <h4 style="font-size: var(--text-sm); font-weight: 700; color: white; margin-bottom: var(--space-2);">${esc(o.title)}</h4>
        <p style="font-size: 10px; color: var(--on-surface-variant); margin-bottom: var(--space-3);">${esc(o.buName)} · ${o.hoursPerWeek}h/sem</p>
        <div style="display: flex; flex-wrap: wrap; gap: var(--space-1);">
          ${o.skills.map(s => `<span style="font-size: 10px; background: var(--surface-low); color: var(--on-surface-variant); padding: 2px var(--space-2); border-radius: var(--radius-sm);">${esc(s)}</span>`).join('')}
        </div>
      </div>
    `;
  }

  function esc(str) {
    if (!str) return '';
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function handleClick(e) {
    const el = e.target.closest('[data-action]');
    if (!el) return;

    if (el.dataset.action === 'go' && el.dataset.link) {
      navigate(el.dataset.link);
    }
    if (el.dataset.action === 'go-opp') {
      navigate('/tecnico/oportunidades');
    }
  }

  container.addEventListener('click', handleClick);
  loadData();

  return () => {
    container.removeEventListener('click', handleClick);
  };
}
