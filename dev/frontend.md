# Quaver Music 前端开发指南

> 本指南覆盖 `ui/` 目录全部前端代码（渲染层 `ui/src/**` + Electron 主进程 `ui/electron/**` + Sparkle 插件系统），
> 目标是「读完就能上手改」：**所有变量、所有取值域、所有持久化键、所有外部接口**都在此登记，并做了分类。
>
> 适用范围：仓库 `/home/ne0w0r1d/Desktop/quaver`，前端全部在 `ui/`。文中行号/常量以当前 main 分支为准。
>
> 一句话架构：**Vite 多页应用（MPA，无框架）** + **Electron 桌面壳** + **Go/Python sidecar 后端（:3200）** + **Sparkle 插件系统**。

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
| 渲染层 | Vite MPA，**无框架**（原生 DOM + TS） | 页面 = 根目录 `<name>.html` + `src/entries/<name>.ts`；共 13,948 行 TS |
| 运行时 | **Node 24 原生类型剥离（strip-only）** | `electron/**`、`scripts/**`、`src/**` 全是 `.ts`，**无 tsc 产物、无 outDir** |
| 桌面壳 | Electron | `ui/electron/**`；`main` 入口 = `electron/main.ts` |
| 后端 | sidecar（Python/Go），监听 `:3200` | 渲染层经同源 `/api` 中继访问；凭证只在主进程↔sidecar 间流转 |
| 插件 | Sparkle（git submodule `vendor/Sparkle`） | SDK 纯类型契约；官方插件静态打包，第三方插件 ESM 单文件 |
| 打包 | electron-builder（Linux AppImage 为主） | `pnpm run dist` |

- 包名 `red.0w0.quaver`，`productName: "Quaver Music"`，`desktopName: "red.0w0.quaver.desktop"`，`version: 1.4.0`，`engines.node >= 24`，`packageManager: pnpm@10.33.0`。
- 窗口身份 app_id / WM_CLASS = `red.0w0.quaver`，**唯一真相是 `package.json` 顶层 `desktopName`**。

### 1.2 页面（MPA）与路由

- `vite.config.ts` 的 `PAGES = ["index","guess","daily","liked","playlist","user","settings","login"]`；新增页面必须同时加进 `PAGES` 并在根目录建 `<name>.html`。
- 壳层（`src/shell.ts`）用 hash 路由在**单页内**切换视图；`src/views.ts` 的视图表（约 L2452 起）注册以下路由：

| 路由 | 视图函数 | 说明 |
| --- | --- | --- |
| `/` | `homeView` | 首页 |
| `/search` | `searchView` | 搜索（`?keyword=`） |
| `/guess` | `guessView` | 猜你喜欢 |
| `/daily` | `dailyView` | 每日 30 首 |
| `/liked` | `likedView` | 我喜欢 |
| `/playlist` | `playlistView` | 歌单详情 |
| `/singer` | `singerView` | 歌手主页 |
| `/singer-albums` | `singerAlbumsView` | 歌手全部专辑 |
| `/album` | `albumView` | 专辑详情 |
| `/settings` | `settingsView` | 设置 |
| `/log` | `logView` | 日志 |
| `/user` | `userView` | 用户页 |
| `/login` | `loginView` | 登录 |

- 页面脚本**第一行必须** `mountLayout("标题")`（注入顶栏/侧栏/播放条并搬运 `.page` 内容），之后才能查询页面 DOM。
- 跨页导航一律用 **`.html` 后缀的绝对路径**（壳层直接加载 dist 文件时只有 `.html` 形式可用）。
- 常量：搜索页 `SEARCH_TABS`（歌曲/歌手/专辑/歌单，`type` = 0/1/2/3）；歌手页 `SINGER_TABS`（热歌/新歌/专辑，key = hot/new/album）；用户页 `ME_OUT_MS = 180`（退出动画时长，与 `.me.leaving` 对齐）。

### 1.3 启动流程（渲染层，`src/main.ts`）

配置在 **preload 阶段已同步取好**（`sendSync("quaver:config-sync")`），所以 `main.ts` 里无任何 `await`。启动顺序：

