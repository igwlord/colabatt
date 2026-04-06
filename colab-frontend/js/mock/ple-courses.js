/**
 * ple-courses.js — Mock PLE (Portal de Learning & Education) Catalog
 * Simulates AT&T's internal learning platform with university partnerships.
 */

export const pleCourses = [
  // ── Networking & 5G ──
  {
    id: 'ple-001',
    title: 'Arquitectura 5G NR — Fundamentos a Avanzado',
    provider: 'Stanford Online',
    category: 'networking',
    skills: ['5G', 'Redes'],
    duration: '40h',
    level: 'Intermedio',
    format: 'On-demand',
    rating: 4.8,
    enrolled: 1243,
    completionRate: 78,
    thumbnail: null,
  },
  {
    id: 'ple-002',
    title: 'BGP Advanced Routing & Design',
    provider: 'Cisco Networking Academy',
    category: 'networking',
    skills: ['BGP', 'Cisco IOS', 'Networking'],
    duration: '24h',
    level: 'Avanzado',
    format: 'On-demand',
    rating: 4.6,
    enrolled: 892,
    completionRate: 65,
    thumbnail: null,
  },
  {
    id: 'ple-003',
    title: 'SD-WAN Architecture & Deployment',
    provider: 'AT&T University',
    category: 'networking',
    skills: ['SD-WAN', 'Networking'],
    duration: '16h',
    level: 'Intermedio',
    format: 'Blended',
    rating: 4.7,
    enrolled: 567,
    completionRate: 82,
    thumbnail: null,
  },

  // ── Cloud ──
  {
    id: 'ple-004',
    title: 'Azure Solutions Architect — Preparación AZ-305',
    provider: 'Microsoft Learn',
    category: 'cloud',
    skills: ['Azure', 'Cloud'],
    duration: '35h',
    level: 'Avanzado',
    format: 'On-demand',
    rating: 4.9,
    enrolled: 2104,
    completionRate: 71,
    thumbnail: null,
  },
  {
    id: 'ple-005',
    title: 'DevOps Engineering on Cloud Platforms',
    provider: 'Harvard Online',
    category: 'cloud',
    skills: ['DevOps', 'Azure', 'Automation'],
    duration: '28h',
    level: 'Intermedio',
    format: 'On-demand',
    rating: 4.7,
    enrolled: 1567,
    completionRate: 74,
    thumbnail: null,
  },

  // ── Security ──
  {
    id: 'ple-006',
    title: 'Cybersecurity Fundamentals & Threat Analysis',
    provider: 'MIT OpenCourseWare',
    category: 'seguridad',
    skills: ['Ciberseguridad', 'Security'],
    duration: '30h',
    level: 'Intermedio',
    format: 'On-demand',
    rating: 4.8,
    enrolled: 1890,
    completionRate: 69,
    thumbnail: null,
  },
  {
    id: 'ple-007',
    title: 'Enterprise Firewall Management — Palo Alto & Fortinet',
    provider: 'AT&T University',
    category: 'seguridad',
    skills: ['Firewalls', 'Ciberseguridad'],
    duration: '18h',
    level: 'Avanzado',
    format: 'Live + Lab',
    rating: 4.5,
    enrolled: 432,
    completionRate: 88,
    thumbnail: null,
  },

  // ── Infrastructure & Linux ──
  {
    id: 'ple-008',
    title: 'Linux Administration & Automation con Ansible',
    provider: 'Red Hat Training',
    category: 'infraestructura',
    skills: ['Linux', 'Ansible', 'Automation'],
    duration: '32h',
    level: 'Intermedio',
    format: 'Blended',
    rating: 4.9,
    enrolled: 2341,
    completionRate: 76,
    thumbnail: null,
  },
  {
    id: 'ple-009',
    title: 'CIS Hardening Standards for Enterprise Linux',
    provider: 'SANS Institute',
    category: 'seguridad',
    skills: ['Linux', 'Security'],
    duration: '12h',
    level: 'Avanzado',
    format: 'On-demand',
    rating: 4.6,
    enrolled: 678,
    completionRate: 84,
    thumbnail: null,
  },

  // ── Soft Skills & Management ──
  {
    id: 'ple-010',
    title: 'Technical Leadership & Cross-Functional Collaboration',
    provider: 'Harvard Business School Online',
    category: 'liderazgo',
    skills: ['Liderazgo', 'Management'],
    duration: '20h',
    level: 'Intermedio',
    format: 'On-demand',
    rating: 4.8,
    enrolled: 3456,
    completionRate: 72,
    thumbnail: null,
  },
  {
    id: 'ple-011',
    title: 'Agile Project Management for Engineering Teams',
    provider: 'Stanford Online',
    category: 'management',
    skills: ['Agile', 'Management'],
    duration: '15h',
    level: 'Básico',
    format: 'On-demand',
    rating: 4.7,
    enrolled: 4102,
    completionRate: 80,
    thumbnail: null,
  },
  {
    id: 'ple-012',
    title: 'Kubernetes & Container Orchestration',
    provider: 'Linux Foundation',
    category: 'cloud',
    skills: ['Kubernetes', 'DevOps', 'Cloud'],
    duration: '25h',
    level: 'Intermedio',
    format: 'On-demand + Lab',
    rating: 4.8,
    enrolled: 1789,
    completionRate: 68,
    thumbnail: null,
  },
];

/**
 * Find PLE courses that cover a given skill.
 * @param {string} skill
 * @returns {Array} matching courses
 */
export function findCoursesBySkill(skill) {
  const s = skill.toLowerCase();
  return pleCourses.filter(c =>
    c.skills.some(cs => cs.toLowerCase() === s)
  );
}

/**
 * Find PLE courses matching any of the given skills.
 * @param {string[]} skills
 * @returns {Array} matching courses (deduplicated)
 */
export function findCoursesBySkills(skills) {
  const set = new Set(skills.map(s => s.toLowerCase()));
  return pleCourses.filter(c =>
    c.skills.some(cs => set.has(cs.toLowerCase()))
  );
}
