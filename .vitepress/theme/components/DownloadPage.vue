<template>
  <div class="dl-page">
    <section class="dl-hero">
      <div class="hero-orb hero-orb-a" aria-hidden="true" />
      <div class="hero-orb hero-orb-b" aria-hidden="true" />
      <p class="dl-eyebrow">QUAVER MUSIC DOWNLOAD</p>
      <h1 class="dl-title">选择你的 Quaver Music</h1>
      <p class="dl-lead">
        版本信息直接来自 GitHub Releases。选择产品后，页面会按平台与架构整理最新构建。
      </p>

      <div class="product-switch" role="tablist" aria-label="选择产品">
        <button
          v-for="product in products"
          :key="product.id"
          type="button"
          role="tab"
          class="product-tab"
          :class="{ active: product.id === activeProduct }"
          :aria-selected="product.id === activeProduct"
          @click="switchProduct(product.id)"
        >
          <img :src="product.icon" alt="" class="product-icon" />
          <span class="product-copy">
            <strong>{{ product.name }}</strong>
            <small>{{ product.tagline }}</small>
          </span>
        </button>
      </div>
    </section>

    <section v-if="isMobile" class="mobile-unsupported" role="status" aria-live="polite">
      <span class="mobile-icon" aria-hidden="true">📱</span>
      <div class="mobile-copy">
        <span class="mobile-badge">检测到移动设备</span>
        <h2>该应用不支持移动平台</h2>
        <p>
          {{ activeProductMeta.name }} 仅提供 Linux、Windows 与 macOS 桌面版，请在电脑上访问本页下载。
        </p>
      </div>
    </section>

    <div v-else-if="loading && !release" class="dl-loading" aria-live="polite">
      <div class="skeleton skeleton-strip" />
      <div class="skeleton skeleton-card" v-for="i in 3" :key="i" />
      <p class="loading-text">正在获取 {{ activeProductMeta.name }} 的最新版本…</p>
    </div>

    <div v-else-if="error && !release" class="dl-error" role="alert">
      <span class="error-mark" aria-hidden="true">!</span>
      <h2>版本信息获取失败</h2>
      <p>{{ error }}</p>
      <div class="error-actions">
        <button type="button" class="primary-btn compact" @click="load(true)">重试</button>
        <button type="button" class="ghost-btn" @click="retryWithProxy">使用镜像重试</button>
        <a class="ghost-btn" :href="activeProductMeta.releasesUrl" target="_blank" rel="noopener noreferrer">
          前往 GitHub Releases
        </a>
      </div>
    </div>

    <template v-else-if="release">
      <div class="version-strip">
        <div class="version-main">
          <span class="version-pill">最新版本</span>
          <strong class="version-tag">{{ release.tag_name }}</strong>
          <span class="version-date">{{ formatDate(release.published_at) }}</span>
          <span v-if="stale" class="cache-note" title="GitHub 请求失败，当前展示本地缓存">
            缓存数据
          </span>
          <span v-if="servedByProxy" class="cache-note">镜像 API</span>
          <span v-if="refreshing" class="cache-note">刷新中…</span>
        </div>
        <div class="version-actions">
          <label class="proxy-toggle" title="通过 gh-proxy.com 转发下载请求">
            <input v-model="useProxy" type="checkbox" />
            <span class="toggle-track" aria-hidden="true"><span class="toggle-thumb" /></span>
            <span>中国大陆加速</span>
          </label>
          <a class="ghost-link" :href="release.html_url" target="_blank" rel="noopener noreferrer">
            发布页 ↗
          </a>
        </div>
      </div>

      <details v-if="release.body && release.body.trim()" class="release-notes">
        <summary>
          <span class="summary-title">更新说明</span>
          <span class="summary-hint">{{ release.tag_name }}</span>
        </summary>
        <ReleaseNotes :body="release.body" :repo-url="activeProductMeta.repoUrl" />
      </details>

      <section v-if="recommended" class="recommend">
        <div class="recommend-copy">
          <span class="recommend-badge">检测到 {{ clientLabel }}</span>
          <h2>为你推荐</h2>
          <p>{{ recommended.hint }} · {{ formatSize(recommended.size) }} MB</p>
          <code class="recommend-file">{{ recommended.fileName }}</code>
        </div>
        <a
          class="primary-btn"
          :href="downloadUrl(recommended.browser_download_url)"
          target="_blank"
          rel="noopener noreferrer"
        >
          <span class="dl-icon" aria-hidden="true" />
          下载 {{ recommended.formatLabel }}
        </a>
      </section>

      <p v-else-if="client.os === 'macos' && client.arch === 'x64'" class="compat-note">
        当前设备是 Intel Mac，Quaver 目前只提供 Apple Silicon（M 系列）构建。
      </p>

      <section v-if="activeProduct === 'music' && client.os === 'linux'" class="stores">
        <div class="stores-copy">
          <span class="stores-badge">Linux 用户</span>
          <h2>用应用商店统一更新</h2>
          <p>
            推荐通过如意玲珑或星火应用商店安装，后续升级由商店统一管理。商店内搜索
            <strong>Quaver</strong> 即可。
          </p>
        </div>
        <div class="store-links">
          <a href="https://store.linyaps.org.cn/" target="_blank" rel="noopener noreferrer">
            <span class="store-name">如意玲珑商店</span>
            <span class="store-arrow">↗</span>
          </a>
          <a href="https://www.spark-app.store/" target="_blank" rel="noopener noreferrer">
            <span class="store-name">星火应用商店</span>
            <span class="store-arrow">↗</span>
          </a>
        </div>
      </section>

      <section
        v-for="(group, groupIndex) in platformGroups"
        :key="group.os"
        class="platform"
        :style="{ '--enter-delay': `${groupIndex * 70}ms` }"
      >
        <header class="platform-head">
          <span class="platform-icon" aria-hidden="true">{{ group.icon }}</span>
          <div class="platform-copy">
            <h2>{{ group.label }}</h2>
            <p>{{ group.note }}</p>
          </div>
          <span class="platform-count">{{ group.count }} 个文件</span>
        </header>

        <div v-for="archGroup in group.arches" :key="archGroup.arch" class="arch-block">
          <div class="arch-head">
            <h3>{{ archGroup.label }}</h3>
            <span class="arch-hint">{{ archGroup.hint }}</span>
            <span v-if="archGroup.warning" class="arch-warning">{{ archGroup.warning }}</span>
          </div>
          <div class="asset-grid">
            <article
              v-for="asset in archGroup.assets"
              :key="asset.id"
              class="asset-card"
              :class="{ recommended: recommended && asset.id === recommended.id }"
            >
              <div class="asset-top">
                <span class="format-chip">{{ asset.formatLabel }}</span>
                <span class="asset-size">{{ formatSize(asset.size) }} MB</span>
              </div>
              <p class="asset-hint">{{ asset.hint }}</p>
              <p class="asset-file" :title="asset.fileName">{{ asset.fileName }}</p>
              <a
                class="download-btn"
                :href="downloadUrl(asset.browser_download_url)"
                target="_blank"
                rel="noopener noreferrer"
                :aria-label="`下载 ${asset.fileName}`"
              >
                <span>下载</span>
                <span class="dl-icon small" aria-hidden="true" />
              </a>
            </article>
          </div>
        </div>
      </section>

      <footer class="dl-footnote">
        <p>
          下载即表示你同意
          <a href="/agreement">免责协议</a>。文件来自
          <a :href="activeProductMeta.repoUrl" target="_blank" rel="noopener noreferrer">GitHub Releases</a>，
          请勿从第三方渠道安装被重新打包的版本。
        </p>
        <p v-if="useProxy" class="proxy-note">
          当前下载链接经由 <code>gh-proxy.com</code> 转发，校验和以 GitHub 发布页为准。
        </p>
      </footer>
    </template>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import ReleaseNotes from './ReleaseNotes.vue'

