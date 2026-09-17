// rules.ts — the canonical rule engine.
//
// This is the single source of truth for go-live sequencing. It is NOT
// duplicated in the test suite: 02_Working/tests/check.js slices the compiled
// form of this file out of app.html (between the two marker lines below),
// evaluates it, and runs its assertions against these exact functions. So the
// Planner's live computation and the tested logic are the same code by
// construction, even though one is TypeScript source and the other is the
// compiled output.
//
// Keep the markers on their own lines and do not write either token inside the
// block; the extractor matches them literally.
//
// Semantics, all traceable to "Product Dependency Workflow (EC Training
// Module)":
//
//   waveOf      core/withCore products are wave 1 (the OneSite cluster).
//               Otherwise one more than the highest wave among the `requires`
//               entries present in the selection; 0 when none are present.
//               Only meaningful for products that are not blocked.
//
//   blockedSet  Blocked when any `requires` entry is absent from the
//               selection, or when a required product that IS present is
//               itself blocked. The second clause makes blockage transitive.
//               Only `requires` blocks a go-live; `integrateAfter` does not,
//               because the source lets those products go live first and
//               integrate afterwards (Knock, Accounting Entity).
//
//   blockers    Reporting helper: per selected product, which `requires` or
//               `integrateAfter` ids are missing from the order. "What is
//               absent" is a different question from "what cannot be
//               sequenced".

// RULE-ENGINE:BEGIN
function makeRules(products: Product[]): Rules {
  const byId: Record<string, Product> = {};
  products.forEach((p) => { byId[p.id] = p; });

  function waveOf(id: string, selected: string[], visiting?: Record<string, boolean>): number {
    const p = byId[id];
    if (!p) return 0;
    if (p.core || p.withCore) return 1;

    const seen: Record<string, boolean> = visiting || {};
    if (seen[id]) return 0;
    seen[id] = true;

    let best = 0;
    (p.requires || []).forEach((r) => {
      if (selected.indexOf(r) === -1) return;
      const w = waveOf(r, selected, seen) + 1;
      if (w > best) best = w;
    });

    delete seen[id];
    return best;
  }

  function blockers(selected: string[]): Record<string, string[]> {
    const out: Record<string, string[]> = {};
    selected.forEach((id) => {
      const p = byId[id];
      if (!p) return;
      const needed = (p.requires || []).concat(p.integrateAfter || []);
      const missing = needed.filter((r) => selected.indexOf(r) === -1);
      if (missing.length) out[id] = missing;
    });
    return out;
  }

  // Transitive. The product graph is asserted acyclic by check.js, so the
  // visiting guard is belt-and-braces against malformed data rather than an
  // expected code path.
  function blockedSet(selected: string[]): Record<string, boolean> {
    const memo: Record<string, boolean> = {};

    function isBlocked(id: string, visiting: Record<string, boolean>): boolean {
      if (Object.prototype.hasOwnProperty.call(memo, id)) return memo[id];
      if (visiting[id]) return false;
      visiting[id] = true;

      const p = byId[id];
      let blocked = false;
      if (p) {
        const req = p.requires || [];
        for (let i = 0; i < req.length; i++) {
          if (selected.indexOf(req[i]) === -1) { blocked = true; break; }
          if (isBlocked(req[i], visiting)) { blocked = true; break; }
        }
      }

      delete visiting[id];
      memo[id] = blocked;
      return blocked;
    }

    const out: Record<string, boolean> = {};
    selected.forEach((id) => { if (isBlocked(id, {})) out[id] = true; });
    return out;
  }

  // Why a product is blocked: requires that are absent, plus requires that are
  // present but themselves blocked.
  function blockReason(id: string, selected: string[]): BlockReason {
    const p = byId[id];
    if (!p) return { missing: [], stalled: [] };
    const blocked = blockedSet(selected);
    const missing: string[] = [];
    const stalled: string[] = [];
    (p.requires || []).forEach((r) => {
      if (selected.indexOf(r) === -1) missing.push(r);
      else if (blocked[r]) stalled.push(r);
    });
    return { missing: missing, stalled: stalled };
  }

  return {
    byId: byId,
    waveOf: waveOf,
    blockers: blockers,
    blockedSet: blockedSet,
    blockReason: blockReason
  };
}
// RULE-ENGINE:END
