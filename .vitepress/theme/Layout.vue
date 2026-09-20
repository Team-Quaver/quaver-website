<script setup lang="ts">
import { onMounted, onUnmounted, watch, nextTick } from 'vue'
import { computed } from 'vue'
import { useData, useRoute } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import Comment from './Comment.vue'
import VPSwitchAppearance from './components/VPSwitchAppearance.vue'
const { frontmatter, theme } = useData()
const route = useRoute()

// 评论配置（兼容旧的 twikoo 配置和新的 comment 配置）
const commentConfig = computed(() => theme.value.comment || { provider: 'none' })
const twikooConfig = computed(() => theme.value.twikoo || { enabled: false })

// 判断是否启用评论（新配置或旧配置）
const isCommentEnabled = computed(() => {
  // 新配置: comment.provider
  if (commentConfig.value.provider && commentConfig.value.provider !== 'none') {
    return true
  }
  // 旧配置: twikoo.enabled
  return twikooConfig.value.enabled !== false
})

// Logo 配置
const logoConfig = computed(() => theme.value.vivianLogo || {})
const hasLogo = computed(() => !!logoConfig.value.src || !!logoConfig.value.emoji)
const hasEmoji = computed(() => !!logoConfig.value.emoji)

// 页面切换动画
function triggerPageAnimation() {
  nextTick(() => {
    const content = document.querySelector('.VPContent')
    if (content) {
      content.classList.remove('fade-slide-enter')
      void content.offsetWidth // 强制重绘
      content.classList.add('fade-slide-enter')
    }
  })
}

watch(() => route.path, triggerPageAnimation)

// 判断是否是真正的首页（有 hero 配置）
const isRealHome = computed(() => {
  return frontmatter.value.layout === 'home' && frontmatter.value.hero !== undefined
})

// 判断是否是 home 布局的子页面（有 layout: home 但没有 hero）
const isHomeSubPage = computed(() => {
  return frontmatter.value.layout === 'home' && frontmatter.value.hero === undefined
})

// 判断是否是文档页面
const isDocPage = computed(() => {
  return !isRealHome.value && !isHomeSubPage.value && frontmatter.value.layout !== false
})

// 表格滚动容器
function wrapTables() {
  nextTick(() => {
    const tables = document.querySelectorAll('.vp-doc table')
    tables.forEach(table => {
      if (table.parentElement?.classList.contains('table-scroll-wrapper')) return
      const wrapper = document.createElement('div')
      wrapper.className = 'table-scroll-wrapper'
      table.parentNode?.insertBefore(wrapper, table)
      wrapper.appendChild(table)
    })
  })
}

onMounted(wrapTables)
watch(() => route.path, () => {
  nextTick(wrapTables)
})

// 移动端下拉菜单 outline-link 高亮同步
// VitePress 的 useActiveAnchor 只给 PC 侧边导览加 .active，
// 这里手动同步到移动端 VPLocalNavOutlineDropdown 的 outline-link
let prevDropdownActive: Element | null = null
function syncDropdownActiveLink() {
  const dropdown = document.querySelector('.VPLocalNavOutlineDropdown .outline')
  if (!dropdown) return
  const links = dropdown.querySelectorAll('a.outline-link[href]')
  if (!links.length) return

  // 找到当前视口内最近的标题
  let activeLink: Element | null = null
  for (const link of links) {
    const href = (link as HTMLAnchorElement).getAttribute('href')
    if (!href || !href.startsWith('#')) continue
    const target = document.getElementById(href.slice(1))
    if (!target) continue
    const rect = target.getBoundingClientRect()
    if (rect.top <= 100) {
      activeLink = link
    }
  }

  if (prevDropdownActive) {
    prevDropdownActive.classList.remove('active')
  }
  if (activeLink) {
    activeLink.classList.add('active')
    prevDropdownActive = activeLink
  }
}
const throttledSync = (() => {
  let ticking = false
  return () => {
    if (!ticking) {
      ticking = true
      requestAnimationFrame(() => {
        syncDropdownActiveLink()
        ticking = false
      })
    }
  }
})()
onMounted(() => {
  window.addEventListener('scroll', throttledSync, { passive: true })
  syncDropdownActiveLink()
  // 下拉菜单打开时重新同步（下拉关闭后 .outline 消失，.active 丢失）
  document.addEventListener('click', (e) => {
    const btn = (e.target as HTMLElement).closest('.VPLocalNavOutlineDropdown > button')
    if (btn) {
      setTimeout(syncDropdownActiveLink, 50)
    }
  })
})
onUnmounted(() => {
  window.removeEventListener('scroll', throttledSync)
})
watch(() => route.path, () => {
  nextTick(syncDropdownActiveLink)
})
</script>

