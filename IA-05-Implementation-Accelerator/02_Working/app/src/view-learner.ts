// view-learner.ts — pick role / type / product / stage, get one module with a
// source-cited checklist, a practice scenario and a next step.
//
// Signature interaction for this view: the checklist ticks off. An EC works
// this list while on a call, so the one moment of delight belongs on the
// action they repeat most. Ticking is a scratch aid for the current sitting
// only — held in memory, never persisted, never reported anywhere as
// progress, because there is no real learner data in this artifact.

function roleOptions(): { v: string; t: string }[] {
  const seen: Record<string, boolean> = {};
  const out: string[] = [];
  modules.forEach((m) => { seen[m.role] = true; });
  Object.keys(seen).forEach((r) => out.push(r));
  if (out.indexOf('EM') === -1) out.push('EM');
  const label: Record<string, string> = {
    EC: 'EC — Engagement Coordinator',
    EM: 'EM — Engagement Manager'
  };
  return out.map((r) => ({ v: r, t: label[r] || r }));
}

function matching(st?: Pick<LearnerState, 'role' | 'type' | 'product' | 'stage'>): Module[] {
  const f = st || state.learner;
  return modules.filter((m) => {
    if (m.role !== f.role) return false;
    if (m.type !== f.type) return false;
    if (f.stage !== 'any' && m.stage !== f.stage) return false;
    if (f.product !== 'any' && m.product !== 'any' && m.product !== f.product) return false;
    return true;
  }).sort((a, b) => {
    if (stageIx[a.stage] !== stageIx[b.stage]) return stageIx[a.stage] - stageIx[b.stage];
    return a.day - b.day;
  });
}

/** Which single filter, if relaxed, would produce results? Powers the empty state. */
function relaxSuggestions(): { k: string; label: string; to: string; n: number }[] {
  const out: { k: string; label: string; to: string; n: number }[] = [];
  const base = () => ({
    role: state.learner.role, type: state.learner.type,
    product: state.learner.product, stage: state.learner.stage
  });
  ([['stage', 'Journey stage'], ['product', 'Product'], ['type', 'Implementation type'], ['role', 'Role']] as const)
    .forEach((pair) => {
      const k = pair[0];
      const probe = base() as Record<string, string>;
      if (k === 'role') {
        if (state.learner.role === 'EC') return;
        probe[k] = 'EC';
      } else if (k === 'type') {
        if (state.learner.type === 'add-on') return;
        probe[k] = 'add-on';
      } else {
        if (state.learner[k] === 'any') return;
        probe[k] = 'any';
      }
      const n = matching(probe as any).length;
      if (n) out.push({ k: k, label: pair[1], to: probe[k], n: n });
    });
  return out;
}

function countLine(all: Module[], vis: Module[]): string {
  return '<b class="mono">' + all.length + '</b> match · <b class="mono">' + vis.length +
    '</b> past the gate' +
    (all.length - vis.length ? ' · <b class="mono">' + (all.length - vis.length) + '</b> withheld' : '');
}

function refreshCounts(): void {
  const c = elMaybe('fCounts');
  if (!c) return;
  const all = matching();
  c.innerHTML = countLine(all, all.filter(isApproved));
}

