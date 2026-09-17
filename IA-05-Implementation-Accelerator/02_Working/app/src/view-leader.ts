// view-leader.ts — structural coverage of the module set. Filterable and
// sortable, but never a progress tracker: no learner has used this artifact,
// so there is no completion, score or timing data and none is invented.
//
// Signature interaction for this view: the self-paced / facilitated split bar
// fills from zero each time you land here. One small moment on arrival, on
// the single number a leader is most likely to be asked about. Nothing else
// in this view animates.

function stageModules(id: string): Module[] {
  return modules.filter((m) => m.stage === id);
}

function renderLeader(): void {
  const lf = state.leader;
  const total = modules.length;
  const selfN = modules.filter((m) => m.delivery === 'self').length;
  const liveN = total - selfN;
  const scenN = modules.filter((m) => !!m.scenario).length;
  const covered = stages.filter((s) => modules.some((m) => m.stage === s.id)).length;
  const ap = approvedCount();
  let todo = 0;
  modules.forEach((m) => {
    const x = JSON.stringify(m).match(/<TODO:/g);
    if (x) todo += x.length;
  });
  const selfPct = total ? Math.round(selfN / total * 100) : 0;

  const out: string[] = [];
  out.push('<div class="panel watch"><p class="sm" style="margin:0"><b>Structural coverage, not a progress ' +
    'tracker.</b> No learner has used this artifact, so there is no completion, score or timing data — ' +
    'and none is invented here. Every number below is counted from the module registry itself.</p></div>');

  out.push('<div class="stats">');
  out.push('<div class="stat"><div class="n mono">' + total + '</div><div class="l">modules in the registry</div></div>');
  out.push('<div class="stat"><div class="n mono">' + covered + '/' + stages.length + '</div><div class="l">Add-On journey stages covered</div></div>');
  out.push('<div class="stat"><div class="n mono">' + scenN + '/' + total + '</div><div class="l">modules with a practice scenario</div></div>');
  out.push('<div class="stat" style="border-left-color:' + (ap ? 'var(--clear)' : 'var(--watch)') + '">' +
    '<div class="n mono">' + ap + '/' + total + '</div><div class="l">past the SME approval gate</div></div>');
  out.push('</div>');

  out.push('<h2 class="sec">Self-paced versus facilitated</h2><div class="panel">');
  out.push('<div class="split" role="img" aria-label="' + selfN + ' of ' + total + ' modules self-paced, ' +
    liveN + ' facilitated">' +
    '<i class="fill-a" style="--to:' + selfPct + '%"></i>' +
    '<i class="fill-b" style="--to:' + (100 - selfPct) + '%"></i></div>');
  out.push('<p class="sm" style="margin:9px 0 0"><b class="mono">' + selfN + '</b> self-paced (' + selfPct +
    '%) · <b class="mono">' + liveN + '</b> facilitated / live (' + (100 - selfPct) + '%)</p>');
  out.push('<p class="xs soft" style="margin:6px 0 0">From each module’s <span class="mono">delivery</span> ' +
    'field, which follows the “(Recording)” marks in the training calendar. ' +
    '<span class="chip watch">gap</span> the workbook’s two Calendar sheets disagree about which sessions ' +
    'are recordings, so this split needs SME confirmation.</p>');
  out.push('</div>');

  const cnt = (s: StageDef) => stageModules(s.id).length;
  const apc = (s: StageDef) => {
    const ms = stageModules(s.id);
    return ms.length ? ms.filter(isApproved).length / ms.length : 1;
  };
  const sorted = stages.slice();
  if (lf.sort === 'modules') sorted.sort((a, b) => cnt(b) - cnt(a));
  else if (lf.sort === 'gate') sorted.sort((a, b) => apc(a) - apc(b));

  out.push('<h2 class="sec">Stage coverage</h2>');
  out.push('<div class="panel"><div class="row" style="margin-bottom:8px">');
  out.push('<span class="xs soft">Click a stage to filter the module list.</span><span class="grow"></span>');
  ([['journey', 'Journey order'], ['modules', 'Most modules'], ['gate', 'Least approved']] as const).forEach((s) => {
    out.push('<button class="btn" data-sort="' + s[0] + '" aria-pressed="' + (lf.sort === s[0] ? 'true' : 'false') + '">' + s[1] + '</button>');
  });
  out.push('</div><div class="scrollx"><table><thead><tr><th>#</th><th>Stage</th><th>Modules</th>' +
    '<th>Delivery</th><th>Practice</th><th>Gate</th></tr></thead><tbody>');
  sorted.forEach((s) => {
    const ms = stageModules(s.id);
    const on = lf.stage === s.id;
    const a = ms.filter(isApproved).length;
    out.push('<tr class="pick" tabindex="0" role="button" aria-selected="' + (on ? 'true' : 'false') +
      '" data-stage="' + esc(s.id) + '">');
    out.push('<td class="mono">' + (stageIx[s.id] + 1) + '</td>');
    out.push('<td><b>' + esc(s.label) + '</b><span class="cite">' + esc(s.id) + '</span></td>');
    out.push('<td>' + (ms.length
      ? ms.map((m) => '<span class="chip sig">' + esc(m.id) + '</span>').join(' ')
      : '<span class="chip block">none</span>') + '</td>');
    out.push('<td class="soft">' + (ms.length
      ? (ms.every((m) => m.delivery === 'self') ? 'self-paced'
        : ms.every((m) => m.delivery === 'live') ? 'live' : 'mixed')
      : '—') + '</td>');
    out.push('<td class="mono">' + (ms.filter((m) => !!m.scenario).length || '—') + '</td>');
    out.push('<td><span class="chip ' + (ms.length && a === ms.length ? 'clear' : 'watch') + '">' +
      (ms.length && a === ms.length ? '✓ ' : '') + a + '/' + ms.length + '</span></td>');
    out.push('</tr>');
  });
  out.push('</tbody></table></div><p class="cite" style="margin-top:9px">Stage list and order: ' +
    esc(MODULES_DATA.stagesSrc) + '</p></div>');

  const list = (lf.stage ? modules.filter((m) => m.stage === lf.stage) : modules.slice())
    .sort((a, b) => stageIx[a.stage] - stageIx[b.stage] || a.day - b.day);
  out.push('<h2 class="sec">Modules' + (lf.stage ? ' · filtered to ' + esc(stageLabel[lf.stage]) : '') + '</h2>');
  out.push('<div class="panel">');
  if (lf.stage) {
    out.push('<div class="row" style="margin-bottom:8px"><span class="chip sig">' + esc(stageLabel[lf.stage]) +
      '</span><button class="btn" id="bClearStage">Clear filter</button></div>');
  }
  out.push('<div class="scrollx"><table><thead><tr><th>ID</th><th>Title</th><th>Day</th><th>Delivery</th>' +
    '<th>Practice</th><th>Status</th></tr></thead><tbody>');
  list.forEach((m) => {
    out.push('<tr><td><span class="chip sig">' + esc(m.id) + '</span></td><td><b>' + esc(m.title) + '</b></td>' +
      '<td class="mono">' + esc(m.day) + '</td><td class="soft">' + (m.delivery === 'self' ? 'self-paced' : 'live') + '</td>' +
      '<td class="soft">' + (m.practice ? esc(m.practice) : '—') + '</td>' +
      '<td><span class="chip ' + (isApproved(m) ? 'clear' : 'watch') + '">' +
      (isApproved(m) ? '✓ ' : '○ ') + esc(reviewOf(m)) + '</span></td></tr>');
  });
  out.push('</tbody></table></div></div>');

  out.push('<h2 class="sec">What a leader can conclude today</h2><div class="panel"><ul class="sm bullets">');
  out.push('<li>All ' + stages.length + ' Add-On journey stages have at least one drafted module.</li>');
  out.push('<li><b>' + ap + ' of ' + total + '</b> modules have passed SME review. Until that moves, Learner withholds content by design.</li>');
  out.push('<li><b class="mono">' + todo + '</b> open gap markers remain inside module content, each naming the document or SME question it waits on.</li>');
  out.push('<li>Coverage is <b>Engagement Coordinator / Add-On only</b>; the other three implementation types and the EM role are selectable but deliberately unfilled.</li>');
  out.push('</ul></div>');

  el('leaderOut').innerHTML = out.join('');

  qsa(el('leaderOut'), '[data-stage]').forEach((tr) => {
    const pick = () => {
      const id = tr.getAttribute('data-stage') as StageId;
      setState((s) => { s.leader.stage = s.leader.stage === id ? null : id; });
    };
    tr.onclick = pick;
    tr.onkeydown = (e: KeyboardEvent) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); pick(); }
    };
  });
  onClick(el('leaderOut'), '[data-sort]', (b) => {
    setState((s) => { s.leader.sort = b.getAttribute('data-sort') as LeaderSort; });
  });
  const cs = elMaybe('bClearStage');
  if (cs) cs.onclick = () => setState((s) => { s.leader.stage = null; });
}