interface ReleaseAsset {
  id: number
  name: string
  size: number
  browser_download_url: string
  digest?: string | null
}

interface Release {
  tag_name: string
  name?: string | null
  body?: string | null
  published_at: string
  html_url: string
  assets: ReleaseAsset[]
}

interface Product {
  id: 'music' | 'astra'
  name: string
  tagline: string
  repo: string
  icon: string
  repoUrl: string
  releasesUrl: string
}

type Os = 'linux' | 'windows' | 'macos' | 'unknown'
type Arch = 'x64' | 'arm64' | 'loong64' | 'unknown'

interface AssetInfo extends ReleaseAsset {
  fileName: string
  os: Os
  arch: Arch
  format: string
  formatLabel: string
  hint: string
  flavor?: 'loong64'
}

interface ArchGroup {
  arch: Arch
  label: string
  hint: string
  warning?: string
  assets: AssetInfo[]
}

interface PlatformGroup {
  os: Os
  label: string
  icon: string
  note: string
  count: number
  arches: ArchGroup[]
}

interface ClientInfo {
  os: Os
  arch: Arch
  isMobile: boolean
}

const products: Product[] = [
  {
    id: 'music',
    name: 'Quaver Music',
    tagline: '完整形态 · Sparkle 插件系统',
    repo: 'Team-Quaver/quaver-music',
    icon: '/imgs/fav.svg',
    repoUrl: 'https://github.com/Team-Quaver/quaver-music',
    releasesUrl: 'https://github.com/Team-Quaver/quaver-music/releases'
  },
  {
    id: 'astra',
    name: 'Quaver Astra',
    tagline: '轻量形态 · MyGO 原生界面',
    repo: 'Team-Quaver/quaver-astra',
    icon: '/imgs/quaver-astra.svg',
    repoUrl: 'https://github.com/Team-Quaver/quaver-astra',
    releasesUrl: 'https://github.com/Team-Quaver/quaver-astra/releases'
  }
]

const PROXY_PREFIX = 'https://gh-proxy.com/'
const CACHE_PREFIX = 'quaver-release:'
const CACHE_TTL = 10 * 60 * 1000
const PROXY_STORAGE_KEY = 'quaver-download-proxy'

const activeProduct = ref<Product['id']>('music')
const activeProductMeta = computed(
  () => products.find(product => product.id === activeProduct.value) || products[0]
)

const release = ref<Release | null>(null)
const loading = ref(true)
const refreshing = ref(false)
const error = ref('')
const stale = ref(false)
const servedByProxy = ref(false)
const useProxy = ref(false)
const client = ref<ClientInfo>({ os: 'unknown', arch: 'unknown', isMobile: false })
const isMobile = computed(() => client.value.isMobile)

let requestSeq = 0

const OS_META: Record<Exclude<Os, 'unknown'>, { label: string; icon: string }> = {
  linux: {
    label: 'Linux',
    icon: '🐧'
  },
  windows: {
    label: 'Windows',
    icon: '🪟'
  },
  macos: {
    label: 'macOS',
    icon: '🍎'
  }
}

const ARCH_LABEL: Record<Exclude<Arch, 'unknown'>, string> = {
  x64: 'x86-64',
  arm64: 'ARM64',
  loong64: '龙芯 LoongArch'
}

/** 同一架构在不同系统上的叫法与提示并不相同，集中在这里维护 */
function archMeta(os: Exclude<Os, 'unknown'>, arch: Exclude<Arch, 'unknown'>) {
  if (os === 'macos') {
    return {
      label: 'Apple Silicon',
      hint: 'M1 / M2 / M3 / M4 系列芯片',
      warning: undefined
    }
  }
  if (os === 'windows') {
    return {
      label: ARCH_LABEL[arch],
      hint:
        arch === 'arm64'
          ? '骁龙 X 系列 / NVIDIA Spark 等 ARM 设备'
          : 'AMD / Intel / 兆芯 / 海光',
      warning: undefined
    }
  }
  return {
    label: ARCH_LABEL[arch],
    hint:
      arch === 'arm64'
        ? '飞腾 / 海思 / 骁龙 / NVIDIA Spark'
        : arch === 'loong64'
          ? '龙芯 3A5000 及以后'
          : 'AMD / Intel / 兆芯 / 海光',
    warning: arch === 'loong64' ? 'Electron 34 · Wayland 兼容有限 · 实验性' : undefined
  }
}

