<script setup lang="ts">
// Landing background: a strip of folded-paper dunes along the bottom of the screen, and the logo's origami camel
// (facets traced from public/logo/camellab-mark.svg) living on the front dune. It folds together on load, then
// walks or trots, grazes, stretches, kneels and dozes, or unfolds into loose paper and refolds elsewhere. It looks
// out when the pointer comes near, and wanders over to a pointer resting low on the screen. Plain 3D maths onto
// SVG polygons; everything above the strip stays clear for the text.
type V = [number, number, number]
type Part = 'fore' | 'hind' | 'neck'

// Corners in the mark's 660 × 470 space, z = depth of the folded form (hand-set).
// off / rot: where each facet sits while unfolded, as an offset [x, y, z] and a turn [x, y, z] in radians.
const FACETS: { part?: Part, v: V[], off: V, rot: V }[] = [
  { part: 'fore', v: [[346.9, 9, 0], [394.5, 461.4, 60], [224.2, 114, 90]], off: [-700, -500, 300], rot: [1.2, 2.8, 0.6] },
  { part: 'hind', v: [[506.2, 7.3, 0], [653, 151.5, -80], [476.5, 464.3, 50]], off: [800, -450, -200], rot: [-0.8, -3, -0.9] },
  { v: [[353.1, 9.7, 0], [490.5, 169.1, -60], [378.8, 247.5, 70]], off: [500, -700, 400], rot: [2.4, 0.6, 1.4] },
  { v: [[500, 10.5, -20], [491.1, 162.5, 60], [419, 76, -40]], off: [900, -350, -300], rot: [-1.6, 2.2, -2] },
  { part: 'neck', v: [[106.2, 5.4, 40], [219.8, 113.4, -40], [185.4, 169.8, 80]], off: [-500, -650, 200], rot: [0.9, -2.4, 1.1] },
  { part: 'neck', v: [[221.7, 117.7, -30], [267, 210.8, 60], [187.3, 172.7, 80]], off: [-850, -250, -300], rot: [-2.2, 1, -1.6] },
  { part: 'neck', v: [[6.2, 10.5, 60], [98.5, 4.5, -30], [131, 67.3, 40]], off: [-300, -800, 500], rot: [1.8, 3.2, -0.7] }
]
// Legs swing from their top corner, the neck from where it meets the body (centred mark units).
const PIVOT = { fore: [16.9, -226], hind: [176.2, -227.7], neck: [-105, -120] } as const
const MOUTH: V = [-323.8, -224.5, 0]
const FEET = 230
const STRIDE = 240 // mark units covered per gait cycle, so the feet don't slide
// Far enough that the folds' depth shades the facets without bending the logo's outline.
const CAMERA = 3000
// Fold clock (seconds) at which the last facet has landed; the facets land 0.08 s apart over 1.2 s each.
const FOLDED = 1.7
// Dune layers, back to front, as fractions of the viewport height above its bottom edge: where the dunes meet,
// how high their peaks rise, and how wide each dune is (fraction of the width, at least `min` px).
const DUNES = [
  { base: 0.07, peak: [0.13, 0.2], width: [0.3, 0.45], min: 220 },
  { base: 0.04, peak: [0.08, 0.12], width: [0.22, 0.34], min: 170 },
  { base: 0.02, peak: [0.035, 0.055], width: [0.28, 0.4], min: 200 }
]

const add = (a: V, b: V, k = 1): V => [a[0] + b[0] * k, a[1] + b[1] * k, a[2] + b[2] * k]
const cross = (a: V, b: V): V => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]]
const dot = (a: V, b: V) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2]
const rotX = ([x, y, z]: V, a: number): V => [x, y * Math.cos(a) - z * Math.sin(a), y * Math.sin(a) + z * Math.cos(a)]
const rotY = ([x, y, z]: V, a: number): V => [x * Math.cos(a) + z * Math.sin(a), y, -x * Math.sin(a) + z * Math.cos(a)]
const rotZ = ([x, y, z]: V, a: number): V => [x * Math.cos(a) - y * Math.sin(a), x * Math.sin(a) + y * Math.cos(a), z]
const clamp = (x: number) => Math.min(1, Math.max(0, x))
const ease = (t: number) => 1 - (1 - t) ** 3
const rand = (a: number, b: number) => a + Math.random() * (b - a)

// Light from the upper left. Text runs over the camel, so fronts stay in the light ultramarine tints, where ink
// keeps its contrast (7:1 on 300, where they land when flat). Backs are the paper side, in greys.
const LIGHT = ((l: V) => l.map(c => c / Math.hypot(...l)) as V)([-0.5, -0.7, 0.9])
const FRONT = [400, 300, 200, 100].map(n => `var(--color-ultra-${n})`)
const BACK = [400, 300, 200].map(n => `var(--color-ink-${n})`)

