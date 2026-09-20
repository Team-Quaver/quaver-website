<template>
  <div class="detail-layout" :class="{ 'detail-as-layout': isPageLayout }">
    <!-- 可选通栏封面图 -->
    <div class="detail-cover" v-if="cover">
      <img :src="cover" :alt="title || ''" />
    </div>

    <!-- PC: 左图右信息 | Mobile: 纵向堆叠 -->
    <div class="detail-hero">
      <div class="detail-image" v-if="image">
        <img :src="image" :alt="title || ''" />
      </div>
      <div class="detail-info">
        <span class="detail-tag" v-if="tag">{{ tag }}</span>
        <h1 class="detail-title" v-if="title">{{ title }}</h1>
        <p class="detail-subtitle" v-if="subtitle">{{ subtitle }}</p>
        <div class="detail-table" v-if="fields?.length">
          <div class="detail-row" v-for="(field, i) in fields" :key="i">
            <span class="detail-label" v-html="inlineMd(field.label)"></span>
            <span class="detail-value" v-html="inlineMd(field.value)"></span>
          </div>
        </div>
      </div>
    </div>

    <!-- 整页布局模式（layout: detail）：渲染 Markdown 正文 -->
    <div v-if="isPageLayout" class="detail-body vp-doc">
      <Content />
    </div>

    <!-- 整页布局模式：评论区。自定义 layout 分支不经过 VPDoc，
         Layout.vue 的 doc-after 插槽没有出口，需要在这里自行挂载 -->
    <Comment v-if="isPageLayout" class="detail-comment" />
  </div>
</template>

<script lang="ts">
/**
 * 构建期收集项目内全部图片源文件（排除 public / node_modules / .vitepress），
 * 编译为最终产物 URL，形成「源文件路径 → 产物 URL」映射。
 *
 * 放在模块作用域：整站只构建一次映射，不随组件实例重建；SSR/水合两侧一致。
 * 注意：import.meta.glob 的参数必须是静态字面量，不能拼接变量。
 */
const sourceImages = import.meta.glob(
  [
    '/**/*.{png,jpg,jpeg,gif,webp,svg,avif,bmp,ico}',
    '!/public/**',
    '!/**/node_modules/**',
    '!/.vitepress/**'
  ],
  { eager: true, query: '?url', import: 'default' }
) as Record<string, string>
</script>

<script setup lang="ts">
import { computed, inject, provide } from 'vue'
import { useData, withBase } from 'vitepress'
import { mdRender } from '../markdown'
import Comment from '../Comment.vue'

// 防递归标记：layout: detail 模式下本组件会渲染 <Content />，
// 若正文里又写了 <detail />，内层实例通过 inject 感知，保持 hero 模式不再渲染正文。
const LAYOUT_BODY_KEY = 'vivian:detail-as-layout'
const insideLayoutBody = inject<boolean>(LAYOUT_BODY_KEY, false)
provide(LAYOUT_BODY_KEY, true)

const { frontmatter, page } = useData()

const props = withDefaults(
  defineProps<{
    image?: string
    cover?: string
    title?: string
    subtitle?: string
    tag?: string
    fields?: { label: string; value: string }[]
  }>(),
  {
    image: undefined,
    cover: undefined,
    title: undefined,
    subtitle: undefined,
    tag: undefined,
    fields: undefined,
  }
)

// 优先使用组件 props，回退到 frontmatter（兼容旧用法）。
// image/cover 保存原始值（raw），解析后再交给 <img :src>
const rawImage = computed(() => props.image || frontmatter.value.image)
const rawCover = computed(() => props.cover || frontmatter.value.cover)
const image = computed(() => resolveAsset(rawImage.value))
const cover = computed(() => resolveAsset(rawCover.value))
const title = computed(() => props.title || frontmatter.value.title)
const subtitle = computed(() => props.subtitle || frontmatter.value.subtitle)
const tag = computed(() => props.tag || frontmatter.value.tag)
const fields = computed(() => props.fields || frontmatter.value.fields || [])

/**
 * 解析 Detail 布局的图片地址，支持三种写法：
 *
 * 1. 相对路径（./img.webp、../assets/img.webp、img.webp）
 *    以「当前页面所在目录」为基准解析，再查 sourceImages 映射换成产物 URL。
 *    这与 Markdown 正文里相对图片的 VitePress 语义一致。
 *    查不到映射时回退为解析后的相对 URL（开发模式未被 glob 收录时兜底）。
 *
 * 2. 站点绝对路径（/imgs/vivian.webp）
 *    指向 public 目录，经 withBase 处理，兼容 base 非根部署。
 *    若恰好在 sourceImages 里（如主题包内图片），优先用产物 URL。
 *
 * 3. 完整 URL（https://... 等）
 *    含协议或 // 开头，原样返回。
 */
function resolveAsset(src?: string): string {
  if (!src) return ''

  // 先 trim：容忍 YAML 引号内的前导/尾随空格（如 image: " /imgs/x.webp"）
  const clean = src.trim()

  // 完整 URL / 协议相对地址：原样返回
  if (/^(https?:)?\/\//i.test(clean) || /^(data|blob|mailto):/i.test(clean)) {
    return clean
  }

  // 站点绝对路径：优先查映射（写绝对路径但实际指向 srcDir 内源文件时也能命中），
  // 未命中视为 public 资源，补 base 前缀
  if (clean.startsWith('/')) {
    return sourceImages[clean] || withBase(clean)
  }

  // 相对路径：以当前页面所在目录为基准（与 Markdown 相对图片语义一致）。
  // page.relativePath 是当前页面相对 srcDir 的源文件路径（如 guide/detail.md），
  // 取其目录部分拼接相对路径后再查映射。SSR 与客户端该值一致，水合稳定。
  // cleanPath 会把多斜杠压成一个，再手动拼接，避免 split 产生空段。
  const dir = cleanPath(`/${page.value.relativePath}`)
    .split('/')
    .slice(0, -1)
    .join('/')
  const joined = cleanPath(`${dir}/${clean}`)
  return sourceImages[joined] || withBase(joined)
}

