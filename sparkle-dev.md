# 插件（Sparkle）开发

Sparkle 是 Quaver Music 的插件系统。插件是一个实现 `SparklePlugin` 的对象：在 `setup(ctx)` 里通过 `SparkleContext` 注册扩展点（路由 / 侧栏 / 设置页 / 主题 / 正在播放页 / 右键菜单 / 播放源 / 逐字歌词），返回的函数（可选）作为 dispose，在插件停用时调用。

SDK 与官方插件托管在独立仓库 **quaver-sparkle**，以 git submodule 挂在主仓库的 `vendor/Sparkle`（与 `vendor/Typhoeus` 同模式）。ui 的 Vite 通过 alias 把 SDK 源码级打进 `ui/dist`，该仓库不单独构建：

```ts
// ui/vite.config.ts
{ find: /^@quaver\/sparkle\//, replacement: ".../vendor/Sparkle/" },   // 子路径正则必须在前
{ find: "@quaver/sparkle",     replacement: ".../vendor/Sparkle/sdk/index.ts" },
```

## 两类插件

| | 官方插件（`kind: "official"`） | 第三方插件（`kind: "third-party"`） |
|---|---|---|
| 形态 | 源码在 quaver-sparkle 的 `plugins/<id>/`，随宿主静态打包（Vite 代码分割，启用才加载） | ESM **单文件** `main.js`，安装到配置目录 `plugins/<id>/`，运行时动态 `import()` |
| 默认状态 | 默认启用（用户显式停用后不再自动启用） | 安装后默认**关闭**，需手动启用 |
| 依赖 | 可正常 import 任何被打包的依赖（如 AMLL） | 必须**自包含**：运行时 URL 下没有 bare import 解析，依赖要全部打进这一个文件 |
| 分发 | 随宿主更新 | Marketplace 索引 + 主进程代下载，或本地手装 |

插件作者唯一需要 import 的模块是 SDK 入口：

```ts
import { definePlugin } from "@quaver/sparkle";
```

## 快速上手

```ts
import { definePlugin } from "@quaver/sparkle";

export default definePlugin({
  id: "my-plugin",        // kebab-case；第三方必须与安装目录名一致
  name: "My Plugin",
  version: "1.0.0",       // semver 字符串
  author: "you",
  description: "…",
  kind: "third-party",    // 官方插件为 "official"；宿主加载时会按来源强制归一
  setup(ctx) {
    ctx.registerSettingsSection({
      id: "hello",
      title: "Hello",
      render(box) {
        const p = document.createElement("p");
        p.textContent = "Hello from Sparkle!";
        box.append(p);
      },
    });
    return () => {
      // 可选 dispose：停用/卸载时调用（清理定时器、监听等）
    };
  },
});
```

官方插件即现成示例：

