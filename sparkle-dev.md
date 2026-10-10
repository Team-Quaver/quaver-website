# 花火插件开发

花火插件是 Quaver Music 的插件系统。插件是一个实现 `SparklePlugin` 的对象：在 `setup(ctx)` 里通过 `SparkleContext` 注册扩展点（路由 / 侧栏 / 设置页 / 主题与主题包 / 全站样式层 / 正在播放页 / 右键菜单 / 播放源 / 逐字歌词），返回的函数（可选）作为 dispose，在插件停用时调用。

SDK 与官方插件托管在独立仓库 **quaver-sparkle**，以 git submodule 挂在主仓库的 `vendor/Sparkle`（与 `vendor/Typhoeus` 同模式）。ui 的 Vite 通过 alias 把 SDK 源码级打进 `ui/dist`，该仓库不单独构建：

```ts
// ui/vite.config.ts
{ find: /^@quaver\/sparkle\//, replacement: ".../vendor/Sparkle/" },   // 子路径正则必须在前
{ find: "@quaver/sparkle",     replacement: ".../vendor/Sparkle/sdk/index.ts" },
```

本页服务两类读者：**插件作者**（写插件、打包分发）看到[宿主侧实现](#宿主侧实现)之前就够用；**宿主贡献者**（改宿主接线、动 SDK 契约）直接从那一节读起。

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
  id: "my-plugin",        // kebab-case；第三方必须与安装目录名一致，可用于开发代号
  name: "My Plugin",     // 插件的显示名
  version: "1.0.0",       // semver 字符串
  minHostVersion: "1.4.0", // 可选：低于此 Quaver 版本时不允许安装
  allowBeta: true,          // 可选：允许 1.4.0-beta.x 满足上面的最低版本
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

现成示例按难度排：

- `plugins/die-for-you/index.ts` — `registerSettingsSection` 的最小集成与 dispose 写法；
- `plugins/amll/index.ts` — 逐字歌词提供器（parse + render + enabled）的完整实践，见下文[逐字歌词提供器](#逐字歌词提供器)；
- `marketplace/aurora/index.ts` — 自定义主题（`registerTheme`）的最小形态；
- `marketplace/flowscape/index.ts` — 整页接管正在播放页（专辑流 + 自绘控制带），见[整页接管正在播放页](#整页接管正在播放页)。

## 生命周期

- **启用**：宿主加载模块 → 形状校验（`id` 匹配 `^[a-z0-9][a-z0-9-]*$`、`name`/`version` 为字符串、`kind` 合法、`setup` 为函数；第三方插件 `id` 必须与目录名一致）→ `setup(ctx)`。注册动作在 `setup` 里调用即生效：nav DOM 立即补挂、正在播放页部件立即 mount、侧栏立即重画。
- **broken 态**：`setup` 抛错 = 宿主倒序回滚已注册的半截资源，标记 broken（toast 提示、不写入启用集合、本会话内不再尝试），不影响其它插件。设置页显示「启动失败」。
- **停用**：宿主倒序执行本插件所有注册项的反注册闭包（删路由 / 侧栏项 / CSS / 菜单项…），再调用 `setup` 返回的 dispose；若正停在该插件的路由页则跳回首页。
- **启动顺序**：`initSparkle()` 在 `bootShell()` 之后调用、不阻塞首帧——插件的视图/侧栏项/设置区在首帧后补挂，属渐进增强。官方插件先于第三方插件，逐个串行启用。

启用集合等状态持久化在 localStorage（键见文末[一览表](#localstorage-键一览)）。官方插件的默认启用由 `official-known`（见过的官方插件）播种：新官方插件发布时老用户自动默认启用，且不重置用户显式停用过的插件（`official-off` 标记）。

## SparkleContext 参考

`setup(ctx)` 拿到的 `ctx` 上有**十四个注册方法**（均只能在 setup 期调用，pluginId 由宿主闭包提供），加五个工具：`storage` / `toast` / `log` / `player` / `style`。

| 方法 | 作用 | 停用 / 回滚 |
|---|---|---|
| `registerView` | 内容区路由 | 删除路由；若正停在该页则跳回首页 |
| `registerNav` | 侧栏导航项（追加在内置项后） | 移除 DOM |
| `registerSonglistGroup` | 侧栏歌单分组（`items()` 每次重画取最新） | 移除分组并重画侧栏 |
| `registerSettingsSection` | 设置页 Sparkle 面板的设置分组 | 随面板销毁 |
| `registerTheme` | 变量级自定义主题 | 删 style；若正激活该主题则回落默认；高亮色 / 背景 / 菜单外观策略同步重算 |
| `registerStyleLayer` | 全站样式层（任意 CSS） | 摘掉这张 `<style>` |
| `registerThemePack` | 可切换的主题包（一套完整风格） | 停用插件即摘除；若正选中该包则自动回落默认外观 |
| `registerNowPlayingWidget` | 正在播放页歌词区下方的小部件 | 移除 DOM + 调 render 的清理函数 |
| `registerNowPlayingView` | 整页接管正在播放页 | 卸载插件视图、恢复默认布局、恢复播放条 |
| `registerSongMenuItem` | 歌曲右键菜单项 | 移除菜单项 |
| `registerPlaylistMenuItem` | 侧栏歌单右键菜单项 | 移除菜单项 |
| `registerNowPlayingMenuItem` | 正在播放页「更多操作」菜单项 | 移除菜单项 |
| `registerStreamSource` | 备用播放源链的一环 | 移出源链 |
| `registerKaraokeProvider` | 逐字歌词提供器 | 移除 provider；正在播放页自动回退行级歌词 |

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

设置页 **Sparkle 面板**里的一个设置分组（用户从插件行的齿轮按钮打开）。`render(box)` 往容器里填 DOM，返回的清理函数在面板销毁（切路由/关弹窗）或插件停用时调用：

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

变量级自定义主题，`css` 是一组 CSS 变量覆盖（变量名与 `ui/src/style.css` 的主题组一致）。完整写法与取舍见[主题与样式层](#主题与样式层)。

```ts
ctx.registerTheme({
  id: "my-theme",
  name: "我的主题",
  css: `--bg:#101014; --card:#17171d; --ink:#e8e8f0; --acc:#8a7dff;`,
});
```

### registerStyleLayer(layer)

追加一张**全站样式层**（任意 CSS，不限变量覆盖）。`order` 决定层序，缺省 0；插件启用即生效，与主题包的选择无关。见[全站样式层](#全站样式层)。

### registerThemePack(pack)

注册主题包（一套可切换的完整风格，如 Material Design 3 的亮/暗/高对比）。见[主题包](#主题包)。

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

需要重排**整页**（封面流 / 磁带机 / 极简大字）时用不上下一个方法以外的手段——widget 只是歌词区下方的一小块，拿不到传输控制。

### registerNowPlayingView(view)

**整页接管**正在播放页：宿主让出 `.np-inner`、隐藏原播放条与插件槽，插件自绘整页。`v.enabled()` 返回 false 时不接管。详见[整页接管正在播放页](#整页接管正在播放页)。

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

### registerPlaylistMenuItem(item | fn)

侧栏（主菜单栏）歌单右键菜单的追加项（追加在内置项之后）。同样支持对象或函数形式；函数在菜单**每次打开时按当时那个歌单**现算，运行中切歌单不会残留上一份 ctx：

```ts
ctx.registerPlaylistMenuItem((pctx) => ({
  // pctx: { id, title, kind: "created" | "fav" | "virtual", songnum }
  //   created = 我创建的歌单｜fav = 收藏的歌单｜virtual = 系统虚拟歌单（每日 30 首 / 我喜欢）
  //   songnum = 曲目数（上游没给时为 0）
  label: `导出「${pctx.title}」`,
  disabled: pctx.songnum === 0,
  run: () => exportPlaylist(pctx.id),
}));
```

### registerNowPlayingMenuItem(item | fn)

正在播放页「更多操作」（⋮）菜单的追加项（追加在内置项之后）。函数收到 `{ song }`（当前没在播放时为 `null`，此时宿主显示空态，插件项仍会追加）。注意这个面是**扁平列表**：只有 `label` / `disabled` / `run` / `danger` / `note`（作 title）生效，`sub` 与缩略图不渲染。

```ts
ctx.registerNowPlayingMenuItem((mctx) => ({
  label: "查看歌曲信息",
  disabled: !mctx.song,
  run: () => showInfo(mctx.song),
}));
```

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

### storage / toast / log / player / style

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

- `ctx.style`：样式门面（`register` / `packs` / `state` / `activate` / `reset` / `onChange`），只给三件事——追加自己的常驻样式层、读已注册的主题包、请求切换主题包；插件**不能**直接操作别人注入的 `<style>`。见[主题包](#主题包)。

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

## 主题与样式层

三套机制，粒度从细到粗：

| 机制                   | 能力                                 | 用户切换入口                         |
| -------------------- | ---------------------------------- | ------------------------------ |
| `registerTheme`      | 只覆盖 `--bg / --card / --acc` 那十来个变量 | 设置 → **外观** → 花火面具             |
| `registerStyleLayer` | 注入**任意 CSS**，常驻生效（不参与选择）           | 无（随插件启停）                       |
| `registerThemePack`  | 多套完整风格，用户挑一套                       | 设置 → **Sparkle** → 主题 → 「主题风格」 |

后两个是后加的扩展点，为的是解决一个实测问题：宿主样式表里有 405 处 `var()` 引用，但同时有 182 个色值字面量、73 处 `border-radius`、28 处 `box-shadow`——**硬编码**。想做 Material Design 3 / 毛玻璃 / 极简大字这种「圆角体系、阴影层级、组件形态全换一遍」的主题，变量组远远不够，必须能注入任意 CSS。

### 变量级主题

`theme.css` 是一组 CSS 变量（变量名与 `ui/src/style.css` 的主题组一致）：

```ts
ctx.registerTheme({
  id: "my-theme",
  name: "我的主题",
  css: `--bg:#101014; --card:#17171d; --ink:#e8e8f0; --acc:#8a7dff;`,
});
```

宿主把它注入为 `html[data-sparkle-theme="<id>"]{…}`，特异性高于 `html[data-theme]`，未覆盖的变量自然回落亮/暗底色。激活入口在设置 → **外观** → 「Sparkle 主题」：卡片组列出所有已注册主题（任一插件注册/停用即时增删，无主题时整组隐藏），「默认」卡片即不使用插件主题；激活状态持久化（`quaver.sparkle.theme.v1`），停用正激活主题所属的插件时宿主自动回落默认。注意：

- Sparkle 主题是独立覆盖层，不参与「跟随系统」的明暗切换，也不写进外观（Style）配置——上方外观模式选明暗，Sparkle 主题在其上叠加变量；
- 与主题包不同，它靠选择器 `html[data-sparkle-theme]` 天然失活，不需要显式摘 `<style>`。

#### 高亮色（tint）归谁管 —— `theme.tint`

宿主的高亮色（`--cvg-accent` / `--cvg-glow` / 播放条的 `--cvg-bar-fill` / `--cvg-bar-line`）平时由「设置 → 外观 → 高亮颜色」控制（固定青色 / 跟随封面 / **系统强调色** / 自定义色），并以**行内样式**写在 `:root` 上——行内样式压过任何选择器，所以你在 `css` 里写 `--cvg-accent` 抢不赢。要拿到高亮色靠的是**声明归属**，而不是抢变量：

| 写法 | 谁管高亮色 | 效果 |
| --- | --- | --- |
| **不写 `tint`**（默认） | 主题 | 宿主**让位**：不再写那几个变量，`--cvg-accent` 回落 `:root { --cvg-accent: var(--acc) }`。你只要在 `css` 里覆盖 `--acc`，高亮色就跟着走。设置页的「高亮颜色」整组禁用并注明由你接管 |
| `tint: { mode: "host" }` | 用户 | 宿主那四档照常生效，用户可自由改 |
| `tint: { mode: "presets", presets: [...] }` | 用户（在你的方案里挑） | 你在设置页提供几套高亮方案，用户选一套。`presets[0]` 是默认；`color` 必须是 `#rgb` / `#rrggbb` 或哨兵值 `"system"`（跟随系统强调色）、`"cover"`（跟随当前封面主色），`id`/`label` 非空且 `id` 不重复，非法项会被忽略 |

```ts
// 1) 不写 tint：主题自带强调色（下面 --acc 的紫），宿主让位 → 高亮色跟着紫走
ctx.registerTheme({
  id: "my-theme", name: "我的主题",
  css: `--bg:#101014; --card:#17171d; --ink:#e8e8f0; --acc:#8a7dff;`,
});

// 2) 想让用户自己调高亮色
ctx.registerTheme({ id: "t2", name: "T2", css: `…`, tint: { mode: "host" } });

// 3) 想让用户在你的两套配色里挑
ctx.registerTheme({
  id: "t3", name: "T3", css: `…`,
  tint: { mode: "presets", presets: [
    { id: "violet", label: "紫罗兰", color: "#8a7dff" },
    { id: "amber", label: "琥珀", color: "#ffb648" },
  ] },
});

// 4) 再加哨兵档：color 写 "system" = 跟随系统强调色（Noctalia / matugen 模板产物、
//    KDE / GNOME / GTK / macOS / Windows），换桌面配色自动跟随；color 写 "cover" =
//    跟随当前曲封面主色，换曲自动跟随。哨兵读不到时宿主回落到你的第一套非哨兵方案
//    （所以至少留一套具体色值更稳）。
ctx.registerTheme({
  id: "t4", name: "T4", css: `…`,
  tint: { mode: "presets", presets: [
    { id: "violet", label: "紫罗兰", color: "#8a7dff" },
    { id: "system", label: "系统强调色", color: "system" },
    { id: "cover", label: "封面颜色", color: "cover" },
  ] },
});
```

**「系统强调色」是什么**：宿主按这个顺序探测一个源色 —— 用户配置目录里的 `system-theme.json` / `system-theme.css`（Noctalia / matugen 的模板写给它，最推荐）→ Noctalia 的当前配色（`colors.json`、v5 `palettes/<name>.json`、社区配色缓存）→ `~/.cache/matugen/colors.json` → KDE `kdeglobals` 的 `AccentColor` → GNOME `gsettings accent-color` → GTK css 的 `@define-color accent_bg_color` → macOS / Windows 的系统强调色。

Noctalia 用户在 `~/.config/noctalia/templates.toml` 里加一条：

```toml
[theme.templates.user.quaver]
input_path  = "$XDG_CONFIG_HOME/noctalia/templates/quaver-music.json"
output_path = "$XDG_CONFIG_HOME/quaver-music/system-theme.json"
```

配一个模板文件 `~/.config/noctalia/templates/quaver-music.json`（matugen 同款语法）：

```json
{
  "dark":  { "primary": "{{ colors.primary.dark.hex }}" },
  "light": { "primary": "{{ colors.primary.light.hex }}" }
}
```

用户挑了哪一套按主题 id 存在本地，在主题之间来回切不丢。无论哪种模式，你都**不该**再写 `--cvg-*`。

#### 背景归谁管 —— `theme.background`

「设置 → 外观 → 背景」是宿主的一层环境色：关闭背景 / 专辑封面 / 自定义图片 + 模糊强度。它是铺在主界面最底下的一整层（`ui/src/lib/ambient.ts`），用户的自定义壁纸会从主题的底色底下透出来——自带视觉的主题和它很容易打架。所以归属同样是**声明制**：

| 写法 | 谁管背景 | 效果 |
| --- | --- | --- |
| **不写 `background`**（默认） | 主题 | 宿主**让位**：那一层整个不画，设置页的「背景」整组禁用并注明由你接管。想自带背景就在 `css` 里画（覆盖 `--bg`、或用伪元素铺整窗） |
| `background: { mode: "host" }` | 用户 | 用户的三档与模糊强度照常生效。你就**别**再自己铺整窗背景了——那会和用户选的东西打架 |

```ts
// 1) 不写 background：主题自带背景（比如自己在 css 里铺一层渐变/纹样），宿主让位
ctx.registerTheme({
  id: "my-theme", name: "我的主题",
  css: `--bg:#101014; --card:#17171d;
        html[data-sparkle-theme="my-theme"] body::before{ content:""; position:fixed; inset:0;
          background: radial-gradient(60% 50% at 20% 10%, #1b2b4a 0, transparent 70%); z-index:-1; }`,
});

// 2) 背景交给用户（他可以在设置里选封面 / 自定义图，还能调模糊强度）
ctx.registerTheme({ id: "t2", name: "T2", css: `…`, background: { mode: "host" } });
```

#### 浮层菜单的外观归谁管 —— `theme.menus`

宿主的浮层菜单共用一套玻璃（令牌 `--menu-filter` / `--menu-surface` / `--menu-line` / `--menu-shadow` / `--menu-edge`），用户在「设置 → 外观 → 菜单毛玻璃」里用一棵开关控制（开 = 玻璃底 + 模糊；关 = 实底不模糊）。「归谁管」的判定口径与 `tint` / `background` 完全一致：

| 写法 | 谁管菜单外观 | 效果 |
| --- | --- | --- |
| **不写 `menus`**（默认） | 主题 | 宿主**让位**：不再往 `<html>` 写 `data-menu-glass` 的 on/off，设置页的「菜单毛玻璃」整组禁用并注明由你接管。你在 `css` 里覆盖那几个 `--menu-*` 令牌即可——`html[data-sparkle-theme="<id>"]` 的特异性本来就高于 `:root` |
| `menus: { mode: "host" }` | 用户 | 用户那棵开关照常生效。你就**别**再写 `--menu-*` 了——写了会被开关盖掉 |

消费这套令牌的七处菜单（想直接按选择器重画形态就用这些类名）：`.ctx-menu`（侧栏歌单 / 歌曲右键菜单）、`.pb-qpop`（音质）、`.pb-lpop`（播放模式）、`.pb-volpop`（音量）、`.np-menu`（正在播放页「更多操作」）、`.np-qinfo`（音频流信息）、`.tint-pop`（设置页颜色选择器）。注意 `.np`（正在播放页）对同名令牌另有一套深色值，想连那一页一起改就写 `html[data-sparkle-theme="<id>"] .np { --menu-surface: … }`。

```ts
// 1) 不写 menus：主题自带菜单外观（比如把右键菜单做成不透明的大圆角卡片），宿主让位
ctx.registerTheme({
  id: "my-theme", name: "我的主题",
  css: `--menu-filter:none; --menu-surface:#1b1c22; --menu-line:#ffffff1a;
        --menu-shadow:0 16px 40px #0008; --menu-edge:transparent;
        .ctx-menu, .pb-qpop { border-radius: 16px; }`,
});

// 2) 菜单外观交给用户（他可以在设置里开关毛玻璃）
ctx.registerTheme({ id: "t2", name: "T2", css: `…`, menus: { mode: "host" } });
```

`tint`、`background` 与 `menus` 各自独立声明：只声明其中一个，另两个仍然按「不声明 = 主题接管」算。

### 全站样式层

不需要用户选择、只想给自己的功能配一套视觉时用这个：

```ts
ctx.registerStyleLayer({
  id: "my-ui",
  css: `.toast { border-radius: 4px; box-shadow: none; }`,
  order: 10, // 层序，小的在下；缺省 0
});
```

- 层序 = `order` 升序，同 `order` 按注册序；层序对应 `<style>` 在 head 里的**先后**（同特异性后者胜），每次重排都是全摘重挂，不会错序。
- **主题风格的 order 缺省是 +1000**——也就是说主题压得过常驻层，插件不能靠微调样式层悄悄盖掉用户选的主题。
- 空 CSS（或纯空白）直接跳过：凭空插一张空 `<style>` 不显示任何东西，却会实打实占掉一层顺序，把后面同 `order` 的层压下去。
- 切主题不影响常驻层；停用插件时整张 `<style>` 精确摘掉（key 由宿主生成，反注册闭包已绑好，插件不用自己管）。
- 想按当前主题风格调整自己的行为（比如高对比风格下换强调色），用 `ctx.style.state()` + `ctx.style.onChange(cb)` 订阅，别去解析 CSS。

### 主题包

```ts
ctx.registerThemePack({
  id: "md3",
  name: "Material Design 3",
  author: "…",
  description: "圆润的 MD3 风格",
  preview: ["#6750a4", "#eaddff", "#1d1b20"], // 设置页色板（纯展示，宿主不解析语义）
  variants: [
    { id: "light", name: "MD3 亮", scheme: "light", preview: ["#6750a4", "#eaddff"],
      css: `:root { --bg: #fef7ff; --card: #fffbfe; --acc: #6750a4; --radius: 16px; }` },
    { id: "dark", name: "MD3 暗", scheme: "dark", preview: ["#d0bcff", "#4f378b"],
      css: `:root { --bg: #141218; --card: #1d1b20; --acc: #d0bcff; --radius: 16px; }` },
  ],
});
```

- **第一个 variant 是默认风格**（用户没切过时用它）。用户在 设置 → Sparkle → 主题 的「主题风格」一行里选，「默认外观」即不加载任何插件样式；选中态持久化在 `quaver.sparkle.style.pack.v1` / `.variant.v1`。
- `scheme` 声明亮底/暗底，宿主据此写 `html[data-sparkle-scheme]` → `color-scheme`，让滚动条、原生控件、表单元素跟着对（否则会出现「暗底页面 + 亮色滚动条」）。**不声明 = 尊重用户的「跟随系统」，宿主不动它。** 注意 `color-scheme` 只管原生控件，页面背景仍归宿主 `html[data-theme]` 的变量组，别在 `scheme` 上纠缠。
- **只注入选中的那一张**，切走时整张 `<style>` 摘掉（不留残留声明——这与 `registerTheme` 靠选择器自然失活的做法不同）。
- 选中包所属插件被**停用/卸载**时自动回落默认外观（静默，不弹 toast）。否则用户会卡在一张已经没人提供的样式上，而设置页列表里已无那个包，无从切走。
- 想额外给某套风格配设置项，用 `ctx.registerSettingsSection`（渲染在插件的齿轮弹窗里），不要在样式层里自己造 UI。

### 逃生通道与两条自律

第三方样式能改宿主全部 UI——这是**设计意图**（主题就该全站生效），但也意味着一个坏主题能把界面搞得没法用。所以设置页 Sparkle → 主题 底部有**「暂停全部插件样式」总闸**（`quaver.sparkle.style.suspended.v1`）：不经过任何插件，是唯一不依赖插件的退出路径。插件自己提供的 `reset()` 在插件已崩时未必还灵，别指望它兜底。

给插件作者的两条自律（宿主不审查，但这两条是社区约定）：

1. 别用 `position: fixed` 自绘层盖住右上角窗口按钮簇（`.winbtns`，z-index 90）。
2. 别把 `--font-default` 之外的字体族写死到 `body` 级别——用户在 设置 → 外观 选的界面/歌词字体会被你的 `body { font-family: … }` 顶掉。

> 顺带一提：变量级主题（`registerTheme`）在 设置 → **外观** 里切，主题包（`registerThemePack`）在 设置 → **Sparkle → 主题** 里切。两处别搞混——Sparkle 面板的「主题」标签只管启停提供它的插件，不管变量级主题的选择。

## 整页接管正在播放页

`registerNowPlayingWidget` 只是歌词区下方的一小块浮层，**拿不到传输控制**，做不了「换一种正在播放页」。要重排整页（Cover Flow / 磁带机 / 极简大字…）用这个扩展点。

```ts
ctx.registerNowPlayingView({
  id: "my-np",
  enabled: () => ctx.storage.get("on") !== "off", // 可选总开关，宿主每次 notify 重读
  render(host, np) {
    // host 铺满 .np；宿主已隐藏默认布局（歌词列 + 右侧信息列）、插件槽与底部播放条。
    // 背景的模糊封面层（.np-bg）与压暗层（.np-scrim）仍在，可以直接借来当底色。
    host.innerHTML = `…`;
    np.prevCard.onclick = () => np.prev();   // 上下曲绑在封面上
    const off = np.onNotify(() => paint());
    return () => { off(); host.innerHTML = ""; };
  },
});
```

`np`（`SparkleNpViewCtx`）是**只读闭包 + 明确控制面**的组合，读到的永远是当前态：

| 分类 | 方法 |
|---|---|
| 页面 | `expanded()` / `gallery()` / `collapse()` |
| 曲目 | `current()` / `prevSong()` / `nextSong()` / `songAt(offset)` / `queueLength()` |
| 传输（只读） | `time()` / `duration()` / `paused()` / `loading()` / `error()` |
| 歌词（只读） | `lyrics()` / `lyricState()` / `showTrans()` / `karaoke()` / `karaokeActive()` |
| 音量（只读） | `volume()` / `muted()` |
| 音质（只读） | `quality()` / `qualityLabel()` / `lastStream()` / `qualityTiers()` |
| 控制 | `toggle()` / `seek(sec)` / `next()` / `prev()` / `jumpTo(offset)` / `setVolume(v)` / `toggleMute()` / `switchQuality(id)` / `toggleTrans()` / `loved(mid)` / `toggleLove()` |
| 订阅 | `onNotify(cb)` → 退订函数 |

`songAt(offset)` 与 `jumpTo(offset)` 是给「封面流」这类要画一整列邻曲的视图准备的：`prevSong/nextSong` 只给相邻两首，DOM 里就只有三张卡，切歌时做不出「中间转出去 → 右边顶上 → 新的从右边转进来」的三段式（第三张没有数据源）。

几条容易踩的：

- **邻曲别自己写 index±1**：`prevSong()/nextSong()` 走宿主的播放顺序（随机播放时是当日洗牌序，不是队列原序），宿主内部与播放推进共用同一条 `stepInOrder`。
- **`prev()` 是 force 语义**：忽略设置里的「重放当前曲」，直跳队列上一首。封面流的「点左封面 = 上一首」必须是这个，否则点了会原地重播。
- **notify 只有 ~4Hz**。位置是外推时钟，要跟手的进度条/歌词高亮得自驱 rAF；收起时自停、重新展开靠 `onNotify` 唤醒（自停的 rAF 没人会替你重启）。
- **`qualityTiers()` 初次可能为空**：档位表是异步拉的，就绪时宿主会主动多广播一次 notify，不必自己轮询。
- 接管期间**不要再自己画背景模糊**：宿主那两层还在，重复铺只会白烧一次解码。
- **想画逐字歌词就复用宿主已激活的提供器**：`karaoke()` 直接给出词级行（毫秒时间轴），这些行是 `registerKaraokeProvider` 的插件（如 AMLL）解析好的——别自己重写 QRC/TTML 解析。`karaokeActive()` 表示此刻是否真的接管中（有数据 + 提供器在位且启用；提供器自带开关关掉时为 false 但 `karaoke()` 可能还留着上次的结果），false 时务必回退 `lyrics()` 行级，否则用户在设置里关掉逐字，你的页面还在逐字跳。逐词高亮的时钟用自己的 rAF（notify 只有 4Hz）。
- **要「跳转歌手/专辑/搜索」直接写 hash 路由**（`location.hash = "#/singer?mid=…&name=…"`、`#/album?mid=…&name=…`、`#/search?keyword=…`），歌手/专辑的 mid 在曲目快照里。但记住：**正在播放页是铺满全窗的常驻悬浮层，只换路由它仍盖在最上面**——跳转前先 `np.collapse()`，否则用户点完什么都看不到变。
- 插件仍拿不到队列本体（只能读当前曲与两个邻曲），也改不了播放模式。
- 多个整页接管视图**先注册先得**；停用插件或关掉 `enabled()` 即回默认布局，不需要额外的反向通道。

参考实现：`marketplace/flowscape/index.ts`（Flowscape 流境——专辑流 + 自绘控制带）。

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
- `plugin.json` 由 Marketplace 安装时的索引元数据生成；「添加本地插件」安装的插件元数据取自插件本体（default export）；放进插件目录手工调试时需自行提供。

### 本地调试

1. 开发机设 `QUAVER_SPARKLE_DIR=/path/to/my-plugins`（主进程与 dev relay 同读；优先于配置目录）。
2. 目录里放 `my-plugin/main.js` 与 `plugin.json`。
3. 打开设置页 Sparkle tab：列表出现该插件 → 启用。
4. 改完 `main.js` 后「卸载 → 重装」或直接重启应用：插件文件 URL 以安装时间戳为 `?v=` 缓存破坏键，不重装拿到的还是旧代码。

Marketplace 面板在浏览器 dev（无 `window.quaverSparkle` 桥）下不可用，本地目录调试不受影响。

### 添加本地插件

Marketplace 标签里的红色渐变「添加本地插件」按钮面向**最终用户**的手装通道：点按钮先弹红色渐变警告弹窗（复用更新弹窗的开闭动画），5 秒倒计时结束才解锁「确认」；确认后选一个单文件 ESM `.js`，渲染层经 blob URL 动态 import 做形状校验（default export 需为 SparklePlugin，元数据取自插件本体），校验不过原地拒绝，通过则走 `quaver:sparkle` IPC 的 `pick-local` / `install-local` op 落盘，布局与 Marketplace 安装完全一致，装完默认关闭。

## 设置页面板结构（v2）

Sparkle 面板分**四个相互隔离的标签**：

| 标签 | 内容 |
|---|---|
| 主题 | category=theme 的已装插件；开关启停提供它的插件，齿轮仅在该插件真的注册了设置区（高级选项）时出现；下方「主题风格」一行是主题包选择（见[主题包](#主题包)）与「暂停全部插件样式」总闸 |
| 插件 | 官方插件 + category 非 theme/extension 的第三方；行内 [齿轮][启用开关][卸载] |
| 扩展 | category=extension 的已装插件，行内布局与插件标签相同 |
| Marketplace | 固定索引源（只读+刷新）+ 红色渐变「添加本地插件」+ 全量索引列表（条目按 category 打徽标，顶部 全部/主题/插件/扩展 chips 过滤） |

要点：

- **插件设置不常驻页面**：行内齿轮就地把该插件注册的 `SparkleSettingsSection` 渲染进弹窗（`components/PluginSettingsDialog.ts`，层与开闭动画复用 `.upd-*`），关闭时统一跑清理函数。
- **category 随安装持久化**：安装时索引的 `category` 写进 `plugin.json`（主进程 `sparkleInstall`），已装列表据此归入 主题/插件/扩展；本地手装没有 category，一律归入「插件」。
- **变量级主题的切换不在这里**：`registerTheme` 的激活入口在 设置 → 外观 → Sparkle 主题，面板「主题」标签只管启停插件。

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
      "category": "plugin",
      "download": "https://quaver.0w0.red/sparkle/plugins/die-for-you.js",
      "homepage": "https://github.com/…",
      "hash": "<sha256 hex，可选>"
    }
  ]
}
```

- `download` 必须直指**单文件 ESM .js**（default export 插件对象），v1 不做 zip 分发。
- `hash` 存在时主进程下载后校验 sha256，不匹配拒绝落盘。
- `category` 是设置页分类（`theme` / `plugin` / `extension`），缺省或未知值按 `plugin` 归档。
- 索引源固定为 `market/default-index.ts` 的 `DEFAULT_MARKET_URL`（`https://quaver.0w0.red/marketplace.json`），设置页只读展示 + 刷新，不可更改（早期版本的 `quaver.sparkle.market.url.v1` 覆盖已废弃）。
- 安装成功后默认关闭，需在「插件」分类里手动启用；支持卸载与重新安装（重新安装即更新到最新发布版）。
- 官方索引由 quaver-sparkle 仓库的 `marketplace/` 目录经 CI 构建发布到 quaver-doc 站点（详见 quaver-sparkle 的 `docs/marketplace.md` 与 `.github/workflows/marketplace.yml`）。