<template>
  <DefaultTheme.Layout>
    <!-- 标题前的图标 -->
    <template #nav-bar-title-before>
      <span v-if="hasEmoji" class="nav-emoji">{{ logoConfig.emoji }}</span>
      <img
        v-else-if="hasLogo && !hasEmoji"
        :src="logoConfig.src"
        :alt="logoConfig.alt || 'Logo'"
        :width="logoConfig.width || 24"
        :height="logoConfig.height || 24"
        class="nav-icon"
      />
    </template>

    <!-- 自定义深浅色切换 - PC 端（搜索栏和社交媒体之间） -->
    <template #nav-bar-content-after>
      <VPSwitchAppearance class="desktop-theme-switch" />
    </template>

    <!-- 自定义深浅色切换 - 移动端（下拉菜单内） -->
    <template #nav-screen-content-after>
      <div class="mobile-theme-switch">
        <VPSwitchAppearance />
      </div>
    </template>

    <!-- 文档页面评论（doc-after slot） -->
    <template #doc-after>
      <Comment v-if="isDocPage && isCommentEnabled" />
    </template>

    <!-- 404 页面 -->
    <template #not-found>
      <div class="not-found">
        <img src="https://http.cat/404" alt="404" class="not-found-img" />
        <h1 class="not-found-title">页面不见了</h1>
        <p class="not-found-desc">页面藏起来了，可能是站长遗忘了或者你输入错了？</p>
        <a href="/" class="not-found-link">返回首页</a>
      </div>
    </template>

    <!-- home 布局的子页面（非首页） -->
    <template #layout-bottom>
      <div v-if="isHomeSubPage && isCommentEnabled" class="comment-home-container">
        <Comment />
      </div>
    </template>
  </DefaultTheme.Layout>
</template>

<style scoped>
.nav-icon {
  height: 24px;
  width: 24px;
  margin-right: 8px;
  vertical-align: middle;
  object-fit: contain;
}

.nav-emoji {
  font-size: 20px;
  margin-right: 8px;
  vertical-align: middle;
  line-height: 1;
}
/* 评论区域样式 */
.comment-home-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 2.5rem;
}

/* Home 子页面分割线 */
.comment-home-container::before {
  content: '';
  display: block;
  border-top: 1px solid rgba(70, 71, 87, 0.4);
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .comment-home-container {
    padding: 1rem 1.5rem;
  }
}

/* 404 页面 */
.not-found {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - var(--vp-nav-height) - 200px);
  padding: 2rem;
  text-align: center;
}

.not-found-img {
  max-width: 400px;
  width: 100%;
  border-radius: 16px;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px color-mix(in srgb, var(--main-color) 15%, transparent);
}

.not-found-title {
  font-size: 2rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 0.5rem;
}

.not-found-desc {
  font-size: 1.1rem;
  color: var(--vp-c-text-2);
  margin-bottom: 2rem;
  max-width: 500px;
}

.not-found-link {
  display: inline-block;
  padding: 12px 32px;
  background-color: var(--main-color);
  color: #fff;
  border-radius: 12px;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.25s ease;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--main-color) 30%, transparent);
}

.not-found-link:hover {
  background-color: var(--main-color-light);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px color-mix(in srgb, var(--main-color) 40%, transparent);
}
</style>

<style>
/* 详情组件：当页面包含 <detail> 时，隐藏侧边栏与大纲
   用 :has() 精准命中，不依赖全局 has-detail 类，避免影响 NavBar */
html:has(.detail-layout) .VPSidebar {
  display: none !important;
}

html:has(.detail-layout) .aside {
  display: none !important;
}

html:has(.detail-layout) .VPDoc .content {
  padding-left: 0 !important;
}

/* detail 作为整页布局（layout: detail）时：VPContent.has-sidebar 的内边距
   左右不对称（左多出 272px 侧边栏宽度），只清左边会导致内容整体偏左，
   必须两侧同时归零；水平居中由 .detail-as-layout 自身的
   max-width + margin-inline:auto 负责。
   注意用 .detail-as-layout 而非 .detail-layout 命中：
   行内 <detail /> 所在的普通文档页需要保留 VPContent 原生内边距 */
html:has(.detail-as-layout) .VPContent {
  padding-left: 0 !important;
  padding-right: 0 !important;
}

/* 让 Footer 显示在评论之后 */
.VPFooter {
  order: 1;
  border-top: none !important;
}

/* Footer 上方分割线：缩短 */
.VPFooter::before {
  content: '';
  display: block;
  width: 200px;
  max-width: calc(100% - 48px);
  margin: -32px auto 0;
  border-top: 1px solid color-mix(in srgb, var(--vp-c-border) 30%, transparent);
}

/* Footer 文字淡化 */
.VPFooter .message,
.VPFooter .copyright {
  color: var(--vp-c-text-3) !important;
  font-size: 13px !important;
}

/* 让 docs 页面也显示 Footer */
.VPFooter.has-sidebar {
  display: block !important;
}
</style>