1. `applyTheme()` → 写 `<html data-theme>`；
2. `applyFonts()` → 写 `--font-ui` / `--font-lyric`；
3. `applyDecor()` → `body.ssd` 切换；
4. `applySidebar()` → 侧栏缩态**在 bootShell 之前**挂到 body（避免先展开再收）；
5. `syncCloseAction()` → 把关闭按钮行为推给主进程（tray/quit）；
6. 全局输入治理：拦截 `Tab` 键遍历；中键不再「新窗口跳转」；左键点按钮不转移焦点（捕获阶段）；
7. 无 hash 时 `location.replace("#/")`；
8. `bootShell()`；
9. `void initSparkle()`（必须在 bootShell 之后，渐进增强、不阻塞首帧）；
10. `startMprisBridge()`、`startHotkeysBridge()`。

### 1.4 顶层 git 结构与子模块

- `.gitmodules` 引用 `vendor/Sparkle`（插件 SDK + 官方插件 + marketplace）与 `vendor/Typhoeus`（sidecar / MPRIS 守护）。
- `dist-bin/` 存放随包 sidecar 二进制（`quaver-server*`）；`build-res/audio` 存放随包 mpv 运行时。

## 2. 目录与模块职责

### 2.1 渲染层 `ui/src/`

| 文件 | 职责 |
| --- | --- |
| `main.ts` | SPA 入口：应用偏好、boot 壳层、启动插件/MPRIS/热键桥 |
| `shell.ts` | 壳层：标题栏/侧栏/内容区/播放条注入，hash 路由，导航，封面染色应用 |
| `views.ts` | 全部路由视图与设置页（约 2,470 行，最大单文件） |
| `player.ts` | 播放器全局对象（`window.QuaverPlayer`），队列/收藏/会话 |
| `mpris.ts` | MPRIS（Linux 媒体控制）桥 |
| `lyric.ts` | LRC 歌词解析 |
| `relay.ts` | Vite dev/preview 的 `/api` 中继中间件（转发 sidecar + 封面/背景/强调色代理） |
| `fake-audio.ts` | 静音占位音轨（维持系统媒体会话） |
| `globals.d.ts` | ambient 声明：`__APP_VERSION__`、`window.quaver*` 桥 |
| `style.css` | 全局样式（2,024 行），**所有 CSS 变量的定义处** |
| `lib/*.ts` | 纯逻辑/门面模块（见下） |
| `components/*.ts` | UI 组件（见下） |
| `sparkle/*.ts` | 插件系统宿主端（见 §13） |

### 2.2 `ui/src/lib/` 模块

| 文件 | 职责 |
| --- | --- |
| `config.ts` | quaver.conf 的渲染层门面（`cfg`/`cfgSet`/`cfgSetSoon`/`loadConfig`…） |
| `prefs.ts` | 内部枚举 ⇄ 配置取值的映射与即时生效（最大门面，518 行） |
| `api.ts` | `/api` 封装、音质表、歌曲标题/副标题、剪贴板 |
| `accent.ts` | 系统强调色轮询（`--cvg-accent` 的 system 档来源） |
| `ambient.ts` | 环境色层（`.ambient`）DOM 应用 |
| `tint.ts` | 界面高亮色（写 `--cvg-*` 五个变量） |
| `menu-glass.ts` | 浮层菜单毛玻璃（写 `<html data-menu-glass>`） |
| `color.ts` | 颜色数学：`parseHex`/`toHex`/`rgb2hsl`/`hsl2rgb`/`rgb2cmyk`/`cmyk2rgb`、封面取色 |
| `hotkeys.ts` | 焦点内热键 + 全局热键回程 |
| `inhibit.ts` | 播放时防睡眠 |
| `session.ts` | 播放会话存档（queue/进度/模式） |
| `playlists.ts` / `favs.ts` / `songlist-detail.ts` | 歌单/收藏数据层与写回 |
| `songs.ts` | 歌曲行渲染与 `loadLiked` 等 |
| `songtiers.ts` | 单曲音质档位存在性判定（纯逻辑） |
| `shuffle.ts` | 伪随机洗牌（FNV-1a hash 序列） |
| `reorder.ts` | 队列拖拽重排几何计算 |
| `transport.ts` | 播放进度外推（引擎/web 两种 Transport） |
| `streaminfo.ts` | 音频流容器/编解码信息解析（FLAC/Ogg/MP3） |
| `vip.ts` | 会员到期/权益解析 |
| `update-core.ts` / `updater.ts` | 自更新纯逻辑 / 编排 |
| `fullscreen.ts` / `resizer.ts` / `icons.ts` / `html.ts` | 全屏、分隔条拖拽、图标、HTML 工具 |

