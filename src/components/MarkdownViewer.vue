<script setup lang="ts">
import { ref, watch } from "vue"
import MarkdownIt from "markdown-it"
import "github-markdown-css/github-markdown-light.css"

const props = defineProps<{
  content: string
}>()

const renderedHtml = ref("")
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
})

function renderMarkdown() {
  renderedHtml.value = md.render(props.content)
}

watch(() => props.content, renderMarkdown, { immediate: true })
</script>

<template>
  <div class="markdown-body markdown-viewer" v-html="renderedHtml"></div>
</template>

<style scoped>
.markdown-viewer {
  /* 让内容居中且宽度适中 */
  max-width: 900px;
  padding: 32px 18px;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

/* 可选：自定义代码块字体和阴影 */
.markdown-body pre code {
  font-family: "JetBrains Mono", "Fira Mono", "Menlo", "Consolas", monospace;
  font-size: 0.98em;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.04);
}

.markdown-body table {
  margin: 1.5em 0;
}
</style>
