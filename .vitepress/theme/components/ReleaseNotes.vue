<template>
  <div class="release-notes-body">
    <template v-for="(block, index) in blocks" :key="index">
      <component
        :is="`h${block.level}`"
        v-if="block.type === 'heading'"
        v-html="renderInline(block.text)"
      />

      <p v-else-if="block.type === 'paragraph'" v-html="renderInline(block.text)" />

      <figure v-else-if="block.type === 'image'" class="release-image">
        <a :href="block.src" target="_blank" rel="noopener noreferrer">
          <img
            :src="block.src"
            :alt="block.alt"
            loading="lazy"
            decoding="async"
            referrerpolicy="no-referrer"
          />
        </a>
        <figcaption v-if="block.title">{{ block.title }}</figcaption>
      </figure>

      <blockquote v-else-if="block.type === 'quote'" v-html="renderInline(block.text)" />

      <pre v-else-if="block.type === 'code'"><code>{{ block.text }}</code></pre>

      <component
        :is="block.ordered ? 'ol' : 'ul'"
        v-else-if="block.type === 'list'"
      >
        <li
          v-for="(item, itemIndex) in block.items"
          :key="itemIndex"
          v-html="renderInline(item)"
        />
      </component>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

/**
 * GitHub Release 正文是运行时字符串，不能走 VitePress 的构建期 Markdown 渲染。
 * 这里只实现发行说明常用的块级语法；行内语法统一先转义再拼接安全标签，
 * 因而不会执行远端 HTML；仅保留 <img>，且图片地址只接受 http(s)。
 */

type Block =
  | { type: 'heading'; level: number; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'image'; src: string; alt: string; title: string }
  | { type: 'quote'; text: string }
  | { type: 'list'; ordered: boolean; items: string[] }
  | { type: 'code'; text: string }

const props = withDefaults(
  defineProps<{
    body?: string
    repoUrl?: string
  }>(),
  {
    body: '',
    repoUrl: ''
  }
)

const blocks = computed(() => parseBlocks(normalizeBody(props.body)))

function normalizeBody(body: string): string {
  return String(body || '')
    .replace(/\r\n?/g, '\n')
    .replace(/<!--[\s\S]*?-->/g, '')
    .replace(/<br\s*\/?>/gi, '\n')
    // GitHub 的 release note 常用 <img>，必须在剥标签前保留下来
    .replace(/<img\b[^>]*>/gi, tag => {
      const src = decodeEntities(readAttribute(tag, 'src'))
      if (!src) return ''
      const alt = decodeEntities(readAttribute(tag, 'alt'))
      const title = decodeEntities(readAttribute(tag, 'title'))
      return `\n\n${imageMarkdown(alt, src, title)}\n\n`
    })
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .trim()
}

function readAttribute(tag: string, name: string): string {
  const pattern = new RegExp(
    `(?:^|\\s)${name}\\s*=\\s*(?:"([^"]*)"|'([^']*)'|([^\\s"'>]+))`,
    'i'
  )
  const match = tag.match(pattern)
  return match?.[1] ?? match?.[2] ?? match?.[3] ?? ''
}

function decodeEntities(value: string): string {
  return value
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function imageMarkdown(alt: string, src: string, title: string): string {
  const safeAlt = alt.replace(/[[\]]/g, '')
  const safeTitle = title ? ` "${title.replace(/"/g, '')}"` : ''
  return `![${safeAlt}](${src}${safeTitle})`
}

function parseBlocks(markdown: string): Block[] {
  const lines = markdown.split('\n')
  const result: Block[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index]
    const trimmed = line.trim()

    if (!trimmed) {
      index += 1
      continue
    }

    if (trimmed.startsWith('```')) {
      const code: string[] = []
      index += 1
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        code.push(lines[index])
        index += 1
      }
      result.push({ type: 'code', text: code.join('\n') })
      index += 1
      continue
    }

    const image = parseStandaloneImage(trimmed)
    if (image) {
      result.push({ type: 'image', ...image })
      index += 1
      continue
    }

    const heading = trimmed.match(/^(#{1,6})\s+(.+)$/)
    if (heading) {
      result.push({
        type: 'heading',
        // 正文标题降两级，避免和下载页自身的 h1/h2 抢层级
        level: Math.min(6, heading[1].length + 2),
        text: heading[2].trim()
      })
      index += 1
      continue
    }

    if (/^>\s?/.test(trimmed)) {
      const quote: string[] = []
      while (index < lines.length && /^>\s?/.test(lines[index].trim())) {
        quote.push(lines[index].trim().replace(/^>\s?/, ''))
        index += 1
      }
      result.push({ type: 'quote', text: quote.join(' ') })
      continue
    }

    if (/^[-*]\s+/.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length && /^[-*]\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^[-*]\s+/, ''))
        index += 1
      }
      result.push({ type: 'list', ordered: false, items })
      continue
    }

    if (/^\d+\.\s+/.test(trimmed)) {
      const items: string[] = []
      while (index < lines.length && /^\d+\.\s+/.test(lines[index].trim())) {
        items.push(lines[index].trim().replace(/^\d+\.\s+/, ''))
        index += 1
      }
      result.push({ type: 'list', ordered: true, items })
      continue
    }

    const paragraph: string[] = []
    while (index < lines.length) {
      const current = lines[index].trim()
      if (
        !current ||
        current.startsWith('```') ||
        /^(#{1,6})\s+/.test(current) ||
        /^>\s?/.test(current) ||
        /^[-*]\s+/.test(current) ||
        /^\d+\.\s+/.test(current)
      ) {
        break
      }
      paragraph.push(current)
      index += 1
    }
    result.push({ type: 'paragraph', text: paragraph.join(' ') })
  }

  return result
}

