# 介绍

## 简介

![Quaver Music Home|700](/imgs/1-1home-darklight.webp)

--- 

<p align="center">现代、流畅、百变的第三方 QQ 音乐客户端</p>

<p align="center">The Ultimate listening machine</p>

---

Quaver Music，最早是为了解决 Linux 上 QQ 音乐官方客户端不好用而生。

而现在，它已然成为一个完善，现代，流畅，百变，以极致体验而生的第三方 QQ 音乐客户端。

:::danger 警告
真爱音乐，尊重正版，音乐平台不易，该应用**不提供盗版 QQ 音乐曲目服务！**
本软件系 Vibe Coding 的产物，虽然我会尽力尝试个人维护，但不提供可用性保证
:::

# 功能特性

- 🎉 百变：支持 Sparkle 插件，可用 Sparkle 插件更换主题，个性化自己的播放页
- 🖥 跨平台：支持 Windows（X86、ARM） / ARM macOS / Linux（X86、龙芯、ARM）
- 📚 系统集成：支持 Dbus MPRIS、Windows SMTC、macOS NowPlaying 与 Logind Inhibit、Windows 电源请求、macOS 电源断言
- 📔 丰富歌词：支持 QRC 和 LRC，逐字高亮和翻译
- 🎨 自适应主题：基于封面背景 + Tint，支持深浅模式和跟随系统
- 💪 持续维护：基于 Vibe Coding + 人力审核，为代码健康保驾护航（吗？）
- 🆓 自由开源：基于 AGPLv3 协议，人人都可参与贡献

## 契机

项目发起人 Ne0W0r1d 一直是 QQ 音乐的用户，也用过 NCM 的第三方客户端，Spotify，Apple Music。

然而 QQ 音乐一直没有什么好用的第三方客户端，而同 TME 系的有 MoeKoe ，网易云有 Open Orpheus 和 SPlayer Next，而转机是在 Lyrune，一个挺好用的 Rust Q 音第三方客户端，但可惜 Rust 太重了，而且我 Rust 是真的菜。

所以使用 Electron，对接入 NodeJS 的 API 而言也很方便，开发也很快，也可以避免我孱弱的 Rust 开发，与此同时，后端我也能玩 C++ 这一个我更熟悉的编程语言（虽然最后变成了 TypeScript + Python）。故此项目诞生，现正在 Prototype 阶段，逐步新增功能。

## 软件架构图

```plaintext
                  Quaver Music
                       |
          +------------+------------+
          |                         |
          v                         v
   +--------------+         +---------------+
   |    前端       | <------>| Electron 主机  |
   |              |  IPC    |               |
   | TypeScript   |         | Window / Tray |
   | Vite MPA     |         | System / Audio|
   +------+-------+         +-------+-------+
          |                         |
          | HTTP /api               | JSON IPC
          v                         v
   +--------------+          +---------------+
   | Typhoeus-Go  | -------> |     mpv       |
   |              |  Stream  | Audio Engine  |
   | QQ Music API |          |               |
   | System-Native |         +---------------+
   +------+-------+
          |
          v
   +--------------+
   |  QQ Music    |
   | API / CDN    |
   +--------------+

   Sparkle: Frontend 插件系统
   MPRIS:   Electron <-> Linux D-Bus
```     

