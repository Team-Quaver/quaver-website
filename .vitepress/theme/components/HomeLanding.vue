<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { useData } from 'vitepress'

const { isDark } = useData()

const rootEl = ref<HTMLElement | null>(null)
const revealTargets = reactive<Element[]>([])
let revealObserver: IntersectionObserver | null = null

function collectReveals() {
  const root = rootEl.value
  if (!root) return
  revealTargets.length = 0
  revealTargets.push(...Array.from(root.querySelectorAll('.q-reveal')))
}

onMounted(() => {
  startPlayer()
  collectReveals()
  const reduceMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (reduceMotion || typeof IntersectionObserver === 'undefined') {
    revealTargets.forEach(el => el.classList.add('is-visible'))
    return
  }
  revealObserver = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          revealObserver?.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
  )
  revealTargets.forEach(el => revealObserver?.observe(el))
})

onBeforeUnmount(() => {
  stopPlayer()
  revealObserver?.disconnect()
  revealObserver = null
})

const heroTilt = reactive({ rx: 0, ry: 0, mx: 50, my: 50 })
function onHeroMove(event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  const px = (event.clientX - rect.left) / rect.width
  const py = (event.clientY - rect.top) / rect.height
  heroTilt.ry = (px - 0.5) * 10
  heroTilt.rx = (0.5 - py) * 8
  heroTilt.mx = px * 100
  heroTilt.my = py * 100
}
function onHeroLeave() {
  heroTilt.rx = 0
  heroTilt.ry = 0
  heroTilt.mx = 50
  heroTilt.my = 50
}

const spotlight = reactive<Record<number, { x: number; y: number; on: boolean }>>({})
function onCardMove(index: number, event: MouseEvent) {
  const target = event.currentTarget as HTMLElement
  const rect = target.getBoundingClientRect()
  spotlight[index] = {
    x: ((event.clientX - rect.left) / rect.width) * 100,
    y: ((event.clientY - rect.top) / rect.height) * 100,
    on: true
  }
}
function onCardLeave(index: number) {
  if (spotlight[index]) spotlight[index].on = false
}

type PlayerTrack = {
  title: string
  artist: string
  cover: string
  duration: number
}

const playerTracks: PlayerTrack[] = [
  {
    title: 'Fire Again 战火重燃',
    artist: '无畏契约 / Ashnikko',
    cover: '/imgs/fire-again.jpg',
    duration: 168
  },
  {
    title: 'Ticking Away 流光似箭',
    artist: '无畏契约 / Grabbitz / bbno$',
    cover: '/imgs/ticking-away.jpg',
    duration: 225
  },
  {
    title: 'SUPERPOWER',
    artist: '无畏契约 / 쥴리 (KISS OF LIFE) / 나띠 (KISS OF LIFE) / 段宜恩',
    cover: '/imgs/superpower.jpg',
    duration: 172
  }
]

const playerIndex = ref(1)
const playerPlaying = ref(true)
const playerElapsed = ref(0)
const currentTrack = computed(() => playerTracks[playerIndex.value])
const progressPercent = computed(() =>
  Math.min(100, (playerElapsed.value / currentTrack.value.duration) * 100)
)
const progressLabel = computed(
  () => `${formatTime(playerElapsed.value)} / ${formatTime(currentTrack.value.duration)}`
)

function formatTime(seconds: number) {
  const total = Math.max(0, Math.floor(seconds))
  return `${Math.floor(total / 60)}:${String(total % 60).padStart(2, '0')}`
}

function stepTrack(step: number) {
  playerIndex.value =
    (playerIndex.value + step + playerTracks.length) % playerTracks.length
  playerElapsed.value = 0
}

function togglePlay() {
  playerPlaying.value = !playerPlaying.value
}

let coversPreloaded = false

function preloadCovers() {
  if (coversPreloaded) return
  coversPreloaded = true
  playerTracks.forEach(track => {
    const image = new Image()
    image.src = track.cover
  })
}

let playerTimer: number | undefined
let lastTick = 0

function startPlayer() {
  lastTick = performance.now()
  playerTimer = window.setInterval(() => {
    const now = performance.now()
    const delta = (now - lastTick) / 1000
    lastTick = now
    if (!playerPlaying.value || delta > 1.5) return
    playerElapsed.value += delta
    if (playerElapsed.value >= currentTrack.value.duration) {
      playerElapsed.value = 0
      playerIndex.value = (playerIndex.value + 1) % playerTracks.length
    }
  }, 250)
}

function stopPlayer() {
  if (playerTimer !== undefined) {
    window.clearInterval(playerTimer)
    playerTimer = undefined
  }
}
</script>

