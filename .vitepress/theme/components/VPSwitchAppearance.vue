<script lang="ts" setup>
import { ref, watch, onMounted } from 'vue'
import { useData } from 'vitepress'

const { isDark, theme } = useData()

type ThemeMode = 'light' | 'dark' | 'auto'
const mode = ref<ThemeMode>('auto')

const switchTitle = ref('')

onMounted(() => {
  const saved = localStorage.getItem('vitepress-theme-mode') as ThemeMode | null
  if (saved && ['light', 'dark', 'auto'].includes(saved)) {
    mode.value = saved
  } else {
    mode.value = 'auto'
  }
  applyTheme()
  updateTitle()
})

function applyTheme() {
  if (mode.value === 'auto') {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    isDark.value = prefersDark
  } else {
    isDark.value = mode.value === 'dark'
  }
}

function updateTitle() {
  if (mode.value === 'auto') {
    switchTitle.value = '跟随系统'
  } else if (mode.value === 'dark') {
    switchTitle.value = theme.value.lightModeSwitchTitle || '切换到浅色模式'
  } else {
    switchTitle.value = theme.value.darkModeSwitchTitle || '切换到深色模式'
  }
}

function toggleAppearance() {
  const modes: ThemeMode[] = ['light', 'dark', 'auto']
  const currentIndex = modes.indexOf(mode.value)
  mode.value = modes[(currentIndex + 1) % modes.length]
  localStorage.setItem('vitepress-theme-mode', mode.value)
  applyTheme()
  updateTitle()
}

watch(isDark, (val) => {
  document.documentElement.classList.toggle('dark', val)
})

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
    :title="switchTitle"
    class="VPSwitchAppearance"
    :aria-checked="isDark"
    @click="toggleAppearance"
  >
    <span class="check">
      <span v-if="mode === 'auto'" class="auto-icon">A</span>
      <span v-else class="icon">
        <svg v-if="!isDark" class="sun-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="5"/>
          <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/>
        </svg>
        <svg v-else class="moon-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/>
        </svg>
      </span>
    </span>
  </button>
</template>

<style scoped>
.VPSwitchAppearance {
  position: relative;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 24px;
  flex-shrink: 0;
  border: 1px solid color-mix(in srgb, var(--vp-c-border) 50%, transparent);
  background-color: color-mix(in srgb, var(--vp-c-bg) 50%, transparent);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  backdrop-filter: blur(20px) saturate(200%);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--main-color) 15%, transparent);
  transition: all 0.25s ease !important;
  cursor: pointer;
  padding: 0;
}

.VPSwitchAppearance:hover {
  border-color: var(--main-color);
  box-shadow: 0 4px 12px color-mix(in srgb, var(--main-color) 25%, transparent);
}

.check {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  background-color: var(--main-color);
  box-shadow: 0 2px 4px color-mix(in srgb, var(--main-color) 30%, transparent);
  transition: transform 0.25s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.dark .VPSwitchAppearance .check {
  transform: translateX(20px);
}

.auto-icon {
  font-size: 10px;
  font-weight: 700;
  font-family: monospace;
  color: #fff;
  line-height: 1;
}

.icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
}

.sun-icon,
.moon-icon {
  width: 12px;
  height: 12px;
  color: #fff;
  stroke: #fff;
  fill: none;
}
</style>
