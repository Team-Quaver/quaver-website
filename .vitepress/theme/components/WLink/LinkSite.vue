<template>
  <a
    class="bg-bg shadow-shadow group relative flex h-full w-full flex-col items-center gap-3 rounded-2xl border border-border/50 p-6 text-center shadow-xs transition-all duration-500 hover:-translate-y-1.5 hover:border-main/60 hover:shadow-lg"
    :href="data.link"
    target="_blank"
    rel="noreferrer"
  >
    <!-- 头像在上：加载失败时回退为「首字头像」 -->
    <div class="relative h-18 w-18 shrink-0 overflow-hidden rounded-full transition-all duration-500 group-hover:ring-3 group-hover:ring-main/40">
      <img
        v-if="data.avatar && !imageFailed"
        class="h-full w-full object-cover align-top transition-all duration-500 group-hover:scale-110"
        :src="data.avatar"
        @error="handleImageError()"
        :alt="data.name"
        loading="lazy"
      />
      <!-- 替代内容：显示首字母 -->
      <div v-else class="bg-main flex h-full w-full items-center justify-center text-3xl font-bold text-white transition-all duration-500">
        {{ data.name.charAt(0).toLocaleUpperCase() }}
      </div>
    </div>

    <!-- 昵称在下：悬停时主题色渐变填充 -->
    <h3
      class="w-full overflow-hidden bg-[linear-gradient(to_right,var(--color-main)_50%,var(--color-text1)_50%)] bg-size-[200%_100%] bg-clip-text bg-position-[100%_0] text-base! font-semibold! whitespace-nowrap text-transparent transition-[background-position] duration-700 group-hover:bg-position-[0_0]"
    >
      {{ data.name }}
    </h3>

    <!-- 签名 -->
    <p class="text-text2 line-clamp-2 w-full overflow-hidden text-sm leading-5 break-all" :title="data.descr">
      {{ data.descr }}
    </p>
  </a>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Link } from '../../type/WLink'

const props = defineProps<{ data: Link }>()
const data = props.data

// 记录图片加载状态
const imageFailed = ref(false)

// 处理图片加载失败
const handleImageError = () => {
  imageFailed.value = true // 更新加载状态
}
</script>
