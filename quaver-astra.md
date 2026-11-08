<p align="center">
  <img src="/imgs/quaver-astra.svg" width="96">
</p>

# Quaver Music Astra

现代、流畅的 Quaver Music，换成了原生界面

Quaver Astra 是一个实验性项目，基于 Golang + MyGo 原生 UI 开发。它面向不需要插件、希望少一层 WebView 的用户，复用 Quaver Music 的 Typhoeus-Go 后端。

界面由 MyGo 直接在 GPU 上绘制。Linux 走 GtkGLArea 和 OpenGL，不启动 WebKitGTK；窗口打开快，内存占用也比 Electron 版低。播放默认交给 Liino：解码、DSP、缓冲和系统输出都在 Astra 进程内完成。macOS 上 Liino 仍是实验性后端，因此默认使用 mpv 子进程。

与 Quaver Music 相比，Astra 不实现 Sparkle 插件系统和本地音乐。搜索联想、部分歌单管理功能也尚未补齐。其余在线播放能力尽量与主项目保持一致：登录、首页、歌单、搜索、每日 30 首、无限电台、歌词、系统媒体控制和自动更新都已可用。

<p align="center">
  <img src="/imgs/astra.webp" width="864">
</p>

## 功能

- 首页：无限电台、新歌速递、推荐歌单、AI 歌单和排行榜。
- 歌单与搜索：我创建/收藏的歌单、歌单详情、歌曲与歌单搜索、热搜词。
- 播放：队列、插队、拖拽排序、循环、随机、会话恢复和音质切换。
- 歌词：QRC 逐字歌词、振假名、翻译与音译辅助行；没有 QRC 时回退行级 LRC，也可以导入 LRC/QRC/TTML。
- 网盘：读取微云音乐网盘，支持网页授权与手动令牌，可直接播放并透明处理加密与 Range 请求。
- 系统集成：Linux MPRIS、Windows SMTC、macOS Now Playing，播放时阻止系统睡眠。
- 外观：封面取色、系统强调色、明暗主题、自定义界面与歌词字体。
- 更新：稳定版与快照版两个渠道；AppImage、单文件二进制和 Windows 便携目录支持原地替换。

## 平台说明

Linux（AMD64/ARM64）、Windows（AMD64/ARM64）和 macOS（ARM64）有完整的发布包。LoongArch64 也提供 DEB/RPM/Pacman 和 tarball，但 Liino 的 FFmpeg 后端目前只覆盖 amd64/arm64，龙芯构建可以启动，暂时没有可用的解码后端。如果系统里有 mpv，可以在设置里切到 mpv 后端。

## 架构图

```
                    Quaver Astra
                         |
        +----------------+----------------+
        |                |                |
        v                v                v
   +---------+     +----------+     +---------+
   | MyGo    |     | Player   |     | Config  |
   | 原生 UI |     | 播放状态 |     | Vault   |
   +---------+     +----+-----+     +---------+
                         |
            +------------+------------+
            |                         |
            v                         v
     +-------------+           +-------------+
     | Typhoeus-Go |           |   Liino     |
     | 进程内 HTTP |           | 进程内音频  |
     +------+------+           +------+------+
            |                         |
            v                         v
     +-------------+           +-------------+
     | QQ 音乐 API |           | PipeWire /  |
     | 与音频 CDN  |           | WASAPI /    |
     +-------------+           | Core Audio  |
                               +-------------+

     mpv 子进程是可选后端（macOS 默认）
```