## 安全模型

第三方插件在渲染层运行**任意 JS**。壳层 `contextIsolation` 开启、`nodeIntegration` 关闭，插件只能触达宿主暴露的桥（`window.quaverSparkle`）与页面能力；索引里的 `hash` 只防运输损坏，**不构成签名校验**。给用户的提示只有一句：只安装信任来源。

样式层同理——第三方 CSS 能改写宿主全部 UI，宿主无法审查，只能提示信任来源；用户的兜底是「暂停全部插件样式」总闸。

## 宿主侧实现

宿主运行时在 `ui/src/sparkle/`，七个文件各司其职：

| 文件 | 职责 |
|---|---|
| `registry.ts` | 注册表，**纯数据、零 ui 模块依赖**（shell/player/SongMenu 都要从这里读，反向 import 任何 ui 模块都会成环）。每个注册动作往对应插件 record 的 `teardown` push 反注册闭包，并 `emitChange()` 通知订阅方 |
| `host.ts` | `SparkleContext` 工厂 + 启停生命周期 + 主题 CSS 注入 + player 门面 + 样式门面（按插件现构造，不能做成模块级单例）+ 持久化。所有会碰 ui 模块的接线都在这里 |
| `loader.ts` | 官方插件静态表（Vite 代码分割 chunk）+ 第三方动态 import + 形状校验 |
| `init.ts` | 启动：播种官方默认启用 → 逐个 enable（官方 → 第三方），不阻塞首帧 |
| `style-layer.ts` | 全站样式层与主题包的注入管理：层序重排（order 升序、同序按登记序，全摘重挂）、`color-scheme` 协调、孤儿包回落、总闸 suspended |
| `np-view.ts` | 整页接管视图：`SparkleNpViewCtx` 工厂（只读闭包 + 写侧转发到 player）、音质档位表缓存、按 `enabled()` 维护挂载/卸载 |
| `settings.ts` | 设置页 Sparkle 面板：主题/插件/扩展/Marketplace 四标签（已装管理 + 主题风格选择 + 总闸 + 固定索引源 + 添加本地插件），插件设置经行内齿轮弹窗（PluginSettingsDialog） |

宿主消费点：`shell.ts`（路由回落 `views[path] ?? sparkleViewAt(path) ?? views["/"]`、侧栏 nav 与歌单分组）、`player.ts`（播放源链、逐字解析）、`NowPlaying.ts`（逐字渲染、部件插槽、接管态下的 `body.np-takeover`）、`SongMenu.ts`（菜单项、toast）、`views.ts`（Sparkle 设置 tab、外观面板的 Sparkle 主题切换）。

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
| `quaver.sparkle.theme.v1` | 激活中的变量级 Sparkle 主题 id（`registerTheme`） |
| `quaver.sparkle.style.pack.v1` | 激活中的主题包 id（`registerThemePack`） |
| `quaver.sparkle.style.variant.v1` | 激活中的主题风格（variant）id |
| `quaver.sparkle.style.suspended.v1` | 「暂停全部插件样式」总闸（存在 = 拉下） |
| `sparkle.<pluginId>.<key>` | 各插件 `ctx.storage` 的命名空间 |

（早期版本的 `quaver.sparkle.market.url.v1`（自定义索引源）已随索引源固定而废弃，残留键会被无视。）
