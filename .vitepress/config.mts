import { defineConfig, type Plugin } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'

/**
 * 客户端行为补丁（不改动 node_modules，随仓库走，升级 VitePress 后依然生效）：
 *
 * 1. VPLocalSearchBox：注入"延迟卸载"逻辑，让关闭动画有时间播放。
 *    原实现：VPNavBarSearch 中 <VPLocalSearchBox v-if @close="showSearch = false">
 *    在收到 close 事件的同一帧卸载组件，CSS 退出动画来不及播放。这里把所有
 *    emit('close') / $emit('close') 替换为 requestClose()：先加 .closing 类
 *    播退出动画，动画结束后再真正 emit 触发卸载。
 *
 * 2. app/router.js：锚点跳转平滑滚动。
 *    原实现：scrollTo() 调用 target.scrollIntoView({ block: 'start' })，
 *    behavior 缺省为 auto（瞬时）。这里注入 behavior: 'smooth'（尊重
 *    prefers-reduced-motion）。popstate 恢复滚动位置走的是 window.scrollTo(0, n)，
 *    不受影响，浏览器前进/后退仍然是瞬时定位。
 */
function vivianClientPatches(): Plugin {
  return {
    name: 'vivian:client-patches',
    enforce: 'pre',
    transform(code, id) {
      // —— 补丁 1：搜索弹窗延迟卸载 ——
      if (id.includes('VPLocalSearchBox.vue')) {
        const emitsDecl =
          /const emit = defineEmits<\{\s*\(e: 'close'\): void\s*\}>\(\)/
        if (!emitsDecl.test(code)) return null

        // 注意顺序：必须先替换 "$emit('close')" 再替换 "emit('close')"。
        // 反过来的话，"$emit('close')" 会先被命中其中的 "emit('close')" 子串，
        // 变成 "$requestClose()"——模板里引用了不存在的实例方法，运行时抛
        // "TypeError: e.$requestClose is not a function"，导致点击 backdrop /
        // 返回按钮 / 搜索结果全都无法关闭弹窗（移动端全屏时表现为"关不掉"）。
        // 模板里写成 "$requestClose()" 的另一个问题是 <script setup> 不会把
        // setup 顶层绑定暴露到实例上，所以即使拼对了 "$requestClose" 也不存在。
        // 替换成裸标识符 "requestClose" 后，编译器检测到模板引用了它，
        // 会自动把它收进渲染函数作用域，才是真正生效的调用方式。
        let out = code
          .replaceAll("$emit('close')", 'requestClose()')
          .replaceAll("emit('close')", 'requestClose()')

        const matched = out.match(emitsDecl)
        if (!matched) return null
        out = out.replace(
          matched[0],
          `${matched[0]}

/* vivian: 关闭动画 —— 延迟卸载，让退出动画有时间播放 */
const isClosing = ref(false)
function requestClose() {
  if (isClosing.value) return
  isClosing.value = true
  el.value?.classList.add('closing')
  window.setTimeout(() => emit('close'), 250)
}`
        )
        return { code: out, map: null }
      }

      // —— 补丁 2：锚点跳转平滑滚动 ——
      if (id.includes('app/router.js')) {
        const instant = "target.scrollIntoView({ block: 'start' });"
        if (!code.includes(instant)) return null
        const smooth =
          "target.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });"
        return { code: code.replace(instant, smooth), map: null }
      }

      // —— 补丁 3：移动端下拉菜单 "Return to top" 平滑滚动 ——
      // 原实现：<a class="top-link" href="#" @click="scrollToTop">，scrollToTop 里
      // 明明写了 window.scrollTo({ behavior: 'smooth' })，实际却是瞬时跳顶。
      // 原因：href="#" 被 router 的 window capture 点击监听（补丁 2 同款先手问题）
      // 当作"当前页"的同页导航拦截 → e.preventDefault() + router.go(当前URL)
      // → scrollTo('') 走 !hash 分支 → window.scrollTo(0, 0) 瞬时回顶，
      // 等组件自己的 scrollToTop 执行时页面已经在顶部，smooth 无事可做。
      // 修复：去掉 href="#"。router 明确跳过无 href 的链接（linkHref == null 直接
      // return），scrollToTop 的平滑滚动得以生效，router 也不会再多推一条历史记录。
      if (id.includes('VPLocalNavOutlineDropdown.vue')) {
        const anchor = '<a class="top-link" href="#" @click="scrollToTop">'
        if (!code.includes(anchor)) return null
        return { code: code.replace(anchor, anchor.replace(' href="#"', '')), map: null }
      }

      return null
    }
  }
}

