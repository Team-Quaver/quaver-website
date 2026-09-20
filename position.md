# Quaver Music 开发立场
 
## MPRIS
作为标准的歌曲信息/音频控制协议，已经实现

## Wayland
这是这个软件诞生之初最先想到的点，XWayland 就不应该成为首选项，能支持 Wayland 的情况，Wayland First 与 X11 兜底才是正确的选择，如明明可以支持 Wayland 但仅 XWayland，是对用户的一个不负责任。（如 QQ 和飞书）

## XDG Inhibit
- 该内容 MPV/Chromium 均提供
- 会为 WM 环境兜底（使用 Logind Inhibit）

## XDG Backgrond 
虽然是 XDG 标准，但目前仅限 GNOME 优先使用，多数桌面/WMShell 自带 Tray/KStatusNotifierItems，且已经实现了托盘，故不可能单纯为无 Tray 环境的 GNOME 实现后台应用，请 GNOME 用户自行安装 `AppIndicator and KStatusNotifierItems support` 扩展。

## XDG Secret Service
已通过 Electron safeStorage 实现

## Rust
目前来说，Python 后端足够使用，我们将会评估 Electron 和 Python 的性能，为 Flutter 和 QML 版本做评估。

而且私心来说，我的 Rust 能力实在不行。与此同时，Rust 前端技术栈也没有十分适合这个软件的选择，GPUI 有 Lyrune 了没必要重造轮子。

而目前来说，后端也正在评估使用 Zig 或者 C++ 实现，毕竟 Python 还是有点不够格。

## 跨平台
除龙芯较为麻烦（因为 Python 和 Electron）
ARM Mac，ARM Windows，X86 Windows 都是我们计划的一个平台

我们也会评估龙芯用户态度，量力而行
