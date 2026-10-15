# Linux 常见问题

该应用基于 Electron，默认状态为 Wayland 模式，可能存在以下问题，以下是解决方式

## 全局快捷键

全局快捷键基于 XDG 桌面门户，无论 X11 环境还是 Wayland 环境，Plasma/GNOME 环境可能会首次打开应用的时候申请注册快捷键。

而 Hyprland，可使用 `hyprctl globalshortcuts` 查询控制点，并在配置文件里面加入你要设置的项目：

```lua
hl.bind(
    "CTRL + ALT + P",
    hl.dsp.global("red.0w0.quaver:toggle")
)
```

目前，Quaver Music 存在的全局快捷键注册如下：

- red.0w0.quaver:toggle：暂停 / 播放
- red.0w0.quaver:prev：上一曲
- red.0w0.quaver:next：下一曲
- red.0w0.quaver:volup：音量加大
- red.0w0.quaver:voldown -> 音量减小

## APM 包性能问题

APM 包目前测试下来出现性能问题的要求如下：

- NVIDIA 显卡输出
- Electron Wayland 模式
- Quaver Design 主题更为严重

目前请尝试使用系统包管/AppImage 解决，或请在 Desktop 文件加入 `--ozone-platform=x11` 缓解。

我们正在尝试联系星火方着手解决该问题。

## 软件更新

这一点不属于 Wayland，但一起写进去了。

当你使用系统原生包时候，如果你选择立即更新，可能会出现打开压缩软件，这是因为你将 deb/rpm 的打开方式设置为了压缩软件，我们一直尊重 xdg 标准，该功能由 Mimelist 和 XDG Open 驱动，这是在 Linux 环境理应做到的。

## 如意玲珑

我们正在努力上线如意玲珑商店！敬请期待！

## Flatpak

由于 GNOME 基金会旗下 Flathub 目前针对 LLM 开发的应用程序策略过于的夸张，故我们将会尽量自维护 Flatpak 包。

更新机制将会和 RPM/Debian 包一致，1.6 见！