<script setup lang="ts">
import { computed } from 'vue'
import { useData } from 'vitepress'
import Twikoo from './Twikoo.vue'
import Utterances from './Utterances.vue'

const { theme } = useData()

// 评论系统配置
const commentConfig = computed(() => theme.value.comment || { provider: 'none' })

// 判断启用哪个评论系统
const isTwikooEnabled = computed(() => {
  return commentConfig.value.provider === 'twikoo' && commentConfig.value.twikoo?.enabled !== false
})

const isUtterancesEnabled = computed(() => {
  return commentConfig.value.provider === 'utterances' && commentConfig.value.utterances?.repo
})

// Twikoo 配置（兼容旧配置）
const twikooConfig = computed(() => {
  // 新格式: comment.twikoo
  if (commentConfig.value.twikoo) {
    return commentConfig.value.twikoo
  }
  // 旧格式: twikoo (顶层)
  return theme.value.twikoo || { enabled: false }
})
</script>

<template>
  <div v-if="isTwikooEnabled || isUtterancesEnabled" class="comment-container">
    <div class="comment-divider" />
    <Twikoo v-if="isTwikooEnabled" :config="twikooConfig" />
    <Utterances
      v-if="isUtterancesEnabled"
      :repo="commentConfig.utterances.repo"
      :issue-term="commentConfig.utterances.issueTerm || 'pathname'"
      :label="commentConfig.utterances.label"
      :theme="commentConfig.utterances.theme"
      :crossorigin="commentConfig.utterances.crossorigin || 'anonymous'"
    />
  </div>
</template>

<style scoped>
.comment-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 2rem 2.5rem;
}

.comment-divider {
  border-top: 1px solid rgba(70, 71, 87, 0.4);
  margin-bottom: 2rem;
}

@media (max-width: 768px) {
  .comment-container {
    padding: 1rem 1.5rem;
  }
}
</style>
