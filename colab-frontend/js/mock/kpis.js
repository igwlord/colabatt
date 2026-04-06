/**
 * Mock KPI data
 */

export const techKpis = [
  { title: 'Oportunidades para vos', value: '14', trend: '+3 hoy', accentColor: 'primary' },
  { title: 'Colaboraciones activas', value: '2', trend: 'BU-04, BU-07', accentColor: 'secondary' },
  { title: 'Horas libres p/semana', value: '12', trend: 'Capacidad 60%', accentColor: 'success' },
];

export const teamKpis = [
  { title: 'Total Equipo', value: '12', icon: 'groups', trend: '+2 este mes', accentColor: 'primary' },
  { title: 'Disponibilidad Alta', value: '4', icon: 'speed', trend: 'Carga < 40%', accentColor: 'success' },
  { title: 'Cross-BU', value: '2', icon: 'hub', subtitle: 'Recursos compartidos', accentColor: 'secondary' },
  { title: 'Vacantes', value: '3', icon: 'work_history', trend: 'Prioridad cr\u00edtica', accentColor: 'error' },
];

export const depsKpis = [
  { title: 'Total Tasks', value: '1,248', icon: 'inventory_2', trend: '+12%', subtitle: 'vs last month', accentColor: 'primary' },
  { title: 'In Progress', value: '452', icon: 'pending_actions', trend: '36%', subtitle: 'of total capacity', accentColor: 'warning' },
  { title: 'Completed', value: '764', icon: 'check_circle', trend: '61%', subtitle: 'completion rate', accentColor: 'success' },
  { title: 'Delayed', value: '32', icon: 'timer_off', trend: '+4', subtitle: 'since yesterday', accentColor: 'error' },
];
