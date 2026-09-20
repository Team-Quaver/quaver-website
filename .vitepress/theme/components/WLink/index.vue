<template>
  <div id="main" class="mx-auto w-full max-w-384 p-6 lg:p-8">
    <h1 class="link-title text-text1">{{ config.title }}</h1>

    <!-- Tag 筛选栏 -->
    <div class="tag-bar mt-8 mb-10 flex flex-wrap items-center justify-center gap-3">
      <button
        v-for="t of tagList"
        :key="t.name"
        type="button"
        class="tag-pill"
        :class="{ 'tag-pill-active': currentTag === t.name }"
        @click="activeTag = t.name"
      >
        <span>{{ t.name }}</span>
        <span class="tag-count">{{ t.count }}</span>
      </button>
    </div>

    <!-- 友链卡片（TransitionGroup：筛选切换时 FLIP 换位 + 缩放淡入淡出） -->
    <TransitionGroup
      v-if="filteredLinks.length"
      tag="div"
      name="link-flip"
      class="link-grid relative grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"
      @before-leave="onBeforeLeave"
    >
      <div v-for="site of filteredLinks" :key="site.link" class="link-wrapper">
        <LinkSite :data="site" />
      </div>
    </TransitionGroup>
    <p v-else class="py-16 text-center text-text2">{{ config.emptyText }}</p>

    <!-- 留链：位于友链列表与评论区之间 -->
    <div class="message">
      <div class="relative mt-12 mb-6 h-px bg-slate-200 dark:bg-neutral-700">
        <h3 class="bg-bg-soft absolute top-[50%] left-[50%] -translate-x-[50%] -translate-y-[50%] px-8 text-center text-xl! font-bold!">{{ config.leaveTitle }}</h3>
      </div>
      <p class="mb-8! text-center font-medium!">{{ config.leaveDesc }}</p>
      <div class="link-comment-container rounded-2xl p-6">
        <p class="mb-3!">
          {{ config.joinText }}
          <a :href="config.siteLink" target="_blank"><b>{{ config.siteName }}</b></a> {{ config.joinSuffix }}
        </p>
        <div class="note custom-block github-alert mb-3">
          <p class="custom-block-title">{{ config.siteInfoTitle }}</p>
          <p>
            {{ config.siteInfoLabel.title }}：{{ config.siteInfo.title }} <br />
            {{ config.siteInfoLabel.url }}：{{ config.siteInfo.url }} <br />
            {{ config.siteInfoLabel.avatar }}：{{ config.siteInfo.avatar }} <br />
            {{ config.siteInfoLabel.desc }}：{{ config.siteInfo.desc }} <br />
          </p>
        </div>
        <div class="link-details-container mb-6 rounded-lg p-4">
          <details class="group">
            <summary class="flex cursor-pointer list-none items-center font-medium">
              <span class="mr-2 text-lg text-(--vp-c-tip-1) transition-transform duration-200 group-open:rotate-90">▶</span>
              {{ config.rulesTitle }}
            </summary>
            <div class="mt-2 mb-2 pl-1">
              <p v-for="(rule, i) in config.rules" :key="i">{{ rule }}</p>
            </div>
          </details>
        </div>
      </div>
    </div>

    <!-- 页面评论区：自定义 layout 分支不经过 VPDoc，Layout.vue 的 doc-after
         插槽没有出口，必须在此显式挂载，评论系统跟随 themeConfig.comment 配置 -->
    <Comment class="link-page-comment" />
  </div>
</template>

<script setup lang="ts">
import { useData } from 'vitepress'
import { ref, computed } from 'vue'
import LinkSite from './LinkSite.vue'
import Comment from '../../Comment.vue'
import { Link } from '../../type/WLink'
import { defaultConfig, type WLinkConfig } from './config'

const { frontmatter: fm, theme } = useData()

// 友链数据：平铺结构，每条友链通过可选 tag 归类
const linksData = computed<Link[]>(() => (fm.value.links as Link[]) || [])

// 从 themeConfig.wlink 读取文案，提供默认值
const config = computed<WLinkConfig>(() => {
  const w = (theme.value.wlink || {}) as Record<string, any>
  return {
    ...defaultConfig,
    ...w,
    siteInfoLabel: { ...defaultConfig.siteInfoLabel, ...(w.siteInfoLabel || {}) },
    siteInfo: { ...defaultConfig.siteInfo, ...(w.siteInfo || {}) },
  }
})

// 当前选中的 Tag；空字符串视为「全部」（归一化见 currentTag）
const activeTag = ref('')

// 归一化：初始状态（''）回退到 allTag，避免主题覆盖 allTag 文案时初始筛选落空
const currentTag = computed(() => activeTag.value || config.value.allTag)