- `plugins/die-for-you/index.ts` — `registerSettingsSection` 的最小集成与 dispose 写法；
- `plugins/amll/index.ts` — 逐字歌词提供器（parse + render + enabled）的完整实践，见下文[逐字歌词提供器](#逐字歌词提供器)。

## 生命周期

- **启用**：宿主加载模块 → 形状校验（`id` 匹配 `^[a-z0-9][a-z0-9-]*$`、`name`/`version` 为字符串、`kind` 合法、`setup` 为函数；第三方插件 `id` 必须与目录名一致）→ `setup(ctx)`。注册动作在 `setup` 里调用即生效：nav DOM 立即补挂、正在播放页部件立即 mount、侧栏立即重画。
- **broken 态**：`setup` 抛错 = 宿主倒序回滚已注册的半截资源，标记 broken（toast 提示、不写入启用集合、本会话内不再尝试），不影响其它插件。设置页显示「启动失败」。
- **停用**：宿主倒序执行本插件所有注册项的反注册闭包（删路由 / 侧栏项 / CSS / 菜单项…），再调用 `setup` 返回的 dispose；若正停在该插件的路由页则跳回首页。
- **启动顺序**：`initSparkle()` 在 `bootShell()` 之后调用、不阻塞首帧——插件的视图/侧栏项/设置区在首帧后补挂，属渐进增强。官方插件先于第三方插件，逐个串行启用。

启用集合等状态持久化在 localStorage（键见文末[一览表](#localstorage-键一览)）。官方插件的默认启用由 `official-known`（见过的官方插件）播种：新官方插件发布时老用户自动默认启用，且不重置用户显式停用过的插件（`official-off` 标记）。

## SparkleContext 参考

`setup(ctx)` 拿到的 `ctx` 上有九个注册方法（均只能在 setup 期调用，pluginId 由宿主闭包提供）加四个工具。

### registerView(path, view)

注册内容区路由，`#/my-page` 可达。`path` 形如 `"/my-page"`（不带 `/` 会自动补）；视图签名与宿主视图一致：

```ts
ctx.registerView("/my-page", (root, q) => {
  // root: 路由容器；q: URLSearchParams（#/my-page?a=1 的查询参数）
  root.innerHTML = `<h1>My Page</h1>`;
  return () => { /* 离开页面时的清理（可选） */ };
});
```

路由注册重复会抛错（插件进 broken 态）；与内置视图同路径时内置优先，插件路由不可达。停用时删除路由；若正停在该页则跳回首页。

### registerNav(item)

侧栏导航项，追加在内置导航之后：

```ts
ctx.registerNav({ path: "#/my-page", label: "我的页面", iconSvg: "<svg……</svg>" });
// iconSvg 缺省用 Sparkle 星形图标
```

### registerSonglistGroup(group)

侧栏「歌单」区追加一组自定义列表（插件自建歌单、外部来源歌单）。`items()` 在每次侧栏重画时调用，返回最新列表：

```ts
ctx.registerSonglistGroup({
  id: "my-group",
  label: "外部歌单",
  items: () => [{ id: "a", title: "歌单 A", picurl: "…", href: "#/my-page?list=a" }],
});
```

`href` 通常指向本插件 `registerView` 注册的路由。注册/停用都会触发侧栏重画。

### registerSettingsSection(section)

设置页 **Sparkle tab** 里的一个设置分组。`render(box)` 往容器里填 DOM，返回的清理函数在面板销毁（切路由）或插件停用时调用：

```ts
ctx.registerSettingsSection({
  id: "main",
  title: "我的插件设置",
  render(box) {
    box.innerHTML = `…`;   // 可用宿主的 set-label / muted / ghost-btn 等既有样式类
    return () => { /* 清理监听 */ };
  },
});
```

注册表变化（任一插件启停）会触发设置区整体重画，`render` 会被再次调用——不要在闭包里假设 DOM 长存。

### registerTheme(theme)

自定义主题，`css` 是一组 CSS 变量覆盖（变量名与 `ui/src/style.css` 的主题组一致）：

```ts
ctx.registerTheme({
  id: "my-theme",
  name: "我的主题",
  css: `--bg:#101014; --card:#17171d; --ink:#e8e8f0; --acc:#8a7dff;`,
});
```

宿主把它注入为 `html[data-sparkle-theme="<id>"]{…}`，特异性高于 `html[data-theme]`，未覆盖的变量自然回落亮/暗底色。激活入口在设置 → **外观** → 「Sparkle 主题」：卡片组列出所有已注册主题（任一插件注册/停用即时增删，无主题时整组隐藏），「默认」卡片即不使用插件主题；激活状态持久化（`quaver.sparkle.theme.v1`），停用正激活主题所属的插件时宿主自动回落默认。注意：

- Sparkle 主题是独立覆盖层，不参与「跟随系统」的明暗切换，也不写进外观（Style）配置——上方外观模式选明暗，Sparkle 主题在其上叠加变量；

### registerNowPlayingWidget(widget)

正在播放页歌词区下方的插件槽（`#np-plugin-widgets`）内挂部件。注册即 mount，`render(box)` 返回的清理函数在停用时调用：

