/**
 * WLink 友链配置
 * 用户更新主题后，只需维护此文件的默认值即可
 * 也可以在 themeConfig.wlink 中覆盖任意字段
 */

export interface WLinkSiteInfo {
  title: string
  url: string
  avatar: string
  desc: string
}

export interface WLinkSiteInfoLabel {
  title: string
  url: string
  avatar: string
  desc: string
}

export interface WLinkConfig {
  title: string
  // Tag 筛选栏「全部」按钮文案
  allTag: string
  // 未填写 tag 的友链归入的分组名
  defaultTag: string
  // 筛选后分类为空时的提示文案
  emptyText: string
  leaveTitle: string
  leaveDesc: string
  joinText: string
  siteName: string
  siteLink: string
  joinSuffix: string
  siteInfoTitle: string
  siteInfoLabel: WLinkSiteInfoLabel
  siteInfo: WLinkSiteInfo
  rulesTitle: string
  rules: string[]
}

export const defaultConfig: WLinkConfig = {
  title: '友链',
  allTag: '全部',
  defaultTag: '未分类',
  emptyText: '该分类下暂无友链',
  leaveTitle: '留链',
  leaveDesc: '欢迎留下你的足迹',
  joinText: '非常高兴能和很多朋友交流，如果你也想加入',
  siteName: 'Vivian',
  siteLink: 'https://vivian.0w0.red',
  joinSuffix: '的友链，可以在评论区回复哦！',
  siteInfoTitle: '本站信息',
  siteInfoLabel: {
    title: '标题',
    url: '地址',
    avatar: '头像',
    desc: '描述',
  },
  siteInfo: {
    title: 'Vivian',
    url: 'https://vivian.0w0.red',
    avatar: 'https://vivian.0w0.red/imgs/vivian.webp',
    desc: '一个 Vibe Coding 的，用于 Can We Tux 的 VitePress 主题',
  },
  rulesTitle: '友链须知',
  rules: [
    '互换原则：请先将本站添加到您的友链页面，确认后会添加您的友链',
    '链接维护：友链网站长期无法访问或内容违规，将会被移除',
    '内容要求：内容积极向上，不含有任何含色情/反动/暴力等违法违规内容',
    '站点要求：支持 HTTPS，以原创内容为主，能够正常访问且有持续更新',
  ],
}
