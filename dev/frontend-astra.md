# Quaver Astra 开发指南

> 本指南覆盖 `quaver-astra` 仓库的**全部应用代码**：原生 UI（`internal/appui`）、播放器状态机（`internal/player`）、
> mpv 音频引擎（`internal/audio`）、内嵌后端（`internal/backend`）、系统集成（`internal/smedia`）、配置与凭证
> （`internal/conf` / `internal/vault`）、自动更新（`internal/update`）以及发布流水线（`.github/workflows` + `scripts/`）。
> 目标是「读完就能上手改」。
>
> 适用范围：仓库 `github.com/Team-Quaver/quaver-astra`，与子模块 Typhoeus-Go、MyGO
>
> 一句话架构：**MyGo 原生 / GPU UI（无 WebView）** ＋ **进程内嵌 Typhoeus-go 后端（`127.0.0.1` 随机端口）** ＋
> **mpv 子进程音频引擎（JSON IPC）** ＋ **三平台系统集成与自动更新**；全 Go、`CGO_ENABLED=0`、六个目标交叉编译。
>
> 与姊妹项目 Quaver Music（Electron + TypeScript，见 [`dev/frontend.md`](./frontend.md)）共用同一个后端
> （Typhoeus-go）与同一套交互/动效口径——Astra 是把渲染层从 Electron 换成 MyGo 原生绘制的「轻装版」。

## 目录

