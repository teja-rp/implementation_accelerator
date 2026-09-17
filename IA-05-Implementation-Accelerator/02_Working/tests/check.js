// check.js — data integrity and rule-engine checks for IA-05.
//
// Run it with:   node check.js
// from inside   02_Working/tests/
//
// This file's console output is the evidence pasted into the T-01 and T-03 rows
// of 00_Admin/STATUS.md. Paste what it actually prints — never a result you
// expected but did not observe.
//
// No dependencies. No network. Nothing beyond Node's own fs and path.

'use strict';

const fs = require('fs');
const path = require('path');

const DATA = path.join(__dirname, '..', 'data');

function load(name) {
  return JSON.parse(fs.readFileSync(path.join(DATA, name), 'utf8'));
}

const modulesDoc = load('modules.json');
const productsDoc = load('products.json');
const sourcesDoc = load('sources.json');

const modules = modulesDoc.modules;
const products = productsDoc.products;

// ---------------------------------------------------------------------------
// assert helper
// ---------------------------------------------------------------------------

let passed = 0;
let failed = 0;

function assert(name, condition, detail) {
  if (condition) {
    passed++;
    console.log('PASS ' + name);
  } else {
    failed++;
    console.log('FAIL ' + name + (detail ? ' — ' + detail : ''));
  }
}

// ---------------------------------------------------------------------------
// Reference data
// ---------------------------------------------------------------------------

// The seven Add-On journey stages, in journey order.
const STAGES = [
  'assignment',
  'research',
  'introduction',
  'data',
  'scheduling',
  'escalation',
  'eoe'
];

const productIds = new Set(products.map(p => p.id));
const byId = new Map(products.map(p => [p.id, p]));

// ---------------------------------------------------------------------------
// Data integrity — modules.json
// ---------------------------------------------------------------------------

console.log('--- modules.json ---');

// 1. No duplicate module ids.
const seenIds = new Set();
const dupeIds = [];
for (const m of modules) {
  if (seenIds.has(m.id)) dupeIds.push(m.id);
  seenIds.add(m.id);
}
assert('no duplicate module ids', dupeIds.length === 0, 'duplicated: ' + dupeIds.join(', '));

// 2. Every module stage is one of the seven valid stage ids.
const badStages = modules.filter(m => !STAGES.includes(m.stage)).map(m => m.id + '=' + m.stage);
assert('every module stage is a valid stage id', badStages.length === 0, badStages.join(', '));

// 3. Every module product is "any" or a real product id.
const badProducts = modules
  .filter(m => m.product !== 'any' && !productIds.has(m.product))
  .map(m => m.id + '=' + m.product);
assert('every module product is "any" or a real product id', badProducts.length === 0, badProducts.join(', '));

// 4. Every module has a non-empty steps array and a non-empty source.
const badSteps = modules
  .filter(m => !Array.isArray(m.steps) || m.steps.length === 0)
  .map(m => m.id);
assert('every module has a non-empty steps array', badSteps.length === 0, badSteps.join(', '));

const badSource = modules
  .filter(m => typeof m.source !== 'string' || m.source.trim() === '')
  .map(m => m.id);
assert('every module has a non-empty source', badSource.length === 0, badSource.join(', '));

// 5. Every scenario has exactly one option with verdict === "best".
const badBest = [];
for (const m of modules) {
  if (!m.scenario) continue;
  const opts = m.scenario.opts || [];
  const bestCount = opts.filter(o => o.verdict === 'best').length;
  if (bestCount !== 1) badBest.push(m.id + ' has ' + bestCount + ' "best"');
}
assert('every scenario has exactly one "best" option', badBest.length === 0, badBest.join(', '));

// 6. Every scenario option has a non-empty src.
const badOptSrc = [];
for (const m of modules) {
  if (!m.scenario) continue;
  (m.scenario.opts || []).forEach((o, i) => {
    if (typeof o.src !== 'string' || o.src.trim() === '') {
      badOptSrc.push(m.id + ' option ' + i);
    }
  });
}
assert('every scenario option has a non-empty src', badOptSrc.length === 0, badOptSrc.join(', '));

// ---------------------------------------------------------------------------
// Data integrity — products.json
// ---------------------------------------------------------------------------

console.log('--- products.json ---');

