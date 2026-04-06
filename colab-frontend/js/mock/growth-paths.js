/**
 * growth-paths.js — Mock Growth Platform Data
 * Simulates annual learning paths that technicians build in Growth.
 */

import { pleCourses } from './ple-courses.js';

/**
 * Growth paths for the mock user (Carlos Mendoza, tech-001).
 * Each path represents the annual learning plan.
 */
export const growthPaths = {
  'tech-001': {
    year: 2026,
    pathName: 'Especialización en Cloud & Seguridad',
    createdAt: '2026-01-15',
    deadline: '2026-12-31',
    progress: 42,
    courses: [
      {
        courseId: 'ple-006',
        status: 'completed',    // completed | in-progress | pending
        completedAt: '2026-02-20',
        score: 92,
      },
      {
        courseId: 'ple-008',
        status: 'completed',
        completedAt: '2026-03-10',
        score: 88,
      },
      {
        courseId: 'ple-004',
        status: 'in-progress',
        completedAt: null,
        score: null,
        progressPercent: 65,
      },
      {
        courseId: 'ple-005',
        status: 'pending',
        completedAt: null,
        score: null,
      },
      {
        courseId: 'ple-012',
        status: 'pending',
        completedAt: null,
        score: null,
      },
    ],
    targetSkills: ['Azure', 'DevOps', 'Ciberseguridad', 'Kubernetes', 'Linux'],
    managerApproved: true,
    managerName: 'Patricia Vega',
  },
};

/**
 * User's completed + in-progress skills from PLE/Growth history.
 * Derived from courses the user has completed or is taking.
 */
export const userSkillsFromGrowth = {
  'tech-001': {
    acquired: ['Redes', '5G', 'Linux', 'Ciberseguridad', 'Security', 'Ansible'],
    inProgress: ['Azure', 'Cloud'],
    planned: ['DevOps', 'Kubernetes'],
  },
};

/**
 * Get the user's growth path.
 * @param {string} userId
 * @returns {Object|null}
 */
export function getUserGrowthPath(userId) {
  return growthPaths[userId] || null;
}

/**
 * Get enriched growth path with full course details.
 * @param {string} userId
 * @returns {Object|null}
 */
export function getEnrichedGrowthPath(userId) {
  const path = growthPaths[userId];
  if (!path) return null;

  const enrichedCourses = path.courses.map(c => {
    const course = pleCourses.find(p => p.id === c.courseId);
    return { ...c, course };
  });

  return { ...path, courses: enrichedCourses };
}

/**
 * Get user skill status (acquired, in-progress, gap).
 * @param {string} userId
 * @param {string} skill
 * @returns {'acquired'|'in-progress'|'planned'|'gap'}
 */
export function getSkillStatus(userId, skill) {
  const data = userSkillsFromGrowth[userId];
  if (!data) return 'gap';
  const s = skill.toLowerCase();
  if (data.acquired.some(a => a.toLowerCase() === s)) return 'acquired';
  if (data.inProgress.some(a => a.toLowerCase() === s)) return 'in-progress';
  if (data.planned.some(a => a.toLowerCase() === s)) return 'planned';
  return 'gap';
}
