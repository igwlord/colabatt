/**
 * skills-matrix.js — Skills Matrix Page with PLE & Growth Integration
 * /tecnico/skills
 */

import { html, raw } from '../utils/safe-html.js';
import { appStore } from '../store.js';
import { pleCourses, findCoursesBySkill } from '../mock/ple-courses.js';
import { getEnrichedGrowthPath, userSkillsFromGrowth, getSkillStatus } from '../mock/growth-paths.js';

/**
 * @param {HTMLElement} container
 * @param {Object} ctx
 * @returns {function(): void} cleanup
 */
export function SkillsMatrix(container, ctx) {
  const user = appStore.get('user');
  const userId = user.id;
  const growthPath = getEnrichedGrowthPath(userId);
  const skillData = userSkillsFromGrowth[userId];

  // All skills the user interacts with
  const allSkills = [
    ...(skillData?.acquired || []),
    ...(skillData?.inProgress || []),
    ...(skillData?.planned || []),
  ];

  // Market-demand skills (from opportunities) that user doesn't have
  const demandSkills = ['Azure', 'DevOps', 'Kubernetes', 'SD-WAN', 'BGP', 'Cisco IOS', 'Firewalls', 'Automation'];
  const gapSkills = demandSkills.filter(s => {
    const status = getSkillStatus(userId, s);
    return status === 'gap';
  });

  container.innerHTML = buildPage(user, growthPath, skillData, allSkills, gapSkills);

  function handleClick(e) {
    const actionEl = e.target.closest('[data-action]');
    if (!actionEl) return;

    if (actionEl.dataset.action === 'toggle-courses') {
      const skill = actionEl.dataset.skill;
      const panel = container.querySelector(`[data-courses-for="${skill}"]`);
      if (panel) {
        const isHidden = panel.style.display === 'none';
        panel.style.display = isHidden ? 'flex' : 'none';
        actionEl.querySelector('.material-symbols-outlined').textContent = isHidden ? 'expand_less' : 'expand_more';
      }
    }
  }

  container.addEventListener('click', handleClick);

  return () => {
    container.removeEventListener('click', handleClick);
  };
}

function buildPage(user, growthPath, skillData, allSkills, gapSkills) {
  return `
    <div style="padding: 0;">
      <nav style="display: flex; gap: var(--space-2); font-size: 10px; font-family: var(--font-mono); text-transform: uppercase; letter-spacing: 0.1em; color: var(--on-surface-variant); margin-bottom: var(--space-2);">
        <span>DASHBOARD</span> / <span>TÉCNICO</span> / <span style="color: var(--primary);">SKILLS MATRIX</span>
      </nav>
      <h1 style="font-size: var(--text-3xl); font-weight: 800; color: white; margin-bottom: var(--space-6);">Skills Matrix</h1>

      ${buildGrowthPathSection(growthPath)}
      ${buildSkillsOverview(user.id, skillData)}
      ${buildRecommendedCourses(user.id, gapSkills)}
    </div>
  `;
}

