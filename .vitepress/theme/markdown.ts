/**
 * 轻量行内 Markdown 渲染（零依赖，SSR/客户端通用）
 *
 * 仅用于 detail 组件的 fields 字段，使其支持：
 *   - 超链接      [文字](https://url)
 *   - 加粗        **文字**
 *   - 行内代码    `文字`
 *
 * 安全：先对原始文本做 HTML 转义，仅允许 http/https/mailto/相对路径链接，
 * 外部链接统一加 target="_blank" rel="noreferrer"，避免 XSS。
 */

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function safeHref(url: string): string | null {
  const u = url.trim()
  // 允许：相对路径、锚点、mailto:、http(s)://
  if (/^(https?:\/\/|mailto:|\/|#|\.\/|\.\.\/)/i.test(u)) return u
  return null
}

/**
 * 将一段行内 Markdown 字符串渲染为 HTML。
 * 用于 detail 组件的 fields 字段，使其支持超链接等 Markdown 语法。
 */
export function mdRender(src: string): string {
  if (!src) return ''
  let text = escapeHtml(src)

  // 行内代码 `code`
  text = text.replace(/`([^`]+)`/g, (_m, code) => `<code>${code}</code>`)

  // 加粗 **bold**
  text = text.replace(/\*\*([^*]+)\*\*/g, (_m, bold) => `<strong>${bold}</strong>`)

  // 超链接 [text](url)
  text = text.replace(
    /\[([^\]]+)\]\(([^)\s]+)\)/g,
    (_m, label, url) => {
      const href = safeHref(url)
      if (!href) return label // 非法链接：回退为纯文本
      const external = /^https?:\/\//i.test(href)
      const attrs = external
        ? ' target="_blank" rel="noreferrer"'
        : ''
      return `<a href="${href}"${attrs}>${label}</a>`
    }
  )

  return text
}
