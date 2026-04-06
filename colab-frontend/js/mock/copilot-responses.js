/**
 * copilot-responses.js — Mock AI Responses for CoLab Copilot
 * Simulates intelligent responses for demo/CTO presentation.
 */

const RESPONSES = {
  'buscar tecnicos 5g': {
    delay: 1800,
    text: 'Encontr\u00e9 <span class="copilot-msg__highlight">4 t\u00e9cnicos L3+</span> con skills en 5G y disponibilidad &gt;8h/sem:',
    dataCard: [
      { label: 'Carlos Mendoza', value: 'BU-14 \u00b7 12h disp \u00b7 Match 96%' },
      { label: 'Elena Rivas', value: 'BU-09 \u00b7 8h disp \u00b7 Match 91%' },
      { label: 'Javier Portillo', value: 'BU-14 \u00b7 10h disp \u00b7 Match 87%' },
      { label: 'Mar\u00eda L\u00f3pez', value: 'BU-09 \u00b7 6h disp \u00b7 Match 82%' },
    ],
    followUp: '\u00bfQuieres que les env\u00ede una invitaci\u00f3n a postularse?',
  },

  'esta oportunidad es para mi': {
    delay: 2200,
    text: 'Analicé tu perfil vs los requisitos de <span class="copilot-msg__highlight">Soporte Migración 5G</span>:',
    dataCard: [
      { label: 'Match de skills', value: '92% \u2014 3/3 skills coinciden' },
      { label: 'Disponibilidad', value: '12h libres vs 8h requeridas \u2713' },
      { label: 'Nivel', value: 'Senior L3 \u2014 cumple requisito' },
      { label: 'Cross-BU', value: 'Primera colaboraci\u00f3n con BU-01' },
    ],
    followUp: 'Tu perfil es muy fuerte para esta oportunidad. \u00bfQuieres que genere un mensaje de postulaci\u00f3n?',
  },

  'genera mensaje postulacion': {
    delay: 2500,
    text: 'Aqu\u00ed tienes un borrador personalizado basado en tu perfil:',
    dataCard: [
      { label: 'Mensaje sugerido', value: '' },
    ],
    longText: '"Hola Jorge, soy Carlos Mendoza de BU-14 (Ciberseguridad). Tengo 4 a\u00f1os de experiencia en redes 5G y certificaciones en Linux y Cisco. Actualmente tengo 12h/sem disponibles y me interesa contribuir al proyecto de migraci\u00f3n. Mi experiencia en seguridad de red puede aportar valor adicional al equipo."',
    followUp: '\u00bfQuieres que ajuste el tono o agregue algo m\u00e1s?',
  },

  'redacta descripcion necesidad': {
    delay: 2000,
    text: 'Generé una descripci\u00f3n optimizada para atraer candidatos:',
    longText: '"Buscamos un Ingeniero Senior (L3+) con experiencia en migración de infraestructura 5G NR para apoyar en el despliegue de nodos en la regi\u00f3n sureste. El candidato ideal tiene experiencia con Cisco IOS, protocolos de red m\u00f3vil, y automatizaci\u00f3n con Ansible. Ofrecemos flexibilidad h\u00edbrida (Dallas, TX) y un equipo cross-BU din\u00e1mico."',
    followUp: '\u00bfLa publico directamente o prefieres editarla primero?',
  },

  'metricas cross-bu': {
    delay: 1500,
    text: 'Resumen de colaboraciones cross-BU este trimestre:',
    dataCard: [
      { label: 'Colaboraciones activas', value: '38 (+12 vs Q4)' },
      { label: 'T\u00e9cnicos participando', value: '127 de 312 elegibles (41%)' },
      { label: 'BUs m\u00e1s activas', value: 'BU-01, BU-14, BU-09' },
      { label: 'Tiempo promedio match', value: '1.2 d\u00edas (antes: 4.5)' },
      { label: 'Satisfacci\u00f3n', value: '4.7/5.0 \u2605' },
    ],
    followUp: '\u00bfQuieres ver el desglose por BU o la tendencia mensual?',
  },

  'cursos recomendados ple': {
    delay: 2000,
    text: 'Basándome en las oportunidades del marketplace y tus skills actuales, estos cursos de <span class="copilot-msg__highlight">PLE</span> te abren más puertas:',
    dataCard: [
      { label: 'Azure AZ-305', value: 'Microsoft Learn · 35h · ★4.9' },
      { label: 'DevOps on Cloud', value: 'Harvard Online · 28h · ★4.7' },
      { label: 'Kubernetes & Containers', value: 'Linux Foundation · 25h · ★4.8' },
      { label: 'SD-WAN Architecture', value: 'AT&T University · 16h · ★4.7' },
    ],
    followUp: '¿Quieres que agregue alguno a tu Growth Path?',
  },

  'mi progreso growth': {
    delay: 1800,
    text: 'Tu <span class="copilot-msg__highlight">Growth Path 2026</span> "Especialización en Cloud & Seguridad":',
    dataCard: [
      { label: 'Progreso general', value: '42% — 2 de 5 cursos completados' },
      { label: '✅ Cybersecurity Fundamentals', value: 'MIT · Score: 92%' },
      { label: '✅ Linux & Ansible', value: 'Red Hat · Score: 88%' },
      { label: '▶️ Azure AZ-305', value: 'Microsoft · 65% avance' },
      { label: '⏳ DevOps on Cloud', value: 'Harvard · Pendiente' },
      { label: '⏳ Kubernetes', value: 'Linux Foundation · Pendiente' },
    ],
    followUp: '¿Quieres que recalcule tu path basándome en las oportunidades actuales?',
  },

  'que skill me falta': {
    delay: 2200,
    text: 'Analicé tu perfil vs la demanda actual del <span class="copilot-msg__highlight">marketplace</span>:',
    dataCard: [
      { label: '✅ Tienes', value: 'Redes, 5G, Linux, Ciberseg, Ansible' },
      { label: '▶️ En curso', value: 'Azure, Cloud (65% en PLE)' },
      { label: '🎯 Gap crítico', value: 'DevOps, Kubernetes, SD-WAN' },
      { label: 'Oportunidades que desbloqueas', value: '+3 con DevOps, +2 con K8s' },
    ],
    followUp: 'DevOps es tu mejor inversión: 28h en PLE (Harvard) y desbloqueas 3 oportunidades. ¿Lo agrego a tu Growth Path?',
  },

  'default': {
    delay: 1200,
    text: 'Entiendo tu consulta. Como CoLab Copilot, puedo ayudarte con:',
    dataCard: [
      { label: '🔍 Buscar talento', value: '"Busca técnicos con skills en 5G"' },
      { label: '📊 Analizar match', value: '"¿Esta oportunidad es para mí?"' },
      { label: '✍️ Redactar', value: '"Genera mensaje de postulación"' },
      { label: '📈 Métricas', value: '"Métricas cross-BU del trimestre"' },
      { label: '🎓 PLE & Growth', value: '"Cursos recomendados" o "Mi progreso Growth"' },
    ],
    followUp: '¿En qué puedo ayudarte?',
  },
};

const SUGGESTIONS = [
  'Buscar técnicos 5G',
  '¿Esta oportunidad es para mí?',
  'Cursos recomendados PLE',
  'Mi progreso Growth',
  '¿Qué skill me falta?',
  'Métricas cross-BU',
];

/**
 * Find the best matching response for a user query.
 * @param {string} query
 * @returns {{ delay: number, text: string, dataCard?: Array, longText?: string, followUp?: string }}
 */
export function findResponse(query) {
  const q = query.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  for (const [key, response] of Object.entries(RESPONSES)) {
    if (key === 'default') continue;
    const normalizedKey = key.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    // Fuzzy match: check if most words in the key appear in the query
    const keyWords = normalizedKey.split(' ');
    const matchCount = keyWords.filter(w => q.includes(w)).length;
    if (matchCount >= Math.ceil(keyWords.length * 0.5)) {
      return response;
    }
  }

  return RESPONSES['default'];
}

export { SUGGESTIONS };