export default defineConfig({
  appearance: true,
  head: [
    ['link', { rel: 'icon', href: '/img/fav.ico' }],
    ['script', {}, `
      (function() {
        const mode = localStorage.getItem('vitepress-theme-mode') || 'auto';
        let isDark;
        if (mode === 'auto') {
          isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        } else {
          isDark = mode === 'dark';
        }
        document.documentElement.classList.toggle('dark', isDark);
      })();
    `]
  ],
  title: "Quaver Music",
  description: "简洁、美观、百变",
  themeConfig: {
    // 站点图标配置（自定义实现，不使用 VitePress 内置 logo）
    vivianLogo: {
      src: '/imgs/fav.svg', // 图标路径（支持 SVG、ICO、图片）
      alt: 'Quaver Icon', // 图标描述
    },
    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: '搜索' },
          modal: {
            footer: {
              selectText: '选中',
              navigateText: '导航',
              closeText: '关闭搜索'
            }
          }
        }
      }
    },
    outline: { label: '在此章节中' },
    docFooter: { prev: '上一章节', next: '下一章节' },
    darkModeSwitchLabel: '深浅色模式',
    darkModeSwitchTitle: '切换到深色模式',
    lightModeSwitchTitle: '切换到浅色模式',
    notFound: {
      title: '页面不见了',
      quote: '页面藏起来了，可能是站长遗忘了或者你输入错了？',
      linkLabel: '回到首页',
      linkText: '返回首页'
    },
    footer: {
      message: 'Powered by VitePress x Vivian',
      copyright: 'Copyright © 2026 Ne0W0r1d'
    },
    // 评论系统配置（支持: none | twikoo | utterances）
    comment: {
      provider: 'utterances', // 评论系统提供商: 'none' | 'twikoo' | 'utterances'

      // Twikoo 配置
      twikoo: {
        enabled: false, // 是否启用评论系统
        envId: 'https://your-twikoo-url.vercel.app', // Twikoo 环境 ID
        // 可选配置
        // region: 'ap-shanghai',
        // path: 'window.location.pathname',
        // lang: 'zh-CN',
      },

      // Utterances 配置（基于 GitHub Issues）
      utterances: {
        repo: 'team-quaver/quaver-doc-comments', // 仓库名，格式: owner/repo
        issueTerm: 'pathname', // 用于匹配 issue 的字段: pathname | url | title | og:title
        label: '', // 可选: issue 标签
        theme: 'preferred-color-scheme', // 可选: github-light | github-dark | preferred-color-scheme 等
        crossorigin: 'anonymous', // 可选: anonymous | use-credentials
      },
    },

    nav: [
      { text: '主页', link: '/' },
      { text: '文档', link: '/guide/' },
      { text: '免责协议', link: '/agreement' },
      { text: '友链', link: '/links.md' },
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/team-quaver/quaver-music' },
    ],
    sidebar: [
      {
        text: '开始',
        items: [
          { text: '介绍', link: '/guide/' },
          { text: '更新日志', link: '/CHANGELOG' },
          { text: '免责协议', link: '/agreement' },
          { text: '插件', link: '/sparkle/' },
          { text: '下载', link: '/download/' },
        ],
      },
      {
        text: '开发（WIP）',
        items: [
          { text: '插件', link: '/sparkle-dev' },
          { text: '前端模块', link: '/quaver-frontend' },
          { text: 'Typhoeus - TypeScript', link: '/typhoeus-ts' },
          { text: 'Typhoeus - Python', link: '/typhoeus-py' },
        ],
      },
      {
        text: 'Q/A',
        items: [
          { text: 'Crotchet Mode - 调试模式', link: '/crotchet' },
          { text: 'macOS 常见问题', link: '/macos-issues' },
          { text: 'Windows 常见问题', link: '/windows-issues' },
          { text: 'Wayland 兼容性', link: '/wayland-issues' },
          { text: 'Quaver 开发立场', link: '/position' },
        ],
      },
    ]
  },
  markdown: {
    theme: {
      light: 'everforest-light',
      dark: 'everforest-dark'
    },
    lineNumbers: true
  },
  vite: {
    plugins: [tailwindcss(), vivianClientPatches()]
  }
})