// 7. Every requires entry refers to a real product id.
const badRequires = [];
for (const p of products) {
  for (const r of p.requires || []) {
    if (!productIds.has(r)) badRequires.push(p.id + ' -> ' + r);
  }
}
assert('every requires entry refers to a real product id', badRequires.length === 0, badRequires.join(', '));

// 8. The product graph is acyclic.
function findCycle() {
  const state = new Map(); // 0 = unvisited, 1 = on stack, 2 = done
  let cycle = null;

  function visit(id, trail) {
    if (state.get(id) === 2) return;
    if (state.get(id) === 1) {
      cycle = trail.slice(trail.indexOf(id)).concat(id).join(' -> ');
      return;
    }
    state.set(id, 1);
    const p = byId.get(id);
    for (const r of (p && p.requires) || []) {
      if (!byId.has(r)) continue;
      visit(r, trail.concat(id));
      if (cycle) return;
    }
    state.set(id, 2);
  }

  for (const p of products) {
    visit(p.id, []);
    if (cycle) break;
  }
  return cycle;
}

const cycle = findCycle();
assert('product graph is acyclic', cycle === null, cycle);

// ---------------------------------------------------------------------------
// Rule engine — go-live waves
// ---------------------------------------------------------------------------

// The rule engine is NOT reimplemented here. It is extracted verbatim from the
// artifact's RULE-ENGINE block and evaluated, so these assertions run against
// the exact code the Planner uses. One implementation, tested — rather than two
// that can silently drift apart.
//
// The block is a pure factory: makeRules(products) -> { waveOf, blockers,
// blockedSet, blockReason }. It closes over nothing but its argument, so it is
// safe to lift out of the browser and run under Node.

const APP_FOR_RULES = path.join(__dirname, '..', 'app', 'app.html');

