// state.ts — one state object, one write path.
//
// Every render reads from `state`; every control writes through `setState` and
// nothing else touches the DOM for the same data. The two `keep*` options
// exist because a full re-render destroys and recreates the control the user
// is operating, which loses focus on every keystroke or toggle.

const VIEWS: ViewName[] = ['learner', 'planner', 'leader', 'owner'];

const VIEW_LABEL: Record<ViewName, string> = {
  learner: 'Learner',
  planner: 'Dependency Planner',
  leader: 'Leader',
  owner: 'Owner'
};

const REVIEW_CYCLE: string[] = ['drafted', 'in review', 'approved'];

const LS_KEY = 'ia05.prefs.v2';

const state: AppState = {
  view: 'learner',
  learner: { role: 'EC', type: 'add-on', product: 'any', stage: 'any', preview: false, picks: {}, done: {} },
  planner: { selected: [] },
  leader: { stage: null, sort: 'journey' },
  owner: { overrides: {}, reviewer: '' }
};

const scrollMem: Record<ViewName, number> = { learner: 0, planner: 0, leader: 0, owner: 0 };

// --- data, populated by initData() ------------------------------------------

let MODULES_DATA: ModulesDoc;
let PRODUCTS_DATA: ProductsDoc;
let SOURCES_DATA: SourcesDoc;

let modules: Module[];
let stages: StageDef[];
let types: TypeDef[];
let products: Product[];
let checklist: ChecklistItem[];
let R: Rules;

const stageIx: Record<string, number> = {};
const stageLabel: Record<string, string> = {};

function initData(): void {
  modules = MODULES_DATA.modules;
  stages = MODULES_DATA.stages;
  types = MODULES_DATA.types;
  products = PRODUCTS_DATA.products;
  checklist = PRODUCTS_DATA.validationChecklist || [];
  R = makeRules(products);
  stages.forEach((s, i) => { stageIx[s.id] = i; stageLabel[s.id] = s.label; });
}

// --- per-viewer preferences --------------------------------------------------
// Convenience only: last view and last picker selections. Never a progress or
// completion claim, never shared, never required for the app to work.

function lsGet(): StoredPrefs | null {
  try {
    const raw = window.localStorage.getItem(LS_KEY);
    return raw ? (JSON.parse(raw) as StoredPrefs) : null;
  } catch (e) { return null; }
}

function lsSet(o: StoredPrefs): void {
  try { window.localStorage.setItem(LS_KEY, JSON.stringify(o)); } catch (e) { /* blocked storage */ }
}

function savePrefs(): void {
  lsSet({
    view: state.view,
    learner: {
      role: state.learner.role, type: state.learner.type,
      product: state.learner.product, stage: state.learner.stage
    },
    planner: { selected: state.planner.selected }
  });
}

function restorePrefs(): void {
  const p = lsGet();
  if (!p || typeof p !== 'object') return;
  if (p.learner && typeof p.learner === 'object') {
    (['role', 'type', 'product', 'stage'] as const).forEach((k) => {
      const v = p.learner![k];
      if (typeof v === 'string') state.learner[k] = v;
    });
  }
  if (p.planner && Array.isArray(p.planner.selected)) {
    state.planner.selected = p.planner.selected.filter((id) => !!R.byId[id]);
  }
}

function setState(fn: (s: AppState) => void, opts?: RenderOpts): void {
  fn(state);
  savePrefs();
  render(opts || {});
}

// --- approval gate -----------------------------------------------------------
// A module reaches the Learner view only when its effective review status is
// exactly "approved". Overrides live in this page only.

function reviewOf(m: Module): string {
  return Object.prototype.hasOwnProperty.call(state.owner.overrides, m.id)
    ? state.owner.overrides[m.id] : m.review;
}

function isApproved(m: Module): boolean {
  return /^approved\s*$/i.test(String(reviewOf(m)).trim());
}

function approvedCount(): number {
  return modules.filter(isApproved).length;
}

// --- colour helpers ----------------------------------------------------------

function stageTint(id: string): string {
  const ramp = ['--w-1', '--w-1', '--w-2', '--w-2', '--w-3', '--w-3', '--w-4'];
  return 'var(' + (ramp[stageIx[id]] || '--signal') + ')';
}

function waveColor(w: number | undefined, blocked: boolean): string {
  if (blocked) return 'var(--block)';
  if (w === 0) return 'var(--w-par)';
  if (w === 1) return 'var(--w-1)';
  if (w === 2) return 'var(--w-2)';
  if (w === 3) return 'var(--w-3)';
  return 'var(--w-4)';
}
