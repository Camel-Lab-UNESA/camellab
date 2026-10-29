type Job = () => Promise<void>

// One module-level queue, shared by every cell on the page.
const queue: Job[] = []
let draining = false
const cells = new Set<{ el: HTMLElement, start: () => void, rerun: () => void }>()
const above = (a: HTMLElement, b: HTMLElement) => Boolean(a.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING)

export function useKernel() {
  const state = useState('kernel', () => ({ count: 0, busy: false }))

  // One clock for the whole site: the --beat value in main.css, in ms. The production
  // minifier rewrites 140ms as .14s, so read the unit too.
  const beat = () => {
    const value = getComputedStyle(document.documentElement).getPropertyValue('--beat').trim()
    return parseFloat(value) * (value.endsWith('ms') ? 1 : 1000) || 140
  }
  const reducedMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches
  const wait = (beats: number) => reducedMotion() ? Promise.resolve() : new Promise<void>(r => setTimeout(r, beats * beat()))

  async function drain() {
    if (draining) return
    draining = true
    state.value.busy = true
    while (queue.length) await queue.shift()!()
    state.value.busy = false
    draining = false
  }

  return {
    state,
    beat,
    wait,
    reducedMotion,
    run: (job: Job) => { queue.push(job); drain() },
    register: (cell: { el: HTMLElement, start: () => void, rerun: () => void }) => {
      cells.add(cell)
      return () => cells.delete(cell)
    },
    // "Run all above": queue every unrun cell before this one, in document order.
    runAbove: (el: HTMLElement) => [...cells].filter(c => above(c.el, el)).sort((a, b) => above(a.el, b.el) ? -1 : 1).forEach(c => c.start()),
    runAll: () => [...cells].sort((a, b) => above(a.el, b.el) ? -1 : 1).forEach(c => c.rerun()),
    next: () => ++state.value.count,
    setBusy: (busy: boolean) => { state.value.busy = busy || draining }
  }
}
