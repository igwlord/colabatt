import { ComingSoonPage } from './coming-soon.js';

export function Analytics(container, ctx) {
  return ComingSoonPage(container, {
    title: 'Team Analytics',
    subtitle: 'Metricas de rendimiento y colaboracion',
    icon: 'analytics',
    breadcrumbs: [
      { label: 'Manager', href: null },
      { label: 'Analytics', active: true },
    ],
  });
}
