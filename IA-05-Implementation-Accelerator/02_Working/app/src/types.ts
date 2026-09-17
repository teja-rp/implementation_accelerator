// types.ts — the shapes implied by 02_Working/data/modules.json and
// products.json, written out so the compiler can hold us to them.
//
// No import/export anywhere in src/: these files compile as global scripts and
// are concatenated by `tsc --outFile`, which is what keeps the shipped
// app.html free of module syntax. See 02_Working/tools/README.md.

// ---------------------------------------------------------------------------
// Data: modules.json
// ---------------------------------------------------------------------------

type StageId =
  | 'assignment' | 'research' | 'introduction' | 'data'
  | 'scheduling' | 'escalation' | 'eoe';

type TypeId = 'add-on' | 'add-on-expansion' | 'expansion' | 'new-logo';

type RoleId = 'EC' | 'EM';

type Delivery = 'self' | 'live';

type PracticeKind = 'decision' | 'guardrail';

type Verdict = 'best' | 'ok' | 'poor';

interface Step {
  /** Step text. May contain a `<TODO: ...>` gap marker. */
  t: string;
  /** Optional nuance note shown under the step. */
  n?: string;
}

interface ScenarioOption {
  t: string;
  verdict: Verdict;
  /** Why this verdict, in the source's own terms. */
  fb: string;
  /** Citation for this option. */
  src: string;
}

interface Scenario {
  q: string;
  opts: ScenarioOption[];
}

interface Module {
  id: string;
  role: RoleId;
  type: TypeId;
  /** A product id, or 'any' for role-level guidance. */
  product: string;
  stage: StageId;
  /** Training-agenda day, 1-10. */
  day: number;
  delivery: Delivery;
  owner: string;
  /** Document plus section or slide number. */
  source: string;
  /** Shipped review status. 'approved' is the only value that opens the gate. */
  review: string;
  practice: PracticeKind | null;
  title: string;
  objective: string;
  /** Present only where the source states one. */
  sla?: string;
  steps: Step[];
  scenario: Scenario | null;
  next: string;
}

interface StageDef { id: StageId; label: string; }
interface TypeDef { id: TypeId; label: string; }

interface ModulesDoc {
  schemaVersion: string;
  stages: StageDef[];
  stagesSrc: string;
  types: TypeDef[];
  typesSrc: string;
  modules: Module[];
}

// ---------------------------------------------------------------------------
// Data: products.json
// ---------------------------------------------------------------------------

type ProductGroup =
  | 'Core' | 'Core & operations' | 'Financial'
  | 'Renter engagement' | 'Marketing & leads' | 'Reporting & utilities';

interface Product {
  id: string;
  name: string;
  group: ProductGroup;
  /** True only for OneSite. */
  core?: boolean;
  /** Goes live with OneSite. */
  withCore?: boolean;
  /** Setup may begin before OneSite is live. */
  early?: boolean;
  /** Must be live before this product can go live. Blocks the sequence. */
  requires: string[];
  /** Integration target only — does NOT block a go-live. */
  integrateAfter?: string[];
  /** Verbatim wording from the Product Dependency Reference table. */
  note: string;
  /** Client-side readiness gate. */
  prereq?: string;
  prereqSrc?: string;
  /** Scheduling lag. */
  lag?: string;
  lagSrc?: string;
  /** Data-flow reason behind the dependency. */
  why?: string;
  whySrc?: string;
  caution?: string;
  cautionSrc?: string;
  src: string;
  // RUM / RUSM only
  requiresSrc?: string;
  components?: string[];
  componentsSrc?: string;
  deliverables?: Record<string, string[]>;
  deliverablesSrc?: string;
  timeline?: string;
  timelineSrc?: string;
  clientQuestion?: string;
}

interface ChecklistItem {
  id: string;
  q: string;
  /** Product ids this question is relevant to. Empty = always relevant. */
  appliesTo: string[];
}

interface ProductsDoc {
  schemaVersion: string;
  validationChecklist: ChecklistItem[];
  checklistSrc: string;
  products: Product[];
}

// ---------------------------------------------------------------------------
// Data: sources.json
// ---------------------------------------------------------------------------

interface SourceRec {
  doc: string;
  version: string;
  mode: string;
  sponsorProvided: boolean;
  usedByModules: string[];
}

interface Gap {
  id: string;
  doc: string;
  where: string;
  finding: string;
  affects: string;
}

interface SourcesDoc {
  schemaVersion: string;
  sources: SourceRec[];
  gaps: Gap[];
  gapsNote: string;
}

// ---------------------------------------------------------------------------
// Rule engine
// ---------------------------------------------------------------------------

interface BlockReason {
  /** Required but absent from the selection. */
  missing: string[];
  /** Present in the selection but itself blocked. */
  stalled: string[];
}

interface Rules {
  byId: Record<string, Product>;
  waveOf(id: string, selected: string[], visiting?: Record<string, boolean>): number;
  blockers(selected: string[]): Record<string, string[]>;
  blockedSet(selected: string[]): Record<string, boolean>;
  blockReason(id: string, selected: string[]): BlockReason;
}

// ---------------------------------------------------------------------------
// Application state
// ---------------------------------------------------------------------------

type ViewName = 'learner' | 'planner' | 'leader' | 'owner';

type LeaderSort = 'journey' | 'modules' | 'gate';

interface LearnerState {
  role: string;
  type: string;
  product: string;
  stage: string;
  /** Show unapproved drafts alongside approved modules. */
  preview: boolean;
  /** moduleId -> chosen scenario option index. */
  picks: Record<string, number>;
  /** moduleId -> set of checked step indices. In-memory only: this is a
   *  scratch aid for the current sitting, never a progress claim. */
  done: Record<string, Record<number, boolean>>;
}

interface PlannerState { selected: string[]; }

interface LeaderState { stage: StageId | null; sort: LeaderSort; }

interface OwnerState {
  /** moduleId -> review status set in this page. Never persisted, so an
   *  approval cannot outlive the content it approved. */
  overrides: Record<string, string>;
  reviewer: string;
}

interface AppState {
  view: ViewName;
  learner: LearnerState;
  planner: PlannerState;
  leader: LeaderState;
  owner: OwnerState;
}

/** What savePrefs writes: last view and last picker selections only. */
interface StoredPrefs {
  view?: ViewName;
  learner?: Partial<Pick<LearnerState, 'role' | 'type' | 'product' | 'stage'>>;
  planner?: { selected?: string[] };
}

interface RenderOpts {
  /** The change came from inside the product picker; do not rebuild it. */
  keepPicker?: boolean;
  /** The change came from a filter control; do not rebuild the filter row. */
  keepFilters?: boolean;
}
