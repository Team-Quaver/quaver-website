# macOS 常见问题

macOS 也算一个重要的平台之一，但由于财力等问题，我们无法为其做完整测试，但根据之前的测试来说，我们已经查阅到以下问题

## Quaver Music 已损坏，打不开，您应该将其移至废纸篓

macOS 由于存在门禁系统，会导致无签名程序无法正常运行，请使用以下指令执行

````none
sudo xattr -rd com.apple.quarantine /Application/quaver.app
````

## 无法播放音乐

由于 Mach-O 目前最低标准是 macOS 14, Ventura 以下的版本无法正常使用 MPV 后端，请切换至 Blink 后端，或更新至最新系统

## 大 托 盘

该问题已在尽量缓解，包括不限于使用小位图，单色图标

## X86 支持

由于 macOS 27 Golden Gate 已正式移除 X86_64 支持，而 macOS 28 已确认将移除 Rosetta 2（仅保留针对 Wine 和部分游戏的子集）

Quaver Music 将不会构建 Universal 包，如果你是黑苹果用户，请选择自行编译