const FORMAT_META: Record<string, { label: string; order: number }> = {
  appimage: { label: 'AppImage', order: 0 },
  deb: { label: 'DEB', order: 1 },
  rpm: { label: 'RPM', order: 2 },
  flatpak: { label: 'Flatpak', order: 3 },
  pacman: { label: 'Pacman', order: 4 },
  exe: { label: 'EXE', order: 5 },
  msi: { label: 'MSI', order: 6 },
  zip: { label: 'ZIP', order: 7 },
  dmg: { label: 'DMG', order: 8 },
  targz: { label: 'tar.gz', order: 9 },
  other: { label: '其他', order: 10 }
}

const PREFERRED_FORMAT: Record<Exclude<Os, 'unknown'>, string[]> = {
  linux: ['appimage', 'deb', 'flatpak', 'rpm', 'pacman', 'targz'],
  windows: ['exe', 'msi', 'zip'],
  macos: ['dmg', 'zip', 'targz']
}

const SKIP_EXTENSIONS = [
  '.blockmap',
  '.sha256',
  '.sha512',
  '.sig',
  '.asc',
  '.yml',
  '.yaml',
  '.json',
  '.txt',
  '.md'
]

const parsedAssets = computed<AssetInfo[]>(() => {
  if (!release.value?.assets) return []
  return release.value.assets
    .filter(asset => asset.size >= 1024 * 1024)
    .filter(asset => !SKIP_EXTENSIONS.some(ext => asset.name.toLowerCase().endsWith(ext)))
    .map(asset => parseAsset(asset))
    .filter((asset): asset is AssetInfo => asset !== null)
})

const platformGroups = computed<PlatformGroup[]>(() => {
  const buckets = new Map<Os, Map<Arch, AssetInfo[]>>()

  for (const asset of parsedAssets.value) {
    if (asset.os === 'unknown' || asset.arch === 'unknown') continue
    if (!buckets.has(asset.os)) buckets.set(asset.os, new Map())
    const archMap = buckets.get(asset.os)!
    if (!archMap.has(asset.arch)) archMap.set(asset.arch, [])
    archMap.get(asset.arch)!.push(asset)
  }

  const osOrder: Os[] = ['linux', 'windows', 'macos']
  const detectedIndex = osOrder.indexOf(client.value.os)
  if (detectedIndex > 0) {
    osOrder.splice(detectedIndex, 1)
    osOrder.unshift(client.value.os)
  }

  const archOrder: Arch[] = ['x64', 'arm64', 'loong64']

  return osOrder
    .map(os => {
      const archMap = buckets.get(os)
      if (!archMap || os === 'unknown') return null

      const arches = archOrder
        .filter(arch => (archMap.get(arch)?.length || 0) > 0)
        .map<ArchGroup>(arch => {
          const meta = archMeta(os as Exclude<Os, 'unknown'>, arch as Exclude<Arch, 'unknown'>)
          return {
            arch,
            label: meta.label,
            hint: meta.hint,
            warning: meta.warning,
            assets: sortAssets(archMap.get(arch) || [])
          }
        })

      const count = arches.reduce((sum, archGroup) => sum + archGroup.assets.length, 0)
      const platformAssets = arches.flatMap(archGroup => archGroup.assets)
      return {
        os,
        label: OS_META[os as Exclude<Os, 'unknown'>].label,
        icon: OS_META[os as Exclude<Os, 'unknown'>].icon,
        note: platformNote(os as Exclude<Os, 'unknown'>, platformAssets),
        count,
        arches
      } satisfies PlatformGroup
    })
    .filter((group): group is PlatformGroup => group !== null)
})

const clientLabel = computed(() => {
  if (client.value.os === 'unknown') return '当前设备'
  const osLabel = OS_META[client.value.os].label
  const archLabel = client.value.arch === 'unknown' ? '' : ARCH_LABEL[client.value.arch]
  return archLabel ? `${osLabel} · ${archLabel}` : osLabel
})

/** 平台说明按实际产出的格式生成，Astra 没有 Flatpak 之类的情况不会写错 */
function platformNote(os: Exclude<Os, 'unknown'>, assets: AssetInfo[]): string {
  const formats = new Set(assets.map(asset => asset.format))
  const names = ['appimage', 'deb', 'rpm', 'flatpak', 'pacman', 'exe', 'msi', 'zip', 'dmg', 'targz']
    .filter(format => formats.has(format))
    .map(format => FORMAT_META[format].label)
  const list = names.length ? names.join(' / ') : '安装包'
  const hasLoong = assets.some(asset => asset.arch === 'loong64')

  if (os === 'linux') {
    return `${list} 覆盖${hasLoong ? '，含龙芯实验性构建' : ''}。`
  }
  if (os === 'windows') {
    return `推荐 Windows 10 21H2 及以后版本，提供 ${list} 格式。`
  }
  return `仅支持 macOS 14 及以后的 Apple Silicon 设备；暂不提供 Intel 构建。`
}

const recommended = computed<AssetInfo | null>(() => {
  if (!release.value) return null
  const { os, arch } = client.value
  if (os === 'unknown') return null

  let candidates = parsedAssets.value.filter(asset => asset.os === os)
  // macOS 目前只有 Apple Silicon 构建；其余平台必须匹配架构，避免给 ARM 用户推 x64 包
  if (os !== 'macos' && arch !== 'unknown') {
    candidates = candidates.filter(asset => asset.arch === arch)
  }
  if (!candidates.length) return null

  const preferred = PREFERRED_FORMAT[os]
  const rank = (asset: AssetInfo) => {
    const index = preferred.indexOf(asset.format)
    return index === -1 ? preferred.length + (FORMAT_META[asset.format]?.order ?? 99) : index
  }

  return [...candidates].sort((a, b) => rank(a) - rank(b))[0]
})