function renderFilters(): void {
  const st = state.learner;
  const all = matching();
  const vis = all.filter(isApproved);

  const opts = (list: { v: string; t: string }[], cur: string) =>
    list.map((o) => '<option value="' + esc(o.v) + '"' + (o.v === cur ? ' selected' : '') + '>' +
      esc(o.t) + '</option>').join('');

  const prodOpts = [{ v: 'any', t: 'Any — not product-specific' }]
    .concat(products.map((p) => ({ v: p.id, t: p.name })));
  const stageOpts = [{ v: 'any', t: 'All stages, in journey order' }]
    .concat(stages.map((s, i) => ({ v: s.id as string, t: (i + 1) + '. ' + s.label })));

  el('learnerFilters').innerHTML = [
    '<div class="fgrid">',
    '<div><label class="fl" for="fRole">Role</label><select id="fRole">' + opts(roleOptions(), st.role) + '</select></div>',
    '<div><label class="fl" for="fType">Implementation type</label><select id="fType">' +
      opts(types.map((t) => ({ v: t.id as string, t: t.label })), st.type) + '</select></div>',
    '<div><label class="fl" for="fProd">Product</label><select id="fProd">' + opts(prodOpts, st.product) + '</select></div>',
    '<div><label class="fl" for="fStage">Journey stage</label><select id="fStage">' + opts(stageOpts, st.stage) + '</select></div>',
    '</div>',
    '<hr class="rule">',
    '<div class="row">',
    '<span class="sm soft" id="fCounts">' + countLine(all, vis) + '</span>',
    '<span class="grow"></span>',
    '<button class="btn" id="bReset">Reset filters</button>',
    '<button class="btn" id="bPrev" aria-pressed="' + (st.preview ? 'true' : 'false') + '">Preview drafts</button>',
    '</div>'
  ].join('');

  // Changing a select must not rebuild the selects: that would destroy and
  // recreate the control the user is operating. Only the counts move.
  const onPick = (key: 'role' | 'type' | 'product' | 'stage') => (e: Event) => {
    const v = (e.target as HTMLSelectElement).value;
    setState((s) => { s.learner[key] = v; }, { keepFilters: true });
    refreshCounts();
  };
  (el('fRole') as HTMLSelectElement).onchange = onPick('role');
  (el('fType') as HTMLSelectElement).onchange = onPick('type');
  (el('fProd') as HTMLSelectElement).onchange = onPick('product');
  (el('fStage') as HTMLSelectElement).onchange = onPick('stage');

  el('bReset').onclick = () => {
    setState((s) => {
      s.learner.role = 'EC'; s.learner.type = 'add-on';
      s.learner.product = 'any'; s.learner.stage = 'any';
    });
  };
  el('bPrev').onclick = () => {
    setState((s) => { s.learner.preview = !s.learner.preview; }, { keepFilters: true });
    el('bPrev').setAttribute('aria-pressed', state.learner.preview ? 'true' : 'false');
    refreshCounts();
  };
}

function doneCount(m: Module): number {
  const d = state.learner.done[m.id];
  if (!d) return 0;
  return Object.keys(d).filter((k) => d[Number(k)]).length;
}

