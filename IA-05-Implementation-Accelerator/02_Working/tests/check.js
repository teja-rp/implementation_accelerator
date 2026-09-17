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

const modules = load('modules.json').modules;
const products = load('products.json').products;

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

// waveOf computes a product's go-live wave within a given selection.
//
//   - a product marked core or withCore is wave 1
//   - otherwise the wave is one more than the highest wave among its requires
//     entries that are present in `selected`
//   - 0 if none of its requires entries are present in `selected`
//
// `visiting` guards against cycles, so a malformed graph returns a number
// instead of blowing the stack.
function waveOf(id, selected, visiting) {
  const p = byId.get(id);
  if (!p) return 0;
  if (p.core || p.withCore) return 1;

  visiting = visiting || new Set();
  if (visiting.has(id)) return 0;
  visiting.add(id);

  let best = 0;
  for (const r of p.requires || []) {
    if (!selected.includes(r)) continue;
    const w = waveOf(r, selected, visiting) + 1;
    if (w > best) best = w;
  }

  visiting.delete(id);
  return best;
}

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

// blockers returns, for each selected product, any requires or integrateAfter
// id that is not itself in the selection — i.e. required by the order but
// missing from it.
function blockers(selected) {
  const out = {};
  for (const id of selected) {
    const p = byId.get(id);
    if (!p) continue;
    const needed = (p.requires || []).concat(p.integrateAfter || []);
    const missing = needed.filter(r => !selected.includes(r));
    if (missing.length) out[id] = missing;
  }
  return out;
}

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

console.log('');
console.log(passed + ' passed, ' + failed + ' failed');
process.exit(failed === 0 ? 0 : 1);
