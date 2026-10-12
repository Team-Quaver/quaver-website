
<p align="center">
  <img src="/imgs/quaver-astra.svg" width="96">
</p>

# Quaver Music Astra

现代，流畅的 Quaver Music，现已轻装上阵

Quaver Astra 是一个实验性项目，基于 Golang + MyGO Native/GPU UI 模式开发，旨在为不依赖插件，想要轻量化版本的用户提供一个选择。

现在属于 MVP 阶段，完全复用 Electron 对应后端 Typhoeus-Go。

Astra 对比 Quaver Music 而言差别在于不会实现 Sparkle 插件系统，在其他方面尽量推进功能实现。

目前计划：
- 同样使用 MPV 播放，减少 Go 解码器问题
- 同样跨平台
- 同样支持 QRC 解码和 Karaoke
- 同样实现系统集成
- 同样跟进基础体验特性，而部分高阶特性仅 Electron 版本支持


<p align="center">
  <img src="/imgs/astra.png" width="864">
</p>

## 架构图

```
             Quaver Music Astra
                      |
          +-----------+-----------+
          |           |           |
          v           v           v
      +-------+  +----------+  +--------+
      | MyGo  |  | Player   |  | Config |
      | 原生UI |  | 播放状态  |  | Vault  |
      +-------+  +----+-----+  +--------+
                      |
             +--------+--------+
             |                 |
             v                 v
      +-------------+    +-------------+
      | Typhoeus-Go |    |     mpv     |
      | 内嵌 HTTP API|    | 音频播放引擎 |
      +------+------+    +-------------+
             |                 ^
             v                 |
      +-------------+     JSON IPC
      | QQ Music API|
      |    / CDN    |
      +-------------+
```