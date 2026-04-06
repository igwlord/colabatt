import { ComingSoonPage } from './coming-soon.js';

export function Planificacion(container, ctx) {
  return ComingSoonPage(container, {
    title: 'Planificaci\u00f3n',
    subtitle: 'Calendario y asignaci\u00f3n de recursos',
    icon: 'event_available',
    breadcrumbs: [
      { label: 'Manager', href: null },
      { label: 'Planificaci\u00f3n', active: true },
    ],
  });
}