<template>
  <div ref="rootEl" class="q-landing" :class="{ dark: isDark }">
    <!-- ============ HERO ============ -->
    <section class="q-hero">
      <div class="q-hero-bg" aria-hidden="true">
        <span class="q-aurora q-aurora-a" />
        <span class="q-aurora q-aurora-b" />
        <span class="q-aurora q-aurora-c" />
        <span class="q-hero-grid" />
      </div>

      <div class="q-hero-inner">
        <div class="q-hero-copy">

          <h1 class="q-hero-title q-reveal" style="--d: 60ms">
            现代、流畅、<span class="q-grad">百变</span>
          </h1>
          <p class="q-hero-lead q-reveal" style="--d: 120ms">
            Electron + Vite 前端 // MyGO 原生版，Go 播放后端，花火插件系统。
            听歌体验，从这开始。
          </p>
          <ul class="q-hero-chips q-reveal" style="--d: 180ms" aria-label="支持平台">
            <li>Linux · x86 / ARM / LoongArch ABI2.0</li>
            <li>Windows · x86 / ARM</li>
            <li>macOS · Apple Silicon</li>
          </ul>
          <div class="q-hero-actions q-reveal" style="--d: 240ms">
            <a class="q-btn q-btn-primary" href="/guide/">
              <span>快速开始</span>
              <span class="q-btn-arrow" aria-hidden="true">→</span>
            </a>
            <a class="q-btn q-btn-ghost" href="/download/">下载客户端</a>
            <a
              class="q-btn q-btn-ghost"
              href="https://github.com/team-quaver"
              target="_blank"
              rel="noopener noreferrer"
            >GitHub ↗</a>
          </div>
        </div>

        <div
          class="q-hero-visual q-reveal"
          style="--d: 160ms"
          @mousemove="onHeroMove"
          @mouseleave="onHeroLeave"
        >
          <span class="q-hero-halo" aria-hidden="true" />
          <div
            class="q-mock"
            :class="{ 'is-paused': !playerPlaying }"
            role="group"
            aria-label="Quaver Music 播放器预览"
            @pointerenter="preloadCovers"
            @focusin="preloadCovers"
            :style="{
              '--rx': `${heroTilt.rx}deg`,
              '--ry': `${heroTilt.ry}deg`,
              '--mx': `${heroTilt.mx}%`,
              '--my': `${heroTilt.my}%`
            }"
          >
            <div class="q-mock-bar" aria-hidden="true">
              <span class="q-mock-dots">
                <i /><i /><i />
              </span>
              <span class="q-mock-title">Quaver Music</span>
              <span class="q-mock-pill">SQ · 无损</span>
            </div>
            <div class="q-mock-body">
              <div class="q-mock-cover">
                <Transition name="q-cover">
                  <img
                    :key="currentTrack.cover"
                    :src="currentTrack.cover"
                    :alt="`${currentTrack.title} 封面`"
                    width="540"
                    height="540"
                    decoding="async"
                  />
                </Transition>
                <span class="q-mock-cover-glow" aria-hidden="true" />
              </div>
              <div class="q-mock-meta">
                <div aria-live="polite">
                  <p class="q-mock-eyebrow">{{ playerPlaying ? 'NOW PLAYING' : 'PAUSED' }}</p>
                  <p class="q-mock-song">{{ currentTrack.title }}</p>
                  <p class="q-mock-artist" :title="currentTrack.artist">{{ currentTrack.artist }}</p>
                </div>
                <div
                  class="q-mock-progress"
                  role="progressbar"
                  :aria-label="`${currentTrack.title} 播放进度`"
                  aria-valuemin="0"
                  aria-valuemax="100"
                  :aria-valuenow="Math.round(progressPercent)"
                >
                  <span
                    class="q-mock-progress-fill"
                    :style="{ width: `${progressPercent}%` }"
                  />
                </div>
                <div class="q-mock-ctrl">
                  <button
                    class="q-mock-btn"
                    type="button"
                    aria-label="上一首"
                    title="上一首"
                    @click="stepTrack(-1)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M6 5h2.2v14H6zM19.5 5.6v12.8L9 12z" />
                    </svg>
                  </button>
                  <button
                    class="q-mock-play"
                    type="button"
                    :aria-label="playerPlaying ? '暂停' : '播放'"
                    :title="playerPlaying ? '暂停' : '播放'"
                    @click="togglePlay"
                  >
                    <svg v-if="playerPlaying" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M7 5h3.6v14H7zM13.4 5H17v14h-3.6z" />
                    </svg>
                    <svg v-else viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8 5.3v13.4L19.5 12z" />
                    </svg>
                  </button>
                  <button
                    class="q-mock-btn"
                    type="button"
                    aria-label="下一首"
                    title="下一首"
                    @click="stepTrack(1)"
                  >
                    <svg viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M15.8 5H18v14h-2.2zM4.5 5.6v12.8L15 12z" />
                    </svg>
                  </button>
                  <span class="q-mock-time">{{ progressLabel }}</span>
                </div>
              </div>
              <div class="q-mock-eq" aria-hidden="true">
                <i v-for="n in 28" :key="n" :style="{ '--i': n }" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ============ SHOWCASE ============ -->
    <section class="q-section q-showcase">
      <div class="q-section-head q-reveal">
        <p class="q-section-eyebrow">SHOWCASE</p>
        <h2 class="q-section-title">一眼<br />细节</h2>
        <p class="q-section-lead">
          毛玻璃、封面提色、逐字歌词，深浅模式与系统强调色跟随，让 Quaver 融进你的桌面。
        </p>
      </div>
      <div class="q-shots">
        <figure
          v-for="(shot, i) in showcaseShots"
          :key="shot.src"
          class="q-shot q-reveal"
          :style="{ '--d': `${i * 90}ms`, '--float-delay': `${i * -2.2}s` }"
        >
          <div class="q-shot-frame">
            <img
              :src="shot.src"
              :alt="shot.cap"
              :width="shot.w"
              :height="shot.h"
              loading="lazy"
              decoding="async"
            />
            <span class="q-shot-sheen" aria-hidden="true" />
          </div>
          <figcaption>
            <strong>{{ shot.cap }}</strong>
            <span>{{ shot.note }}</span>
          </figcaption>
        </figure>
      </div>
    </section>

    <!-- ============ DUAL PRODUCT ============ -->
    <section class="q-section q-products">
      <div class="q-section-head q-reveal">
        <p class="q-section-eyebrow">TWO FLAVORS</p>
        <h2 class="q-section-title">两种形态<br />同个体验</h2>
        <p class="q-section-lead">
          完整版把插件与本地能力全部带上；Astra 用原生界面换极致轻量。同一个后端，两种取舍。
        </p>
      </div>
      <div class="q-product-grid">
        <article class="q-product q-reveal" style="--d: 0ms">
          <header>
            <span class="q-product-icon" aria-hidden="true">
              <img src="/imgs/fav.svg" alt="" />
            </span>
            <div>
              <h3>Quaver Music</h3>
              <p class="q-product-tag">完整形态 · Electron + Sparkle</p>
            </div>
          </header>
          <ul class="q-product-list">
            <li><strong>Sparkle 插件系统</strong><span>主题 / 插件 / Marketplace，由你定义 Quaver</span></li>
            <li><strong>本地音乐 & AMLL 歌词</strong><span>逐字卡拉OK、翻译、QRC / TTML</span></li>
            <li><strong>系统集成</strong><span>MPRIS / SMTC / NowPlaying / 电源断言</span></li>
          </ul>
          <p class="q-product-platforms">
            <span>Linux x86 / ARM / 龙芯</span><span>Windows x86 / ARM</span><span>macOS Apple Silicon</span>
          </p>
          <a class="q-btn q-btn-soft" href="/download/">下载 Quaver Music</a>
        </article>

        <article class="q-product q-product-alt q-reveal" style="--d: 120ms">
          <header>
            <span class="q-product-icon" aria-hidden="true">
              <img src="/imgs/quaver-astra.svg" alt="" />
            </span>
            <div>
              <h3>Quaver Astra</h3>
              <p class="q-product-tag">轻量形态 · MyGO 原生界面</p>
            </div>
          </header>
          <ul class="q-product-list">
            <li><strong>Golang + MyGO Native</strong><span>不依赖 WebView，系统原生 GPU 加速</span></li>
            <li><strong>复用 Typhoeus-Go 后端</strong><span>与完整版同一套播放与接口实现</span></li>
            <li><strong>只做在线播放</strong><span>去掉插件与本地库，专注轻与快</span></li>
          </ul>
          <p class="q-product-platforms">
            <span>Linux x86 / ARM / 龙芯</span><span>Windows</span><span>macOS</span>
          </p>
          <a class="q-btn q-btn-soft" href="/quaver-astra">了解 Quaver Astra</a>
        </article>
      </div>
    </section>

    <!-- ============ BENTO FEATURES ============ -->
    <section class="q-section q-bento">
      <div class="q-section-head q-reveal">
        <p class="q-section-eyebrow">WHY QUAVER</p>
        <h2 class="q-section-title">为听歌而生的<br />每个细节</h2>
      </div>
      <div class="q-bento-grid">
        <article
          v-for="(card, i) in bentoCards"
          :key="card.title"
          class="q-card q-reveal"
          :class="card.wide ? 'q-card-wide' : ''"
          :style="{ '--d': `${i * 70}ms`, ...(spotlight[i] ? { '--mx': `${spotlight[i].x}%`, '--my': `${spotlight[i].y}%` } : {}) }"
          @mousemove="onCardMove(i, $event)"
          @mouseleave="onCardLeave(i)"
        >
          <span class="q-card-spot" :class="{ on: spotlight[i]?.on }" aria-hidden="true" />
          <span class="q-card-icon" aria-hidden="true">{{ card.icon }}</span>
          <h3>{{ card.title }}</h3>
          <p class="q-card-desc">{{ card.desc }}</p>
          <div v-if="card.kind === 'platforms'" class="q-card-visual q-marquee" aria-hidden="true">
            <div class="q-marquee-track">
              <span v-for="(p, idx) in [...platforms, ...platforms]" :key="`${p}-${idx}`">{{ p }}</span>
            </div>
          </div>
          <div v-else-if="card.kind === 'eq'" class="q-card-visual q-eq" aria-hidden="true">
            <i v-for="n in 32" :key="n" :style="{ '--i': n }" />
          </div>
          <div v-else-if="card.kind === 'sparkle'" class="q-card-visual q-chips" aria-hidden="true">
            <span>主题</span><span>插件</span><span>Marketplace</span>
          </div>
          <div v-else-if="card.kind === 'tint'" class="q-card-visual q-swatches" aria-hidden="true">
            <span style="--c: #b79cff" /><span style="--c: #ff9ec7" /><span style="--c: #7ee0d0" />
            <span style="--c: #ffd479" /><span style="--c: #9ad1ff" /><span style="--c: #ffa07a" />
          </div>
          <div v-else-if="card.kind === 'license'" class="q-card-visual q-license" aria-hidden="true">
            <span>AGPL</span><span>v3-only</span>
          </div>
          <div v-else-if="card.kind === 'community'" class="q-card-visual q-community" aria-hidden="true">
            <span>飞书问卷</span><span>GitHub Issues</span><span>LLM + 人工审核</span>
          </div>
        </article>
      </div>
    </section>

    <!-- ============ SPARKLE ============ -->
    <section class="q-section q-sparkle">
      <div class="q-sparkle-grid">
        <div class="q-sparkle-copy q-reveal">
          <p class="q-section-eyebrow">SPARKLE</p>
          <h2 class="q-section-title">花火插件<br />由你定义</h2>
          <p class="q-section-lead">
            主题、插件，加一个内置 Marketplace。侧栏页面、逐字歌词、备用播放源、右键菜单，
            都可以在不改本体的情况下扩展。
          </p>
          <ul class="q-sparkle-points">