function parseAsset(asset: ReleaseAsset): AssetInfo | null {
  const name = asset.name
  const lower = name.toLowerCase()

  let format = 'other'
  if (lower.endsWith('.appimage')) format = 'appimage'
  else if (lower.endsWith('.pkg.tar.zst')) format = 'pacman'
  else if (lower.endsWith('.tar.gz') || lower.endsWith('.tgz')) format = 'targz'
  else if (lower.endsWith('.flatpak')) format = 'flatpak'
  else if (lower.endsWith('.deb')) format = 'deb'
  else if (lower.endsWith('.rpm')) format = 'rpm'
  else if (lower.endsWith('.dmg')) format = 'dmg'
  else if (lower.endsWith('.exe')) format = 'exe'
  else if (lower.endsWith('.msi')) format = 'msi'
  else if (lower.endsWith('.zip')) format = 'zip'

  if (format === 'other') return null

  let os: Os = 'unknown'
  if (format === 'dmg') os = 'macos'
  else if (format === 'exe' || format === 'msi') os = 'windows'
  else if (format === 'zip') os = /mac|darwin/.test(lower) ? 'macos' : 'windows'
  else if (format === 'targz') os = /mac|darwin/.test(lower) ? 'macos' : 'linux'
  else os = 'linux'

  let arch: Arch = 'unknown'
  if (/loongarch64|loong64|loongarch/.test(lower)) arch = 'loong64'
  else if (/aarch64|arm64|armv8/.test(lower)) arch = 'arm64'
  else if (/amd64|x86_64|x64|win64/.test(lower)) arch = 'x64'

  const flavor: AssetInfo['flavor'] = arch === 'loong64' && /(^|[-_.])loong64([-_.]|$)/.test(lower)
    ? 'loong64'
    : undefined

  return {
    ...asset,
    fileName: name,
    os,
    arch,
    format,
    formatLabel: FORMAT_META[format].label,
    hint: describeAsset(format, arch, flavor, lower),
    flavor
  }
}

function describeAsset(
  format: string,
  arch: Arch,
  flavor: AssetInfo['flavor'],
  lower: string
): string {
  if (format === 'appimage') return '免安装，下载后赋予执行权限即可运行'
  if (format === 'flatpak') return '适合支持 Flatpak 的发行版'
  if (format === 'pacman') return 'Arch Linux / Manjaro 等 Pacman 系'
  if (format === 'rpm') {
    return arch === 'loong64'
      ? 'openSUSE / Loongix / Fedora / EL 系'
      : 'Fedora / openSUSE / RHEL 兼容发行版'
  }
  if (format === 'deb') {
    if (arch === 'loong64') {
      return flavor === 'loong64'
        ? '安同 AOSC 系 loong64 安装包'
        : 'Debian / Ubuntu / Deepin / 银河麒麟'
    }
    return 'Debian / Ubuntu / Deepin / 银河麒麟'
  }
  if (format === 'targz') return '手动解压运行，适合排查与便携使用'
  if (format === 'dmg') return '打开镜像后拖入「应用程序」'
  if (format === 'exe') return 'NSIS 安装程序，推荐 Windows 10 21H2+'
  if (format === 'msi') return 'Windows Installer 安装包'
  if (format === 'zip') {
    return lower.includes('astra') ? '解压即用，内置官方 mpv' : 'Windows 压缩包'
  }
  return '其他格式'
}

function sortAssets(assets: AssetInfo[]): AssetInfo[] {
  return [...assets].sort((a, b) => {
    const order = (FORMAT_META[a.format]?.order ?? 99) - (FORMAT_META[b.format]?.order ?? 99)
    return order || a.fileName.localeCompare(b.fileName)
  })
}

function detectClient(): ClientInfo {
  if (typeof navigator === 'undefined') {
    return { os: 'unknown', arch: 'unknown', isMobile: false }
  }

  const ua = navigator.userAgent.toLowerCase()
  const nav = navigator as Navigator & {
    userAgentData?: { platform?: string; architecture?: string; mobile?: boolean }
  }
  const platform = (nav.userAgentData?.platform || navigator.platform || '').toLowerCase()
  const uaArch = (nav.userAgentData?.architecture || '').toLowerCase()
  const touchMac = /mac|macintosh/.test(platform) && (navigator.maxTouchPoints || 0) > 1
  const isMobileDevice =
    nav.userAgentData?.mobile === true ||
    touchMac ||
    /android|iphone|ipad|ipod|windows phone|harmonyos|openharmony|mobile|mobi/.test(ua)

  // 移动端没有桌面安装包，直接识别为移动设备，避免 Android/iOS 被归入 Linux/macOS
  if (isMobileDevice) return { os: 'unknown', arch: 'unknown', isMobile: true }

  let os: Os = 'unknown'
  if (/mac/.test(platform) || /mac os x/.test(ua)) os = 'macos'
  else if (/win/.test(platform) || /windows/.test(ua)) os = 'windows'
  else if (/linux|x11/.test(platform) || /linux|x11/.test(ua)) os = 'linux'

  let arch: Arch = 'unknown'
  const archProbe = `${uaArch} ${ua}`
  if (/loongarch|loong64/.test(archProbe)) arch = 'loong64'
  else if (/aarch64|arm64|armv8|(^|\s)arm($|\s)/.test(archProbe)) arch = 'arm64'
  else if (/x86_64|amd64|win64|(^|\s)x64($|\s)|x86/.test(archProbe)) arch = 'x64'
  else if (os === 'macos' && /intel/.test(platform)) arch = 'x64'

  return { os, arch, isMobile: false }
}

function downloadUrl(url: string): string {
  return useProxy.value ? `${PROXY_PREFIX}${url}` : url
}

function formatSize(bytes: number): string {
  return (bytes / 1024 / 1024).toFixed(1)
}

function formatDate(value: string): string {
  if (!value) return ''
  try {
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(new Date(value))
  } catch {
    return value
  }
}

class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
  }
}

async function requestRelease(url: string): Promise<Release> {
  const controller = new AbortController()
  const timer = window.setTimeout(() => controller.abort(), 12000)

  try {
    const response = await fetch(url, {
      headers: { Accept: 'application/vnd.github.v3+json' },
      signal: controller.signal
    })

    if (!response.ok) {
      let detail = ''
      try {
        const payload = await response.json()
        detail = payload?.message || ''
      } catch {
        // 忽略非 JSON 错误体
      }
      throw new HttpError(response.status, detail || `HTTP ${response.status}`)
    }

    return (await response.json()) as Release
  } finally {
    window.clearTimeout(timer)
  }
}

