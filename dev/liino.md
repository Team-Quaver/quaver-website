# Liino 开发指南

Liino 是 Quaver 的原生音频管线，用纯 Go 实现（核心库 `CGO_ENABLED=0`）。它把解码、DSP、缓冲和系统输出放在宿主进程里，默认不启动 mpv；Node 侧的 WASM 后端只在其他解码后端都失败时兜底。

Quaver Music 通过 `libliino` 动态库和 koffi 在 Electron 主进程里调用它；Quaver Astra 直接以 Go module 链接。Linux 和 Windows 上两边的默认后端都是 Liino；macOS 上两边默认使用 mpv，Liino 仍属实验性选项。

## 1. 定位与边界

- **进程内播放**：音频会话属于宿主进程。Windows 上按应用捕获（Discord、OBS、Kook 等）能只录到 Quaver 自己的声音。
- **统一 PCM**：所有解码器输出 48 kHz、float32、交织 PCM，并保留源声道数。DSP、缓冲和设备输出只认这一种格式。
- **不做文件缓存**：数据从上游读到环形缓冲，再送到设备。解密和播放都不落盘。
- **不替代业务层**：Liino 不知道 QQ 音乐、登录或音质档位。取流、鉴权和降档由 Typhoeus-Go 与调用方处理。

核心库没有 cgo。只有对外导出 C ABI 的 `capi` 包需要 cgo，因为 `-buildmode=c-shared` 必须经过 C 链接器。

## 2. 数据流

```
解码后端（winrt / wmf / avf / ogg / ffgo / libav.js）
    → 48 kHz float32 PCM（保留源声道数）
        → DSP：增益、EQ、效果链、限幅、淡入淡出、电平表
            → pcm.Pipe：有界环形缓冲，带背压
                → 输出驱动：PipeWire / WASAPI / Core Audio
```

`Player` 持有一条完整管线。换歌时替换解码器和数据源，输出会话尽量复用；输出设备的通道数由端点决定，源声道数比端点多时在播放器里下混，少时上混。

## 3. 解码后端

`decode` 包按优先级注册后端。`OpenAuto` 先看 `Guard.Supports`，跳过不可能处理该来源的后端；某个后端返回 `ErrUnsupported` 时继续试下一个。

| 后端 | 平台 | 作用 | 优先级 |
| --- | --- | --- | --- |
| `winrt` | Windows | `Windows.Media.Core.MediaSource` + `AudioGraph`，能读 Store 的「Web Media Extensions」和 HTTP FLAC | 0 |
| `wmf` | Windows | Media Foundation Source Reader，使用系统 codec pack | 1 |
| `avf` | macOS | AVFoundation + CoreMedia，使用系统 Core Audio 解码器 | 0 |
| `ogg` | macOS | 纯 Go 的 Ogg Vorbis/Opus；AVFoundation 没有 Ogg 解复用器 | 5 |
| `ffgo` | amd64 / arm64 | 通过 ffgo 动态加载系统 FFmpeg，无 cgo、无捆绑二进制；Linux 的主后端 | 10 |
| `libavjs` | Node | libav.js 辅助进程，最后兜底（`decode/wasm` 包） | 20 |

Linux 没有统一的系统媒体解码器，所以 ffgo 是主后端。Windows 和 macOS 先试系统解码器；系统不支持的容器再按平台顺序交给 `ogg`、`ffgo` 或 `libavjs`。例如 macOS 的 Ogg 由纯 Go 后端处理，APE、WavPack、DSD 等则要系统装了 FFmpeg 才能交给 ffgo。

`decode.Statuses()` 或 `liino_diagnostics` 会返回每个后端的可用状态和实测 codec 列表。Linux 上的 codec 列表由 `avcodec_find_decoder_by_name` 实际探测，发行版精简 `libavcodec` 时不会静默成功。

平台解码器的边界：