<!--            <li><strong>AMLL 逐字歌词</strong><span>卡拉OK扫色，支持 QRC / TTML，默认预装</span></li>-->
            <li><strong>Marketplace</strong><span>官方索引源，按分类浏览与一键安装</span></li>
            <li><strong>本地插件</strong><span>单文件 ESM，二次确认后加载</span></li>
          </ul>
          <a class="q-btn q-btn-ghost" href="/sparkle">插件开发文档 →</a>
        </div>
        <div class="q-sparkle-panel q-reveal" style="--d: 120ms" aria-hidden="true">
          <div class="q-sparkle-head">
            <span class="q-sparkle-title">设置 · Sparkle</span>
            <span class="q-sparkle-tabs">
              <em class="on">插件</em><em>主题</em><em>Marketplace</em>
            </span>
          </div>
          <ul class="q-sparkle-list">
            <li v-for="plug in sparklePlugins" :key="plug.name">
              <span class="q-sparkle-dot" :style="{ '--c': plug.color }" />
              <span class="q-sparkle-name">
                <strong>{{ plug.name }}</strong>
                <em>{{ plug.desc }}</em>
              </span>
              <span class="q-sparkle-toggle" :class="{ on: plug.on }"><i /></span>
            </li>
          </ul>
          <p class="q-sparkle-foot">第三方插件在本地运行任意代码，请只安装你信任的作者发布的插件。</p>
        </div>
      </div>
    </section>

    <!-- ============ ASTRA ============ -->
    <section class="q-section q-astra">
      <div class="q-astra-head q-reveal">
        <p class="q-section-eyebrow">ASTRA</p>
        <h2 class="q-section-title">一个更轻的<br />Quaver</h2>
        <p class="q-section-lead">
          基于 Golang + MyGO Native，没有 WebView，和完整版共用 Typhoeus-Go 后端，把在线播放做到极致轻量。
        </p>
      </div>
      <div class="q-astra-diagram q-reveal" style="--d: 120ms">
        <svg viewBox="0 0 900 424" role="img" aria-label="Quaver Astra 架构图">
          <defs>
            <linearGradient id="qa-box" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stop-color="currentColor" stop-opacity="0.18" />
              <stop offset="1" stop-color="currentColor" stop-opacity="0.05" />
            </linearGradient>
            <marker id="qa-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
              <path d="M0 0 L10 5 L0 10 z" fill="currentColor" fill-opacity="0.7" />
            </marker>
          </defs>

          <!-- Layer 0 · UI -->
          <g class="q-layer">
            <text x="0" y="34" class="q-layer-tag">UI 层</text>
            <g class="q-node q-node-top">
              <rect x="230" y="14" width="260" height="60" rx="14" />
              <text x="360" y="40" text-anchor="middle">Quaver Astra</text>
              <text x="360" y="58" text-anchor="middle" class="q-node-sub">MyGO 原生界面</text>
            </g>
          </g>

          <!-- Layer 1 · 状态 -->
          <g class="q-layer">
            <text x="0" y="138" class="q-layer-tag">状态层</text>
            <g class="q-node">
              <rect x="230" y="112" width="260" height="48" rx="12" />
              <text x="360" y="141" text-anchor="middle">Player · 播放状态</text>
            </g>
            <g class="q-node">
              <rect x="520" y="112" width="230" height="48" rx="12" />
              <text x="635" y="141" text-anchor="middle">Config · Vault</text>
            </g>
          </g>

          <!-- Layer 2 · 后端 -->
          <g class="q-layer">
            <text x="0" y="228" class="q-layer-tag">后端层</text>
            <g class="q-node q-node-accent">
              <rect x="230" y="198" width="260" height="64" rx="14" />
              <text x="360" y="226" text-anchor="middle">Typhoeus-Go</text>
              <text x="360" y="244" text-anchor="middle" class="q-node-sub">内嵌 HTTP API · 播放后端</text>
            </g>
            <g class="q-node">
              <rect x="520" y="198" width="230" height="64" rx="14" />
              <text x="635" y="226" text-anchor="middle">mpv / Liino</text>
              <text x="635" y="244" text-anchor="middle" class="q-node-sub">音频播放引擎</text>
            </g>
          </g>

          <!-- Layer 3 · 外部 -->
          <g class="q-layer">
            <text x="0" y="326" class="q-layer-tag">外部</text>
            <g class="q-node">
              <rect x="230" y="296" width="260" height="56" rx="14" />
              <text x="360" y="320" text-anchor="middle">QQ Music API</text>
              <text x="360" y="338" text-anchor="middle" class="q-node-sub">/ CDN</text>
            </g>
          </g>

          <!-- 连接线：自上而下 -->
          <g class="q-flow">
            <path d="M360 74 V 106" marker-end="url(#qa-arrow)" />
            <path d="M360 160 V 192" marker-end="url(#qa-arrow)" />
            <path d="M360 262 V 290" marker-end="url(#qa-arrow)" />
            <path d="M500 230 H 514" marker-end="url(#qa-arrow)" />
          </g>
          <g class="q-edge-label">
            <text x="372" y="96" text-anchor="start">状态回调</text>
            <text x="372" y="182" text-anchor="start">HTTP API</text>
            <text x="372" y="282" text-anchor="start">请求 / 拉流</text>
            <text x="507" y="220" text-anchor="middle" class="q-edge-label-ipc">JSON IPC</text>
          </g>
        </svg>
      </div>
    </section>

    <!-- ============ CTA ============ -->
    <section class="q-section q-cta">
      <div class="q-cta-card q-reveal">
        <span class="q-cta-aurora" aria-hidden="true" />
        <h2>准备好换一个<br />听歌方式了吗？</h2>
        <p>下载客户端，或者先读一遍文档。两个形态，任你挑。</p>
        <div class="q-cta-actions">
          <a class="q-btn q-btn-primary" href="/download/"><span>前往下载</span></a>
          <a class="q-btn q-btn-ghost" href="/guide/">阅读文档</a>
        </div>
        <p class="q-cta-note">
          基于 AGPLv3 Only 协议开源 · 不提供任何盗版音乐曲目服务
        </p>
      </div>
    </section>
  </div>