### 2.3 `ui/src/components/`

`HotkeySettings`、`ListTools`、`LocalPluginDialog`、`NowPlaying`、`PlayerBar`、`PlaylistMenu`、`PluginSettingsDialog`、`QueuePanel`、`SearchBox`、`SongMenu`、`UpdateDialog`。

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
| `--menu-filter` | `blur(26px) saturate(1.5)` | 同 | 同 |
| `--menu-surface` | `rgba(246,246,248,.66)` | `rgba(30,32,38,.62)` | `rgba(16,19,28,.62)` |
| `--menu-line` | `var(--glass-line)` | 同 | `rgba(255,255,255,.16)` |
| `--menu-shadow` | `0 12px 36px rgba(15,20,30,.22)` | `0 12px 36px rgba(0,0,0,.46)` | `0 12px 36px #0006` |
| `--menu-edge` | `rgba(255,255,255,.5)` | `rgba(255,255,255,.08)` | `rgba(255,255,255,.1)` |

关闭态 `html[data-menu-glass="off"]`：

| 变量 | 值 |
| --- | --- |
| `--menu-filter` | `none`（而非 `blur(0px)` —— 后者仍建 backdrop root、仍占 GPU） |
| `--menu-surface` | `var(--card)` |
| `--menu-line` | `var(--line)` |
| `--menu-edge` | `transparent` |
| `html[data-menu-glass="off"] .np` | `--menu-surface:#14171f`、`--menu-line:#ffffff1f`、`--menu-edge:transparent` |

> 消费点（七处菜单 + 模态弹窗）：`.ctx-menu`、`.pb-qpop`、`.pb-lpop`、`.pb-volpop`、`.np-menu`、`.np-qinfo`、`.tint-pop`；`.upd-dialog` 也吃同组令牌。

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
| `--stuck-h` | `views.ts` | 吸顶栏高度 |
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

---

## 6. data-* 属性与 DOM 状态

| 属性 | 挂载元素 | 取值 | 写入者 | 说明 |
| --- | --- | --- | --- | --- |
| `data-theme` | `<html>` | `light` / `dark` | `prefs.applyTheme()` | 驱动色板变量组 |
| `data-menu-glass` | `<html>` | `on` / `off` / `theme` | `lib/menu-glass.ts` | 菜单玻璃三态（theme = 让位给插件主题） |
| `data-mode` | `.ambient` | `off` / `cover` / `custom` / `theme` | `lib/ambient.ts` | 环境色层模式（theme = 让位给插件主题） |
| `data-sparkle-theme` | `<html>` | 插件主题 id | `sparkle/host.ts` | 激活的插件主题（CSS 覆盖作用于 `html[data-sparkle-theme="<id>"]`） |
| `data-sparkle-scheme` | `<html>` | 主题声明的配色方案 | `sparkle/*` | 插件主题配色 |
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
| `quaver.session.v1` | 播放会话存档（队列上限 500） | `lib/session.ts` |
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
| `quaver:config-sync` | **sendSync** | 启动时同步取配置快照 |
| `quaver:audio` / `quaver:audio-event` | invoke / event | 音频引擎控制与事件 |
| `quaver:background` | invoke | 背景图选图/回显 |
| `quaver:close-action` | — | 关闭按钮行为 |
| `quaver:credential-info` | invoke | 凭证/密钥环信息 |
| `quaver:decor` | — | 窗口装饰 |
| `quaver:flush-session` | — | 会话落盘 |
| `quaver:fullscreen-state` | event | 全屏状态 |
| `quaver:hotkey` / `quaver:hotkeys-info` | event / invoke | 全局热键回程 / 信息 |
| `quaver:mpris` / `quaver:mpris-cmd` | — | MPRIS 状态 / 命令回程 |
| `quaver:quit` | — | 退出 |
| `quaver:sparkle` | invoke | 插件安装/卸载/市场/本地 |
| `quaver:update` / `quaver:update-progress` | invoke / event | 更新 |
| `quaver:win` / `quaver:win-sync` / `quaver:window` | — | 窗口控制 |

### 8.2 preload 桥（`contextBridge.exposeInMainWorld`）

`electron/preload.cts`（**必须是 `.cts`**）暴露：

