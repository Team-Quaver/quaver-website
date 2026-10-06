# Typhoeus

Typhoeus，是 Quaver Music 的后端。

前期打样和 1.0/1.1 使用的后端是基于 L-1124 的 Python API，Python 本质脚本语言，用起来还是憋屈，且对跨平台并不友好，这就是转 Go 的一个契机。

现行版本为 Typhoeus - Go，系 Quaver Music 的下一代后端，基于 Golang 实现。

Typhoeus-Go 负责的是与 QM 的通信和一些 TypeScript 无法完成的系统集成功能的部分。

而 Typhoeus 为遗留项，曾用于负责 Python 后端的抽象 + MPRIS，现在仅负责 MPRIS，正在计划迁移回前端或整合至 Golang 中（与 MPV/FFmpeg 集成一起）。

## QM 相关

- QMC2 内存解密流播不落盘
- 会员信息获取
- 会员门控
- 获取授权后的明文音频流
- 音质嗅探

## 系统集成

- 电源管理（XDG Inhibit/macOS 电源断言/Windows 电源管理）
- MPRIS 支持