</template>

<script lang="ts">
export default {
  data() {
    return {
      showcaseShots: [
        { src: '/imgs/1-1home-darklight.webp', cap: '双栏首页 · 深浅同框', note: 'Quaver Music', w: 1640, h: 1102 },
        { src: '/imgs/nowplaying.webp', cap: '正在播放 · 封面提色', note: 'Quaver Music', w: 1640, h: 1102 },
        { src: '/imgs/astra-np.webp', cap: '原生歌词 · 系统级 GPU 加速', note: 'Quaver Astra', w: 1716, h: 1366 }
      ],
      platforms: [
        'Linux x86-64',
        'Linux ARM64',
        '龙芯 LoongArch',
        'Windows x86-64',
        'Windows ARM64',
        'macOS Apple Silicon'
      ],
      bentoCards: [
        {
          icon: '🐧',
          title: '三架构 · 三系统',
          desc: 'Linux 下开发，覆盖 x86 与 ARM，实验性支持龙芯；同时为 Windows / Windows on ARM 与 Mac Apple Silicon 构建。',
          kind: 'platforms',
          wide: true
        },
        {
          icon: '🌳',
          title: '百变，由你设计',
          desc: '基于花火插件系统，可打造属于你的 Quaver Music。',
          kind: 'sparkle',
          wide: false
        },
        {
          icon: '⚡',
          title: '流畅于心',
          desc: 'V8 JavaScript 引擎 + Golang 播放后端 + Chromium 硬件加速，Astra 则基于系统原生 GPU 框架。',
          kind: 'eq',
          wide: false
        },
        {
          icon: '🎨',
          title: '美于现代',
          desc: '毛玻璃 + 封面提色 + 系统强调色，深浅模式与系统外观跟随。',
          kind: 'tint',
          wide: false
        },
        {
          icon: '🆓',
          title: '自由开源',
          desc: 'AGPLv3 Only，符合 FSF 自由软件四项基本原则，欢迎参与贡献。',
          kind: 'license',
          wide: false
        },
        {
          icon: '💬',
          title: '社区为本',
          desc: '飞书问卷调研真实使用场景，支持 LLM 贡献代码（推荐人先审核一遍），尽力持续维护。',
          kind: 'community',
          wide: true
        }
      ] as Array<{
        icon: string
        title: string
        desc: string
        kind: 'platforms' | 'eq' | 'sparkle' | 'tint' | 'license' | 'community'
        wide: boolean
      }>,
      sparklePlugins: [
        { name: 'Flowscope 流境', desc: '将历史最经典的正在播放页，带入 Quaver Music', color: '#ff9ec7', on: true },
        { name: 'Die For You 歌词', desc: '示例插件 · 设置页随机歌词', color: '#b79cff', on: false },
        { name: 'Lumen 流光', desc: '将 Material Design 3 设计带入 Quaver', color: '#7ee0d0', on: false }
      ]
    }
  }
}
</script>

<style scoped>
/* ===== base ===== */
.q-landing {
  --q-grad: linear-gradient(120deg, #b79cff 0%, #8b6bff 35%, #ff9ec7 100%);
  --q-glass: color-mix(in srgb, var(--vp-c-bg) 55%, transparent);
  --q-glass-strong: color-mix(in srgb, var(--vp-c-bg) 78%, transparent);
  --q-border: color-mix(in srgb, var(--vp-c-border) 55%, transparent);
  --q-shadow: 0 24px 60px -24px color-mix(in srgb, var(--main-color) 35%, transparent);
  --q-ease: cubic-bezier(0.16, 1, 0.3, 1);
  color: var(--vp-c-text-1);
  overflow-x: clip;
}

.q-section {
  position: relative;
  max-width: 1200px;
  margin: 0 auto;
  padding: 96px 24px 0;
}

.q-section-head {
  max-width: 720px;
  margin-bottom: 48px;
}

.q-section-eyebrow {
  margin: 0 0 12px;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: var(--main-color);
  text-transform: uppercase;
}

.q-section-title {
  margin: 0 0 16px;
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  line-height: 1.15;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
  text-wrap: balance;
}

.q-section-lead {
  margin: 0;
  font-size: 1.05rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

/* ===== buttons ===== */
.q-btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 22px;
  border-radius: 999px;
  font-size: 0.95rem;
  font-weight: 600;
  text-decoration: none;
  border: 1px solid transparent;
  transition: transform 0.35s var(--q-ease), box-shadow 0.35s var(--q-ease),
    background-color 0.25s ease, border-color 0.25s ease, color 0.25s ease;
  will-change: transform;
}

.q-btn-primary {
  color: #fff;
  background: var(--main-color);
  box-shadow: 0 12px 32px -12px color-mix(in srgb, var(--main-color) 70%, transparent);
  overflow: hidden;
}

.q-btn-primary::before {
  content: '';
  position: absolute;
  inset: 0;
  background: var(--q-grad);
  opacity: 0;
  transition: opacity 0.35s ease;
}

.q-btn-primary > * {
  position: relative;
}

.q-btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 18px 40px -14px color-mix(in srgb, var(--main-color) 80%, transparent);
}