- WMF 和 AVFoundation 只接受 URL（file/http/https）。`decode.Source.Reader` 这种字节流会被拒绝并交给 ffgo；需要自定义 User-Agent 或 Cookie 的云盘直链同理。
- Windows 的 Ogg/Opus 先由 `winrt` 尝试，需要系统安装 Microsoft Store 的「Web Media Extensions」；不可用时再交给 `wmf` 或 `ffgo`。
- macOS 访问本地 sidecar 的 `http://127.0.0.1` 时，打包的 `Info.plist` 要放行本地网络（`NSAppTransportSecurity` / `NSAllowsLocalNetworking`）。
- 7.1.4 的 12 声道 Opus 会被 Windows 解码器拒绝，最终仍由 ffgo 或 `libavjs` 处理。

## 4. PCM 与输出

`pcm` 包负责采样格式转换、声道布局和环形缓冲。默认参数：

| 常量 | 值 | 含义 |
| --- | --- | --- |
| `DefaultSampleRate` | 48000 | 统一采样率 |
| `DefaultChannels` | 2 | 播放器内部默认通道数 |
| `DefaultRingFrames` | 5 秒 | 环形缓冲容量 |
| `DefaultPrerollFrames` | 一个 chunk | 起播前预滚 |
| `DefaultPeriodFrames` | 输出默认周期 | 约 5ms |
| `DefaultFadeOut` | 120ms | 切歌淡出 |

输出驱动同样按优先级注册：

- Linux：`pipewire`，通过 purego-pipewire 调用，不用 ALSA。
- Windows：`wasapi`，共享模式，进程内渲染。
- macOS：`coreaudio`。
- 测试：`null`，按真实时钟计时但不打开设备。

`output.Statuses()` 会探测驱动和运行库。设置页的「关于」把不可用原因直接展示给用户，例如缺少 `libpipewire-0.3` 或系统音频服务没有启动。

## 5. Go API

### 5.1 Config

`liino.New(Config)` 创建播放器。零值可用，字段如下：

| 字段 | 默认 | 说明 |
| --- | --- | --- |
| `Decoder` | 空 | `winrt` / `wmf` / `avf` / `ogg` / `ffgo` / `libavjs`；空表示按来源自动选择。注意 WASM 后端的注册名是 `libavjs`，不是 `wasm` |
| `Driver` | 空 | `pipewire` / `wasapi` / `coreaudio` / `null`；空表示平台默认 |
| `DeviceID` | 空 | 输出端点；空表示系统默认 |
| `AppName` / `StreamName` | 空 | 系统混音器显示的名字 |
| `RingFrames` | 5 秒 | 环形缓冲帧数 |
| `PrerollFrames` | chunk | 预滚帧数 |
| `PeriodFrames` | 驱动默认 | 输出周期 |
| `MonitorInterval` | 40ms | 设备监控间隔 |
| `DevicePolling` | 2s | 设备变化轮询 |
| `FadeOut` | 120ms | 淡出时长 |
| `Volume` | 1.0 | 线性主增益 |
| `EQ` | 空 | 初始 EQ band |
| `Limiter` / `LimiterDB` / `LimiterAttack` / `LimiterRelease` | 关 | 限幅器 |
| `Log` / `OnError` | 空 | 诊断日志 / 异步错误回调 |

`New` 不会打开音频设备。`Play` 才建立输出会话，所以无头机器也能构造播放器。

### 5.2 Player

| 方法 | 语义 |
| --- | --- |
| `Open(ctx, Source, OpenOptions)` | 异步载入；`StartAt` 指定起点，`AutoPlay` 决定是否自动起播 |
| `Play()` / `Pause()` / `Stop()` | 播放、暂停、停止并卸载来源 |
| `Seek(d)` / `SeekTo(sec)` | 异步跳转；失败时会在目标位置重建解码器 |
| `SetVolume(v)` / `SetMuted(on)` | 线性音量与静音 |
| `SetEQ(bands)` / `SetLimiter(on)` | 运行时调整 DSP |
| `Snapshot()` | 当前状态、位置、时长、缓冲、音量、驱动、解码器、codec、欠载和峰值 |
| `Clock()` | 高精度时钟：可听位置、缓冲位置、输出延迟、单调时钟 |
| `Events(size)` | 订阅事件，返回通道和取消函数 |
| `Close()` | 释放设备会话和解码线程，幂等 |

