<script setup lang="ts">
const props = defineProps<{
  /** Shown in the input well. Omit for a markdown cell, which has no counter. */
  code?: string
  /** Type the code out before running. */
  typed?: boolean
  /** A form submit is in flight: show the running state. */
  busy?: boolean
  /** The last submit failed: the cell ends in the error state instead of done. */
  error?: boolean
  hero?: boolean
}>()

const { t } = useI18n()
const kernel = useKernel()
const el = ref<HTMLElement>()
const state = ref<'idle' | 'queued' | 'running' | 'done' | 'error'>('idle')
const count = ref<number>()
// Outputs stay open once a cell has run, so a form keeps its values while it submits.
const ran = ref(false)
const elapsed = ref<number>()
let started = 0
const shown = ref(props.code ?? '')

const shownState = computed(() => props.busy ? 'running' : state.value)
const label = computed(() => shownState.value === 'queued' || shownState.value === 'running' ? '[*]:' : `[${count.value ?? ' '}]:`)
const status = computed(() => t(`nb.state.${shownState.value}`, { n: count.value ?? '' }))
// Calls like `news.latest(` get the function colour; everything else stays ink.
const parts = computed(() => shown.value.split(/([\w.]+(?=\())/).filter(Boolean).map(text => ({ text, fn: /^[\w.]+$/.test(text) && shown.value.includes(`${text}(`) })))

function execute() {
  if (state.value === 'queued' || state.value === 'running') return
  if (el.value) kernel.runAbove(el.value)
  state.value = 'queued'
  kernel.run(async () => {
    started = performance.now()
    state.value = 'running'
    if (props.typed && props.code && !kernel.reducedMotion()) {
      for (let i = 1; i <= props.code.length; i++) {
        shown.value = props.code.slice(0, i)
        await kernel.wait(0.25)
      }
    }
    shown.value = props.code ?? ''
    await kernel.wait(2)
    if (props.code) count.value = kernel.next()
    elapsed.value = (performance.now() - started) / 1000
    ran.value = true
    state.value = 'done'
  })
}

function rerun() {
  if (props.busy) return
  ran.value = false
  state.value = 'idle'
  execute()
}

function onKey(e: KeyboardEvent) {
  if (e.key !== 'Enter' || !e.shiftKey || !props.code) return
  if ((e.target as HTMLElement).closest('input, textarea, select, [contenteditable]')) return
  e.preventDefault()
  rerun()
}

// A form submit counts as one execution of its cell, and fails like one too.
watch(() => props.busy, (busy, was) => {
  kernel.setBusy(busy)
  if (busy) started = performance.now()
  if (was && !busy && props.code) {
    count.value = kernel.next()
    elapsed.value = (performance.now() - started) / 1000
    state.value = props.error ? 'error' : 'done'
  }
})

let io: IntersectionObserver | undefined
let unregister: (() => void) | undefined
onMounted(() => {
  if (props.typed) shown.value = ''
  unregister = kernel.register({ el: el.value!, start: () => state.value === 'idle' && execute(), rerun })
  io = new IntersectionObserver(([entry]) => {
    if (entry?.isIntersecting) {
      execute()
      io?.disconnect()
    }
  }, { threshold: 0.15 })
  io.observe(el.value!)
})
onBeforeUnmount(() => {
  io?.disconnect()
  unregister?.()
})
</script>

<template>
  <section
    ref="el"
    class="cell"
    :class="{ 'hero-cell': hero }"
    :data-state="shownState"
    :data-kind="code ? 'code' : 'md'"
    :data-typed="typed || undefined"
    :data-ran="ran || undefined"
    tabindex="-1"
    @keydown="onKey"
    @focusin="state === 'idle' && execute()"
  >
    <div class="cell-gutter">
      <span class="cell-bar" aria-hidden="true" />
      <template v-if="code">
        <span class="cell-count" aria-hidden="true">{{ label }}</span>
        <button type="button" class="cell-run" :aria-label="`${t('nb.run')}. ${status}`" :disabled="busy" @click="rerun">
          <UIcon name="i-lucide-play" class="size-3.5" />
        </button>
        <span v-if="elapsed !== undefined && (shownState === 'done' || shownState === 'error')" class="cell-time" aria-hidden="true">{{ elapsed.toFixed(1) }}s</span>
      </template>
    </div>
    <div class="min-w-0">
      <pre v-if="code" class="cell-in"><code><template v-for="(part, i) in parts" :key="i"><span v-if="part.fn" class="fn">{{ part.text }}</span><template v-else>{{ part.text }}</template></template><span v-if="typed && shownState === 'running'" class="caret" aria-hidden="true" /></code></pre>
      <div class="cell-out-wrap">
        <div class="cell-out">
          <div :class="code ? 'cell-out-inner' : ''">
            <slot />
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
