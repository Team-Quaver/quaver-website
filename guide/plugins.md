# WLink 友链系统

## 前言

加入，交换，建立良好关系，这就是友链系统存在的必要性。
感谢[唯知笔记的教程](https://note.weizwz.com/vitepress/extend/links#vitepress-%E6%B7%BB%E5%8A%A0%E5%8F%8B%E9%93%BE%E7%95%8C%E9%9D%A2)

## 使用

新建一个 Markdown 文件，`layout` 设为 `weiz-link`，在 Frontmatter 的 `links` 中**平铺**友链，每条友链通过可选的 `tag` 字段归类：

```md
---
layout: weiz-link
title: 友链
description: 这是 Can We Tux 的友链系统
sidebar: false

links:
  - name: Ne0W0r1d
    link: https://0w0.red
    avatar: https://0w0.red/images/ava.png
    descr: 继续沉醉，自我迂回
    tag: 站长
  - name: VitePress
    link: https://vitepress.dev/zh/
    avatar: https://vitepress.dev/vitepress-logo-mini.svg
    descr: 由 Vite 和 Vue 驱动的静态站点生成器
    tag: 鸣谢
---
```

### 字段说明

| 字段 | 必填 | 说明 |
|------|------|------|
| `name` | ✅ | 站点名称 |
| `link` | ✅ | 站点链接 |
| `avatar` | ✅ | 头像/站点 logo，加载失败时自动回退为「首字头像」 |
| `descr` | ✅ | 站点签名描述 |
| `tag` | ❌ | 分类标签，缺省归入「未分类」 |

## Tag 筛选

页面顶部展示「全部 + 所有出现过的 Tag」药丸按钮，每个 Tag 带友链计数：

- 点击不同 Tag 切换分类，卡片以 **FLIP 换位 + 缩放淡入淡出**动画重排（TransitionGroup）
- 动画遵循 `prefers-reduced-motion`，系统开启「减弱动态效果」时直接切换

## 卡片设计

头像在上，昵称与签名在下，居中竖排的液态玻璃卡片：

- 悬停时卡片上浮、边框与光环变为主题色、昵称渐变填充
- 头像加载失败时自动显示**首字头像**（提取站点名称首字），机制保留

## 留链

友链列表下方、评论区上方是「留链」容器：展示本站信息与友链须知，访客可在此了解申请规则。评论区独立挂在留链容器之后，跟随 `themeConfig.comment` 配置（utterances / twikoo 等）。

## 文本编辑（推荐方式）

所有友链页面的文案都在独立配置文件中，主题更新后只需维护这个文件即可：

`.vitepress/theme/components/WLink/config.ts`

修改 `defaultConfig` 中对应的字段即可自定义文案，无需改动组件代码。

### 可配置字段说明

| 字段 | 说明 | 默认值 |
|------|------|--------|
| `title` | 页面标题 | 友链 |
| `allTag` | 筛选栏「全部」按钮文案 | 全部 |
| `defaultTag` | 未填写 `tag` 的友链归入的分组名 | 未分类 |
| `emptyText` | 分类下无友链时的提示文案 | 该分类下暂无友链 |
| `leaveTitle` | 留链区块标题 | 留链 |
| `leaveDesc` | 留链区块描述 | 欢迎留下你的足迹 |
| `joinText` | 邀请文案前半部分 | 非常高兴能和很多朋友交流，如果你也想加入 |
| `siteName` | 站点名称 | Vivian |
| `siteLink` | 站点链接 | https://vivian.0w0.red |
| `joinSuffix` | 邀请文案后半部分 | 的友链，可以在评论区回复哦！ |
| `siteInfoTitle` | 本站信息标题 | 本站信息 |
| `siteInfoLabel` | 本站信息字段标签 | { title, url, avatar, desc } |
| `siteInfo` | 本站信息内容 | { title, url, avatar, desc } |
| `rulesTitle` | 友链须知标题 | 友链须知 |
| `rules` | 友链须知内容（数组） | 4 条默认规则 |

### 通过 themeConfig 覆盖

也可以在 `.vitepress/config.ts` 的 `themeConfig.wlink` 中覆盖任意字段，优先级高于 `config.ts` 中的默认值：

```ts
export default defineConfig({
  themeConfig: {
    wlink: {
      siteName: '我的博客',
      siteInfo: {
        title: '我的博客',
        url: 'https://example.com',
        avatar: 'https://example.com/avatar.png',
        desc: '我的博客描述',
      },
    },
  },
})
```

## 从旧版本迁移

旧版的 `links`（分组）+ `outLinks`（折叠分组）结构已移除：

1. 把每个分组的 `list` 摊平进 `links`，并把分组 `title` 写进每条友链的 `tag`
2. `toggleShow` / `toggleHide` 折叠按钮配置已删除，折叠逻辑不复存在
3. `noAvatar` 属性已删除，所有卡片统一展示头像