`decode.Source` 二选一：`URI` 或 `Reader`。`URI` 支持绝对路径、`file://` 和底层解复用器认识的协议；`Reader` 用于宿主已经持有字节流的场景。

### 5.3 事件

`Event` 带 `Gen` 和 `SeekGen`。消费者必须丢掉旧代次的事件，否则上一首歌的迟到回调会改到当前界面。

| Kind | 含义 |
| --- | --- |
| `loaded` | 来源已打开，元数据可用 |
| `playing` | 音频正在送到设备 |
| `paused` | 会话还在，按请求静音 |
| `buffering` | 管线暂时没有数据 |
| `ready` | 缓冲完成，恢复播放 |
| `seeked` | 跳转生效 |
| `ended` | 到达文件末尾并排空 |
| `failed` | 播放失败 |
| `device-lost` | 输出端点消失 |
| `device-changed` | 当前端点变化 |
| `closed` | 播放器已释放 |

## 6. C ABI 与 Node 绑定

Electron 不直接链接 Go，而是加载 `libliino` 动态库。C ABI 在 `capi/capi.go`，构建时加 `liino_capi` tag：

```sh
cd vendor/Liino
scripts/build-capi.sh              # 当前平台
scripts/build-capi.sh all          # linux/amd64、linux/arm64、windows/amd64、darwin/arm64
```

`build-capi.sh` 只在这一层打开 cgo，并用 `-buildmode=c-shared` 生成 `.so` / `.dylib` / `.dll`。交叉编译需要对应平台的 C 编译器；没有编译器的目标会明确报 `SKIP`，不会伪造产物。

Node 侧使用 `@team-quaver/liino-node`：

```js
import { Liino } from "@team-quaver/liino-node";

const liino = new Liino();
const player = liino.create({ volume: 0.75 });

player.open("file:///music/song.flac", { auto_play: true });
player.waitEvent(5000); // { kind: "loaded", snapshot: ... }

player.seek(30_000);
console.log(player.clock().position_ms);
player.close();
```

`defaultLibrary()` 先找 `vendor/Liino/build/<platform>-<arch>`，再找 `vendor/Liino/node/lib/<platform>-<arch>`。Electron 打包后要把库放在 `resources/liino` 或显式传给 `new Liino(path)`；koffi 的 `dlopen` 只认真实文件路径，所以库必须从 asar 里解出来。

从 C ABI 返回的字符串由绑定层复制并立即释放，JS 侧不需要调用 `liino_free_string`。

## 7. 在 Quaver 中的接入

### 7.1 Quaver Music（Electron）

- `ui/electron/audio/backend.ts` 是唯一的后端门面。它只注册一个 `quaver:audio` handler，按当前引擎转发命令；切换后端时先拆旧引擎，再初始化新引擎。
- `ui/electron/audio/liino-engine.ts` 用 koffi 加载 `libliino`。`QUAVER_LIINO`、`QUAVER_LIINO_LIB`、`QUAVER_LIINO_DIR` 可以覆盖库路径。
- 默认后端是 Liino；macOS 默认 mpv。选择 Liino 但库无法 `dlopen` 时，会记录原因并回落到 mpv，而不是让应用无声启动。
- 渲染层只看到统一的音频命令，不关心底下是 Liino 还是 mpv。

### 7.2 Quaver Astra（Go）

