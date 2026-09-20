---
title: Detail 详情组件
description: 使用 <detail /> 组件快速搭建图文详情页
---

# Detail 详情组件

Vivian 主题内置了一个 `detail` 组件，用于快速搭建「左图右信息 + 下方正文」的详情页（如游戏介绍、软件说明、人物卡片等）。

它已作为全局组件注册，无需 import，直接在 Markdown 里使用自闭合标签 `<detail />` 即可，数据通过 frontmatter（或 props）传入。

:::tip
`detail` 必须是**自闭合标签** `<detail />`，不能写成 `<detail>...</detail>` 包裹正文——VitePress 不支持用自定义组件标签包裹 Markdown 内容。
正文照常写在 `<detail />` 下方即可。
:::

## 基础用法

在文档顶部 frontmatter 写 `image` 与 `fields`，正文里放一个 `<detail />`：

```markdown
---
title: "星穹铁道角色介绍"
image: /imgs/character.webp
sidebar: false
aside: false
fields:
  - label: 稀有度
    value: ★★★★★
  - label: 属性
    value: 量子
  - label: 上线版本
    value: 1.0
---

<detail />

## 角色背景

这里是正常的 Markdown 正文……
```

渲染效果：左侧预览图 + 右侧信息表，下方是正文。

## 可用属性

组件同时支持 **frontmatter 字段** 和 **组件 props**（props 优先级更高）。

| 属性 | 说明 | 对应 frontmatter |
|------|------|------------------|
| `image` | 左侧预览图地址（支持相对路径 / 绝对路径 / 外链） | `image` |
| `cover` | 顶部通栏封面大图（可选，路径写法同 `image`） | `cover` |
| `title` | 标题 | `title` |
| `subtitle` | 副标题，显示在标题下方 | `subtitle` |
| `tag` | 标题上方的彩色徽章 | `tag` |
| `fields` | 信息表，数组 `[{ label, value }]` | `fields` |

:::tip 字段支持 Markdown
`fields` 的 `label` 与 `value` 会按**行内 Markdown** 渲染，可书写超链接、加粗、行内代码：

```yaml
fields:
  - label: 官网
    value: "[Can We Tux](https://tux.red)"
  - label: 备注
    value: "**重要**：详见 [文档](/guide/detail)"
  - label: 命令
    value: "`pnpm dev`"
```

支持的语法：`[文字](链接)`、`**加粗**`、`` `代码` ``。链接输出与正文一致（外部链接自动 `target="_blank"`）。
:::

:::warning YAML 特殊字符必须加引号
当 `value` 含有 `:`、`[`、`]`、`#`、`*` 等字符（例如链接里的 `https://`）时，**必须用引号包裹**，否则 YAML 解析会报错：

```yaml
# ✅ 正确
value: "[Nous Research](https://nousresearch.com)"

# ❌ 错误（YAML 会把 https: 当成键值对而报错）
value: [Nous Research](https://nousresearch.com)
```
:::

### 示例：带封面与副标题

```markdown
---
title: "薇薇安"
subtitle: "反舌鸟阵营 · 隶属「无关人士」"
tag: "限定"
cover: /imgs/vivian-cover.webp
image: /imgs/vivian.webp
sidebar: false
aside: false
fields:
  - label: 阵营
    value: 反舌鸟
  - label: 稀有度
    value: ★★★★★
---

<detail />

## 简介

薇薇安是《绝区零》中的角色……
```

也可以用 props 显式传参（推荐用于需要复用的场景）：

```markdown
<detail
  image="/imgs/vivian.webp"
  title="薇薇安"
  subtitle="反舌鸟阵营"
  tag="限定"
/>

正文内容……
```

:::warning
props 形式的 `fields` 是数组字面量，在 Markdown 内联容易触发编译问题；
**建议 `fields` 一律写在 frontmatter 里**，其余字段可用 props 或 frontmatter 均可。
:::

## 图片路径写法

`image` 与 `cover` 支持三种路径写法，解析行为与 Markdown 正文里的图片引用保持一致：

| 写法 | 示例 | 行为 |
|------|------|------|
| 相对路径 | `./cover.webp`、`../assets/img.png` | 以**当前页面所在目录**为基准解析，构建时作为站点资源打包（带 hash 指纹，自动参与构建优化） |
| 站点绝对路径 | `/imgs/character.webp` | 指向 `public` 目录，输出时自动补全 [`base`](https://vitepress.dev/zh/reference/site-config#base) 前缀 |
| 完整 URL | `https://example.com/img.webp` | 原样引用，不做处理 |

```yaml
---
# 相对路径：图片放在页面同目录（或其子目录）下
image: ./img/character.webp

# 绝对路径：图片放在 public/imgs/ 下
image: /imgs/character.webp
---
```

:::tip 推荐
相对路径的图片会经 Vite 构建管线处理（hash 指纹、压缩优化），且随页面目录组织，**推荐优先使用**；`/` 绝对路径适合跨页面复用的公共图片。
:::

## 作为页面布局使用（layout: detail）

除了在正文中写 `<detail />`，也可以直接在 frontmatter 声明 `layout: detail`，让整页使用 Detail 布局：

```markdown
---
layout: detail
title: "星穹铁道角色介绍"
image: /imgs/character.webp
fields:
  - label: 稀有度
    value: ★★★★★
---

## 角色背景

这里是正常的 Markdown 正文……
```

两种方式渲染效果一致：hero 信息区 + 下方正文，数据同样来自 frontmatter。区别在于：

- `layout: detail` 模式下**不需要**（也不应该）再写 `<detail />` 标签，页面本身就是 Detail 布局
- **Markdown 功能完全正常**：正文经 VitePress 原生 `<Content />` 渲染，标题、代码块、表格、自定义容器全部可用
- 评论区会自动挂载在正文下方（该模式不经过 VPDoc，主题会自行挂载 Comment 组件）
- 组件内部做了防递归处理：若正文里再写 `<detail />`，内层只渲染 hero 信息区，不会重复渲染正文

## 隐藏侧边栏与大纲

详情页通常不需要侧边栏和大纲。在 frontmatter 加两行即可：

```yaml
sidebar: false
aside: false
```

主题也会在检测到页面包含 `detail` 组件时自动隐藏侧边栏与大纲（兜底规则），但显式声明更稳妥。

## 演示页

本主题自带一个演示页：[Vivian 主题详情测试](/detail-test)，可直接参考其源码 `detail-test.md`。