const facets = FACETS.map((f) => {
  const v = f.v.map(([x, y, z]) => [x - 330, y - 235, z] as V)
  // Wind each facet so its front faces the viewer while the mark is flat.
  if (cross(add(v[1]!, v[0]!, -1), add(v[2]!, v[0]!, -1))[2] < 0) v.reverse()
  const mid = v.reduce((m, p) => add(m, p, 1 / 3), [0, 0, 0] as V)
  return { ...f, v, mid: [mid[0], mid[1], 0] as V }
})

const kernel = useKernel()
const view = reactive({ w: 0, h: 0 })

// Each layer is a ridge of alternating feet and peaks, folded down to the bottom edge at every corner: the face
// rising to the right catches the light, the slip face beyond the peak is in shade. Seeded, so it holds on resize.
const dunes = computed(() => {
  let seed = 5
  const rnd = (a: number, b: number) => a + (b - a) * ((seed = (seed * 16807) % 2147483647) / 2147483647)
  const { w, h } = view
  return DUNES.map((d) => {
    const ridge: [number, number][] = []
    let x = -rnd(0, 0.2) * w
    ridge.push([x, h * (1 - d.base)])
    while (x < w) {
      const width = Math.max(d.min, rnd(d.width[0]!, d.width[1]!) * w)
      // Gentle windward slope on the left, steep slip face on the right.
      ridge.push([x + width * 0.62, h * (1 - rnd(d.peak[0]!, d.peak[1]!))])
      x += width
      ridge.push([x, h * (1 - d.base)])
    }
    const faces = ridge.slice(1).map(([x2, y2], i) => {
      const [x1, y1] = ridge[i]!
      return { lit: y2 < y1, points: `${x1},${y1} ${x2},${y2} ${x2},${h} ${x1},${h}` }
    })
    return { ridge, faces }
  })
})
// Height of the front dune's ridge at x, and its slope there.
function ground(x: number) {
  const ridge = dunes.value.at(-1)!.ridge
  const i = Math.max(1, ridge.findIndex(([rx]) => rx >= x))
  const [x1, y1] = ridge[i - 1]!
  const [x2, y2] = ridge[i] ?? ridge[i - 1]!
  const slope = x2 === x1 ? 0 : (y2 - y1) / (x2 - x1)
  return { y: y1 + (x - x1) * slope, slope }
}

const layer = ref<SVGGElement>()
const tracks = ref<SVGPathElement>()
const zs: SVGTextElement[] = []
const polys: SVGPolygonElement[] = []
// facing 1 = head left, as in the logo; dir is the way the next walk goes. fold runs 0 (loose paper) → FOLDED.
const c = {
  mode: 'intro', t: 0, wait: 0, idle: 'stand', x: 0, target: 0, facing: 1, dir: 1, pace: 1, moved: false,
  fold: 0, phase: 0, gait: 0, neck: 0, look: 0, sit: 0, sitTo: 0, sleep: 0, tilt: 0,
  prints: [] as [number, number][]
}
const pointer = { x: -1e4, y: -1e4, at: 0 }
let mouth = [0, 0]
let raf = 0
let last = 0

function rest() {
  c.mode = 'rest'
  c.t = 0
  c.wait = rand(1.5, 4.5)
  c.idle = ['stand', 'graze', 'graze', 'stretch'][Math.floor(Math.random() * 4)]!
}
function walkTo(x: number, pace: number) {
  c.target = Math.min(view.w * 0.9, Math.max(view.w * 0.1, x))
  c.pace = pace
  c.dir = c.target < c.x ? 1 : -1
  c.mode = c.dir === c.facing ? 'walk' : 'turn'
  c.t = 0
}
function next(now: number) {
  const w = view.w
  // Curious: a pointer resting low on the screen draws it over.
  if (now - pointer.at > 1000 && pointer.y > view.h * 0.65 && Math.abs(pointer.x - c.x) > 150) return walkTo(pointer.x, 1)
  const r = Math.random()
  if (r < 0.14) {
    Object.assign(c, { mode: 'sit', t: 0, sitTo: 1, wait: rand(6, 14) })
    return
  }
  let x: number
  do x = rand(w * 0.12, w * 0.88)
  while (Math.abs(x - c.x) < w * 0.25)
  if (r < 0.24) {
    Object.assign(c, { mode: 'unfold', t: 0, moved: false, target: x, dir: Math.random() < 0.5 ? 1 : -1 })
    return
  }
  walkTo(x, r < 0.42 ? 2.2 : 1)
}

