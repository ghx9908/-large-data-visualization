<template>
  <div class="dashboard">
    <h1>大数据可视化演示</h1>
    <div class="controls">
      <div class="data-info">总数据点: {{ originalDataCount.toLocaleString() }}</div>
      <div class="zoom-controls">
        <label>缩放级别: </label>
        <input type="range" min="1" max="10" v-model="zoomLevel" @input="updateChartZoom" />
        <span>{{ zoomLevel }}</span>
      </div>
      <div class="viewport-controls">
        <button @click="moveViewport(-10)">←</button>
        <button @click="moveViewport(10)">→</button>
      </div>
      <div class="render-info">
        渲染数据点: {{ renderedDataCount.toLocaleString() }} | 上次渲染时间: {{ lastRenderTime }}ms
      </div>
    </div>

    <DataZoomChart
      ref="chartRef"
      :data="fullData"
      :max-points="1000"
      :use-worker="true"
      :use-advanced-aggregation="true"
      title="大数据可视化优化"
      subtitle="TypeScript优化版本"
      @render-complete="onRenderComplete"
      @viewport-change="onViewportChange"
    />

    <div class="performance-tips">
      <h3>性能优化措施:</h3>
      <ul>
        <li>TypeScript类型增强，提高代码健壮性和IDE支持</li>
        <li>数据聚合和抽样技术，根据视图缩放级别动态调整数据精度</li>
        <li>使用Web Worker进行密集型计算，避免主线程阻塞</li>
        <li>按需渲染，只渲染可视区域内的数据</li>
        <li>优化DOM操作，减少布局重计算</li>
        <li>启用ECharts脏矩形渲染和渐进式渲染优化</li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue"
import { generateLargeDataset } from "../utils/dataUtils"
import DataZoomChart from "../components/DataZoomChart.vue"
import { DataPoint } from "../types"

// 状态变量
const zoomLevel = ref(5)
const renderedDataCount = ref(0)
const originalDataCount = ref(0)
const lastRenderTime = ref(0)
const viewportStart = ref(0)
const viewportSize = ref(100)
const chartRef = ref<InstanceType<typeof DataZoomChart> | null>(null)

let fullData: DataPoint[] = []

// 初始化数据
onMounted(() => {
  // 生成大量数据
  console.time("数据生成")
  fullData = generateLargeDataset(200000)
  originalDataCount.value = fullData.length
  console.timeEnd("数据生成")
})

// 更新缩放级别
function updateChartZoom() {
  chartRef.value?.updateZoomLevel(zoomLevel.value)
}

// 更新视口位置
function moveViewport(percent: number) {
  const currentStart = viewportStart.value
  const step = Math.floor((fullData.length * percent) / 100)

  // 确保不超出范围
  let newStart = currentStart + step
  newStart = Math.max(0, newStart)
  newStart = Math.min(fullData.length - viewportSize.value, newStart)

  viewportStart.value = newStart

  // 触发图表更新
  chartRef.value?.updateData()
}

// 处理渲染完成事件
function onRenderComplete(stats: { renderedPoints: number; renderTime: number }) {
  renderedDataCount.value = stats.renderedPoints
  lastRenderTime.value = stats.renderTime
}

// 处理视口变化事件
function onViewportChange(range: { start: number; end: number }) {
  viewportStart.value = range.start
  viewportSize.value = range.end - range.start
}
</script>

<style scoped>
.dashboard {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

.controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 20px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.viewport-controls {
  display: flex;
  gap: 10px;
}

.viewport-controls button {
  padding: 5px 10px;
  background-color: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.viewport-controls button:hover {
  background-color: #40a9ff;
}

.performance-tips {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
}

.performance-tips ul {
  margin-left: 20px;
}
</style>
