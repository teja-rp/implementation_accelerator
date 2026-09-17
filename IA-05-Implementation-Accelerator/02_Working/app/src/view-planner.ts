// view-planner.ts — tick the products on a signed order; get the valid go-live
// sequence, what is blocked, and the relevant validation questions.
//
// Signature interaction for this view: the graph resolves in wave order. Each
// node fades and lifts into place with a delay proportional to its wave, so a
// toggle reads as the sequence re-settling left to right rather than the
// picture being swapped. This is the one place in the app where the delight
// is also the message: the animation *is* the dependency order.

const GROUPS: ProductGroup[] = [
  'Core', 'Core & operations', 'Financial',
  'Renter engagement', 'Marketing & leads', 'Reporting & utilities'
];

const EXAMPLE: string[] = [
  'onesite', 'screening', 'payments', 'loftliving',
  'loftleasing', 'loyalty', 'knock', 'website', 'bi'
];

function renderPicker(): void {
  const sel = state.planner.selected;
  const out: string[] = [
    '<div class="row pickhead">',
    '<b class="sec">Order</b>',
    '<span class="chip" id="selCount">' + sel.length + ' of ' + products.length + '</span>',
    '<span class="grow"></span>',
    '<button class="btn" id="bClear">Clear</button>',
    '<button class="btn" id="bEx">Example order</button>',
    '</div>'
  ];

  GROUPS.forEach((g) => {
    const inG = products.filter((p) => p.group === g);
    if (!inG.length) return;
    out.push('<div class="grp"><b>' + esc(g) + '</b>');
    inG.forEach((p) => {
      const fl: string[] = [];
      if (p.core) fl.push('core');
      if (p.withCore) fl.push('with OneSite');
      if (p.early) fl.push('can start early');
      out.push('<label class="pr"><input type="checkbox" value="' + esc(p.id) + '"' +
        (sel.indexOf(p.id) !== -1 ? ' checked' : '') + '>');
      out.push('<span><span class="nm">' + esc(p.name) + '</span>' +
        (fl.length ? ' <span class="chip">' + esc(fl.join(' · ')) + '</span>' : '') +
        '<span class="nt">' + esc(p.note) + '</span></span></label>');
    });
    out.push('</div>');
  });

  el('prodPick').innerHTML = out.join('');

  el('prodPick').onchange = (e: Event) => {
    const t = e.target as HTMLInputElement;
    if (t.type !== 'checkbox') return;
    const id = t.value;
    const on = t.checked;
    setState((s) => {
      const i = s.planner.selected.indexOf(id);
      if (on && i === -1) s.planner.selected.push(id);
      if (!on && i !== -1) s.planner.selected.splice(i, 1);
    }, { keepPicker: true });
    const chip = elMaybe('selCount');
    if (chip) chip.textContent = state.planner.selected.length + ' of ' + products.length;
  };

  el('bClear').onclick = () => setState((s) => { s.planner.selected = []; });
  el('bEx').onclick = () => setState((s) => { s.planner.selected = EXAMPLE.slice(); });
}

interface GraphCol { key: string; label: string; ids: string[]; wave?: number; }

/**
 * Inline SVG dependency graph. Columns are waves, so x-position carries the
 * sequence. Blocked products get a leading, visually separate column: "cannot
 * be sequenced" is not a position in the sequence, and putting them anywhere
 * in the ramp would repeat the defect this design exists to avoid.
 */
