import { pickActive } from '../lib/active';

export function watchActive(items: HTMLElement[], onChange: (id: string | null) => void): void {
  let current: string | null | undefined;
  let frame = 0;

  const run = () => {
    frame = 0;
    const id = pickActive(
      items.map((el) => {
        const rect = el.getBoundingClientRect();
        return { id: el.dataset.activeId ?? '', top: rect.top, bottom: rect.bottom, hidden: Boolean(el.hidden) };
      }),
      window.innerHeight * 0.45,
    );
    if (id === current) return;
    current = id;
    for (const el of items) el.classList.toggle('is-active', el.dataset.activeId === id);
    onChange(id);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(run);
  };

  document.addEventListener('scroll', schedule, { passive: true, capture: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('tv:filter', schedule);
  run();
}