function moduleCard(m: Module, draft: boolean): string {
  const st = state.learner;
  const stg = stageIx[m.stage] + 1;
  const nDone = doneCount(m);
  const out: string[] = ['<article class="panel mod" style="border-left-color:' + stageTint(m.stage) + '">'];

  out.push('<div class="modhead">');
  out.push('<span class="stageno" style="background:' + stageTint(m.stage) + '">' + stg + '</span>');
  out.push('<span class="chip sig">' + esc(m.id) + '</span>');
  out.push('<span class="chip">' + esc(stageLabel[m.stage]) + '</span>');
  out.push('<span class="chip">day ' + esc(m.day) + '</span>');
  out.push('<span class="chip">' + (m.delivery === 'self' ? 'self-paced' : 'facilitated') + '</span>');
  if (m.practice) out.push('<span class="chip">practice · ' + esc(m.practice) + '</span>');
  out.push(isApproved(m)
    ? '<span class="chip clear">✓ approved</span>'
    : '<span class="chip watch">○ ' + esc(reviewOf(m)) + '</span>');
  out.push('</div>');

  out.push('<h3>' + esc(m.title) + '</h3>');
  out.push('<p class="soft sm">' + esc(m.objective) + '</p>');

  if (draft) {
    out.push('<div class="panel block sm inset"><b>⚠ Draft preview.</b> Not through SME review — ' +
      'outside the approval gate. Do not use as guidance yet.</div>');
  }

  if (m.sla) out.push('<div class="sla"><b>SLA</b><span>' + esc(m.sla) + '</span></div>');

  out.push('<div class="ckhead"><h2 class="sec">Checklist</h2>' +
    '<span class="ckcount' + (nDone === m.steps.length ? ' all' : '') + '" data-ck="' + esc(m.id) + '">' +
    nDone + ' / ' + m.steps.length + '</span></div>');
  out.push('<ol class="ck" data-cklist="' + esc(m.id) + '">');
  m.steps.forEach((s, i) => {
    const on = !!(st.done[m.id] && st.done[m.id][i]);
    out.push('<li class="ckitem' + (on ? ' on' : '') + '">');
    out.push('<button class="tick" role="checkbox" aria-checked="' + (on ? 'true' : 'false') +
      '" data-step="' + i + '" aria-label="Mark step ' + (i + 1) + ' done"><span class="mark">✓</span></button>');
    out.push('<span class="cktext">' + gaps(s.t) +
      (s.n ? '<span class="nu">' + gaps(s.n) + '</span>' : '') + '</span>');
    out.push('</li>');
  });
  out.push('</ol>');
  out.push('<p class="xs soft ckhint">Ticking is a scratch aid for this sitting only — nothing is saved or reported.</p>');

  if (m.scenario) {
    out.push('<hr class="rule"><h2 class="sec">Practice · ' + esc(m.practice) + '</h2>');
    out.push('<p class="sm">' + esc(m.scenario.q) + '</p>');
    out.push('<div role="radiogroup" aria-label="Scenario options for ' + esc(m.id) + '" data-scen="' + esc(m.id) + '">');
    m.scenario.opts.forEach((o, i) => {
      const on = st.picks[m.id] === i;
      const tabbable = on || (st.picks[m.id] === undefined && i === 0);
      out.push('<div class="opt ' + esc(o.verdict) + '" role="radio" tabindex="' + (tabbable ? '0' : '-1') +
        '" aria-checked="' + (on ? 'true' : 'false') + '" data-opt="' + i + '">');
      out.push('<div class="sm">' + esc(o.t) + '</div>');
      const vlabel = o.verdict === 'best' ? '✓ Best'
        : o.verdict === 'ok' ? '• Workable, not preferred' : '✗ Avoid';
      out.push('<div class="fb"><span class="vd">' + vlabel + '</span><br>' + esc(o.fb) +
        '<span class="cite">' + esc(o.src) + '</span></div>');
      out.push('</div>');
    });
    out.push('</div>');
    if (st.picks[m.id] === undefined) {
      out.push('<p class="xs soft" style="margin-top:6px">Choose an option to see the verdict and its citation.</p>');
    }
  }

  out.push('<hr class="rule"><h2 class="sec">Next</h2><p class="sm">' + esc(m.next) + '</p>');
  out.push('<span class="cite">source: ' + esc(m.source) + '</span>');
  out.push('<span class="cite">maintained by: ' + gaps(m.owner) + '</span>');
  out.push('</article>');
  return out.join('');
}

function renderLearner(): void {
  const st = state.learner;
  const all = matching();
  const vis = all.filter(isApproved);
  const hid = all.filter((m) => !isApproved(m));
  const out: string[] = [];

  if (all.length === 0) {
    const sug = relaxSuggestions();
    out.push('<div class="panel watch">');
    out.push('<h3>No module covers this combination yet</h3>');
    out.push('<p class="sm soft">The source set covers the <b>Engagement Coordinator / Add-On</b> path. ' +
      'Other role and implementation-type combinations are carried in the data model but deliberately left ' +
      'unfilled — nothing is generated to cover a gap.</p>');
    if (sug.length) {
      out.push('<hr class="rule"><p class="sm"><b>Relax one filter:</b></p><div class="row">');
      sug.forEach((s) => {
        out.push('<button class="btn" data-relax="' + esc(s.k) + '" data-to="' + esc(s.to) + '">' +
          esc(s.label) + ' → ' + esc(s.to === 'any' ? 'Any' : s.to) +
          ' <span class="soft">(' + s.n + ')</span></button>');
      });
      out.push('</div>');
    } else {
      out.push('<hr class="rule"><p class="sm soft">Relaxing any single filter still returns nothing. ' +
        'Use <b>Reset filters</b> above to return to the populated path.</p>');
    }
    out.push('</div>');
    el('learnerOut').innerHTML = out.join('');
    onClick(el('learnerOut'), '[data-relax]', (b) => {
      const k = b.getAttribute('data-relax') as 'role' | 'type' | 'product' | 'stage';
      const to = b.getAttribute('data-to') as string;
      setState((s) => { s.learner[k] = to; });
    });
    return;
  }

  if (vis.length === 0) {
    out.push('<div class="panel block">');
    out.push('<h3>The approval gate is closed — and that is correct</h3>');
    out.push('<p class="sm"><b class="mono">' + hid.length + '</b> module' + (hid.length === 1 ? '' : 's') +
      ' match, and none has passed SME review. Every module ships as <span class="mono">drafted</span>, ' +
      'because no RealPage SME has reviewed the drafted content. The gate is a filter, not a label: ' +
      'unapproved modules are withheld from this view.</p>');
    out.push('<p class="sm soft">Open <b>Owner</b> and click a module’s status badge to cycle it to ' +
      '<span class="mono">approved</span> — it appears here immediately. Or preview the drafts below.</p>');
    out.push('</div>');
  } else {
    out.push('<p class="sm soft">Showing <b class="mono">' + vis.length + '</b> approved module' +
      (vis.length === 1 ? '' : 's') +
      (hid.length ? ', <b class="mono">' + hid.length + '</b> withheld by the gate' : '') + '.</p>');
  }

  vis.forEach((m) => out.push(moduleCard(m, false)));
  if (st.preview) hid.forEach((m) => out.push(moduleCard(m, true)));
  else if (hid.length && vis.length) {
    out.push('<p class="xs soft">' + hid.length + ' draft module(s) hidden. Use <b>Preview drafts</b> to read them.</p>');
  }

  el('learnerOut').innerHTML = out.join('');
  wireScenarios();
  wireChecklists();
}

