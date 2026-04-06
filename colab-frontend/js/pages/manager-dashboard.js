import { ComingSoonPage } from './coming-soon.js';

export function ManagerDashboard(container, ctx) {
  return ComingSoonPage(container, {
    title: 'Manager Dashboard',
    subtitle: 'Vista consolidada de proyectos y recursos',
    icon: 'dashboard',
    breadcrumbs: [
      { label: 'Manager', href: null },
      { label: 'Dashboard', active: true },
    ],
  });
}