function parseStandaloneImage(line: string): { src: string; alt: string; title: string } | null {
  const match = line.match(/^!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)$/)
  if (!match) return null
  const src = safeImageSrc(match[2])
  if (!src) return null
  return { src, alt: match[1], title: match[3] || '' }
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeHref(raw: string): string | null {
  const value = raw.trim()
  if (/^https?:\/\//i.test(value)) return value
  if (props.repoUrl) {
    if (/^#\d+$/.test(value)) return `${props.repoUrl}/issues/${value.slice(1)}`
    if (/^@[A-Za-z0-9-]+$/.test(value)) return `https://github.com/${value.slice(1)}`
  }
  return null
}

function safeImageSrc(raw: string): string | null {
  const value = raw.trim()
  if (/^https?:\/\//i.test(value)) return value
  if (/^\/\//.test(value)) return `https:${value}`
  return null
}

/**
 * 输出已经过 HTML 转义的行内 Markdown。所有属性值都来自转义后的文本，
 * 且链接 / 图片协议被限制为 http(s)，可以安全交给 v-html。
 */
function renderInline(source: string): string {
  const pattern =
    /!\[([^\]]*)\]\((\S+?)(?:\s+"([^"]*)")?\)|(\*\*([^*]+)\*\*)|(`([^`]+)`)|(\[([^\]]+)\]\(([^)\s]+)\))|(https?:\/\/[^\s<)]+)/g

  let output = ''
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = pattern.exec(source)) !== null) {
    output += escapeHtml(source.slice(lastIndex, match.index))

    if (match[1] !== undefined) {
      const src = safeImageSrc(match[2])
      if (src) {
        const title = match[3] ? ` title="${escapeHtml(match[3])}"` : ''
        output += `<a class="release-image-link" href="${escapeHtml(src)}" target="_blank" rel="noopener noreferrer"><img src="${escapeHtml(src)}" alt="${escapeHtml(match[1])}"${title} loading="lazy" decoding="async" referrerpolicy="no-referrer" /></a>`
      } else {
        output += escapeHtml(match[0])
      }
    } else if (match[5]) {
      output += `<strong>${escapeHtml(match[5])}</strong>`
    } else if (match[7]) {
      output += `<code>${escapeHtml(match[7])}</code>`
    } else if (match[9] && match[10]) {
      const href = safeHref(match[10])
      output += href
        ? `<a href="${escapeHtml(href)}" target="_blank" rel="noopener noreferrer">${escapeHtml(match[9])}</a>`
        : escapeHtml(match[9])
    } else if (match[11]) {
      output += `<a href="${escapeHtml(match[11])}" target="_blank" rel="noopener noreferrer">${escapeHtml(match[11])}</a>`
    }

    lastIndex = pattern.lastIndex
  }

  output += escapeHtml(source.slice(lastIndex))
  return output
}
</script>

<style scoped>
.release-notes-body {
  max-height: min(70vh, 640px);
  overflow-y: auto;
  padding: 4px 20px 18px;
  color: var(--vp-c-text-1);
  font-size: 0.92rem;
  line-height: 1.75;
}

.release-notes-body :deep(h3),
.release-notes-body :deep(h4),
.release-notes-body :deep(h5),
.release-notes-body :deep(h6) {
  margin: 18px 0 8px;
  color: var(--vp-c-text-1);
  font-size: 0.98rem;
  font-weight: 700;
}

.release-notes-body :deep(h3:first-child) {
  margin-top: 8px;
}

.release-notes-body :deep(p) {
  margin: 0 0 10px;
}

.release-notes-body :deep(ul),
.release-notes-body :deep(ol) {
  margin: 0 0 10px;
  padding-left: 1.4rem;
}

.release-notes-body :deep(li + li) {
  margin-top: 4px;
}

.release-notes-body :deep(a) {
  color: var(--main-color);
  text-decoration: none;
  word-break: break-word;
}

.release-notes-body :deep(a:hover) {
  text-decoration: underline;
}

.release-image {
  margin: 14px 0;
  text-align: center;
}

.release-image a {
  display: block;
}

.release-image img {
  display: block;
  max-width: 100%;
  max-height: 420px;
  margin: 0 auto;
  border: 1px solid color-mix(in srgb, var(--main-color) 16%, var(--vp-c-divider));
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  object-fit: contain;
}

.release-image figcaption {
  margin-top: 6px;
  color: var(--vp-c-text-3);
  font-size: 0.76rem;
  line-height: 1.5;
}

.release-notes-body :deep(img) {
  display: block;
  max-width: 100%;
  max-height: 420px;
  margin: 12px auto;
  border: 1px solid color-mix(in srgb, var(--main-color) 16%, var(--vp-c-divider));
  border-radius: 12px;
  background: var(--vp-c-bg-soft);
  object-fit: contain;
}

.release-notes-body :deep(code) {
  border-radius: 5px;
  padding: 0.15em 0.4em;
  background: color-mix(in srgb, var(--main-color) 10%, transparent);
  font-family: var(--vp-font-family-mono);
  font-size: 0.86em;
}

.release-notes-body :deep(blockquote) {
  margin: 0 0 10px;
  border-left: 3px solid color-mix(in srgb, var(--main-color) 45%, transparent);
  padding-left: 12px;
  color: var(--vp-c-text-2);
}

.release-notes-body :deep(pre) {
  margin: 0 0 10px;
  overflow-x: auto;
  border-radius: 10px;
  padding: 12px 14px;
  background: var(--vp-code-block-bg);
}

.release-notes-body :deep(pre code) {
  padding: 0;
  background: transparent;
}
</style>