- `internal/audio/engine.go` 直接链接 Liino，把 `liino.Player` 适配成 `player.Engine`。
- 配置里 `Decoder` 留空，由 Liino 按来源选择；`AppName` 固定为 `Quaver Astra`，Windows 按应用捕获依赖这个名字。
- 载入失败分两类：流本身打不开时交给 player 降档重试；解码后端或输出设备整体不可用时，让 player 停止自动跳歌。
- 位置取 `Clock().Position`，它已经扣掉输出延迟；歌词和进度条不要再用墙钟推算。

## 8. 构建与测试

需要 Go 1.27.3+：

```sh
cd vendor/Liino
CGO_ENABLED=0 go build ./...
CGO_ENABLED=0 go test ./...
```

跨平台编译核心库不需要 cgo：

```sh
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build ./...
CGO_ENABLED=0 GOOS=darwin  GOARCH=arm64 go build ./...
```

测试覆盖解码后端选择、PCM 转换、DSP、环形缓冲、seek 重建和输出驱动。真实设备测试在无声卡环境用 `Driver: "null"`；Node 侧有 `node/smoke.ts`、`probe-http.mjs`、`probe-seek.mjs` 等脚本。

## 9. 平台依赖与排障

| 平台 | 解码 | 输出 | 常见问题 |
| --- | --- | --- | --- |
| Linux | 系统 FFmpeg 共享库（`libavformat`、`libavcodec`、`libavutil`、`libswresample`） | PipeWire | 缺 `libav*` 时只剩 `libavjs` 兜底或没有后端；缺 `libpipewire-0.3` 时没有输出 |
| Windows | WinRT / Media Foundation；缺失时 ffgo | WASAPI 共享模式 | N 版系统要装 Media Feature Pack；Ogg/Opus 要装「Web Media Extensions」 |
| macOS | AVFoundation；Ogg 走纯 Go；其他回退 ffgo | Core Audio | 访问本地 HTTP 需要 ATS 放行；Liino 目前仍是实验性后端 |
| LoongArch64 | ffgo 只覆盖 amd64/arm64 | 取决于平台 | 可以启动，但没有可用的解码后端 |

排障顺序：

1. 看 `liino_diagnostics` 或设置页「关于」：解码后端和输出驱动分别是否可用，原因是什么。
2. 确认系统运行库。Linux 最常见的是没装 FFmpeg 共享库或 PipeWire。
3. 开 `QAA_AUDIO_LOG=1` 或 Node 侧的 `Log` 回调，看 FFmpeg 的实际报错。
4. 拖动进度时出现 FLAC 帧重同步告警是预期行为，Liino 会跳过损坏帧继续播放。
5. 仍然无法出声时，切到 mpv 后端验证取流和系统音频是否正常，再回来查 Liino 的后端探测。

## 10. 开发约定

- 不要改统一 PCM 的采样率和声道语义。下游 DSP、缓冲和输出都以 `decode.Canonical` 为准；需要下混时在播放器里做，解码器不自行混音。
- 事件必须带代次，消费者必须丢弃旧代次。换歌、seek 重建和输出设备变化都靠这条避免串状态。
- 不要持锁调用 Liino 或设备 API。音频回调和宿主 UI 线程互等会直接卡死。
- 失败要分清“这条流不行”和“整个后端不行”。前者触发降档/换源，后者应停止重试并报可读错误。
- 不把解密后的音频写到磁盘，也不做整文件缓冲。Range 中继和流式解密依赖这个边界。
- 改 QMC、解码或设备相关行为后，至少跑 `CGO_ENABLED=0 go test ./...`；改 C ABI 后补跑 Node smoke。

## 参考

- 源码：[`vendor/Liino`](https://github.com/Team-Quaver/liino)
- Node 绑定：[`vendor/Liino/node`](https://github.com/Team-Quaver/liino/tree/main/node)
- C ABI：[`vendor/Liino/capi/liino.h`](https://github.com/Team-Quaver/liino/blob/main/capi/liino.h)
- Quaver Music 音频接线：`ui/electron/audio/`
- Quaver Astra 音频适配：`internal/audio/`