function buildGrowthPathSection(path) {
  if (!path) return '';

  const completedCount = path.courses.filter(c => c.status === 'completed').length;
  const totalCount = path.courses.length;

  return `
    <div style="margin-bottom: var(--space-6);">
      <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
        <span class="material-symbols-outlined" style="font-size: 24px; color: var(--primary);">route</span>
        <h2 style="font-size: var(--text-xl); font-weight: 700; color: white;">Mi Growth Path ${path.year}</h2>
        <span style="background: color-mix(in srgb, var(--success) 15%, transparent); color: var(--success); font-size: 10px; font-family: var(--font-mono); padding: 2px var(--space-2); border-radius: var(--radius-full); text-transform: uppercase;">Aprobado por manager</span>
      </div>

      <div style="background: var(--surface-container); border-radius: var(--radius-lg); padding: var(--space-5); border: 1px solid var(--outline-alpha-10);">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: var(--space-4);">
          <div>
            <div style="font-size: var(--text-base); font-weight: 600; color: white;">${escapeHtml(path.pathName)}</div>
            <div style="font-size: var(--text-xs); color: var(--on-surface-variant); margin-top: 2px;">Deadline: ${path.deadline} · Aprobado por ${escapeHtml(path.managerName)}</div>
          </div>
          <div style="text-align: right;">
            <div style="font-size: var(--text-2xl); font-weight: 800; color: var(--primary);">${path.progress}%</div>
            <div style="font-size: 10px; color: var(--on-surface-variant);">${completedCount}/${totalCount} cursos</div>
          </div>
        </div>

        <div style="height: 6px; background: var(--surface-low); border-radius: var(--radius-full); overflow: hidden; margin-bottom: var(--space-4);">
          <div style="height: 100%; width: ${path.progress}%; background: linear-gradient(90deg, var(--primary), var(--primary-container)); border-radius: var(--radius-full); transition: width 0.5s ease;"></div>
        </div>

        <div style="display: flex; flex-direction: column; gap: var(--space-3);">
          ${path.courses.map(c => buildGrowthCourseRow(c)).join('')}
        </div>

        <div style="margin-top: var(--space-4); padding-top: var(--space-3); border-top: 1px solid var(--outline-alpha-10);">
          <div style="font-size: var(--text-xs); color: var(--on-surface-variant);">
            <span class="material-symbols-outlined" style="font-size: 14px; vertical-align: middle; color: var(--primary);">target</span>
            Skills objetivo: ${path.targetSkills.map(s => `<span style="color: var(--primary); font-weight: 500;">${escapeHtml(s)}</span>`).join(', ')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildGrowthCourseRow(courseEntry) {
  const c = courseEntry.course;
  if (!c) return '';

  const statusConfig = {
    'completed': { icon: 'check_circle', color: 'var(--success)', label: 'Completado' },
    'in-progress': { icon: 'play_circle', color: 'var(--primary)', label: 'En progreso' },
    'pending': { icon: 'schedule', color: 'var(--on-surface-variant)', label: 'Pendiente' },
  };
  const st = statusConfig[courseEntry.status] || statusConfig['pending'];

  const scoreHtml = courseEntry.score
    ? `<span style="color: var(--success); font-weight: 600; font-size: var(--text-xs);">${courseEntry.score}%</span>`
    : '';

  const progressHtml = courseEntry.progressPercent
    ? `<div style="width: 60px; height: 4px; background: var(--surface-low); border-radius: var(--radius-full); overflow: hidden;">
        <div style="height: 100%; width: ${courseEntry.progressPercent}%; background: var(--primary); border-radius: var(--radius-full);"></div>
       </div>`
    : '';

  return `
    <div style="display: flex; align-items: center; gap: var(--space-3); padding: var(--space-3); background: var(--surface-low); border-radius: var(--radius-md);">
      <span class="material-symbols-outlined" style="font-size: 18px; color: ${st.color}; font-variation-settings: 'FILL' 1;">${st.icon}</span>
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: var(--text-sm); color: white; font-weight: 500; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(c.title)}</div>
        <div style="font-size: 10px; color: var(--on-surface-variant);">${escapeHtml(c.provider)} · ${c.duration} · ${escapeHtml(c.level)}</div>
      </div>
      ${progressHtml}
      ${scoreHtml}
      <span style="font-size: 10px; color: ${st.color}; white-space: nowrap;">${st.label}</span>
    </div>
  `;
}

function buildSkillsOverview(userId, skillData) {
  if (!skillData) return '';

  const skillBadge = (skill, status) => {
    const configs = {
      'acquired': { bg: 'var(--success)', icon: 'check', label: 'Adquirida' },
      'in-progress': { bg: 'var(--primary)', icon: 'trending_up', label: 'En curso' },
      'planned': { bg: 'var(--warning)', icon: 'schedule', label: 'Planificada' },
    };
    const cfg = configs[status];
    return `
      <div style="display: flex; align-items: center; gap: var(--space-2); padding: var(--space-2) var(--space-3); background: color-mix(in srgb, ${cfg.bg} 12%, transparent); border: 1px solid color-mix(in srgb, ${cfg.bg} 30%, transparent); border-radius: var(--radius-full); font-size: var(--text-xs);">
        <span class="material-symbols-outlined" style="font-size: 14px; color: ${cfg.bg}; font-variation-settings: 'FILL' 1;">${cfg.icon}</span>
        <span style="color: white; font-weight: 500;">${escapeHtml(skill)}</span>
      </div>
    `;
  };

  return `
    <div style="margin-bottom: var(--space-6);">
      <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
        <span class="material-symbols-outlined" style="font-size: 24px; color: var(--primary);">military_tech</span>
        <h2 style="font-size: var(--text-xl); font-weight: 700; color: white;">Mis Skills</h2>
      </div>

      <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: var(--space-4);">
        <div style="background: var(--surface-container); border-radius: var(--radius-lg); padding: var(--space-4); border: 1px solid var(--outline-alpha-10);">
          <div style="font-size: var(--text-xs); color: var(--success); font-family: var(--font-mono); text-transform: uppercase; margin-bottom: var(--space-3);">Adquiridas</div>
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
            ${skillData.acquired.map(s => skillBadge(s, 'acquired')).join('')}
          </div>
        </div>

        <div style="background: var(--surface-container); border-radius: var(--radius-lg); padding: var(--space-4); border: 1px solid var(--outline-alpha-10);">
          <div style="font-size: var(--text-xs); color: var(--primary); font-family: var(--font-mono); text-transform: uppercase; margin-bottom: var(--space-3);">En Curso</div>
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
            ${skillData.inProgress.map(s => skillBadge(s, 'in-progress')).join('')}
          </div>
        </div>

        <div style="background: var(--surface-container); border-radius: var(--radius-lg); padding: var(--space-4); border: 1px solid var(--outline-alpha-10);">
          <div style="font-size: var(--text-xs); color: var(--warning); font-family: var(--font-mono); text-transform: uppercase; margin-bottom: var(--space-3);">Planificadas</div>
          <div style="display: flex; flex-wrap: wrap; gap: var(--space-2);">
            ${skillData.planned.map(s => skillBadge(s, 'planned')).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

function buildRecommendedCourses(userId, gapSkills) {
  // Collect all demand skills that are gaps or in-progress, and find courses
  const recommendSkills = ['Azure', 'DevOps', 'Kubernetes', 'SD-WAN', 'BGP', 'Cisco IOS', 'Firewalls', 'Automation', '5G'];
  const skillsToShow = recommendSkills.filter(s => {
    const status = getSkillStatus(userId, s);
    return status === 'gap' || status === 'in-progress';
  });

  if (!skillsToShow.length) return '';

  return `
    <div style="margin-bottom: var(--space-6);">
      <div style="display: flex; align-items: center; gap: var(--space-3); margin-bottom: var(--space-4);">
        <span class="material-symbols-outlined" style="font-size: 24px; color: var(--primary);">school</span>
        <h2 style="font-size: var(--text-xl); font-weight: 700; color: white;">Cursos Recomendados desde PLE</h2>
        <span style="font-size: var(--text-xs); color: var(--on-surface-variant);">Basados en demanda del marketplace</span>
      </div>

      <div style="display: flex; flex-direction: column; gap: var(--space-3);">
        ${skillsToShow.map(skill => buildSkillCourseBlock(userId, skill)).join('')}
      </div>
    </div>
  `;
}

function buildSkillCourseBlock(userId, skill) {
  const courses = findCoursesBySkill(skill);
  if (!courses.length) return '';

  const status = getSkillStatus(userId, skill);
  const statusLabel = status === 'in-progress' ? 'En curso' : 'Gap — alta demanda';
  const statusColor = status === 'in-progress' ? 'var(--primary)' : 'var(--error)';

  return `
    <div style="background: var(--surface-container); border-radius: var(--radius-lg); border: 1px solid var(--outline-alpha-10); overflow: hidden;">
      <button data-action="toggle-courses" data-skill="${escapeHtml(skill)}" style="width: 100%; display: flex; align-items: center; justify-content: space-between; padding: var(--space-4); background: none; border: none; color: white; cursor: pointer; text-align: left;">
        <div style="display: flex; align-items: center; gap: var(--space-3);">
          <span style="font-size: var(--text-sm); font-weight: 600;">${escapeHtml(skill)}</span>
          <span style="font-size: 10px; color: ${statusColor}; font-family: var(--font-mono); background: color-mix(in srgb, ${statusColor} 12%, transparent); padding: 2px var(--space-2); border-radius: var(--radius-full);">${statusLabel}</span>
          <span style="font-size: var(--text-xs); color: var(--on-surface-variant);">${courses.length} curso${courses.length > 1 ? 's' : ''} disponible${courses.length > 1 ? 's' : ''}</span>
        </div>
        <span class="material-symbols-outlined" style="font-size: 18px; color: var(--on-surface-variant);">expand_more</span>
      </button>
      <div data-courses-for="${escapeHtml(skill)}" style="display: none; padding: 0 var(--space-4) var(--space-4); flex-direction: column; gap: var(--space-2);">
        ${courses.map(c => buildCourseCard(c)).join('')}
      </div>
    </div>
  `;
}

function buildCourseCard(course) {
  const stars = '★'.repeat(Math.round(course.rating)) + '☆'.repeat(5 - Math.round(course.rating));

  return `
    <div style="display: flex; align-items: center; gap: var(--space-4); padding: var(--space-3); background: linear-gradient(90deg, color-mix(in srgb, var(--primary) 8%, var(--surface-low)) 0%, var(--surface-low) 100%); border-radius: var(--radius-md);">
      <div style="flex: 1; min-width: 0;">
        <div style="font-size: var(--text-sm); color: white; font-weight: 500; margin-bottom: 2px;">${escapeHtml(course.title)}</div>
        <div style="font-size: 10px; color: var(--on-surface-variant); display: flex; gap: var(--space-3); flex-wrap: wrap; align-items: center;">
          <span>${escapeHtml(course.provider)}</span>
          <span>·</span>
          <span>${course.duration}</span>
          <span>·</span>
          <span>${escapeHtml(course.level)}</span>
          <span>·</span>
          <span style="color: var(--warning);">${stars} ${course.rating}</span>
        </div>
      </div>
      <div style="text-align: right; flex-shrink: 0;">
        <div style="font-size: var(--text-xs); color: var(--primary); font-weight: 600;">${course.enrolled.toLocaleString()}</div>
        <div style="font-size: 9px; color: var(--on-surface-variant);">inscritos</div>
      </div>
      <div style="flex-shrink: 0;">
        <span style="font-size: 10px; background: color-mix(in srgb, var(--primary) 12%, transparent); color: var(--primary); padding: var(--space-1) var(--space-3); border-radius: var(--radius-full); font-weight: 500; white-space: nowrap;">${escapeHtml(course.format)}</span>
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