- [1. 总览与架构](#1-总览与架构)
- [2. 目录与模块职责](#2-目录与模块职责)
- [3. 构建、运行与测试](#3-构建运行与测试)
- [4. 启动与生命周期](#4-启动与生命周期)
- [5. 原生 UI（internal/appui）](#5-原生-uiinternalappui)
- [6. 播放器状态机（internal/player）](#6-播放器状态机internalplayer)
- [7. 音频引擎（internal/audio / mpv）](#7-音频引擎internalaudio--mpv)
- [8. 内嵌后端（internal/backend）](#8-内嵌后端internalbackend)
- [9. 持久化：配置与凭证](#9-持久化配置与凭证)
- [10. 系统集成](#10-系统集成)
- [11. 自动更新](#11-自动更新)
- [12. CI 与打包](#12-ci-与打包)
- [13. 环境变量全表](#13-环境变量全表)
- [14. 配置键全表](#14-配置键全表)
- [15. 硬约束与开发约定](#15-硬约束与开发约定)
- [16. 常见任务与排查](#16-常见任务与排查)
- [17. 参考](#17-参考)

## 1. 总览与架构

### 1.1 技术栈

| 层 | 技术 | 说明 |
| --- | --- | --- |
| 语言 / 工具链 | **Go 1.27.1**（`go.mod` `go 1.27.1`） | 无 cgo，`CGO_ENABLED=0` 全平台交叉编译 |
| 界面 | **MyGo `ui` 包**（`github.com/egoist/mygo`，`go.mod` 指向上游 main 的伪版本 `v0.5.6-0.20261020063447-d5bcfdb3d75b`，源码内置 `third_party/mygo`） | 视图是状态的函数，MyGo 在 GPU 上直接绘制；Linux 走 GtkGLArea + OpenGL，不开 WebKitGTK；已跟上 MyGo 主线的增量绘制 / 文本测量缓存 / 局部布局重算 / 滚动惯性 |
| 音频 | **mpv 子进程** + JSON IPC | 解码/seek/缓冲/gapless 全交给 mpv 内部 FFmpeg；bundle mpv 0.41.0 |
| 后端 | **Typhoeus-go**（子模块 `third_party/Typhoeus-go`，`go.mod` 里的版本由子模块指针固定） | 进程内嵌：`quaver-server` 的完整路由表挂在本进程 `127.0.0.1` 的**随机端口**上 |
| 原生调用 | `github.com/ebitengine/purego v0.11.1` | Windows SMTC（WinRT 裸 vtable）、macOS Now Playing（`objc_msgSend`）都靠它，避免 cgo |
| 其它依赖 | `godbus/dbus/v5`（MPRIS）、`jixunmoe-go/qrc`（QRC 本地兜底解码）、`golang.org/x/crypto`（ChaCha20-Poly1305）、`golang.org/x/image`（取色/缩放/托盘缩放）、`golang.org/x/sys`（Windows） | |
| 打包 | AppImage / DEB / RPM / Pacman / ZIP / DMG / tar.gz | 见 [§12](#12-ci-与打包) |

- 应用 ID / WM_CLASS / bundle id / MPRIS 身份统一为 **`red.0w0.quaver-astra`**：单一来源是 `internal/appid/appid.go`
  的 `appid.Identifier`，`main.go` 用 `//go:linkname` 把它写进 MyGo 的包级元数据；`scripts/package-macos.sh` 的
  `CFBundleIdentifier` 与 `main_test.go` 的断言守着同一个值。
- 许可 **AGPL-3.0-only**（`LICENSE`）。

### 1.2 运行时数据流

```
                         main.go（GTK/GL 环境 → 单实例锁 → 配置目录）
                                     │
        ┌────────────────────────────┼─────────────────────────────┐
        ▼                            ▼                             ▼
  backend.Start()             conf.Open() / vault.Open()      mygo.NewWindow()
  内嵌 Typhoeus-go            quaver-astra.json               MyGo WindowOptions
  (127.0.0.1:随机端口)         credential.enc / session.key     Frameless 1280×800
        │                            │                             │
        │  HTTP 信封 {code,msg,data} │                             │ 每帧重绘
        ▼                            ▼                             ▼
  internal/backend.Client  ──►  internal/player.Player  ──►  internal/appui.App.View
        ▲   （apiAdapter 适配）          │  ▲                      │
        │                                │  │ OnNotify()           │ 用户操作 / 快捷键
        └────────── resolve 音档 ────────┘  │                      ▼
                                            │              Router / 页面状态
                                     internal/audio.Engine
                                       mpv 子进程 + JSON IPC
                                            │  observe_property
                                            ▼
                                   time-pos / duration / pause / eof-reached
```

关键点：**UI 不直接发 HTTP、不直接碰 mpv**。UI 调 `player.Player`，player 经 `Backend`/`Engine` 两个窄接口访问后端与引擎；
状态变化由 `Player.OnNotify` 回调，appui 负责切回主线程重绘。播放动作有三个入口——播放条/窗口内快捷键、`mygo.GlobalShortcut`
（全局注册）、系统媒体中心回调——最后都落在 `player` 的同一组并发安全方法上。

### 1.3 与主项目 Quaver Music 的差异

- **不做 Sparkle 插件系统**（Astra 明确排除）。
- 缺项：搜索联想、歌单处理类功能（README「与主项目的差异」）。桌面全局快捷键**已实现**（设置 → 快捷键，
  全局 + 窗口内两套绑定，见 §5.9）。
- Astra 特有的几件事：**启动画面**（§5.8）、**播放会话记忆**（§6.6）、**逐字歌词的振假名 Ruby**（§6.4）。
- 交互/动效/托盘文案/托盘菜单结构**逐条对齐**主项目：动效曲线、`.np` 正在播放页、
  `.side-btn` 悬停底色、进度条缓动、逐字歌词排版都移植自主项目 `ui/src/style.css`，改动 UI 时先对照主项目口径。

## 2. 目录与模块职责

```
main.go                  启动：GPU 环境 → 单实例锁 → 内嵌后端 → 配置 → MyGo 窗口
gpu_linux.go             NVIDIA 检测，加载 GL 前设 __GL_THREADED_OPTIMIZATIONS=0
gpu_other.go             非 Linux 平台的空实现
img/                     产品图标与启动画面素材（embed 进二进制）：quaver-astra.svg / app-icon.png /
                         splash-logo.svg / splash-star.svg / wordmark-{quaver,astra}.svg（含 licenses/）
winres/                  Windows 图标与版本信息资源（CI 用 go-winres 现场生成）
scripts/                 打包脚本（AppImage / DEB·RPM·Pacman / Windows / macOS / tarball / mpv staging）
internal/appid/          系统侧应用标识符（反向 DNS；appid.Identifier 是唯一来源）
internal/appui/          MyGo 原生 UI：外壳、侧栏、路由页、播放条、正在播放、队列、个人中心、
                         快捷键、启动画面、设置、托盘
internal/backend/        quaver-server 进程内嵌 + HTTP 客户端（信封 {code,msg,data}；vip.go 会员权益契约）
internal/player/         播放器状态机（队列/模式/随机/无限电台/回退链/歌词/收藏/会话续播），与 UI 解耦
internal/audio/          mpv 子进程 + JSON IPC 引擎；二进制定位与子进程环境
internal/smedia/         系统媒体控制中心投影（Linux MPRIS / Windows SMTC / macOS Now Playing）
internal/colorprobe/     封面主色提取 + 模糊底图
internal/streaminfo/     音频流参数探测（FLAC/Ogg/MP3 头部解析，零依赖）
internal/vault/          登录凭证加密持久化（ChaCha20-Poly1305 + 随机主密钥）
internal/conf/           JSON 配置（quaver-astra.json，原子写）
internal/update/         自动更新：GitHub Releases 渠道/产物选择/下载校验/原地热替换
internal/buildinfo/      展示版本号解析（注入值 → git tag → VCS 修订 → dev）
third_party/mygo/        MyGo 框架源码（go.mod replace 到本地，含 GL 线程模型微调）
third_party/Typhoeus-go/ Typhoeus-go 后端（git 子模块，进程内嵌）
```

### 2.1 各包职责与关键文件

| 包 | 关键文件 | 职责 |
| --- | --- | --- |
| `appui` | `app.go` | `App` 状态根、每帧 `View`、侧栏/顶栏/路由分发、自绘窗口按钮、自检钩子 |
| | `views.go` | 首页（无限电台 + 新歌速递 + 推荐歌单 + AI 歌单 + 排行榜）/ 我喜欢 / 每日 / 猜你喜欢 / 歌单详情 / 搜索页 |
| | `discover.go` | 歌单集合页（`/playlists`：我创建 + 我收藏）与排行榜（分组网格 + 榜单详情） |
| | `singer.go` | 歌手页 + 专辑页（信息头 + 分类标签 + 列表） |
| | `favlists.go` | 「收藏的歌单」网格页（`/favlists`，与 `/playlists` 的收藏段同源） |
| | `nowplaying.go` / `npmenu.go` | 正在播放页（模糊封面底、逐字歌词 + 振假名 Ruby、`⋮` 菜单与歌词档位、音质信息浮窗、队列浮窗） |
| | `playerbar.go` | 底部播放条（拖拽 seek、音量、循环、随机、音质胶囊、红心、队列入口；电台态收掉上一首/循环/随机） |
| | `profile.go` | 个人中心（身份卡 + 各档会员到期时间 + 退出登录 / 清除已存凭证） |
| | `hotkeys.go` / `hotkeys_settings.go` | 快捷键：accelerator 解析、全局注册、窗口内轮询、冲突判定、设置页录制控件 |
| | `splash.go` | 启动画面（主窗口 Overlay 层，Logo / 字标 / 落款分段登场，Escape 跳过） |
| | `theme.go` / `motion.go` | 调色板、明暗判定、强调色解析、动效语言（缓动/错峰入场/逐字） |
| | `widgets.go` / `icons.go` | 通用歌曲列表（虚拟化 + 触底翻页）与歌曲行菜单、图标表 |
| | `covers.go` / `colorprobe` | 封面缓存（并发下载 + 解码 + 模糊底图）、原始字节供给取色 |
| | `appicon.go` / `assets` | 产品图标（系统窗口图标 PNG、设置页用 SVG）与托盘模板图标（`assets/tray-icon-*.png`） |
| | `login.go` | QQ / 微信 / 手机三通道扫码（自动生成 + 轮询） |
| | `settings.go` / `update.go` | 设置页（外观 / 播放 / 快捷键 / 关于）、自动更新 UI |
| | `tray*.go` | 系统托盘（平台实现 + 模板图标 + 双击显示窗口） |
| | `wake.go` | 播放期间的睡眠禁止（复用 Typhoeus `inhibit`） |
| | `media.go` | player ↔ smedia 桥接（快照投影 + 命令回传） |
| | `pagecache.go` / `adapt.go` | 路由页状态缓存 LRU（泛型 `getOrCreatePage`）；backend ↔ player 形状适配 |
| `player` | `player.go` | 全部播放状态与操作（并发安全），含猜你喜欢无限电台 |
| | `session.go` | 播放会话持久化（`Session.Queue` / `Session.Pos`；防抖 + 节流落盘，`Boot` 只「就位」） |
| | `lyric.go` | 行级 LRC 解析 + 翻译/音译辅助行对齐（1.5s 内） |
| | `qrc.go` | 逐字 QRC 解码与解析（含本地兜底解密） |
| | `qrc_kana.go` | `[kana:]` 振假名 Ruby 解析与全曲游标对齐 |
| `audio` | `mpv.go` | mpv `Engine`：命令下发、属性观察、事件处理、按 mpv 版本自愈 loadfile 参数布局 |
| | `bins.go` | mpv 二进制定位（显式 → 随包 → PATH）+ 子进程环境 |
| | `ipc_*.go` / `process_*.go` | 平台 IPC（Unix socket / Windows 命名管道）与子进程清理 |
| `backend` | `server.go` | 内嵌 quaver-server + 凭证 `QCRED1` 管道交接 |
| | `api.go` | 信封 HTTP 客户端 + 全部模型与端点 |
| | `vip.go` | 会员权益契约（档位顺序 + 只认各档 `*_end` 的到期解析） |
| `smedia` | `smedia.go` | `Snapshot` / `Commands` / `Controller` 契约与状态指纹 |
| | `mpris.go` / `smtc_windows.go` / `nowplaying_darwin.go` / `objc_darwin.go` | 三平台实现 |
| `update` | `update.go` / `install.go` | 渠道解析、产物选择、下载校验、原地替换 |

## 3. 构建、运行与测试

### 3.1 依赖

- Go **1.27+**（Linux 另需 GTK3 开发库，供 MyGo 原生 UI）。
- **mpv**（播放必需）：`apt install mpv` / `dnf install mpv` / `brew install mpv`。
  「设置 → 关于」会显示检测状态与实际路径（`audio.MPVInfoFor`），也可用 `QAA_MPV` 指定可执行文件。
- 子模块：克隆时带 `--recurse-submodules`（`third_party/Typhoeus-go` 必需）。

### 3.2 构建与运行

```sh
git clone --recurse-submodules https://github.com/Team-Quaver/quaver-astra
cd quaver-astra
go build .
./quaver-astra
```

发布 CI 的实际构建口径（本地复现发布构型时照抄）：

```sh
# 版本号由 CI 注入（本地 go build 会回落到工作区 git tag）
ldflags="-s -w -X main.version=<version>"
# Windows 追加 -H=windowsgui（双击不弹 CMD 窗口）
go build -trimpath -tags mygo_noinspector -ldflags "$ldflags" -o quaver-astra .
```

- `-tags mygo_noinspector` 关掉 MyGo 的 inspector 覆盖层（发布构型）。
- Windows 图标/版本资源由 `go-winres` 从 `winres/winres.json` 生成：

  ```sh
  go install github.com/tc-hib/go-winres@v0.3.3
  go-winres make --in winres/winres.json --out rsrc --arch amd64,arm64
  ```

### 3.3 测试

```sh
go test ./internal/...            # 常规单测
go test ./...                     # 含 main 包

# 需要真实 mpv 的往返测试（无声卡环境用 null 音频输出）
QAA_TEST_MPV=1 QAA_MPV_AO=null go test -run TestEngineRealMPV -v ./internal/audio/

# 需要会话 D-Bus + playerctl 的 MPRIS 往返测试
QAA_TEST_MPRIS=1 go test -run ... ./internal/smedia/
```

测试规模：`internal/**` 下约 **200 个 `func Test`**（`appui` 约 100、`player` 约 40、`update` 约 17、其余各包若干），
纯逻辑包（`player` / `update` / `streaminfo` / `vault` / `buildinfo` / `colorprobe` / `conf`）与 UI 布局/主题/快捷键回归
（`appui/*_test.go`）都覆盖。改 UI 时优先补/改对应 `_test.go`：`sidebar_test.go`、`gridlayout_test.go`、
`theme_accent_test.go`、`hotkeys_test.go`、`splash_test.go`、`visual_test.go` 是既有范式。

### 3.4 自检钩子与截图（开发用）

| 变量 | 作用 |
| --- | --- |
| `QUAVER_ROUTE=<path>` | 启动后导航到指定路由（如 `/settings`、`/playlist/123`、`/profile`） |
| `QUAVER_SCREENSHOT=<png>` | 延时截图后退出 |
| `QUAVER_SCREENSHOT_DELAY=<秒>` | 截图延时（默认 4s） |
| `QUAVER_PLAY_FIRST=1` | 自动播一首新歌（验证播放链路） |
| `QUAVER_REPRO_CLOSE_WINDOW=1` | 复现「关闭窗口 → 收进托盘」路径 |
| `QUAVER_CONFIG_DIR=<dir>` | 自定义配置目录（隔离测试环境） |
| `QUAVER_SHOTS_DIR=<dir>` | 导出 UI 离屏定妆照（见下） |

无显示服务环境（CI / 无头容器）里目视验证 UI 的唯一手段是离屏截图：

```sh
QUAVER_SHOTS_DIR=.workbuddy/shots go test ./internal/appui/ -run TestUIShots
```

未设 `QUAVER_SHOTS_DIR` 时 `TestUIShots` 自动跳过，不拖慢常规测试。
注意启动画面会盖住前 4.6s，截图/定妆照要么等它播完（`QUAVER_SCREENSHOT_DELAY` 调大），要么启动后按 Escape 跳过。

## 4. 启动与生命周期

### 4.1 `main.go` 启动顺序

1. `configureGPUEnvironment()` —— **必须早于 GTK/OpenGL 首次加载**。扫 `/sys/bus/pci/devices` 的 PCI vendor，
   检测到 NVIDIA（`0x10de`）就设 `__GL_THREADED_OPTIMIZATIONS=0`（NVIDIA 的 GL 线程化优化会和 MyGo 的
   GtkGLArea render callback / libepoxy 调度争用 context）。
2. `mygo.App.SetName("Quaver Astra")` / `SetVersion(version)`；包级 `init()` 里用 `//go:linkname` 把
   `mygoPackageIdentifier` 写成 `appid.Identifier`（`red.0w0.quaver-astra`）。
3. `mygo.App.RequestSingleInstanceLock()` —— 拿不到锁说明已有实例，直接 `return`。
4. 解析配置目录（`configDir()`）并 `MkdirAll(…, 0o700)`。
5. `backend.Start(cfgDir, vault.Open(cfgDir))` —— **必须在构造前设好 `QUAVER_CONFIG_DIR`**（后端在 `NewApp()` 时读取）。
6. `conf.Open(cfgDir)` + `appui.New(srv.BaseURL(), store, vault.Open(cfgDir), buildinfo.Resolve(version))`。
7. `defer app.Close()` 且 `mygo.App.OnQuit(app.Close)`（幂等，两条退出路径都收口 mpv）。
8. `mygo.App.OnSecondInstance`：第二实例启动时把已有窗口拉回前台。
9. `mygo.App.WhenReady`：`Dock.SetIcon(AppIconPNG())` → `mygo.NewWindow`（1280×800，最小 940×600，`Frameless`，
   `StateKey:"main"`）→ `SetIcon` → `app.ApplyThemeSource()` → `app.Attach(mainWin)`。
10. `mygo.App.Run()`；返回错误时先 `app.Close()` 再 `fatal`（`fatal` 会 `os.Exit`，普通 defer 不再执行）。

### 4.2 `App` 生命周期

- `appui.New`：装好 `API`/`PL`（player）/`Covers`/`Router`，`initMedia()`（建系统媒体会话）、`initUpdate()`，
  注册 `PL.OnNotify`（登录态跳变时作废收藏歌单与个人中心缓存，然后 `syncSleep/syncTray/syncMedia/invalidate`），
  并挂 `OnBeforeQuit` 把 `quitStarted` 置真。
- `App.Attach(win)`：装 `win.OnClose`（自绘关闭按钮与系统关闭共用「关闭窗口行为」设置）、起启动画面时钟
  （`splashAt`）、接上重绘通知、`PL.Boot()`（载入持久化音量 + 恢复会话 + 挂引擎观察回调 + 起心跳）、
  `PL.RefreshUser()`、`setupTray()`、`syncHotkeys()`（**全局快捷键必须等应用就绪才能注册**）、
  `media.AttachWindow(win.NativeHandle())`、跑自检钩子与启动自动检查更新。
- `App.View(c)`：**每帧**从状态重建整棵视图树（见 §5.1）；推进路由入场时钟、跑窗口内快捷键、最后叠启动画面。
- `App.Close()`：`sync.Once` 幂等收口——注销媒体会话、撤销全局快捷键、释放睡眠禁止、`PL.Close()`
  （先 flush 会话再终止 mpv）、关封面缓存、销毁托盘。
- 退出清理有兜底：`TERM/Ctrl+C`、native SIGABRT、Linux 父进程死亡信号与进程组回收，保证 mpv 不残留（见 §7.5）。

## 5. 原生 UI（internal/appui）

### 5.1 核心范式：视图是状态的函数

MyGo 的 `ui` 是即时模式：每帧调用 `App.View(c)`，从 `App` 的字段**重新构建**整棵元素树。因此：

- 所有会跨帧保留的交互状态（输入框文本、列表滚动、开合布尔、动画时钟）都放在 `App` 或页面状态结构体里，**不能**放在局部变量里。
- 页面数据用「状态结构体 + `ensureXxx` 惰性拉取」模式：`loaded/loading/err/page/hasMore/list`。
- 后台 goroutine 完成后用 `a.update(fn func())` 回投主线程（`Win.Update`；`Win == nil` 时直接调用，便于单测）。
- `a.invalidate()` 是给异步回调的轻量重绘入口。

### 5.2 路由表

`app.go` 的 `routeArea` 用 `Router.View` + `r.Match` 分发；新增页面要在这里加分支并在侧栏/跳转处可达。

| 路由 | 视图 | 说明 |
| --- | --- | --- |
| `/` | `homeView` | 首页（无限电台卡 + 新歌速递 + 推荐歌单网格 + AI 歌单 + 排行榜分组） |
| `/guess` | `guessView` | 猜你喜欢（换一批 / 无限电台） |
| `/daily` | `dailyView` | 每日 30 首 |
| `/liked` | `likedView` | 我喜欢 |
| `/playlists` | `playlistsView` | 歌单集合页（我创建的歌单 + 我收藏的歌单） |
| `/favlists` | `favListsView` | 收藏的歌单（网格，可与 `/playlists` 的收藏段互为入口） |
| `/toplist/{id}` | `toplistView` | 排行榜详情（头部 + 触底翻页） |
| `/playlist/{id}` | `playlistView` | 歌单详情（触底翻页、收藏） |
| `/singer/{mid}` | `singerView` | 歌手主页（热歌/新歌/专辑） |
| `/album/{mid}` | `albumView` | 专辑详情 |
| `/search?kw=` | `searchView` | 搜索（歌曲 / 歌单 tab、热搜词、翻页） |
| `/login` | `loginView` | 扫码登录 |
| `/settings` | `settingsView` | 设置（外观 / 播放 / 快捷键 / 关于） |
| `/profile` | `profileView` | 个人中心（登录态 + 会员权益 + 退出登录） |

侧栏固定导航项 `navItems`：**首页 / 猜你喜欢 / 每日 30 首 / 我喜欢 / 歌单**。顶部是用户区（登录后是头像 + 昵称，
点击进「个人中心」；未登录显示「点击登录」），中间导航组在用户区与底栏之间垂直居中，底部是设置与收起/展开。
侧栏不再平铺列出用户的歌单——集中到「歌单」页。

### 5.3 主题与取色（`theme.go`）

- `buildTheme(c)` **每帧**组装主题：明暗、字体、字号缩放、强调色。
- **明暗唯一真相源是 `Style.Theme`**，只有 `system` 才跟随桌面（`c.Theme().Dark`）。**不要**直接用
  `mygo.Theme.IsDark()`：Linux 上 `SetSource("light")` 只清 GTK 偏好，`IsDark()` 又会去问 XDG portal 的
  color-scheme，深色桌面上会覆盖「强制浅色」。`appearance()` 自己拿主意，跨平台一致。
- 强调色模式 `Style.AccentMode`：`default`（Quaver 青 `#19c2d8`）/ `cover`（封面取色）/ `system` / `custom`；
  解析在 `configuredAccent()`，未知值收口到 `default`。`styleAccent()` 派生悬停/按下/选中/焦点，并按 WCAG
  亮度在黑白中选 `AccentText`。
- 封面取色链：当前曲变化 → `probeCover(coverURL)` → `CoverCache.FetchRaw` → `colorprobe.DominantFromBytes`
  → `tintState.set(r, a.dark.Load())` → `invalidate()`。`a.dark` 是原子量（取色 goroutine 要读）。
- 字号一律走 `fz(v)`（`v * fontScale`，`fontScale` 来自系统 `TextScale`，基准 `baseFontSize = 14`）。
- 正在播放页恒为「模糊封面 + 深色遮罩」，不随明暗翻面（`npBase` / `npScrim*` / `npPop*`），对齐主项目 `.np` 口径。

### 5.4 动效（`motion.go`）

动效语言逐条对齐主项目（注释里有 CSS 对照）。能走 MyGo 一等 API 的就走一等 API：`ElementTransition` 管开合/位移，
`Element.Animate` 管「目标值变化」的缓动；剩下两件按帧时钟自算——**错峰入场**（`Animate` 无延迟）与
**按事件重置的淡入**（`Animate` 没有「从 0 淡入」）。自算部分的约定：**start 为零值时进度取 1**，
于是首帧/测试环境拿到终态，不会把内容藏在透明里。

- 曲线：`easePage`（`cubic-bezier(.22,.61,.36,1)`）、`easePanel`（`.32,.72,.24,1`），`bezier()` 用牛顿迭代反解 x。
- 悬停底色：`hoverFade`（140ms）；异步进出的列表项：`growFade`（200ms + 撑开/收拢）。
- 路由层：`routeEnter`（错峰 40ms）；整页：`pageEnter`；页面里的分块：`enterBlock(i, e)`。

### 5.5 布局硬约束（改 UI 前必读）

这些坑都有回归测试或注释守着，**不要绕过**：

- **侧栏按钮不许 `FillWidth` + `MarginX` 组合**。列的交叉轴默认 Stretch 会先扣掉 `MarginX` 再拉伸；显式 100% 宽按容器全宽解析，
  Margin 叠加在其外会向右溢出。侧栏统一用 `sidePad()` 缩进，行高统一 `sideBtnHeight`、图标统一 `sideIconSize`，
  保证导航项、用户区、底部按钮图标中心线共线（`sidebar_test.go` 守护）。
- **用户区头像显式给边长**（`sideAvatarSize`），不吃 `Avatar` 默认的 `FontSize*2.25`（约 32px，比导航图标大一圈、会把行高顶开）。
- **收起态的底栏改纵排**：64 宽放不下两个 36 的按钮并排，横排会被挤出边界、与上方图标列错位；收起/展开图标按宽度进度旋转
  180°（`k = (w - sideWidthSmall) / (sideWidth - sideWidthSmall)`），不是换图标。
- **子元素必须在 `Parent.Children(func(){ … })` 内创建**：MyGo 元素在创建处就挂到当前父节点；在 `Children` 外先建会挂成兄弟节点。
- **正在播放页的内容层/歌词列宽从 `npPadY/npPadX/npGap/npSideW` 推导**，**不能各写一份**（逐字高亮要先按歌词列宽量行高）。
  歌词列首尾留白由 `npListPadding` 按窗口高度算（夹在 `npPadMin`~`npPadMax`）。
- 覆盖内容区的常驻浮层（正在播放页、队列浮窗）在跳转前要先收起，否则换路由后仍盖在最上面（`npJump`）。

### 5.6 列表与分页

`widgets.go` 的 `songListState` 是「一列歌」的通用形态：数据 + 分页 + 虚拟列表（`ui.ListState`）+ 触底自动翻页
（`loadMore(page)` 在 goroutine 里拉数据后回填）。`pagecache.go` 给按 id 缓存的路由页（歌手 / 专辑 / 歌单 / 排行榜）做 LRU
（`pageCacheLimit = 8`，泛型 `getOrCreatePage`），往返保留数据、超限淘汰最久未访问。

### 5.7 并发与内存

- UI 侧 HTTP 调用经 `withAPILimit` 加全局并发闸门（`uiRequestLimit = 6`），避免快速浏览时多个大响应同时驻留。
- 封面缓存的并发下载/解码限制为 `coverWorkers = 3`，单张封面响应上限 `maxCoverBytes = 4 MiB`。

### 5.8 启动画面（`splash.go`）

不建独立窗口：`Attach` 时记下 `splashAt`，根视图最上层用 `ui.Overlay` 盖一层，播完（或按 **Escape** 跳过，把时钟拨到淡出起点）
整体淡出并撤层。时间轴：0.10s 无星 Logo 淡入上飘 → 0.85s 星星缩放亮起 → 1.55s「Quaver」右移滑入 → 2.10s 手写体
「Astra」浮现 → 2.70s「Built by Team Quaver」淡入 → 4.00s 起淡出、4.60s 撤层。素材在 `img/`（`appicon` 包）里 embed，
浅色用奶油纸感、深色用主界面底色，星星/手写字提亮为暖铜色。

> 约定：`splashAt` 为零值（测试里直接构造 `App`、没走 `Attach`）时**恒不显示**——与 `motion`/`enterState`
> 「零值 = 不播」一致，避免测试和定妆照被启动画面糊住。

### 5.9 快捷键（`hotkeys.go` / `hotkeys_settings.go`）

同一套动作有两个**作用域**，动作集合共用（`hotkeySpecs`：播放暂停 / 播放 / 暂停 / 上一曲 / 下一曲）：

- **全局（`scopeGlobal`）**：`mygo.GlobalShortcut.Register`，Astra 在后台甚至收进托盘时照样生效。Windows 走
  `RegisterHotKey`、macOS 走 Carbon 热键、Linux X11 直接抓键、Wayland 经 XDG 门户 `GlobalShortcuts` 由桌面代持。
  总开关 `Hotkeys.Enabled`（默认开）。
- **窗口内（`scopeLocal`）**：只在 Astra 持有键盘焦点时生效，走 MyGo 原生 UI 的 `ui.Context.Shortcut`，由根视图每帧
  轮询（`localHotkeys`，录制期间整段让路）。

要点：

- **配置键**：`Hotkeys.Global.<Action>` / `Hotkeys.Local.<Action>`（`<Action>` ∈ `PlayPause`/`Play`/`Pause`/`Prev`/`Next`）。
  出厂默认：全局用媒体键（`MediaPlayPause` / `MediaPreviousTrack` / `MediaNextTrack`，播放/暂停两条留空），
  窗口内用 `CmdOrCtrl+Alt+P` / `,` / `.`（媒体键不送进窗口，只能绑全局）。**macOS 上全局一列出厂留空**——
  Carbon 注册不了媒体键，而系统本就把媒体键送给「正在播放」的播放器，Astra 经 `MPRemoteCommandCenter` 接住。
- **解析**：自己解一遍 MyGo accelerator 语法（`internal/accelerator` 是内部包，不可 import），`CmdOrCtrl` 在本机展开成
  Command/Control 并把**展开后的规范串**存进配置，去重与冲突判定才不会把 `CmdOrCtrl+P` 和 `Ctrl+P` 看成两条。
  不带修饰键的键只允许功能键/导航键/媒体键（字母、数字、空格、回车等会打字或抢焦点，必须搭配修饰键）。
- **重建而非增量**：`syncHotkeys` 撤掉全部全局注册再逐条注册（Wayland 门户一次会话绑全部，改一条就得换会话），
  换来「配置 / 系统状态 / 设置页」三者永远一致。启动时在 `Attach` 里注册（**MyGo 在 `App.Run` 之前注册会 panic**）。
- **同键全局优先**：全局注册会把按键从系统层面截走，同键的窗口内绑定永远收不到；解析阶段就判定并在设置页标出，
  不留「点了没反应」的绑定。注册失败（被别的应用占用 / Wayland 门户缺失 / 平台不支持）也会翻译成人话显示在表格里。
- **设置页交互**：点绑定格进入录制（`startRecording`），按下新组合键即改、Esc 取消、右侧小叉解绑，表尾「恢复默认快捷键」。
  录制有 10s 超时，且离开该页即收回——录制中会压住整段窗口内快捷键，不能放着不管。展示名为中文键名 / macOS 苹果符号。

## 6. 播放器状态机（internal/player）

`Player` 是全部播放状态的唯一持有者，**所有方法并发安全**（`sync.RWMutex`），状态变化经 `OnNotify` 通知（可从任意
goroutine 触发，UI 负责切回主线程）。它与 UI、后端、引擎都解耦：只依赖 `Backend` / `Engine` / `Preferences` 三个窄接口
（`adapt.go` 里 `apiAdapter` 把 `*backend.Client` 适配成 `player.Backend`）。

### 6.1 状态字段

`queue/index/mode/shuf/shufOrder/shufDay`、`playing/loading/err/pos/dur/stream/sessionQ/tiers`、
`loved/likedCache/likedTotal`、`lyrics/qrc/lyricState/lyricAux`、`loggedIn/me/playlists`、`vol/muted`、
无限电台（`radioOn/radioEnd/radioLoading/radioWaitingNext/radioRetryAt/radioSeq/radioErr`）、
会话持久化（`saveTimer/saveForce/sessionWroteQ/sessionWrotePos`，见 §6.6）。

### 6.2 队列与模式

- `PlayList` 替换队列并从 i 起播；`Jump` 跳播；`EnqueueNext`（下一首播放，不打断当前）、`PlayNextNow`（插队立即播）、
  `EnqueueMany`（追加）、`RemoveAt` / `ClearQueue` / `MoveInQueue`（拖拽排序，当前曲跟随）。
  `MoveInQueue` 会顺带退出电台（拖拽等于手工接管队列）。
- 循环模式 `mode`：`off`（顺序，自然播到队尾即停）/ `all`（列表循环）/ `one`（单曲循环）。
- 随机：`shufNextLocked` 是**每日一套确定性顺序**——`fnv1a` 种子 + `mulberry32` + Fisher-Yates（`shufDay` 变了才重排）。
- 「上一首」行为由 `Playing.PrevReplay` 决定：`replay`（默认，当前曲 `pos > 3s` 时重放当前曲）/ `previous`（直接跳上一首）。
- `CanPrev()` 是「上一首可用」的**唯一底层入口**：电台态返回 false，按钮、快捷键、媒体键一起关掉，
  不能只在 UI 里藏按钮。

### 6.3 起播链路与降档

```
player.startCurrent(resumeTo, autoplay, overrideTier)
  → pickTier()（"auto" 换算成本机可播放的最高档；mpv 支持集是全部档位）
  → backend /stream/resolve       解析音档 → 本地中继 URL
  → audio.OpenURL(url, startFrac, dur, autoplay)   mpv loadfile（mpv 自己发 Range / 重试）
  → awaitLoaded(seq)              等引擎报 file-loaded（上限 loadWaitTimeout = 8s）
  ← mpv observe_property          time-pos / duration / pause / eof-reached / idle-active / paused-for-cache
  → player.tick()                 同步位置、检测自然播完切下一首
```

- 载入失败按 `fallbackChain(want)` 从高到低逐级让位重试；`fallback` 集合是**会话局部**的，用于去重。
- `seq`（序号）用于丢弃过期回调：换曲后旧协程的结果经 `errStale` 丢弃。
- 连续播不了会在 `maxAutoSkips = 3` 首后停止自动切歌并报错（`failStreak`），避免坏链路把整条队列跳空。
- `Quality.DefaultQuality` 是默认档位；`Quality.FallbackToQMAtmos` 打开后把 `atmos71/atmos51` 一起降权（设置页标注「不推荐」）。
- 会话级音质覆盖 `sessionQ` 优先于默认配置（播放条音质菜单切换会 `RestartAtPosition` 重载当前曲）。

### 6.4 歌词

- `lyric.go`：行级 LRC 解析（多时间戳展开、`//` 与占位行跳过），翻译 / 音译两路辅助行按最近时间戳（**1.5s 内、一一对应**）
  对齐进主行；`AuxText(line, mode)` 按档位挑唯一一条（缺首选那一路回落另一路）。
- `qrc.go`：逐字 QRC 解码与解析。请求歌词时带 `qrc=1&trans=1&roma=1`，上游把 QRC 明文塞在同一个 `lyric` 字段里；
  正常路径由 Typhoeus-go 服务端解密，**万一服务端解密失败原样透传密文**，再由 `jixunmoe-go/qrc` 在本地兜底解一层。
- `qrc_kana.go`：`[kana: ...]` **振假名 Ruby**——QQ 音乐日文逐字歌词把汉字上方假名放在独立元数据行，数字表示覆盖几个
  「可注音字符」（汉字 / 々 / 〆，连续数字串算一个）。对齐是**跨全曲的单向游标**（错一个字符后面整首都会串位），
  与 `roma`（整行音译，走辅助行）不是一回事；kana 永远画在词上方、不参与翻译/音译档位。
- 时间轴口径与 QQ 音乐 / Lyricify / AMLL 一致：行 `[start,dur]` 毫秒绝对，词 `text(start,dur)` 毫秒绝对；
  `QrcLines()` 与 `LyricLines()` 同源同序，无逐字时间轴时长度为 0，UI 回退行级。
- 辅助行档位 `Style.LyricAux`：`off` / `translation` / `romanization`（旧布尔键 `Style.ShowTranslation` 仅作兼容回落）。

### 6.5 收藏与心跳

- `ToggleLove` 乐观更新（`loved` map + `likedCache`），失败回滚。
- `StartTicker` 起 200ms 心跳，`tick()` 只做三件事：读 mpv 的 `time-pos`/`duration` 同步、检测自然播完切下一首、驱动 UI 重绘。
  **位置不自己推算**——mpv 是唯一真相源，旧实现用墙钟累加会在 seek/换歌时累积误差。加载中（`loading`）不重复触发自动切歌，
  否则 mpv 上一首残留的 `eof` 会被误判成「播完」而连跳。

### 6.6 播放会话记忆（`session.go`）

退出保留播放列表与进度，启动恢复（落盘在 `quaver-astra.json` 的 `Session.Queue` / `Session.Pos`）：

- **落盘节奏**：结构性变化与进度跳转合并在一个防抖窗口（`sessionDebounce = 1.2s`）；播放中由 tick 节流，每跨
  `sessionPosStride = 5s` 最多一条（进度量化到半秒避免浮点抖动）。`conf.Set` 每次重写整个文件，绝不能跟着 200ms 心跳写。
- **`Close` 强制同步落盘**，且赶在 mpv 关闭之前（进程随时可能在 `Close` 返回后结束；位置要在引擎还活着时取）。
- **恢复只「就位」**：`Boot` 不碰 mpv、不发网络请求（窗口秒开、不自动连网的原则不变）。进度直接摆上界面，用户按播放时由
  「未装载起播」分支带着这个位置走完整起播链。若启动时就自动 `startCurrent`，断网冷启动会撞上 failover 连跳链。
- `Session.Pos` 的 mid 与队列当前曲不符时**丢弃进度、保留队列**（宁可从 0 播，不可播错位置）；进度接近曲末时留 0.5s 余量。

### 6.7 猜你喜欢 · 无限电台

- `StartRadio(autoplay)` 取一轮 5 首（`/recommend/guess`）替换队列，`radioEnd` 记本轮末；播到轮末
  `requestRadioExtendLocked` 自动续下一轮（`extendRadio`），并**裁掉当前曲之前的历史**（队列不会无限膨胀）。
- `Next(auto)` 在电台态只向前走：到轮末续歌，续歌失败按 `radioRetryAt` 退避 5s（不能每 200ms 锤上游），
  用户手点下一首（`auto=false`）可立即重试。
- `RadioActive/RadioLoading/RadioError` 供 UI；电台没有可编辑队列，循环与随机也不参与推进，所以播放条收掉上一首/循环/随机/插队。
  离开页面不打断电台（`StopRadio` 只退出会话、不动当前队列）。

## 7. 音频引擎（internal/audio / mpv）

### 7.1 为什么是 mpv 子进程

播放全部交给 mpv（`--no-video --idle --input-ipc-server`），本包只做 JSON IPC 的命令下发与属性观察。解码、seek、
缓冲、gapless、各类容器/编码（mp3 / flac / ogg / aac / atmos / DTS）都由 mpv 内部 FFmpeg 处理。**不链 libmpv**：
要交叉编译到 `linux/{amd64,arm64,loong64}`、`windows/{amd64,arm64}`、`darwin/arm64`，cgo 会破坏交叉编译。

### 7.2 mpv 参数（`mpvArgs`）

| 参数 | 作用 |
| --- | --- |
| `--no-video --no-terminal --really-quiet --audio-display=no --force-window=no` | 纯音频、静默 |
| `--idle` | 常驻不退出（换曲只 `loadfile`，省进程开销）；**必须无值**，写 `--idle=yes` 会被当布尔开关，读完即退 |
| `--no-resume-playback --keep-open=no --no-config --ytdl=no` | 不读用户 mpv 配置，避免污染 |
| `--input-ipc-server=<sock>` | IPC 端点 |
| `--cache=yes --cache-on-disk=no --cache-secs=20` | 有界前向缓存，**不落盘是合规硬线** |
| `--demuxer-max-bytes=64MiB --demuxer-readahead-secs=8 --volume-max=100` | 缓冲区与音量上限 |
| `--stream-lavf-o=reconnect=1,reconnect_streamed=1,reconnect_delay_max=5` | 上游半路断流时 lavf 自己重连 |
| `--ao=<QAA_MPV_AO>` / `--audio-device=<QAA_MPV_DEVICE>` | 仅设了对应环境变量时追加 |

### 7.3 观察属性与命令

握手时注册 `observe_property` id `1..6`：`time-pos` / `duration` / `pause` / `eof-reached` / `idle-active` /
`paused-for-cache`（`Stalled()` 据此报告「缓冲中」）。命令：`loadfile`（异步 + `options.start` 起点，**不能载入后再 seek**）、
`set_property pause`、`seek <sec> absolute+exact`、`set_property volume`、`stop`。高频命令（seek/音量）走 async 静默下发，避免阻塞 socket。

- **loadfile 参数布局随 mpv 版本自愈**：mpv 0.38 起签名变成 `loadfile <url> [<flags> [<index> [<options>]]]`，
  把 options 放第三位的旧调用会被拒（`invalid parameter`，载入根本没开始——症状是「带进度起播卡在加载、然后自己跳下一曲」）。
  `loadfileWantsIndex(version)` 按版本决定发不发 `-1` 占位，并在被拒时**换布局原样重发一次**（`loadRetried`），
  认不出版本时先按旧布局发、被拒再自愈。
- **代次隔离**：每次 `OpenURL` 递增 `loadGen`，`start-file` / `file-loaded` / `end-file` 事件与命令回包都盖当时的代次，
  读取只认当前代次——避免换档重发时「上一档的 end-file(error)」被当成「这一档刚开始就失败」而误判整条回退链。

> IPC 报文顶层必须是 JSON **对象**（`{"command":[…]}`）；发成数组会被 mpv 当 `input.conf` 文本命令，永远没有响应。
> 握手期间刻意**不**启动 observe 协程：socket 只有一个读消费位，observe 会抢读锁并阻塞在读上，导致命令互等卡死。

### 7.4 mpv 二进制定位（`bins.go`）

优先级与主项目 `ui/electron/audio/dist/bins.js` 一致：**显式路径（`QAA_MPV`）→ 随包目录（`QAA_MPV_DIR`）→ 可执行文件旁的
随包 `mpv/` → PATH**。随包目录候选（`bundledRoots()`）：`QAA_MPV_DIR` 指向的目录，以及可执行文件同级的 `mpv/`、
`../Resources/mpv/`、`usr/share/quaver-astra/mpv/`、`../share/quaver-astra/mpv/`；每个目录内的载荷候选（前者优先）：
`shared/bin/mpv`（Linux quick-sharun AppImage 目录）、`mpv.app/Contents/MacOS/mpv`、`mpv.exe`、`AppRun`、`mpv`。
PATH 兜底在 Windows 用 `mpv.com`（`.com` 版才会把输出写到 stdout）。

Linux 随包 mpv 是 quick-sharun 目录时，由**包内 loader** 按 `lib/lib.path` 直启 `shared/bin/mpv`，且**隔离宿主
`LD_LIBRARY_PATH`**（避免包内 libc 与宿主 libc 混载，也不能走上游 AppRun——它的 hooks 会下载/更新组件）。
Windows/macOS 直接启动官方 release 的 `mpv.exe` / `mpv.app`。「设置 → 关于」用 `MPVInfoFor()` 显示路径与来源
（explicit / bundled / 系统安装）。

### 7.5 跨平台 IPC 与进程清理

- IPC：Unix/macOS 是临时目录里的 AF_UNIX socket，Windows 是命名管道（mpv 的 Windows IPC 只支持命名管道）。
- `New()` 失败时返回**哑引擎**：所有操作退化为返回错误，调用方无需区分「无音频设备」与「无 mpv」（`Available()` 供设置页判断）。
- `process_linux.go` 设父进程死亡信号 + 进程组兜底；`process_windows.go` / `process_other.go` 各自处理。
  正常退出、`TERM`/`Ctrl+C`、native SIGABRT 都会终止 mpv，异常崩溃也不留孤儿。

## 8. 内嵌后端（internal/backend）

### 8.1 进程内嵌

`backend.Start(configDir, vault)` 在**本进程**起一个只监听 `127.0.0.1` **随机端口**的 quaver-server（`app.Routes()` 挂到
`net/http.Server`）。这样省掉 sidecar 进程与端口协调，`BaseURL()` 返回 `http://127.0.0.1:<port>`。
注意：`quaver-server` 在 `NewApp()` 时读 `QUAVER_CONFIG_DIR` 并落设备指纹，**必须在调用前设好环境变量**。

### 8.2 凭证交接（`QCRED1` 管道协议）

复用后端 external 模式的 QCRED1 交接协议，**明文凭证绝不落盘**：

1. `os.Pipe()` 造两组管道，先往 stdin 注入首行：有保存凭证则 `QCRED1 {json}\n`，否则 `QCRED1 null\n`，然后关闭写端。
2. 临时把 `os.Stdin/os.Stdout` 换成管道，设 `QUAVER_CREDENTIAL_MODE=external`，`quaverserver.NewApp()`，再立刻还原应用自身的 stdio。
3. 排水协程扫描 stdout：登录/自动刷新/登出时后端回写 `QCRED1 ...` 行 → vault 加密落盘 / 清除。
4. `Shutdown()` 停 HTTP 服务并收掉管道。

`vault` 为 nil 时行为退化为 memory（不落盘）。

### 8.3 HTTP 客户端与信封

`backend.Client` 把响应解成 `{code, msg, data}` 信封：HTTP 状态 ≥ 400 或 `code != 0` 都返回 `*APIError`；
`Unauthorized(err)` 判定 401。响应体读取上限 8 MiB，客户端超时 20s。

### 8.4 端点全表（`api.go`）

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| GET | `/login/status` | 登录态 |
| POST | `/login/logout` | 登出 |
| GET | `/login/qrcode/{channel}` | 取二维码（channel = mobile / qq / wx） |
| GET | `/login/qrcode/{channel}/status?identifier=` | 轮询（event 1 已扫 / 2 待确认 / 3 过期 / 4 拒绝 / done 完成） |
| GET | `/user/me` | 用户基础信息 |
| GET | `/user/vip` | 会员权益（三档标志 + 各档 `*_end`，见 `vip.go`） |
| GET | `/user/liked?page&num` | 我喜欢（分页） |
| GET | `/user/created-songlists` | 我创建的歌单 |
| GET | `/user/fav-songlists?page&num` | 我收藏的歌单 |
| GET | `/stream/tiers` | 可用音质档位 |
| POST | `/stream/resolve` | 解析音档（mid/mediaMid/songType/tier/auto/deprioritize） |
| GET | `/song/{mid}/lyric?trans&roma&qrc` | 歌词（行级 / 逐字 / 翻译 / 音译） |
| GET | `/songlist/{id}/detail?page&num` | 歌单详情 |
| POST / DELETE | `/songlist/{id}/like` | 收藏 / 取消收藏歌单 |
| POST / DELETE | `/songlist/{dirid}/songs` | 加歌 / 删歌 |
| GET | `/songlist/fav/check` | 已收藏歌单 id 列表 |
| POST | `/song/like` / `/song/unlike` | 红心 / 取消红心 |
| GET | `/singer/{mid}/info` · `/desc` · `/songs?page&num&order` · `/albums?page&num` | 歌手信息 / 简介 / 歌曲 / 专辑 |
| GET | `/album/{value}/detail` · `/album/{value}/songs?page&num` | 专辑详情 / 歌曲 |
| GET | `/search?keyword&type&page&num` · `/search/hotkey` | 搜索 / 热搜词 |
| GET | `/recommend/songlist?page&num` · `/recommend/ai-songlist?page&num` | 推荐歌单 / AI 歌单 |
| GET | `/recommend/newsong?type=5` · `/recommend/daily?page&num` · `/recommend/guess?rounds` | 新歌 / 每日 30 首 / 猜你喜欢（无限电台） |
| GET | `/top/category` · `/top/{id}/detail?page&num` | 排行榜分组 / 榜单详情 |

### 8.5 Typhoeus-go（子模块）

`third_party/Typhoeus-go` 是 Git 子模块，`go.mod` 用 `replace … => ./third_party/Typhoeus-go`。README 要点：登录（QQ/微信/
手机 + MQTT WSS 推送 + 凭证自动刷新）、全套音质档位与加密流解密（全链路不落盘、ekey 不透传）、歌单/每日 30 首/无限电台、
搜索/榜单/专辑/歌手/歌词、系统集成。独立运行：`QUAVER_PORT=3200 ./typhoeus-go`。
`backend/vip.go` 只依赖它的 `modules.ParseVipTime` 做北京时间到期解析——**各档只认自己的 `*_end`**，不互相借用。

## 9. 持久化：配置与凭证

**配置目录**：`os.UserConfigDir()/quaver-astra`，可用 `QUAVER_CONFIG_DIR` 覆盖；目录 0700。Windows 为 `%AppData%`，
macOS 为 `~/Library/Application Support`。

| 文件 | 内容 | 权限 |
| --- | --- | --- |
| `quaver-astra.json` | 应用配置（键值对 JSON，`conf.Store`，原子写 `tmp + rename`；含 `Session.Queue` / `Session.Pos`） | 0600 |
| `credential.enc` | 加密凭证（`QAST1` + nonce(12B) + ChaCha20-Poly1305 密文） | 0600 |
| `session.key` | 32B 随机主密钥 | 0600 |
| `device.json` / `device.cache.json` | 设备指纹 / 匿名会话（后端写，非密钥） | — |

- `vault.Save` 空输入等价于 `Clear`；`Load` 校验失败一律按未登录（`ErrNoCredential`）。
- `HasSaved()` 报告是否存有凭证文件（个人中心的「清除已保存的凭证」按钮据此显隐）。
- 安全边界与主项目一致：防他人随意拷贝文件，不防本机 root；未来可无缝升级到 OS 密钥环（只换 `LoadKey` 实现）。

## 10. 系统集成

### 10.1 系统媒体控制中心（`internal/smedia`）

契约：`Controller{ AttachWindow(hwnd); Update(Snapshot); Close() }`（`smedia.New(identity, cmds)`）。`appui/media.go`
负责把 player 状态投影成 `Snapshot`、把 `Commands`（PlayPause / Play / Pause / Stop / Next / Prev / Seek / SetPosition /
SetVolume / SetLoop / SetShuffle / Raise / Quit）回传给 player。`Snapshot.stateSignature()` 做状态指纹（进度按整秒量化）
去重，未变化时不打扰系统；`SetPosition` 会校验 `trackID` 是否仍是当前曲，丢弃系统 UI 的陈旧跳转。

| 平台 | 实现 | 说明 |
| --- | --- | --- |
| Linux | `mpris.go` | 注册 `org.mpris.MediaPlayer2.<身份>`，身份取自 `smedia.New("Quaver Astra", …)`，折算后为 **`org.mpris.MediaPlayer2.QuaverAstra`**；播放状态/封面/进度/循环模式双向同步；媒体键 |
| Windows | `smtc_windows.go` | SMTC：**无 cgo、无第三方 WinRT 绑定**，经 `combase.dll` 的 `RoGetActivationFactory` 拿 vtable 裸调，事件回调以纯 Go COM 对象注入；封面缩略图、进度时间轴、系统侧循环/随机 |
| macOS | `nowplaying_darwin.go` + `objc_darwin.go` | `MPNowPlayingInfoCenter` + `MPRemoteCommandCenter`；经 purego 裸调 `objc_msgSend`（本项目以 `CGO_ENABLED=0` 交叉编译，无法用 cgo + `.m`） |
| 其它 | `smedia_other.go` | no-op |

> macOS 的系统投影只对带 `CFBundleIdentifier` 的应用生效，裸跑可能看不到，打包 `.app` 后正常（`scripts/package-macos.sh`）。
> macOS 的媒体键也由系统经 `MPRemoteCommandCenter` 送进来，所以全局快捷键一列出厂留空（见 §5.9）。

### 10.2 睡眠禁止（`wake.go`）

复用 Typhoeus `inhibit`（Linux xdg portal/logind、Windows PowerRequest、macOS IOKit），**只阻止系统睡眠，不请求
DisplayRequired**（熄屏/锁屏照常）。仅在「设置开启（`Playing.InhibitSleep`，默认 true）+ mpv 实际出声」时持有；
失败后 30s 再试，避免 5Hz 心跳反复打系统总线。

### 10.3 系统托盘（`tray*.go`）

菜单对齐主项目：曲目行（`trayIdleLabel = "未在播放"`，标题按显示宽裁剪）、上一曲 / 播放暂停 / 下一曲、循环模式
（单选 off/all/one + 随机勾选）、显示 / 退出。**左键只认双击**：第一次点击只记时间，落在双击窗口（500ms）内的第二次才把主窗口拉回前台，
单击不隐藏也不切换，避免误触让窗口消失。窗口关闭按钮可收进托盘（`Window.CloseAction`：`tray` 默认 / `quit`）。
Linux 的 AppIndicator 没有独立右键入口，菜单挂在图标上由面板次级点击打开；macOS/Windows 由 `OnRightClick` 弹出，
菜单在别处点开都不会误触。托盘图标用 `assets/tray-icon-{light,dark}-shell.png`，与应用图标职责不同，**不能互相替换**。

## 11. 自动更新

### 11.1 渠道（`internal/update/update.go`）

- **稳定版** `stable`：打 `v*` tag 触发的正式 Release，用 `/releases/latest`（GitHub 保证排除 draft/prerelease）。
- **快照版** `snapshot`：每次 push 触发的滚动预发布，tag 形如 `snapshot-<sha>`（在 Releases 列表里挑最新一条）。
- 渠道配置 `Update.Channel`（默认 stable），`Update.AutoCheck`（默认 true，启动延迟 5s 后自动检查，只提示一次）。
- 可选带 `GITHUB_TOKEN` / `GH_TOKEN` 提升匿名 API 限流（仅更新检查用）。

### 11.2 安装形态与热替换（`internal/update/install.go`）

`Detect(goos)` 判定 `InstallForm`：

| 形态 | 可否原地热替换 | 说明 |
| --- | --- | --- |
| `FormAppImage` | ✅ | `$APPIMAGE` 指向 .AppImage 单文件 |
| `FormBinary` | ✅ | 便携 tarball / 手动放置的二进制 |
| `FormWindowsZip` | ✅ | exe 与 `mpv/` 同级 |
| `FormSystemPackage` | ❌ | deb/rpm/pacman 安装进系统目录 → 回退打开发行页 |
| `FormDarwinApp` | ❌ | macOS `.app` → 回退打开发行页 |

热替换：下载边算 sha256 校验 GitHub `digest`，同目录原子改名覆盖；`CleanupStale` 清理上次 Windows 热替换留下的 `.old`。

### 11.3 更新 UI（`appui/update.go`）

状态只在 UI 线程写（`a.update()` 回投），后台 goroutine 只负责网络与磁盘。设置 → 关于：切换渠道、手动检查、
下载安装、进度显示。发行页见 [github.com/Team-Quaver/quaver-astra/releases](https://github.com/Team-Quaver/quaver-astra/releases)。

## 12. CI 与打包

`.github/workflows/build.yml` 的作业链：`version → test → build(matrix) → (stage-linux-mpv → package-*) → release`。

- **version**：`git describe --tags --match 'v[0-9]*' --match 'V[0-9]*'` 取 base；tag push → 正式版本；push → `<base>-<sha>-snapshot`；
  PR → `<base>-<sha>-pr.<n>`（不发布）；其余（workflow_dispatch 等）→ `<base>-<sha>-build`（不发布）。
- **test**：`go test ./internal/...` + 真实 mpv 往返（`QAA_TEST_MPV=1 QAA_MPV_AO=null`）。
- **build**（6 目标）：`linux-amd64/arm64/loong64`、`windows-amd64/arm64`、`macos-arm64`；`CGO_ENABLED=0`，
  `-trimpath -tags mygo_noinspector -ldflags "-s -w -X main.version=<v>"`，Windows 追加 `-H=windowsgui`，并用 `file` 校验架构。
- **stage-mpv**：`scripts/stage-mpv.sh` 拉取并校验（sha256）mpv 0.41.0 运行时，安装到 `<dest>/mpv`。
  Linux 用 pkgforge anylinux AppImage 展开目录（须在同架构 runner 执行），Windows/macOS 用官方 release。
- **package-\***：AppImage / DEB·RPM·Pacman / LoongArch64 tarball / Windows ZIP / macOS DMG。
- **release**：push 时发布；tag 为正式 Release，否则滚动 `snapshot-<sha>` 预发布。
- **发布产物**：AppImage（AMD64/ARM64，随包 mpv）、DEB/RPM/Pacman（AMD64/ARM64/LoongArch64，依赖声明仅 mpv）、
  LoongArch64 tar.gz、Windows AMD64/ARM64 ZIP（官方 mpv）、macOS ARM64 DMG（官方 mpv）。全部按 AGPL-3.0-only 标记并附 LICENSE。

打包脚本：

| 脚本 | 用途 |
| --- | --- |
| `scripts/stage-mpv.sh` | 下载 + 校验 + 展开 mpv 运行时 |
| `scripts/package-appimage.sh` | 组装 AppImage（含隔离的 quick-sharun mpv launcher） |
| `scripts/package-linux-system.sh` / `package-pacman.py` | DEB / RPM / Pacman |
| `scripts/package-tarball.sh` | LoongArch64 二进制 tarball |
| `scripts/package-windows.sh` | Windows ZIP |
| `scripts/package-macos.sh` | macOS `.app` + DMG（现场生成 icns、ad-hoc 签名） |
| `scripts/install-appimagetool.sh` | CI 取 appimagetool |

## 13. 环境变量全表

| 变量 | 作用 |
| --- | --- |
| `QAA_MPV` | 指定 mpv 可执行文件（绝对路径，最高优先级） |
| `QAA_MPV_DIR` | 随包 mpv 运行时目录（quick-sharun / `mpv.app` / `mpv.exe` / 单文件布局） |
| `QAA_MPV_AO` | 强制音频输出（如 `null`，无声卡环境自检） |
| `QAA_MPV_DEVICE` | 强制音频输出设备 |
| `QAA_TEST_MPV=1` | 开启真实 mpv 往返测试 |
| `QAA_TEST_MPRIS=1` | 开启 MPRIS 往返测试（需会话 D-Bus + playerctl） |
| `QUAVER_CONFIG_DIR` | 覆盖配置目录（同时下发给内嵌后端） |
| `QUAVER_ROUTE` | 启动后导航到指定路由 |
| `QUAVER_SCREENSHOT` / `QUAVER_SCREENSHOT_DELAY` | 延时截图后退出 / 截图延时 |
| `QUAVER_PLAY_FIRST=1` | 自动播一首新歌 |
| `QUAVER_REPRO_CLOSE_WINDOW=1` | 复现关闭窗口路径 |
| `QUAVER_SHOTS_DIR` | 导出 UI 离屏定妆照 |
| `QUAVER_CREDENTIAL_MODE=external` | 后端凭证管道交接模式（`backend.Start` 内部临时设置） |
| `QUAVER_PORT` | Typhoeus-go 独立运行时监听端口（Astra 内嵌时用随机端口，不使用） |
| `APPIMAGE` | AppImage 运行时由 AppRun 设置，`update.Detect` 据此识别 `FormAppImage` |
| `__GL_THREADED_OPTIMIZATIONS=0` | 检测到 NVIDIA 时由 `gpu_linux.go` 自动设置 |
| `GITHUB_TOKEN` / `GH_TOKEN` | 可选的 GitHub token，仅用于更新检查（提升匿名 API 限流） |

## 14. 配置键全表

`quaver-astra.json`（`conf.Store`）。读取时都带默认值，损坏/未知值会收口到安全值。

| 键 | 默认值 | 值域 | 含义 |
| --- | --- | --- | --- |
| `Style.Theme` | `system` | `system` / `light` / `dark` | 明暗主题；**唯一真相源**（只有 system 跟随桌面） |
| `Style.AccentMode` | `default` | `default` / `cover` / `system` / `custom` | 强调色来源 |
| `Style.AccentCustom` | `""` | `#rgb` / `#rrggbb`（可带 `#rrggbbaa`） | 自定义强调色（仅 custom 生效） |
| `Style.FontMode` | `system` | `system` / `serif` / `sans-serif` / `monospace` / `custom` | 界面字体模式 |
| `Style.FontCustom` | `""` | 字体 family list（逗号分隔） | 界面自定义字体 |
| `Style.LyricFontMode` | `system` | 同上 | 歌词字体模式（含逐字） |
| `Style.LyricFontCustom` | `""` | 字体 family list | 歌词自定义字体 |
| `Style.LyricScale` | `100` | 整数百分比 `70`–`150` | 歌词缩放（行级与逐字都吃；存整数避免浮点噪声） |
| `Style.LyricAux` | `translation` | `off` / `translation` / `romanization` | 歌词辅助行（翻译优先 / 音译优先 / 关闭） |
| `Style.ShowTranslation` | `true` | 布尔 | 旧布尔键，仅作兼容回落（新代码写 `Style.LyricAux`） |
| `Window.SidebarCollapsed` | `false` | 布尔 | 侧栏是否收起 |
| `Window.QueueOpen` | `false` | 布尔 | 播放队列面板是否展开 |
| `Window.CloseAction` | `tray` | `tray` / `quit` | 关闭按钮行为 |
| `Playing.InhibitSleep` | `true` | 布尔 | 播放音频时阻止系统睡眠 |
| `Playing.Volume` | `0.8` | `0`–`1` | 音量（`Boot` 载入、`SetVolume` 写回） |
| `Playing.Muted` | `false` | 布尔 | 静音（`ToggleMute` 写回） |
| `Playing.PrevReplay` | `replay` | `replay` / `previous` | 上一首行为（重放当前曲 / 跳上一首） |
| `Quality.DefaultQuality` | `auto` | 档位 id（`auto`/`flac`/`320`/`128`/…，取自 `/stream/tiers`） | 默认音质 |
| `Quality.FallbackToQMAtmos` | `false` | 布尔 | 允许回退到全景声（不推荐） |
| `Hotkeys.Enabled` | `true` | 布尔 | 全局快捷键总开关（窗口内快捷键不受它影响） |
| `Hotkeys.Global.<Action>` | 媒体键（见 §5.9） | accelerator 串 | 某动作的全局绑定 |
| `Hotkeys.Local.<Action>` | `CmdOrCtrl+…`（见 §5.9） | accelerator 串 | 某动作的窗口内绑定 |
| `Session.Queue` | `""` | JSON 串 | 播放会话队列快照（曲目/下标/模式/随机） |
| `Session.Pos` | `""` | JSON 串 | 播放会话进度（当前曲 mid + 秒） |
| `Update.Channel` | `stable` | `stable` / `snapshot` | 更新渠道 |
| `Update.AutoCheck` | `true` | 布尔 | 启动自动检查更新 |

## 15. 硬约束与开发约定

1. **无 cgo / `CGO_ENABLED=0`**。原生能力走 purego（Windows WinRT vtable、macOS `objc_msgSend`）或 `x/sys`。
   这是六目标交叉编译的前提，别为了省事引 cgo。
2. **UI 主线程纪律**。渲染与交互在 MyGo 主线程；后台 goroutine 完成后必须 `a.update(fn)` 回投主线程再改 UI 状态。
   `Win == nil`（无头测试/启动早期）时不能碰窗口 API——那些调用会转发到主线程，没有主线程会永久等待。
3. **mpv 不残留**。任何退出/崩溃路径都要收口 mpv（`App.Close` / `Player.Close` + 平台兜底），改动起播/退出逻辑时守住这条。
   退出前先 flush 播放会话，且要在 mpv 关闭之前。
4. **JSON IPC 报文必须是对象**，进度由 mpv 报（不要自算位置）。
5. **明暗与强调色**以 `App` 的 `buildTheme` 为准，不要直接读 `mygo.Theme.IsDark()`。
6. **UI 布局硬约束**见 §5.5（侧栏 MarginX / 头像边长 / 收起态底栏纵排、Children 内建元素、正在播放页列宽常量）。
7. **动效对齐主项目**：新增动效先看主项目 `ui/src/style.css` 的对应口径，再在 `motion.go` 里落地。
8. **第三方**：`third_party/mygo` 是源码内置（`go.mod` replace 到本地，跟上游 main 的伪版本，含 GL 线程模型微调，改动需谨慎并说明理由）；
   `third_party/Typhoeus-go` 是子模块，改动后端应在后端仓库进行并更新子模块指针。
9. **快捷键注册时机**：全局注册只能在 `App.Run` 之后（`Attach` 里）做，之前调用 MyGo 会 panic；录制期间必须停掉窗口内轮询，
   且录制要有超时/离页收回。
10. **会话落盘节奏**：`conf.Set` 每次重写整个文件——进度落盘必须走 `sessionSave` 的防抖 + 节流，不能跟 200ms 心跳写。
11. **提交信息**：现状用中文、动词开头（如「实现自动更新」「修复：Tick 问题导致音乐播放出错」），改一处只做一件事。
12. **许可** AGPL-3.0-only：新增第三方代码要核对许可并更新 `README`/`LICENSE` 说明。

## 16. 常见任务与排查

**加一个页面**

1. `internal/appui/` 建 `xxx.go`，定义 `xxxState` 与 `func (a *App) xxxView(c *ui.Context)`。
2. 在 `app.go` 的 `routeArea` 加 `case r.Match("/xxx"):`。
3. 需要入口就在侧栏 `navItems` 或对应卡片/按钮里 `a.Router.Push("/xxx")`。
4. 需要按 id 缓存就走 `pagecache.go` 的 `getOrCreatePage`；补 `xxx_test.go`（参照 `singer_albums_test.go`）。

**加一个配置项**

1. 选一个 `Section.Key`（见 §14 命名风格），读取时给默认值（`a.Conf.String/Bool/Float(key, def)`）。
2. 在 `settings.go` 的对应 tab 加控件，变更时 `a.Conf.Set`；需要即时生效就顺手重算相关状态（如 `syncSleep()`）。
3. 布尔展示用 `a.prefRow`，下拉用 `ui.Select`（参照音质 / 上一首行为 / 歌词辅助行）。

**加一个快捷键动作**

1. 在 `hotkeySpecs` 加一条（`action` / `label` / `suffix` / 两个作用域的出厂默认 / `hint`），顺序即设置页展示顺序。
2. 在 `runHotkeyAction` 里把新 `hotkeyAction` 落到 player 方法上。
3. 更新 `hotkeys_test.go`（解析、冲突、录制、actions 都有既有范式）。

**播放没声音**

1. 设置 → 关于看 mpv 检测状态与路径；`QAA_MPV` / `QAA_MPV_DIR` 定位是否符合预期。
2. 无声卡环境：`QAA_MPV_AO=null` 验证链路；`QAA_TEST_MPV=1 QAA_MPV_AO=null go test -run TestEngineRealMPV ./internal/audio/`。
3. 看后端 resolve 是否降档（播放条音质胶囊的 `↓` 前缀）与 `Quality.DefaultQuality`。
4. 卡在「加载中」后自动跳下一曲、且系统 mpv 是 **0.38+**：看 `loadfileWantsIndex` / `loadRetried` 的自愈路径是否走到（§7.3）。

**快捷键不生效**

1. 设置 → 快捷键看该条是否被标注「与其他应用占用 / 同键冲突 / Wayland 门户缺失」。
2. 全局与窗口内同键时**全局优先**（系统已把按键截走）；媒体键只能绑全局。
3. Linux Wayland 需要桌面提供 `GlobalShortcuts` 门户（KDE Plasma 6 / GNOME 48+），且要按 deb/rpm/pacman/AppImage 装好
   （桌面得能读到 Astra 的 desktop entry）。

**UI 改动怎么目视验证**

`QUAVER_ROUTE=<path> QUAVER_SCREENSHOT=/tmp/shot.png ./quaver-astra`（等启动画面播完，或启动后按 Escape 跳过），
或离屏定妆照 `QUAVER_SHOTS_DIR=.workbuddy/shots go test ./internal/appui/ -run TestUIShots`。

**NVIDIA / GL 崩溃或黑屏**

确认 `configureGPUEnvironment()` 在 GL 加载前跑过（`main.go` 第一行）；NVIDIA 机器需 `__GL_THREADED_OPTIMIZATIONS=0`。

## 17. 参考

- 主项目：Quaver Music（Electron/TS）开发指南 [`dev/frontend.md`](./frontend.md)
- 产品页：[`quaver-astra.md`](../quaver-astra.md)；仓库 [`README.md`](https://github.com/Team-Quaver/quaver-astra)
- 后端：Typhoeus-go [`third_party/Typhoeus-go`](https://github.com/Team-Quaver/typhoeus-go)
- 框架：MyGo [`third_party/mygo`](https://github.com/egoist/mygo)（`docs/architecture.md` 讲分层、线程模型、无 cgo 原生互操作）
- 发布产物：[releases](https://github.com/Team-Quaver/quaver-astra/releases)
