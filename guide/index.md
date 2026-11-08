# 介绍

## 简介

![Quaver Music Home|700](/imgs/1-1home-darklight.webp)

---

<p align="center">现代、流畅、可定制的第三方 QQ 音乐客户端</p>

<p align="center">The Ultimate listening machine</p>

---

Quaver Music 最早是为了解决 Linux 上 QQ 音乐官方客户端不好用的问题。现在它已经支持 Windows、macOS 和龙芯后端，也补上了本地曲库、歌词、插件和系统媒体控制。

:::danger 警告
真爱音乐，尊重正版，音乐平台不易，该应用**不提供盗版 QQ 音乐曲目服务！**

本软件系 Vibe Coding 的产物。我会尽量维护，但不保证一直可用。
:::

## 功能特性

- 🎉 可定制：Sparkle 插件可以增加页面、主题、歌词渲染、播放源和菜单项。
- 🖥 跨平台：支持 Windows（x64、ARM64）、Apple Silicon macOS、Linux（x86_64、ARM64）。龙芯平台提供后端二进制。
- 🎧 音频后端：Linux/Windows 默认使用 Liino 在进程内解码并直连系统音频；需要兼容性兜底时可切换到 mpv。
- 📚 系统集成：支持 MPRIS、Windows SMTC、macOS Now Playing，以及播放时的防睡眠请求。
- 📔 歌词：支持 QRC、TTML、LRC，逐字高亮、翻译、音译和日文振假名。
- 💽 本地与网盘：可以扫描本地文件夹、挂载盘和 WebDAV，自动刮削信息；微云音乐网盘中的文件也能直接播放。
- 🎨 自适应主题：封面背景、封面取色、系统强调色，支持深浅模式和跟随系统。
- 🆓 自由开源：AGPL-3.0-only，任何人都可以参与贡献。

## 契机

项目发起人 Ne0W0r1d 一直是 QQ 音乐的用户，也用过 NCM 的第三方客户端、Spotify 和 Apple Music。

QQ 音乐一直没有特别合用的第三方客户端。同属 TME 的有 MoeKoe，网易云这边有 Open Orpheus 和 SPlayer Next。转机是 Lyrune，一个挺好用的 Rust 版 Q 音第三方客户端；但 Rust 运行时偏重，作者自己也不熟。

于是项目改用 Electron：接 Node.js API 方便，开发速度快，也能避开不熟悉的 Rust。原本想用 C++ 写后端，最后落在 TypeScript 和 Go 上。现在 Typhoeus-Go 负责与 QQ 音乐上游通信，前端只处理视图和播放策略。

## 软件架构图

```plaintext
                         Quaver Music
                              |
                +-------------+-------------+
                |                           |
                v                           v
        +---------------+           +----------------+
        |   渲染层       | <--IPC--> |  Electron 主进程 |
        |               |           |                |
        | TypeScript    |           | 窗口 / 托盘     |
        | Vite SPA      |           | 系统集成 / MPRIS |
        +-------+-------+           | 音频后端选择     |
                |                   +-------+--------+
                | HTTP /api                |
                v                          +--------+--------+
        +---------------+                  |                 |
        | Typhoeus-Go   |                  v                 v
        |               |             +---------+      +---------+
        | QQ 音乐接口   |             | Liino   |      |  mpv    |
        | 登录 / 音质   |             | 原生库   |      | 子进程   |
        | 解密 / 中继   |             +---------+      +---------+
        +-------+-------+
                |
                v
        +---------------+
        | QQ 音乐 API   |
        | 与音频 CDN    |
        +---------------+

Sparkle：渲染层插件系统
Liino：默认音频后端；mpv 作为兼容性选项
```