| 全局对象 | 能力 |
| --- | --- |
| `window.quaverCSD` | `setDecor`（自绘标题栏控制） |
| `window.quaverHotkeys` | 全局热键注册/回程 |
| `window.quaverMpris` | MPRIS 桥 |
| `window.quaverConfig` | `boot`/`all`/`set`/`reset`/`reveal` |
| `window.quaverSecurity` | 安全/凭证信息 |
| `window.quaverBackground` | `pick()` / `info()` |
| `window.quaverSparkle` | `list`/`install`/`uninstall`/`market`/`pickLocal`/`installLocal` |
| `window.quaverUpdate` | `invoke(msg)` / `onProgress(cb)` |
| `window.quaverAudio` | 音频引擎控制（浏览器 dev 下不存在 → 回落 `<audio>`） |
| `window.quaverCrotchet` | boolean（调试/内嵌调试端口） |
| `window.quaverRedflag` | boolean（安全模式 `QUAVER_REDFLAG`） |


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

### 9.2 透传端点

登录/用户：`/login/status`、`/login/logout`、`/login/qrcode/{channel}`、`/login/qrcode/{channel}/status`、`/user/me`、`/user/vip`、`/user/liked`、`/user/fav-songlists`、`/user/created-songlists`。

推荐/搜索：`/recommend/daily`、`/recommend/guess`、`/recommend/newsong`、`/recommend/songlist`、`/search`、`/search/complete`、`/search/hotkey`。

歌曲/歌单/专辑/歌手：`/song/like`、`/song/unlike`、`/song/{mid}/lyric`、`/songlist/{id}/detail`、`/songlist/{id}/songs`、`/songlist/{id}/like`、`/album/{mid}/detail`、`/album/{mid}/songs`、`/singer/{mid}/info`、`/singer/{mid}/desc`、`/singer/{mid}/songs`、`/singer/{mid}/albums`。

流：`/stream/resolve`、`/stream/tiers`、`/stream/{token}`、`/inhibit`。

## 10. 环境变量全量

| 变量 | 默认 | 用途 |
| --- | --- | --- |
| `QUAVER_CONFIG_DIR` | 平台默认 | 覆盖配置目录（主进程下发给 sidecar，两边规则须一致） |
| `QUAVER_API` | `http://127.0.0.1:3200` | sidecar 地址 |
| `QUAVER_SPARKLE_DIR` | `<配置目录>/plugins` | 插件安装根 |
| `QUAVER_REDFLAG` | 空 | 安全模式（红标），经 preload 下发 `quaverRedflag` |
| `QUAVER_CROTCHET` | 空 | 调试/内嵌调试端口 |
| `QUAVER_VERSION` | 空 | 覆盖「关于页」版本号（CI 注入） |
| `QUAVER_MPV` | 空 | 显式指定 mpv 可执行体（优先于随包/PATH） |
| `QUAVER_MPV_ARGS` | 空 | 追加 mpv 参数 |
| `QUAVER_FFMPEG` | 空 | ffmpeg 路径 |
| `QUAVER_AUDIO_SINK` / `QUAVER_AUDIO_DIR` / `QUAVER_AUDIO_BACKEND` / `QUAVER_AUDIO_DEVICE` | 空 | 音频相关 |
| `QUAVER_CREDENTIAL_MODE` | 空 | `external` = 走 stdin 凭证交接（`QCRED1 {json}`） |
| `QUAVER_PORT` | — | 端口 |
| `QUAVER_MPRIS_NAME` / `QUAVER_MPRIS_IDENTITY` | — | MPRIS 标识 |
| `QUAVER_KEEP_MEDIATOR` | — | 保留 mediator |
| `QUAVER_URL` | — | 加载 URL |

**版本号优先级**：`QUAVER_VERSION` > `git describe --tags --abbrev=0 --match "v*"` > `package.json.version`。

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
| `fake-audio.ts` | `SAMPLE_RATE` / `CYCLES` / `AMPLITUDE` / `VOLUME` / `RETRY_MS` | `8000` / `4` / `32` / `0.01` / `1000` |
| `shell.ts` | `nav` / `icons` / `routeStack` / `state` / `currentRoute()` | 导航数组 / 图标表 / 路由栈 |
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
| `PlayerBar` | `LOOP_MODES` | 顺序 `off` / 列表循环 `all` / 单曲循环 `one` |


## 12. 播放器、传输层与音质

