// main.ts — render dispatch and boot. Compiled last, so everything it calls
// is already defined in the concatenated output.

/** Keep --barh equal to the sticky header's measured height, so the panels
 *  pinned beneath it sit flush. Re-measured on resize because the brand row
 *  wraps at narrow widths; a hardcoded offset leaves a gap that scrolling
 *  content bleeds through. */
function syncBarHeight(): void {
  const b = document.querySelector('header.bar') as HTMLElement | null;
  if (!b) return;
  document.documentElement.style.setProperty('--barh', Math.round(b.getBoundingClientRect().height) + 'px');
}

function render(opts?: RenderOpts): void {
  const o = opts || {};
  const chip = el('gateChip');
  const n = approvedCount();
  chip.textContent = 'gate ' + n + '/' + modules.length;
  chip.className = 'chip ' + (n === 0 ? 'watch' : 'clear');

  if (state.view === 'learner') {
    if (!o.keepFilters) renderFilters();
    renderLearner();
  } else if (state.view === 'planner') {
    if (!o.keepPicker) renderPicker();
    renderPlanner();
  } else if (state.view === 'leader') {
    renderLeader();
  } else if (state.view === 'owner') {
    renderOwner();
  }
}

function showBootError(err: unknown): void {
  const main = document.querySelector('main');
  if (main) {
    main.innerHTML =
      '<div class="panel block"><h3>Data failed to load</h3>' +
      '<p class="sm">One of this file’s embedded data blocks could not be parsed, so no view can render. ' +
      'The file is probably truncated or was edited by hand.</p>' +
      '<p class="sm mono">' + esc(String(err && (err as Error).message)) + '</p>' +
      '<p class="sm soft">Re-copy <span class="mono">app.html</span> from the team’s Teams channel ' +
      'connected SharePoint workspace.</p></div>';
  }
  const chip = elMaybe('gateChip');
  if (chip) { chip.textContent = 'data error'; chip.className = 'chip block'; }
}

function readJSON<T>(id: string): T {
  const node = document.getElementById(id);
  if (!node) throw new Error('missing data block #' + id);
  return JSON.parse(node.textContent || '') as T;
}

function boot(): void {
  try {
    MODULES_DATA = readJSON<ModulesDoc>('data-modules');
    PRODUCTS_DATA = readJSON<ProductsDoc>('data-products');
    SOURCES_DATA = readJSON<SourcesDoc>('data-sources');
  } catch (e) {
    showBootError(e);
    return;
  }

  initData();
  syncBarHeight();
  window.addEventListener('resize', syncBarHeight);
  initRouter();
  restorePrefs();

  let v = viewFromHash();
  if (!v) {
    // No route in the URL: fall back to the last view this viewer used.
    const p = lsGet();
    v = (p && p.view && VIEWS.indexOf(p.view) !== -1) ? p.view : 'learner';
    try { window.history.replaceState(null, '', '#/' + v); } catch (e) { /* opaque origin */ }
  }
  applyView(v);
}

boot();