function wireChecklists(): void {
  qsa(el('learnerOut'), '[data-cklist]').forEach((list) => {
    const id = list.getAttribute('data-cklist') as string;

    const toggle = (idx: number) => {
      const d = state.learner.done[id] || (state.learner.done[id] = {});
      d[idx] = !d[idx];
      // Update in place rather than re-rendering: the tick must feel
      // instantaneous and must not move the page under the reader.
      const btn = list.querySelector('[data-step="' + idx + '"]') as HTMLElement | null;
      if (!btn) return;
      const li = btn.parentElement as HTMLElement;
      const on = !!d[idx];
      btn.setAttribute('aria-checked', on ? 'true' : 'false');
      li.classList.toggle('on', on);
      const m = modules.filter((x) => x.id === id)[0];
      const counter = el('learnerOut').querySelector('[data-ck="' + id + '"]') as HTMLElement | null;
      if (counter && m) {
        const n = doneCount(m);
        counter.textContent = n + ' / ' + m.steps.length;
        counter.classList.toggle('all', n === m.steps.length);
      }
    };

    list.addEventListener('click', (e: Event) => {
      const t = (e.target as HTMLElement).closest('[data-step]') as HTMLElement | null;
      if (t) toggle(parseInt(t.getAttribute('data-step') as string, 10));
    });
    list.addEventListener('keydown', (e: Event) => {
      const ev = e as KeyboardEvent;
      const t = (ev.target as HTMLElement).closest('[data-step]') as HTMLElement | null;
      if (t && (ev.key === 'Enter' || ev.key === ' ')) {
        ev.preventDefault();
        toggle(parseInt(t.getAttribute('data-step') as string, 10));
      }
    });
  });
}

function wireScenarios(): void {
  qsa(el('learnerOut'), '[data-scen]').forEach((g) => {
    const id = g.getAttribute('data-scen') as string;
    const choose = (i: number) => setState((s) => { s.learner.picks[id] = i; });

    g.addEventListener('click', (e: Event) => {
      const o = (e.target as HTMLElement).closest('[data-opt]') as HTMLElement | null;
      if (o) choose(parseInt(o.getAttribute('data-opt') as string, 10));
    });
    g.addEventListener('keydown', (e: Event) => {
      const ev = e as KeyboardEvent;
      const o = (ev.target as HTMLElement).closest('[data-opt]') as HTMLElement | null;
      if (!o) return;
      const i = parseInt(o.getAttribute('data-opt') as string, 10);
      const n = g.querySelectorAll('[data-opt]').length;
      if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); choose(i); }
      else if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') { ev.preventDefault(); choose((i + 1) % n); }
      else if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') { ev.preventDefault(); choose((i - 1 + n) % n); }
    });
  });
}
