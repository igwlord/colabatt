/**
 * mock-routes.js — Register all mock API endpoints
 * ┌─────────────────────────────────────────────────┐
 * │  DEV ONLY — Remove this module for production.  │
 * └─────────────────────────────────────────────────┘
 */

import { mockRoute } from './mock-api.js';
import { opportunities, filterOptions } from './opportunities.js';
import { teamMembers, vacancies, teamFilterOptions } from './team-members.js';
import { dependencies, criticalPathItems, alertData } from './dependencies.js';
import { techKpis, teamKpis, depsKpis } from './kpis.js';

// ── Auth ──
mockRoute('GET', '/auth/session', () => ({
  data: {
    id: 'tech-001',
    name: 'Carlos Mendoza',
    role: 'technician',
    bu: 'BU-14',
    avatarUrl: null,
    availableHours: 12,
    status: 'free',
  },
  status: 200,
}));

// ── Opportunities ──
mockRoute('GET', '/opportunities', ({ query }) => {
  let data = [...opportunities];
  if (query.category && query.category !== 'all') {
    data = data.filter((o) => o.category === query.category);
  }
  if (query.search) {
    const q = query.search.toLowerCase();
    data = data.filter((o) =>
      o.title.toLowerCase().includes(q) ||
      o.bu.toLowerCase().includes(q) ||
      o.buName?.toLowerCase().includes(q) ||
      o.skills.some((s) => s.toLowerCase().includes(q))
    );
  }
  return { data: { items: data, filters: filterOptions }, status: 200 };
});

// ── KPIs ──
mockRoute('GET', '/kpis/tech', () => ({ data: techKpis, status: 200 }));
mockRoute('GET', '/kpis/team', () => ({ data: teamKpis, status: 200 }));
mockRoute('GET', '/kpis/deps', () => ({ data: depsKpis, status: 200 }));

// ── Team ──
mockRoute('GET', '/team/:projectId/members', () => ({
  data: { members: teamMembers, vacancies, filters: teamFilterOptions },
  status: 200,
}));

// ── Dependencies ──
mockRoute('GET', '/projects/:projectId/dependencies', () => ({
  data: { items: dependencies, criticalPath: criticalPathItems, alert: alertData },
  status: 200,
}));

// ── POST: Publish Need ──
mockRoute('POST', '/needs', ({ body }) => ({
  data: { id: 'need-' + Date.now(), ...body, createdAt: new Date().toISOString() },
  status: 201,
}));

// ── POST: Apply to Opportunity ──
mockRoute('POST', '/applications', ({ body }) => ({
  data: { id: 'app-' + Date.now(), ...body, status: 'pending' },
  status: 201,
}));

// ── Notifications ──
mockRoute('GET', '/notifications', () => ({
  data: [
    {
      id: 'notif-001',
      type: 'proyecto_confirmado',
      title: 'Postulaci\u00f3n aceptada',
      body: 'Tu postulaci\u00f3n a "Auditor\u00eda Seguridad Perimetral" fue aceptada. Ya puedes unirte al equipo.',
      icon: 'check_circle',
      time: 'Hace 2 horas',
      read: false,
      linkTo: '/tecnico/mis-proyectos',
      date: '2026-03-29',
    },
    {
      id: 'notif-002',
      type: 'postulacion_recibida',
      title: 'Nueva postulaci\u00f3n recibida',
      body: 'Mar\u00eda L\u00f3pez se postul\u00f3 a tu proyecto "Soporte Migraci\u00f3n 5G". Revisa su perfil.',
      icon: 'person_add',
      time: 'Hace 4 horas',
      read: false,
      linkTo: '/tecnico/oportunidades',
      date: '2026-03-29',
    },
    {
      id: 'notif-003',
      type: 'match_sugerido',
      title: 'Nuevas oportunidades para ti',
      body: 'CoLab Copilot encontr\u00f3 3 oportunidades que coinciden con tu perfil de Cloud & Seguridad.',
      icon: 'auto_awesome',
      time: 'Hace 6 horas',
      read: false,
      linkTo: '/tecnico/oportunidades',
      date: '2026-03-29',
    },
    {
      id: 'notif-004',
      type: 'proyecto_actualizado',
      title: 'Actualizaci\u00f3n de proyecto',
      body: 'Se actualiz\u00f3 el timeline del proyecto "Optimizaci\u00f3n Cloud Azure". Nueva fecha de inicio: 15 abril.',
      icon: 'update',
      time: 'Ayer',
      read: true,
      linkTo: '/tecnico/mis-proyectos',
      date: '2026-03-28',
    },
    {
      id: 'notif-005',
      type: 'curso_completado',
      title: 'Curso PLE completado',
      body: 'Completaste "Linux Administration & Automation con Ansible" con un score de 88%. \u00a1Felicitaciones!',
      icon: 'school',
      time: 'Ayer',
      read: true,
      linkTo: '/tecnico/skills',
      date: '2026-03-28',
    },
    {
      id: 'notif-006',
      type: 'growth_reminder',
      title: 'Recordatorio Growth Path',
      body: 'Tu Growth Path 2026 est\u00e1 al 42%. Tienes 3 cursos pendientes. \u00a1Segu\u00ed avanzando!',
      icon: 'route',
      time: 'Hace 3 d\u00edas',
      read: true,
      linkTo: '/tecnico/skills',
      date: '2026-03-26',
    },
  ],
  status: 200,
}));

