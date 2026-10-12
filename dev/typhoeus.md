# Typhoeus / Typhoeus-Go 开发指南

> 本指南覆盖 Quaver 的本地后端：**Typhoeus-Go**（`vendor/Typhoeus-go`，现行主后端，Golang sidecar）与遗留 **Typhoeus** 仓库目前唯一存活的部分（`vendor/Typhoeus/mpris`，Linux MPRIS 守护进程）。
> 目标与前端指南一致：**所有变量、所有取值域、所有端点、所有外部契约**登记在此，并做分类。读完即可上手改。
>
> 适用范围：仓库 `/home/ne0w0r1d/Desktop/quaver`（Go 后端在 `vendor/Typhoeus-go/`，MPRIS 在 `vendor/Typhoeus/mpris/`，接线在 `ui/`）。常量以当前 main 为准。
>
> **不写入本指南的部分**：Typhoeus 的 Python 后端（`typhoeus/`、`quaver_server/`）已从旧仓库整体删除（"Remove Python"，2026-09），现行代码不再引用它——按「用不到的不写」原则不再展开；旧 README 仅作历史参考。

## 目录

1. [总览与架构](#1-总览与架构)
2. [模块地图](#2-模块地图)
3. [环境变量全量](#3-环境变量全量)
4. [端口、配置目录与文件](#4-端口配置目录与文件)
5. [凭证模型与 QCRED1 交接协议](#5-凭证模型与-qcredl-交接协议)
6. [会话与调用守卫](#6-会话与调用守卫)
7. [HTTP API 端点全表](#7-http-api-端点全表)
8. [统一信封与错误码映射](#8-统一信封与错误码映射)
9. [音质档位体系（tierTable）](#9-音质档位体系tiertable)
10. [播放流中继与断流续传](#10-播放流中继与断流续传)
11. [file_type 序号表与取链通道](#11-file_type-序号表与取链通道)
12. [内容域常量（歌单/推荐/搜索/歌手/评论/歌词）](#12-内容域常量)
13. [登录域（QQ/微信/手机客户端）](#13-登录域)
14. [qqmusic SDK 基础层（协议常量）](#14-qqmusic-sdk-基础层)
15. [QMCv2 解密](#15-qmcv2-解密)
16. [QRC 逐字歌词解密](#16-qrc-逐字歌词解密)
17. [电源抑制 inhibit](#17-电源抑制-inhibit)
18. [MPRIS 守护进程（遗留 Typhoeus 存活部分）](#18-mpris-守护进程)
19. [前端接线契约（ui/）](#19-前端接线契约ui)
20. [构建、测试与调试](#20-构建测试与调试)
21. [硬约束与红线清单](#21-硬约束与红线清单)

---

## 1. 总览与架构

### 1.1 链路

```
渲染层 ui/src ──同源 /api──> Node 中继（dev: ui/src/relay.ts；打包: ui/electron/native-server.ts）
    ──http://127.0.0.1:$QUAVER_PORT──> Typhoeus-Go sidecar ──HTTPS/WSS──> QQ 音乐上游
         ▲                                    │                            ├ u.y.qq.com/cgi-bin/musicu.fcg（CGI）
Electron 主进程 spawn                          │                            ├ u.y.qq.com/cgi-bin/musics.fcg（带 zzc 签名）
stdin 注入 QCRED1 ─────────────────────────────┤                            ├ ssl.ptlogin2.qq.com / graph.qq.com（QQ 登录）
stdout 收回 QCRED1 ────────────────────────────┤                            ├ open.weixin.qq.com / lp.open.weixin.qq.com（微信登录）
                                               │                            ├ mu.y.qq.com:443 MQTT 5.0 over WSS（手机扫码）
Electron 主进程 ──stdio NDJSON──> mpris-daemon ─┤                            ├ api.tencentmusic.com/tme/trpc/proxy（QIMEI）
（Linux；win/mac 走 navigator.mediaSession）    └── Range 回源 ──> 音频 CDN（sip 列表 / isure.stream 兜底）
```

- **定位**：Typhoeus-Go 负责「与 QM 上游的全部协议 + TypeScript 不便做的系统集成」；音质协商、解密、中继、登录、会员、内容域全部在 Go 侧；渲染层只做视图与播放策略。
- **后端自述**：`GET /` → `{"backend":"typhoeus-go/QQMusicApi","version":"0.2.0"}`（`server/app.go handleRoot`）。
- **统一信封**：成功 `{code:0, msg:"ok", data:…}`；失败 `{code:-1|-<status>, msg:…}` + 对应 HTTP 状态码。

### 1.2 一句话演进史

| 阶段 | 后端 | 现状 |
| --- | --- | --- |
| 打样 / 1.0 / 1.1 | L-1124 Python API（FastAPI sidecar） | 已删除（submodule 里仅剩 `mpris/`） |
| Typhoeus 1.0 | Python `typhoeus/` + `quaver_server/` | 已删除；职责全部由 Go 承接（且支持加密档解密，这是 Python 版从未有的） |
| 现行 | **Typhoeus-Go**（Golang 1.26，零 cgo 依赖除 purego/godbus） | 主链路 |

## 2. 模块地图

`vendor/Typhoeus-go/`（module path `github.com/team-quaver/typhoeus-go`，Go 1.26）：

| 包 | 文件 | 职责 |
| --- | --- | --- |
| `cmd/quaver-server` | `main.go` | 入口：端口解析（`QUAVER_PORT`，1..65535，缺省 3200）、`http.Server{ReadHeaderTimeout:10s}`、监听 `127.0.0.1:<port>` |
| `server` | `app.go` | 路由注册（Go 1.22+ `mux.HandleFunc("GET /path/{seg}")`）、各 handler、QR 会话表、中继 token 表、inhibit 双句柄 |
| | `session.go` | 凭证生命周期（external/memory 模式、stdin/stdout 交接、监听器、配置目录解析） |
| | `envelope.go` | `writeOK/writeErr/writeError/decodeBody(1MiB上限)/queryInt/queryInt64/queryBool` |
| | `handlers_stream.go` | `/stream/tiers`、`/stream/resolve`、`/stream/{token}` 中继（token 表 + TTL + Range + 续传） |
| | `handlers_content.go` | 用户/歌曲/歌单端点 + file_type 序号表 + normalize 出口 |
| | `handlers_discovery.go` | 搜索/推荐/榜单/专辑/歌手端点（分页默认值都在这） |
| | `handlers_inhibit.go` | `POST /inhibit` |
| | `compat.go` | **SDK 形状契约层**：把上游 CGI 原始响应归一化成当年 Python SDK（pydantic model_dump）的输出形状；前端 TS 接口全部按这套形状编写，退役后此处是唯一契约源 |
| | `log.go` | stderr 日志（`INFO/WARN/ERROR/FATAL ∣ 时间 ∣ quaver-server ∣ 消息`，竖线分隔）；**stdout 只走凭证交接** |
| `typhoeus` | `quality.go` | 档位表 Tier + Membership + 回退链 FallbackChain + 明文 magic 白名单 |
| | `provider.go` | QQMusicProvider：会员查询缓存、取链 resolveLinks、CDN dispatch |
| | `resolver.go` | StreamResolver：门控 → 回退链 → 明文/加密双形态 → 首块嗅探 → 平台回退 → EVkey 批量兜底 |
| | `stream.go` | Range 中继：ParseRange/Clamp/OpenRange/ProbeTotal/CopyRange（断流续传）/就地解密 |
| | `errors.go` | `typhoeus.Error{Status,Message}`：422 未知档 / 403 会员门控 / 451 加密档拒绝 / 502 provider/回源 |
| `qqmusic` | `client.go` | CGI 调用（musicu/musics）、HTTP 池、Cookie、CGIOption |
| | `credential.go` | Credential 模型 + snake/camel 别名 + 精度安全解析 + HasLogin/IsExpired/SelfEuin |
| | `comm.go` | 平台版本档案（ct/cv…）、BuildComm、Hash33、GTK、UserAgent |
| | `sign.go` | zzc 签名（musics.fcg） |
| | `device.go` | 虚拟 Android 设备指纹（3 套机型档案 + 随机化规则 + device.json 落盘） |
| | `qimei.go` | QIMEI16/36 获取（RSA+AES+MD5 签名上报），缓存 24h |
| | `android_session.go` | 匿名会话 uid/sid（GetSession，按自然日续期） |
| | `ordered.go` | `JObj`（保序 JSON）/`JArr`/BoolToIntParams |
| | `errors.go` | APIError/ErrorKind 全谱 + cgiErrorMap |
| | `qrc.go` + `qrc_3des.go` | QRC 歌词解密（hex → 3DES 变体 → zlib → UTF-8） |
| `qqmusic/mqtt` | `mqtt.go` | MQTT 5.0 over WSS 最小子集（手机扫码推送） |
| `qqmusic/modules` | `login/song/user/songlist/recommend/content/singer/vip/platform/common/log` | 各业务域 CGI 薄封装（拼参 → CgiCall → ParseCGIData → 原始 JSON 透传） |
| `qmc` | `qmc/ekey/map/rc4/tea/inplace` | QMCv2 解密：ekey 解主密钥 → Map(≤300B)/RC4(>300B) 流密码，按绝对偏移可重入 |
| `inhibit` | `inhibit{,_linux,_darwin,_windows,_other}.go` | 电源抑制：XDG 门户/logind、IOKit、PowerRequest |
| `tools/` | `gen_qmc_vectors.py`、`qmc_ref.py` | 开发用：生成 QMC 解密测试向量（非运行时依赖） |

`vendor/Typhoeus/`（git submodule `quaver-typhoeus`）：

| 路径 | 职责 |
| --- | --- |
| `mpris/src`（`main.ts/ipc.ts/types.ts`） | MPRIS 2.0 D-Bus 守护进程（pnpm + esbuild 打包为单文件 CJS） |
| `mpris/dist/mpris-daemon.cjs` | 构建产物；开发态由主进程 spawn，打包态进 `<resources>/mpris/` |

## 3. 环境变量全量

**Go sidecar 读取的**（`cmd/quaver-server` + `server/session.go` + `qqmusic/client.go`）：

| 变量 | 默认 | 取值/语义 | 读取处 |
| --- | --- | --- | --- |
| `QUAVER_PORT` | `3200` | 监听端口；非法或越界（<1、>65535）回落 3200 | `main.go` |
| `QUAVER_CONFIG_DIR` | 未设=按平台推导 | 配置根目录覆盖（Electron 拉起时显式下传，两边规则必须一致） | `server.ConfigDir()` |
| `QUAVER_CREDENTIAL_MODE` | 未设=`memory` | 仅 `external` 有特殊含义：凭证经 stdin/stdout 交接给主进程加密落盘；其它值一律按 memory（登录只驻内存，**宁可不持久化也不写明文**） | `CurrentCredentialMode()` |
| `QSG_DEBUG_CGI` | 未设 | 非空即向 stderr 打印每条 CGI 的 `module method payload_bytes`（诊断用；日志里可能带敏感信息，勿留存） | `CgiCall` |
| `XDG_CONFIG_HOME` / `APPDATA` / `HOME` | — | 平台配置目录推导的输入（见 §4） | `ConfigDir()` |

**Electron 主进程注入给子进程的**（`ui/electron/main.ts`）：

| 变量 | 值 | 说明 |
| --- | --- | --- |
| `QUAVER_PORT` | `3201 + rnd(0..199)`（dev spawn） | 避开手工起服务常用的 3200；打包态同样随机下发 |
| `QUAVER_CONFIG_DIR` | 主进程 `configDir()` 结果 | 保证设备指纹与配置同目录 |
| `QUAVER_CREDENTIAL_MODE` | 固定 `"external"` | 声明凭证不在 sidecar 手上 |
| `QUAVER_API` | `http://127.0.0.1:<port>` | 主进程 spawn 后写进 env；`relay.ts`/`native-server.ts` 在模块加载时读一次（所以必须**先 spawn 再 import**） |

**UI 中继层读取的**：

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `QUAVER_API` | `http://127.0.0.1:3200` | `/api` 转发目标；已设时主进程不再自拉 sidecar（该模式下凭证只驻内存） |
| `PORT` | `4176` | 独立跑 `node electron/native-server.ts` 时的页面端口 |
| `QUAVER_SPARKLE_DIR` | — | 第三方插件根目录（与 Typhoeus 无关，列此防混淆） |

**MPRIS daemon 读取的**（`vendor/Typhoeus/mpris/src/main.ts`）：

| 变量 | 默认 | 说明 |
| --- | --- | --- |
| `ELECTRON_RUN_AS_NODE` | 主进程置 `1` | 用 Electron 自带 Node 跑 `.cjs`，打包态不依赖系统 node |
| `QUAVER_MPRIS_NAME` | `quaver` | D-Bus 名后缀：`org.mpris.MediaPlayer2.<name>` |
| `QUAVER_MPRIS_IDENTITY` | `Quaver`（主进程实际传 `Quaver Music`） | 桌面媒体控件里显示的播放器名 |

## 4. 端口、配置目录与文件

### 4.1 端口

| 端口/区间 | 用途 |
| --- | --- |
| `127.0.0.1:3200` | sidecar 手工运行默认（README 口径） |
| `3201–3400` | Electron dev/packaged spawn 随机分配（`3201 + rnd(0..199)`） |
| `3999` | CI 冒烟测试固定端口 |
| `4176` | native-server 独立运行默认 |

只绑 `127.0.0.1`：后端永不对局域网暴露。中继页面服务端口占用时回落系统随机端口（AppImage 场景 origin 不稳是已知取舍，因此设置存 `quaver.conf` 文件而不是 localStorage）。

### 4.2 配置目录（三处实现必须一致：Go `ConfigDir()` / Node `config.ts:configDir()` / 主进程下发覆盖）

| 平台 | 路径 |
| --- | --- |
| Linux | `$XDG_CONFIG_HOME/quaver-music`，默认 `~/.config/quaver-music` |
| Windows | `%APPDATA%\Quaver Music`（无 APPDATA 时 `%USERPROFILE%\AppData\Roaming\Quaver Music`） |
| macOS | `~/Library/Application Support/Quaver Music` |
| 任意 | `QUAVER_CONFIG_DIR` 整体顶掉 |

目录权限 `0700`。目录内文件：

| 文件 | 权限 | 写入方 | 内容 |
| --- | --- | --- | --- |
| `quaver.conf` | 0600（原子写：同目录临时文件 + rename） | UI（Node `config.ts`） | INI 配置（`Quality.DefaultQuality`、`Quality.FallbackToQMAtmos`、`Playing.InhibitSleep`、`[Security]` 等） |
| `device.json` | 0600 | Go sidecar | **设备指纹**（非密钥，明文可接受）；字段级合并：旧文件缺字段用新生成值补齐 |
| `device.cache.json` | — | Go sidecar | QIMEI（q16/q36 + saved_at）与 Android 匿名会话（uid/sid）缓存 |
| `credential.enc` | — | Electron 主进程 | safeStorage 密文凭证（钥匙在系统密钥管理器）；**解不开 ≠ 坏，绝不删档** |
| `credential.json` | — | （遗留） | 明文旧凭证，`migrateLegacy()` 导入后即删——现行代码没有任何写出明文的路径 |
| `electron-dev.log` | — | 主进程 | sidecar stderr 原样落入，**因此凭证一个字符都不许进 stderr** |

## 5. 凭证模型与 QCRED1 交接协议

### 5.1 `qqmusic.Credential` 字段全表

JSON 序列化采用 snake_case，与 Python 版 `Credential.model_dump_json()` 逐字一致（双向兼容交接管道）；反序列化同时接受 camelCase 别名。

| 字段 | JSON 名（+别名） | 类型 | 语义 |
| --- | --- | --- | --- |
| `OpenID` | `openid` | string | 三方（QQ/微信）openid |
| `RefreshToken` | `refresh_token`/`refreshToken` | string | 刷新令牌 |
| `AccessToken` | `access_token`/`accessToken` | string | QQ 登录 access token（微信无） |
| `ExpiredAt` | `expired_at`/`expiredAt` | int64 | access token 到期（`expired_in` 用于刷新回传） |
| `MusicID` | `musicid` | int64 | 数字 UIN |
| `MusicKey` | `musickey` | string | **会话主密钥（约 3 天有效）**——一切鉴权的核心，绝不出后端 |
| `UnionID` | `unionid` | string | 微信 unionid |
| `StrMusicID` | `str_musicid`/`strMusicid` | string | **字符串 UIN**：长微信 uin 超过 2^53 时唯一可信来源 |
| `RefreshKey` | `refresh_key`/`refreshKey` | string | musickey 刷新密钥 |
| `MusicKeyCreateAt` | `musickey_create_time`/`musickeyCreateTime` | int64 | musickey 签发时间戳（秒） |
| `KeyExpiresIn` | `key_expires_in`/`keyExpiresIn` | int64 | musickey 有效期（约 259200s=3 天） |
| `FirstLogin` | `first_login`/`firstLogin` | int64 | 首登标记 |
| `BindAccountType` | `bind_account_type`/`bindAccountType` | int64 | 绑定账号类型 |
| `NeedRefreshKeyIn` | `need_refresh_key_in`/`needRefreshKeyIn` | int64 | 上游建议的下次刷新间隔 |
| `EncryptUin` | `encrypt_uin`/`encryptUin` | string | 加密 UIN（收藏歌单等接口主键，`SelfEuin()` 首选） |
| `LoginType` | `login_type`/`loginType` | int64 | `1`=微信、`2`=QQ；缺省按 musickey 前缀 `W_X` 推断（`inferLoginType`）。手机扫码换登录时 CGI 通道值 `tmeLoginType=6`（通道参数，不是本字段） |

**派生判定**：

| 判定 | 规则 |
| --- | --- |
| `HasLogin()` | `MusicID > 0 && MusicKey != ""` |
| `IsExpired()` | `now >= MusicKeyCreateAt + KeyExpiresIn`（本地时钟） |
| `SelfEuin()` | `EncryptUin` > `StrMusicID` > `strconv(MusicID)` |
| Cookie 组 | `uin`+`qqmusic_uin`=StrMusicID(优先)；`qm_keyst`+`qqmusic_key`=MusicKey；`tmeLoginType`=LoginType |
| 给 UI 的摘要 | 仅 `musicid/str_musicid/encrypt_uin/login_type/expired_at/key_expires_in` 六项——**绝不下发 musickey/refresh_token**（`jsonableCredential`） |

**精度红线**：数字字段严禁经 float64 中转（微信 uin > 2^53 会静默丢精度，导致 `comm.uin`、Cookie、`uin_list` 全部拿错值鉴权失败）。`UnmarshalJSON` 按 RawMessage 原样取，整数字面量走 `json.Number → ParseInt`。`credentialUin/credentialNumericUin` 一律优先 `StrMusicID`。

### 5.2 QCRED1 交接协议（改一边必须改两边）

| 常量 | 值 | 两边位置 |
| --- | --- | --- |
| 前缀 | `"QCRED1 "`（**含末尾空格**） | Go `server.HandoffPrefix` ↔ TS `ui/electron/keyring.ts:HANDOFF_PREFIX` |

时序（`external` 模式）：

1. 主进程 spawn sidecar（stdio 全 pipe）→ **立即**向 stdin 写一行 `QCRED1 {json}` 或 `QCRED1 null`（sidecar 在 `NewSession()` 阶段**阻塞**读这一行；注入行必须在 spawn 之后马上写）。
2. sidecar 登录成功/自动刷新/登出时向 stdout 回写 `QCRED1 {json|null}`（单行、立刻 flush——stdout 走管道时是块缓冲）。
3. 主进程 stdout **先分行再判前缀**：带前缀的行交 `applySidecarCredential`（写密钥环/清档），其余行按 `[sidecar]` 日志落 `electron-dev.log`。
4. `memory` 模式：不读 stdin 也不写 `QCRED1`；关掉进程即需重新登录。

### 5.3 密钥环（`ui/electron/keyring.ts`）

| 常量/取值 | 值 | 说明 |
| --- | --- | --- |
| `STORE_MODES` | `auto` / `keyring` / `memory` | `[Security] CredentialStore`；**没有 file**——明文不在选项里 |
| `BACKENDS` | `auto` / `gnome-libsecret` / `kwallet6` / `kwallet5` / `kwallet` / `basic` | `[Security] KeyringBackend`；`basic` = 显式要求 Chromium 假加密，会被校验环节否决 |
| 校验规则 | `getSelectedStorageBackend()` 落在 `basic_text` → 视为密钥环不可用，退**内存**模式 | Linux 专属坑：Chromium 拿不到真密钥环时会用硬编码口令假加密且仍报 available=true |
| 探测信号 | `/proc/*/comm` 里的 `kwalletd6/kwalletd5/kwalletd/walletd/gnome-keyring-daemon`；`~/.local/share/kwalletd`、`~/.local/share/keyrings` 目录 | 只用来选 `--password-store` 开关，真正算数的是 ready 后校验 |
| 桌面白名单 | gnome, unity, x-cinnamon, cinnamon, pantheon, xfce, mate, budgie, deepin, ukui, lxqt, elementary, pop | 已知 libsecret 桌面 |
| 平台机制 | Linux=libsecret/KWallet；macOS=钥匙串；Windows=DPAPI | safeStorage 只做对称加密，密文文件仍由我们落盘 |

## 6. 会话与调用守卫

`server.Session`（进程级）：

| 方法 | 语义 |
| --- | --- |
| `Require()` | 登录守卫：未登录返回凭证无效错误（→401） |
| `Adopt(cred)` | 登录/刷新成功：写内存 + external 模式回写 QCRED1 + 通知监听器（会员缓存失效） |
| `Logout()` | 上游 `music.login.LoginServer/Logout` 尽力调 + 清本地 + 交接 null；上游失败也继续清本地 |
| `OnCredentialChange(cb)` | 监听器（App 用它挂 `provider.InvalidateMembership`） |
| `notify()` | 每个回调独立 `recover()`——监听器 panic 不能带崩会话 |

`App.call(needLogin, fn)` 统一守卫（**所有 CGI 业务调用都走它**）：

1. `needLogin` → `Require()`；已过期 → 先 `tryRefresh()`；
2. 执行 fn；失败且错误 kind ∈ {CredentialExpired, CredentialInvalid} 且已登录 → 刷新一次并**重试一次**；
3. 刷新成功走 `Adopt`（凭证自动续命，musickey 3 天上限决定了这套机制是刚需）。

`call2(fn)` 是 `bool` 版（写操作 like/unlike/歌单增删），语义同上。

## 7. HTTP API 端点全表

路由注册于 `server/app.go Routes()`（Go 1.22+ 方法+路径模式，字面量段优先于通配段）。「守卫」列：✅=必须登录（`Require`），🔁=匿名可调但过期凭证会触发刷新重试。

### 7.1 健康 / 登录

| 方法 路径 | 守卫 | 参数 | 响应 data / 说明 |
| --- | --- | --- | --- |
| `GET /` | — | — | `{backend,version}` 健康检查（waitSidecar 用它探活） |
| `GET /login/qrcode/{qq\|wx\|mobile}` | — | 路径段 ∈ qq/wx/mobile，否则 422 | `{qr_type,identifier,mimetype,data(base64),img(dataURL)}`；**mobile 型 GET 的同时启动后台 MQTT 消费任务** |
| `GET /login/qrcode/{type}/status` | — | query `identifier`（必填，缺→422） | `{event,done,identifier,login_type,credential?,error?}`；qq/wx 每 identifier 互斥轮询（防多 tab 打上游）；mobile 读后台状态表，未知 identifier 回 `{event:3,done:true,error:"二维码不存在或已过期"}` |
| `GET /login/status` | — | — | `{logged_in,expired,credential_mode,credential(摘要6字段)}` |
| `GET /login/refresh` | ✅ | — | 摘要凭证（手动刷新） |
| `POST /login/logout` | — | — | `{logged_out:true}` |

### 7.2 用户

| 方法 路径 | 守卫 | 参数/默认 | 说明 |
| --- | --- | --- | --- |
| `GET /user/me` | ✅ | — | `{base_info:{name,avatar,encrypted_uin,user_type,is_singer}}`（GetHomepageHeader 挑字段） |
| `GET /user/vip` | ✅ | — | 归一化权益（`normalizeVip`，snake_case 别名链，见 §14 VIP 映射） |
| `GET /user/liked` | ✅ | `page=1, num=30` | 「我喜欢」（dirid=201）归一歌单详情 |
| `GET /user/created-songlists` | ✅ | — | 自建歌单（uin 用 StrMusicID 优先） |
| `GET /user/fav-songlists` | ✅ | `page=1, num=20` | 收藏的他人歌单（主键 euin） |

### 7.3 播放流（Typhoeus 核心）

| 方法 路径 | 守卫 | 参数 | 响应 |
| --- | --- | --- | --- |
| `GET /stream/tiers` | 🔁 | — | `{membership, membership_label, tiers[当前可播], all_tiers[全量,含 locked/requires/mime/ext], max}` |
| `POST /stream/resolve` | 🔁 | body `{mid(必填,缺→422), media_mid?, tier(缺省"128"), auto?, deprioritize?[], platform?("android"缺省/"web"/"desktop")}` | `{token, path:"/stream/<token>", tier, tier_label, requested_tier, degraded, mime, size, filename, encrypted}` |
| `GET /stream/{token}` | —（token 即权限） | 请求头 `Range` 透传 | 206/200/416 音频流（`<audio>` src 指这里；UI 加 `/api` 前缀） |

### 7.4 歌曲 / 歌单

| 方法 路径 | 守卫 | 参数 | 说明 |
| --- | --- | --- | --- |
| `POST /song/urls` | 🔁 | body `{file_info:[{mid,file_type?(*int, nil=继承),media_mid?,song_type?}],file_type(默认整数表下标 13=MP3_128⚠ 见 §11.1)}` | `{expiration, items:[{mid,filename,purl,vkey,ekey,result,url}]}`（url=CDN 域名+purl） |
| `GET /song/{value}/detail` | 🔁 | value=id 或 mid | 原始详情透传（`get_song_detail_yqq`，固定 web 平台） |
| `GET /song/{value}/url` | 🔁 | `file_type=13`（query 缺省确实是 13）、`media_mid?` | 单曲取链（复用 `/song/urls` 序列化） |
| `GET /song/{value}/lyric` | 🔁 | `trans/roma/qrc`（bool：`1/true/True`） | 归一歌词（密文已解密，见 §16） |
| `GET /song/{song_id}/comments` | 🔁 | `page=1, num=20` | 热评（原始透传） |
| `POST /song/like`、`POST /song/unlike` | ✅ | body `{song_id, song_type}`（**写侧枚举=读侧-1**） | `{ok}` |
| `GET /songlist/{songlist_id}/detail` | 🔁 | `page=1, num=100` | 归一歌单详情 |
| `POST/DELETE /songlist/{songlist_id}/like` | ✅ | — | 歌单收藏/取消 `{ok}` |
| `GET /songlist/fav/check` | ✅ | — | `{ids:[]}`（取收藏列表第 1 页 100 条的 id 集） |
| `POST/DELETE /songlist/{dirid}/songs` | ✅ | body `{song_id, song_type, tid?}` | 加歌/删歌（写侧 songType） |
| `DELETE /songlist/{dirid}` | ✅ | — | 删自建歌单（dirid ≠ disstid/tid，要的是目录 ID） |

### 7.5 搜索 / 推荐 / 榜单 / 专辑 / 歌手

| 方法 路径 | 参数/默认 | 说明 |
| --- | --- | --- |
| `GET /search` | `keyword`(必填)、`type=0`、`page=1`、`num=20` | 类型搜索（归一 `{list,total}`）；type：0歌曲 1歌手 2专辑 3歌单 4MV 7歌词 8用户 10彩铃 15节目专辑 18节目 |
| `GET /search/general` | `keyword`、`page=1`、`num=15` | 综合搜索原始透传（上游 search_type=100；⚠ param 里 `page_num=num、page_id=page`——上游语义如此，别"顺手修正"） |
| `GET /search/complete` | `keyword` | 补全建议（SmartBox） |
| `GET /search/hotkey` | — | 热搜词 |
| `GET /recommend/guess` | `rounds=6`（钳到 1..8） | 无限电台：每轮 5 首、**必须串行**（并发上游只放行 1 个其余 700000）、按 mid 去重；单轮失败保底不回滚；全失败 502 |
| `GET /recommend/songlist` | `page=1, num=25` | 推荐歌单流 |
| `GET /recommend/newsong` | `type=5` | 新歌推荐：1内地 2欧美 3日本 4韩国 5最新 6港台 |
| `GET /recommend/daily` | `page=1, num=50` | 每日三十首：dirid=disstid=202，**上游要求登录**（匿名报 CGI 10004→401） |
| `GET /top/category` | — | 榜单分类（GetAll） |
| `GET /top/{top_id}/detail` | `page=1, num=50` | 榜单详情（withTags 保持布尔原样 PreserveBool） |
| `GET /album/{value}/detail` | value=id/中id | 专辑详情（id→`albumId`，mid→`albumMId`——上游两处大小写不同） |
| `GET /album/{value}/songs` | `page=1, num=50` | 专辑歌曲（`albumId`/`albumMid`） |
| `GET /singer/{mid}/info` | — | 歌手主页头（固定 android 平台） |
| `GET /singer/{mid}/songs` | `page=1, num=50, order=1` | 1=热度（热门）、2=发行时间倒序（最新）；**必须显式透传**否则两标签页内容相同 |
| `GET /singer/{mid}/albums` | `page=1, num=30` | 歌手专辑（order 固定 1） |
| `GET /singer/{mid}/similar` | `number=10` | 相似歌手 |
| `GET /singer/{mid}/desc` | — | 歌手描述（wiki XML+ex_info，`ExtractWikiDesc` 归一，area 枚举转文案） |
| `POST /inhibit` | body `{active:bool, mode?:"sleep"|"idle"|省略}` | 见 §17；非法 mode→400；响应 `{supported,active,reason}` |

## 8. 统一信封与错误码映射

### 8.1 信封（`server/envelope.go`）

```
成功: 200  {"code":0,"msg":"ok","data":…}
失败: 4xx/5xx {"code":-1 或 -<status>,"msg":"…"}
```

`decodeBody` 请求体上限 `1<<20`（1 MiB），空体/坏 JSON → 400。
`queryInt/queryInt64` 非法值静默回落默认；`queryBool` 认 `1/true/True` 与 `0/false/False`，其余用默认。

### 8.2 错误 → HTTP 映射

| 来源 | kind/Status | HTTP | code | 典型触发 |
| --- | --- | --- | --- | --- |
| `typhoeus.Error` | 422 | 422 | -422 | 未知音质档位 |
| `typhoeus.Error` | 403 | 403 | -403 | 显式选档会员不足（`auto=true` 时**不该出现**） |
| `typhoeus.Error` | 451 | 451 | -451 | 加密档拒绝（保留语义；现行实现可解密，多为兼容 Python 版口径） |
| `typhoeus.Error` | 502 | 502 | -502 | provider 取链失败/回源失败/协商全链无档 |
| `APIError` | CredentialInvalid / CredentialExpired | 401 | -401 | 未登录、凭证被上游拦 |
| `APIError` | Ratelimited | 429 | -429 | 风控（匿名搜索常见） |
| `APIError` | 其余（Global/CGI/Network/Data/…） | 400 | -1 | 上游业务码透在 msg |
| 本地校验 | — | 422 | -1 | 缺 mid / 缺 identifier / 未知 login_type / 未知 file_type |

### 8.3 上游 CGI 拦截码表（`qqmusic/errors.go cgiErrorMap`）

| 码 | kind | 语义/文案 |
| --- | --- | --- |
| 2000 | Signature | 请求需要签名 |
| 2001 | Ratelimited | 触发风控, 需登录或者安全验证 |
| 1000 / 104400 / 104401 | CredentialExpired | 登录凭证已过期, 请重新登录（触发 `call()` 自动刷新重试） |
| 10004 | CredentialInvalid | 上游要求登录态（如每日三十首匿名请求） |

其它业务码保持 `ErrKindCGI`（400）。其余关键码散见各域：`22`（vkey 参数缺失——web/desktop 通道没带 authst/tmeLoginType）、`104003`/`101404`（严格曲库/无权限拒绝，触发平台回退尝试）、`22006`（电台 song_ids 回灌）、`700000`（电台并发节流）、`80092`（歌单写无变化→按成功 true 处理）、`10006`（`uin_list` 传 JSON number 的"参数错误"——必须 string[]）。

### 8.4 APIError.ErrorKind 全谱

`ErrKindHTTP / Network / Timeout / Data / Global / CGI / CredentialInvalid / CredentialExpired / Ratelimited / Signature / Login`（`ordered.go`/`errors.go`）。`Timeout` 与 `Network` 分开是为了让长轮询（微信 QR 35s）把超时解释成「继续等」而不是报错。

## 9. 音质档位体系（tierTable）

### 9.1 档位全表（`typhoeus/quality.go`，rank 升序）

| id | Label | 明文形态（前缀+扩展名） | 加密孪生（QMC） | MIME | Rank | Requires | 备注 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `96ogg` | 流畅音质 (OGG) | O400 `.ogg` | O4M0 `.mgg` | audio/ogg | 5 | 0 | 仅 OGG 形态，无 mp3 孪生 |
| `128` | 标准音质 | M500 `.mp3` | —（官方从不下发加密 mp3） | audio/mpeg | 10 | 0 | 全链兜底档 |
| `192ogg` | 高品质 HQ (OGG 192) | O600 `.ogg` | O6M0 `.mgg` | audio/ogg | 15 | 1 | |
| `320` | 高品质 HQ | M800 `.mp3` | — | audio/mpeg | 20 | 1 | |
| `320ogg` | 高品质 HQ (OGG) | O800 `.ogg` | O8M0 `.mgg` | audio/ogg | 25 | 1 | |
| `640ogg` | 无损 SQ (OGG) | O801 `.ogg` | O8M1 `.mgg` | audio/ogg | 30 | 1 | |
| `flac` | 无损 SQ | F000 `.flac` | F0M0 `.mflac` | audio/flac | 40 | 1 | `hi_res` 起点（rank≥40） |
| `atmos2` | 臻品音质 2.0 | Q000 `.flac` | Q0M0 `.mflac` | audio/flac | 50 | 2 | |
| `atmos51` | 臻品全景声 5.1 | Q001 `.flac` | Q0M1 `.mflac` | audio/flac | 55 | 2 | 6ch FLAC |
| `atmos71` | 臻品全景声 7.1 | Q003 `.ogg` | Q0M3 `.mgg` | audio/ogg | 57 | 2 | 7.1.4=12ch Opus |
| `master` | 臻品母带 | AI00 `.flac` | AIM0 `.mflac` | audio/flac | 60 | 2 | |

Tier 结构字段：`ID/Label/Mime/Ext/Rank/Requires/Encrypted/HiRes`（JSON 可见）+ `PlainPref/PlainExt/EncPref/EncExt`（`json:"-"` 不外泄）。`hi_res = Rank>=40`（UI 徽标）；`encrypted:true` 表示该流由后端**内存解密**播放（UI 可标「解密播放」）。

**已裁撤退档（不要复活）**：`dts`（DTS:X mp4 的 `dtsx` codec tag ffmpeg 不识别）、`atmosdb`（杜比 AC-4 需捆绑解码器）、`vinyl`（黑胶无明文形态且从未被上游放行）——2026-09-28 从档位表裁撤，`auto` 回退链不再指向不可播档。**NAC**（TL01 腾讯自研 codec）浏览器不可播，从未进表（modules 里保留枚举仅为 file_type 序号对齐）。

### 9.2 会员等级 Membership

| 值 | 常量 | 展示名 | 判定来源（`membershipFromInfo`，先看 Active(now) 到期裁剪） |
| --- | --- | --- | --- |
| 0 | `MembershipNone` | 普通用户 | 未登录/无权益 |
| 1 | `MembershipGreen` | 会员 | `identity.huge_vip==1`（豪华绿钻）或 `identity.vip==1`（绿钻） |
| 2 | `MembershipSuper` | 超级会员 | `svip==1`（解析自上游 `HugeVip` 字段——注意上游字段语义与内部字段名交叉，见 §14.6） |

缓存策略（`provider.Membership`）：成功缓存 `membershipTTL=600s`；失败 15s 后重试；查询失败**不等于无会员**——陈旧缓存在 2×TTL 内且非凭证类错误时沿用，否则直接报错（`502 会员权益查询暂时失败…未更改账号会员等级`）。登录/登出/刷新触发 `InvalidateMembership()`。

### 9.3 协商语义（`resolver.Resolve`）

1. 目标档会员不足：`auto=false` → **403**（文案 `gateReason`：「需登录后开通会员」/「需 X 及以上会员（当前 Y）」）；`auto=true` → 链裁剪到可及最高档，不报错。
2. 回退链 `FallbackChain(tier, deprioritize)`：自目标 rank 向下全收集；`deprioritize` 里的档整体压到链尾（**目标档本身永不动**——显式选档语义不变）。UI「回退排序」开关：`Quality.FallbackToQMAtmos=False`（默认）→ `deprioritize=["atmos51","atmos71"]`。
3. 每档先试**明文形态**（`PlainPref`），再试**加密形态**（`EncPref`+ekey→内存解密器）。
4. 首块嗅探：明文取前 16 字节验 magic；加密流解密后验 magic（验证 ekey 正确性）。magic 白名单：`fLaC`、`OggS`、`ID3`、`FF FB/F3/F2`（MP3 帧同步）、`8A 58 1A DF`（Matroska/EBML 头），mp4 判据=第 4-8 字节 `ftyp`。
5. **网络失败≠内容不符**：嗅探失败重试一次后仍连不上 → 放行该档（防「CDN 抖一下高阶莫名变标准」的历史回归）；magic 不符才降档。
6. 平台回退：android 身份取链被 `104003/101404` 拒（严格曲库：日本 VOCALOID、周杰伦等）→ 自动换 **web** 身份重试一次；调用方显式传了 `platform` 则尊重意图。
7. 内部 pseudo result code（诊断用，不是上游码）：`-1` 初始、`-2` 明文档回了密文、`-3` ekey 不可用、`-4` 解密后 magic 不符。
8. 全链失败兜底（lyrune 策略）：把链上所有加密变体合并进**一次** `CgiGetEVkey` 批量请求，按文件名前缀映射回档位、rank 降序取「最接近请求档」的可播条目（不同加密形态授权判定相互独立，单变体被拒≠批量全拒）。

## 10. 播放流中继与断流续传

### 10.1 token 表（进程内，重启即失，UI 重新 resolve 即可）

| 常量/字段 | 值/语义 |
| --- | --- |
| `streamTTL` | `2h`（与上游 vkey expiration 同量级）；**滑动过期**：每次命中续期 |
| token | 16 字节随机 → `base64.RawURLEncoding`（url-safe） |
| `streamEntry` | `{url, mime, total, filename, tier, encrypted, cipher, expiresAt, hits, degraded, requested}` |
| `cipher` | 仅加密流非 nil；**按绝对偏移解密，无跨请求状态**（任意 Range 重连无缝续解） |
| 安全边界 | vkey/ekey 不出后端；`GET /stream/{token}` 是唯一对外形态 |

### 10.2 回源常量（`typhoeus/stream.go`）

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `upstreamUA` | `Mozilla/5.0 (X11; Linux x86_64) Quaver/0.1 typhoeus-go` | 回源 UA |
| `chunkSize` | `256 KiB` | 中继读块（`sync.Pool` 池化，稳态零分配；配合 `InPlaceCipher` 就地解密，GC 不跟播放抖） |
| `resumeRetries` / `ResumeRetries` | `2` | 断流续传次数（导出给 server） |
| `resumeBackoff` | `250ms` | 续传前等待 |
| `upstreamTimout` | `15s` | **已定义当前未引用**（历史保留；回源超时实际由请求 ctx 与每段读取控制） |
| `sniffTimeout` | `5s`（resolver.go） | 单次嗅探/探测预算；resolve 全链必须快于前端 12s 超时（`RESOLVE_TIMEOUT_MS`）——无超时会把整次 resolve 拖死（历史回归源） |
| client | `Timeout:0`，Transport `MaxIdleConns:16 / PerHost:8 / IdleConnTimeout:90s` | 不设总超时以支持慢速长播 |

### 10.3 Range 语义

- `ParseRange`：认 `bytes=a-b` / `bytes=a-` / `bytes=-b`（后缀）；`Clamp(total)` 把开区间规整为闭区间；`total>0 && start>=total` → `416 + Content-Range: bytes */total`。
- 总长探测：`ProbeTotal` 对 CDN 发 `bytes=0-0` 从 `Content-Range` 解析（不下载实体）。**探测失败不推翻已协商流**：total=0 照样流式透传。
- 响应头：`Accept-Ranges: bytes`、`Content-Type: <tier mime>`、`Cache-Control: no-store`、透传上游 `Content-Range/Content-Length`（200 且已知 total 时补 Content-Length）。
- **断流续传**（`CopyRange`）：仅「整段」或「带 start 的 Range」可续（后缀 Range 且总长未知时无从推导偏移 → `resume=0`）；重试时按已发字节 `pos` 重开 `Range: pos-`；上游回 200（忽略 Range）或 `Content-Range` 起点不符 → **宁可放弃也不重发字节**；定长段被静默截断（net/http 只报 EOF）→ 以「提前 EOF」错误触发续传。
- 客户端断开（切歌/预加载 abort）与真故障区分靠「已发字节数」日志。

## 11. file_type 序号表与取链通道

### 11.1 序号表（`server/handlers_content.go songFileTypes`，与上游 web 层 `SONG_FILE_TYPE_MAPPING` 顺序一致）

⚠ `POST /song/urls` 顶层 `file_type` 是非指针 int：整段缺省得到 **0（DTS_X）**而非 13——需要默认 128mp3 的调用方必须显式传 `13`；`GET /song/{v}/url` 的 query 缺省则确为 13。item 级 `file_type` 是 `*int`：`nil`＝继承顶层，**必须传 null 而不是 0**。

| # | 枚举 | 前缀 | 扩展名 | | # | 枚举 | 前缀 | 扩展名 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| 0 | DTS_X | DT03 | .mp4 | | 15 | ACC_96 | C400 | .m4a |
| 1 | MASTER | AI00 | .flac | | 16 | ACC_48 | C200 | .m4a |
| 2 | ATMOS_2 | Q000 | .flac | | 17 | DTS_X_ENC | DTM3 | .mmp4 |
| 3 | ATMOS_51 | Q001 | .flac | | 18 | VINYL | V0M0 | .mflac |
| 4 | ATMOS_71 | Q003 | .ogg | | 19 | MASTER_ENC | AIM0 | .mflac |
| 5 | ATMOS_DB | D004 | .mp4 | | 20 | ATMOS_2_ENC | Q0M0 | .mflac |
| 6 | NAC | TL01 | .nac | | 21 | ATMOS_51_ENC | Q0M1 | .mflac |
| 7 | FLAC | F000 | .flac | | 22 | ATMOS_71_ENC | Q0M3 | .mgg |
| 8 | OGG_640 | O801 | .ogg | | 23 | ATMOS_DB_ENC | D0M4 | .mmp4 |
| 9 | OGG_320 | O800 | .ogg | | 24 | NAC_ENC | TLM1 | .mnac |
| 10 | OGG_192 | O600 | .ogg | | 25 | FLAC_ENC | F0M0 | .mflac |
| 11 | OGG_96 | O400 | .ogg | | 26 | OGG_640_ENC | O8M1 | .mgg |
| 12 | MP3_320 | M800 | .mp3 | | 27 | OGG_320_ENC | O8M0 | .mgg |
| 13 | MP3_128 | M500 | .mp3 | | 28 | OGG_192_ENC | O6M0 | .mgg |
| 14 | ACC_192 | C600 | .m4a | | 29 | OGG_96_ENC | O4M0 | .mgg |

**加密判别以扩展名为准**（`.mflac/.mgg/.mmp4/.mnac` → `IsEncrypted`）：resolver 按档位现造 `SongFileType` 时枚举名不一定等于常量名，早期按名字匹配曾把加密型误判成明文、错走 UrlGetVkey 通道拿不到 ekey（症状「只有批量兜底档能解」）。名字集合仅兼容保留。

### 11.2 取链双通道（`modules/song.go`）

| 通道 | CGI | 用于 | 关键参数 |
| --- | --- | --- | --- |
| 明文 vkey | `music.vkey.GetVkey` / `UrlGetVkey` | 明文型 | `uin=str_musicid`、`filename=pref+mid+mid+ext`（media_mid 空时文件名里 mid 重复两段）/`pref+media_mid+ext`、`guid`=32位随机hex、`songmid[]`、`songtype[]`、`ctx=0`；**web/desktop 身份必须补 comm：`authst`+`tmeLoginType`（desktop 还带 `cv=1859`），否则 result=22** |
| 加密 EVkey | `music.vkey.GetEVkey` / `CgiGetEVkey` | `.m*` 型 | **必须复刻官方桌面端形态**否则一律 104003/101404：`guid="10000"`、`ctx=1`、`loginflag=1`、`platform="27"`、`songtype` 非 0（0→1）、`songmid` 用 **media_mid**、comm desktop 形态（ct=19）+`cv=1859`+`authst`+`tmeLoginType` |
| EVkey 批量 | 同上（variants 拼多个 filename） | 回退兜底 | 与上游回包按请求顺序对齐；少回的条目按失败（result=-1）处理 |

**songtype 语义**（对齐 lyrune）：搜索项 `type==1`（普通歌曲）→ 请求 `song_type=0`；其余原样。**EVkey 加密通道固定发 1**。红心/歌单**写侧** `song_type = 读侧 Song.type - 1`（下限 0；`writeSongType`）——发读侧原值上游「retCode=0 但静默空操作」。

`GetSongURLs` 单次上限 **100 首**（超出报 Data 错）。响应字段：`expiration` + `midurlinfo[]{songmid,filename,purl,vkey,ekey,result}`（`result=0 且 purl≠""` 才可播）。`/song/urls` 出口规则：`ekey` 仅在 `result==0` 时透传；播放流链路（`/stream/*`）则**不透传 ekey**——解密只在后端做。

### 11.3 CDN dispatch

`GetCdnDispatch`（`music.audioCdnDispatch.cdnDispatch`，参数 `guid/uid="0"/use_new_domain=1/use_ipv6=1`）→ `sip[]` 域名列表；缓存 **1 小时**、随机挑选、失败回退 `CDNFallback = "https://isure.stream.qqmusic.qq.com/"`（失败也记账防每请求重试）。`normalizeDomain` 补 scheme 与尾斜杠。

## 12. 内容域常量

### 12.1 系统虚拟歌单 dirid

| dirid | 含义 | 备注 |
| --- | --- | --- |
| 201 | 「我喜欢」（红心列表） | Like/Unlike = `AddSonglist/DelSonglist` 到 201（tid=0）；读走 `music.srfDissInfo.DissInfo/CgiGetDiss`（`disstid=0, dirid=201, enc_host_uin=euin`） |
| 202 | 每日三十首 | 每天服务端重生成（disstid 每天都变，按 dirid 取才稳）；读法同普通歌单详情（disstid=dirid=202）；**要求登录**（匿名报 10004） |

内容域 CGI 一览（module/method 名登记簿）：

| 域 | module/method | 关键点 |
| --- | --- | --- |
| 详情 | `music.srfDissInfo.DissInfo` / `CgiGetDiss` | `tag/userinfo/orderlist=true` 族参数；`song_begin=num*(page-1)` |
| 加/删歌 | `music.musicasset.PlaylistDetailWrite` / `AddSonglist`、`DelSonglist` | `dirId/tid/bFmtUtf8/v_songInfo[{songId,songType}]`；**Add 带 PreserveBool（bFmtUtf8 发 true），Del 不带（发 1）**——与上游逐项对齐，别统一；80092=无变化按成功 |
| 建/删歌单 | `music.musicasset.PlaylistBaseWrite` / `AddPlaylist`、`DelPlaylist` | 重名不失败（服务端自动加时间戳） |
| 歌单收藏 | `music.musicasset.PlaylistFavWrite` / `FavPlaylist`、`UnfavPlaylist` | 已在/本就不在 也返回 true |
| 收藏列表 | `music.musicasset.PlaylistFavRead` / `CgiGetPlaylistFavInfo` | uin=**euin（加密UIN）**；原始响应键是 `v_list` 不是 playlists（normalize 前别直读） |
| 自建列表 | `music.musicasset.PlaylistBaseRead` / `GetPlaylistByUin` | uin=数字 UIN 字符串 |
| 电台 | `music.radioProxy.MbTrackRadioSvr` / `get_radio_track` | `{id:99, num:5, from:0, scene:0, song_ids:[]}`；单轮 5 首、song_ids 回灌报 22006、并发报 700000 → **串行** |
| 推荐歌单 | `music.playlist.PlaylistSquare` / `GetRecommendFeed` | `From/Size` |
| 新歌 | `newsong.NewSongServer` / `get_new_song_info` | `type` 见端点表 |
| 榜单 | `music.musicToplist.Toplist` / `GetAll`、`GetDetail` | GetDetail `withTags=true` PreserveBool |
| 搜索(类型) | `music.search.SearchCgiService` / `DoSearchForQQMusicMobile` | 固定 android；`highlight=1, grp, selectors{}, vec_selectors[]` |
| 搜索(综合) | `music.adaptor.SearchAdaptor` / `do_search_v2` | `search_type=100`；`page_id=page, page_num=num` |
| 补全 | `music.smartboxCgi.SmartBoxCgi` / `GetSmartBoxResult` | `num_per_page=0, page_idx=0` |
| 热搜 | `music.musicsearch.HotkeyService` / `GetHotkeyForQQMusicMobile` | |
| 评论 | `music.globalComment.CommentRead` / `GetHotCommentList` | `{BizType:1, BizId:song_id字符串, LastCommentSeqNo:"", PageSize:num, PageNum:page-1, HotType:1, WithAirborne:0, PicEnable:1, BizSubType:2}` |
| 歌词 | `music.musichallSong.PlayLyricInfo` / `GetPlayLyricInfo` | `{crypt:1, lrc_t:0, qrc:0/1, qrc_t:0, roma, trans, needSingingAnnotations:false(PreserveBool), type:songType(默认1)}`；songId(纯数字)/songMid |
| 专辑 | `music.musichallAlbum.AlbumInfoServer/GetAlbumDetail`、`AlbumSongList/GetAlbumSongList`、`AlbumListServer/GetAlbumList`(歌手) | |
| 歌手 | `music.UnifiedHomepage.UnifiedHomepageSrv/GetHomepageHeader`(SingerMid)、`musichall.song_list_server/GetSingerSongList`、`music.SimilarSingerSvr/GetSimilarSingerList`、`music.musichallSinger.SingerInfoInter/GetSingerDetail`、`music.pf_song_detail_svr/get_song_detail_yqq`(歌详情,web) | |
| 主页头 | `music.UnifiedHomepage.UnifiedHomepageSrv` / `GetHomepageHeader` | 未登录时用占位凭证（`MusicID=1, MusicKey="placeholder-musickey", EncryptUin="0×32", LoginType=1`） |
| CDN 调度 | `music.audioCdnDispatch.cdnDispatch` / `GetCdnDispatch` | `{guid,uid:"0",use_new_domain:1,use_ipv6:1}` → `sip[]`；缓存 1h 随机挑一，失败兜底 `https://isure.stream.qqmusic.qq.com/`（失败也记账防打爆） |

`searchid` 随机算法（与上游一致）：`e=1+rnd(20); t=e*18014398509481984; n=rnd(4194305)*4294967296; r=now_ms%86400000; return t+n+r`。

## 13. 登录域

### 13.1 三通道总览

| 通道 | `login_type` | identifier 是什么 | 状态获取 | 换凭证 CGI |
| --- | --- | --- | --- | --- |
| QQ 扫码 | `qq` | `qrsig`（Cookie） | 轮询 `ssl.ptlogin2.qq.com/ptqrlogin` | `QQConnectLogin.LoginServer/QQLogin`（web 平台，`code`） |
| 微信扫码 | `wx` | `uuid`（页面抓取） | 长轮询 `lp.open.weixin.qq.com/connect/l/qrconnect`（单轮 35s；**读超时=继续等**，产出 SCAN） | `music.login.LoginServer/Login` + `tmeLoginType=1`，`strAppid=wx48db31d50e334801` |
| 手机客户端扫码 | `mobile` | `qrcodeID` | MQTT 5.0 推送（sidecar 后台消费，UI 轮询本地状态表） | `music.login.LoginServer/Login` + `tmeLoginType=6`，`{musicid, qrCodeID, token=qqmusic_key}` |

UI 事件数字（`qrEventNumbers`，与上游 web 层一致）：`DONE=0, SCAN=1, CONF=2, TIMEOUT=3, REFUSE=4, 未知=-1`。

### 13.2 QQ 扫码细节

| 项 | 值 |
| --- | --- |
| appid / daid / pt_3rd_aid | `716027609` / `383` / `100497308` |
| 二维码会话 TTL | **10 分钟**（过期即清，状态查询直接回 TIMEOUT） |
| pt_login_sig | 从 xlogin 页 Cookie 读；`js_ver` 从页面 `ptui_version: encodeURIComponent("…")` 正则提取（回落 `26092315`） |
| 轮询参数 | `ptqrtoken = Hash33(qrsig, 0)`；`action=0-0-<now_ms>`；`ptlang=2052, has_onekey=1, pt_uistyle=40, …` |
| ptuiCB 状态码 | `0`=成功 / `66`=已扫码 / `67`=已确认 / `68`=拒绝 / `65`及未知=超时 |
| 成功后授权链 | 校验回跳 host ∈ {`graph.qq.com`,`ssl.ptlogin2.qq.com`,`ssl.ptlogin2.qq.com` 系白名单} + path `/check_sig` + 带 `ptsigx`（**一次性凭据**：确认后的失败被缓存，防每 2s 重放）→ 手动跟跳 ≤5 次拿 `p_skey` → POST `graph.qq.com/oauth2.0/authorize`（`client_id=100497308, scope=get_user_info,get_app_friends, openapi=1010_1030, g_tk=Hash33(p_skey,5381), redirect_uri=y.qq.com/portal/wx_redirect.html?login_type=1…`）→ `code` |
| QQLogin comm | web 平台 + `tmeLoginType=2, cv=0, platform=yqq, g_tk`；g_tk 按 musicu 域实际可见 Cookie 计算，密钥优先链 `qqmusic_key > p_skey > skey > p_lskey > lskey`（**p_skey 不跨域塞给 musicu**）；Cookie 里补 `login_type=1` |
| 会话隔离 | 每张二维码独占 cookie jar（Domain/Path/过期全保留），qq/wx 每 identifier 互斥轮询 |

### 13.3 微信扫码细节

| 项 | 值 |
| --- | --- |
| appid | `wx48db31d50e334801`；scope `snsapi_login`；redirect `…wx_redirect.html?login_type=2…`；href `popup_wechat.css#wechat_redirect` |
| uuid 提取 | 正则 `uuid=(.+?)"`；二维码图 `open.weixin.qq.com/connect/qrcode/<uuid>`（image/jpeg） |
| errcode 表 | `405`=完成 / `408`=已扫码 / `404`=已确认 / `403`=拒绝 / `402`及未知=超时 |
| 成功 | code 非空 → `music.login.LoginServer/Login`（`tmeLoginType=1`） |

### 13.4 手机客户端扫码（MQTT）细节

| 项 | 值 |
| --- | --- |
| 取码 | `music.login.LoginServer/CreateQRCode`，param `{tmeAppID:"qqmusic", ct:11, cv:14090008}`，comm 覆盖 `{ct:23, cv:0}`，平台 android；返回 `qrcode`（`data:image/png;base64,…`，取最后一个逗号后解码）+ `qrcodeID` |
| MQTT 连接 | `mu.y.qq.com:443 /ws/handshake`（WSS，MQTT 5.0）；clientId=`<unix_ms><1000..9999>`；密码固定 `"pass"`；连接属性 `{tmeAppID:qqmusic, business:management, hashTag:<qrcodeID>, clientTag:management.user, userID:<qrcodeID>}`；握手头 Origin/Referer=`https://y.qq.com`，UA Chrome/123；连接预算 25s |
| 节点缓存 | 上次成功握手路径（含节点段，来自 0x9D 重定向）缓存复用；失效回退基础路径再试一次 |
| 订阅 | topic `management.qrcode_login/<qrcodeID>`，属性 `{authorization:"tmelogin", pubsub:"unicast"}`；PINGREQ 40s（协商 KeepAlive 45s） |
| 消息 type → 事件 | `scanned`→CONF / `canceled`→REFUSE / `timeout`→TIMEOUT / `loginFailed`→TIMEOUT / `cookies`→解析 `cookies.{qqmusic_uin,qqmusic_key}.value` 换 Login CGI→DONE（缺字段/解析失败→TIMEOUT+error） |
| 状态初值 | 消费任务未建立或刚建立 event=`1`(SCAN)；MQTT 建连失败 event=`-1`+error |

### 13.5 刷新与登出

`RefreshCredential`：按 `LoginType` 组参（1=微信带 `openid/refresh_token/str_musicid/musickey/unionid/refresh_key`；2=QQ 带 `openid/access_token/refresh_token/expired_in/musicid/musickey/refresh_key`；缺省=并集），`loginMode=2`，comm `tmeLoginType=<LoginType>`；响应走同一校验（登录域错误码归一为 Login 错误）。

登录域错误码表（`loginErrorText`/`allowLoginErrorCodes`）：

| 码 | 文案 | | 码 | 文案 |
| --- | --- | --- | --- | --- |
| 1000 | 登录鉴权参数无效或已过期 | | 20274 | 账号绑定缺失 |
| 104400/104401 | 登录鉴权参数无效或已过期 | | 20277/20278 | 账号受限（→事件化为 REFUSE） |
| 20261 | 登录参数错误 | | 20279 | 登录设备超限 |
| 20271 | 验证码错误 | | 20450 | 账号已被封禁（→REFUSE） |
| 20272 | 账号绑定异常 | | 104604 | 操作过于频繁 |

handler 侧事件化：`LoginError` 且 code ∈ {20450,20277,20278} → `event=4`（REFUSE），其余 → `event=3`（TIMEOUT），并带 `error` 文案——UI 流程不中断。

## 14. qqmusic SDK 基础层

### 14.1 端点与请求形态

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `musicuURL` | `https://u.y.qq.com/cgi-bin/musicu.fcg` | 常规 CGI 批量入口（现行恒为单请求：`comm + req_0{module,method,param}`） |
| `musicsURL` | `https://u.y.qq.com/cgi-bin/musics.fcg` | 带签名入口；`?_=<unix_ms>&sign=<zzc>`（`CGIOption.Sign=true` 时启用） |

`CGIOption` 字段全表：`Platform`（缺省 ANDROID）/ `Comm`（请求级覆盖）/ `Credential` / `RequireLogin` / `Sign` / `AllowErrorCodes` / `PreserveBool`（缺省按上游 `bool→0/1` 递归转换）/ `Cookies`（QQ OAuth 用，不写共享客户端）/ `Headers`。

comm 覆盖合并语义：非空值→字符串覆盖；空串/null→**删除**同名键；bool→`"True"/"False"`（对齐 Python str()）。

### 14.2 平台版本档案（`comm.go defaultVersionProfiles`，逆向自官方客户端）

| 字段 | android | desktop | web |
| --- | --- | --- | --- |
| ct | 11 | 19 | 24 |
| cv | 14090008 | 2201（**EVkey/vkey 通道覆写 1859**） | 4747474 |
| v | 14090008 | — | — |
| chid | `"10003505"` | `"0"` | `"0"` |
| platform | — | — | `"yqq.json"`（登录 comm 覆写用 `"yqq"`） |
| UA | `QQMusic 14090008(android <release>)` | Chrome/120 Win10 UA（同 web） | Chrome/120 Win10 UA |
| QIMEI 档案 | appVer `14.9.0.8` / sdkVer `1.2.13.6` | — | — |

comm 形态要点：

- **android**：凭证走 `qq`（数字 UIN 字符串）+ `authst`（musickey）；带 `tmeAppID=qqmusic`、`tmeLoginType`、`QIMEI36`、`OpenUDID/udid/OpenUDID2`、`uid/sid`（匿名会话，取不到则缺省）、`aid`（android_id）、`os_ver`、`phonetype`（机型，仅引号做 XML 转义 `&quot;`）。
- **desktop**：`uin` + `g_tk` + `guid`（OpenUDID 大写）；登录态**只体现在 Cookie**（`uin/qqmusic_uin/qm_keyst/qqmusic_key/tmeLoginType`），`comm.uin/g_tk` 本身不带凭证。
- **web**：`uin`（无凭证回 "0"）+ `g_tk` + `g_tk_new_20200303` + `format/inCharset/outCharset/notice=0/need_new_code=1`。
- `g_tk = Hash33(musickey, 5381)`（未登录=5381）。`Hash33`: `h=5381; for c: h=(h<<5)+h+c; return 2147483647 & h`。

### 14.3 zzc 签名（`sign.go`）

对「将要原样发送的请求体字节」计算：

1. `sha1(body)` → hex → **大写**；
2. part1 = 取 hex 大写串下标 `{23,14,6,36,16,7,19}`；
3. part2 = 下标 `{16,1,32,12,19,27,8,5}`；
4. part3：20 字节，`part3[i] = scramble[i] ^ hexByte(hashHex[2i], hashHex[2i+1])`，`scramble = [89,39,179,150,218,82,58,252,177,52,186,123,120,64,242,133,143,161,121,179]`；
5. `b64 = base64(part3)`，删除 `[\ / += ]`；
6. 结果 = `lowercase("zzc" + part1 + b64 + part2)`。

### 14.4 HTTP 池与超时

| 项 | 值 |
| --- | --- |
| 业务 CGI client | `Timeout 35s`；Transport `MaxIdleConns 32 / PerHost 16 / IdleConnTimeout 90s` |
| 单次 CGI 请求 | ctx 超时 15s |
| `DoHTTPPlain` 缺省 | 15s；`HTTPOption.TimeoutSeconds` 覆写（微信长轮询 35s） |
| 重定向 | 默认跟随；`NoRedirect` 用同一 Transport 的浅拷贝 client（QQ OAuth 手动跟跳） |
| 超时归类 | `context deadline exceeded / Client.Timeout` → ErrKindTimeout（长轮询据此产出 SCAN 继续等） |

### 14.5 设备指纹与匿名标识

`Device`（device.json 明文，非密钥）：机型档案 3 套内部一致（vivo PD2408/V2408A·OriginOS 5、Xiaomi dada/24129PN74C·HyperOS 3、OPPO PKB110·ColorOS 15；SDK 35/36/35），随机化字段规则——

| 字段 | 规则 |
| --- | --- |
| `boot_id` | UUIDv4 |
| `imei` | 14 随机位 + **Luhn** 校验位 |
| `mac_address` / `wifi_bssid` | 本地管理位=1 的随机 MAC（首字节 `02`，冒号分隔） |
| `android_id` | 8 字节随机 hex（16 字符） |
| `open_udid` / `open_udid2` | 16 字节随机 hex（32 字符） |
| `imsi_md5` | 16 个随机字节数组 |
| 固定项 | `bootloader="U-boot"`, `sim_info="T-Mobile"`, `wifi_ssid="<unknown ssid>"`, `apn="wifi"`, `os_type="android"`, `base_band=""` |

**QIMEI**（`qimei.go`，向 `https://api.tencentmusic.com/tme/trpc/proxy` 换取 q16/q36，缓存 24h 进 device.cache.json）：

| 常量 | 值 |
| --- | --- |
| `qimeiAppKey` | `0AND0HD6FE4HY80F` |
| `qimeiSecret` | `ZdJqM15EeO2zWc08` |
| `qimeiChannelID` | `10003505` |
| `qimeiPackageID` | `com.tencent.qqmusic` |
| `qimeiSignKey` | `qimei_qq_androidpzAuCmaFAaFaHrdakPjLIEqKrGnSOOvH` |
| `qimeiDeviceToken` / `qimeiDeviceIV` | `lvcwmSYVr2Axv1gn` / `Zs0ntDqG2jyhKN0c`（AES-128，加密 android_id/机型派生 oz/oo） |
| RSA 公钥 | `qimeiPublicKeyPEM`（1024bit，包 AES 会话密钥） |
| 加密形态 | AES-CBC（IV 缺省=key，PKCS#7）+ RSA + MD5 签名；灯塔 ID 随机化 |
| 失败语义 | 拿不到就空串——不阻塞业务请求 |

**Android 匿名会话**（`android_session.go`）：`music.getSession.session/GetSession`，`caller=2`（首次）/`1`（续期，带旧 uid）；按**自然日**判定续期；结果（uid/sid）进 device.cache.json；失败静默（comm 缺 uid/sid 照常发）。

### 14.6 VIP 权益（`vip.go`）

上游字段 → 内部语义（**命名交叉是历史大坑**）：

| 上游（SRFVipQuery_V2 infoMap） | 内部 | 等级 |
| --- | --- | --- |
| `HugeVip` | `VipInfo.Svip` | 超级会员（→Membership 2） |
| `iSuperVip` | `VipInfo.Identity.HugeVip` | 豪华绿钻（→Membership 1） |
| `iVipFlag` | `VipInfo.Identity.Vip` | 绿钻（→Membership 1） |

到期时间按**北京时间墙钟**（`vipZone=UTC+8`），`ParseVipTime` 认 `2006-01-02 15:04:05 / 15:04 / 日期`（日期型到期有效到当日 23:59:59；年份限 2000..2100）；`VipActive` 规则：flag≠1 直接无效；显式无效日期不臆造会员；未给时间才信标志。`Active(now)` 逐条裁剪后才是 `membershipFromInfo` 的输入。

主查询 `userInfo.VipQueryServer/SRFVipQuery_V2`（web 平台 + Referer/Origin=y.qq.com；`uin_list` **必须 string[]**，传数字报 10006；严格 key 匹配回显——只认自己 uin 的条目）；失败回退 `VipLogin.VipLoginInter/vip_login_base`（旧语义：顶层 svip=豪华绿钻、identity.HugeVip=超会，映射已按真实含义修正）；凭证/限流类错误**不回退**（交会话层刷新，不掩盖过期、不绕过限流）。

## 15. QMCv2 解密

**解密边界**（现行实现与 Python 版的根本差异）：会员加密档位（`.mflac/.mgg`）取 ekey 后**流式解密播放**——解密仅驻内存、按绝对偏移可重入、全链路无「解密后整文件」内存峰值、不落盘、ekey 不透传给播放端。

### 15.1 Cipher 抽象（`qmc/qmc.go`）

| 项 | 值/语义 |
| --- | --- |
| `Cipher` 接口 | `Decrypt(data, offset) []byte`——offset 是**密文文件中的绝对字节偏移**；返回新切片 |
| `InPlaceCipher` 扩展 | `DecryptInPlace(data, offset)`——中继热路径就地解密（零分配）；`pump` 优先走这条，旧式 Decrypt 兜底 |
| 主密钥长度分界 | `mapKeyMaxLen = 300`：`len(masterKey) ≤ 300` → Map 密码；`> 300` → RC4 密码（与官方客户端一致，对应 Rust `QMCv2Cipher::new`） |
| `NewCipherFromEkey(ekey)` | `DecryptEkey → 主密钥 → NewCipher` |
| `DecryptFile` / `DecryptV1File` | 整文件工具（本地小文件/测试；V1 走全局静态密钥） |

### 15.2 ekey 结构（`qmc/ekey.go`）

| 形态 | 判定 | 解法 |
| --- | --- | --- |
| V1 | 常规 base64 | 解码后前 8 字节为 header，余下 TEA-CBC；TEA 密钥 = `interleave(simpleKey8, header8)`（16 字节交错）；返回 header+主密钥 |
| V2 | 以 base64(`"QQMusic EncV2,Key:"`) = `UVFNdXNpYyBFbmNWMixLZXk6` 开头 | 载荷先 TEA(KEY1) 再 TEA(KEY2) 双层解密 → 截断到首个 0 字节 → 走 V1 |
| `simpleKey8` | 由 `tan(106 + i*0.1)` 派生 8 字节（**全部 f32 语义**、向零截断、钳 0..255——与 Rust 对齐，别改浮点精度路径） | |
| `ekeyV2Key1` | `33 38 36 5A 4A 59 21 40 23 2A 24 25 5E 26 29 28` | |
| `ekeyV2Key2` | `2A 2A 23 21 28 23 24 25 26 5E 61 31 63 5A 2C 54` | |

TEA（`tea.go`）：16 轮，`teaDelta = 0x9E3779B9`（与标准 TEA 相同）。

### 15.3 Map 密码（`qmc/map.go`）

- 主密钥压成 128 字节表（`ekey[0..n] %128` 折叠）；V1 全局静态 128 字节表（首字节恒 `0xc3`，见 `v1StaticKey`）。
- 变换：`out = in ^ key128[idx]`；**idx 规则必须与 unlock-music 对齐**：`offset > 0x7FFF` 时先 `offset % 0x7FFF` 再 `% 128`——索引在 `0x7FFF` 处「跳变」一次（`0x7FFF→127、0x8000→1`），这是逆向出的原始行为，**不能"优化"掉**。
- 性能实现：256 字节双表 + 分段（以 `0x8000` 为界分两侧取模语义），就地异或。

### 15.4 RC4 密码（`qmc/rc4.go`，QMCv2 主密钥 >300 时）

| 常量 | 值 | 说明 |
| --- | --- | --- |
| 首段 | `0x80` 字节 | 每字节独立 `get_segment_key(绝对偏移, key[偏移%len], hash)` 取索引 |
| 其余分段 | `0x1400` | 段内用预生成密钥流切片异或 |
| 预生成密钥流 | `0x1600` = 段长+512 | skip 上限 `0x1FF`（& 0x1FF），切片恒不越界 |
| skip | `get_segment_key(段号, seed=key[段号%len], hash) & 0x1FF` | seed=0 时 skip=0 |
| hash/nxt | `nxt = (h * v) & 0xFFFFFFFF` 浮点派生 | 与 Rust 实现逐位对齐（`tools/qmc_ref.py` 生成参考向量） |

`tools/gen_qmc_vectors.py` + `qmc_ref.py`：测试向量生成（`qmc_test.go` 消费），改算法先跑 `go test ./qmc/`。

## 16. QRC 逐字歌词解密

`qqmusic/qrc.go` + `qrc_3des.go`：hex 解码 → **3DES 变体**（自定义置换表 `qrcKeyRndShift/qrcKeyPermC/qrcKeyPermD/qrcKeyCompression`，16 轮 Feistel）→ zlib 解压 → UTF-8。

| 项 | 值 |
| --- | --- |
| 3DES 密钥 | `"!@#)(*$%123ZXC!@!@#)(NHL"`（24 字节 ASCII，硬编码——上游公开逆向所得） |
| 失败语义 | 解不开返回**空串**，调用方保留原值（对齐 SDK `contextlib.suppress`） |
| 出口 | `GET /song/{v}/lyric` 的 `normalizeLyric`：`lyric/trans/roma/singing_annotations_lyric` 全部现场解密后返回；`qrc` 为逐字歌词开关 |

## 17. 电源抑制 inhibit

### 17.1 协议（`POST /inhibit`）

```jsonc
// 请求
{"active": true, "mode": "sleep"}   // mode 缺省=sleep；仅接受 "sleep"|"idle"，其余 400
// 响应 data
{"supported": true, "active": true, "reason": ""}
```

| 语义 | 说明 |
| --- | --- |
| 双模式独立句柄 | App 持 `inhibitSleep`（播放禁睡眠）与 `inhibitIdle`（画廊禁空闲/息屏）两个 `Inhibitor`，各自 Acquire/Release |
| 幂等 | Acquire/Release 重复调用无副作用；底层失败不改 active（下次 Acquire 重试自愈） |
| 心跳重申 | 渲染层桥（`ui/src/lib/inhibit.ts`）30s 心跳**无条件**重申期望态——sidecar 重启/请求丢失/被误清后自愈 |
| 期望态判定 | sleep：`[Playing] InhibitSleep=True` && 有曲目 && 正在播（loading 不算）；idle：`player.gallery && player.expanded` |
| 送达节流 | player.notify ~4Hz，指纹不变不打请求；失败静默（丢抑制不致命），等下轮心跳 |
| 生命周期 | 不挂 pagehide 释放；sidecar 进程退出 → OS 自动回收（门户随 D-Bus 断、Win 句柄/macOS 断言随进程灭） |
| `supported=false` | 本编译目标无平台实现（`inhibit_other.go`），`reason` 说明 |

### 17.2 平台实现常量

| 平台 | 机制 | 关键值 |
| --- | --- | --- |
| Linux（首选） | XDG Desktop Portal `org.freedesktop.portal.Desktop /org/freedesktop/portal/desktop org.freedesktop.portal.Inhibit` | flags：`0x1`=Logout `0x2`=UserSwitch **`0x4`=Suspend（sleep 模式）** **`0x8`=Idle（idle 模式）**；`handle_token="quaver"+base36(nanos%1e9)`；reason 文案 `"Quaver 正在播放音频"` / `"Quaver 正在画廊播放"`；等 Response 信号超时 `4s`，清理 250ms |
| Linux（回退） | logind 直连 `org.freedesktop.login1.Manager.Inhibit` | `who="Quaver"`、`why=同上`、`mode="block"`，持 fd 释放 |
| macOS | IOKit `IOPMAcquireAssertion…`（purego dlopen，零 cgo） | AssertType：sleep→`PreventUserIdleSystemSleep`、idle→`PreventUserIdleDisplaySleep`；AssertLevel=`255`（kIOPMAssertionLevelOn）；AssertName=`"Quaver"`（`pmset -g assertions` 可见） |
| Windows | `PowerCreateRequest/PowerSetRequest/PowerClearRequest`（kernel32，Win7+ 无需特权） | ModeSleep→`PowerRequestSystemRequired`(1)、ModeIdle→`PowerRequestDisplayRequired`(0)；REASON_CONTEXT `Version=0, Flags=0x1`(SimpleReasonString)；错误路径全 return error 绝不 panic |

## 18. MPRIS 守护进程

> 这是遗留 Typhoeus 仓库**目前唯一存活的部分**（Python 后端已删）。Linux 专用；Windows/macOS 由渲染层 `navigator.mediaSession` 直驱（SMTC / Now Playing，纯 TS 不经主进程）。计划迁移回前端或整合进 Go。

### 18.1 进程拓扑与线协议

```
渲染层 ui/src/mpris.ts ──ipc(quaver:mpris / quaver:mpris-cmd)── Electron main ──stdio NDJSON──> mpris-daemon ──D-Bus──> org.mpris.MediaPlayer2.quaver
   状态快照（离散变化推 + 5s 心跳纠偏）                        spawn(ELECTRON_RUN_AS_NODE=1)     │
   控制命令执行（toggle/next/seek/volume/mode…）  <── cmd ──────────────────────────────────────┘
```

`mpris/src/types.ts`：`PROTOCOL_VERSION = 1`；每行一个 JSON。

**入向 `state`（渲染层→daemon）**：`{v:1, t:"state", status:"Playing|Paused|Stopped", posUs(微秒), volume(0..1,静音=0), loop:"None|Track|Playlist", shuffle, seeked?, track|null, queue[](≤200 截断), can{next,prev,play,pause,seek,control}}`。

**出向**：`hello{identity}`（握手就绪）；`cmd`：`play/pause/playpause/stop/next/prev/raise/quit/present`、`volume{value}`、`setLoop{loop}`、`setShuffle{on}`、`seek{deltaUs}`、`seekTo{posSec,trackId?}`、`jump{trackId}`、`openUri{uri}`。`raise/quit` 由主进程消费（showWindow/app.quit），其余转渲染层执行——**UI 永远是唯一事实源**，总线侧写入回流到 UI 状态。

| 规则 | 值/语义 |
| --- | --- |
| 总线名 | `org.mpris.MediaPlayer2.$QUAVER_MPRIS_NAME`（默认 `quaver`）；Identity=`QUAVER_MPRIS_IDENTITY`（主进程传 `Quaver Music`） |
| trackid | `/org/quaver/track/<key 安全化>`：非 `[A-Za-z0-9_]` 全替换 `_`、去首尾 `_`、空→`unknown`；key=`_key ?? mid`（同 mid 多版本去重）；渲染端 jump 反解用同一规则 |
| 幂等 | daemon 端 diff 后才写总线属性（音量钳 0..1、can 串、trackKey、queue 签名）；任意一帧丢失由下一帧纠偏 |
| 位置外推 | 位置不进高频通道：daemon 以收到帧的 `posUs` 为基准单调外推（Playing 时 +dt、钳到时长），`playerctl position` 平滑 |
| 队列 | TrackList 数据源 ≤200（`player.queue.slice(0,200)`） |
| 心跳 | 渲染层 `HEARTBEAT_MS = 5000`（离散变化即时推，低频纠偏；播放中无逐秒 IPC） |
| daemon 路径 | 打包：`<resources>/mpris/mpris-daemon.cjs`（extraResources）；开发：`vendor/Typhoeus/mpris/dist/mpris-daemon.cjs`（缺则跳过 MPRIS） |
| 崩溃重拉 | 快速退出（存活 <5000ms 且 code≠0）= 无 D-Bus 会话，不重试；活过之后的崩溃退避重拉 `2000ms×n`，最多 3 次 |
| 已知库坑 | mpris-service 2.1.2：`HasTrackList` 默认 false 且不自动同步（手动 `player.hasTrackList=true`）；`addTrack()` this 引用错误（只走 `tracks` 整表替换） |
| 构建 | `cd ui && pnpm run mpris:build`（pnpm install + esbuild → 自包含 CJS，唯一外置 x11 且永不加载）；e2e：`node test/e2e.mjs`（需活动会话总线，14 项断言） |
| win/mac 边界 | SMTC/Now Playing 标准按钮只有 play/pause/prev/next/seekto；循环/随机/音量系统侧不暴露 |

## 19. 前端接线契约（ui/）

### 19.1 Electron 主进程（`ui/electron/main.ts`）

| 项 | 值/语义 |
| --- | --- |
| 打包 sidecar 路径 | `<resources>/bin/quaver-server`（Windows `quaver-server.exe`） |
| 开发态命令 | `vendor/Typhoeus-go/typhoeus-go(.exe)` 存在→直跑；否则 `go run ./cmd/quaver-server`（go run 转发 stdio，QCRED1 管道不受影响） |
| 不自拉条件 | 环境已设 `QUAVER_API`（手工 sidecar/联调）→ 跳过 spawn（日志明示凭证只驻内存） |
| spawn env | `QUAVER_PORT=<3201+rnd200>`、`QUAVER_CONFIG_DIR`、`QUAVER_CREDENTIAL_MODE=external`、stdio pipe |
| 注入时序 | spawn 后**立即** `stdin.write(encodeHandoff(cred|null))`——sidecar 阻塞读这一行 |
| stdout 分流 | 先分行再判前缀：`QCRED1` 行 → `applySidecarCredential`（safeStorage 落盘/清档）；其余 → `[sidecar]` 日志 |
| 探活 | `waitSidecar(port, 15000ms)` 轮询 `GET /` 后才开窗（历史 PyInstaller 首启解包竞态的遗产，对 Go 依然保留） |
| relay 特判 | `/api/img`（封面白名单代理）、`/api/log`（tail 默认 800、上限 5000 行、2MB 字节窗口）、`/api/bg`、`/api/accent`、`/api/sparkle/*` 在转发前截住；`/api/stream/<token>` **流式管道不缓冲**，透传 `Range`，客户端断线 abort 上游 |

### 19.2 渲染层播放主链路（`ui/src/lib/api.ts` 等）

| 项 | 值/语义 |
| --- | --- |
| 基础路径 | 同源 `/api/*` → `api()` 解信封（非 0 code 或非 2xx 抛 `ApiError(status,msg)`） |
| 档位表 | `QUALITIES`（11 档，必须与后端 tierTable 全量对齐——设置页列表虽是动态 `/stream/tiers`，白名单回读仍用这张表）；`QUALITY_SHORT` 胶囊短名 |
| 默认音质 | `quaver.conf [Quality] DefaultQuality`：`Auto|96ogg|128|192ogg|320|320ogg|flac|640ogg|atmos2|atmos51|atmos71|master`；播放条会话级覆盖（不持久化） |
| resolve 超时 | `RESOLVE_TIMEOUT_MS = 12000`（超时→ApiError 408「取链超时」；后端嗅探预算 5s 就是为它让路） |
| auto 语义 | `tier="auto"` → 取 `/stream/tiers` 缓存的 `max`，再兜底 `"128"`；`tiersCache` 由 `invalidateStreamTiers()` 在登录态变化时清 |
| 回退排序 | `[Quality] FallbackToQMAtmos`：`False`（默认，"no-atmos"）→ `deprioritize=["atmos51","atmos71"]`；`True`（"rank"）→ 空 |
| 终极兜底 | 目标档 resolve 失败 → 再发一次 `tier="128"`（degraded 标记）；仍失败才报错 |
| 写侧 songType | `writeSongType = max(0, (type ?? 1) - 1)`——见 §11.2 |
| 档位存在性 | 上游 `file.size_new` 位置语义（实测对账 2026-10）：`[0]=master [1]=atmos2 [2]=atmos51 [3]=320ogg [5]=640ogg [6]=atmos71`；命名 `size_128mp3/size_320mp3/size_flac/size_192ogg/size_96ogg`；`size==0 ⇒ 无源 ⇒ 选择器隐藏该档`（会员锁定档仍展示标 🔒） |
| 流信息浮窗 | 渲染层对 `/api/stream/<token>` 发小 Range 自解析容器头（FLAC STREAMINFO / Ogg Vorbis·Opus ID 头 / MP3 帧+ID3v2 syncsafe 跳标签）；加密流后端已解密，渲染层只见明文；声道上界按规范放到 255（atmos71 12ch） |
| 封面 | `https://y.gtimg.cn/music/photo_new/T002R{size}x{size}M000{pmid或album.mid}.jpg`；取色走 `/api/img?u=` 白名单代理（hosts：y.gtimg.cn/qpic.y.qq.com/img.y.gtimg.cn/pictax.qpic.cn；路径前缀：/music/photo_new/、/music_cover/、/music/a_） |
| 歌词红心等 | 均经 `/api` 信封；红心预载/同步有本地缓存 TTL（`LOVED_TTL`，播放器内） |

## 20. 构建、测试与调试

### 20.1 本地

```bash
# 后端
cd vendor/Typhoeus-go
go build -o typhoeus-go ./cmd/quaver-server
QUAVER_PORT=3200 ./typhoeus-go            # 默认 http://127.0.0.1:3200（memory 模式）
go test ./...                             # 单测全部无网络依赖（qmc 向量、resolver 假 provider、
                                          # compat 形状、sign/qrc/vip/login 解析等）

# MPRIS
cd ui && pnpm run mpris:build             # → vendor/Typhoeus/mpris/dist/mpris-daemon.cjs

# 前端整包（含 sidecar 拉起）
pnpm run dev / pnpm run app               # 主进程 spawn，QCRED1 走 stdin/stdout
```

### 20.2 CI（`.github/workflows/build.yml`）

- 纯 Go 交叉编译（websocket 唯一直接依赖，零 cgo）：单 ubuntu runner 出全矩阵——

| arch_label | GOOS/GOARCH | 产物 |
| --- | --- | --- |
| linux-x86_64 | linux/amd64 | `quaver-server-x86_64` |
| linux-aarch64 | linux/arm64 | `quaver-server-aarch64` |
| windows-x64 / windows-arm64 | windows | `quaver-server.exe` |
| macos-arm64 | darwin/arm64 | `quaver-server` |
| linux-loong64 | linux/loong64 | `quaver-server-loong64`（只出 sidecar；Electron/mpv 上游不发 loong64） |

- `go build -trimpath -ldflags "-s -w"`；artifact 名沿用 PyInstaller 时代约定（`sidecar-<os>-<arch>`），前端下载 job 零改动。
- linux x86_64 档在原生 runner 真跑冒烟：`QUAVER_PORT=3999` 起服务探活。
- 打包：electron-builder 把对应二进制放进 `<resources>/bin/quaver-server(.exe)`。

### 20.3 验证脚本（`ui/scripts/`，与后端相关）

| 脚本 | 覆盖 |
| --- | --- |
| `typhoeus-smoke.ts` | **headless Chrome 真 `<audio>` 逐档播放**（flac/640ogg/master/320/128/auto）——端到端最硬的一道冒烟，需 dev server(:5173)+登录态 |
| `verify-user-vip.ts` / `verify-daily.ts` / `verify-guess.ts` | VIP 权益形状、每日30首、无限电台去重 |
| `verify-keyring.ts` / `verify-login.ts` | 密钥环/密码存储决策、登录流程形状 |
| `verify-streaminfo.ts` / `verify-songtiers.ts` | 容器头解析合成向量、档位存在性 |
| `pnpm run verify:static` | 全部静态/无网验证一次性跑 |

### 20.4 调试抓手

- `QSG_DEBUG_CGI=1`：stderr 打印每条 CGI 的 module/method/payload 大小（诊断用，勿留日志）。
- 会员判定/嗅探放行/平台回退等协商线索 → sidecar stderr（`electron-dev.log`）`WARN` 行（`typhoeus.Logf = logWarn` 接线）。
- `GET /login/status` 的 `credential_mode` 可手工 curl 确认交接模式。
- QMC 算法改动：先 `tools/gen_qmc_vectors.py` 重生成向量再 `go test ./qmc/`。
- curl 手测样例：`curl 127.0.0.1:3200/`、`…/stream/tiers`、`POST /stream/resolve {"mid":"001qhwq62Urz06","tier":"flac","auto":true}`。

## 21. 硬约束与红线清单

1. **明文凭证一个字节都不落盘**。sidecar 从不读写凭证文件；唯一磁盘形态是主进程的 `credential.enc`（钥匙在 OS 密钥管理器）。拿不到真密钥环 → 退**内存**，不退明文。
2. **stdout 只走 `QCRED1` 交接**，日志一律 stderr；stderr 会原样进 `electron-dev.log`（会被贴进 issue）——任何代码路径不得把 musickey/refresh_token/ekey 打进日志。
3. **QCRED1 前缀（含末尾空格）是双向逐字契约**：`server/session.go` ↔ `ui/electron/keyring.ts`，改一边必须改两边。配置目录规则三处一致（Go `ConfigDir` / TS `config.ts` / 主进程显式下发）。
4. **ekey 不透传播放链路**：`/stream/*` 出口只有 token；`/song/urls` 是通用取链端点（result=0 才带 ekey），仅供解密播放链路内部/批量工具使用，UI 播放主链路不走它。
5. **解密不落盘、无整文件峰值**：中继按 Range 分片就地解密直推；任何"先解密到磁盘/到完整 buffer"的改动都违背设计。
6. **uin 精度**：凭证数字字段严禁 float64 中转；`uin/qq/uin_list` 一律优先 `StrMusicID`。`uin_list` 必须 string[]（数字报 10006）。
7. **QMC 逆向行为不可"优化"**：Map 密码 `0x7FFF` 取模跳变、ekey simple key 的 f32 tan 派生、RC4 分段 skip 语义——与 unlock-music/Rust 逐位对齐，改动必须过向量测试。
8. **EVkey 通道必须复刻官方桌面形态**（guid=10000/ctx=1/loginflag=1/platform="27"/songtype≥1/media_mid、comm cv=1859+authst+tmeLoginType），错一项上游按无权限拒（104003/101404）；`songmid` 用 media_mid 而**归档必须用请求的 mid**（用回包 songmid 会导致 `media_mid≠mid` 的歌全落空——历史症状「只有 HD OGG 能解」）。
9. **回退链纪律**：档位表只放浏览器可播容器（NAC 永不入表；dts/atmosdb/vinyl 已裁撤勿复活）；`deprioritize` 永不动目标档本身；显式选档会员不足回 403（不静默降档），auto 模式才裁剪链。
10. **时延预算**：前端 resolve 超时 12s → 嗅探单次 5s、探测失败不推翻协商、CDN 抖动重试后放行（网络失败≠内容不符）；断流续传最多 2 次、后缀 Range+未知长度不续传、上游忽略 Range 回 200 时宁可放弃不重发字节。
11. **电台必须串行**（并发触发 700000）；每日三十首必须登录（10004）；搜索匿名可触发 429 属上游风控常态。
12. **写侧 songType = 读侧 - 1**（下限 0）；Add/Del 的 PreserveBool 差异照抄勿统一；80092 按成功。
13. **compat.go 是形状契约唯一真相**：前端 TS 接口按当年 Python SDK pydantic dump 编写，字段别名链（snake/驼峰/连写）以 SDK 为准；名字错了不报错只静默少数据。新增归一优先沿用 `pick/numOf/jsonInt` 族工具。
14. 会员查询失败≠无会员：短重试(15s)+陈旧窗口(2×TTL)内沿用，凭证类错误不缓存；首次失败明确报错。**不通过重试掩盖过期、不绕过限流**。
15. 档位表变更的连带清单：后端 `tierTable` ↔ UI `QUALITIES/QUALITY_SHORT/songtiers(SIZE_NEW_INDEX)/prefs 白名单` ↔ README/本指南——四处必须同步。
16. `GET /song/{value}/detail` 等 `{value}` 通配段数字/字符串双栖（`isDigits` 分流 songId/songMid）；路由用 Go 1.22 模式语法，字面量段优先于通配段（`/songlist/fav/check` 与 `/songlist/{id}/detail` 共存即靠此）。
17. `POST /song/urls` 顶层 `file_type` 整段缺省得到 0（DTS_X）——调用方需要默认档请显式传 13；per-item 传 `null` 才是继承。
18. MPV/FFmpeg 集成与 MPRIS 回迁仍在计划中（与本文档无关，但改 MPRIS/inhibit 前先读 §17/§18 的进程拓扑）。

> 维护提示：本指南与代码同仓演进。新增常量/端点/错误码时，请在对应表格登记；删档（如本轮的 Python 后端）请同时从指南移除对应章节。
