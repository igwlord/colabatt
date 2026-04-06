/**
 * filter-bar.js — Filter Bar Component
 * Horizontal chip bar with label and sort control.
 */

import { html, raw } from '../../utils/safe-html.js';
import { Chip } from '../ui/chip.js';

/**
 * @param {Object} props
 * @param {string} [props.label='Filtros']
 * @param {string} props.filterKey - The store key to filter on
 * @param {Array<{value: string, label: string}>} props.options
 * @param {string} props.activeValue - Currently active filter value
 * @param {boolean} [props.showSort=false]
 * @param {string} [props.sortLabel='Ordenar por relevancia']
 * @returns {string}
 */
export function FilterBar({ label = 'Filtros', filterKey, options, activeValue, showSort = false, sortLabel = 'Ordenar por relevancia' }) {
  return html`
    <div class="filter-bar" role="listbox" aria-label="${label}">
      <span class="filter-bar__label">${label}</span>
      <div class="filter-bar__chips">
        ${raw(options.map((opt) =>
          Chip({
            label: opt.label,
            active: opt.value === activeValue,
            filterKey,
            filterValue: opt.value,
          })
        ).join(''))}
      </div>
      ${raw(showSort ? `
        <div class="filter-bar__sort">
          <span class="filter-bar__sort-label">${sortLabel}</span>
          <button class="filter-bar__sort-btn" data-action="toggle-sort" aria-label="Cambiar orden">
            <span class="material-symbols-outlined" aria-hidden="true">filter_list</span>
          </button>
        </div>
      ` : '')}
    </div>
  `;
}
