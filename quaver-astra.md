
<p align="center">
  <img src="/imgs/quaver-astra.svg" width="96">
</p>

# Quaver Music Astra

现代，流畅的 Quaver Music，现已轻装上阵

Quaver Astra 是一个实验性项目，基于 Golang + MyGO Native 模式开发，旨在为不依赖插件，想要轻量化版本的用户提供一个选择。

现已基本可用，完全复用 Electron 对应后端 Typhoeus-Go。

Astra 对比 Quaver Music 而言差别在于不会实现 Sparkle 插件系统和本地音乐，在其他方面尽量推进功能实现，定位而言，一个愿意为 Electron 买单，但是可以换来极致体验的用户，一个为不愿意再多个 WebView，只需要基础的 Q 音在线播放体验即可。

目前计划：
- 同样使用 MPV 播放，减少 Go 解码器问题
- 跨平台
- 同样支持 QRC 解码和 Karaoke
- 同样实现系统集成
- 同样实现音译

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