function depGraph(sel: string[], blocked: Record<string, boolean>): string {
  const COLW = 158, NODEW = 126, NODEH = 34, ROWH = 46, PADX = 12, PADY = 30;

  const cols: GraphCol[] = [];
  const blockedIds = sel.filter((id) => blocked[id]);
  if (blockedIds.length) cols.push({ key: 'blocked', label: 'BLOCKED', ids: blockedIds });

  const byWave: Record<number, string[]> = {};
  sel.forEach((id) => {
    if (blocked[id]) return;
    const w = R.waveOf(id, sel);
    (byWave[w] = byWave[w] || []).push(id);
  });
  Object.keys(byWave).map(Number).sort((a, b) => a - b).forEach((w) => {
    cols.push({ key: 'w' + w, label: w === 0 ? 'PARALLEL' : 'WAVE ' + w, ids: byWave[w], wave: w });
  });

  if (!cols.length) return '';

  const pos: Record<string, { x: number; y: number; col: number }> = {};
  cols.forEach((c, ci) => {
    c.ids.forEach((id, ri) => {
      pos[id] = { x: PADX + ci * COLW, y: PADY + ri * ROWH, col: ci };
    });
  });

  const maxRows = cols.reduce((a, c) => Math.max(a, c.ids.length), 0);
  const W = PADX * 2 + cols.length * COLW - (COLW - NODEW);
  const H = PADY + maxRows * ROWH + 6;

  const s: string[] = ['<svg class="dep" viewBox="0 0 ' + W + ' ' + H +
    '" role="img" aria-labelledby="depT depD" preserveAspectRatio="xMinYMin meet">'];
  s.push('<title id="depT">Go-live sequence for the ' + sel.length + ' selected products</title>');
  s.push('<desc id="depD">' + esc(cols.map((c) =>
    c.label.toLowerCase() + ': ' + c.ids.map((i) => R.byId[i].name).join(', ')
  ).join('. ')) + '. The same information is listed as text below the diagram.</desc>');

  cols.forEach((c, ci) => {
    s.push('<text class="lbl" x="' + (PADX + ci * COLW) + '" y="' + (PADY - 12) + '">' + esc(c.label) + '</text>');
  });

  sel.forEach((id) => {
    const p = R.byId[id];
    if (!p || !pos[id]) return;
    (p.requires || []).forEach((r) => {
      if (!pos[r]) return;
      const a = pos[r], b = pos[id];
      const x1 = a.x + NODEW, y1 = a.y + NODEH / 2;
      let x2 = b.x;
      const y2 = b.y + NODEH / 2;
      if (x2 < x1) x2 = b.x + NODEW;
      const mx = (x1 + x2) / 2;
      const bad = blocked[id] || blocked[r];
      s.push('<path class="edge' + (bad ? ' bad' : '') + '" d="M' + x1 + ',' + y1 +
        ' C' + mx + ',' + y1 + ' ' + mx + ',' + y2 + ' ' + x2 + ',' + y2 + '"/>');
    });
  });

  // Signature moment: stagger each node's entrance by its column, so the
  // sequence resolves left to right. Delay is capped so a 22-product order
  // still settles quickly, and the whole thing is disabled under
  // prefers-reduced-motion by the stylesheet.
  cols.forEach((c, ci) => {
    c.ids.forEach((id, ri) => {
      const p = R.byId[id], q = pos[id];
      const isB = !!blocked[id];
      const fill = waveColor(c.wave, isB);
      let reason = '';
      if (isB) {
        const br = R.blockReason(id, sel);
        const bits: string[] = [];
        if (br.missing.length) bits.push('not on the order: ' + br.missing.map((x) => R.byId[x] ? R.byId[x].name : x).join(', '));
        if (br.stalled.length) bits.push('waiting on: ' + br.stalled.map((x) => R.byId[x] ? R.byId[x].name : x).join(', '));
        reason = ' — blocked (' + bits.join('; ') + ')';
      }
      const nm = p.name.length > 20 ? p.name.slice(0, 19) + '…' : p.name;
      const delay = Math.min(ci * 90 + ri * 25, 700);
      s.push('<g class="nd" style="animation-delay:' + delay + 'ms">');
      s.push('<title>' + esc(p.name + reason) + '</title>');
      s.push('<rect class="node" x="' + q.x + '" y="' + q.y + '" width="' + NODEW + '" height="' + NODEH +
        '" rx="3" fill="' + fill + '"' +
        (isB ? ' stroke="var(--block)" stroke-width="1.5" stroke-dasharray="4 3" fill-opacity="0.22"' : '') + '/>');
      s.push('<text x="' + (q.x + 8) + '" y="' + (q.y + 21) + '"' + (isB ? ' fill="var(--block)"' : '') + '>' +
        esc(nm) + (isB ? ' ⚠' : '') + '</text>');
      s.push('</g>');
    });
  });

  s.push('</svg>');
  return s.join('');
}

