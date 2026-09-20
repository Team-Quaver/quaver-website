<template>
  <div ref="container" :data-twikoo-host="elId"></div>
</template>

<script setup lang="ts">
import { onMounted, ref, useId, watch } from 'vue'
import { useRoute } from 'vitepress'

interface TwikooConfig {
  enabled?: boolean
  envId: string
  region?: string
  path?: string
  lang?: string
}

const props = defineProps<{
  config: TwikooConfig
}>()

const route = useRoute()

// 实例唯一挂载点：硬编码 id="twikoo" 在同页多实例（如友链页 + 行内组件）时
// 会互相覆盖，评论渲染进错误的容器。
// 用 useId() 而非 Math.random()：SSG 预渲染与客户端水合生成同一 id，
// 避免 SSR HTML 里的随机 id 与客户端不一致（Math.random 在构建时烤死一个值进 HTML）
const elId = useId()

const container = ref<HTMLElement | null>(null)

const initTwikoo = async () => {
  // 判断是否在浏览器环境中
  if (typeof window !== 'undefined' && props.config.envId && container.value) {
    const twikoo = await import('twikoo')
    // 注意：twikoo 首次 init 会把宿主元素整个替换成它自建的 <div id="twikoo" class="twikoo">，
    // 原始宿主（连同 data-twikoo-host 标记）随之消失。
    // 因此首次 init 用 data 标记定位原始宿主（多实例互不干扰）；
    // SPA 同布局切页时组件实例被 Vue 复用，靠 watch(route) 重新 init，
    // 此时原始宿主已不存在，回退到 twikoo 自建的稳定根 #twikoo.twikoo ——
    // 这也是旧版硬编码 id="twikoo" 时代切页能刷新的真正原因。
    const el =
      document.querySelector(`[data-twikoo-host="${elId}"]`) ||
      document.querySelector('#twikoo.twikoo')
    if (!el) return
    twikoo.init({
      envId: props.config.envId,
      el,
      region: props.config.region,
      path: props.config.path,
      lang: props.config.lang,
    })
  }
}

// 监听路由刷新评论
watch(route, () => {
  initTwikoo()
})

onMounted(() => {
  initTwikoo()
})
</script>
