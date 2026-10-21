# Quaver Music 前端开发指南

> 本指南覆盖 `ui/` 目录全部前端代码（渲染层 `ui/src/**` + Electron 主进程 `ui/electron/**` + Sparkle 插件系统），
> 目标是「读完就能上手改」：**所有变量、所有取值域、所有持久化键、所有外部接口**都在此登记，并做了分类。
>
> 适用范围：仓库 `/home/ne0w0r1d/Desktop/quaver`，前端全部在 `ui/`。文中行号/常量以当前 main 分支为准。
>
> 一句话架构：**Vite SPA（无框架，视图按需懒加载）** + **Electron 桌面壳** + **Go sidecar 后端（:3200）** + **Sparkle 插件系统** + 内置 AMLL 歌词引擎/桌面歌词覆盖层窗。

## 目录

- [1. 总览与架构](#1-总览与架构)
- [2. 目录与模块职责](#2-目录与模块职责)
- [3. 配置系统 quaver.conf（全量 SCHEMA）](#3-配置系统-quaverconf全量-schema)
- [4. prefs：枚举 ⇄ 配置映射全表](#4-prefs枚举--配置映射全表)
- [5. CSS 变量全量参考](#5-css-变量全量参考)
- [6. data-* 属性与 DOM 状态](#6-data--属性与-dom-状态)
- [7. localStorage 键全量](#7-localstorage-键全量)
- [8. IPC 通道与 preload 桥](#8-ipc-通道与-preload-桥)
- [9. HTTP API 端点](#9-http-api-端点)
- [10. 环境变量全量](#10-环境变量全量)
- [11. 常量与魔法数字（按模块）](#11-常量与魔法数字按模块)
- [12. 播放器、传输层与音质](#12-播放器传输层与音质)
- [13. Sparkle 插件系统](#13-sparkle-插件系统)
- [14. Electron 主进程](#14-electron-主进程)
- [15. 硬约束与开发约定](#15-硬约束与开发约定)
- [16. 验证脚本与构建](#16-验证脚本与构建)

## 1. 总览与架构

### 1.1 技术栈

| 层 | 技术 | 说明 |
| --- | --- | --- |
| 渲染层 | Vite **SPA**，**无框架**（原生 DOM + TS） | 唯一应用入口 `index.html` → `src/main.ts`；`src/**` 共约 20,900 行 TS。其余根目录 `<name>.html` 全是 `public/redirect.js` 薄跳转层；`desktop-lyrics.html` 是独立覆盖层窗页 |
| 视图 | `src/views/*.ts` **按需动态加载** | 路由 → 视图的 `loaders` 表在 `src/views/index.ts`；首次访问才解析，交互意图（hover/pointerdown）才预取 |
| 运行时 | **Node 24 原生类型剥离（strip-only）** | `electron/**`、`scripts/**`、`src/**` 全是 `.ts`，**无 tsc 产物、无 outDir** |
| 桌面壳 | Electron 44 | `ui/electron/**`；`main` 入口 = `electron/main.ts` |
| 歌词引擎 | AMLL（宿主内置，非插件） | `src/lyrics/`（amll 解析+渲染 / builtin 注册 / qrc-kana 振假名） |
| 后端 | sidecar（Go: `vendor/Typhoeus-go`），监听 `:3200` | 渲染层经同源 `/api` 中继访问；凭证只在主进程↔sidecar 间流转 |
| 插件 | Sparkle（git submodule `vendor/Sparkle`） | SDK 纯类型契约；官方插件静态打包，第三方插件 ESM 单文件 |
| 打包 | electron-builder（配置在 `packages/`） | AppImage，x86_64 / aarch64 共用 `packages/appimage/arm-x86.yml`；`pnpm run dist` |

- 包名 `red.0w0.quaver`，`productName: "Quaver Music"`，`desktopName: "red.0w0.quaver.desktop"`，`version: 1.5.0`，`engines.node >= 24`，`packageManager: pnpm@10.33.0`。运行时依赖只有 `mpris-service`（主进程 MPRIS）。
- 窗口身份 app_id / WM_CLASS = `red.0w0.quaver`，**唯一真相是 `package.json` 顶层 `desktopName`**。

### 1.2 应用结构（SPA）与路由

- **单页应用**：`index.html` 是唯一应用页（壳层由 `src/main.ts → shell.ts` 注入）。`vite.config.ts` 的 `PAGES = ["index","guess","daily","liked","playlist","playlists","user","settings","login","desktop-lyrics"]`；除 `index` / `desktop-lyrics` 外，其余 html 只是深链跳转层（CSP 的 `script-src` 只有 `'self' blob:`，**页面里不许有内联脚本**，跳转层必须是外链 `redirect.js` + `data-route`）。
- `desktop-lyrics.html` = 桌面歌词覆盖层窗（独立 Electron 窗，非路由页；入口 `src/desktop-lyrics.ts`，协议契约 `src/lib/desktop-lyrics-protocol.ts`）。
- 视图注册：`src/views/index.ts` 的 `loaders` 表（宿主路由 > 插件路由（`sparkleViewAt`）> 回落首页；未知路径回落且**不缓存**）。视图模块：

| 路由 | 视图模块 | 说明 |
| --- | --- | --- |
| `/` | `views/home.ts` | 首页 |
| `/search` | `views/search.ts` | 搜索（`?keyword=&type=`，`SEARCH_TABS` type 0/1/2/3） |
| `/guess` | `views/guess.ts` | 猜你喜欢 |
| `/daily` | `views/daily.ts` | 每日 30 首 |
| `/liked` | `views/liked.ts` | 我喜欢 |
| `/local` | `views/local.ts` | 本地音乐（源管理 · 扫描 · 自动刮削 · 曲目表） |
| `/playlists` | `views/playlists.ts` | 歌单广场（PlaylistMode=menu 时侧栏隐藏入口） |
| `/playlist` | `views/playlist.ts` | 歌单详情 |
| `/toplist` | `views/toplist.ts` | 排行榜（`?id=&period=`，期次逻辑在 `lib/toplist-periods.ts`） |
| `/singer` | `views/singer.ts` | 歌手主页（`SINGER_TABS` hot/new/album） |
| `/singer-albums` | `views/singer-albums.ts` | 歌手全部专辑 |
| `/album` | `views/album.ts` | 专辑详情 |
| `/settings` | `views/settings.ts` | 设置（最大视图，约 1,460 行） |
| `/log` | `views/log.ts` | 日志 |
| `/user` | `views/user.ts` | 用户页（退出动画 `views/_shared.ts:ME_OUT_MS = 180`） |
| `/login` | `views/login.ts` | 登录 |

- 侧栏导航 `shell.ts` 的 `nav`：首页 `/`、猜你喜欢 `/guess`、每日 30 首 `/daily`、我喜欢 `/liked`、**歌单 `/playlists`**（icon `list`；`PlaylistMode=menu` 时隐藏，改由侧栏歌单列表承担）、本地音乐 `/local`（icon `folder`）。
- 视图共用件在 `views/_shared.ts`（小工具/页面头/粘顶/响应类型），随第一个真视图进内存。

### 1.3 启动流程（渲染层，`src/main.ts`）

配置在 **preload 阶段已同步取好**（`sendSync("quaver:config-sync")`），`main.ts` 无任何 `await`。启动顺序：

1. `applyTheme()` → 写 `<html data-theme>`；
2. `applyFonts()` → 写 `--font-ui` / `--font-lyric`；
3. `applyDecor()` → `body.ssd` 切换；
4. `bootControlBar()` → `body[data-control-bar]`（bootShell 前定形）；
5. `bootPlaylistMode()` → `body[data-playlist-mode]`（同上）；
6. `applySidebar()` → 侧栏缩态在 bootShell 之前挂到 body（避免先展开再收）；
7. `syncCloseAction()` → 把关闭按钮行为推给主进程（tray/quit）；
8. 全局输入治理：拦 `Tab` 遍历；中键不新窗口跳转；左键点按钮不转移焦点（捕获阶段）；
9. 无 hash 时 `location.replace("#/")`；
10. `bootShell()`；
11. `void initSparkle()`（必须在 bootShell 之后，渐进增强、不阻塞首帧）；
12. `startMprisBridge()`、`startDesktopLyricsBridge()`、`startHotkeysBridge()`、`startInhibitBridge()`；
13. 3s 后动态 `import("./lib/updater")` 跑自动更新检查（约 22KB 不进首屏）；
14. DEV：`window.__player = player`（e2e 钩子，生产构建不含）。

### 1.4 顶层 git 结构与子模块

- `.gitmodules` 引用 `vendor/Sparkle`（插件 SDK + 官方插件 + marketplace）与 `vendor/Typhoeus`（sidecar / MPRIS 守护）。
- `dist-bin/` 存放随包 sidecar 二进制（`quaver-server*`）；`build-res/audio` 存放随包 mpv 运行时。

## 2. 目录与模块职责

### 2.1 渲染层 `ui/src/`

| 文件/目录 | 职责 |
| --- | --- |
| `main.ts` | SPA 入口：应用偏好、boot 壳层、启动插件/MPRIS/桌面歌词/热键/防睡眠桥 |
| `shell.ts` | 壳层：标题栏/侧栏/内容区/播放条注入，hash 路由 + 前进/后退栈，导航，封面染色应用 |
| `views/index.ts` | 路由注册表（懒加载 + 预取 + 插件路由兜底） |
| `views/*.ts` | 16 个视图模块 + `_shared.ts` 共用件；每个模块首行注明由 index.ts 按需动态 import |
| `player.ts` | 播放器模块级单例 `export const player`（1,603 行）：队列/收藏/会话/歌词管线 |
| `lyric.ts` | LRC 解析与辅助行挑选（`parseLrc`/`coerceLyricToLrc`/`pickAux`，AMLL 与行级共用） |
| `lyrics/` | 内置 AMLL 歌词引擎：`amll.ts`（解析+渲染+dispose）、`builtin.ts`（注册表兜底位）、`qrc-kana.ts`（QRC `[kana:]` 振假名） |
| `desktop-lyrics.ts` / `desktop-lyrics.css` | 桌面歌词覆盖层页（独立窗；几何公式在 `lib/desktop-lyrics-layout.ts`） |
| `mpris.ts` | MPRIS 渲染层桥（真相在主进程 `electron/mpris.ts`） |
| `relay.ts` | Vite dev/preview 的 `/api` 中继中间件（转发 sidecar + 封面/背景/强调色/Sparkle/本地代理） |
| `fake-audio.ts` | 静音占位音轨（维持系统媒体会话） |
| `globals.d.ts` | ambient 声明：`__APP_VERSION__`、`window.quaver*` 桥 |
| `style.css` | 全局样式（2,442 行），**所有 CSS 变量的定义处** |
| `lib/*.ts` | 纯逻辑/门面模块（见下） |
| `components/*.ts` | UI 组件（见下） |
| `sparkle/*.ts` | 插件系统宿主端（见 §13） |

### 2.2 `ui/src/lib/` 模块

| 文件 | 职责 |
| --- | --- |
| `config.ts` | quaver.conf 的渲染层门面（`cfg`/`cfgSet`/`cfgSetSoon`/`loadConfig`…） |
| `prefs.ts` | 内部枚举 ⇄ 配置取值的映射与即时生效（最大门面，895 行） |
| `api.ts` | `/api` 封装、音质表、歌曲标题/副标题、剪贴板 |
| `accent.ts` | 系统强调色轮询（`--cvg-accent` 的 system 档来源） |
| `ambient.ts` | 环境色层（`.ambient`）DOM 应用 |
| `tint.ts` | 界面高亮色（写 `--cvg-*` 五个变量） |
| `menu-glass.ts` | 浮层菜单毛玻璃（写 `<html data-menu-glass>`） |
| `control-bar.ts` | 播放控制条停靠形态应用端（`body[data-control-bar]`，与 `sparkle/theme-control-bar.ts` 合流） |
| `playlist-mode.ts` | 歌单显示模式应用端（`body[data-playlist-mode]`，与 `sparkle/theme-playlist-mode.ts` 合流） |
| `color.ts` | 颜色数学：`parseHex`/`toHex`/`rgb2hsl`/`hsl2rgb`/`rgb2cmyk`/`cmyk2rgb`、封面取色（`extractCoverColor` + `toPixelSrc`：跨源 http(s) 过 `/api/img` 白名单中继，同源相对路径（本地封面）与 data: 直连） |
| `hotkeys.ts` | 焦点内热键 + 全局热键回程 |
| `inhibit.ts` | 播放时防睡眠（执行端在 Go sidecar `vendor/Typhoeus-go/inhibit`） |
| `session.ts` | 播放会话存档（queue/进度/模式） |
| `account-sync.ts` | 账号侧数据热更新（他端改了收藏/歌单，桌面端轮询同步，不必重启） |
| `playlists.ts` / `favs.ts` / `songlist-detail.ts` | 歌单/收藏数据层与写回 |
| `songs.ts` | 歌曲行渲染与 `loadLiked` 等 |
| `local.ts` | 本地/NAS 曲库渲染侧数据层：`/api/local/*` 客户端、库快照 + 进度轮询、`trackToSong`（Song.local 指纹）、扫描/刮削/导入/编辑动作 |
| `songtiers.ts` | 单曲音质档位存在性判定（纯逻辑） |
| `shuffle.ts` | 伪随机洗牌（FNV-1a hash 序列） |
| `reorder.ts` | 队列拖拽重排几何计算 |
| `transport.ts` | 播放进度外推（引擎/web 两种 Transport） |
| `streaminfo.ts` | 音频流容器/编解码信息解析（FLAC/Ogg/MP3） |
| `vip.ts` | 会员到期/权益解析 |
| `update-core.ts` / `updater.ts` | 自更新纯逻辑 / 编排 |
| `audio-spectrum.ts` | 正在播放页真实音频频谱采集（WebAudio FFT） |
| `spectrum-controller.ts` | 频谱宿主控制面：偏好 + 内置/插件模式表 + Sparkle 门面（分析器/绘制器按需动态加载） |
| `spectrum-render.ts` | 内置频谱形态（bars/mirror/wave 共用同一份帧） |
| `cjk-convert.ts` | 歌词繁简转换（opencc-js 按方向惰性分包；转换只发生在文本进播放器的口子） |
| `ttml.ts` | TTML 逐字歌词门面：`TtmlDatabase` 模板展开（%p/%s）+ 在线查询 + 会话级未命中缓存（TTL 10min） |
| `lyric-delay.ts` | 按歌曲的歌词同步微调（localStorage `quaver.lyricDelay.v1`，0.1s 步进 ±10s） |
| `desktop-lyrics.ts` | 桌面歌词桥（主窗侧；player 是唯一事实源，单向上行镜像） |
| `desktop-lyrics-protocol.ts` | 覆盖层↔主窗线协议契约（覆盖层页与桥共用，别把重依赖带回契约） |
| `desktop-lyrics-layout.ts` | 桌面歌词纯几何（不 import DOM，裸 node 可载，有真单测） |
| `toplist-periods.ts` | 榜单期次（周榜 ISO 周 / 日榜日期 / 实时榜小时；历史期次回查） |
| `fullscreen.ts` | 窗口全屏能力收口（画廊模式消费；Electron 壳层走 quaverCSD 扩展桥） |
| `resizer.ts` / `icons.ts` / `html.ts` | 分隔条拖拽、图标、HTML 工具 |

### 2.3 `ui/src/components/`

`CreditsDialog`（开源致谢）、`DebugDialog`（进程/内存自检，DevTools 唯一入口）、`HotkeySettings`、`ListTools`、`LocalImportDialog`（本地曲「重新设置刮削信息」模态）、`LocalPluginDialog`、`NowPlaying`、`PlayerBar`、`PlaylistMenu`、`PluginSettingsDialog`、`QueuePanel`、`SearchBox`、`SongMenu`、`UpdateDialog`。

## 3. 配置系统 quaver.conf（全量 SCHEMA）

### 3.1 路径与文件

真相在 `electron/config.ts`（纯 Node ESM、零依赖、可脱离 Electron 单测）。

**为什么用文件而不是 localStorage**：打包态（AppImage）每次启动在随机端口起 HTTP 服务，页面 origin 每次不同 → localStorage 按 origin 隔离 → 设置每次归零。文件配置不受 origin 影响。

| 项 | 值 |
| --- | --- |
| 配置目录（Linux） | `$XDG_CONFIG_HOME/quaver-music`，默认 `~/.config/quaver-music` |
| 配置目录（Windows） | `%AppData%/Quaver Music`（即 `%USERPROFILE%\AppData\Roaming\Quaver Music`） |
| 配置目录（macOS） | `~/Library/Application Support/Quaver Music` |
| 目录覆盖 | 环境变量 `QUAVER_CONFIG_DIR`（测试 / 主进程下发给 sidecar） |

**文件名常量**（`electron/config.ts`）：

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `APP_DIR_NAME` | `"Quaver Music"` | Windows/macOS 用 |
| `APP_DIR_NAME_POSIX` | `"quaver-music"` | Linux（XDG 小写） |
| `CONFIG_NAME` | `"quaver.conf"` | 主配置文件 |
| `CREDENTIAL_NAME` | `"credential.json"` | 明文遗留（仅作升级导入来源，导入后删） |
| `CREDENTIAL_STORE_NAME` | `"credential.enc"` | 密钥环模式：磁盘只留密文 |
| `DEVICE_NAME` | `"device.json"` | 设备指纹（非密钥，明文） |
| 日志 | `electron-dev.log` | 同目录 |
| `local-library/library.json` | 本地曲库索引（0600；含 WebDAV 口令，**任何响应不得回显 password**） | 见 §9.3 |
| `local-library/covers/`、`local-library/lyrics/` | 本地曲库的封面副本（内嵌抽取 / QQ 下载 / 手动导入）与歌词件（`.txt` 内嵌、`.json` 在线缓存、`.import` 手动导入） | 见 §9.3 |

**写入策略**：读文件保留原始行（注释、顺序、用户自加键都不动），`set` 只改对应键那一行；键不存在则追加。落盘走「同目录临时文件 + rename」原子替换，**文件权限 0600、目录 0700**。

**INI 解析规则**：`#`/`;` 开头的整行是注释；行内注释 = 值后跟「空白 + `#`/`;`」（本项取值域不含这两个字符，故无歧义）。

### 3.2 SCHEMA 全量表（section / key / 默认值 / 值域 / 含义）

> 「布尔」列的值域统一为 `True/False/true/false/1/0/yes/no`。

#### `[Style]` 外观

| 键 | 默认值 | 值域 | 含义 |
| --- | --- | --- | --- |
| `Style` | `dark` | `dark` / `light` / `follow-system`（未来 KEBAB 大写主题名） | 界面主题 |
| `DefaultUIFonts` | `Source Han Sans,Microsoft Yahei UI` | CSS font-family 列表 / 预设名 `system`/`sans`/`serif`/`mono` / 空 | 界面字体 |
| `DefaultLyricsFonts` | `Source Han Serif` | 同上 | 歌词字体 |
| `ShowTranslation` | `True` | 布尔 | （兼容旧值）歌词翻译开关；新配置用 `LyricAux` |
| `LyricAux` | `translation` | `off` / `translation` / `romanization` | 歌词辅助行：关闭 / 翻译 / 注音（Ruby） |
| `LyricScale` | `1` | `0.7`–`1.5`（浮点） | 行级（LRC）歌词缩放；逐字（QRC/AMLL）模式不生效 |
| `Background` | `off` | `off` / `cover` / `custom` | 环境色层：关闭 / 封面模糊铺底 / 自定义图片 |
| `BackgroundImage` | `""` | 绝对路径（单行、无控制字符、≤1024） | 自定义背景图路径；`/api/bg` 白名单扩展名 |
| `BackgroundBlur` | `70` | `0`–`120`（px） | 背景模糊强度 |
| `Tint` | `default` | `default` / `cover` / `system` / `custom` | 高亮色来源 |
| `TintColor` | `#19c2d8` | `#rgb` / `#rrggbb`（带 `#`） | 自定义高亮色（仅 `Tint=custom` 生效） |
| `ControlBar` | `bottom` | `bottom` / `floating` | 播放控制条停靠形态：窗口底部整条 / 悬浮在内容区底部（`body[data-control-bar]`；Sparkle 主题可用 `--control-bar-*` 令牌接管） |
| `PlaylistMode` | `menu` | `menu` / `collection` | 歌单呈现方式：菜单栏（侧栏列歌单）/ 歌单集合页（`body[data-playlist-mode]`；`sparkle.theme.playlistMode` 可接管） |
| `Spectrum` | `False` | 布尔 | 正在播放页真实音频频谱可视化（WebAudio FFT，浮在播放控制条上方） |
| `SpectrumMode` | `bars` | `bars` / `mirror` / `wave` / 插件模式 id（`^[a-z0-9][a-z0-9-]{0,31}$`） | 频谱形态；插件经 `registerNowPlayingSpectrumMode` 注册同表模式，不存在回落 `bars` |
| `MenuBlur` | `True` | 布尔 | 浮层菜单毛玻璃开关 |

#### `[Window]` 窗口

| 键 | 默认值 | 值域 | 含义 |
| --- | --- | --- | --- |
| `Decor` | `csd` | `csd` / `ssd` | 自绘标题栏 / 系统标题栏（切换自动重建窗口） |
| `CloseAction` | `tray` | `tray` / `quit` | ✕ 按钮行为：缩到托盘 / 退出 |
| `SidebarCollapsed` | `False` | 布尔 | 侧栏是否缩回 |
| `SidebarWidth` | `""` | 空 / `64`–`2000`（px） | 侧栏宽度；空=内置默认 216 |
| `QueueWidth` | `""` | 空 / `64`–`2000`（px） | 播放列表停靠宽度；空=内置默认 300 |

#### `[Playing]` 播放

| 键 | 默认值 | 值域 | 含义 |
| --- | --- | --- | --- |
| `Backend` | `MPV` | `MPV` / `Chromium` / `Blink`（旧值，读入归一为 Chromium） | 解码后端 |
| `AudioDevice` | `auto` | 非空（mpv audio-device 名） | 音频输出设备（仅 MPV） |
| `Fade` | `normal` | `off` / `short` / `normal` / `long` | 淡入淡出（仅 MPV） |
| `Volume` | `0.8` | `0`–`1`（浮点） | 音量（静音时保留原值） |
| `Muted` | `False` | 布尔 | 启动是否静音 |
| `PrevReplay` | `True` | 布尔 | 上一首：单击重放 / 单击跳上一首 |
| `InhibitSleep` | `True` | 布尔 | 播放时禁止系统睡眠 |

#### `[Quality]` 音质

| 键 | 默认值 | 值域 | 含义 |
| --- | --- | --- | --- |
| `DefaultQuality` | `Auto` | `Auto` / `128` / `320` / `flac` / `640ogg` / `atmos2` / `atmos51` / `master` | 默认音质 |
| `FallbackToQMAtmos` | `False` | 布尔 | 高档不可用时是否优先回退臻品全景声 |

#### `[Lyrics]` 歌词增强

| 键 | 默认值 | 值域 | 含义 |
| --- | --- | --- | --- |
| `ChineseConvert` | `off` | `off` / `simplified` / `traditional` | 歌词繁简转换（opencc-js 惰性词典；只转「进播放器」的文本，磁盘缓存/手动导入原文不动；roma 不转） |
| `OnlineTtml` | `True` | 布尔 | 在线 TTML 逐字歌词（AMLL TTML 数据库）；仅在拿不到逐字内容时补一次查询，未命中记会话级负缓存（TTL 10min） |
| `TtmlDatabase` | `https://amlldb.bikonoo.com/%p/%s.ttml` | URL 模板（必须含 `%s`，可选 `%p`） | TTML 数据库地址模板：`%p`=平台目录（qq-lyrics/ncm-lyrics/am-lyrics/spotify-lyrics），`%s`=该平台歌曲 id |
| `TtmlLibrary` | `""` | 绝对路径 / 空 | 本地 TTML 歌词库目录（非空即启用，无独立开关）；主进程 `GET /api/local/ttml` 服务，候选序 `qq-lyrics/<songmid>.ttml` → id 平铺 → 歌名-歌手变体 |

#### `[DesktopLyrics]` 桌面歌词（透明覆盖层窗）

| 键 | 默认值 | 值域 | 含义 |
| --- | --- | --- | --- |
| `Enabled` | `False` | 布尔 | 桌面歌词开关（渲染层写） |
| `Locked` | `False` | 布尔 | 锁定（鼠标透穿；平台闸门 `supportsDlLock`：macOS/Windows/X11，Wayland 不开放）；解除只留托盘与设置页 |
| `Opacity` | `1` | `0.1`–`1` | **歌词层**不透明度（挂内容 `#dl-clip`/`#dl-empty`；悬停地板 `0.3`） |
| `Backdrop` | `0` | `0`–`1` | **窗体背板**不透明度（`#dl-board` 铺满客户端表面，画在歌词下；与 Opacity 两层独立） |
| `Scale` | `1` | `0.5`–`2` | 歌词缩放 |
| `Weight` | `400` | `100`–`900` | 字重 |
| `Font` | `Source Han Serif` | CSS font-family 列表 / 预设名 | 歌词字体 |
| `Border` | `1` | `0`–`4` | 描边宽度 |
| `Shadow` | `True` | 布尔 | 阴影开关 |
| `ShadowBlur` | `8` | `0`–`32` | 阴影模糊半径（px） |
| `ShadowOpacity` | `0.45` | `0`–`1` | 阴影不透明度 |
| `ShadowX` / `ShadowY` | `0` / `2` | `-12`–`12` | 阴影偏移（px；Y 默认略向下投） |
| `Mode` | `single` | `single` / `dual` | 行数：当前句 / 当前句+下一句（排版由内置 AMLL 实现） |
| `SingleCenter` | `True` | 布尔 | 仅 `single`：水平居中 + 窗口恒为主行行盒高；`False` = 左对齐 + 窗口随行盒伸缩（双行恒左对齐） |
| `ColorMode` | `default` | `default` / `cover` / `system` / `custom` | 颜色：白字黑描边 / 封面染色 / 系统强调色（失败回落白字）/ 自定义 |
| `Color` | `#ffffff` | HEX | 自定义颜色（仅 `custom`） |
| `X` / `Y` / `W` / `H` | `""` | 整数 / 空 | 覆盖层位置/大小（**主进程**在窗口移动/缩放后回写；留空=默认落位屏幕底部居中） |

#### `[Hotkeys.Global]` 全局热键

| 键 | 默认值 | 含义 |
| --- | --- | --- |
| `Toggle` | `Ctrl+Alt+P` | 暂停/播放 |
| `Prev` | `Ctrl+Alt+Left` | 上一曲 |
| `Next` | `Ctrl+Alt+Right` | 下一曲 |
| `VolUp` | `Ctrl+Alt+Up` | 音量 +5% |
| `VolDown` | `Ctrl+Alt+Down` | 音量 -5% |

#### `[Hotkeys.Focus]` 焦点内热键

| 键 | 默认值 | 含义 |
| --- | --- | --- |
| `Toggle` | `Ctrl+P` | 暂停/播放 |
| `Quit` | `Ctrl+Q` | 退出程序 |
| `Prev` | `Ctrl+Left` | 上一曲（输入框内不触发） |
| `Next` | `Ctrl+Right` | 下一曲（输入框内不触发） |
| `VolUp` | `Ctrl+Up` | 音量 +5%（输入框内不触发） |
| `VolDown` | `Ctrl+Down` | 音量 -5%（输入框内不触发） |

> 热键值 = Electron accelerator 规范化子集；**空串 = 停用该热键（合法）**。修饰键固定序 `Ctrl+Alt+Shift+Super` 不重复，末段是键名。

#### `[Security]` 安全（仅主进程消费）

| 键 | 默认值 | 值域 | 含义 |
| --- | --- | --- | --- |
| `CredentialStore` | `auto` | `auto` / `keyring` / `memory` | 凭证存储策略（**没有明文档**） |
| `KeyringBackend` | `auto` | `auto` / `gnome-libsecret` / `kwallet6` / `kwallet5` / `kwallet` / `basic` | 仅 Linux：密钥环后端 |

#### `[Sparkle]` 插件

| 键 | 默认值 | 值域 | 含义 |
| --- | --- | --- | --- |
| `Blacklist` | `""` | 逗号分隔的 kebab-case 插件 id | 插件加载黑名单（空=不拉黑） |

#### `[Update]` 更新

| 键 | 默认值 | 值域 | 含义 |
| --- | --- | --- | --- |
| `AutoCheck` | `True` | 布尔 | 启动后自动检查更新 |
| `Channel` | `stable` | `stable` / `beta` / `nightly` | 更新渠道 |
| `LastNotified` | `""` | ≤128 字符 | 内部状态：已提醒/跳过的版本标识 |

### 3.3 值域校验器（`electron/config.ts`）

| 校验器 | 作用 | 规则 |
| --- | --- | --- |
| `isTheme` | 主题 | 内置三档，或 `KEBAB = /^[a-z0-9]+(?:-[a-z0-9]+)*$/` |
| `isHotkey` | 热键 | 空串合法；`HK_KEY` 键名子集 + `HK_MOD` 修饰键 + 不重复（与 `global-hotkeys.ts` 共用） |
| `isFontList` | 字体 | 不接受 `;{}`、换行、`url(` |
| `isHexColor` | 颜色 | `/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i`（必须带 `#`） |
| `isBackgroundImagePath` | 背景图 | 空合法；无 `\r\n\0`、≤1024 |
| `isPluginIdList` | 黑名单 | 无换行；每段匹配 `SPARKLE_ID_RE` |
| `isChineseConvert` | 繁简转换档 | `off`/`simplified`/`traditional` |
| `isTtmlDatabaseUrlTemplate` | TTML 模板 | 合法 http(s) URL 且含 `%s`；与渲染层 `lib/ttml.ts:isTtmlDatabaseUrl` 同规（改一处改两处） |
| `isIntOrEmpty` / `isBoolValue` | DL 坐标 / 通用布尔 | 空或整数；布尔统一集合 |
| 数值/布尔 | — | 各键内联：`Number.isFinite` 且区间内；布尔统一集合 |

**热键键名白名单**（`HK_KEY`）：`A-Z` / `0-9` / `F1`–`F24` / `Left` `Right` `Up` `Down` / `Space` `Tab` `Enter` `Escape` `Backspace` `Delete` `Insert` `Home` `End` / `PageUp` `PageDown` `/ Minus` `Equal` `Comma` `Period`。

**正则常量**：`SPARKLE_ID_RE = /^[a-z0-9][a-z0-9-]*$/`；`KEBAB`；`SECTION_RE`；`KV_RE`；`INLINE_RE`。

**其它导出**：`BG_IMAGE_EXTS = ["jpg","jpeg","png","webp","gif","bmp","avif"]`；`parsePluginIdList`；`IniDoc` 类；`schemaIndex()`；`defaults()`；`template()`；`readDoc()`；`readValues()`（返回 `{values, warnings}`，非法值回落默认并记 warning）；`writeValues(patch)`；`resetConfig()`；`configDir/configFile/credentialFile/credentialStoreFile/deviceFile/logFile/ensureConfigDir`。

### 3.4 渲染层配置门面（`src/lib/config.ts`）

| 名称 | 说明 |
| --- | --- |
| `LS_KEY` | `"quaver.conf.v1"`（浏览器 dev 兜底存储键） |
| `FALLBACK` | 与 SCHEMA 默认值一一对应的快照表（改一处要改两处） |
| `cfg(key, fallback="")` | **同步读一项** |
| `cfgSet(patch)` | 内存立即生效 + 立即落盘（只写变化键） |
| `cfgSetSoon(patch, ms=250)` | 高频项合并落盘（`pagehide`/`visibilitychange` 补 flush） |
| `loadConfig()` | 重新从磁盘装载（dev 钩子） |
| `configInfo()` | 返回 `{dir, path, bridged, writable}` |
| `revealConfig()` | 在文件管理器定位 quaver.conf |
| `resetConfig()` | 用模板重建（凭证文件不动） |
| `window.quaverConfig` | preload 桥（`boot`/`all`/`set`/`reset`/`reveal`），浏览器 dev 回落 localStorage |
| `window.__cfg`（仅 DEV） | `{all, get, set, info, reload}` |

> **关键点**：配置在启动时一次性读进内存（同步），之后所有 getter 都是同步的。`main.ts` 必须在 `applyTheme`/`applyFonts` 之前完成装载。

## 4. prefs：枚举 ⇄ 配置映射全表

`src/lib/prefs.ts` 是「内部枚举 ⇄ 配置取值」的唯一映射层，并负责即时生效。

### 4.1 主题

| 内部类型 | 配置取值 | 备注 |
| --- | --- | --- |
| `ThemeMode = system/light/dark` | `follow-system` / `light` / `dark` | `CONF_TO_THEME` / `THEME_TO_CONF`；未知主题名按「跟随系统」处理 |

- `getTheme()` / `setTheme()` / `effectiveTheme()`（系统档读 `prefers-color-scheme`）/ `applyTheme()`（写 `html[data-theme]`）。
- 监听 `matchMedia("(prefers-color-scheme: dark)")` 变化。

### 4.2 字体

| 名称 | 值 |
| --- | --- |
| `FONT_PRESETS` | `system`(空) / `sans` / `serif` / `mono`（含 CSS 族列表） |
| `FONT_LABELS` | 预设名 → 中文标签 |
| `FONT_CUSTOM` | `"custom"`（手填占位项） |

- `fontKeyOf`（配置值 → 预设名 / custom）、`normalizeFontList`（前端清洗，比后端更严）、`fontCssOf`（预设名简写展开）、`applyFonts()`（写 `--font-ui` / `--font-lyric`）。
- getter/setter：`getUiFont`/`getLyricFont`/`setUiFontList`/`setLyricFontList`/`setUiFontPreset`/`setLyricFontPreset`。

### 4.3 背景

| 类型 | 值 | 常量 |
| --- | --- | --- |
| `BackgroundMode` | `off` / `cover` / `custom` | `BG_BLUR_MIN=0`、`BG_BLUR_MAX=120`、`BG_BLUR_DEFAULT=70` |

- `getBackgroundMode`/`setBackgroundMode`/`getBackgroundImage`/`setBackgroundImage`/`getBackgroundBlur`/`setBackgroundBlur`（拖滑块用 `cfgSetSoon`）。

### 4.4 菜单毛玻璃

- `getMenuBlur()`（默认开，`False/0/no` 关）/ `setMenuBlur()`；DOM 侧在 `menu-glass.ts`。

### 4.5 高亮色（tint）

| 类型 | 值 |
| --- | --- |
| `TintMode` | `default` / `cover` / `system` / `custom` |
| `TINT_DEFAULT_COLOR` | `"#19c2d8"` |

- `getTintMode`/`setTintMode`/`getTintColor`（读回归一为小写 6 位，解析失败回落默认）/`setTintColor`（`cfgSetSoon(..., 200)`）。

### 4.6 窗口装饰 / 后端 / 设备 / 淡入淡出 / 音量

| 项 | 类型 | 值 | 常量 |
| --- | --- | --- | --- |
| 装饰 | `DecorMode` | `csd` / `ssd` | `applyDecor()` → `body.ssd` |
| 解码后端 | `DecodeBackend` | `MPV` / `Blink`（配置写 `Chromium`） | — |
| 音频设备 | string | `auto` 或 mpv 设备名 | — |
| 淡入淡出 | `FadePreset` | `off`/`short`/`normal`/`long` | `FADE_PRESETS`：off`{0,0}`、short`{150,120}`、normal`{400,250}`、long`{800,500}`（毫秒） |
| 音量 | number | `0`–`1` | `getVolume`/`setVolume`（合并落盘） |
| 静音 | boolean | — | `getMuted`/`setMuted` |

### 4.7 行为开关

| 项 | 类型 | 值 | 默认 |
| --- | --- | --- | --- |
| 上一首 | `PrevBehavior` | `replay` / `previous` | replay |
| 防睡眠 | boolean | — | 开 |
| 自动检查更新 | boolean | — | 开 |
| 更新渠道 | `UpdateChannel` | `stable` / `beta` / `nightly` | stable |
| 已提醒版本 | string | ≤128 | 空 |

### 4.8 歌词

| 类型 | 值 | 常量 |
| --- | --- | --- |
| `LyricAuxMode` | `off` / `translation` / `romanization` | `LYRIC_SCALE_MIN=0.7`、`LYRIC_SCALE_MAX=1.5`、`LYRIC_SCALE_STEP=0.1`、`LYRIC_AUX_MODES` |

### 4.9 热键

| 名称 | 值 |
| --- | --- |
| `HotkeyAction` | `toggle` / `prev` / `next` / `volup` / `voldown` / `quit` |
| `HotkeyScope` | `Global` / `Focus` |
| `HOTKEY_KEY_NAMES` | `{toggle:Toggle, prev:Prev, next:Next, volup:VolUp, voldown:VolDown, quit:Quit}`（VolUp/VolDown 多词必须显式列全） |
| `HOTKEY_LABELS` | 暂停/播放、上一曲、下一曲、音量加大、音量减小、退出 Quaver Music |
| `GLOBAL_HOTKEY_ACTIONS` | `[toggle, prev, next, volup, voldown]` |
| `FOCUS_HOTKEY_ACTIONS` | `[toggle, quit, prev, next, volup, voldown]` |

- `hotkeyConfKey(scope, action)` = `Hotkeys.${scope}.${键名}`；`getHotkey`/`setHotkey`；`acceleratorFromEvent(e)`（KeyboardEvent → 规范化 accelerator；裸键/无修饰键返回 `null`）。

### 4.10 Sparkle 黑名单

- `SPARKLE_ID_RE`（须与 `electron/config.ts` 一致）；`getSparkleBlacklist()`（去重保序，非法段丢弃）/`setSparkleBlacklist()`。

### 4.11 频谱（[Style] Spectrum / SpectrumMode）

- `getSpectrumEnabled()/setSpectrumEnabled()`；`BUILTIN_SPECTRUM_MODES = ["bars","mirror","wave"]`；模式 id 白名单 `/^[a-z0-9][a-z0-9-]{0,31}$/`（插件模式同表）。
- 应用侧三层：`spectrum-controller.ts`（偏好+模式表+Sparkle 门面；分析器与绘制器按需动态加载——频谱默认关，不为它付首屏成本）、`audio-spectrum.ts`（WebAudio FFT 采集）、`spectrum-render.ts`（内置三种形态）。插件模式经 `registerNowPlayingSpectrumMode` 注册，由 NowPlaying 统一挂载，与内置同一套渲染生命周期。

### 4.12 播放控制条 / 歌单模式（[Style] ControlBar / PlaylistMode）

- `getControlBarMode()`（bottom/floating）→ `applyControlBarMode()` 写 `body[data-control-bar]`：`lib/control-bar.ts` 宿主偏好与 `sparkle/theme-control-bar.ts` 主题策略合流后落 DOM。
- `getPlaylistMode()`（menu/collection）→ `applyPlaylistModeKind()` 写 `body[data-playlist-mode]`：`lib/playlist-mode.ts` + `sparkle/theme-playlist-mode.ts`。切换有淡出/淡入动画：`MODE_FADE_OUT_MS = 150` / `MODE_FADE_IN_MS = 180`（对齐 `.pl-mode-out`/`.pl-mode-in`）。

### 4.13 歌词增强（[Lyrics]）

- `getChineseConvert()/setChineseConvert()`（off/simplified/traditional）。**档位变化必须** `resetCjkConverter()` + `player.reloadLyric()`——管线在拉歌词时才判档，不重拉 = 假即时生效。
- `getOnlineTtml()`/`getTtmlDatabase()`/`getTtmlLibrary()` 及对应 setter；模板展开规则在 `lib/ttml.ts`。

### 4.14 桌面歌词（[DesktopLyrics]）

`get/setDesktopLyrics(Enabled)`、`get/setDesktopLyricsLocked`、`get/setDesktopLyricsOpacity`（`DL_OPACITY_MIN 0.1`/`DL_OPACITY_MAX 1`，悬停地板 `DL_HOVER_OPACITY_FLOOR 0.3`）、`get/setDesktopLyricsBackdrop`、`get/setDesktopLyricsScale`（0.5–2）、`get/setDesktopLyricsWeight`（100–900，默认 400）、`get/setDesktopLyricsFontList/FontPreset`、`get/setDesktopLyricsBorder`（0–4）、`get/setDesktopLyricsShadow(Blur/Opacity/X/Y)`（blur ≤32、偏移 ≤12）、`get/setDesktopLyricsMode`（single/dual）、`get/setDesktopLyricsSingleCenter`、`get/setDesktopLyricsColorMode/Color`。

## 5. CSS 变量全量参考

全部定义在 `src/style.css`。分四类：**(A) 主题色板**（明/暗两套，`html[data-theme]` 切换）、**(B) 浮层菜单玻璃令牌**（`html[data-menu-glass]` 三态）、**(C) 运行期 JS 写入**、**(D) 其它固定令牌**。

### A. 主题色板 `:root`（浅色）

| 变量 | 浅色值 | 用途 |
| --- | --- | --- |
| `--bg` | `#f7f7f8` | 页面底色 |
| `--card` | `#fff` | 内容卡 |
| `--side` | `#ececec` | 侧栏 |
| `--ink` | `#1f2329` | 主文字 |
| `--ink2` | `#6b7280` | 次文字 |
| `--ink3` | `#3c4048` | 三级文字 |
| `--acc` | `#2f7d5c` | 强调色 |
| `--hover` | `#e3e3e4` | 悬停底 |
| `--line` | `#d9d9db` | 分隔线 |
| `--cyan` | `#19c2d8` | 播放进度条青色（设计稿对齐） |
| `--panel` | `rgba(255,255,255,.72)` | 面板底 |
| `--panel-line` | `rgba(255,255,255,.4)` | 面板线 |
| `--glass` | `rgba(236,236,238,.62)` | 玻璃底 |
| `--glass-line` | `rgba(255,255,255,.35)` | 玻璃线 |
| `--ph` | `#e8e8ea` | 占位底 |
| `--ph2` | `#d5d5d7` | 占位底 2 |
| `--idx` | `#9aa0a6` | 索引/灰色文字 |
| `--row-hover` | `#f2f2f3` | 行悬停 |
| `--nav-active` | `#d8d8da` | 导航激活底 |
| `--nav-active-line` | `#c9c9cc` | 导航激活线 |
| `--sep` | `#bdbdc0` | 强分隔 |
| `--pill` | `rgba(247,247,248,.55)` | 胶囊底 |
| `--track` | `#cfcfd2` | 滑轨 |
| `--press` | `#0000000d` | 按压叠加 |
| `--tint-row` | `#e8f3ee` | 高亮行 |
| `--font-default` | `"Noto Sans CJK SC", system-ui, -apple-system, sans-serif` | 默认字体栈 |
| `--cvg-accent` | `var(--acc)` | 封面染色（UI 高亮） |
| `--cvg-glow` | `var(--cyan)` | 封面染色（辉光） |
| `--ambient-blur` | `70px` | 环境色层模糊（CSS 兜底） |
| `--ambient-scale` | `1.15` | 环境色层扩边 |

### A. 主题色板 `html[data-theme="dark"]`（深色）

| 变量 | 深色值 |
| --- | --- |
| `--bg` | `#131417` |
| `--card` | `#232529` |
| `--side` | `#1b1d21` |
| `--ink` | `#e6e8ec` |
| `--ink2` | `#a6adb8` |
| `--ink3` | `#c3c8d0` |
| `--acc` | `#6cc79c` |
| `--hover` | `#2e3138` |
| `--line` | `#3a3d45` |
| `--panel` | `rgba(26,28,33,.74)` |
| `--panel-line` | `rgba(255,255,255,.07)` |
| `--glass` | `rgba(30,32,37,.62)` |
| `--glass-line` | `rgba(255,255,255,.08)` |
| `--ph` | `#2b2e34` |
| `--ph2` | `#34373e` |
| `--idx` | `#767c85` |
| `--row-hover` | `#26292f` |
| `--nav-active` | `#31343b` |
| `--nav-active-line` | `#3f434b` |
| `--sep` | `#43464e` |
| `--pill` | `rgba(32,34,39,.55)` |
| `--track` | `#43464e` |
| `--press` | `#ffffff12` |
| `--tint-row` | `#1e3129` |
| `color-scheme` | `dark`（另有，非变量） |

### B. 浮层菜单玻璃令牌（唯一来源：`html[data-menu-glass]`）

默认（`on` / 未设）：

| 变量 | 浅色 | 深色 | `.np`（正在播放页覆盖） |
| --- | --- | --- | --- |
| `--menu-filter` | `blur(16px) saturate(1.4)` | 同 | 同 |
| `--shell-filter` | `blur(12px) saturate(1.3)` | 同 | 同 |
| `--menu-surface` | `rgba(246,246,248,.66)` | `rgba(30,32,38,.62)` | `rgba(16,19,28,.62)` |
| `--menu-line` | `var(--glass-line)` | 同 | `rgba(255,255,255,.16)` |
| `--menu-shadow` | `0 12px 36px rgba(15,20,30,.22)` | `0 12px 36px rgba(0,0,0,.46)` | `0 12px 36px #0006` |
| `--menu-edge` | `rgba(255,255,255,.5)` | `rgba(255,255,255,.08)` | `rgba(255,255,255,.1)` |

关闭态 `html[data-menu-glass="off"]`：

| 变量 | 值 |
| --- | --- |
| `--menu-filter` / `--shell-filter` | `none`（而非 `blur(0px)` —— 后者仍建 backdrop root、仍占 GPU） |
| `--menu-surface` | `var(--card)` |
| `--menu-line` | `var(--line)` |
| `--menu-edge` | `transparent` |
| `html[data-menu-glass="off"] .np` | `--menu-surface:#14171f`、`--menu-line:#ffffff1f`、`--menu-edge:transparent` |

> 消费点（八处浮层 + 模态弹窗）：`.ctx-menu`（侧栏歌单/歌曲右键菜单）、`.pb-qpop`（音质）、`.pb-lpop`（播放模式）、`.pb-volpop`（音量）、`.np-menu`（正在播放页更多操作）、`.np-qinfo`（音频流信息）、`.tint-pop`（颜色选择器）、`.queue-panel.float`（浮窗播放列表）；模态弹窗 `.upd-dialog`（更新/本地插件/插件设置）也吃同组令牌。侧栏与 Content View 复用 `--shell-filter`（关闭档实底），不用菜单表面令牌。

### C. 运行期由 JS 写入的变量

| 变量 | 写入者 | 用途 |
| --- | --- | --- |
| `--side-w` | `shell.ts` | 侧栏宽度（拖拽写入） |
| `--qp-w` | `QueuePanel.ts` | 队列面板宽度 |
| `--pf` | `PlayerBar.ts` | 进度条填充比例 |
| `--v` | `PlayerBar.ts` | 音量百分比/滑块 |
| `--w` | `UpdateDialog.ts` | 更新进度 |
| `--mx`、`--md` | `NowPlaying.ts` | 跑马灯位移/时长 |
| `--np-ly-scale` | `NowPlaying.ts` | 歌词缩放 |
| `--ambient-blur`、`--ambient-scale` | `lib/ambient.ts` | 环境色层模糊/扩边 |
| `--font-ui`、`--font-lyric` | `lib/prefs.ts` | 界面/歌词字体 |
| `--cvg-accent`、`--cvg-glow`、`--cvg-bar-fill`、`--cvg-bar-line`、`--np-hl` | `lib/tint.ts`（`TINT_VARS`） | 封面/系统/自定义染色 |
| `--stuck-h` | `views/_shared.ts` | 吸顶栏高度 |
| `--stuck-cover` | `style.css` | 吸顶封面渐变（固定） |
| `--route-pad-top` | `style.css .route` | 路由内容上内边距，`6px` |
| `--amll-lp-color` / `--amll-lp-font-size` / `--amll-lp-hover-bg-color` | AMLL 插件消费 | 逐字歌词样式 |
| `--sparkle-pack-ink` | Sparkle 主题包 | 主题包文字色 |
| `--cvg-`、`--menu-` | 前缀族（见上） | — |

**`@property` 注册**（可被 transition 插值）：

```css
@property --cvg-accent { syntax: "<color>"; inherits: true; initial-value: #2f7d5c; }
@property --cvg-glow   { syntax: "<color>"; inherits: true; initial-value: #19c2d8; }
```

`:root` 上 `transition: --cvg-accent .45s ease, --cvg-glow .45s ease` —— 换曲染色全局平滑过渡。

### D. 其它固定令牌

| 变量 | 值 | 说明 |
| --- | --- | --- |
| `--stuck-cover` | 渐变（`linear-gradient(to bottom, …)`） | 吸顶封面 |
| `--route-pad-top` | `6px` | 见上 |
| `--danger` | 危险色（`.sparkle-local--danger` 等使用） | — |
| `--quiet` | 次级按钮/文字 | — |
| `--split` | 区块头变体（`.sec-head--split`） | — |
| `--m-delay` | 跑马灯延迟（默认 `1.2s`） | — |
| `--volpop` | 音量浮窗底片（历史值 `0.78~0.85`） | — |
| `--control-bar-*` | 播放控制条悬浮态令牌（`--control-bar-width` 默认 720、`--control-bar-height`、`--control-bar-inset`、`--control-bar-lift`、`--control-bar-gap` 等） | Sparkle 主题可接管外观 |
| `--top-band-h` | `42px` | 内容区顶带（CSD 按钮簇/搜索框行）高度；吸顶收口折点共用 |
| `--dl-opacity` | 桌面歌词层不透明度（覆盖层页 `#dl-clip`/`#dl-empty`） | `[DesktopLyrics] Opacity` |

---

## 6. data-* 属性与 DOM 状态

| 属性 | 挂载元素 | 取值 | 写入者 | 说明 |
| --- | --- | --- | --- | --- |
| `data-theme` | `<html>` | `light` / `dark` | `prefs.applyTheme()` | 驱动色板变量组 |
| `data-menu-glass` | `<html>` | `on` / `off` / `theme` | `lib/menu-glass.ts` | 菜单玻璃三态（theme = 让位给插件主题） |
| `data-mode` | `.ambient` | `off` / `cover` / `custom` / `theme` | `lib/ambient.ts` | 环境色层模式（theme = 让位给插件主题） |
| `data-sparkle-theme` | `<html>` | 插件主题 id | `sparkle/host.ts` | 激活的插件主题（CSS 覆盖作用于 `html[data-sparkle-theme="<id>"]`） |
| `data-sparkle-scheme` | `<html>` | 主题声明的配色方案 | `sparkle/*` | 插件主题配色 |
| `data-control-bar` | `<body>` | `bottom` / `floating` | `lib/control-bar.ts`（+ `sparkle/theme-control-bar.ts`） | 播放控制条停靠形态 |
| `data-playlist-mode` | `<body>` | `menu` / `collection` | `lib/playlist-mode.ts`（+ `sparkle/theme-playlist-mode.ts`） | 歌单呈现方式（collection 时 `/playlists` 入口显示、侧栏歌单列表隐藏） |
| `body.ssd` | `<body>` | class | `prefs.applyDecor()` | 系统标题栏模式 |

**其它常见 DOM 数据属性**（组件内部）：`data-win="min|max|close"`、`data-route`、`data-songkey`、`data-tab`、`data-sort`、`data-mode="off|all|one"`（循环）、`data-scope`/`data-action`（热键）、`data-i`（搜索建议）、`data-hint`、`data-act`（弹窗按钮）。


## 7. localStorage 键全量

> 桌面端配置走 `quaver.conf`；localStorage 存的是「与 origin 无关或浏览器 dev 兜底」的状态。

| 键 | 内容 | 写入者 |
| --- | --- | --- |
| `quaver.conf.v1` | 配置快照（浏览器 dev 兜底 / 桌面端不写） | `lib/config.ts` |
| `quaver.loved.v1` | 「我喜欢」本地集合 | `player.ts` |
| `quaver.loved.writes.v1` | 收藏写回队列 | `player.ts` |
| `quaver.search.history.v1` | 搜索历史（上限 10） | `SearchBox.ts` |
| `quaver.session.v1` | 播放会话存档（队列上限 500）；本地曲队列携带 `local` 指纹（`{id,kind,hasCover,path,sourceName,qqMid,lyricImport}`，`slim` 原样透传） | `lib/session.ts` |
| `quaver.lyricDelay.v1` | 按歌曲的歌词同步微调（mid → 毫秒；0.1s 步进 ±10s；0 删条目） | `lib/lyric-delay.ts` |
| `quaver.songlist.writes.v1` | 歌单增量写回队列 | `lib/songlist-detail.ts` |
| `quaver.sparkle.enabled.v1` | 已启用插件 id | `sparkle/host.ts` |
| `quaver.sparkle.official-known.v1` | 已识别的官方插件 id | `sparkle/host.ts` |
| `quaver.sparkle.official-off.v1` | 被关掉的官方插件 id | `sparkle/host.ts` |
| `quaver.sparkle.theme.v1` | 激活的插件主题 id | `sparkle/host.ts` |
| `quaver.sparkle.style.pack.v1` | 激活的主题包 id | `sparkle/style-layer.ts` |
| `quaver.sparkle.style.variant.v1` | 激活的主题包变体 id | `sparkle/style-layer.ts` |
| `quaver.sparkle.style.suspended.v1` | 风格层是否挂起（`"1"`） | `sparkle/style-layer.ts` |
| `quaver.sparkle.tint.v1` | 主题的 tint 预设选择 | `sparkle/theme-tint.ts` |


## 8. IPC 通道与 preload 桥

### 8.1 IPC 通道（`quaver:*`）

| 通道 | 方向 | 用途 |
| --- | --- | --- |
| `quaver:config` | invoke | 配置读写（all/set/reset/reveal） |
| `quaver:config-sync` | **sendSync** | 启动时同步取配置快照（含 crotchet/redflag 标志） |
| `quaver:config-changed` | event | 任意窗口写盘成功后广播 `{keys,values}` 增量 / `{all:true}` 重置（多窗共用 quaver.conf 的同步口） |
| `quaver:audio` / `quaver:audio-event` | invoke / event | 音频引擎控制与事件 |
| `quaver:background` | invoke | 背景图选图/回显 |
| `quaver:close-action` | — | 关闭按钮行为 |
| `quaver:credential-info` | invoke | 凭证/密钥环信息 |
| `quaver:credits-open` | invoke | 开源致谢：仓库链接交系统浏览器 |
| `quaver:decor` | — | 窗口装饰 |
| `quaver:devtools` / `quaver:metrics` | invoke | 开发者控制台开关 / 进程与内存自检（主进程 + Linux /proc 拍平） |
| `quaver:dl-track` / `quaver:dl-sync` / `quaver:dl-control` / `quaver:dl-active` / `quaver:dl-cmd` / `quaver:dl-window` | send/invoke/sendSync/event | 桌面歌词：主窗→覆盖层镜像（track/sync）、覆盖层→主窗/主进程命令与窗口操作、激活状态同步 |
| `quaver:flush-session` | — | 会话落盘 |
| `quaver:fullscreen-state` | event | 全屏状态 |
| `quaver:hotkey` / `quaver:hotkeys-info` / `quaver:hotkeys-info-sync` | event / invoke / sendSync | 全局热键回程 / 信息 |
| `quaver:local` | invoke | 本地曲库：`pick-folder`（原生选目录）/ `reveal`（**只收曲目 id**，主进程现读库反查路径再 `shell.showItemInFolder`） |
| `quaver:mpris` / `quaver:mpris-cmd` | — | MPRIS 状态 / 命令回程 |
| `quaver:quit` | — | 退出 |
| `quaver:sparkle` | invoke | 插件安装/卸载/市场/本地 |
| `quaver:update` / `quaver:update-progress` | invoke / event | 更新（进度按整百分比节流推送） |
| `quaver:win` / `quaver:win-sync` / `quaver:window` | — | 窗口控制 |

### 8.2 preload 桥（`contextBridge.exposeInMainWorld`）

`electron/preload.cts`（**必须是 `.cts`**）暴露：

| 全局对象 | 能力 |
| --- | --- |
| `window.quaverCSD` | `setDecor`（自绘标题栏控制） + 全屏扩展桥（`lib/fullscreen.ts` 消费） |
| `window.quaverHotkeys` | 全局热键注册/回程 |
| `window.quaverMpris` | MPRIS 桥 |
| `window.quaverDesktopLyrics` | 桌面歌词：主窗侧 `sendTrack/sendSync/control/activeSync/onActive/onCmd`；覆盖层侧 `onTrack/onSync/sendCmd/windowOp` |
| `window.quaverConfig` | `boot`/`all`/`set`/`reset`/`reveal`/`onChanged`（多窗配置同步） |
| `window.quaverDebug` | `devtools(msg)` / `metrics()`（设置→通用→调试） |
| `window.quaverCredits` | `open(url)` |
| `window.quaverSecurity` | 安全/凭证信息 |
| `window.quaverBackground` | `pick()` / `info()` |
| `window.quaverLocal` | `pickFolder()` / `reveal(id)`；音频/封面/歌词本体走同源 `/api/local/*`，不经这里 |
| `window.quaverSparkle` | `list`/`install`/`uninstall`/`market`/`pickLocal`/`installLocal` |
| `window.quaverUpdate` | `invoke(msg)` / `onProgress(cb)` |
| `window.quaverAudio` | 音频引擎控制（浏览器 dev 下不存在 → 回落 `<audio>`） |
| `window.quaverCrotchet` | boolean（调试/内嵌调试端口；随 config-sync 快照下发） |
| `window.quaverRedflag` | boolean（安全模式 `QUAVER_REDFLAG`；随 config-sync 快照下发） |

## 9. HTTP API 端点

渲染层调用一律走同源 `/api` 中继（`src/relay.ts`，dev/preview 与打包态 `native-server.ts` 同一套），转发到 sidecar `:3200`。**响应信封**：`{code:0,msg:"ok",data:...}`；错误 `{code:-1,msg:...}` + HTTP 状态。

### 9.1 中继特殊处理（不经纯透传）

| 路径 | 说明 |
| --- | --- |
| `/api/img` | 封面代理（`IMG_PATHS` 白名单：`/music/photo_new/`、`/music_cover/`、`/music/a_`；`IMG_HOSTS` 白名单：`y.gtimg.cn`、`qpic.y.qq.com`、`img.y.gtimg.cn`、`pictax.qpic.cn`） |
| `/api/log` | 读取 `electron-dev.log`（尾部，`?tail=`） |
| `/api/bg` | 背景图（`backgroundResponse()`，路径来自配置 + 扩展名白名单 + 40MB 上限） |
| `/api/accent` | 系统强调色（`accentPayload()`） |
| `/api/sparkle/plugin/<id>/<file>` | 插件静态文件（`SPARKLE_ID_RE` + 目录逃逸防护） |
| `/api/local/*` | 本地/NAS 曲库（`electron/local/library.ts:handleLocalApi`；dev=relay.ts、打包=native-server.ts **两处同构挂载**，且必须早于 sidecar 兜底转发。全量表见 §9.3） |

### 9.2 透传端点

登录/用户：`/login/status`、`/login/logout`、`/login/qrcode/{channel}`、`/login/qrcode/{channel}/status`、`/user/me`、`/user/vip`、`/user/liked`、`/user/fav-songlists`、`/user/created-songlists`。

推荐/搜索：`/recommend/daily`、`/recommend/guess`、`/recommend/newsong`、`/recommend/songlist`、`/recommend/ai-songlist`（AI 歌单）、`/search`、`/search/complete`、`/search/hotkey`。

榜单：`/top/category`（榜单分类）、`/top/{id}/detail`（`?page=&num=&period=`；期次取值见 `lib/toplist-periods.ts`）。

歌曲/歌单/专辑/歌手：`/song/like`、`/song/unlike`、`/song/{mid}/lyric`、`/songlist/{id}/detail`、`/songlist/{id}/songs`、`/songlist/{id}/like`、`/album/{mid}/detail`、`/album/{mid}/songs`、`/singer/{mid}/info`、`/singer/{mid}/desc`、`/singer/{mid}/songs`、`/singer/{mid}/albums`。

流：`/stream/resolve`、`/stream/tiers`、`/stream/{token}`、`/inhibit`。

### 9.3 本地曲库端点（`/api/local/*`，`feat/herta/local-nas-track` 新增）

读盘/扫描/刮削/流服务真相在 `electron/local/library.ts`（零 electron、纯 Node；标签解析在 `electron/local/tags.ts`，WebDAV 客户端在 `electron/local/webdav.ts`）。信封与 §9 一致。**曲目 id** = `t_` + sha1(sourceId\u0000relPath) 前 12 hex；**源 id** = `s_` + 8 hex。所有 GET/POST 只认 id，路径只从库文件来。

| 方法与路径 | 入参 | 行为 |
| --- | --- | --- |
| `GET library` | — | `{sources(剔除 password + trackCount), tracks[], stats{tracks,matched,withCover,withLyric}, scan, scrape}` |
| `GET track/<id>` | — | 单曲记录（会话恢复/右键刷新用） |
| `POST source/add` | `{kind:"folder"\|"webdav", name, path?\|url?, username?, password?}` | folder 验目录存在；webdav 先 PROPFIND 探测（连不通 = 502 拒存） |
| `POST source/remove` | `{id}` | 连带清出该源曲目与封面/歌词缓存（磁盘文件不动） |
| `POST scan` / `GET scan` | — | 后台扫描（单飞）/ 进度 `{running,processed,found,kept,removed,errors[],lastError}` |
| `POST scrape` / `GET scrape` | `{ids?,all?,force?}` | 在线刮削队列（单飞、串行 +250ms 限速）/ 进度 `{running,total,processed,matched,unmatched,failed}` |
| `GET\|HEAD stream/<id>` | `Range` | folder=createReadStream+206/416；webdav=上游 Range 代理（上游无视 Range 回全量时本地掐头去尾） |
| `GET\|HEAD cover/<id>` | — | 封面副本字节（**no-store**：同 id 原地换图 URL 恒定） |
| `GET lyric/<id>` | — | `{lyric,trans,roma,source,format}`；优先级 **手动 import > sidecar .lrc > 在线刮削缓存(qq) > 内嵌(embed)** |
| `POST lyric/import` | `{id,name,data(base64)}` | ≤512KB；`sniffLyricFormat` 按内容嗅 lrc/qrc/ttml；导入恒胜（重扫不冲掉） |
| `DELETE lyric/import/<id>` | — | 撤销导入，按现存资产回退一档 |
| `GET ttml` | `?mid=`（或同义入参） | 本地 TTML 歌词库（`[Lyrics] TtmlLibrary`）：目录只吃 quaver.conf（同 `/api/bg` 红线）；候选序 `qq-lyrics/<songmid>.ttml` → id 平铺 → 歌名-歌手变体；命中返回 TTML 内容 |
| `POST cover/import` | `{id,name,data(base64)}` | ≤8MB；`imageFormat` 魔数验 jpg/png/gif/webp；`coverManual=true` |
| `POST meta/set` | `{id,title?,artist?,album?}` | 校正刮削用曲名/歌手/专辑（至少填一项），置 `editedMeta`，展示与在线搜索都吃这份 |
| `GET status` | — | 轻查询 `{configured,...stats,scanning,scraping}` |

**刮削（scrape）**：`GET /search?keyword=曲名 歌手`（走 `QUAVER_API` sidecar）→ 打分（歌名吻合是硬门槛，宁缺毋滥）→ 命中落 `match{qqMid,singerMid,albumMid,albumPmid,coverQq,lyricQq}` + `lyrics/<id>.json`（trans/roma 同缓存）+ 无内嵌封面时下载 `y.gtimg.cn` 专辑封面。扫描收尾发现新歌（`found>0`）自动补一轮未匹配刮削。**用户校正过（`editedMeta`）的展示字段恒不被回填**；手动导入的歌词/封面恒不被自动来源覆盖。

## 10. 环境变量全量

| 变量 | 默认 | 用途 |
| --- | --- | --- |
| `QUAVER_CONFIG_DIR` | 平台默认 | 覆盖配置目录（主进程下发给 sidecar，两边规则须一致） |
| `QUAVER_API` | `http://127.0.0.1:3200` | sidecar 地址 |
| `QUAVER_SPARKLE_DIR` | `<配置目录>/plugins` | 插件安装根 |
| `QUAVER_REDFLAG` | 空 | 安全模式（红标），经 preload 下发 `quaverRedflag` |
| `QUAVER_CROTCHET` | 空 | 调试/内嵌调试端口 |
| `QUAVER_MPV` | 空 | 显式指定 mpv 可执行体（优先于随包/PATH） |
| `QUAVER_MPV_ARGS` | 空 | 追加 mpv 参数 |
| `QUAVER_FFMPEG` | 空 | ffmpeg 路径 |
| `QUAVER_AUDIO_SINK` / `QUAVER_AUDIO_DIR` / `QUAVER_AUDIO_BACKEND` / `QUAVER_AUDIO_DEVICE` | 空 | 音频相关 |
| `QUAVER_CREDENTIAL_MODE` | 空 | `external` = 走 stdin 凭证交接（`QCRED1 {json}`） |
| `QUAVER_PORT` | — | 端口 |
| `QUAVER_KEEP_MEDIATOR` | — | 保留 mediator |
| `QUAVER_URL` | — | 加载 URL |

**版本号来源**：`__APP_VERSION__`（vite 构建期 define，dev 态取 `git describe`，见 `vite.config.ts:appVersion()`）；打包态取 `app.getVersion()`（= `package.json.version`）。

## 11. 常量与魔法数字（按模块）

### 11.1 播放器 `src/player.ts`

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `LS_KEY` | `quaver.loved.v1` | 收藏本地集合 |
| `LS_WRITES_KEY` | `quaver.loved.writes.v1` | 写回队列 |
| `LOVED_PAGE` | `500` | 收藏回源页大小 |
| `LOVED_MAX` | `1000` | 本地收藏上限 |
| `LOVED_TTL` | `60_000` | 收藏新鲜期 |
| `LOVED_SYNC_DELAY` | `2_000` | 写后回源静默期 |
| `LOVED_SYNC_PAGE` | `100` | 增量窗口 |
| `LOVED_PENDING_TTL` | `120_000` | 待确认写回 TTL |
| `SESSION_EVERY` | `5000` | 会话落盘间隔 |

内部状态字段：`queueVersion`、`loveVersion`、`likedAt`、`lovedListVersion`、`lovedSyncTries`、`_vol`（默认 0.8）、`lyricSeq`、`playSeq`（竞态令牌）、`failStreak`（自动跳曲连续失败）、`lastPrevPressAt`、`pendingSeek`、`savedPos`、`sessionAt`。

### 11.2 传输层 `src/lib/transport.ts`

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `EXTRAP_CAP_SEC` | `0.35` | 进度外推上限（秒） |
| `TransportKind` | `engine` / `web` | 两种实现 |

内部：`posAt`、`frozen`（连续不动采样数 ≥2 → 冻结外推）。

### 11.3 音质与档位 `src/lib/api.ts` / `src/lib/songtiers.ts`

`QUALITIES`（档位 id → 展示名）：

| id | 名称 |
| --- | --- |
| `96ogg` | 流畅音质 (OGG) |
| `128` | 标准音质 |
| `192ogg` | 高品质 HQ (OGG 192) |
| `320` | 高品质 HQ |
| `320ogg` | 高品质 HQ (OGG) |
| `flac` | 无损 SQ |
| `640ogg` | 无损 SQ (OGG) |
| `atmos2` | 臻品音质 2.0 |
| `atmos51` | 臻品全景声 5.1 |
| `atmos71` | 臻品全景声 7.1 |
| `master` | 臻品母带 |

`QUALITY_SHORT`（短标签）：`auto 自动`、`96ogg 流畅·Ogg`、`128 标准`、`192ogg HQ192·Ogg`、`320 HQ`、`320ogg HQ·Ogg`、`flac SQ`、`640ogg SQ·Ogg`、`atmos2 臻品`、`atmos51 全景`、`atmos71 全景7.1`、`master 母带`。

其它：`RESOLVE_TIMEOUT_MS = 12000`（取链超时）；`writeSongType(type) = max(0, type-1)`（**读侧 type=1 → 写侧必须发 0**）；`getQuality`/`setQuality`/`getSessionQuality`/`setSessionQuality`/`effectiveQuality`。

`SIZE_NEW_INDEX`（`file.size_new` 数组位置 → 档位）：`{master:0, atmos2:1, atmos51:2, "320ogg":3, "640ogg":5, atmos71:6}`；`SIZE_FIELD`（命名 size 字段 → 档位）：`{128:size_128mp3, 320:size_320mp3, flac:size_flac, 192ogg:size_192ogg, 96ogg:size_96ogg}`；`SONG_TIER_SIZE_KEYS`（会话存档瘦身保留字段）。

### 11.4 其它 lib 常量

| 模块 | 常量 | 值 |
| --- | --- | --- |
| `lib/vip.ts` | `SH_MS` / `DAY_MS` | `8*3600_000` / `86400_000` |
| `lib/vip.ts` | `VIP_RENEW_HINT` | 「如需续费/订阅，请前往 QQ 音乐官方客户端」 |
| `lib/accent.ts` | `ACCENT_ROUTE` / `POLL_MS` | `/api/accent` / `10_000` |
| `lib/ambient.ts` | `BG_ROUTE` / `COVER_SIZE` / `SCALE_AT_70` | `/api/bg` / `300` / `0.15` |
| `lib/tint.ts` | `COVER_SIZE` / `TINT_VARS` | `300` / `["--cvg-accent","--cvg-glow","--cvg-bar-fill","--cvg-bar-line","--np-hl"]` |
| `lib/color.ts` | `CACHE_MAX` | `256` |
| `lib/inhibit.ts` | `HEARTBEAT_MS` / `MODES` | `30_000` / `["sleep","idle"]` |
| `lib/session.ts` | `KEY` / `MAX_QUEUE` | `quaver.session.v1` / `500` |
| `lib/favs.ts` | `PAGE_SIZE` / `MAX_PAGES` | `100` / `5`（至多 500） |
| `lib/playlists.ts` | `LOVED_DIRID` | `201` |
| `lib/songlist-detail.ts` | `DETAIL_TTL` / `SYNC_DELAY` / `SYNC_PAGE` / `PENDING_TTL` / `LS_WRITES_KEY` | `60_000` / `2_000` / `100` / `120_000` / `quaver.songlist.writes.v1` |
| `lib/update-core.ts` | `GITHUB_REPO` | `team-quaver/quaver-music` |
| `lib/streaminfo.ts` | `CACHE_MAX` | `32` |
| `lib/hotkeys.ts` | `VOLUME_STEP` | `0.05` |
| `mpris.ts` | `HEARTBEAT_MS` | `5000` |
| `lib/lyric-delay.ts` | `LYRIC_DELAY_STEP_MS` / `LYRIC_DELAY_MAX_MS` | `100` / `10_000`（步进 0.1s、±10s，0 删条目） |
| `lib/ttml.ts` | `MISS_TTL_MS` | `10 * 60 * 1000`（在线 TTML 未命中负缓存） |
| `lib/lyric-delay.ts` 持久化键 | `quaver.lyricDelay.v1` | `mid → 毫秒`（本地曲 mid = `local:<trackId>`，同为稳定身份键） |
| `fake-audio.ts` | `SAMPLE_RATE` / `CYCLES` / `AMPLITUDE` / `VOLUME` / `RETRY_MS` | `8000` / `4` / `32` / `0.01` / `1000` |
| `shell.ts` | `nav`（6 项：含 `/playlists`）/ `icons` / `routeStack` / `state` | 导航数组 / 图标表 / 路由栈 |
| `views/index.ts` | `loaders` / `loaded` / `inFlight` / `appRoutes` | 懒加载表 / 已解析缓存 / 预取在途 / 宿主自有路由 |
| `lib/reorder.ts` | `zone` / `max` | `28` / `14` |
| `lyric.ts` | `TS`（时间戳正则） | `/\[(\d{1,2}):(\d{2})(?:[.:](\d{1,3}))?]/g` |

### 11.5 组件常量

| 组件 | 常量 | 值 |
| --- | --- | --- |
| `SearchBox` | `HISTORY_KEY` / `HISTORY_MAX` / `KIND_ICON` | `quaver.search.history.v1` / `10` / 图标映射 |
| `QueuePanel` | `DOCK_MIN_CONTENT` / `SQUEEZE_MS` / `SETTLE_MS` / `DRAG_THRESHOLD` | `880` / `180` / `200` / `6` |
| `SongMenu` | `VIEW_PAD` / `SUB_GAP` / `SUB_GRACE_MS` | `8` / `4` / `150` |
| `ListTools` | `COLLATOR` / `INPUT_DEBOUNCE_MS` | `Intl.Collator("zh-Hans-CN", {numeric,sensitivity:base})` / `120` |
| `NowPlaying` | `MENU_CLOSE_MS` | `140` |
| `resizer` | `MOVE_THRESHOLD` | `3` |
| `LocalPluginDialog` | 确认延迟 | `5s` |
| `DebugDialog` | 数据源 | `quaver:metrics`（主进程 `app.getAppMetrics` + Linux /proc；CPU 列首采样必为 0） |
| `CreditsDialog` | 数据源 | `quaver:credits-open`（仓库链接交系统浏览器） |
| `PlayerBar` | `LOOP_MODES` | 顺序 `off` / 列表循环 `all` / 单曲循环 `one` |


### 11.6 本地曲库 `electron/local/*` + `src/lib/local.ts`

| 模块 | 常量 | 值 |
| --- | --- | --- |
| `local/library.ts` | `TAG_WINDOW` / `TAG_WINDOW_BIG` / `ID3_MAX` | `256KB` / `8MB` / `20MB`（标签读窗口与扩窗、ID3v2 尺寸止损） |
| `local/library.ts` | 目录名 | `local-library`（covers/ lyrics/ library.json） |
| `local/library.ts` | folder 深度 / webdav 深度 / 文件数错误上限 | `8` / `7` / `50` |
| `local/library.ts` | 歌词/封面导入上限 | `512KB` / `8MB` |
| `local/library.ts` | 内嵌封面落盘区间 / QQ 封面下载上限 | `64B..20MB` / `8MB`（JPEG magic 校验） |
| `local/library.ts` | 刮削节奏 | 每曲 `sleep(250ms)`；单请求 `AbortSignal.timeout(15000)`；每 8 曲落一次盘 |
| `local/library.ts` | 扫描让出 | folder 每 16 文件、webdav 每 4 文件 `setImmediate`；id 正则 `t_[0-9a-f]{12}` / `s_[0-9a-f]{8}` |
| `local/tags.ts` | `AUDIO_EXT_SET` | mp3 flac ogg oga opus m4a m4b aac wav aif aiff ape wv mpc dsf dff mp2 |
| `src/lib/local.ts` | 进度轮询 | `900ms`（scan/scrape 任一在跑时） |

## 12. 播放器、传输层与音质

- 播放器是模块级单例：`src/player.ts` `export const player`（各视图/组件直接 import；DEV 下另挂 `window.__player` 供 e2e）。**没有** `window.QuaverPlayer`。
- **音质会话覆盖**：播放条选择的档位是会话级（`sessionQuality`，不写 localStorage，重启回设置页默认）；选择永远带 `auto_downgrade`（高档不可及沿回退链降到最优可播档，绝不 403 卡死）。
- **档位存在性**：`missingTiersOf()` 隐藏上游确认无源的档；`auto` 永远保留；会员锁定档仍展示 🔒 交给自动回退。
- **收藏写接口的 songType 陷阱**：读接口 `Song.type` 普通歌曲 = `1`，写接口必须发 `0`（`writeSongType`）；发 1 会「静默成功但什么都没发生」。
- **睡眠抑制执行端**在 sidecar：Linux = xdg 门户 Suspend 位（门户假成功走 Logind 直连）；Windows = `PowerRequestSystemRequired`；macOS = `IOKit PreventUserIdleSystemSleep`。渲染层经 `lib/inhibit.ts` 驱动。
- **假音轨**（`fake-audio.ts`）：维持系统媒体会话（SMTC 等），与用户音量完全解耦。
- **桌面歌词是独立覆盖层窗**（`electron/desktop-lyrics.ts` + `desktop-lyrics.html`/`src/desktop-lyrics.ts`）：不持有播放器，主窗 player 是唯一事实源，`lib/desktop-lyrics.ts` 单向上行镜像（track/sync），控制与窗口操作走 `quaver:dl-*` 通道；几何公式在 `lib/desktop-lyrics-layout.ts`（纯函数、有真单测）。
- **MPRIS 真相在主进程**（`electron/mpris.ts`，`mpris-service@2.1.2`；已从外部 daemon 迁回主进程）：`src/mpris.ts` 只是渲染层桥，状态上行 + 命令回程（`quaver:mpris`/`quaver:mpris-cmd`）。
- **本地/NAS 曲目**（`Song.local` 指纹判 `isLocalSong`）：`mid = "local:" + 库 id`（队列/收藏键位命名空间隔离）；取流 = 同源 `/api/local/stream/<id>`（不过 Sparkle/QQ resolve，档位标 `local`/`nas`，胶囊显「本地文件/NAS 流」）；无档位回退链（流失败=直接跳下一曲）；红心 `toggleLove`、换音质 `switchQuality`、预取 `prefetchSong` 全短路；封面走 `coverUrl` 本地分支（`hasCover=false` 回空串），重导封面经 `api.ts:bumpLocalCover` 带 `?v=` 穿透按-URL 缓存。
- **本地曲歌词优先级**：官方曲恒走在线 QRC 管线（`pullQqLyric`）；本地曲**未手动导入且刮削命中（`local.qqMid`）时优先复用同一条在线管线**（qrc=1 → 无 provider/解析失败回退行级 LRC），拿不到内容才落 `/local/lyric`（import > sidecar .lrc > qq 缓存 > embed）。库快照落定 `refreshLocalCurrent` **恒 notify**（不按指纹相等早退），qqMid 到手/导入翻转时自动补拉（`fetchLyric` 的 seq 守卫防竞态）。

## 13. Sparkle 插件系统

Sparkle 是 Quaver 的插件系统。SDK 类型契约在 `vendor/Sparkle/sdk/types.ts`（纯类型、无运行时依赖，773 行）。

### 13.1 插件契约

```ts
export type PluginKind = "official" | "third-party";
export interface SparklePlugin {
  id: string;              // kebab-case 全局唯一；第三方必须与安装目录名一致
  name: string;
  version: string;         // semver
  minHostVersion?: string; // 最低宿主版本
  allowBeta?: boolean;     // 同版本号 Beta 宿主是否满足 minHostVersion（默认 false）
  author?: string;
  description?: string;
  kind: PluginKind;
  setup(ctx: SparkleContext): void | (() => void); // 返回函数 = dispose
}
```

### 13.2 扩展点（`SparkleContext`）

| 方法 | 载荷 | 说明 |
| --- | --- | --- |
| `registerView(path, view)` | `SparkleView` | 内容区路由（`/my-page`，自动获 hashchange/动画/错误兜底） |
| `registerNav(item)` | `SparkleNavItem` | 侧栏导航项（追加在内置之后） |
| `registerSonglistGroup(group)` | `SparkleSonglistGroup` | 侧栏歌单分组 |
| `registerSettingsSection(section)` | `SparkleSettingsSection` | 设置页 Sparkle tab 分组 |
| `registerTheme(theme)` | `SparkleTheme` | 自定义主题（CSS 变量覆盖，作用于 `html[data-sparkle-theme]`） |
| `registerStyleLayer(layer)` | `SparkleStyleLayer` | 全站样式层（任意 CSS，`order` 决定层序，缺省 0） |
| `registerThemePack(pack)` | `SparkleThemePack` | 主题包（可切换的完整风格，含变体） |
| `registerNowPlayingWidget(widget)` | `SparkleNpWidget` | 正在播放页小部件 |
| `registerNowPlayingView(view)` | `SparkleNpView` | 正在播放页整页接管 |
| `registerNowPlayingSpectrumMode(mode)` | `SparkleNpSpectrumMode` | 正在播放页频谱形态（与内置 bars/mirror/wave 同表；停用插件即移除） |
| `registerSongMenuItem(item)` | `SparkleMenuItem` \| fn | 歌曲右键菜单项 |
| `registerPlaylistMenuItem(item)` | 同上 | 侧栏歌单右键菜单项 |
| `registerNowPlayingMenuItem(item)` | 同上 | 正在播放页「更多操作」菜单项 |
| `registerStreamSource(source)` | `SparkleStreamSource` | 备用播放源（先注册先试） |
| `registerKaraokeProvider(provider)` | `SparkleKaraokeProvider` | 逐字歌词提供器（先注册先得） |
| `storage` | `SparkleStorage` | 插件专属持久化（localStorage 命名空间） |
| `toast` / `log` / `player` / `style` | — | 提示 / 日志 / 播放门面 / 样式门面 |

宿主端注册表在 `src/sparkle/registry.ts`（纯数据，`sparkRegister*` / `sparkle*()` 查询）。

### 13.3 宿主端模块

| 文件 | 职责 |
| --- | --- |
| `sparkle/init.ts` | 启动装载（在 bootShell 之后） |
| `sparkle/registry.ts` | 扩展点注册表（视图/导航/设置/主题/样式层/菜单/播放源…） |
| `sparkle/loader.ts` | 第三方插件加载与校验；`OFFICIAL_META` = `die-for-you`（唯一官方插件）；`RETIRED_OFFICIAL_IDS` = `["amll"]`（已内置化；`init.ts:pruneRetiredOfficial()` 启动时把该 id 从启用/见过/停用集合洗掉）；`OFFICIAL_LOADERS` 动态 import 表 |
| `sparkle/host.ts` | 启用/主题状态（`ENABLED_KEY`/`THEME_KEY`/`OFFICIAL_OFF_KEY`） |
| `sparkle/policy.ts` | 黑名单/安全模式：`sparkRedflag()`、`sparkIdBlacklisted()`、`sparkBlockReason()` |
| `sparkle/style-layer.ts` | 全站样式层与主题包（`VARIANT_ORDER_BASE=1000`） |
| `sparkle/settings.ts` | 设置页 Sparkle tab（`CAT_LABEL = {theme,plugin,extension}`，`OFFICIAL_AUTHOR = "team quaver"`） |
| `sparkle/np-view.ts` | 正在播放页插件视图挂载 |
| `sparkle/theme-tint.ts` | 主题 tint 策略（`off`/`host`/`presets`；`TINT_PRESET_SYSTEM="system"`、`TINT_PRESET_COVER="cover"`） |
| `sparkle/theme-menus.ts` | 主题菜单外观策略（`off`/`host`） |
| `sparkle/theme-background.ts` | 主题背景策略（`off`/`host`） |
| `sparkle/theme-control-bar.ts` | 主题控制条外观策略（`controlBarPolicyOf`，配合 `lib/control-bar.ts` 写 `body[data-control-bar]`） |
| `sparkle/theme-playlist-mode.ts` | 主题歌单模式策略（`playlistModePolicyOf`，配合 `lib/playlist-mode.ts` 写 `body[data-playlist-mode]`） |

### 13.4 官方插件与 Marketplace

- 官方插件：随宿主静态打包的只有 `die-for-you`。**AMLL 歌词引擎是宿主内置能力**（`src/lyrics/`），不是插件：曾经「内置且不可停用的官方插件 amll」已整体退役，歌词注册规则只有一条——`registry.ts:sparkleKaraokeProvider()` 插件提供器优先，无插件提供器落内置 AMLL（`lyrics/builtin.ts` 动态 import，不进首屏静态闭包）。
- Marketplace 源码：`vendor/Sparkle/marketplace/{aurora,flowscape,md3,nowplaying-push}`，每目录含 `plugin.json` + `index.ts`。
- `plugin.json` 字段：`id`(必)、`name`(必)、`version`(必)、`minHostVersion`、`allowBeta`、`author`、`description`、`category`(`theme`/`plugin`/`extension`)、`homepage`。
- 官方索引：`https://quaver.0w0.red/marketplace.json`；构建产物 `dist/site/`（`marketplace.json` + `sparkle/plugins/<id>.js`）。
- 三方插件安装目录：`<配置目录>/plugins/<id>/`，经 `/api/sparkle` 加载；id 形状 `SPARKLE_ID_RE`。

### 13.5 主题接管（让位机制）与 data-* 状态

主题可接管三类外观，宿主相应「让位」（判定口径三处必须一致，让位是安全侧）：

| 契约 | 让位表现 | 策略模块 |
| --- | --- | --- |
| `SparkleTheme.tint` | tint 组禁用，主题用 `html[data-sparkle-theme="<id>"]{--cvg-accent:…}` 覆盖 | `theme-tint.ts` |
| `SparkleTheme.menus` | `<html data-menu-glass="theme">` | `theme-menus.ts` |
| `SparkleTheme.background` | `.ambient` 设 `data-mode="theme"` | `theme-background.ts` |

激活主题解析只有一份：`registry.ts:sparkleActiveTheme()`（读 host 维护的 `<html data-sparkle-theme>`，不 import host 免得成环）。

样式层键：`PACK_KEY=quaver.sparkle.style.pack.v1`、`VARIANT_KEY=...variant.v1`、`SUSPEND_KEY=...suspended.v1`；`VARIANT_ORDER_BASE = 1000`。

---

## 14. Electron 主进程

真相在 `ui/electron/**`。

| 文件 | 职责 |
| --- | --- |
| `main.ts`（约 1,317 行） | 窗口身份、固定端口内置服务、托盘、全局热键、密钥环、Linux 桌面集成、闪屏编排、桌面歌词窗 |
| `config.ts`（972 行） | quaver.conf（见 §3） |
| `preload.cts` | 上下文桥（见 §8.2） |
| `csp.ts` | 页面 CSP（策略文本 + `installAppCsp()`；`session.defaultSession.onHeadersReceived`，只贴应用自己 origin；`script-src` 只有 `'self' blob:`，页面**不许有内联脚本**） |
| `splash.ts` / `splash-page.ts` / `splash.html` | 启动闪屏：主窗先建后等后端；模板拼装/图标 C2PA 剥离/时序常量纯逻辑（`SPLASH_MIN_MS`）；底色四方同源（`SPLASH_BG_DARK/LIGHT` ⇄ splash.html ⇄ 主窗 backgroundColor ⇄ `style.css --bg`） |
| `desktop-lyrics.ts` / `desktop-lyrics-core.ts` | 桌面歌词覆盖层窗：建窗/位置尺寸记忆（X/Y/W/H 回写）/锁定与鼠标透穿平台闸门（`supportsDlLock`）/尺寸提示（Wayland「申请浮窗」min==max） |
| `mpris.ts` | 主进程 MPRIS（`mpris-service@2.1.2`，require + 最小接口；已从外部 daemon 迁回） |
| `native-server.ts` | 打包态内置服务（含 `/api` 中继） |
| `keyring.ts` | 系统密钥管理器（零依赖、不 import electron，可单测） |
| `background.ts` | `backgroundResponse()`（打包态与 dev 共用） |
| `accent.ts` | 系统强调色探测（多来源，见 §14.2） |
| `systheme.ts` | 系统主题读取（含 Windows 注册表） |
| `tray-icon.ts` / `tray-title.ts` | 托盘图标明暗 / 菜单标题行 |
| `global-hotkeys.ts` | 全局热键注册（`GLOBAL_CONF_KEYS` 与 prefs 逐字一致） |
| `update.ts` | 自更新执行端 |
| `sparkle-version.ts` | 插件版本/宿主版本门 |
| `linux-desktop.ts` | 桌面文件/图标安装 |
| `xdg-portal.ts` | XDG 门户 |
| `audio/*` | 音频引擎：`bins.ts`（mpv 解析）、`engine.ts`、`mpv-ipc.ts`、`mpv-watchdog.ts`、`macho.ts` |
| `local/library.ts` | 本地曲库核心（零 electron）：索引/扫描/Range 流/在线刮削/`handleLocalApi` 路由/`revealTarget`（§9.3） |
| `local/tags.ts` | 标签解析纯函数（ID3v2.2/2.3/2.4+USLT/APIC、ID3v1、Vorbis/FLAC/OGG、MP4 ilst/mvhd、WAV/AIFF、Xing/VBRI/CBR 时长、文件名兜底） |
| `local/webdav.ts` | WebDAV 客户端（PROPFIND Depth:1 + Basic + Range；NAS 挂载目录按 folder 源处理） |

### 14.1 main.ts 关键常量

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `UI_ROOT` / `DIST` | `resolve(__dirname,"..")` / `UI_ROOT/dist` | 加载目录 |
| `PKG_META` | `createRequire(...)("../package.json")` | 包元数据 |
| `CONFIG_DIR` | `configDir()` | 且 `app.setPath("userData", CONFIG_DIR)`（须在任何 `getPath("userData")` 前） |
| `STABLE_PORT` | `4174` | 打包态固定端口（origin 稳定 → localStorage/IndexedDB 跨启动延续；被占则回落随机端口） |
| `SPARKLE_PLUGINS_ROOT` | `QUAVER_SPARKLE_DIR` 或 `<配置目录>/plugins` | 插件根 |
| `TRAY_LOOP_LABELS` | `{None:"顺序播放", Playlist:"列表循环", Track:"单曲循环"}` | 托盘循环标签 |
| `CROTCHET` / `CROTCHET_DEBUG_PORT` | 由 `QUAVER_CROTCHET` 解析 | 调试 |
| `REDFLAG` | 由 `QUAVER_REDFLAG` 解析 | 安全模式 |

`appendSwitch` 一律在 `app ready` **之前**：`password-store`（密钥环）、`remote-debugging-port`、`disable-features`、`js-flags --max-old-space-size=256`。

### 14.2 系统强调色来源优先级（`electron/accent.ts`）

1. `<配置目录>/system-theme.json`（Noctalia / matugen 模板交接文件，JSON）
2. `<配置目录>/system-theme.css`（`@define-color accent_bg_color`）
3. Noctalia 用户模板 JSON 产物（`[theme.templates.user.*] output_path`）
4. Noctalia kcolorscheme 模板产物（`~/.local/share/color-schemes/*.colors` 的 `[Colors:Selection] BackgroundNormal`；实测 Hyprland 下也成立）
5. Noctalia 配色文件（v4 `~/.config/noctalia/colors.json`；v5 `palettes/<x>.json` 仅 `source` 对得上时认——否则那是「定义」不是「活配色」）
6. matugen（`$XDG_CACHE_HOME/matugen/colors.json` / `$MATUGEN_COLORS`）
7. KDE `kdeglobals [General] AccentColor`（仅 KDE 会话）
8. GNOME 47+ `gsettings org.gnome.desktop.interface accent-color`
9. `kdeglobals [Colors:Selection] BackgroundNormal`（**不看会话**：Noctalia 的 kcolorscheme 模板在任何桌面都会合并进 kdeglobals；放在 gsettings 之后，GNOME 上 gsettings 更权威）
10. GTK CSS `@define-color accent_bg_color / accent_color`（Noctalia gtk3/gtk4 模板 / matugen / pywal）
11. macOS `AppleAccentColor` / Windows `DWM AccentColor`

JSON 层为**宽松解析**（找键名归一化等于 `primary`/`mPrimary`/`accent`/`accent_bg_color` 的十六进制值）。候选路径**全部写死**，渲染层不能指定读哪；每 10s 读一次。

### 14.3 密钥环与凭证

- **`--password-store` 必须在 `app ready` 之前钉死**（Chromium 只在初始化读一次；自定义合成器如 Hyprland/sway 不在白名单 → 不钉会静默退 `basic_text` 假加密）。
- 探测顺序：桌面名 → `/proc` 守护进程 → 钱包/keyrings 目录 → 保守试 Secret Service；真正算数的是 ready 后 `getSelectedStorageBackend()` 校验。
- 三级降级：`keyring` → **`memory`（只驻内存，绝不退明文）**；`CredentialStore` 值域里**没有 `file`**，源码里没有写明文路径（`verify:keyring` 有护栏）。
- 交接前缀 `HANDOFF_PREFIX` 两侧逐字一致：`ui/electron/keyring.ts` ↔ `vendor/Typhoeus/quaver_server/session.py`（含末尾空格）。sidecar 仅在 `QUAVER_CREDENTIAL_MODE=external` 下启用。
- 日志卫生：sidecar stdout **先按行切**（`drainLines`）**再判前缀**；凭证行不进日志（`credentialSummary` 只报 musicid 与字段长度）。

### 14.4 托盘

- 图标明暗判据必须是「系统给外壳的颜色」：Linux 探测桌面配色、macOS 读 `AppleInterfaceStyle`、Windows 读注册表 `HKCU\...\Themes\Personalize\SystemUsesLightTheme`。
- **不要用** `nativeTheme.shouldUseDarkColors`（跟应用主题走）；Windows 上也不要用 `shouldUseDarkColorsForSystemIntegratedUI`（会退回应用主题）。Windows 定时轮询（2s）。
- 尺寸统一 16pt 出图。菜单标题行按**显示列宽**截断 **40 列**（汉字记 2 列）——Win32 HMENU 与 macOS NSMenu 都不折行。

### 14.5 应用身份与图标（Linux 桌面集成）

- app_id/WM_CLASS = `red.0w0.quaver`，**唯一真相是 `package.json` 顶层 `desktopName`**；主进程不得再手工 `app.setDesktopName()`；`linux.executableName` 必须与 appId 一致。
- `linux-desktop.ts` 每次启动自装（幂等）：hicolor 图标 + `applications/<ID>.desktop`（三分策略：自家托管强制对齐 / 别人已指向我们且可见则让位 / 其余收编）。**条目必须可见**（禁 `NoDisplay`/`Hidden`）。
- 图标名绝不裸用 `quaver`（词典词，会撞主题里的音符图标）。

## 15. 硬约束与开发约定

### 15.1 TypeScript 与 Node 24（全仓无构建步骤）

`ui/` 下**没有裸 JS 源码**，靠 Node 24 原生类型剥离（strip-only）运行。三条硬约束（写错就是启动时炸）：

1. **相对导入必须写全 `.ts` 扩展名**：`"./config.js"` / 裸 `"./config"` → `ERR_MODULE_NOT_FOUND`。
2. **只能用可擦除语法**：禁用 `enum` / `namespace` / 构造器参数属性 / 旧式装饰器；**类字段必须显式声明**（`lines: string[];`）。`tsconfig.node.json` 的 `erasableSyntaxOnly` 提前拦。
3. **preload 必须是 `.cts`**：Electron 按扩展名分流 preload，且 preload 忽略 `type: module`。

- 两套 tsconfig：`tsconfig.json`（渲染层 `src/**`）、`tsconfig.node.json`（Node 侧 `electron/**` + `scripts/**`）。
- `pnpm run typecheck` 必须 **0 错**（build 闸门）；`pnpm run typecheck:node` 迁移中，暂不作闸门。

### 15.2 verify 脚本的自毁陷阱

不少断言是**读源码文本做正则**。给被测源码加类型标注会静默打坏断言（真实踩过：`valid: (v) =>` 改成 `valid: (v: string) =>` → `verify-sidebar` 立刻红）。**改类型时顺手跑 `verify:static`**。

### 15.3 页面/路由约定（SPA）

- 应用页只有 `index.html`；旧 `<name>.html` 入口 = `public/redirect.js` 薄跳转层（`data-route` 指定路由）。**页面里不许有内联 `<script>`**（CSP `script-src` 只有 `'self' blob:`，内联一律静默失效）。
- 新路由 = `src/views/` 新模块 + 在 `src/views/index.ts` 的 `loaders` 表注册；`vite.config.ts` 的 `PAGES` 只在新增独立 html（如 `desktop-lyrics.html` 这类非路由窗页）时才动。
- 跨页导航一律 `.html` 后缀绝对路径（壳层直接加载 dist 文件时只有该形式可用）。
- `/api/*` 由 `src/relay.ts` 转发 sidecar；凭证只在主进程↔sidecar 流转，**永不进渲染层、永不落明文**。

### 15.4 配置项新增流程

改新设置项要动**三处**：`electron/config.ts` 的 `SCHEMA` + `src/lib/config.ts` 的 `FALLBACK` + `src/lib/prefs.ts` 的类型化 getter/setter。**例外**：只有主进程消费的项（`[Security]`）只需前两处。

### 15.5 字体/背景/tint 分工（避免成环）

- `prefs.ts` 只管「枚举 ⇄ 配置取值」；DOM 侧分属 `ambient.ts` / `tint.ts` / `menu-glass.ts`。改完偏好要自己调对应 `apply*()`。
- `prefs` 被 `player`/`api` 反向依赖，**不能反过来 import 渲染层模块**。
- 颜色数学在 `color.ts`（纯函数）；**真相只有一个 RGB**，HSL/CMYK/HEX 都只是表示，落盘只存 HEX。`isHexColor`（后端，严格带 `#`）与 `parseHex`（前端，宽松）判据故意不同。

### 15.6 主题/背景/菜单接管一致性

tint / 背景 / 菜单三处的「主题是否接管」判定口径**必须一致**（让位是安全侧：不成形的声明也算主题接管）。激活主题解析只有 `registry.ts:sparkleActiveTheme()` 一份。

### 15.7 本地/NAS 曲库红线

- **路径只从库来**：`stream`/`cover`/`lyric` 只认 `t_<12hex>` id（与 `/api/bg` 同一条「请求参数不参与拼路径」红线）；源路径只在 `source/add` 进来一次；folder 遍历**软链不跟**（环路 + 越界双防）。
- **id 稳定性**：relPath 永远相对**源根**（嵌套目录不许拍平，否则同名文件撞 id）；重扫按 `size+mtime` 增量。
- **口令只进不出**：WebDAV password 落 `library.json`（0600），一切响应 `maskSource` 剔除，日志不打印。
- **手动覆盖恒胜**：导入歌词（`lyricSource=import`）、导入封面（`coverManual`）、元数据校正（`editedMeta`）都必须在重扫/重刮后存活；撤销是唯一降级出口。
- **tint 取色源**：`toPixelSrc` 只有一个判据 —— 跨源 http(s) 过 `/api/img` 白名单中继，**同源相对路径直连**（被中继 400 拒掉会像「跟丢了封面」）；换封面要 `bumpLocalCover` 改 URL 且 `refreshLocalCurrent` 恒 notify。
- **MPRIS 封面绝对化**（`mpris.ts:absArt`）：相对 `/api/local/cover` 给外部播放器就是画不出图。

## 16. 验证脚本与构建

### 16.1 常用命令

| 命令 | 作用 |
| --- | --- |
| `pnpm run dev -- --port 5173 --strictPort --host 127.0.0.1` | 启动 dev server |
| `pnpm run typecheck` | 渲染层类型检查（build 闸门，必须 0 错） |
| `pnpm run typecheck:node` | Node 侧类型检查（迁移中） |
| `pnpm run build` | `typecheck` + `vite build` |
| `pnpm run preview` | 预览构建产物 |
| `pnpm run app` | 构建 + 启动 Electron |
| `pnpm run dist` | 构建 + `electron-builder --config ../packages/appimage/arm-x86.yml`（x86_64/aarch64 共用配置，架构由 CLI 决定） |
| `pnpm run verify:local` | 本地曲库护栏（纯单测 + 真 HTTP e2e：假 sidecar + 假 WebDAV + Range/导入/刮削/清库） |
| `pnpm run verify:static` | 一次性跑全部静态验证脚本（39 个；含 verify-local / verify-lyrics / verify-desktop-lyrics / verify-mpris / verify-csp / verify-splash / verify-launch） |

健康检查：`curl -s http://127.0.0.1:5173/index.html | head -5` 应返回 HTML；`curl -s http://127.0.0.1:5173/api/login/status` 验证中继（sidecar 未跑返回 502 JSON 也算中继活着）。

### 16.2 verify:static 覆盖的脚本

`verify-config`、`verify-prefs-map`、`verify-highlight-contrast`、`verify-song-menu`、`verify-list-tools`、`verify-queue-panel-anim`、`verify-queue-drag`、`verify-noselect`、`verify-user-vip`、`verify-sidebar`、`verify-playlist-menu`、`verify-systheme`、`verify-login`、`verify-keyring`、`verify-daily`、`verify-guess`、`verify-sparkle`、`verify-input-policy`、`verify-streaminfo`、`verify-hotkeys`、`verify-shuffle`、`verify-icon`、`verify-launch`、`verify-splash`、`verify-csp`、`verify-update`、`verify-songtiers`、`verify-mpv`、`verify-tray-title`、`verify-background`、`verify-menu-glass`、`verify-tint`、`verify-accent`、`verify-redflag`、`verify-kana`、`verify-local`、`verify-lyrics`（歌词四件套/繁简真词典/TTML 路由）、`verify-desktop-lyrics`（几何真单测 + 平台闸门 + 源码接线）、`verify-mpris`。

另有单项：`verify:np-gallery`、`verify:sparkle-market`、`verify:loved-sync`、`verify:songlist-sync`、`verify:flowscape-lyrics`、`verify:lumen-np`（Lumen 主题下 AMLL 深色表面像素级对拍，先 build marketplace）、`verify:lyric-delay`、`verify:volume-bar`、`verify:csp-live`（dist 真跑 Chromium 验 CSP）、`verify:amll-parse`。

### 16.3 打包关键点

- 公共配置 `packages/electron-builder-base.yml`（`extends` 相对 projectDir `ui/` 解析）：`appId = red.0w0.quaver`、`productName = Quaver Music`、`directories.output = release`、`asar: true`、`files` = `electron/**`、`dist/**`、`package.json`；顶层 `executableName = quaver`、`linux.executableName = red.0w0.quaver`；产物名 `Quaver-${version}-${arch}.${ext}`。
- `extraResources`：`../dist-bin` 的 `quaver-server*` → `bin`；`build-res/icon.png`、`build-res/icons`、`build-res/tray`；`build-res/audio` → `audio`（随包 mpv 运行时，排除 `*.AppImage` 与 `.work`；由 `scripts/stage-mpv.sh` 解 mpv AppImage 到位，不入库）。外部 `mpris-daemon.cjs` 已移除（MPRIS 迁回主进程 `electron/mpris.ts`）。
- AppImage 目标配置：`packages/appimage/arm-x86.yml`（x86_64 与 aarch64 共用，`--x64/--arm64` 决定架构）。

### 16.4 mpv 运行时解析（`electron/audio/bins.ts`）

优先级：`QUAVER_MPV`（env 显式，不可执行则判不可用、**不回落**）→ 随包运行时（`resolveBundled`）→ 宿主 PATH。`probeRuntime()` 真跑一次 `--version`（跨架构/缺库/系统版本不够都只在执行时才暴露）；CLI `node electron/audio/bins.ts --check <声源根>`。


## 附：文档维护提示

- 本文件由仓库分析生成，聚焦「前端（`ui/`）」。修改前端时如新增**配置键 / CSS 变量 / localStorage 键 / IPC 通道 / API 端点 / 环境变量 / 常量**，请同步更新本指南对应章节。
- 更细的子系统契约另见：`ui/README.md`、`ui/AGENTS.md`（开发约定）、`sparkle-dev.md`（插件开发）、`CHANGELOG.md`（变更）。