function renderPlanner(): void {
  const sel = state.planner.selected;
  const out: string[] = [];

  if (!sel.length) {
    el('plannerOut').innerHTML = [
      '<div class="panel sig"><h3>Nothing on the order yet</h3>',
      '<p class="sm soft">Tick the products on the signed order. The sequence, the blockers and the relevant ',
      'validation questions recompute on every change — there is no calculate step.</p>',
      '<p class="sm soft">Or load the <b>Example order</b> to see a nine-product Add-On worked through.</p></div>'
    ].join('');
    return;
  }

  const blocked = R.blockedSet(sel);
  const nBlocked = Object.keys(blocked).length;

  out.push('<div class="panel' + (nBlocked ? ' block' : ' clear') + '">');
  out.push('<div class="row pickhead">');
  out.push('<b class="sec">Go-live sequence</b>');
  out.push(nBlocked
    ? '<span class="chip block">⚠ ' + nBlocked + ' blocked</span>'
    : '<span class="chip clear">✓ all sequenceable</span>');
  out.push('</div>');
  out.push(depGraph(sel, blocked));
  out.push('<hr class="rule">');
  out.push('<div class="row xs soft legend">');
  ([['--w-par', 'parallel'], ['--w-1', 'wave 1'], ['--w-2', 'wave 2'], ['--w-3', 'wave 3'],
    ['--w-4', 'wave 4+'], ['--block', 'blocked']] as const).forEach((k) => {
    out.push('<span class="wv"><span class="wvk" style="background:var(' + k[0] + ')"></span>' + k[1] + '</span>');
  });
  out.push('</div></div>');

  if (nBlocked) {
    out.push('<h2 class="sec">Blocked — cannot be sequenced</h2><div class="panel block"><div class="stack">');
    Object.keys(blocked).forEach((id) => {
      const p = R.byId[id];
      const br = R.blockReason(id, sel);
      out.push('<div><b>' + esc(p.name) + '</b> <span class="chip block">⚠ blocked</span>');
      if (br.missing.length) out.push('<div class="sm">Not on the order: <b>' + esc(br.missing.map((x) => R.byId[x].name).join(', ')) + '</b></div>');
      if (br.stalled.length) out.push('<div class="sm">On the order but itself blocked: <b>' + esc(br.stalled.map((x) => R.byId[x].name).join(', ')) + '</b></div>');
      out.push('<div class="sm soft">' + esc(p.note) + '</div><span class="cite">' + esc(p.src) + '</span></div>');
    });
    out.push('</div><p class="xs soft" style="margin:10px 0 0">A missing prerequisite does not always mean a ' +
      'missing order — the product may already be live at the property. Confirm before flagging it to Sales.</p></div>');
  }

  const byWave: Record<number, string[]> = {};
  sel.forEach((id) => { if (!blocked[id]) { const w = R.waveOf(id, sel); (byWave[w] = byWave[w] || []).push(id); } });
  const waveKeys = Object.keys(byWave).map(Number).sort((a, b) => a - b);
  if (waveKeys.length) {
    out.push('<h2 class="sec">Sequence in order</h2><div class="panel"><div class="stack">');
    waveKeys.forEach((w) => {
      const c = waveColor(w, false);
      out.push('<div><span class="chip" style="color:' + c + ';border-color:' + c + '">' +
        (w === 0 ? 'parallel — no prerequisite' : 'wave ' + w) + '</span>');
      byWave[w].forEach((id) => {
        const p = R.byId[id];
        out.push('<div class="sm seqrow"><b>' + esc(p.name) + '</b> <span class="soft">— ' + esc(p.note) + '</span>');
        if (p.lag) out.push('<br><span class="chip watch">lag</span> <span class="sm mono">' + esc(p.lag) + '</span>');
        if (p.why) out.push('<br><span class="xs soft">Why: ' + esc(p.why) + '</span>');
        out.push('<span class="cite">' + esc(p.src) + '</span></div>');
      });
      out.push('</div>');
    });
    out.push('</div></div>');
  }

  const pre = sel.map((id) => R.byId[id]).filter((p) => p && p.prereq);
  out.push('<h2 class="sec">Client-side prerequisites</h2><div class="panel' + (pre.length ? ' watch' : '') + '">');
  if (!pre.length) {
    out.push('<p class="sm soft" style="margin:0">None of the selected products carries a documented client-side prerequisite.</p>');
  } else {
    out.push('<div class="stack">');
    pre.forEach((p) => {
      out.push('<div class="sm"><b>' + esc(p.name) + '</b> — ' + esc(p.prereq) +
        '<span class="cite">' + esc(p.prereqSrc || p.src) + '</span></div>');
    });
    out.push('</div><p class="xs soft" style="margin:10px 0 0">Gates the client controls. A product can look ready ' +
      'on the dependency table and still be unschedulable because one of these is outstanding.</p>');
  }
  out.push('</div>');

  const bl = R.blockers(sel);
  const blk = Object.keys(bl);
  out.push('<h2 class="sec">Required but missing from this order</h2>');
  if (!blk.length) {
    out.push('<div class="panel clear"><p class="sm" style="margin:0"><span class="chip clear">✓ clean</span> ' +
      'Every prerequisite and integration target for the selected products is also on the order.</p></div>');
  } else {
    out.push('<div class="panel scrollx"><table><thead><tr><th>Selected</th><th>Missing</th><th>Kind</th></tr></thead><tbody>');
    blk.forEach((id) => {
      const p = R.byId[id];
      const kind = (p.requires || []).length === 0 && (p.integrateAfter || []).length
        ? 'Integration target — does not block go-live' : 'Hard prerequisite';
      out.push('<tr><td><b>' + esc(p.name) + '</b></td><td><span class="chip block">' +
        esc(bl[id].map((r) => R.byId[r] ? R.byId[r].name : r).join(', ')) +
        '</span></td><td class="soft">' + esc(kind) + '</td></tr>');
    });
    out.push('</tbody></table></div>');
  }

  const cau = sel.map((id) => R.byId[id]).filter((p) => p && p.caution);
  if (cau.length) {
    out.push('<h2 class="sec">Watch-outs</h2><div class="panel watch"><div class="stack">');
    cau.forEach((p) => {
      out.push('<div class="sm"><b>' + esc(p.name) + '</b> — ' + esc(p.caution) +
        '<span class="cite">' + esc(p.cautionSrc || p.src) + '</span></div>');
    });
    out.push('</div></div>');
  }

  if (sel.indexOf('rum') !== -1) {
    const rum = R.byId['rum'];
    out.push('<h2 class="sec">RUM / RUSM detail</h2><div class="panel">');
    out.push('<p class="sm"><b>Components.</b> ' + esc((rum.components || []).join(' · ')) +
      '<span class="cite">' + esc(rum.componentsSrc) + '</span></p>');
    out.push('<div class="sla"><b>Deliverable clock</b><span>' + esc(rum.timeline) + '</span></div>' +
      '<span class="cite">' + esc(rum.timelineSrc) + '</span>');
    out.push('<p class="sm" style="margin-top:9px"><b>Ask the client.</b> “' + esc(rum.clientQuestion) + '”</p>');
    out.push('<div class="scrollx"><table><thead><tr><th>Component</th><th>Deliverables</th></tr></thead><tbody>');
    const dl = rum.deliverables || {};
    Object.keys(dl).forEach((k) => {
      out.push('<tr><td><b>' + esc(k) + '</b></td><td>' + dl[k].map(esc).join('<br>') + '</td></tr>');
    });
    out.push('</tbody></table></div><span class="cite">' + esc(rum.deliverablesSrc) + '</span>');
    out.push('<div class="panel watch sm inset">' + gaps(rum.requiresSrc) + '</div></div>');
  }

  const rel = checklist.filter((c) => !c.appliesTo.length || c.appliesTo.some((id) => sel.indexOf(id) !== -1));
  out.push('<h2 class="sec">Coordinator validation checklist</h2><div class="panel">');
  out.push('<p class="sm soft"><b class="mono">' + rel.length + ' of ' + checklist.length +
    '</b> questions are relevant to this order. Confirm before finalising the schedule.' +
    '<span class="cite">' + esc(PRODUCTS_DATA.checklistSrc) + '</span></p><div class="stack">');
  rel.forEach((c) => {
    out.push('<div class="sm"><span class="chip">' + esc(c.id) + '</span> ' + esc(c.q) + '</div>');
  });
  out.push('</div></div>');

  el('plannerOut').innerHTML = out.join('');
}