mockRoute('PATCH', '/notifications/mark-read', () => ({
  data: { success: true },
  status: 200,
}));

// ── Dashboard ──
mockRoute('GET', '/dashboard', () => ({
  data: {
    kpis: [
      { title: 'Oportunidades para ti', value: '14', icon: 'work', trend: '+3 nuevas hoy', accentColor: 'primary' },
      { title: 'Proyectos activos', value: '2', icon: 'folder_open', trend: 'BU-01, BU-14', accentColor: 'secondary' },
      { title: 'Growth Path', value: '42%', icon: 'route', trend: '2/5 cursos completos', accentColor: 'warning' },
      { title: 'Horas disponibles', value: '12h', icon: 'schedule', trend: 'de 20h/sem', accentColor: 'success' },
    ],
    topOpportunities: [
      { id: 'opp-001', title: 'Soporte Migraci\u00f3n 5G', buName: 'Operaciones de Red', skills: ['Redes', '5G', 'Linux'], hoursPerWeek: 8, match: 96, priority: 'urgente' },
      { id: 'opp-003', title: 'Optimizaci\u00f3n Cloud Azure', buName: 'Sistemas Cloud', skills: ['Azure', 'DevOps'], hoursPerWeek: 10, match: 88, priority: 'critico' },
      { id: 'opp-006', title: 'Hardening Servidores Linux', buName: 'Infraestructura & Plataformas', skills: ['Linux', 'Security', 'Ansible'], hoursPerWeek: 5, match: 82, priority: 'normal' },
    ],
    activeProjects: [
      { id: 'proj-001', title: 'Soporte Migraci\u00f3n 5G', buName: 'Operaciones de Red', progress: 65, role: 'Colaborador', nextMilestone: 'Migraci\u00f3n nodos zona sureste', nextMilestoneDate: '2026-04-15' },
      { id: 'proj-002', title: 'Auditor\u00eda Seguridad Perimetral', buName: 'Ciberseguridad', progress: 30, role: 'Lead t\u00e9cnico', nextMilestone: 'Informe preliminar', nextMilestoneDate: '2026-04-01' },
    ],
    recentActivity: [
      { icon: 'check_circle', color: 'var(--success)', title: 'Postulaci\u00f3n aceptada', body: 'Auditor\u00eda Seguridad Perimetral', time: 'Hace 2h' },
      { icon: 'person_add', color: 'var(--primary)', title: 'Nueva postulaci\u00f3n', body: 'Mar\u00eda L\u00f3pez en Soporte 5G', time: 'Hace 4h' },
      { icon: 'auto_awesome', color: 'var(--warning)', title: 'Copilot match', body: '3 oportunidades para tu perfil', time: 'Hace 6h' },
      { icon: 'school', color: 'var(--tertiary)', title: 'Curso completado', body: 'Linux & Ansible — Score: 88%', time: 'Ayer' },
    ],
    copilotInsight: {
      title: 'Recomendaci\u00f3n de Copilot',
      body: 'Con tu experiencia en Redes y 5G, la oportunidad "Soporte Migraci\u00f3n 5G" tiene un match de 96%. Adem\u00e1s, completar el curso de DevOps en PLE desbloquear\u00eda 3 oportunidades adicionales.',
      action: 'Ver oportunidad',
      actionLink: '/tecnico/oportunidades',
    },
  },
  status: 200,
}));

// ── Projects ──
mockRoute('GET', '/projects', () => ({
  data: [
    {
      id: 'proj-001',
      title: 'Soporte Migración 5G',
      bu: 'BU-01',
      buName: 'Operaciones de Red',
      role: 'Colaborador',
      status: 'activo',
      progress: 65,
      startDate: '2026-03-01',
      endDate: '2026-06-30',
      hoursWeek: 8,
      teamSize: 4,
      managerName: 'Jorge Ramírez',
      managerEmail: 'jorge.ramirez@att.com',
      skills: ['Redes', '5G', 'Linux'],
      nextMilestone: 'Migración nodos zona sureste',
      nextMilestoneDate: '2026-04-15',
    },
    {
      id: 'proj-002',
      title: 'Auditoría Seguridad Perimetral',
      bu: 'BU-14',
      buName: 'Ciberseguridad',
      role: 'Lead técnico',
      status: 'activo',
      progress: 30,
      startDate: '2026-03-15',
      endDate: '2026-05-15',
      hoursWeek: 4,
      teamSize: 2,
      managerName: 'Patricia Vega',
      managerEmail: 'patricia.vega@att.com',
      skills: ['Ciberseguridad', 'Firewalls'],
      nextMilestone: 'Informe preliminar de vulnerabilidades',
      nextMilestoneDate: '2026-04-01',
    },
  ],
  status: 200,
}));
