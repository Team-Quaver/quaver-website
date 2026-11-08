---
layout: home
hero:
  name: Quaver Music
  text: 
  tagline: 现代、流畅、可定制
  image:
    src: /imgs/fav.svg
    alt: Quaver Music
  actions:
    - theme: brand
      text: 快速开始
      link: /guide/
    - theme: alt
      text: 前往 GitHub
      link: https://github.com/team-quaver/quaver-music
    - theme: alt
      text: 下载客户端
      link: /download/
features:
  - icon: 🐧
    title: 跨平台
    details: 支持 Linux（x86_64、ARM64）、Windows x64/ARM64 与 Apple Silicon macOS。龙芯平台目前提供后端二进制。
  - icon: 🎧
    title: 原生音频
    details: Linux/Windows 默认由 Liino 在进程内解码并直连 PipeWire 或 WASAPI；macOS 默认走 mpv。需要兼容性兜底时，两个平台都可以切换后端。
  - icon: 🌳
    title: 插件与主题
    details: Sparkle 可以增加页面、主题、歌词渲染、播放源和菜单项。偏轻量的 Astra 版本不包含插件系统。
  - icon: 🆓
    title: 开源
    details: 使用 AGPL-3.0-only 许可，源码公开，欢迎提交 Issue 和 Pull Request。
---

## 两个客户端

Quaver Music 是功能完整的桌面客户端。界面使用 Electron + Vite + TypeScript 构建，后端由 Typhoeus-Go 提供，通过 Sparkle 插件系统扩展界面和播放能力。

Quaver Astra 面向不需要插件的用户。它使用 MyGo 原生 UI，不开 WebView，后端直接嵌入进程，播放交给 Liino；macOS 默认改用 mpv 子进程。两版共用 Typhoeus-Go，因此登录、曲库、歌词和音质处理的口径基本一致。

<p align="center">
  <img src="/imgs/1-1home-darklight.webp" width="480">
</p>

<p align="center">
  <img src="/imgs/astra.webp" width="480">
</p>

## 播放

Liino 把解码、DSP、缓冲和系统输出放在同一进程里。PCM 统一为 48 kHz float32，保留源声道数；输出声道数由设备端点决定，源声道更多时下混，更少时上混。解码后端按平台选择：Linux 使用 ffgo 动态加载系统 FFmpeg；Windows 优先 WinRT MediaSource，再用 Media Foundation 兜底；macOS 优先 AVFoundation，Ogg 交给纯 Go 解码，其他系统解码器不支持的容器再回退 FFmpeg。

需要 mpv 的缓存或断流重连能力时，Quaver Music 和 Astra 都可以切换后端。Astra 在 macOS 上默认使用 mpv，因为 Liino 在该平台仍是实验性后端。

## 界面

两版都使用毛玻璃、封面取色和系统强调色。Quaver Music 支持自绘标题栏、桌面歌词、频谱和多种播放条布局；Astra 沿用同一套动效和正在播放页的视觉语言，但把渲染层换成了原生绘制。

<p align="center">
  <img src="/imgs/nowplaying.webp" width="480">
</p>

<p align="center">
  <img src="/imgs/astra-np.webp" width="480">
</p>

## 曲库

在线部分通过 QQ 音乐接口读取歌曲、歌单、榜单、每日 30 首和无限电台。Quaver Music 还支持本地文件夹、挂载盘和 WebDAV 曲库，能够扫描标签、自动刮削并导入歌词；匹配到 QQ 曲库的本地歌曲可以使用在线 QRC 逐字歌词。微云音乐网盘中的文件也可以直接加入播放队列。

## 歌词

内置歌词引擎支持 QRC、TTML 和 LRC。QRC 与 TTML 提供逐字时间轴、翻译和音译，日文歌词会按 `[kana:]` 元数据显示振假名。没有逐字歌词时回到行级 LRC，桌面歌词窗和正在播放页共用同一份播放状态。

## 兼容

项目最早是为了解决 Linux 上 QQ 音乐官方客户端不好用的问题，后来扩展到 Windows、macOS 和龙芯后端。Quaver Music 支持 MPRIS、Windows SMTC、macOS Now Playing，以及播放期间的防睡眠请求。

## [下载试用](/download/)
