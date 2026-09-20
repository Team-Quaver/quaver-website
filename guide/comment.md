# 评论系统

## 前言

Vivian 主题支持多种评论系统，目前可选：

| 评论系统 | 特点 | 适合场景 |
|---------|------|---------|
| **None** | 不启用评论 | 个人博客、纯展示型站点 |
| **Twikoo** | 自托管、支持匿名评论 | 需要自定义评论功能的站点 |
| **Utterances** | 基于 GitHub Issues、开源免费 | 技术博客、开源项目文档 |

## 配置

在 `.vitepress/config.mts` 中配置 `comment` 字段：

```typescript
export default defineConfig({
  themeConfig: {
    comment: {
      provider: 'none', // 'none' | 'twikoo' | 'utterances'
      // ... 对应评论系统的配置
    }
  }
})
```

---

## Twikoo

[![Static Badge](https://img.shields.io/badge/前往-Twikoo_文档-blue?style=flat)](https://twikoo.js.org/)

### 环境搭建

前往 [Twikoo 官方文档](https://twikoo.js.org/) 完成环境搭建。

### 配置

```typescript
comment: {
  provider: 'twikoo',
  twikoo: {
    enabled: true,
    envId: 'https://your-twikoo-url.vercel.app',
    // 可选配置
    // region: 'ap-shanghai',
    // path: 'window.location.pathname',
    // lang: 'zh-CN',
  },
},
```

---

## Utterances

[![Static Badge](https://img.shields.io/badge/前往-Utterances_文档-blue?style=flat)](https://utteranc.es/)

[Utterances](https://utteranc.es/) 是一个基于 GitHub Issues 的轻量级评论系统。

### 特点

- **开源免费**：无需服务器，基于 GitHub Issues
- **无追踪**：无广告、无数据追踪
- **GitHub 登录**：用户通过 GitHub 账号登录评论
- **自动创建 Issue**：评论时自动创建对应的 GitHub Issue

### 前置条件

1. 有一个 GitHub 仓库用于存放评论（Issues）
2. 在 [utteranc.es](https://utteranc.es/) 安装 Utterances App 到该仓库

### 安装 Utterances App

1. 访问 [https://github.com/apps/utterances](https://github.com/apps/utterances)
2. 点击 "Install"
3. 选择你的仓库
4. 授予必要的权限

### 配置

```typescript
comment: {
  provider: 'utterances',
  utterances: {
    repo: 'owner/repo', // 必填: GitHub 仓库，格式: owner/repo
    issueTerm: 'pathname', // 用于匹配 issue 的字段: pathname | url | title | og:title
    label: 'comment', // 可选: issue 标签，用于筛选评论 issue
    theme: '', // 可选: 主题，留空则跟随站点深浅色自动切换
    crossorigin: 'anonymous', // 可选: CORS 设置
  },
},
```

### 参数说明

| 参数 | 类型 | 必填 | 默认值 | 说明 |
|-----|------|------|--------|------|
| `repo` | `string` | ✅ | - | GitHub 仓库，格式 `owner/repo` |
| `issueTerm` | `string` | ❌ | `pathname` | 匹配 issue 的字段，可选: `pathname`、`url`、`title`、`og:title`，或自定义字符串 |
| `label` | `string` | ❌ | - | issue 标签，用于标识评论相关的 issue |
| `theme` | `string` | ❌ | 跟随站点 | Utterances 主题，可选值见下方 |
| `crossorigin` | `string` | ❌ | `anonymous` | CORS 设置: `anonymous` 或 `use-credentials` |

### 可用主题

| 主题 | 说明 |
|-----|------|
| `github-light` | GitHub 浅色主题 |
| `github-dark` | GitHub 深色主题 |
| `preferred-color-scheme` | 跟随系统偏好 |
| `github-dark-orange` | GitHub 深色橙色主题 |
| `icy-dark` | 冰冷深色主题 |
| `dark-blue` | 深蓝主题 |
| `photon-dark` | Photon 深色主题 |
| `boxy-light` | Boxy 浅色主题 |
| `gruvbox-dark` | Gruvbox 深色主题 |

> **提示**：如果 `theme` 留空，Utterances 会自动跟随站点的深浅色模式切换。

### 完整示例

```typescript
comment: {
  provider: 'utterances',
  utterances: {
    repo: 'my-username/my-blog',
    issueTerm: 'pathname',
    label: 'blog-comment',
    // theme: 'github-dark', // 留空则自动跟随深浅色
  },
},
```

### 工作原理

1. Utterances 根据当前页面的 URL/路径/标题匹配对应的 GitHub Issue
2. 如果没有找到匹配的 Issue，用户评论时会自动创建一个
3. 用户通过 GitHub 账号登录后即可评论
4. 评论内容直接存储在 GitHub Issues 中

---

## 从旧版 Twikoo 配置迁移

如果你之前使用的是旧版 `twikoo` 配置，可以迁移到新的 `comment` 配置：

**旧配置**：
```typescript
themeConfig: {
  twikoo: {
    enabled: true,
    envId: 'https://your-twikoo-url.vercel.app',
  }
}
```

**新配置**：
```typescript
themeConfig: {
  comment: {
    provider: 'twikoo',
    twikoo: {
      enabled: true,
      envId: 'https://your-twikoo-url.vercel.app',
    },
  }
}
```

> **注意**：旧版 `twikoo` 配置仍然兼容，但推荐使用新的 `comment` 配置格式。
