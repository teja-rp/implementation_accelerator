// router.ts — hash routing over four peer views.
//
// Navigation applies the view directly and treats the URL as addressability,
// not as the transport. Depending on a `location.hash =` write followed by a
// hashchange event makes the whole app unnavigable wherever that round trip is
// unavailable — on an opaque origin the assignment is silently ignored and no
// event fires. pushState keeps back/forward and bookmarkable #/routes working;
// if even that is refused, the view still switches and only the URL goes stale.

function viewFromHash(): ViewName | null {
  const m = /^#\/([a-z]+)/.exec(window.location.hash || '');
  return m && VIEWS.indexOf(m[1] as ViewName) !== -1 ? (m[1] as ViewName) : null;
}

function go(view: ViewName, replace?: boolean): void {
  if (VIEWS.indexOf(view) === -1) view = 'learner';
  scrollMem[state.view] = window.scrollY;
  const hash = '#/' + view;
  try {
    if (window.location.hash !== hash) {
      if (replace) window.history.replaceState(null, '', hash);
      else window.history.pushState(null, '', hash);
    }
  } catch (e) { /* opaque origin: keep navigating, lose only the URL */ }
  applyView(view);
}

function applyView(view: ViewName): void {
  state.view = view;
  VIEWS.forEach((v) => {
    el('view-' + v).classList.toggle('on', v === view);
    const t = el('tab-' + v) as HTMLButtonElement;
    t.setAttribute('aria-selected', v === view ? 'true' : 'false');
    t.tabIndex = v === view ? 0 : -1;
  });
  el('here').textContent = VIEW_LABEL[view];
  savePrefs();
  render({});
  window.scrollTo(0, scrollMem[view] || 0);
}

// External navigation only: back/forward (popstate) and a hand-edited hash.
// Both are idempotent, so they no-op when the view already matches and cannot
// fight with go().
function onExternalNav(): void {
  const v = viewFromHash() || 'learner';
  if (v === state.view) return;
  scrollMem[state.view] = window.scrollY;
  applyView(v);
}

function initRouter(): void {
  window.addEventListener('hashchange', onExternalNav);
  window.addEventListener('popstate', onExternalNav);

  el('tabs').addEventListener('click', (e: Event) => {
    const t = e.target as HTMLElement;
    const b = t.closest('button[data-v]') as HTMLElement | null;
    if (b) go(b.getAttribute('data-v') as ViewName);
  });

  el('tabs').addEventListener('keydown', (e: Event) => {
    const ev = e as KeyboardEvent;
    const i = VIEWS.indexOf(state.view);
    let next: ViewName | null = null;
    if (ev.key === 'ArrowRight') next = VIEWS[(i + 1) % VIEWS.length];
    else if (ev.key === 'ArrowLeft') next = VIEWS[(i - 1 + VIEWS.length) % VIEWS.length];
    else if (ev.key === 'Home') next = VIEWS[0];
    else if (ev.key === 'End') next = VIEWS[VIEWS.length - 1];
    if (next) { ev.preventDefault(); go(next); el('tab-' + next).focus(); }
  });
}
