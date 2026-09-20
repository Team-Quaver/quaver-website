# 介绍

## 简介

![Quaver](/imgs/1-0sc.webp)

Quaver Music 是一个基于 Electron + Vite 开发的第三方 QQ 音乐客户端。

核心目的是优化 Linux QQ 音乐使用体验，目前已发布正式版本。

## 契机

项目发起人 Ne0W0r1d 一直是 QQ 音乐的用户，也用过 NCM 的第三方客户端，Spotify，Apple Music。

然而 QQ 音乐一直没有什么好用的第三方客户端，而同 TME 系的有 MoeKoe ，网易云有 Open Orpheus 和 SPlayer Next，而转机是在 Lyrune，一个挺好用的 Rust Q 音第三方客户端，但可惜 Rust 太重了，而且我 Rust 是真的菜。

所以使用 Electron，对接入 NodeJS 的 API 而言也很方便，开发也很快，也可以避免我孱弱的 Rust 开发，与此同时，后端我也能玩 C++ 这一个我更熟悉的编程语言（虽然最后变成了 TypeScript + Python）。故此项目诞生，现正在 Prototype 阶段，逐步新增功能。

## 软件架构图

```
┌────────────────────────────────────────────┐
│                 Quaver Electron            │
│                                            │
│  ┌──────────────────────────────────────┐  │
│  │ Renderer                             │  │
│  │ Vite + Native TS + DOM               │  │
│  │ Hash SPA / Views / Player State      │  │
│  └──────────────────┬───────────────────┘  │
│                     │ Electron IPC         │
│                     ▼                      │
│  ┌──────────────────────────────────────┐  │
│  │ Electron Main (MJS)                  │  │
│  │ Window / Config / Tray / Audio / IPC │  │
│  └───────┬──────────────┬───────────────┘  │
│          │              │                  │
│          │ stdio NDJSON │ Unix Socket      │
│          ▼              ▼                  │
│   MPRIS Daemon         mpv                 │
│   TS + D-Bus           Audio Engine        │
│                                            │
└──────────┬─────────────────────────────────┘
           │ localhost HTTP to Typhoeus
           ▼
┌────────────────────────────────────────────┐
│ Python Sidecar                             │
│ FastAPI + Uvicorn + Typhoeus               │
│ QQMusicApi adapter / stream relay          │
└────────────────────────────────────────────┘
           │
           ▼
     QQ Music / CDN
```     