```ts
ctx.registerNowPlayingWidget({
  id: "my-widget",
  render(box) {
    box.innerHTML = `<p class="muted">Hello</p>`;
    return () => { /* 清理 */ };
  },
});
```

### registerSongMenuItem(item | fn)

歌曲右键菜单追加项（排在「更多操作」之前）。可传对象，也可传函数按上下文动态生成：

```ts
ctx.registerSongMenuItem((mctx) => ({
  label: `收藏到我的歌单`,
  // note / thumb / round / danger / disabled / sub? 与宿主 MenuItem 同型
  run: () => { /* mctx.song 为当前右键的歌曲对象，mctx.list / mctx.index 为列表上下文 */ },
}));
```

函数型条目在每次弹出菜单时求值；求值或 `run` 抛错会被宿主吞掉并 warn（不阻塞菜单）。

### registerStreamSource(source)

备用播放源链的一环。按注册顺序组成源链（先注册先试）：`resolve` 返回非 null 即采用；返回 null（或抛错，会被吞掉并 warn）放行给下一环；全链落空后由宿主走官方 `/stream/resolve`：

```ts
ctx.registerStreamSource({
  id: "my-source",
  async resolve(song, quality) {
    // song 为宿主歌曲对象，quality 为品质标识
    const url = await fetchFromMyBackend(song, quality);
    return url ? { url, tier: "flac", label: "我的源" } : null;
    // url 可直接挂播放器：相对 /api/... 或绝对均可
  },
});
```

### registerKaraokeProvider(provider)

见下一节。

### storage / toast / log / player

- `ctx.storage`：插件专属持久化，localStorage 命名空间 `sparkle.<pluginId>.<key>`，`get/set/remove/keys`（`keys()` 返回不含前缀的本插件全部 key）。
- `ctx.toast(msg, "ok" | "err")`：右上提示条。
- `ctx.log.info / warn / error`：控制台输出自动带 `[sparkle:<id>]` 前缀。
- `ctx.player`：播放器**只读**门面，插件不能直接改队列或播放状态：

```ts
ctx.player.current   // { mid, name, singer: [{name}], album: {name?, mid?} } | null（快照）
ctx.player.time      // 当前播放位置，秒
ctx.player.paused    // 是否暂停
const off = ctx.player.on(() => { /* 约 4Hz + 播放态等状态变化即发 */ });
// 在 dispose 里调用 off() 退订
```

## 逐字歌词提供器

`SparkleKaraokeProvider` 分两段接管逐字歌词：

```ts
ctx.registerKaraokeProvider({
  // ① 解析：player 拉到原始歌词后先问 provider。
  //    content 为原始歌词文本（可能是 QRC XML 信封 / 纯文本 QRC / TTML / LRC…），
  //    translation 为翻译歌词（普通 LRC）文本。
  //    返回 null（或空行表）= 放弃，宿主回退普通 LRC 行级歌词。
  parse(content, translation): SparkleKaraokeLine[] | null,

  // ② 渲染：正在播放页的逐字歌词容器整体交给 provider（容器尺寸随宿主布局变化）。
  //    返回的清理函数在换曲/停用时调用。
  render(host, lines, ctx): (() => void) | void,

  // ③ 可选总开关（如插件设置里的开关）：宿主每次 notify 重读，false 即回退行级歌词，
  //    切换即时生效（最迟下一个播放事件/4Hz）。
  enabled?: () => boolean,
});
```

行结构 `SparkleKaraokeLine` 与 `@applemusic-like-lyrics/core` 的 `LyricLine` 兼容：`words: {word, startTime, endTime}[]`（毫秒时间轴）、`startTime`/`endTime`、可选 `translatedLyric`（宿主「翻译」开关关闭时由渲染方自行剔除）、`isBG`（背景人声）、`isDuet`（对唱行靠右）。停用插件即宿主移除 provider，正在播放页自动回退行级歌词；多个 provider 先注册先得。

