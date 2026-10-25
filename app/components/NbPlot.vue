<script setup lang="ts">
// Illustrative only: a seeded, noisy decaying curve that keeps "training" on the beat. Not real lab results.
const W = 640
const H = 340
// Left padding fits the y labels at the doubled tick size phones use (main.css).
const PAD = { l: 64, r: 14, t: 10, b: 30 }
const WINDOW = 90
const RUN = 260
const Y_MAX = 2.6

const { t } = useI18n()
const kernel = useKernel()

let seed = 7
const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647
let step = 0
const loss = (s: number) => 0.22 + 2.1 * Math.exp(-(s % RUN) / 24) + (rand() - 0.5) * (0.06 + 0.22 * Math.exp(-(s % RUN) / 70))

const series = ref(Array.from({ length: WINDOW }, () => ({ s: step, v: loss(step++) })))

const x = (i: number) => PAD.l + (i / (WINDOW - 1)) * (W - PAD.l - PAD.r)
const y = (v: number) => PAD.t + (1 - Math.min(v, Y_MAX) / Y_MAX) * (H - PAD.t - PAD.b)
const path = computed(() => series.value.map((p, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(''))
const head = computed(() => ({ cx: x(WINDOW - 1), cy: y(series.value.at(-1)!.v) }))

const root = ref<SVGElement>()
let timer: ReturnType<typeof setInterval> | undefined
let io: IntersectionObserver | undefined

onMounted(() => {
  if (kernel.reducedMotion()) return
  io = new IntersectionObserver(([entry]) => {
    clearInterval(timer)
    if (entry?.isIntersecting) {
      timer = setInterval(() => {
        series.value = [...series.value.slice(1), { s: step, v: loss(step++) }]
      }, kernel.beat() * 4)
    }
  })
  io.observe(root.value!)
})
onBeforeUnmount(() => {
  clearInterval(timer)
  io?.disconnect()
})
</script>

<template>
  <figure>
    <svg ref="root" class="plot" :viewBox="`0 0 ${W} ${H}`" role="img" :aria-label="t('nb.plotLabel')">
      <line v-for="v in [0.5, 1, 1.5, 2, 2.5]" :key="v" class="grid" :x1="PAD.l" :x2="W - PAD.r" :y1="y(v)" :y2="y(v)" />
      <line class="axis" :x1="PAD.l" :x2="PAD.l" :y1="PAD.t" :y2="H - PAD.b" />
      <line class="axis" :x1="PAD.l" :x2="W - PAD.r" :y1="H - PAD.b" :y2="H - PAD.b" />
      <text v-for="v in [0, 1, 2]" :key="v" class="tick" :x="PAD.l - 8" :y="y(v) + 4" text-anchor="end">{{ v.toFixed(1) }}</text>
      <text class="tick" :x="PAD.l" :y="H - 8">{{ series[0]!.s }}</text>
      <text class="tick" :x="W - PAD.r" :y="H - 8" text-anchor="end">step {{ series.at(-1)!.s }}</text>
      <text class="tick" :x="PAD.l + 8" :y="PAD.t + 12">loss</text>
      <path class="curve" :d="path" pathLength="1" />
      <circle class="head" :cx="head.cx" :cy="head.cy" r="4.5" />
    </svg>
    <figcaption class="plot-caption">{{ t('nb.plotCaption') }}</figcaption>
  </figure>
</template>
