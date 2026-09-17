// dom.ts — small shared helpers. Deliberately tiny: this app builds HTML
// strings and assigns innerHTML, which at this data scale is simpler to read
// and audit than a virtual DOM, and keeps the shipped file framework-free.

function el(id: string): HTMLElement {
  const n = document.getElementById(id);
  if (!n) throw new Error('missing element #' + id);
  return n;
}

function elMaybe(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function esc(s: unknown): string {
  return String(s === undefined || s === null ? '' : s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/**
 * Render a `<TODO: ...>` marker as a visible, labelled gap rather than letting
 * it read as content. Principle 3 of DESIGN_PLAN.md: show the gap, never fill
 * it. The chip carries the word "gap" as well as the colour, so the signal is
 * never colour-only.
 */
function gaps(s: unknown): string {
  return esc(s).replace(/&lt;TODO:([\s\S]*?)&gt;/g, (_m: string, body: string) =>
    '<span class="chip watch">gap</span> <span class="gap">' + body.trim() + '</span>');
}

function qsa(root: ParentNode, sel: string): HTMLElement[] {
  return Array.prototype.slice.call(root.querySelectorAll(sel)) as HTMLElement[];
}

/** Wire a click handler onto every element matching `sel` inside `root`. */
function onClick(root: ParentNode, sel: string, fn: (node: HTMLElement) => void): void {
  qsa(root, sel).forEach((node) => {
    node.addEventListener('click', () => fn(node));
  });
}
