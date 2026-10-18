import { matchesFilter } from '../lib/categories';
import { reducedMotion } from './motion';

export interface FilterDetail {
  key: string;
}

export function initFilters(): void {
  document.querySelectorAll<HTMLElement>('[data-filter-root]').forEach((root) => {
    if (root.dataset.filterReady) return;
    root.dataset.filterReady = 'true';
    const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter-chip]')];
    const items = [...root.querySelectorAll<HTMLElement>('[data-filter-item]')];
    const list = root.querySelector<HTMLElement>('[data-filter-list]');

    for (const chip of chips) {
      chip.addEventListener('click', () => {
        const key = chip.dataset.category ?? 'all';
        for (const other of chips) other.setAttribute('aria-pressed', String(other === chip));
        for (const item of items) item.hidden = !matchesFilter(key, item.dataset.category);
        root.dispatchEvent(new CustomEvent<FilterDetail>('tv:filter', { bubbles: true, detail: { key } }));
        if (list && list.getBoundingClientRect().top < 0) {
          list.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
        }
      });
    }
  });
}