`render` 拿到的 `ctx` 是宿主实时状态的**只读闭包**（每次调用读到的都是当前态）：

| 方法 | 语义 |
|---|---|
| `time()` | 当前播放位置，毫秒（已含宿主时间补偿） |
| `paused()` | 是否暂停 |
| `expanded()` | 正在播放页是否展开；收起时应冻结渲染循环省资源 |
| `showTrans()` | 「翻译」开关当前状态 |
| `seek(ms)` | 跳转到指定位置 |
| `onNotify(cb)` | 订阅宿主通知（约 4Hz + 播放态/展开收起等状态变化即发），返回退订函数 |

宿主 notify 只有 4Hz，逐字扫色需要逐帧时间，所以渲染要**自驱 rAF 时钟**，用 ctx 闭包逐帧读状态。AMLL 官方插件（`plugins/amll/index.ts`）沉淀了四条必须遵守的经验：

1. **收起冻结、notify 唤醒**：`expanded()` 为 false 时停掉 rAF；重新展开必须靠 `ctx.onNotify` 唤醒自己的循环——收起时自停的 rAF 没有人会替你重启，漏了这条歌词会永久冻结。
2. **时间去抖**：宿主的 position 是外推时钟（~4Hz 快照重同步），重同步瞬间可能回跳几十毫秒；对小幅倒退（<250ms）钳平为原值，只有超过阈值的真·seek 才放行倒退，否则渲染引擎会把每次小幅回跳都当跳转处理。
3. **播放态只在变化时同步**：每帧反复 `pause()/resume()` 会持续扰动渲染引擎的跳转推算，先比对再切换。
4. **帧增量钳制**：`dt` 钳到 ~50ms 上限（标签页切回等场景），避免一次大 dt 造成滚动跳变。

## 第三方插件：打包、安装与调试

### 安装布局

```
<configDir()>/plugins/<plugin-id>/
├── plugin.json   # { id, name, version, author?, description?, main: "main.js" }
└── main.js       # ESM：export default <SparklePlugin>（具名导出 plugin 也被接受）
```

- `id` 必须匹配 `^[a-z0-9][a-z0-9-]*$` 且与目录名一致（校验不过不进 setup）。
- **单文件自包含**：宿主经 `/api/sparkle/plugin/<id>/<file>` 把文件以 `text/javascript` 提供给渲染层动态 `import()`，运行时 URL 下没有 bare import 解析——依赖必须打进这一个文件：

  ```sh
  esbuild src/main.ts --bundle --format=esm --outfile=main.js
  ```
- `plugin.json` 由 Marketplace 安装时的索引元数据生成；本地手装插件需自行提供。

### 本地调试

1. 开发机设 `QUAVER_SPARKLE_DIR=/path/to/my-plugins`（主进程与 dev relay 同读；优先于配置目录）。
2. 目录里放 `my-plugin/main.js` 与 `plugin.json`。
3. 打开设置页 Sparkle tab：列表出现该插件 → 启用。
4. 改完 `main.js` 后「卸载 → 重装」或直接重启应用：插件文件 URL 以安装时间戳为 `?v=` 缓存破坏键，不重装拿到的还是旧代码。

Marketplace 面板在浏览器 dev（无 `window.quaverSparkle` 桥）下不可用，本地目录调试不受影响。

## Marketplace

Marketplace 是一个**静态 JSON 索引** + 主进程代下载的最小分发机制（索引与下载均由主进程 fetch，规避渲染层 CORS，经 `quaver:sparkle` IPC 的 `market` / `install` op）。

索引格式（version 1）：