.q-btn-primary:hover::before {
  opacity: 1;
}

.q-btn-ghost {
  color: var(--vp-c-text-1);
  background: var(--q-glass);
  -webkit-backdrop-filter: blur(18px) saturate(180%);
  backdrop-filter: blur(18px) saturate(180%);
  border-color: var(--q-border);
}

.q-btn-ghost:hover {
  transform: translateY(-2px);
  border-color: var(--main-color);
  color: var(--main-color);
}

.q-btn-soft {
  align-self: flex-start;
  color: var(--main-color);
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  border-color: color-mix(in srgb, var(--main-color) 30%, transparent);
}

.q-btn-soft:hover {
  background: color-mix(in srgb, var(--main-color) 20%, transparent);
  transform: translateY(-2px);
}

.q-btn-arrow {
  display: inline-block;
  transition: transform 0.3s var(--q-ease);
}

.q-btn-primary:hover .q-btn-arrow {
  transform: translateX(4px);
}

/* ===== reveal ===== */
.q-reveal {
  opacity: 0;
  transform: translateY(28px);
  transition: opacity 0.8s var(--q-ease), transform 0.9s var(--q-ease);
  transition-delay: var(--d, 0ms);
}

.q-reveal.is-visible {
  opacity: 1;
  transform: none;
}

@media (prefers-reduced-motion: reduce) {
  .q-reveal {
    opacity: 1;
    transform: none;
    transition: none;
  }
  .q-mock-eq i,
  .q-mock-cover-glow,
  .q-eq i,
  .q-marquee-track,
  .q-shot,
  .q-hero-halo,
  .q-aurora,
  .q-flow path,
  .q-mock-cover-glow,
  .q-btn,
  .q-btn-arrow {
    animation: none !important;
  }
  .q-cover-enter-active,
  .q-cover-leave-active,
  .q-mock-progress-fill {
    transition: none;
  }
}

/* ===== hero ===== */
.q-hero {
  position: relative;
  padding: clamp(96px, 14vh, 150px) 24px 64px;
  overflow: visible;
}

.q-hero-bg {
  position: fixed;
  inset: 0;
  pointer-events: none;
  z-index: 0;
}

.q-aurora {
  position: absolute;
  border-radius: 50%;
  filter: blur(80px);
  opacity: 0.55;
  will-change: transform;
  animation: q-drift 22s ease-in-out infinite alternate;
}

.q-aurora-a {
  width: 540px;
  height: 540px;
  top: -140px;
  left: -120px;
  background: radial-gradient(circle, color-mix(in srgb, var(--main-color) 70%, transparent), transparent 65%);
}

.q-aurora-b {
  width: 460px;
  height: 460px;
  top: 120px;
  right: -140px;
  background: radial-gradient(circle, color-mix(in srgb, #ff9ec7 60%, transparent), transparent 65%);
  animation-delay: -8s;
}

.q-aurora-c {
  width: 520px;
  height: 380px;
  bottom: -180px;
  left: 35%;
  background: radial-gradient(circle, color-mix(in srgb, #7ee0d0 45%, transparent), transparent 65%);
  animation-delay: -14s;
}

.dark .q-aurora {
  opacity: 0.4;
}

.q-hero-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--vp-c-border) 40%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--vp-c-border) 40%, transparent) 1px, transparent 1px);
  background-size: 56px 56px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 80%);
  -webkit-mask-image: radial-gradient(ellipse 70% 60% at 50% 0%, #000 30%, transparent 80%);
  opacity: 0.5;
}

.q-hero-inner {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1.05fr);
  gap: 56px;
  align-items: center;
}

.q-eyebrow {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin: 0 0 20px;
  padding: 6px 14px 6px 10px;
  border-radius: 999px;
  background: var(--q-glass);
  -webkit-backdrop-filter: blur(14px) saturate(180%);
  backdrop-filter: blur(14px) saturate(180%);
  border: 1px solid var(--q-border);
  font-size: 13px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.q-eyebrow-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--main-color);
  box-shadow: 0 0 0 0 color-mix(in srgb, var(--main-color) 60%, transparent);
  animation: q-pulse 2.4s ease-out infinite;
}

.q-hero-title {
  margin: 0 0 20px;
  font-size: clamp(2.4rem, 6vw, 4.4rem);
  line-height: 1.05;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.q-grad {
  background: var(--q-grad);
  -webkit-background-clip: text;
  background-clip: text;
  color: transparent;
  background-size: 200% 200%;
  animation: q-grad-shift 8s ease-in-out infinite;
}

.q-hero-lead {
  margin: 0 0 24px;
  max-width: 520px;
  font-size: 1.1rem;
  line-height: 1.7;
  color: var(--vp-c-text-2);
}

.q-hero-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 0 0 28px;
  padding: 0;
  list-style: none;
}

.q-hero-chips li {
  padding: 6px 12px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--main-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--main-color) 22%, transparent);
}

.q-hero-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.q-hero-visual {
  position: relative;
  perspective: 1200px;
}

.q-hero-halo {
  position: absolute;
  inset: -20% -10%;
  background: conic-gradient(from 180deg at 50% 50%,
    color-mix(in srgb, var(--main-color) 40%, transparent),
    color-mix(in srgb, #ff9ec7 35%, transparent),
    color-mix(in srgb, #7ee0d0 30%, transparent),
    color-mix(in srgb, var(--main-color) 40%, transparent));
  filter: blur(60px);
  opacity: 0.55;
  animation: q-spin 24s linear infinite;
  z-index: 0;
}

.q-mock {
  position: relative;
  z-index: 1;
  border-radius: 20px;
  background: var(--q-glass-strong);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid var(--q-border);
  box-shadow: var(--q-shadow);
  overflow: hidden;
  transform: rotateX(var(--rx, 0deg)) rotateY(var(--ry, 0deg));
  transform-style: preserve-3d;
  transition: transform 0.25s var(--q-ease);
  animation: q-float 9s ease-in-out infinite;
}

.q-mock::after {
  content: '';
  position: absolute;
  inset: 0;
  background: radial-gradient(400px circle at var(--mx, 50%) var(--my, 50%),
    color-mix(in srgb, var(--main-color) 18%, transparent), transparent 60%);
  opacity: 0;
  transition: opacity 0.35s ease;
  pointer-events: none;
}

.q-mock:hover::after {
  opacity: 1;
}

.q-mock-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-bottom: 1px solid var(--q-border);
  background: color-mix(in srgb, var(--vp-c-bg) 40%, transparent);
}

.q-mock-dots {
  display: inline-flex;
  gap: 6px;
}

.q-mock-dots i {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--vp-c-border) 90%, transparent);
}