/** 规范化路径：压缩连续斜杠、解析 ./ 与 ../ 段，始终以 / 开头 */
function cleanPath(p: string): string {
  const normalized = `/${p}`.replace(/\/{2,}/g, '/')
  const out: string[] = []
  for (const seg of normalized.split('/')) {
    if (seg === '' || seg === '.') continue
    if (seg === '..') {
      out.pop()
    } else {
      out.push(seg)
    }
  }
  return `/${out.join('/')}`
}

// 页面布局模式：frontmatter 声明 layout: detail 时，VitePress 会把本组件
// 当作整页布局渲染（VPContent 的 <component :is="frontmatter.layout" /> 分支），
// 此时组件负责 hero + Markdown 正文 + 评论区；行内用法（<detail />）只渲染 hero。
const isPageLayout = computed(() => frontmatter.value.layout === 'detail' && !insideLayoutBody)

// 将字段文本按 Markdown 渲染（支持超链接、加粗、行内代码）
function inlineMd(src?: string): string {
  return mdRender(src)
}
</script>

<style scoped>
.detail-layout {
  width: 100%;
  max-width: 100%;
  padding: calc(var(--vp-nav-height) + 24px) 32px 48px;
}

/* 整页布局模式：限宽居中（行内模式由 VPDoc 负责限宽） */
.detail-as-layout {
  max-width: var(--vp-layout-max-width);
  margin-inline: auto;
}

.detail-body {
  margin-bottom: 24px;
}

/* 通栏封面 */
.detail-cover {
  margin-bottom: 32px;
  border-radius: 16px;
  overflow: hidden;
  background-color: color-mix(in srgb, var(--vp-c-bg) 45%, transparent);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid color-mix(in srgb, var(--vp-c-border) 50%, transparent);
  box-shadow:
    0 2px 8px color-mix(in srgb, var(--main-color) 12%, transparent),
    0 4px 16px color-mix(in srgb, var(--main-color) 8%, transparent);
}

.detail-cover img {
  width: 100%;
  height: auto;
  display: block;
}

/* PC: 左右布局 */
.detail-hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  align-items: start;
  margin-bottom: 40px;
}

.detail-as-layout .detail-hero {
  margin-bottom: 32px;
}

/* 预览图 */
.detail-image {
  position: sticky;
  top: calc(var(--vp-nav-height) + 24px);
  border-radius: 16px;
  overflow: hidden;
  background-color: color-mix(in srgb, var(--vp-c-bg) 45%, transparent);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid color-mix(in srgb, var(--vp-c-border) 50%, transparent);
  box-shadow:
    0 2px 8px color-mix(in srgb, var(--main-color) 12%, transparent),
    0 4px 16px color-mix(in srgb, var(--main-color) 8%, transparent);
}

.detail-image img {
  width: 100%;
  height: auto;
  display: block;
}

/* 信息区域 */
.detail-info {
  padding: 36px 48px;
  background-color: color-mix(in srgb, var(--vp-c-bg) 40%, transparent);
  -webkit-backdrop-filter: blur(40px) saturate(200%);
  backdrop-filter: blur(40px) saturate(200%);
  border: 1px solid color-mix(in srgb, var(--vp-c-border) 50%, transparent);
  border-radius: 16px;
  box-shadow:
    0 2px 8px color-mix(in srgb, var(--main-color) 12%, transparent),
    0 4px 16px color-mix(in srgb, var(--main-color) 8%, transparent);
}

/* 标签徽章 */
.detail-tag {
  display: inline-block;
  margin-bottom: 14px;
  padding: 4px 14px;
  font-size: 0.8rem;
  font-weight: 600;
  color: #fff;
  background-color: var(--main-color);
  border-radius: 999px;
  letter-spacing: 0.02em;
}

.detail-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
  margin-bottom: 12px;
  padding-bottom: 12px;
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-border) 40%, transparent);
}

/* 副标题 */
.detail-subtitle {
  margin: -4px 0 16px;
  font-size: 1rem;
  color: var(--vp-c-text-2);
  line-height: 1.6;
}

/* 信息表格 */
.detail-table {
  width: 100%;
}

.detail-row {
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-border) 40%, transparent);
  align-items: baseline;
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-label {
  font-weight: 600;
  color: var(--vp-c-text-2);
  white-space: nowrap;
}

.detail-value {
  color: var(--vp-c-text-1);
  word-break: break-word;
}

/* 深色模式 */
.dark .detail-image,
.dark .detail-cover {
  background-color: color-mix(in srgb, var(--vp-c-bg) 55%, transparent);
}

.dark .detail-info {
  background-color: color-mix(in srgb, var(--vp-c-bg) 55%, transparent);
}

/* ========== 移动端：纵向堆叠 ========== */
@media (max-width: 959px) {
  .detail-layout {
    padding: calc(var(--vp-nav-height) + 16px) 16px 32px;
  }

  .detail-cover {
    margin-bottom: 20px;
  }

  .detail-hero {
    grid-template-columns: 1fr;
    gap: 20px;
  }

  .detail-image {
    position: static;
  }

  .detail-info {
    padding: 20px;
  }

  .detail-title {
    font-size: 1.25rem;
  }

  .detail-subtitle {
    font-size: 0.95rem;
  }
}
</style>
