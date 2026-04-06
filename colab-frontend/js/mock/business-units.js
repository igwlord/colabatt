/**
 * business-units.js — BU Registry
 * Single source of truth for Business Unit metadata.
 */

export const businessUnits = {
  'BU-01': { name: 'Operaciones de Red', short: 'Ops Red' },
  'BU-02': { name: 'Ingeniería Core', short: 'Ing Core' },
  'BU-03': { name: 'Infraestructura & Plataformas', short: 'Infra' },
  'BU-04': { name: 'Servicios Digitales', short: 'Serv Dig' },
  'BU-05': { name: 'Conectividad Empresarial', short: 'Conect Emp' },
  'BU-07': { name: 'Soporte Técnico Avanzado', short: 'Sop Avz' },
  'BU-09': { name: 'Sistemas Cloud', short: 'Cloud Sys' },
  'BU-14': { name: 'Ciberseguridad', short: 'Ciberseg' },
};

/**
 * Get the full BU name from a code.
 * @param {string} code - e.g. "BU-01"
 * @returns {string} Full name or code as fallback
 */
export function getBuName(code) {
  return businessUnits[code]?.name ?? code;
}

/**
 * Get the short BU label from a code.
 * @param {string} code
 * @returns {string}
 */
export function getBuShort(code) {
  return businessUnits[code]?.short ?? code;
}