function tick(now: number) {
  const dt = Math.min(0.05, (now - last) / 1000)
  last = now
  const s = Math.min(220, Math.max(128, view.w * 0.16)) / 660
  const k = 1 - Math.exp(-dt * 5)
  const near = Math.hypot(pointer.x - c.x, pointer.y - (ground(c.x).y - 220 * s)) < 300 * s + 60
  c.t += dt
  c.look += (Number(near && c.mode !== 'unfold') - c.look) * k

  if (c.mode === 'intro') {
    c.fold = c.t
    if (c.t > FOLDED) rest()
  } else if (c.mode === 'rest' && c.t > c.wait && c.look < 0.1) next(now)
  else if (c.mode === 'turn') {
    if (c.t > 0.35) c.facing = c.dir
    if (c.t > 0.7) c.mode = 'walk'
  } else if (c.mode === 'walk') {
    const left = c.target - c.x
    const move = Math.sign(left) * Math.min(Math.abs(left), (view.w < 768 ? 40 : 60) * c.pace * dt * (1 - c.look))
    const foot = Math.floor(c.phase / Math.PI)
    c.x += move
    c.phase += Math.abs(move) / (STRIDE * s) * 2 * Math.PI
    // A footprint each time a foot lands, on the sand; the oldest ones go.
    if (Math.floor(c.phase / Math.PI) > foot) {
      const x = c.x + 40 * s * c.facing * (foot % 2 ? 1 : -1)
      c.prints = [...c.prints.slice(-13), [x, ground(x).y]]
    }
    if (Math.abs(c.target - c.x) < 0.5) rest()
  } else if (c.mode === 'sit') {
    if (c.t > c.wait) c.sitTo = 0
    if (!c.sitTo && c.sit < 0.03) rest()
  } else if (c.mode === 'unfold') {
    // Fly apart, jump to the new spot while loose, fold back together there.
    if (c.t < 0.9) c.fold = FOLDED * (1 - c.t / 0.9)
    else {
      if (!c.moved) Object.assign(c, { moved: true, x: c.target, facing: c.dir })
      c.fold = FOLDED * clamp((c.t - 0.9) / 1.3)
    }
    if (c.t > 2.3) rest()
  }

  c.sit += (c.sitTo - c.sit) * (1 - Math.exp(-dt * 2.5))
  c.sleep += (Number(c.mode === 'sit' && c.sitTo === 1 && c.t > 3 && !near) - c.sleep) * k
  c.gait += ((c.mode === 'walk' ? 1 - c.look : 0) - c.gait) * k
  // Lean with the dune, eased so a peak doesn't snap it over.
  c.tilt += (Math.atan(ground(c.x).slope) * 0.8 - c.tilt) * k
  const neck = c.sleep > 0.5
    ? -0.35
    : c.look > 0.5
      ? 0.12
      : c.mode !== 'rest' ? 0 : c.idle === 'graze' ? -0.6 + Math.sin(c.t * 6) * 0.08 : c.idle === 'stretch' ? 0.3 : 0
  c.neck += (neck - c.neck) * k

  draw(s, now)
  if (!kernel.reducedMotion()) raf = requestAnimationFrame(tick)
}

