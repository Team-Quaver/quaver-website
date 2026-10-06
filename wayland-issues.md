# Wayland 常见问题

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

## 