```json
{
  "version": 1,
  "updated": "2026-09-21T00:00:00Z",
  "plugins": [
    {
      "id": "die-for-you",
      "name": "Die For You 歌词",
      "version": "1.0.0",
      "author": "quaver",
      "description": "设置页随机展示《Die For You》歌词",
      "download": "https://example.com/sparkle/die-for-you.js",
      "homepage": "https://github.com/…",
      "hash": "<sha256 hex，可选>"
    }
  ]
}
```

- `download` 必须直指**单文件 ESM .js**（default export 插件对象），v1 不做 zip 分发。
- `hash` 存在时主进程下载后校验 sha256，不匹配拒绝落盘。
- 默认索引源为 `market/default-index.ts` 的 `DEFAULT_MARKET_URL`；用户可在设置页 Sparkle → Marketplace 覆盖（存 `quaver.sparkle.market.url.v1`）。
- 安装成功后默认关闭，需在「已装插件」里手动启用；支持卸载与重新安装（重新安装即更新到最新发布版）。
- 官方索引仓库与收录流程规划中，v1 阶段以自建索引 + 手动安装为主。

## 安全模型

第三方插件在渲染层运行**任意 JS**。壳层 `contextIsolation` 开启、`nodeIntegration` 关闭，插件只能触达宿主暴露的桥（`window.quaverSparkle`）与页面能力；索引里的 `hash` 只防运输损坏，**不构成签名校验**。给用户的提示只有一句：只安装信任来源。

## 宿主侧实现（Quaver 贡献者）

宿主运行时在 `ui/src/sparkle/`，五个文件各司其职：

| 文件 | 职责 |
|---|---|
| `registry.ts` | 注册表，**纯数据、零 ui 模块依赖**（shell/player/SongMenu 都要从这里读，反向 import 任何 ui 模块都会成环）。每个注册动作往对应插件 record 的 `teardown` push 反注册闭包，并 `emitChange()` 通知订阅方 |
| `host.ts` | `SparkleContext` 工厂 + 启停生命周期 + 主题 CSS 注入 + player 门面 + 持久化。所有会碰 ui 模块的接线都在这里 |
| `loader.ts` | 官方插件静态表（Vite 代码分割 chunk）+ 第三方动态 import + 形状校验 |
| `init.ts` | 启动：播种官方默认启用 → 逐个 enable（官方 → 第三方），不阻塞首帧 |
| `settings.ts` | 设置页 Sparkle tab 面板：已装插件（开关/卸载）、各插件设置区、Marketplace |

宿主消费点：`shell.ts`（路由回落 `views[path] ?? sparkleViewAt(path) ?? views["/"]`、侧栏 nav 与歌单分组）、`player.ts`（播放源链、逐字解析）、`NowPlaying.ts`（逐字渲染、部件插槽）、`SongMenu.ts`（菜单项、toast）、`views.ts`（Sparkle 设置 tab、外观面板的 Sparkle 主题切换）。

守护与变更流程：

- `pnpm verify:sparkle`（含在 `verify:static` 链里）对「SDK 导出 ↔ 宿主接线 ↔ 双侧 HTTP 路由」做源码级静态断言，改契约前后跑一遍；
- SDK/官方插件变更：在 quaver-sparkle 仓库提交 → 主仓库 `git add vendor/Sparkle` 固定版本；
- 新增官方插件要同时改 `loader.ts` 的 `OFFICIAL_META` 与 `OFFICIAL_LOADERS`（meta 表是展示真相，加载表有 loader 才能启）。

## localStorage 键一览

| 键 | 内容 |
|---|---|
| `quaver.sparkle.enabled.v1` | 启用集合（string[]） |
| `quaver.sparkle.official-known.v1` | 见过的官方插件 id（播种默认启用用） |
| `quaver.sparkle.official-off.v1` | 被用户显式停用过的官方插件 id |
| `quaver.sparkle.theme.v1` | 激活中的 Sparkle 主题 id |
| `quaver.sparkle.market.url.v1` | Marketplace 索引源 URL |
| `sparkle.<pluginId>.<key>` | 各插件 `ctx.storage` 的命名空间 |