// 提取 Tag 列表（保持首次出现顺序）并统计数量，「全部」置顶
const tagList = computed(() => {
  const counts = new Map<string, number>()
  for (const l of linksData.value) {
    const t = l.tag?.trim() || config.value.defaultTag
    counts.set(t, (counts.get(t) || 0) + 1)
  }
  return [
    { name: config.value.allTag, count: linksData.value.length },
    ...[...counts].map(([name, count]) => ({ name, count })),
  ]
})

// 按 Tag 筛选
const filteredLinks = computed(() => {
  if (currentTag.value === config.value.allTag) return linksData.value
  return linksData.value.filter(
    (l) => (l.tag?.trim() || config.value.defaultTag) === currentTag.value
  )
})

// 离场前钉住卡片当前位置与尺寸：
// 脱离文档流后 absolute 元素会丢失布局尺寸，先记录下来保证动画平滑
function onBeforeLeave(el: Element) {
  const e = el as HTMLElement
  const { offsetLeft, offsetTop, offsetWidth, offsetHeight } = e
  e.style.left = `${offsetLeft}px`
  e.style.top = `${offsetTop}px`
  e.style.width = `${offsetWidth}px`
  e.style.height = `${offsetHeight}px`
}
</script>

<style scoped>
/* ===== 页面标题：对齐 .vp-doc h1 的官方排版（28px → ≥768px 32px，
   weight 600，letter-spacing -0.02em），与文档页 H1 观感一致 ===== */
.link-title {
  font-size: 28px;
  font-weight: 600;
  line-height: 40px;
  letter-spacing: -0.02em;
}

@media (min-width: 768px) {
  .link-title {
    font-size: 32px;
  }
}

/* ===== Tag 药丸（液态玻璃风格，与主题统一） ===== */
.tag-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 16px;
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background-color: color-mix(in srgb, var(--vp-c-bg-soft) 55%, transparent);
  -webkit-backdrop-filter: blur(20px) saturate(200%);
  backdrop-filter: blur(20px) saturate(200%);
  border: 1px solid color-mix(in srgb, var(--vp-c-border) 50%, transparent);
  border-radius: 999px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tag-pill:hover {
  color: var(--vp-c-text-1);
  border-color: var(--main-color);
  box-shadow: 0 2px 8px color-mix(in srgb, var(--main-color) 15%, transparent);
}

.tag-pill-active {
  color: #fff;
  background-color: var(--main-color);
  border-color: var(--main-color);
  box-shadow: 0 2px 12px color-mix(in srgb, var(--main-color) 30%, transparent);
}

.tag-count {
  min-width: 20px;
  padding: 0 6px;
  font-size: 0.72rem;
  text-align: center;
  border-radius: 999px;
  background-color: color-mix(in srgb, var(--main-color) 12%, transparent);
  color: var(--vp-c-text-2);
  transition: all 0.3s ease;
}

.tag-pill-active .tag-count {
  background-color: rgba(255, 255, 255, 0.25);
  color: #fff;
}

/* 页面评论区（Comment 组件根节点会继承父作用域 id，scoped 规则可命中） */
.link-page-comment {
  margin-top: 4px;
}

/* 移动端让位：主题把 .VPNav 在所有断点强制为悬浮玻璃条（position: fixed），
   但 VPContent 的 padding-top 补偿只在 ≥960px 生效。<960px 时文档页有
   .VPLocalNav 自然让位、home 有主题补的 padding-top，而自定义布局页两头
   都没有——这里对齐 DetailLayout 的做法补出 NavBar 高度。
   桌面端 VPContent 已含 var(--vp-nav-height) 顶距，无需处理。 */
@media (max-width: 959.9px) {
  #main {
    padding-top: calc(var(--vp-nav-height) + 16px);
  }
}

/* ===== TransitionGroup FLIP 动画 ===== */
.link-flip-move,
.link-flip-enter-active,
.link-flip-leave-active {
  transition: all 0.45s cubic-bezier(0.22, 1, 0.36, 1);
}

.link-flip-enter-from {
  opacity: 0;
  transform: translateY(16px) scale(0.92);
}

.link-flip-leave-to {
  opacity: 0;
  transform: scale(0.92);
}

/* 离场卡片脱离文档流，剩余卡片立刻触发 move 换位动画 */
.link-flip-leave-active {
  position: absolute;
  z-index: 0;
}

/* 减弱动态效果偏好时直接切换 */
@media (prefers-reduced-motion: reduce) {
  .link-flip-move,
  .link-flip-enter-active,
  .link-flip-leave-active {
    transition: none;
  }
}
</style>
