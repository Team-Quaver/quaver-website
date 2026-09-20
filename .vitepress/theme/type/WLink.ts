export interface Link {
    // 站点名称
    name: string
    // 站点链接
    link: string
    // 头像/站点logo（加载失败时自动回退为首字头像）
    avatar: string
    // 站点描述（签名）
    descr: string
    // 站点缩略图
    siteshot?: string
    // 分类标签：友链页顶部按 Tag 筛选，缺省归入「未分类」
    tag?: string
}
