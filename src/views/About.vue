<script setup lang="ts">
import { ref, onMounted } from "vue"
import MarkdownViewer from "../components/MarkdownViewer.vue"

const markdownContent = ref("")

onMounted(async () => {
  // 动态加载 markdown 文件内容
  const response = await fetch(`${import.meta.env.BASE_URL}large-data-visualization.md`)
  markdownContent.value = await response.text()
})
</script>

<template>
  <div class="about">
    <h1>关于本项目文档</h1>
    <MarkdownViewer v-if="markdownContent" :content="markdownContent" />
    <div v-else class="loading">文档加载中...</div>
  </div>
</template>

<style scoped>
.about {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 30px;
}

.loading {
  text-align: center;
  color: #888;
  margin-top: 40px;
}
</style>