function loadRuleEngine() {
  const html = fs.readFileSync(APP_FOR_RULES, 'utf8');
  const begin = html.indexOf('RULE-ENGINE:BEGIN');
  // lastIndexOf for the closing marker, so a stray mention earlier in the file
  // cannot truncate the slice.
  const end = html.lastIndexOf('RULE-ENGINE:END');
  if (begin === -1 || end === -1) throw new Error('rule-engine markers not found in app.html');
  if (end < begin) throw new Error('rule-engine markers are out of order in app.html');
  // Take whole lines strictly between the two marker lines, so the marker text
  // itself never lands in the evaluated source.
  const from = html.indexOf('\n', begin) + 1;
  const to = html.lastIndexOf('\n', end) + 1;
  if (from === 0 || to <= from) throw new Error('could not delimit the rule-engine block');
  const src = html.slice(from, to);
  if (!/function\s+makeRules\s*\(/.test(src)) {
    throw new Error('the RULE-ENGINE block does not define makeRules()');
  }
  // eslint-disable-next-line no-new-func
  return new Function(src + '\n;return makeRules;')();
}

let makeRules = null;
let ruleLoadError = null;
try {
  makeRules = loadRuleEngine();
} catch (e) {
  ruleLoadError = e;
}

console.log('--- rule engine: shared with the artifact ---');
assert(
  'app.html exposes a makeRules() rule engine between its RULE-ENGINE markers',
  makeRules !== null,
  ruleLoadError && ruleLoadError.message
);

if (!makeRules) {
  console.log('');
  console.log(passed + ' passed, ' + (failed + 1) + ' failed');
  console.log('cannot continue: the rule-engine assertions below all depend on it.');
  process.exit(1);
}

const R = makeRules(products);
const waveOf = (id, selected, visiting) => R.waveOf(id, selected, visiting);
const blockers = selected => R.blockers(selected);

assert(
  'the extracted engine exposes waveOf, blockers, blockedSet and blockReason',
  ['waveOf', 'blockers', 'blockedSet', 'blockReason'].every(k => typeof R[k] === 'function'),
  'got: ' + Object.keys(R).join(', ')
);

console.log('--- rule engine: go-live waves ---');

const sel1 = ['onesite', 'payments', 'loftleasing'];
const w1 = id => waveOf(id, sel1);
assert(
  'onesite < payments < loftleasing',
  w1('onesite') < w1('payments') && w1('payments') < w1('loftleasing'),
  'onesite=' + w1('onesite') + ' payments=' + w1('payments') + ' loftleasing=' + w1('loftleasing')
);

const sel2 = ['onesite', 'payments', 'loftliving', 'loyalty'];
const w2 = id => waveOf(id, sel2);
assert(
  'loyalty comes after both loftliving and payments',
  w2('loyalty') > w2('loftliving') && w2('loyalty') > w2('payments'),
  'loyalty=' + w2('loyalty') + ' loftliving=' + w2('loftliving') + ' payments=' + w2('payments')
);

const sel3 = ['onesite', 'payments', 'loftliving', 'loftleasing', 'knock', 'website'];
const w3 = id => waveOf(id, sel3);
const websiteWave = w3('website');
const otherWaves3 = sel3.filter(id => id !== 'website').map(w3);
assert(
  'website has the highest wave',
  otherWaves3.every(w => websiteWave > w),
  'website=' + websiteWave + ' others=' + otherWaves3.join(',')
);

const sel4 = ['esupply', 'ccaa', 'acctg'];
const waves4 = sel4.map(id => waveOf(id, sel4));
assert(
  'independent products are all wave 0',
  waves4.every(w => w === 0),
  sel4.map((id, i) => id + '=' + waves4[i]).join(' ')
);

const sel5 = ['onesite', 'screening', 'odes', 'facilities', 'maint'];
const waves5 = sel5.map(id => waveOf(id, sel5));
assert(
  'core and go-with-core products are all wave 1',
  waves5.every(w => w === 1),
  sel5.map((id, i) => id + '=' + waves5[i]).join(' ')
);

// ---------------------------------------------------------------------------
// Rule engine — missing prerequisites
// ---------------------------------------------------------------------------

console.log('--- rule engine: missing prerequisites ---');

const bLoftleasing = blockers(['loftleasing']);
assert(
  'loftleasing alone reports payments missing',
  bLoftleasing.loftleasing && bLoftleasing.loftleasing.indexOf('payments') !== -1,
  JSON.stringify(bLoftleasing)
);

const bPayments = blockers(['payments']);
assert(
  'payments alone reports onesite missing',
  bPayments.payments && bPayments.payments.indexOf('onesite') !== -1,
  JSON.stringify(bPayments)
);

const fullOrder = products.map(p => p.id);
const bFull = blockers(fullOrder);
assert(
  'the full clean order reports no blockers',
  Object.keys(bFull).length === 0,
  JSON.stringify(bFull)
);

// ---------------------------------------------------------------------------
// Rule engine — blocking, including transitively
//
// These close a blind spot the earlier suite had. Every wave assertion above
// uses a selection whose prerequisites are present, so `waveOf` returning 0
// for "no prerequisite" and 0 for "prerequisite missing from the order" was
// indistinguishable — and a blocked product could be presented as ready to go
// first. `blockedSet` is what separates the two, so it needs its own cases.
// ---------------------------------------------------------------------------

console.log('--- rule engine: blocking ---');

// A product whose own prerequisite is absent is blocked.
const bs1 = R.blockedSet(['payments']);
assert(
  'payments alone is blocked (onesite absent)',
  bs1.payments === true,
  JSON.stringify(bs1)
);

// Genuinely independent products are NOT blocked, even though they are also
// wave 0 — this is the distinction the old suite could not make.
const indep = ['esupply', 'ccaa', 'acctg'];
const bs2 = R.blockedSet(indep);
assert(
  'independent products are wave 0 but NOT blocked',
  Object.keys(bs2).length === 0 && indep.every(id => R.waveOf(id, indep) === 0),
  'blocked=' + JSON.stringify(bs2)
);

// Transitive: prerequisites present, but themselves stalled.
const sel6 = ['payments', 'loftleasing', 'loyalty', 'loftliving'];
const bs3 = R.blockedSet(sel6);
assert(
  'loftleasing is blocked transitively when payments is present but stalled',
  bs3.loftleasing === true,
  JSON.stringify(bs3)
);
assert(
  'loyalty is blocked transitively via loftliving and payments',
  bs3.loyalty === true,
  JSON.stringify(bs3)
);
assert(
  'every product in a OneSite-less renter-engagement order is blocked',
  sel6.every(id => bs3[id] === true),
  JSON.stringify(bs3)
);

// blockReason separates "not on the order" from "on the order but stalled".
const why = R.blockReason('loftleasing', sel6);
assert(
  'blockReason reports loftleasing as stalled on payments, not as missing it',
  why.stalled.indexOf('payments') !== -1 && why.missing.indexOf('payments') === -1,
  JSON.stringify(why)
);
const why2 = R.blockReason('payments', sel6);
assert(
  'blockReason reports payments as missing onesite',
  why2.missing.indexOf('onesite') !== -1,
  JSON.stringify(why2)
);

// A satisfiable order blocks nothing.
const bs4 = R.blockedSet(fullOrder);
assert(
  'the full clean order blocks nothing',
  Object.keys(bs4).length === 0,
  JSON.stringify(bs4)
);

// integrateAfter must NOT block a go-live: the source explicitly allows Knock
// and Accounting Entity to go live first and integrate with OneSite later.
const bs5 = R.blockedSet(['knock', 'acctg']);
assert(
  'integrateAfter alone does not block (knock, acctg without onesite)',
  Object.keys(bs5).length === 0,
  JSON.stringify(bs5)
);
// ...but it is still reported as missing from the order.
const b5 = blockers(['knock', 'acctg']);
assert(
  'integrateAfter is still reported as missing from the order',
  b5.knock && b5.knock.indexOf('onesite') !== -1 && b5.acctg && b5.acctg.indexOf('onesite') !== -1,
  JSON.stringify(b5)
);

// Every integrateAfter target must be a real product id (previously unguarded).
const badIntegrate = [];
for (const p of products) {
  for (const r of p.integrateAfter || []) {
    if (!productIds.has(r)) badIntegrate.push(p.id + ' -> ' + r);
  }
}
assert(
  'every integrateAfter entry refers to a real product id',
  badIntegrate.length === 0,
  badIntegrate.join(', ')
);

// ---------------------------------------------------------------------------
// Content integrity — no placeholder content left where real content belongs
// ---------------------------------------------------------------------------

console.log('--- content integrity ---');

const STAGE_SET = new Set(STAGES);
const DELIVERIES = new Set(['self', 'live']);
const PRACTICES = new Set(['decision', 'guardrail']);

// Every stage in the Add-On journey has at least one module.
const uncovered = STAGES.filter(s => !modules.some(m => m.stage === s));
assert('every journey stage has at least one module', uncovered.length === 0, uncovered.join(', '));

// delivery drives the Leader view's self-paced/live split, so it must be valid.
const badDelivery = modules.filter(m => !DELIVERIES.has(m.delivery)).map(m => m.id + '=' + m.delivery);
assert('every module delivery is "self" or "live"', badDelivery.length === 0, badDelivery.join(', '));

// practice is "decision", "guardrail" or null — and must be set iff a scenario exists.
const badPractice = modules
  .filter(m => m.practice !== null && !PRACTICES.has(m.practice))
  .map(m => m.id + '=' + m.practice);
assert('every module practice is decision, guardrail or null', badPractice.length === 0, badPractice.join(', '));

const practiceMismatch = modules
  .filter(m => (m.practice !== null) !== !!m.scenario)
  .map(m => m.id);
assert('practice is set exactly when a scenario exists', practiceMismatch.length === 0, practiceMismatch.join(', '));

// day must sit inside the 10-day training agenda.
const badDay = modules
  .filter(m => !Number.isInteger(m.day) || m.day < 1 || m.day > 10)
  .map(m => m.id + '=' + m.day);
assert('every module day is an integer 1-10', badDay.length === 0, badDay.join(', '));

// Titles, objectives and next steps must be real text, not leftover placeholders.
const placeholder = [];
for (const m of modules) {
  for (const f of ['title', 'objective', 'next', 'source']) {
    const v = m[f];
    if (typeof v !== 'string' || v.trim() === '' || v.indexOf('<TODO') !== -1) {
      placeholder.push(m.id + '.' + f);
    }
  }
}
assert('title/objective/next/source carry real content, not <TODO', placeholder.length === 0, placeholder.join(', '));

// A scenario option's feedback and citation must both be real.
const badOpt = [];
for (const m of modules) {
  if (!m.scenario) continue;
  if (typeof m.scenario.q !== 'string' || m.scenario.q.trim() === '') badOpt.push(m.id + '.q');
  (m.scenario.opts || []).forEach((o, i) => {
    if (typeof o.t !== 'string' || o.t.trim() === '') badOpt.push(m.id + '.opts[' + i + '].t');
    if (typeof o.fb !== 'string' || o.fb.trim() === '') badOpt.push(m.id + '.opts[' + i + '].fb');
    if (!['best', 'ok', 'poor'].includes(o.verdict)) badOpt.push(m.id + '.opts[' + i + '].verdict');
  });
}
assert('every scenario question, option, feedback and verdict is populated', badOpt.length === 0, badOpt.join(', '));

// The approval gate must actually start closed: the shipped data approves nothing.
const APPROVED_RE = /^approved\b/i;
const shippedApproved = modules.filter(m => APPROVED_RE.test(String(m.review || ''))).map(m => m.id);
assert(
  'no module ships pre-approved (the gate starts closed)',
  shippedApproved.length === 0,
  'pre-approved: ' + shippedApproved.join(', ')
);

const missingReview = modules
  .filter(m => typeof m.review !== 'string' || m.review.trim() === '')
  .map(m => m.id);
assert('every module carries a review status', missingReview.length === 0, missingReview.join(', '));

// No real client name should survive anywhere in the shipped data. The SOP's
// meeting-invite example carried one; it must read PMC instead.
const CLIENT_NAMES = ['ZRS'];
const leaked = [];
const dataBlob = JSON.stringify(modulesDoc) + JSON.stringify(productsDoc);
for (const name of CLIENT_NAMES) {
  if (new RegExp('\\b' + name + '\\b').test(dataBlob)) leaked.push(name);
}
assert('no known real client name appears in the data', leaked.length === 0, 'found: ' + leaked.join(', '));

// ---------------------------------------------------------------------------
// Coordinator Validation Checklist
// ---------------------------------------------------------------------------

console.log('--- validation checklist ---');

const checklist = productsDoc.validationChecklist || [];
assert('the Coordinator Validation Checklist has 10 questions', checklist.length === 10, 'found ' + checklist.length);

const badChecklist = [];
const seenVc = new Set();
for (const c of checklist) {
  if (!c.id || seenVc.has(c.id)) badChecklist.push('duplicate or missing id: ' + c.id);
  seenVc.add(c.id);
  if (typeof c.q !== 'string' || c.q.trim() === '') badChecklist.push(c.id + ' has no question text');
  if (!Array.isArray(c.appliesTo)) badChecklist.push(c.id + ' has no appliesTo array');
  for (const id of c.appliesTo || []) {
    if (!productIds.has(id)) badChecklist.push(c.id + ' -> unknown product ' + id);
  }
}
assert('every checklist entry is well formed and maps to real products', badChecklist.length === 0, badChecklist.join('; '));

// ---------------------------------------------------------------------------
// sources.json
// ---------------------------------------------------------------------------

console.log('--- sources.json ---');

const sources = sourcesDoc.sources || [];
assert('sources.json lists at least one source', sources.length > 0, 'found ' + sources.length);

const moduleIds = new Set(modules.map(m => m.id));
const badUsedBy = [];
for (const s of sources) {
  for (const id of s.usedByModules || []) {
    if (!moduleIds.has(id)) badUsedBy.push(s.doc + ' -> ' + id);
  }
}
assert('every usedByModules entry names a real module', badUsedBy.length === 0, badUsedBy.join(', '));

const ORIGINALS = path.join(__dirname, '..', '..', '01_Sponsor_Inputs', 'originals');
const onDisk = fs.existsSync(ORIGINALS) ? new Set(fs.readdirSync(ORIGINALS)) : new Set();
const missingOriginals = sources.filter(s => !onDisk.has(s.doc)).map(s => s.doc);
assert(
  'every source in sources.json is present in 01_Sponsor_Inputs/originals/',
  missingOriginals.length === 0,
  'missing: ' + missingOriginals.join(', ')
);

// gaps[] drives the Owner view's gap table, so it needs the same care as the
// rest of the data. Previously unguarded.
const gapsArr = sourcesDoc.gaps || [];
const gapProblems = [];
const seenGap = new Set();
for (const g of gapsArr) {
  if (!g.id || seenGap.has(g.id)) gapProblems.push('duplicate or missing id: ' + g.id);
  seenGap.add(g.id);
  for (const f of ['doc', 'where', 'finding', 'affects']) {
    if (typeof g[f] !== 'string' || g[f].trim() === '') gapProblems.push(g.id + ' has no ' + f);
  }
  if (g.doc && !onDisk.has(g.doc)) gapProblems.push(g.id + ' names a document not in originals/: ' + g.doc);
}
assert('every gap entry is well formed and names a real document', gapProblems.length === 0, gapProblems.join('; '));
assert('sources.json carries a gapsNote explaining the gap list',
  typeof sourcesDoc.gapsNote === 'string' && sourcesDoc.gapsNote.trim() !== '');

// ---------------------------------------------------------------------------
// app.html inline data parity
//
// The artifact inlines its JSON so it works from a plain file:// double-click,
// where fetch() is blocked. That means two copies of the data exist, so this
// check exists to stop them drifting apart. Compares parsed structures, not
// bytes, so formatting may differ but content may not.
// ---------------------------------------------------------------------------

console.log('--- app.html inline data parity ---');

const APP = path.join(__dirname, '..', 'app', 'app.html');

function inlineJSON(html, id) {
  const re = new RegExp(
    '<script[^>]*type="application/json"[^>]*id="' + id + '"[^>]*>([\\s\\S]*?)</script>'
  );
  const m = re.exec(html);
  if (!m) throw new Error('no inline JSON block with id "' + id + '"');
  return JSON.parse(m[1]);
}

function deepEqual(a, b, trail) {
  trail = trail || '$';
  if (a === b) return null;
  if (typeof a !== typeof b) return trail + ': type ' + typeof a + ' vs ' + typeof b;
  if (a === null || b === null) return trail + ': null mismatch';
  if (Array.isArray(a) !== Array.isArray(b)) return trail + ': array vs object';
  if (Array.isArray(a)) {
    if (a.length !== b.length) return trail + ': length ' + a.length + ' vs ' + b.length;
    for (let i = 0; i < a.length; i++) {
      const d = deepEqual(a[i], b[i], trail + '[' + i + ']');
      if (d) return d;
    }
    return null;
  }
  if (typeof a === 'object') {
    const ka = Object.keys(a).sort();
    const kb = Object.keys(b).sort();
    if (ka.join(',') !== kb.join(',')) {
      const only = ka.filter(k => !kb.includes(k)).concat(kb.filter(k => !ka.includes(k)));
      return trail + ': key mismatch (' + only.join(', ') + ')';
    }
    for (const k of ka) {
      const d = deepEqual(a[k], b[k], trail + '.' + k);
      if (d) return d;
    }
    return null;
  }
  return trail + ': ' + JSON.stringify(a) + ' vs ' + JSON.stringify(b);
}

if (!fs.existsSync(APP)) {
  assert('app/app.html exists', false, APP + ' not found');
} else {
  const html = fs.readFileSync(APP, 'utf8');

  [
    ['data-modules', modulesDoc, 'modules.json'],
    ['data-products', productsDoc, 'products.json'],
    ['data-sources', sourcesDoc, 'sources.json']
  ].forEach(([id, canonical, name]) => {
    let diff;
    try {
      diff = deepEqual(inlineJSON(html, id), canonical);
    } catch (e) {
      diff = e.message;
    }
    assert('app.html inline "' + id + '" matches ' + name, diff === null, diff);
  });

  // The artifact must not reach the network or carry a credential.
  const forbidden = [
    [/\bfetch\s*\(/, 'fetch( call'],
    [/XMLHttpRequest/, 'XMLHttpRequest'],
    [/<script[^>]+\bsrc\s*=/i, 'external <script src>'],
    [/<link[^>]+stylesheet/i, 'external stylesheet'],
    [/\bhttps?:\/\/(?!www\.w3\.org)/i, 'external http(s) URL'],
    [/\b(api[_-]?key|secret|bearer|authorization:)\b/i, 'credential-shaped string']
  ];
  const hits = forbidden.filter(([re]) => re.test(html)).map(([, label]) => label);
  assert('app.html makes no network call and carries no credential', hits.length === 0, 'found: ' + hits.join(', '));

  // ---- SPA structure -------------------------------------------------------
  // These guard the architecture the build spec asks for, so a later edit
  // cannot quietly regress the router or the accessibility wiring.
  console.log('--- artifact structure ---');

  const VIEWS = ['learner', 'planner', 'leader', 'owner'];

  const missingPanels = VIEWS.filter(v => {
    const re = new RegExp('<section[^>]*role="tabpanel"[^>]*id="view-' + v + '"[^>]*aria-labelledby="tab-' + v + '"');
    const re2 = new RegExp('<section[^>]*id="view-' + v + '"[^>]*role="tabpanel"[^>]*aria-labelledby="tab-' + v + '"');
    return !(re.test(html) || re2.test(html));
  });
  assert('all four views are tabpanels labelled by their tab', missingPanels.length === 0, missingPanels.join(', '));

  const missingTabs = VIEWS.filter(v => !new RegExp('id="tab-' + v + '"[^>]*role="tab"|role="tab"[^>]*id="tab-' + v + '"').test(html));
  assert('all four tabs declare role="tab"', missingTabs.length === 0, missingTabs.join(', '));

  const missingLive = VIEWS.filter(v => !new RegExp('id="' + v + 'Out"[^>]*aria-live|aria-live[^>]*id="' + v + 'Out"').test(html));
  assert('every view output region is an aria-live region', missingLive.length === 0, missingLive.join(', '));

  assert('the hash router handles hashchange', /addEventListener\('hashchange'/.test(html));
  assert('the router recognises all four view routes',
    VIEWS.every(v => html.indexOf("'" + v + "'") !== -1) && /#\/'\s*\+\s*view|'#\/'\s*\+/.test(html));
  assert('motion is gated behind prefers-reduced-motion', /@media \(prefers-reduced-motion: reduce\)/.test(html));
  assert('both colour schemes are defined', /prefers-color-scheme: light/.test(html) && /--ground/.test(html));
  assert('the planner renders an inline SVG dependency graph', /<svg class="dep"/.test(html));
  assert('the SVG graph is labelled for assistive tech', /role="img"/.test(html) && /<title id="depT">/.test(html));
  assert('the owner registry exposes a cycling review control', /data-cyc=/.test(html));
  // The three JSON parses must sit inside a try/catch that renders a visible
  // panel, so a malformed data block cannot leave the reviewer a blank page.
  // Matched on the mechanism rather than on any one variable name.
  const bootFn = (/function boot\(\)\s*\{[\s\S]*?\n\}/.exec(html) || [''])[0];
  assert('the three data blocks are parsed inside boot()',
    /readJSON\(['"]data-modules['"]\)/.test(bootFn) &&
    /readJSON\(['"]data-products['"]\)/.test(bootFn) &&
    /readJSON\(['"]data-sources['"]\)/.test(bootFn),
    'boot() does not parse all three blocks');
  assert('data parsing is guarded so a bad block cannot blank the page',
    /try\s*\{[\s\S]*?readJSON[\s\S]*?\}\s*catch/.test(bootFn) && /showBootError/.test(bootFn),
    'no try/catch around the parses in boot()');
  assert('the failure path renders a visible error panel',
    /Data failed to load/.test(html) && /function showBootError/.test(html));
  assert('review overrides are not persisted to storage',
    !/overrides/.test((/function savePrefs\(\)[\s\S]*?\n}/.exec(html) || [''])[0]));

  // The rule engine must exist in exactly one place: here, extracted from the
  // artifact. This file must not carry its own copy.
  const selfSrc = fs.readFileSync(__filename, 'utf8');
  assert('check.js does not define its own waveOf/blockers (single implementation)',
    !/^\s*function\s+(waveOf|blockers|blockedSet)\s*\(/m.test(selfSrc),
    'a duplicate rule-engine definition has reappeared in check.js');
}

// ---------------------------------------------------------------------------
// Submission copy
//
// 03_Final_Submission/artifact/ holds the copy a reviewer opens. Editing the
// working copy and forgetting to re-copy it is the easy mistake, so this
// checks the two are identical byte for byte. Skipped quietly until the
// submission copy exists.
// ---------------------------------------------------------------------------

const SUB = path.join(__dirname, '..', '..', '03_Final_Submission', 'artifact');

if (fs.existsSync(path.join(SUB, 'app.html'))) {
  console.log('--- submission copy ---');
  const pairs = [
    ['app.html', path.join(__dirname, '..', 'app', 'app.html')],
    ['modules.json', path.join(DATA, 'modules.json')],
    ['products.json', path.join(DATA, 'products.json')],
    ['sources.json', path.join(DATA, 'sources.json')]
  ];
  for (const [name, srcPath] of pairs) {
    const subPath = path.join(SUB, name);
    let same = false;
    let detail = '';
    if (!fs.existsSync(subPath)) {
      detail = 'missing from 03_Final_Submission/artifact/';
    } else {
      const a = fs.readFileSync(srcPath);
      const b = fs.readFileSync(subPath);
      same = a.equals(b);
      if (!same) detail = 'differs from the working copy — re-copy it';
    }
    assert('submission copy of ' + name + ' matches the working copy', same, detail);
  }
}

// ---------------------------------------------------------------------------

console.log('');
console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