- 播放全局对象 `window.QuaverPlayer` 由 `PlayerBar()` 挂载。
- **音质会话覆盖**：播放条选择的档位是会话级（`sessionQuality`，不写 localStorage，重启回设置页默认）；选择永远带 `auto_downgrade`（高档不可及沿回退链降到最优可播档，绝不 403 卡死）。
- **档位存在性**：`missingTiersOf()` 隐藏上游确认无源的档；`auto` 永远保留；会员锁定档仍展示 🔒 交给自动回退。
- **收藏写接口的 songType 陷阱**：读接口 `Song.type` 普通歌曲 = `1`，写接口必须发 `0`（`writeSongType`）；发 1 会「静默成功但什么都没发生」。
- **睡眠抑制执行端**在 sidecar：Linux = xdg 门户 Suspend 位（门户假成功走 Logind 直连）；Windows = `PowerRequestSystemRequired`；macOS = `IOKit PreventUserIdleSystemSleep`。渲染层经 `lib/inhibit.ts` 驱动。
- **假音轨**（`fake-audio.ts`）：维持系统媒体会话（SMTC 等），与用户音量完全解耦。

## 13. Sparkle 插件系统

Sparkle 是 Quaver 的插件系统。SDK 类型契约在 `vendor/Sparkle/sdk/types.ts`（纯类型、无运行时依赖，587 行）。

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
| `sparkle/loader.ts` | 第三方插件加载与校验；`OFFICIAL_META` = `die-for-you`、`amll`；`OFFICIAL_LOADERS` 静态 import 表 |
| `sparkle/host.ts` | 启用/主题状态（`ENABLED_KEY`/`THEME_KEY`/`OFFICIAL_OFF_KEY`） |
| `sparkle/policy.ts` | 黑名单/安全模式：`sparkRedflag()`、`sparkIdBlacklisted()`、`sparkBlockReason()` |
| `sparkle/style-layer.ts` | 全站样式层与主题包（`VARIANT_ORDER_BASE=1000`） |
| `sparkle/settings.ts` | 设置页 Sparkle tab（`CAT_LABEL = {theme,plugin,extension}`，`OFFICIAL_AUTHOR = "team quaver"`） |
| `sparkle/np-view.ts` | 正在播放页插件视图挂载 |
| `sparkle/theme-tint.ts` | 主题 tint 策略（`off`/`host`/`presets`；`TINT_PRESET_SYSTEM="system"`、`TINT_PRESET_COVER="cover"`） |
| `sparkle/theme-menus.ts` | 主题菜单外观策略（`off`/`host`） |
| `sparkle/theme-background.ts` | 主题背景策略（`off`/`host`） |

### 13.4 官方插件与 Marketplace

- 官方插件目录：随宿主静态打包（`die-for-you`、`amll`）。
- Marketplace 源码：`vendor/Sparkle/marketplace/{aurora,flowscape,md3}`，每目录含 `plugin.json` + `index.ts`。
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
| `main.ts`（约 1,091 行） | 窗口身份、内置 vite preview 服务、托盘、全局热键、密钥环、Linux 桌面集成 |
| `config.ts`（723 行） | quaver.conf（见 §3） |
| `preload.cts` | 上下文桥（见 §8.2） |
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

1. `<配置目录>/system-theme.json`（Noctalia/matugen 模板交接文件）
2. `<配置目录>/system-theme.css`（`@define-color accent_bg_color`）
3. Noctalia 用户模板 JSON 产物
4. `~/.local/share/color-schemes/*.colors`（`[Colors:Selection] BackgroundNormal`）
5. `~/.config/noctalia/colors.json`（v4 惯例）
6. `~/.config/noctalia/palettes/<x>.json`（v5，仅 `source=custom` 时）
7. `$MATUGEN_COLORS` / `$XDG_CACHE_HOME/matugen/colors.json`
8. `kdeglobals [General] AccentColor`（仅 KDE 会话）
9. `gsettings org.gnome.desktop.interface accent-color`（GNOME 47+）
10. `kdeglobals [Colors:Selection] BackgroundNormal`（不看会话）
11. GTK CSS `@define-color accent_bg_color / accent_color`
12. macOS `AppleAccentColor` / Windows `DWM AccentColor`

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

### 15.3 页面/路由约定