async function fetchLatest(product: Product): Promise<{ release: Release; proxy: boolean }> {
  const apiUrl = `https://api.github.com/repos/${product.repo}/releases/latest`

  try {
    return { release: await requestRelease(apiUrl), proxy: false }
  } catch (directError) {
    const status = directError instanceof HttpError ? directError.status : 0
    // 404（仓库/版本不存在）与请求格式错误不应该靠镜像解决
    if (status === 404 || status === 400) throw directError

    try {
      return {
        release: await requestRelease(`${PROXY_PREFIX}${apiUrl}`),
        proxy: true
      }
    } catch {
      throw directError
    }
  }
}

function readCache(repo: string): { at: number; release: Release } | null {
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${repo}`)
    if (!raw) return null
    const parsed = JSON.parse(raw)
    if (!parsed?.release?.tag_name || !Array.isArray(parsed.release.assets)) return null
    return parsed
  } catch {
    return null
  }
}

function writeCache(repo: string, data: Release) {
  try {
    localStorage.setItem(
      `${CACHE_PREFIX}${repo}`,
      JSON.stringify({ at: Date.now(), release: data })
    )
  } catch {
    // 隐私模式或配额不足时忽略缓存失败
  }
}

function messageForError(err: unknown): string {
  if (err instanceof HttpError) {
    if (err.status === 403 || err.status === 429) {
      return 'GitHub API 请求次数已达上限。请稍后重试，或勾选「中国大陆加速」通过镜像获取。'
    }
    if (err.status === 404) return '没有找到可用的正式版本，请前往 GitHub Releases 查看。'
    return `GitHub 返回了错误（${err.status}）：${err.message}`
  }
  if (err instanceof DOMException && err.name === 'AbortError') {
    return '请求超时，请检查网络后重试。'
  }
  return '无法连接 GitHub，请检查网络后重试。勾选「中国大陆加速」可能有助于访问。'
}

async function load(force = false) {
  const product = activeProductMeta.value
  const seq = ++requestSeq

  error.value = ''
  stale.value = false
  servedByProxy.value = false

  const cached = readCache(product.repo)
  if (!force && cached && Date.now() - cached.at < CACHE_TTL) {
    release.value = cached.release
    loading.value = false
    refreshing.value = false
    return
  }

  // 有旧缓存时先渲染，再静默刷新，避免整页骨架闪烁
  if (cached) {
    release.value = cached.release
    stale.value = true
    loading.value = false
    refreshing.value = true
  } else {
    loading.value = true
    refreshing.value = false
  }

  try {
    const result = await fetchLatest(product)
    if (seq !== requestSeq) return
    release.value = result.release
    servedByProxy.value = result.proxy
    stale.value = false
    writeCache(product.repo, result.release)
  } catch (err) {
    if (seq !== requestSeq) return
    if (cached) {
      stale.value = true
    } else {
      release.value = null
      error.value = messageForError(err)
    }
  } finally {
    if (seq === requestSeq) {
      loading.value = false
      refreshing.value = false
    }
  }
}

function switchProduct(id: Product['id']) {
  if (id === activeProduct.value) return
  activeProduct.value = id
  release.value = null
  error.value = ''
  if (!isMobile.value) load()
}

function retryWithProxy() {
  useProxy.value = true
  load(true)
}

watch(useProxy, value => {
  try {
    localStorage.setItem(PROXY_STORAGE_KEY, value ? '1' : '0')
  } catch {
    // 忽略存储失败
  }
})

onMounted(() => {
  client.value = detectClient()
  try {
    useProxy.value = localStorage.getItem(PROXY_STORAGE_KEY) === '1'
  } catch {
    useProxy.value = false
  }
  if (isMobile.value) {
    loading.value = false
    return
  }
  load()
})
</script>

<style>
/* 下载页需要比普通文档更宽的画布 */
.Layout.download-page .VPDoc:not(.has-sidebar) .container {
  max-width: 1240px;
}

.Layout.download-page .VPDoc:not(.has-sidebar) .content {
  max-width: 100%;
}

.Layout.download-page .VPDoc .content-container {
  max-width: none;
}

/* 页面没有大纲也没有侧边栏，隐藏悬浮的 "Return to top" 条 */
.Layout.download-page .VPLocalNav {
  display: none;
}

/* 隐藏 VPLocalNav 后，移动端由浮动的 NavBar 覆盖在页面之上，
   需要自己补出导航栏高度，否则标题会被挡住 */
.Layout.download-page .VPDoc {
  padding-top: calc(var(--vp-nav-height) + 20px);
}

@media (min-width: 768px) {
  .Layout.download-page .VPDoc {
    padding-top: calc(var(--vp-nav-height) + 24px);
  }
}

@media (min-width: 960px) {
  .Layout.download-page .VPDoc {
    /* 桌面端 VPContent 已经为导航栏留出空间 */
    padding-top: 32px;
  }
}
</style>

<style scoped>
.dl-page {
  --dl-card-border: color-mix(in srgb, var(--vp-c-border) 55%, transparent);
  --dl-card-bg: color-mix(in srgb, var(--vp-c-bg-soft) 72%, transparent);
  width: 100%;
  max-width: 1160px;
  margin: 0 auto;
  padding-bottom: 24px;
}

/* ========== 顶部 ========== */
.dl-hero {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 40px 32px 34px;
  border: 1px solid var(--dl-card-border);
  border-radius: 24px;
  background:
    linear-gradient(135deg, color-mix(in srgb, var(--main-color) 12%, transparent), transparent 55%),
    color-mix(in srgb, var(--vp-c-bg) 55%, transparent);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  backdrop-filter: blur(40px) saturate(180%);
  box-shadow:
    0 2px 8px color-mix(in srgb, var(--main-color) 10%, transparent),
    0 18px 48px color-mix(in srgb, var(--main-color) 8%, transparent);
}

.hero-orb {
  position: absolute;
  z-index: -1;
  border-radius: 50%;
  filter: blur(48px);
  pointer-events: none;
}

.hero-orb-a {
  top: -120px;
  right: -60px;
  width: 320px;
  height: 320px;
  background: color-mix(in srgb, var(--main-color) 32%, transparent);
}

.hero-orb-b {
  bottom: -160px;
  left: 10%;
  width: 280px;
  height: 280px;
  background: color-mix(in srgb, var(--vp-c-purple-1) 18%, transparent);
}

.dl-eyebrow {
  margin: 0 0 12px;
  color: var(--main-color);
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.24em;
}

.dl-title {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: clamp(1.9rem, 4vw, 2.9rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
}

.dl-lead {
  max-width: 620px;
  margin: 14px 0 0;
  color: var(--vp-c-text-2);
  font-size: 0.95rem;
  line-height: 1.7;
}

.product-switch {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 26px;
  padding: 6px;
  width: fit-content;
  border: 1px solid var(--dl-card-border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--vp-c-bg) 50%, transparent);
}

.product-tab {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  border: 1px solid transparent;
  border-radius: 13px;
  background: transparent;
  color: var(--vp-c-text-2);
  text-align: left;
  cursor: pointer;
  transition: background 0.25s ease, border-color 0.25s ease, color 0.25s ease,
    transform 0.25s ease;
}

.product-tab:hover {
  color: var(--vp-c-text-1);
  background: color-mix(in srgb, var(--main-color) 8%, transparent);
}

.product-tab.active {
  border-color: color-mix(in srgb, var(--main-color) 45%, transparent);
  background: color-mix(in srgb, var(--main-color) 14%, var(--vp-c-bg));
  color: var(--vp-c-text-1);
  box-shadow: 0 6px 18px color-mix(in srgb, var(--main-color) 14%, transparent);
}

.product-icon {
  width: 30px;
  height: 30px;
  object-fit: contain;
  flex: 0 0 auto;
}

.product-copy {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.product-copy strong {
  font-size: 0.95rem;
  font-weight: 700;
}

.product-copy small {
  color: var(--vp-c-text-3);
  font-size: 0.72rem;
  line-height: 1.3;
}

.product-tab.active .product-copy small {
  color: var(--vp-c-text-2);
}

/* ========== 加载 / 错误 ========== */
.dl-loading {
  display: grid;
  gap: 14px;
  margin-top: 24px;
  text-align: center;
}

.skeleton {
  border-radius: 18px;
  background: linear-gradient(
    100deg,
    color-mix(in srgb, var(--vp-c-bg-soft) 60%, transparent) 30%,
    color-mix(in srgb, var(--main-color) 12%, var(--vp-c-bg-soft)) 50%,
    color-mix(in srgb, var(--vp-c-bg-soft) 60%, transparent) 70%
  );
  background-size: 220% 100%;
  animation: shimmer 1.5s ease-in-out infinite;
}

.skeleton-strip {
  height: 64px;
}

.skeleton-card {
  height: 132px;
}

.loading-text {
  margin: 2px 0 0;
  color: var(--vp-c-text-3);
  font-size: 0.85rem;
}

@keyframes shimmer {
  from {
    background-position: 120% 0;
  }
  to {
    background-position: -120% 0;
  }
}

.dl-error {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 10px;
  margin-top: 24px;
  padding: 28px 30px;
  border: 1px solid color-mix(in srgb, var(--vp-c-danger-1, #d5393e) 32%, transparent);
  border-radius: 20px;
  background: color-mix(in srgb, var(--vp-c-danger-soft, #fef0f0) 55%, transparent);
}

.error-mark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--vp-c-danger-1, #d5393e) 15%, transparent);
  color: var(--vp-c-danger-1, #d5393e);
  font-weight: 800;
}

.dl-error h2 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 1.15rem;
}

.dl-error p {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.9rem;
  line-height: 1.6;
}

.error-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 8px;
}

/* ========== 版本条 ========== */
.version-strip {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 20px;
  padding: 14px 20px;
  border: 1px solid var(--dl-card-border);
  border-radius: 16px;
  background: var(--dl-card-bg);
  -webkit-backdrop-filter: blur(30px);
  backdrop-filter: blur(30px);
}

.version-main {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 10px;
}

.version-pill {
  border-radius: 999px;
  padding: 3px 10px;
  background: color-mix(in srgb, var(--main-color) 16%, transparent);
  color: var(--main-color);
  font-size: 0.72rem;
  font-weight: 700;
}

.version-tag {
  color: var(--vp-c-text-1);
  font-family: var(--vp-font-family-mono);
  font-size: 1rem;
}

.version-date,
.cache-note {
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
}

.cache-note {
  border-radius: 999px;
  padding: 2px 8px;
  background: color-mix(in srgb, var(--vp-c-text-3) 10%, transparent);
}

.version-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.proxy-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  cursor: pointer;
  user-select: none;
}

.proxy-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.toggle-track {
  position: relative;
  display: inline-block;
  width: 34px;
  height: 20px;
  border-radius: 999px;
  background: color-mix(in srgb, var(--vp-c-text-3) 28%, transparent);
  transition: background 0.2s ease;
}

.toggle-thumb {
  position: absolute;
  top: 3px;
  left: 3px;
  width: 14px;
  height: 14px;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.22);
  transition: transform 0.2s ease;
}

.proxy-toggle input:checked + .toggle-track {
  background: var(--main-color);
}

.proxy-toggle input:checked + .toggle-track .toggle-thumb {
  transform: translateX(14px);
}

.proxy-toggle input:focus-visible + .toggle-track {
  outline: 2px solid var(--main-color);
  outline-offset: 2px;
}

.ghost-link {
  color: var(--vp-c-text-2);
  font-size: 0.82rem;
  text-decoration: none;
  transition: color 0.2s ease;
}

.ghost-link:hover {
  color: var(--main-color);
}

/* ========== 更新说明 ========== */
.release-notes {
  margin-top: 14px;
  border: 1px solid var(--dl-card-border);
  border-radius: 16px;
  background: var(--dl-card-bg);
  overflow: hidden;
}

.release-notes summary {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 20px;
  color: var(--vp-c-text-1);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  list-style: none;
}

.release-notes summary::-webkit-details-marker {
  display: none;
}

.release-notes summary::before {
  content: '▸';
  color: var(--main-color);
  font-size: 0.8rem;
  transition: transform 0.2s ease;
}

.release-notes[open] summary::before {
  transform: rotate(90deg);
}

.summary-hint {
  margin-left: auto;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.75rem;
  font-weight: 400;
}

/* ========== 推荐 ========== */
.recommend {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 20px;
  padding: 24px 26px;
  border: 1px solid color-mix(in srgb, var(--main-color) 45%, transparent);
  border-radius: 20px;
  background:
    radial-gradient(120% 160% at 0% 0%, color-mix(in srgb, var(--main-color) 20%, transparent), transparent 60%),
    color-mix(in srgb, var(--vp-c-bg-soft) 70%, transparent);
  box-shadow: 0 14px 38px color-mix(in srgb, var(--main-color) 14%, transparent);
}

.recommend-copy {
  min-width: 0;
}

.recommend-badge {
  color: var(--main-color);
  font-size: 0.76rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.recommend h2 {
  margin: 6px 0 4px;
  border: none;
  padding: 0;
  color: var(--vp-c-text-1);
  font-size: 1.35rem;
  font-weight: 700;
}

.recommend p {
  margin: 0 0 8px;
  color: var(--vp-c-text-2);
  font-size: 0.88rem;
}

.recommend-file {
  display: inline-block;
  max-width: 100%;
  overflow-wrap: anywhere;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.76rem;
}

.compat-note {
  margin: 18px 0 0;
  padding: 12px 16px;
  border-left: 3px solid var(--main-color);
  border-radius: 0 10px 10px 0;
  background: color-mix(in srgb, var(--main-color) 8%, transparent);
  color: var(--vp-c-text-2);
  font-size: 0.85rem;
}

/* ========== 移动端 ========== */
.mobile-unsupported {
  display: flex;
  align-items: center;
  gap: 20px;
  margin-top: 24px;
  padding: 28px 30px;
  border: 1px solid color-mix(in srgb, var(--main-color) 32%, var(--vp-c-border));
  border-radius: 22px;
  background:
    radial-gradient(100% 180% at 100% 0%, color-mix(in srgb, var(--main-color) 16%, transparent), transparent 60%),
    color-mix(in srgb, var(--vp-c-bg-soft) 76%, transparent);
  box-shadow: 0 14px 38px color-mix(in srgb, var(--main-color) 8%, transparent);
}

.mobile-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  border: 1px solid var(--dl-card-border);
  border-radius: 18px;
  background: color-mix(in srgb, var(--vp-c-bg) 72%, transparent);
  font-size: 1.7rem;
}

.mobile-copy {
  min-width: 0;
}

.mobile-badge {
  color: var(--main-color);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.mobile-copy h2 {
  margin: 6px 0 6px;
  border: none;
  padding: 0;
  color: var(--vp-c-text-1);
  font-size: 1.25rem;
}

.mobile-copy p {
  max-width: 620px;
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.88rem;
  line-height: 1.65;
}

/* ========== 平台分组 ========== */
.platform {
  margin-top: 22px;
  padding: 22px 24px 24px;
  border: 1px solid var(--dl-card-border);
  border-radius: 22px;
  background:
    linear-gradient(180deg, color-mix(in srgb, var(--vp-c-bg-soft) 65%, transparent), var(--vp-c-bg)),
    var(--vp-c-bg);
  box-shadow: 0 10px 30px color-mix(in srgb, var(--main-color) 6%, transparent);
  animation: rise 0.5s cubic-bezier(0.16, 1, 0.3, 1) both;
  animation-delay: var(--enter-delay);
}

@keyframes rise {
  from {
    opacity: 0;
    transform: translateY(18px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.platform-head {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding-bottom: 18px;
  border-bottom: 1px solid color-mix(in srgb, var(--vp-c-divider) 55%, transparent);
}

.platform-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  border: 1px solid var(--dl-card-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--vp-c-bg) 70%, transparent);
  font-size: 1.45rem;
}

.platform-copy {
  min-width: 0;
}

.platform-copy h2 {
  margin: 0 0 4px;
  border: none;
  padding: 0;
  color: var(--vp-c-text-1);
  font-size: 1.2rem;
  font-weight: 700;
}

.platform-copy p {
  margin: 0;
  color: var(--vp-c-text-3);
  font-size: 0.8rem;
  line-height: 1.55;
}

.platform-count {
  margin-left: auto;
  flex: 0 0 auto;
  border-radius: 999px;
  padding: 4px 10px;
  background: color-mix(in srgb, var(--main-color) 10%, transparent);
  color: var(--main-color);
  font-size: 0.72rem;
  font-weight: 600;
  white-space: nowrap;
}

.arch-block {
  margin-top: 20px;
}

.arch-head {
  display: flex;
  flex-wrap: wrap;
  align-items: baseline;
  gap: 8px 10px;
  margin-bottom: 12px;
}

.arch-head h3 {
  margin: 0;
  color: var(--vp-c-text-1);
  font-size: 0.95rem;
  font-weight: 700;
}

.arch-hint {
  color: var(--vp-c-text-3);
  font-size: 0.75rem;
}

.arch-warning {
  margin-left: auto;
  border-radius: 999px;
  padding: 2px 9px;
  background: color-mix(in srgb, #d97706 12%, transparent);
  color: color-mix(in srgb, #b45309 82%, var(--vp-c-text-1));
  font-size: 0.7rem;
}

.asset-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 12px;
}

.asset-card {
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 15px 16px;
  border: 1px solid var(--dl-card-border);
  border-radius: 14px;
  background: color-mix(in srgb, var(--vp-c-bg) 65%, transparent);
  transition: border-color 0.2s ease, box-shadow 0.2s ease, transform 0.2s ease;
}

.asset-card:hover {
  border-color: color-mix(in srgb, var(--main-color) 42%, var(--vp-c-border));
  box-shadow: 0 10px 26px color-mix(in srgb, var(--main-color) 10%, transparent);
  transform: translateY(-2px);
}

.asset-card.recommended {
  border-color: color-mix(in srgb, var(--main-color) 52%, transparent);
  background:
    linear-gradient(150deg, color-mix(in srgb, var(--main-color) 9%, transparent), transparent 70%),
    color-mix(in srgb, var(--vp-c-bg) 70%, transparent);
}

.asset-top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.format-chip {
  color: var(--main-color);
  font-size: 0.82rem;
  font-weight: 700;
}

.asset-size {
  color: var(--vp-c-text-3);
  font-size: 0.74rem;
  font-variant-numeric: tabular-nums;
}

.asset-hint {
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.79rem;
  line-height: 1.5;
}

.asset-file {
  margin: 0 0 6px;
  overflow: hidden;
  color: var(--vp-c-text-3);
  font-family: var(--vp-font-family-mono);
  font-size: 0.7rem;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.download-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: auto;
  border: 1px solid color-mix(in srgb, var(--main-color) 30%, transparent);
  border-radius: 10px;
  padding: 8px 12px;
  background: color-mix(in srgb, var(--main-color) 8%, transparent);
  color: var(--main-color);
  font-size: 0.82rem;
  font-weight: 600;
  text-decoration: none;
  transition: background 0.2s ease, color 0.2s ease, box-shadow 0.2s ease;
}

.download-btn:hover {
  background: var(--main-color);
  color: #fff;
  box-shadow: 0 8px 20px color-mix(in srgb, var(--main-color) 26%, transparent);
}

.download-btn:hover .dl-icon::before {
  background: currentColor;
}

.download-btn:hover .dl-icon::after {
  border-color: currentColor;
}

/* 纯 CSS 下载箭头 */
.dl-icon {
  position: relative;
  display: inline-block;
  width: 12px;
  height: 12px;
  flex: 0 0 12px;
}

.dl-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 1.5px;
  height: 8px;
  background: currentColor;
  transform: translateX(-50%);
}

.dl-icon::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 50%;
  width: 6px;
  height: 6px;
  border-right: 1.5px solid currentColor;
  border-bottom: 1.5px solid currentColor;
  transform: translateX(-50%) rotate(45deg);
}

.dl-icon.small {
  width: 10px;
  height: 10px;
  flex-basis: 10px;
}

.dl-icon.small::before {
  height: 7px;
}

.dl-icon.small::after {
  width: 5px;
  height: 5px;
}

/* ========== 商店 ========== */
.stores {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  margin-top: 22px;
  padding: 24px 26px;
  border: 1px dashed color-mix(in srgb, var(--main-color) 38%, var(--vp-c-border));
  border-radius: 20px;
  background: color-mix(in srgb, var(--main-color) 5%, transparent);
}

.stores-badge {
  color: var(--main-color);
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
}

.stores h2 {
  margin: 6px 0 6px;
  border: none;
  padding: 0;
  color: var(--vp-c-text-1);
  font-size: 1.15rem;
}

.stores p {
  max-width: 520px;
  margin: 0;
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
  line-height: 1.6;
}

.store-links {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.store-links a {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--dl-card-border);
  border-radius: 12px;
  padding: 10px 14px;
  background: color-mix(in srgb, var(--vp-c-bg) 70%, transparent);
  color: var(--vp-c-text-1);
  font-size: 0.84rem;
  font-weight: 600;
  text-decoration: none;
  transition: border-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.store-links a:hover {
  border-color: var(--main-color);
  color: var(--main-color);
  transform: translateY(-1px);
}

.store-arrow {
  color: var(--vp-c-text-3);
}

/* ========== 页脚 ========== */
.dl-footnote {
  margin-top: 22px;
  padding: 0 6px;
  color: var(--vp-c-text-3);
  font-size: 0.76rem;
  line-height: 1.7;
}

.dl-footnote p {
  margin: 0 0 4px;
}

.dl-footnote a {
  color: var(--vp-c-text-2);
  text-decoration: underline;
  text-underline-offset: 2px;
}

.dl-footnote a:hover {
  color: var(--main-color);
}

.proxy-note code {
  border-radius: 4px;
  padding: 1px 5px;
  background: color-mix(in srgb, var(--main-color) 10%, transparent);
  font-family: var(--vp-font-family-mono);
}

/* ========== 按钮 ========== */
.primary-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  border-radius: 12px;
  padding: 12px 22px;
  background: linear-gradient(135deg, var(--main-color), var(--main-color-dark));
  color: #fff;
  font-size: 0.9rem;
  font-weight: 700;
  text-decoration: none;
  white-space: nowrap;
  cursor: pointer;
  box-shadow: 0 10px 24px color-mix(in srgb, var(--main-color) 26%, transparent);
  transition: transform 0.2s ease, box-shadow 0.2s ease, filter 0.2s ease;
}

.primary-btn:hover {
  color: #fff;
  transform: translateY(-2px);
  filter: brightness(1.05);
  box-shadow: 0 14px 30px color-mix(in srgb, var(--main-color) 32%, transparent);
}

.primary-btn.compact {
  padding: 9px 18px;
  font-size: 0.84rem;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  border: 1px solid var(--dl-card-border);
  border-radius: 12px;
  padding: 9px 16px;
  background: color-mix(in srgb, var(--vp-c-bg) 60%, transparent);
  color: var(--vp-c-text-2);
  font-size: 0.84rem;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: border-color 0.2s ease, color 0.2s ease;
}

.ghost-btn:hover {
  border-color: var(--main-color);
  color: var(--main-color);
}

/* ========== 响应式 ========== */
@media (max-width: 768px) {
  .dl-hero {
    padding: 28px 20px 24px;
    border-radius: 20px;
  }

  .product-switch {
    width: 100%;
  }

  .product-tab {
    flex: 1 1 100%;
  }

  .platform {
    padding: 18px 16px 20px;
    border-radius: 18px;
  }

  .platform-count {
    display: none;
  }

  .asset-grid {
    grid-template-columns: 1fr;
  }

  .recommend,
  .stores {
    padding: 20px;
  }

  .mobile-unsupported {
    align-items: flex-start;
    padding: 22px 20px;
    border-radius: 18px;
  }

  .mobile-icon {
    width: 48px;
    height: 48px;
    border-radius: 15px;
    font-size: 1.4rem;
  }

  .recommend .primary-btn {
    width: 100%;
  }

  .version-actions {
    width: 100%;
    justify-content: space-between;
  }
}

@media (max-width: 480px) {
  .dl-title {
    font-size: 1.7rem;
  }

  .arch-warning {
    margin-left: 0;
  }
}

@media (prefers-reduced-motion: reduce) {
  .platform {
    animation: none;
  }

  .skeleton {
    animation: none;
  }

  .asset-card:hover,
  .primary-btn:hover,
  .store-links a:hover {
    transform: none;
  }
}
</style>
