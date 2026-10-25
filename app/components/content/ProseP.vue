<script setup lang="ts">
import type { VNode } from 'vue'

const slots = useSlots()
const { t } = useI18n()

// Videos come only from YouTube: a paragraph holding nothing but a YouTube link plays it.
function videoId(nodes: VNode[]) {
  const content = nodes.filter(node => typeof node.children !== 'string' || node.children.trim())
  return content.length === 1 ? youtubeId(content[0]?.props?.href) : null
}

const Paragraph = () => {
  const nodes = slots.default?.() ?? []
  const id = videoId(nodes)
  if (!id) return h('p', nodes)
  return h('div', { class: 'video' }, h('iframe', {
    src: `https://www.youtube-nocookie.com/embed/${id}`,
    title: t('post.video'),
    loading: 'lazy',
    allow: 'accelerometer; encrypted-media; gyroscope; picture-in-picture; web-share',
    allowfullscreen: true,
    // YouTube refuses to play embeds that send no referrer.
    referrerpolicy: 'strict-origin-when-cross-origin'
  }))
}
</script>

<template>
  <Paragraph />
</template>