- 页面 = 根目录 `<name>.html` + `src/entries/<name>.ts`；新页面必须加进 `vite.config.ts` 的 `PAGES`。
- 页面脚本第一行必须 `mountLayout("标题")`。
- 跨页导航一律 `.html` 后缀绝对路径。
- `/api/*` 由 `src/relay.ts` 转发 sidecar；凭证只在主进程↔sidecar 流转，**永不进渲染层、永不落明文**。

### 15.4 配置项新增流程

改新设置项要动**三处**：`electron/config.ts` 的 `SCHEMA` + `src/lib/config.ts` 的 `FALLBACK` + `src/lib/prefs.ts` 的类型化 getter/setter。**例外**：只有主进程消费的项（`[Security]`）只需前两处。

### 15.5 字体/背景/tint 分工（避免成环）

- `prefs.ts` 只管「枚举 ⇄ 配置取值」；DOM 侧分属 `ambient.ts` / `tint.ts` / `menu-glass.ts`。改完偏好要自己调对应 `apply*()`。
- `prefs` 被 `player`/`api` 反向依赖，**不能反过来 import 渲染层模块**。
- 颜色数学在 `color.ts`（纯函数）；**真相只有一个 RGB**，HSL/CMYK/HEX 都只是表示，落盘只存 HEX。`isHexColor`（后端，严格带 `#`）与 `parseHex`（前端，宽松）判据故意不同。

### 15.6 主题/背景/菜单接管一致性

tint / 背景 / 菜单三处的「主题是否接管」判定口径**必须一致**（让位是安全侧：不成形的声明也算主题接管）。激活主题解析只有 `registry.ts:sparkleActiveTheme()` 一份。

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
| `pnpm run dist` | 构建 + MPRIS + electron-builder（Linux AppImage） |
| `pnpm run verify:static` | 一次性跑全部静态验证脚本（约 30 个） |

健康检查：`curl -s http://127.0.0.1:5173/index.html | head -5` 应返回 HTML；`curl -s http://127.0.0.1:5173/api/login/status` 验证中继（sidecar 未跑返回 502 JSON 也算中继活着）。

### 16.2 verify:static 覆盖的脚本

`verify-config`、`verify-prefs-map`、`verify-highlight-contrast`、`verify-song-menu`、`verify-list-tools`、`verify-queue-panel-anim`、`verify-queue-drag`、`verify-noselect`、`verify-user-vip`、`verify-sidebar`、`verify-playlist-menu`、`verify-systheme`、`verify-login`、`verify-keyring`、`verify-daily`、`verify-guess`、`verify-sparkle`、`verify-input-policy`、`verify-streaminfo`、`verify-hotkeys`、`verify-shuffle`、`verify-icon`、`verify-update`、`verify-songtiers`、`verify-mpv`、`verify-tray-title`、`verify-background`、`verify-menu-glass`、`verify-tint`、`verify-accent`、`verify-redflag`。

另有单项：`verify:np-gallery`、`verify:sparkle-market`、`verify:loved-sync`、`verify:songlist-sync`、`verify:flowscape-lyrics`。

### 16.3 打包关键点

- `build.files` = `electron/**`、`dist/**`、`package.json`；`asar: true`。
- `extraResources`：`dist-bin/quaver-server*` → `bin`；`mpris-daemon.cjs`；`build-res/icon.png`、`icons`、`tray`；`build-res/audio`（随包 mpv 运行时）。
- `appId = red.0w0.quaver`；`linux.executableName = red.0w0.quaver`；产物名 `Quaver-${version}-${arch}.${ext}`。

### 16.4 mpv 运行时解析（`electron/audio/bins.ts`）

优先级：`QUAVER_MPV`（env 显式，不可执行则判不可用、**不回落**）→ 随包运行时（`resolveBundled`）→ 宿主 PATH。`probeRuntime()` 真跑一次 `--version`（跨架构/缺库/系统版本不够都只在执行时才暴露）；CLI `node electron/audio/bins.ts --check <声源根>`。


## 附：文档维护提示

- 本文件由仓库分析生成，聚焦「前端（`ui/`）」。修改前端时如新增**配置键 / CSS 变量 / localStorage 键 / IPC 通道 / API 端点 / 环境变量 / 常量**，请同步更新本指南对应章节。
- 更细的子系统契约另见：`ui/README.md`、`ui/AGENTS.md`（开发约定）、`sparkle-dev.md`（插件开发）、`CHANGELOG.md`（变更）。
