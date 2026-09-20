# 代码高亮主题

## 前言

Vivian 使用 VitePress 默认使用的。 Shiki 进行代码高亮，默认配置了 `everforest-light` 和 `everforest-dark` 主题。

## 配置

在完成环境搭建后

前往 `.vitepress/config.mjs` 设置

```typescript
markdown: {
  theme: {
    light: 'everforest-light', // 浅色模式主题
    dark: 'everforest-dark'    // 深色模式主题
  },
  lineNumbers: true // 显示行号
}
```
