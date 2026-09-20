<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { useData } from 'vitepress'

const { isDark } = useData()

type ThemeMode = 'light' | 'dark' | 'auto'
const mode = ref<ThemeMode>('auto')

onMounted(() => {
  const saved = localStorage.getItem('vitepress-theme-mode') as ThemeMode | null
  if (saved && ['light', 'dark', 'auto'].includes(saved)) {
    mode.value = saved
  } else {
    mode.value = 'auto'
  }
  applyTheme()
})

function applyTheme() {
  if (mode.value === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
  } else {
    isDark.value = mode.value === 'dark'
  }
}

function cycleMode() {
  const modes: ThemeMode[] = ['light', 'dark', 'auto']
  const currentIndex = modes.indexOf(mode.value)
  mode.value = modes[(currentIndex + 1) % modes.length]
  localStorage.setItem('vitepress-theme-mode', mode.value)
  applyTheme()
}

watch(isDark, (val) => {
  document.documentElement.classList.toggle('dark', val)
})

// 监听系统主题变化
onMounted(() => {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
  mediaQuery.addEventListener('change', () => {
    if (mode.value === 'auto') {
      applyTheme()
    }
  })
})
</script>

<template>
  <button
    class="theme-switch"
    :title="mode === 'auto' ? '跟随系统' : mode === 'dark' ? '深色模式' : '浅色模式'"
    @click="cycleMode"
  >
    <span v-if="mode === 'auto'" class="auto-icon">A</span>
    <span v-else-if="isDark" class="vpi-moon icon" />
    <span v-else class="vpi-sun icon" />
  </button>
</template>

<style scoped>
.theme-switch {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  cursor: pointer;
  color: var(--vp-c-text-2);
  transition: color 0.25s;
  border-radius: 8px;
}

.theme-switch:hover {
  color: var(--vp-c-text-1);
  background-color: var(--vp-c-bg-soft);
}

.icon {
  font-size: 18px;
}

.auto-icon {
  font-size: 14px;
  font-weight: 700;
  font-family: monospace;
}
</style>