function draw(s: number, now: number) {
  const turn = c.mode === 'turn' ? Math.sin(clamp(c.t / 0.7) * Math.PI) * Math.PI / 2 : 0
  const yaw = turn + c.look * 0.3
  const swing = Math.sin(c.phase) * (c.pace > 1 ? 0.2 : 0.14) * c.gait
  // Kneeling folds the legs out and lowers the body into the front dune, which is drawn over it.
  const angle = {
    fore: swing + c.sit * 0.2,
    hind: -swing - c.sit * 0.2,
    neck: c.neck + Math.sin(c.phase * 2) * 0.04 * c.gait
  }
  const lift = -Math.abs(Math.sin(c.phase)) * (c.pace > 1 ? 16 : 10) * c.gait + c.sit * 230 + c.sleep * Math.sin(now / 700) * 3
  const feet = ground(c.x).y
  const [cos, sin] = [Math.cos(c.tilt), Math.sin(c.tilt)]
  const pose = (p: V, part?: Part) => {
    if (!part) return p
    const [px, py] = PIVOT[part]
    return add(rotZ([p[0] - px, p[1] - py, p[2]], angle[part]), [px, py, 0])
  }
  const world = (p: V) => rotY([p[0] * c.facing, p[1] + lift, p[2]], yaw)
  // Perspective, then tilt about the feet.
  const screen = ([x, y, z]: V) => {
    const p = CAMERA / (CAMERA - z) * s
    const [dx, dy] = [x * p, y * p - FEET * s]
    return [c.x + dx * cos - dy * sin, feet + dx * sin + dy * cos]
  }

  const drawn = facets.map((f, i) => {
    const e = ease(clamp((c.fold - i * 0.08) / 1.2))
    const v = f.v.map((corner) => {
      const p = rotZ(rotY(rotX(add(pose(corner, f.part), f.mid, -1), f.rot[0] * (1 - e)), f.rot[1] * (1 - e)), f.rot[2] * (1 - e))
      return world(add(add(p, f.mid), f.off, 1 - e))
    })
    // Mirroring flips the winding, so the facing sign keeps the normal on the front.
    const n = cross(add(v[1]!, v[0]!, -1), add(v[2]!, v[0]!, -1)).map(a => a * c.facing) as V
    const front = dot(n, [-v[0]![0], -v[0]![1], CAMERA - v[0]![2]]) > 0
    // The light turns with the camel, so it shades the same whichever way it faces.
    const light = dot(n, [LIGHT[0] * c.facing, LIGHT[1], LIGHT[2]]) / (Math.hypot(...n) || 1) * (front ? 1 : -1) - LIGHT[2]
    const el = polys[i]!
    el.style.fill = front ? FRONT[Math.min(3, Math.max(0, Math.round(1.4 + light * 5)))]! : BACK[Math.min(2, Math.max(0, Math.round(1 + light * 4)))]!
    el.setAttribute('points', v.map(p => screen(p).map(n => n.toFixed(1)).join(',')).join(' '))
    return { el, z: v.reduce((m, p) => m + p[2], 0) }
  })
  // Painter's order: nearest facet last.
  layer.value!.append(...drawn.sort((a, b) => a.z - b.z).map(d => d.el))
  tracks.value!.setAttribute('d', c.prints.map(([x, y]) => `M${(x - 4).toFixed(1)} ${(y + 3).toFixed(1)}h8`).join(''))

  // Dozing: z's drift up from the head.
  mouth = screen(world(pose(MOUTH, 'neck')))
  zs.forEach((z, i) => {
    const u = (now / 2400 + i / 3) % 1
    z.setAttribute('x', (mouth[0]! + c.facing * (20 + u * 30)).toFixed(1))
    z.setAttribute('y', (mouth[1]! - 10 - u * 70).toFixed(1))
    z.setAttribute('font-size', (10 + u * 10).toFixed(1))
    z.setAttribute('visibility', c.sleep > 0.5 ? 'visible' : 'hidden')
  })
}

const resize = () => Object.assign(view, { w: innerWidth, h: innerHeight })
// Reduced motion gets one still frame, redrawn when the window changes size.
const still = () => requestAnimationFrame(tick)
const away = () => Object.assign(pointer, { x: -1e4, y: -1e4 })
const onMove = (e: PointerEvent) => Object.assign(pointer, { x: e.clientX, y: e.clientY, at: e.timeStamp })
const onOut = (e: PointerEvent) => e.relatedTarget || away()
const onUp = (e: PointerEvent) => e.pointerType === 'mouse' || away()

onMounted(() => {
  resize()
  c.x = innerWidth * 0.72
  addEventListener('resize', resize)
  if (kernel.reducedMotion()) {
    rest()
    c.fold = FOLDED
    c.wait = Infinity
    addEventListener('resize', still)
  }
  addEventListener('pointermove', onMove, { passive: true })
  addEventListener('pointerup', onUp, { passive: true })
  addEventListener('pointercancel', away, { passive: true })
  document.addEventListener('pointerout', onOut)
  raf = requestAnimationFrame((now) => {
    last = now
    tick(now)
  })
})
onBeforeUnmount(() => {
  cancelAnimationFrame(raf)
  removeEventListener('resize', resize)
  removeEventListener('resize', still)
  removeEventListener('pointermove', onMove)
  removeEventListener('pointerup', onUp)
  removeEventListener('pointercancel', away)
  document.removeEventListener('pointerout', onOut)
})
</script>

<template>
  <div class="wander" aria-hidden="true">
    <svg>
      <g v-for="(d, i) in dunes.slice(0, -1)" :key="i" :class="`dunes dunes-${i}`">
        <polygon v-for="(f, j) in d.faces" :key="j" :class="{ lit: f.lit }" :points="f.points" />
      </g>
      <g ref="layer" class="camel">
        <polygon v-for="(_, i) in facets" :key="i" :ref="el => { if (el) polys[i] = el as SVGPolygonElement }" />
      </g>
      <!-- The front dune goes over the camel, so whatever sinks below its ridge is hidden. -->
      <g class="dunes dunes-2">
        <polygon v-for="(f, j) in dunes.at(-1)?.faces" :key="j" :class="{ lit: f.lit }" :points="f.points" />
      </g>
      <path ref="tracks" class="tracks" />
      <text v-for="i in 3" :key="i" :ref="el => { if (el) zs[i - 1] = el as SVGTextElement }">z</text>
    </svg>
  </div>
</template>