.q-mock-dots i:first-child { background: #ff5f56; }
.q-mock-dots i:nth-child(2) { background: #ffbd2e; }
.q-mock-dots i:last-child { background: #27c93f; }

.q-mock-title {
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
}

.q-mock-pill {
  margin-left: auto;
  padding: 3px 10px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  color: var(--main-color);
  background: color-mix(in srgb, var(--main-color) 15%, transparent);
}

.q-mock-body {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 20px;
  padding: 20px;
  align-items: center;
}

.q-mock-cover {
  position: relative;
  width: 132px;
  height: 132px;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 18px 40px -18px color-mix(in srgb, var(--main-color) 70%, transparent);
}

.q-mock-cover img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

.q-cover-enter-active,
.q-cover-leave-active {
  transition: opacity 0.32s ease, transform 0.45s var(--q-ease);
}

.q-cover-enter-from {
  opacity: 0;
  transform: scale(1.06);
}

.q-cover-leave-to {
  opacity: 0;
  transform: scale(0.96);
}

.q-mock-cover-glow {
  position: absolute;
  inset: -30%;
  background: conic-gradient(from 0deg, transparent 0 70%, color-mix(in srgb, #fff 60%, transparent) 85%, transparent 100%);
  animation: q-spin 6s linear infinite;
  opacity: 0.35;
  pointer-events: none;
}

.q-mock-meta {
  min-width: 0;
}

.q-mock-eyebrow {
  margin: 0 0 4px;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: var(--main-color);
}

.q-mock-song {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.q-mock-artist {
  margin: 2px 0 14px;
  font-size: 13px;
  color: var(--vp-c-text-2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.q-mock-progress {
  position: relative;
  height: 4px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-border) 60%, transparent);
  overflow: hidden;
}

.q-mock-progress-fill {
  position: absolute;
  inset: 0 auto 0 0;
  width: 42%;
  border-radius: inherit;
  background: var(--q-grad);
  transition: width 0.25s linear;
}

.q-mock-ctrl {
  display: flex;
  align-items: center;
  gap: 14px;
  margin-top: 12px;
  font-size: 14px;
  color: var(--vp-c-text-2);
}

.q-mock-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: transparent;
  color: var(--vp-c-text-2);
  cursor: pointer;
  transition: color 0.25s ease, background-color 0.25s ease, transform 0.25s var(--q-ease);
}

.q-mock-btn svg {
  width: 15px;
  height: 15px;
  fill: currentColor;
}

.q-mock-btn:hover {
  color: var(--main-color);
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
}

.q-mock-btn:active {
  transform: scale(0.92);
}

.q-mock-play {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: 0;
  border-radius: 50%;
  background: var(--main-color);
  color: #fff;
  cursor: pointer;
  box-shadow: 0 8px 20px -8px color-mix(in srgb, var(--main-color) 80%, transparent);
  transition: transform 0.25s var(--q-ease), box-shadow 0.25s ease;
}

.q-mock-play svg {
  width: 17px;
  height: 17px;
  fill: currentColor;
}

.q-mock-play:hover {
  transform: scale(1.07);
  box-shadow: 0 10px 24px -8px color-mix(in srgb, var(--main-color) 90%, transparent);
}

.q-mock-btn:focus-visible,
.q-mock-play:focus-visible {
  outline: 2px solid var(--main-color);
  outline-offset: 2px;
}

.q-mock-time {
  margin-left: auto;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--vp-c-text-3);
}

.q-mock-eq {
  grid-column: 1 / -1;
  display: flex;
  align-items: flex-end;
  gap: 3px;
  height: 48px;
  padding-top: 8px;
  border-top: 1px solid var(--q-border);
  margin-top: 4px;
}

.q-mock-eq i,
.q-eq i {
  flex: 1;
  height: 100%;
  border-radius: 2px 2px 0 0;
  background: linear-gradient(to top, color-mix(in srgb, var(--main-color) 80%, transparent), color-mix(in srgb, #ff9ec7 70%, transparent));
  transform-origin: bottom;
  animation: q-bar 1.6s ease-in-out infinite;
  animation-delay: calc(var(--i) * -0.12s);
  opacity: 0.75;
}

.q-mock.is-paused .q-mock-eq i,
.q-mock.is-paused .q-mock-cover-glow {
  animation-play-state: paused;
}

@keyframes q-bar {
  0%, 100% { transform: scaleY(0.18); }
  50% { transform: scaleY(0.95); }
}

/* ===== showcase ===== */
.q-shots {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.q-shot {
  margin: 0;
  animation: q-float 8s ease-in-out infinite;
  animation-delay: var(--float-delay, 0s);
}

.q-shot-frame {
  position: relative;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid var(--q-border);
  box-shadow: var(--q-shadow);
  background: var(--q-glass);
  -webkit-backdrop-filter: blur(20px) saturate(180%);
  backdrop-filter: blur(20px) saturate(180%);
  transform: translateZ(0);
  transition: transform 0.5s var(--q-ease), box-shadow 0.5s var(--q-ease);
}

.q-shot:hover .q-shot-frame {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 30px 70px -22px color-mix(in srgb, var(--main-color) 50%, transparent);
}

.q-shot-frame img {
  display: block;
  width: 100%;
  height: auto;
}

.q-shot-sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(115deg, transparent 30%, color-mix(in srgb, #fff 25%, transparent) 50%, transparent 70%);
  transform: translateX(-100%);
  transition: transform 0.9s var(--q-ease);
  pointer-events: none;
}

.q-shot:hover .q-shot-sheen {
  transform: translateX(100%);
}

.q-shot figcaption {
  display: flex;
  flex-direction: column;
  gap: 2px;
  margin-top: 14px;
}

.q-shot figcaption strong {
  font-size: 15px;
  color: var(--vp-c-text-1);
}

.q-shot figcaption span {
  font-size: 12.5px;
  color: var(--vp-c-text-3);
}

/* ===== products ===== */
.q-product-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px;
}

.q-product {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 28px;
  border-radius: 22px;
  background: var(--q-glass);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid var(--q-border);
  box-shadow: var(--q-shadow);
  transition: transform 0.5s var(--q-ease), border-color 0.3s ease, box-shadow 0.5s var(--q-ease);
}

.q-product:hover {
  transform: translateY(-6px);
  border-color: color-mix(in srgb, var(--main-color) 50%, transparent);
}

.q-product-alt {
  background:
    linear-gradient(160deg, color-mix(in srgb, var(--main-color) 12%, transparent), transparent 60%),
    var(--q-glass);
}

.q-product header {
  display: flex;
  align-items: center;
  gap: 14px;
}

.q-product-icon {
  display: grid;
  place-items: center;
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--main-color) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--main-color) 25%, transparent);
  flex-shrink: 0;
}

.q-product-icon img {
  width: 28px;
  height: 28px;
  object-fit: contain;
}

.q-product h3 {
  margin: 0;
  font-size: 1.35rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.q-product-tag {
  margin: 2px 0 0;
  font-size: 13px;
  color: var(--vp-c-text-3);
}

.q-product-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  padding: 0;
  list-style: none;
  flex: 1;
}

.q-product-list li {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding-left: 16px;
  position: relative;
}

.q-product-list li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 8px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--main-color);
}

.q-product-list strong {
  font-size: 15px;
  font-weight: 650;
  color: var(--vp-c-text-1);
}

.q-product-list span {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.q-product-platforms {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
}

.q-product-platforms span {
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 11.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--vp-c-bg-soft) 70%, transparent);
  border: 1px solid var(--q-border);
}

/* ===== bento ===== */
.q-bento-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  grid-auto-rows: minmax(220px, auto);
  gap: 18px;
}

