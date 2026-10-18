export function initMenu(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const nav = document.getElementById('site-nav');
  if (!button || !nav) return;

  const setOpen = (open: boolean) => {
    nav.dataset.open = String(open);
    button.setAttribute('aria-expanded', String(open));
  };

  button.addEventListener('click', () => setOpen(nav.dataset.open !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.dataset.open === 'true') {
      setOpen(false);
      button.focus();
    }
  });
  nav.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });
}
