# 更新日志

## v1.2.1 

### 优化

- 将歌单的双击和右键菜单逻辑加入至每日 30 首和我喜欢中
- 由于 Linux 的 Ctrl + Alt + F5 会跳转 TTY，故暂停全局快捷键为 Ctrl + Alt + P
- 修改部分文案

### 修复

- 修复了一个 TypeScript 的类型错误 `globalShortcut.isAccelerator`，该类型错误会导致 Windows 和 OS X 平台无法注册快捷键

## v1.2.0 Ellen / Phoebe

### Typhoeus-Go

Quaver Music 全新后端，Typhoeus-Go 现已正式上线！

原定 1.3 Ellen Eevanescia 版本上线，在经过打磨后，可提前到该版本

该版本的 Typhoeus 后端从 Python（L-1124/QQMusicAPI） 与 Typhoeus 迁移到基于 Go 语言的 Typhoeus-Go，欢迎后端开发者踊跃贡献！

链接：https://github.com/Team-Quaver/typhoeus-go

目前仅迁移与 QM 交互的相关部分，系统集成部分将会尝试从 TypeScript 迁移到 Golang（包括媒体控制 + 电源管理）

### 平台

- 由于 Golang 本体支持交叉编译，现在已试验性为龙芯 ABI 2.0 打包，使用 Electron 34

### 杂项

- 由于部分软件会将该应用认为系节奏游戏 Quaver，故该版本的 dist 名字现已改为 `Quaver Music`
- 由于部分桌面有严格的 XDG 桌面门户注册机制，故该版本的 AppID 现已改成 `red.0w0.quaver`

### 后端

- 现已支持臻品全景声 7.1（atmos71）播放，原定支持 Dolby Atmos 和 DTS:X 由于 MPV 解码器问题故不选择支持，未来如能实现 Go + FFmpeg 则再考虑。
- 现已试验性支持通过 QQ 音乐的会员门控播放会员能播的部分歌曲，非 QQ 音乐会员请勿汇报相关问题（如《视奸》）
  - 已知问题：目前只支持 HQ320 Ogg
  - 已知问题：加载速度会偏慢

### 特性

- 支持非 Karaoke 模式（关闭 AMLL 插件）后的文本大小调节
- 支持随机播放模式
- 支持音频信息流显示
- 支持歌单的快速插队/删除
- 支持全局快捷键（Linux 走 XDG 桌面门户，请确保桌面环境支持）

### 修复

- 修复了从歌单删除歌曲后，点击别的歌曲播放后却跳转到新对应偏好歌曲

### 已知问题

- 应用图标渲染有问题

## v1.1.2 Ellen / Cyrene End

### 优化

- 优化了歌单的热刷新的逻辑

## v1.1.1

### 优化

- 禁止了行为外点击跳转（新建多窗口，点击后键盘控制焦点仍在点击区域）
- 实现了上一首的逻辑设置，现可设置为
- 修复了音质菜单绑定播放控制器，而导致无法滚轮滚动选项的问题


## v1.1.0 Ellen / Cyrene

### 平台支持

- 现已支持以下新平台：
  - Windows x86-64
  - Windows on ARM
  - macOS Apple Silicon

由于 macOS AMD64 平台已经是 Legacy 平台，故决定不再维护，龙芯由于无构建机构建 PyInstaller，远端 QEMU 部署又过慢而不进行构建，正在筹备全新后端的版本，使用 Go 构建，[仓库在这](https://github.com/Team-Quaver/typhoeus-go)，将会于 1.2 Ellen Phoebe 或 1.3 Ellen Evanescia 中上线。

可在 v1.3.0-TyphoeusGo-Early-Alpha 版本中品鉴

--- 

### 特性

- Sparkle： Quaver Music 的插件系统，名字灵感来源于《崩坏：星穹铁道》角色花火，SDK 已开源（但并不完整）
  - Sparkle Marketplace 等待上线
- 现以支持 AMLL 插件化驱动的 QRC 逐字歌词系统
  - 在 dynamic lyrics 测试版中，使用的是集成 SPlayer 的 Lyrics-Kit + Lyrics-DOM，在考虑过后，选择了使用 AMLL
- 正在播放页（NowPlaying）现已经支持更多选项，翻译选项已经移动进去（支持同名搜索，跳转歌手、专辑）
- Linux：现已支持基于 XDG 桌面门户与 Logind 直连的睡眠抑制器
- Linux：现已支持通过桌面音量调节器管理播放器音量
- macOS/Windows：现已支持通过 Objective-C 实现 NowPlaying + C# 实现 SMTC
- 现已支持全屏（画廊）模式
  - 未来版本中，将会支持 Cover Flow 插件，复刻老版本 iTunes 的横屏设计

---

### 优化

- 减少了一部分死代码和内存泄漏导致的内存占用过高的 Bug，在 Linux 平台，该版本会比官方客户端内存占用少一半以上
- 已”屏蔽“ Chromium 默认焦点高亮系统，未来上线快捷键功能后将会禁用键盘操作（预计 Ellen Phoebe 上线的功能）
- 修复歌词的竞态问题

## v1.0.5 - Ellen / Chisa End

### MPV
- 加入了 MPV Watchdog，以避免注销/关机时 Quaver Music 依旧能放歌
- 优化了 CSD/SSD 切换时放曲的逻辑，现在不会因为窗口 Rebuild 而导致暂停播放

### UI
- 现已关闭 Tab 键焦点遍历

## v1.0.4

### 特性
- 加入主菜单栏与宽屏模式播放列表的拖动缩放

### 修复
- 修复了播放控制器 / 进度条的容器问题

### 优化
- 优化了搜索页双击插队的逻辑

## v1.0.3
### 修复

- 关闭主菜单栏的 CSS 超链接拖拽（遗留问题且觉得没用）
- 修复了页面的竞态问题

## v1.0.2
### 修复
- 修复安全问题

## v1.0.1
### 修复
- 修复了 RC 遇到的拖拽播放列表会因为选中文本导致无法排序的 Bug，现已禁止除输入框内选中文本

## v1.0.0-rc

#### 新特性
- 移植了 PR #12 的部分 UI 布局
- QQ 音乐子标题现已可渲染（如《半梦（Studio Live）》
- 支持展示 QQ 音乐会员过期时间
- 加入歌单控制
- 加入播放列表控制
- 加入右键菜单
- 加入插队功能
- 加入主菜单栏展开/收起功能

### 优化
- 退出后现可保留播放列表
- 每日 30 首功能现已可用
- 猜你喜欢现已优化无限电台功能获取歌单的远程逻辑

## v1.0.0-beta

### 特性

- 全局 Tint
- 全新 Playlist
- 动画系统

## v1.0.0-alpha-3

### 功能
- 加入设置持久化
- 加入自定义字体设置
- 引入 MPV 后端

### 修复

- 修复界面逻辑：可点击列表内其他歌手跳转
- 修复 Electron 超时问题

## Ellen Chisa Alpha 2

### 特性

- 完整的歌手页（待优化逻辑）
- 搜索功能
- 远端的收藏/红心功能

### 问题修复

- 歌词颜色回调

## Ellen Chisa Alpha 1

First Look Edition
