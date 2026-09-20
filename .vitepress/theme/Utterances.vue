<script setup lang="ts">
import { useData, useRoute } from 'vitepress'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

type UtterancesTheme =
  | 'github-light'
  | 'github-dark'
  | 'preferred-color-scheme'
  | 'github-dark-orange'
  | 'icy-dark'
  | 'dark-blue'
  | 'photon-dark'
  | 'boxy-light'
  | 'gruvbox-dark'

interface UtterancesProps {
  repo: string
  issueTerm?: 'pathname' | 'url' | 'title' | 'og:title' | string
  label?: string
  theme?: UtterancesTheme | string
  crossorigin?: 'anonymous' | 'use-credentials'
}

const props = withDefaults(defineProps<UtterancesProps>(), {
  issueTerm: 'pathname',
  crossorigin: 'anonymous',
})

const isDark = useData().isDark

const container = ref<HTMLDivElement | null>(null)
const route = useRoute()

function clearContainer() {
  if (container.value) {
    container.value.innerHTML = ''
  }
}

function getTheme(): string {
  return props.theme ?? (isDark.value ? 'github-dark' : 'github-light')
}

function injectUtterances() {
  if (!container.value) {
    return
  }

  const script = document.createElement('script')
  script.src = 'https://utteranc.es/client.js'
  script.async = true
  script.setAttribute('repo', props.repo)

  if (props.issueTerm) {
    script.setAttribute('issue-term', props.issueTerm)
  }

  if (props.label) {
    script.setAttribute('label', props.label)
  }

  script.setAttribute('theme', getTheme())
  script.crossOrigin = props.crossorigin
  container.value.appendChild(script)
}

onMounted(() => {
  injectUtterances()
})

watch(
  () => route.path,
  () => {
    // Re-render comments on navigation.
    clearContainer()
    injectUtterances()
  },
)

watch(
  () => isDark.value,
  () => {
    if (props.theme) {
      return
    }

    // Re-render comments on theme change (only if theme is not explicitly set).
    clearContainer()
    injectUtterances()
  },
)

onBeforeUnmount(() => {
  clearContainer()
})
</script>

<template>
  <div class="vp-utterances">
    <div ref="container" />
  </div>
</template>