.q-card {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 26px;
  border-radius: 20px;
  background: var(--q-glass);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid var(--q-border);
  box-shadow: 0 12px 32px -16px color-mix(in srgb, var(--main-color) 30%, transparent);
  overflow: hidden;
  transition: transform 0.5s var(--q-ease), border-color 0.3s ease;
  isolation: isolate;
}

.q-card:hover {
  transform: translateY(-4px);
  border-color: color-mix(in srgb, var(--main-color) 55%, transparent);
}

.q-card-wide {
  grid-column: span 2;
}

.q-card-spot {
  position: absolute;
  inset: 0;
  background: radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%),
    color-mix(in srgb, var(--main-color) 24%, transparent), transparent 62%);
  opacity: 0;
  transition: opacity 0.45s ease;
  z-index: -1;
  pointer-events: none;
}

.q-card-spot.on {
  opacity: 1;
}

.q-card-icon {
  font-size: 28px;
  line-height: 1;
}

.q-card h3 {
  margin: 0;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.q-card-desc {
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.q-card-visual {
  margin-top: auto;
}

.q-marquee {
  position: relative;
  overflow: hidden;
  mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
  -webkit-mask-image: linear-gradient(to right, transparent, #000 12%, #000 88%, transparent);
  padding: 4px 0;
}

.q-marquee-track {
  display: flex;
  gap: 10px;
  width: max-content;
  animation: q-marquee 26s linear infinite;
}

.q-marquee-track span {
  flex-shrink: 0;
  padding: 6px 14px;
  border-radius: 999px;
  font-size: 12.5px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--vp-c-bg-soft) 65%, transparent);
  border: 1px solid var(--q-border);
  white-space: nowrap;
}

.q-eq {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  height: 56px;
}

.q-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.q-chips span {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--main-color) 10%, transparent);
  border: 1px solid color-mix(in srgb, var(--main-color) 22%, transparent);
}

.q-swatches {
  display: flex;
  gap: 8px;
}

.q-swatches span {
  flex: 1;
  height: 28px;
  border-radius: 8px;
  background: var(--c);
  box-shadow: 0 4px 12px -4px color-mix(in srgb, var(--c) 70%, transparent);
  transition: transform 0.35s var(--q-ease);
}

.q-card:hover .q-swatches span {
  transform: translateY(-4px);
}

.q-license {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.q-license span {
  font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
  font-size: 12px;
  padding: 5px 10px;
  border-radius: 8px;
  background: color-mix(in srgb, var(--main-color) 10%, transparent);
  color: var(--main-color);
  border: 1px solid color-mix(in srgb, var(--main-color) 25%, transparent);
}

.q-community {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.q-community span {
  padding: 5px 12px;
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--vp-c-text-2);
  background: color-mix(in srgb, var(--vp-c-bg-soft) 70%, transparent);
  border: 1px solid var(--q-border);
}

/* ===== sparkle ===== */
.q-sparkle-grid {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 48px;
  align-items: center;
}

.q-sparkle-copy .q-btn {
  margin-top: 24px;
}

.q-sparkle-points {
  display: flex;
  flex-direction: column;
  gap: 14px;
  margin: 20px 0 0;
  padding: 0;
  list-style: none;
}

.q-sparkle-points li {
  padding-left: 16px;
  position: relative;
}

.q-sparkle-points li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 9px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--main-color);
}

.q-sparkle-points strong {
  display: block;
  font-size: 15px;
  color: var(--vp-c-text-1);
}

.q-sparkle-points span {
  font-size: 13.5px;
  line-height: 1.55;
  color: var(--vp-c-text-2);
}

.q-sparkle-panel {
  padding: 22px;
  border-radius: 22px;
  background: var(--q-glass-strong);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid var(--q-border);
  box-shadow: var(--q-shadow);
}

.q-sparkle-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid var(--q-border);
}

.q-sparkle-title {
  font-size: 14px;
  font-weight: 700;
  color: var(--vp-c-text-1);
}

.q-sparkle-tabs {
  display: inline-flex;
  gap: 4px;
  padding: 3px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-bg) 50%, transparent);
  border: 1px solid var(--q-border);
}

.q-sparkle-tabs em {
  font-style: normal;
  font-size: 11.5px;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 999px;
  color: var(--vp-c-text-3);
}

.q-sparkle-tabs em.on {
  background: var(--main-color);
  color: #fff;
}

.q-sparkle-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin: 16px 0 0;
  padding: 0;
  list-style: none;
}

.q-sparkle-list li {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 14px;
  background: color-mix(in srgb, var(--vp-c-bg) 40%, transparent);
  border: 1px solid var(--q-border);
  transition: border-color 0.25s ease, transform 0.3s var(--q-ease);
}

.q-sparkle-list li:hover {
  border-color: color-mix(in srgb, var(--main-color) 45%, transparent);
  transform: translateX(3px);
}

.q-sparkle-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: var(--c);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--c) 25%, transparent);
  flex-shrink: 0;
}

