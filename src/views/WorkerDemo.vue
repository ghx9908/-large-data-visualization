<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"

const result = ref<number | null>(null)
const isCalculating = ref(false)
let worker: Worker | null = null

onMounted(() => {
  // 创建 Worker 实例
  worker = new Worker(new URL("../workers/dataWorker.ts", import.meta.url), { type: "module" })

  // 设置 Worker 消息处理
  worker.onmessage = (event) => {
    const { type, result: workerResult } = event.data
    if (type === "CALCULATE_COMPLETE") {
      result.value = workerResult
      isCalculating.value = false
    }
  }
})

onUnmounted(() => {
  // 组件卸载时终止 Worker
  if (worker) {
    worker.terminate()
  }
})

const handleCalculate = () => {
  if (!worker) return

  isCalculating.value = true
  // 生成一些测试数据
  const testData = Array.from({ length: 1000000 }, (_, i) => i + 1)
  debugger
  // 发送数据到 Worker
  worker.postMessage({
    type: "CALCULATE",
    data: testData,
  })
}
</script>

<template>
  <div class="p-4">
    <h1 class="text-2xl font-bold mb-4">Web Worker 演示</h1>

    <button
      @click="handleCalculate"
      :disabled="isCalculating"
      class="bg-blue-500 text-white px-4 py-2 rounded disabled:bg-gray-400"
    >
      {{ isCalculating ? "计算中..." : "开始计算" }}
    </button>

    <div v-if="result !== null" class="mt-4">
      <h2 class="text-xl font-semibold">计算结果：</h2>
      <p class="text-lg">{{ result }}</p>
    </div>

    <div class="mt-4 text-gray-600">
      <p>这个示例展示了如何使用 Web Worker 进行耗时计算：</p>
      <ul class="list-disc pl-5 mt-2">
        <li>点击按钮会触发一个耗时的计算任务</li>
        <li>计算在 Worker 线程中进行，不会阻塞主线程</li>
        <li>计算完成后，结果会显示在页面上</li>
      </ul>
    </div>
  </div>
</template>

<style scoped>
.p-4 {
  padding: 1rem;
}

.mt-4 {
  margin-top: 1rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.text-2xl {
  font-size: 1.5rem;
}

.text-xl {
  font-size: 1.25rem;
}

.text-lg {
  font-size: 1.125rem;
}

.font-bold {
  font-weight: 700;
}

.font-semibold {
  font-weight: 600;
}

.text-gray-600 {
  color: #4b5563;
}

.bg-blue-500 {
  background-color: #3b82f6;
}

.text-white {
  color: white;
}

.px-4 {
  padding-left: 1rem;
  padding-right: 1rem;
}

.py-2 {
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
}

.rounded {
  border-radius: 0.25rem;
}

.disabled\:bg-gray-400:disabled {
  background-color: #9ca3af;
}

.list-disc {
  list-style-type: disc;
}

.pl-5 {
  padding-left: 1.25rem;
}
</style>
