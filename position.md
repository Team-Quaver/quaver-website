# Quaver Music 开发立场
 
## MPRIS

作为标准的歌曲信息/音频控制协议，已经实现

与以下标准同理
- Windows SMTC
- macOS NowPlaying
## Wayland

这是这个软件诞生之初最先想到的点，XWayland 就不应该成为首选项，能支持 Wayland 的情况，Wayland First 与 X11 兜底才是正确的选择，如明明可以支持 Wayland 但仅 XWayland，是对用户的一个不负责任。（如 QQ 和飞书）

## XDG Inhibit

播放音乐禁止睡眠/画廊模式禁止熄屏的功能实现

目前实现为：XDG 桌面门户优先 -> Logind 兜底

与以下标准同理
- Windows 电源请求
- macOS 电源断言

## XDG Backgrond 

虽然是 XDG 标准，但目前仅限 GNOME 优先使用，多数桌面/WMShell 自带 Tray/KStatusNotifierItems，且已经实现了托盘，故不可能单纯为无 Tray 环境的 GNOME 实现后台应用，请 GNOME 用户自行安装 `AppIndicator and KStatusNotifierItems support` 扩展。

## XDG Secret Service

已通过 Electron safeStorage 实现

## Rust

私心来说，我的 Rust 能力实在不行。与此同时，Rust 前端技术栈也没有十分适合这个软件的选择，GPUI 有 Lyrune 了没必要重造轮子。

与此同时，我们已经迁移至 Go，复用 Go 后端的，非 WebView 版本的 Quaver Astra 也正在开发

## 跨平台

我们已经实现三大系统，三大架构的构建

- Windows
	- AMD64
	- ARM64
- Linux
	- AMD64（Debian/RPM/Pacman/AppImage）
	- ARM64（Debian/RPM/Pacman/AppImage）
	- loongarch64（Experimental，Debian For Debian&AOSC）
- macOS
	- ARM
	- 由于 X86_64 于 macOS 27 不再发版，故不再为 X86 构建
	- 黑苹果用户如有需要可自行尝试构建