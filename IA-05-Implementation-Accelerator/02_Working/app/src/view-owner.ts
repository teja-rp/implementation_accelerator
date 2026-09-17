// view-owner.ts — source library, documented gaps, module registry, and the
// approval gate that decides what Learner may show.
//
// Signature interaction for this view: the review badge. One click cycles
// drafted -> in review -> approved, the badge changes shape and colour on the
// spot, and Learner's available modules change with it. The moment of delight
// here is also the governance demo, so it is worth making crisp.

/** Normalise any review string to one of the three cycle positions. */
function reviewShort(r: string): string {
  if (/^approved/i.test(r)) return 'approved';
  if (/^in review/i.test(r)) return 'in review';
  return 'drafted';
}

/** Paired glyph so the status is never signalled by colour alone. */
function reviewGlyph(short: string): string {
  return short === 'approved' ? '✓' : short === 'in review' ? '◑' : '○';
}

function renderOwner(): void {
  const ap = approvedCount();
  const out: string[] = [];

  out.push('<h2 class="sec">Approval gate</h2>');
  out.push('<div class="panel' + (ap ? ' clear' : ' block') + '">');
  out.push('<p class="sm" style="margin:0 0 9px"><b class="mono">' + ap + ' of ' + modules.length +
    '</b> modules are past the gate. All ' + modules.length + ' ship as <span class="mono">drafted</span>, ' +
    'because no RealPage SME has reviewed the drafted content.</p>');
  out.push('<p class="sm soft" style="margin:0 0 10px">Click a status badge in the registry to cycle it ' +
    '<span class="mono">drafted → in review → approved</span>. Learner updates immediately — ' +
    'that is the gate working, not a badge changing colour. Changes live in this page only: they are ' +
    '<b>not</b> written to storage and do not survive a reload, so an approval can never outlive the ' +
    'content it approved.</p>');
  out.push('<div class="row"><div class="revfield"><label class="fl" for="fRev">Reviewer name (stamped on approvals)</label>' +
    '<input type="text" id="fRev" placeholder="Your full name" value="' + esc(state.owner.reviewer) + '"></div>');
  out.push('<button class="btn" id="bResetAp">Reset all to shipped state</button></div>');
  out.push('</div>');

  out.push('<h2 class="sec">Module registry</h2><div class="panel scrollx"><table>');
  out.push('<thead><tr><th>ID</th><th>Title</th><th>Stage</th><th>Day</th><th>Delivery</th><th>Review status</th></tr></thead><tbody>');
  modules.forEach((m) => {
    const short = reviewShort(reviewOf(m));
    out.push('<tr><td><span class="chip sig">' + esc(m.id) + '</span></td>');
    out.push('<td><b>' + esc(m.title) + '</b><span class="cite">' + esc(m.source) + '</span></td>');
    out.push('<td class="soft">' + esc(stageLabel[m.stage]) + '</td><td class="mono">' + esc(m.day) + '</td>');
    out.push('<td class="soft">' + (m.delivery === 'self' ? 'self-paced' : 'live') + '</td>');
    out.push('<td><button class="cyc" data-cyc="' + esc(m.id) + '" data-s="' + esc(short) +
      '" aria-label="Review status of ' + esc(m.id) + ': ' + esc(short) + '. Activate to cycle."><span class="g">' +
      reviewGlyph(short) + '</span> ' + esc(short) + '</button>');
    if (short === 'approved' && state.owner.reviewer) out.push('<span class="cite">by ' + esc(state.owner.reviewer) + '</span>');
    if (!Object.prototype.hasOwnProperty.call(state.owner.overrides, m.id)) {
      out.push('<span class="cite">shipped: ' + esc(m.review) + '</span>');
    }
    out.push('</td></tr>');
  });
  out.push('</tbody></table></div>');

  out.push('<h2 class="sec">Gaps found in the source set</h2>');
  out.push('<div class="panel watch"><p class="sm" style="margin:0">' + esc(SOURCES_DATA.gapsNote) + '</p></div>');
  out.push('<div class="panel scrollx"><table><thead><tr><th>ID</th><th>Document</th><th>Where</th>' +
    '<th>Finding</th><th>Affects</th></tr></thead><tbody>');
  (SOURCES_DATA.gaps || []).forEach((g) => {
    out.push('<tr><td><span class="chip watch">' + esc(g.id) + '</span></td><td class="sm">' + esc(g.doc) + '</td>' +
      '<td class="mono xs">' + esc(g.where) + '</td><td class="sm">' + esc(g.finding) + '</td>' +
      '<td class="soft">' + esc(g.affects) + '</td></tr>');
  });
  out.push('</tbody></table></div>');

  out.push('<h2 class="sec">Source library</h2>');
  out.push('<div class="panel"><p class="sm soft" style="margin:0">' + (SOURCES_DATA.sources || []).length +
    ' sponsor-provided documents. Office files were converted to plain text by a local ZIP/XML parser — ' +
    'no model, no key, no network. Originals are held unmodified in the team’s Teams channel connected ' +
    'SharePoint workspace under <span class="mono">01_Sponsor_Inputs/originals/</span>.</p></div>');
  out.push('<div class="panel scrollx"><table><thead><tr><th>Document</th><th>Version</th><th>Ingest</th>' +
    '<th>Sponsor</th><th>Used by</th></tr></thead><tbody>');
  (SOURCES_DATA.sources || []).forEach((s) => {
    out.push('<tr><td class="sm"><b>' + esc(s.doc) + '</b></td><td class="sm">' + gaps(s.version) + '</td>' +
      '<td class="mono xs">' + esc(s.mode) + '</td><td>' +
      (s.sponsorProvided ? '<span class="chip clear">✓ yes</span>' : '<span class="chip">no</span>') + '</td>' +
      '<td class="sm">' + (s.usedByModules.length
        ? s.usedByModules.map((i) => '<span class="chip sig">' + esc(i) + '</span>').join(' ')
        : '<span class="soft">context only</span>') + '</td></tr>');
  });
  out.push('</tbody></table></div>');

  out.push('<h2 class="sec">Boundaries this artifact keeps</h2><div class="panel"><ul class="sm bullets">');
  out.push('<li><b>No inference at run time.</b> All AI work happened at authoring time. This page reads its own inlined data and applies documented rules.</li>');
  out.push('<li><b>No network calls, no credentials.</b> Nothing to configure, nothing to leak.</li>');
  out.push('<li><b>No real client names.</b> Every customer and property-management-company name is the placeholder <span class="mono">PMC</span>.</li>');
  out.push('<li><b>Human review is a gate, not a label.</b> Drafted modules are withheld from Learner until approved here.</li>');
  out.push('<li><b>Gaps are shown, never filled.</b> Every open marker names the document or question it waits on.</li>');
  out.push('</ul></div>');

  el('ownerOut').innerHTML = out.join('');

  (el('fRev') as HTMLInputElement).oninput = (e: Event) => {
    state.owner.reviewer = (e.target as HTMLInputElement).value;
  };
  el('bResetAp').onclick = () => setState((s) => { s.owner.overrides = {}; });

  qsa(el('ownerOut'), '[data-cyc]').forEach((b) => {
    b.onclick = () => {
      const id = b.getAttribute('data-cyc') as string;
      const cur = b.getAttribute('data-s') as string;
      const next = REVIEW_CYCLE[(REVIEW_CYCLE.indexOf(cur) + 1) % REVIEW_CYCLE.length];
      setState((s) => { s.owner.overrides[id] = next; });
      const again = el('ownerOut').querySelector('[data-cyc="' + id + '"]') as HTMLElement | null;
      if (again) {
        again.focus();
        // Re-trigger the state-change flourish on the rebuilt button.
        again.classList.remove('bump');
        void again.offsetWidth;
        again.classList.add('bump');
      }
    };
  });
}
