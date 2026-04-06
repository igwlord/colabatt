/**
 * app.js — Application Entry Point
 * Initializes layouts, registers routes, and starts the router.
 */

// ── Mock API (DEV ONLY — remove for production) ──
import './mock/mock-routes.js';

import { renderTopNav } from './layouts/top-nav.js';
import { renderSideNav } from './layouts/side-nav.js';
import { route, resolve } from './router.js';
import { appStore } from './store.js';
import './error-handler.js';
import { initCopilot } from './components/ui/copilot-panel.js';

// ── Route Registration ──

// Technician routes
route('/tecnico/dashboard', (container, ctx) => {
  return import('./pages/dashboard.js').then((m) => m.Dashboard(container, ctx));
}, {
  title: 'Dashboard',
  guard: (user) => ['technician', 'manager', 'admin'].includes(user?.role),
});

route('/tecnico/oportunidades', (container, ctx) => {
  return import('./pages/tech-dashboard.js').then((m) => m.TechDashboard(container, ctx));
}, {
  title: 'Oportunidades',
  guard: (user) => ['technician', 'manager', 'admin'].includes(user?.role),
});

// Manager routes
route('/manager/nueva-necesidad', (container, ctx) => {
  return import('./pages/publish-need.js').then((m) => m.PublishNeed(container, ctx));
}, {
  title: 'Publicar Necesidad',
  guard: (user) => ['manager', 'admin'].includes(user?.role),
});

route('/manager/equipo/:projectId', (container, ctx) => {
  return import('./pages/team-management.js').then((m) => m.TeamManagement(container, ctx));
}, {
  title: 'Gesti\u00f3n de Equipo',
  guard: (user) => ['manager', 'admin'].includes(user?.role),
});

// Shared routes
route('/equipo/:teamId', (container, ctx) => {
  return import('./pages/team-display.js').then((m) => m.TeamDisplay(container, ctx));
}, {
  title: 'Equipo',
});

route('/proyecto/:projectId/dependencias', (container, ctx) => {
  return import('./pages/dependencies.js').then((m) => m.Dependencies(container, ctx));
}, {
  title: 'Dependencias',
  guard: (user) => ['manager', 'admin'].includes(user?.role),
});

route('/tecnico/mis-proyectos', (container, ctx) => {
  return import('./pages/mis-proyectos.js').then((m) => m.MisProyectos(container, ctx));
}, {
  title: 'Mis Proyectos',
  guard: (user) => ['technician', 'manager', 'admin'].includes(user?.role),
});

route('/tecnico/notificaciones', (container, ctx) => {
  return import('./pages/notificaciones.js').then((m) => m.Notificaciones(container, ctx));
}, {
  title: 'Notificaciones',
  guard: (user) => ['technician', 'manager', 'admin'].includes(user?.role),
});

route('/tecnico/skills', (container, ctx) => {
  return import('./pages/skills-matrix.js').then((m) => m.SkillsMatrix(container, ctx));
}, {
  title: 'Skills Matrix',
  guard: (user) => ['technician', 'manager', 'admin'].includes(user?.role),
});

// Manager routes (stub pages)
route('/manager/dashboard', (container, ctx) => {
  return import('./pages/manager-dashboard.js').then((m) => m.ManagerDashboard(container, ctx));
}, {
  title: 'Manager Dashboard',
  guard: (user) => ['manager', 'admin'].includes(user?.role),
});

route('/manager/planificacion', (container, ctx) => {
  return import('./pages/planificacion.js').then((m) => m.Planificacion(container, ctx));
}, {
  title: 'Planificación',
  guard: (user) => ['manager', 'admin'].includes(user?.role),
});

route('/manager/analytics', (container, ctx) => {
  return import('./pages/analytics.js').then((m) => m.Analytics(container, ctx));
}, {
  title: 'Team Analytics',
  guard: (user) => ['manager', 'admin'].includes(user?.role),
});

// Default route redirect
route('/', () => {
  const { navigate } = window.__router;
  navigate('/tecnico/dashboard');
});

// ── Initialize App ──

function init() {
  // Render layouts
  const topNav = document.getElementById('top-nav');
  const sideNav = document.getElementById('side-nav');

  if (topNav) renderTopNav(topNav);
  if (sideNav) renderSideNav(sideNav);

  // Initialize CoLab Copilot AI Assistant
  initCopilot();

  // Start router
  resolve();
}

// Wait for DOM
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