.q-sparkle-name {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
  flex: 1;
}

.q-sparkle-name strong {
  font-size: 14px;
  color: var(--vp-c-text-1);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.q-sparkle-name em {
  font-style: normal;
  font-size: 12px;
  color: var(--vp-c-text-3);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.q-sparkle-toggle {
  position: relative;
  width: 38px;
  height: 22px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-border) 70%, transparent);
  flex-shrink: 0;
  transition: background-color 0.25s ease;
}

.q-sparkle-toggle i {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform 0.25s var(--q-ease);
}

.q-sparkle-toggle.on {
  background: var(--main-color);
}

.q-sparkle-toggle.on i {
  transform: translateX(16px);
}

.q-sparkle-foot {
  margin: 16px 0 0;
  font-size: 11.5px;
  line-height: 1.55;
  color: var(--vp-c-text-3);
}

/* ===== astra ===== */
.q-astra-head {
  max-width: 720px;
}

.q-astra-diagram {
  margin-top: 40px;
  padding: 32px;
  border-radius: 22px;
  background: var(--q-glass);
  -webkit-backdrop-filter: blur(24px) saturate(200%);
  backdrop-filter: blur(24px) saturate(200%);
  border: 1px solid var(--q-border);
  box-shadow: var(--q-shadow);
}

.q-astra-diagram svg {
  display: block;
  width: 100%;
  height: auto;
  color: var(--main-color);
}

.q-node rect {
  fill: url(#qa-box);
  stroke: currentColor;
  stroke-opacity: 0.4;
  stroke-width: 1.2;
}

.q-node text {
  fill: var(--vp-c-text-1);
  font-size: 15px;
  font-weight: 650;
}

.q-node text.q-node-sub {
  fill: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 500;
}

.q-node-top rect {
  stroke-opacity: 0.7;
  stroke-width: 1.6;
}

.q-node-accent rect {
  stroke: var(--main-color);
  stroke-opacity: 0.85;
  stroke-width: 1.8;
}

.q-layer-tag {
  fill: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.q-flow path {
  fill: none;
  stroke: currentColor;
  stroke-opacity: 0.6;
  stroke-width: 1.6;
}

.q-edge-label text {
  fill: var(--vp-c-text-3);
  font-size: 11px;
  font-weight: 500;
  letter-spacing: 0.05em;
}

.q-edge-label text.q-edge-label-ipc {
  fill: var(--main-color);
  font-weight: 650;
}

/* ===== cta ===== */
.q-cta {
  padding-bottom: 32px;
}

.q-cta-card {
  position: relative;
  overflow: hidden;
  padding: 64px 32px;
  border-radius: 28px;
  text-align: center;
  background: var(--q-glass-strong);
  -webkit-backdrop-filter: blur(28px) saturate(200%);
  backdrop-filter: blur(28px) saturate(200%);
  border: 1px solid var(--q-border);
  /* 玻璃卡片在深色背景上不投外阴影，改用内嵌顶部高光，避免边缘出现一圈暗晕 */
  box-shadow: inset 0 1px 0 0 color-mix(in srgb, #fff 14%, transparent);
}

.q-cta-aurora {
  position: absolute;
  inset: -40% -20%;
  background:
    radial-gradient(40% 60% at 20% 30%, color-mix(in srgb, var(--main-color) 45%, transparent), transparent 60%),
    radial-gradient(40% 60% at 80% 70%, color-mix(in srgb, #ff9ec7 40%, transparent), transparent 60%),
    radial-gradient(50% 50% at 50% 100%, color-mix(in srgb, #7ee0d0 35%, transparent), transparent 60%);
  filter: blur(40px);
  opacity: 0.6;
  animation: q-drift 20s ease-in-out infinite alternate;
  z-index: 0;
  pointer-events: none;
}

.q-cta-card > *:not(.q-cta-aurora) {
  position: relative;
  z-index: 1;
}

.q-cta-card h2 {
  margin: 0 0 14px;
  font-size: clamp(1.8rem, 3.4vw, 2.6rem);
  line-height: 1.15;
  font-weight: 750;
  letter-spacing: -0.02em;
  color: var(--vp-c-text-1);
}

.q-cta-card > p {
  margin: 0 auto 28px;
  max-width: 520px;
  font-size: 1.05rem;
  line-height: 1.65;
  color: var(--vp-c-text-2);
}

.q-cta-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
}

.q-cta-note {
  margin: 24px auto 0 !important;
  font-size: 12.5px !important;
  color: var(--vp-c-text-3) !important;
  max-width: none !important;
}

/* ===== keyframes ===== */
@keyframes q-drift {
  0% { transform: translate3d(0, 0, 0) scale(1); }
  50% { transform: translate3d(4%, -6%, 0) scale(1.08); }
  100% { transform: translate3d(-3%, 4%, 0) scale(0.96); }
}

@keyframes q-spin {
  to { transform: rotate(360deg); }
}

@keyframes q-float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

@keyframes q-pulse {
  0% { box-shadow: 0 0 0 0 color-mix(in srgb, var(--main-color) 60%, transparent); }
  70% { box-shadow: 0 0 0 12px transparent; }
  100% { box-shadow: 0 0 0 0 transparent; }
}

@keyframes q-grad-shift {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes q-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}

@keyframes q-dash {
  to { stroke-dashoffset: -22; }
}

/* ===== responsive ===== */
@media (max-width: 1100px) {
  .q-hero-inner {
    grid-template-columns: minmax(0, 1fr);
    gap: 48px;
  }
  .q-hero-visual {
    max-width: 620px;
    margin: 0 auto;
    width: 100%;
  }
  .q-shots {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .q-shot:last-child {
    grid-column: span 2;
  }
  .q-bento-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 768px) {
  .q-section {
    padding: 72px 20px 0;
  }
  .q-hero {
    padding-top: 110px;
  }
  .q-shots {
    grid-template-columns: minmax(0, 1fr);
  }
  .q-shot:last-child {
    grid-column: auto;
    max-width: none;
  }
  .q-shot {
    animation: none;
  }
  .q-bento-grid {
    grid-template-columns: minmax(0, 1fr);
  }
  .q-card-wide {
    grid-column: auto;
  }
  .q-product-grid,
  .q-sparkle-grid {
    grid-template-columns: minmax(0, 1fr);
    gap: 22px;
  }
  .q-astra-diagram {
    padding: 18px;
  }
  .q-mock-body {
    grid-template-columns: minmax(0, 1fr);
    text-align: center;
    justify-items: center;
  }
  .q-mock-artist {
    white-space: normal;
  }
  .q-mock-ctrl {
    justify-content: center;
  }
  .q-mock-time {
    margin-left: 0;
  }
  .q-mock-eq {
    display: none;
  }
}
</style>
