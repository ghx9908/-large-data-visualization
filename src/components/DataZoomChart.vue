<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, defineProps, defineEmits, computed } from "vue"
import * as echarts from "echarts"
import { DataPoint, AggregationOptions } from "../types"
import { aggregateData, advancedAggregation, createDataWorker } from "../utils/dataUtils"

// 定义组件属性
const props = defineProps<{
  // 原始数据
  data: DataPoint[]
  // 图表标题
  title?: string
  // 图表副标题
  subtitle?: string
  // 最大渲染点数
  maxPoints?: number
  // 是否开启Web Worker处理
  useWorker?: boolean
  // 是否使用高级聚合
  useAdvancedAggregation?: boolean
}>()

// 定义事件
const emit = defineEmits<{
  // 渲染完成事件
  (e: "render-complete", stats: { renderedPoints: number; renderTime: number }): void
  // 视口变化事件
  (e: "viewport-change", range: { start: number; end: number }): void
}>()

// 状态变量
const chartContainer = ref<HTMLElement | null>(null)
const renderedDataCount = ref(0)
const lastRenderTime = ref(0)
const viewportStart = ref(0)
const viewportEnd = ref(0)
const zoomLevel = ref(5)
const isProcessing = ref(false)

// 图表实例
let chart: echarts.ECharts | null = null
let worker: Worker | null = null

// 监听数据变化
watch(
  () => props.data,
  () => {
    if (chart) {
      updateData()
    }
  },
  { deep: true }
)

// 监听缩放级别变化
watch(zoomLevel, () => {
  updateData()
})

// 计算属性
const effectiveMaxPoints = computed(() => {
  return props.maxPoints ? props.maxPoints * zoomLevel.value : 1000 * zoomLevel.value
})

// 初始化图表
onMounted(() => {
  if (chartContainer.value) {
    // 创建ECharts实例
    chart = echarts.init(chartContainer.value)

    // 如果启用了Web Worker
    if (props.useWorker) {
      worker = createDataWorker()
      worker.onmessage = handleWorkerMessage
    }

    // 初始化图表配置
    initChart()

    // 初始渲染
    updateData()

    // 监听窗口大小变化
    window.addEventListener("resize", handleResize)
  }
})

onUnmounted(() => {
  // 清理资源
  if (chart) {
    chart.dispose()
    chart = null
  }

  if (worker) {
    worker.terminate()
    worker = null
  }

  window.removeEventListener("resize", handleResize)
})

// 初始化图表配置
function initChart() {
  if (!chart) return

  const option: echarts.EChartsOption = {
    title: {
      text: props.title || "大规模数据可视化",
      subtext: props.subtitle || "优化后性能演示",
    },
    tooltip: {
      trigger: "axis",
      position: function (pt: any[]) {
        return [pt[0], "10%"]
      },
    },
    toolbox: {
      feature: {
        dataZoom: {
          yAxisIndex: "none",
        },
        restore: {},
        saveAsImage: {},
      },
    },
    xAxis: {
      type: "time",
    },
    yAxis: {
      type: "value",
      boundaryGap: [0, "10%"],
    },
    dataZoom: [
      {
        type: "inside",
        start: 0,
        end: 100,
      },
      {
        start: 0,
        end: 20,
      },
    ],
    series: [
      {
        name: "数据",
        type: "line",
        smooth: true,
        symbol: "none",
        sampling: "lttb",
        itemStyle: {
          color: "rgb(255, 70, 131)",
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            {
              offset: 0,
              color: "rgb(255, 158, 68)",
            },
            {
              offset: 1,
              color: "rgb(255, 70, 131)",
            },
          ]),
        },
        // 启用渐进式渲染
        progressive: 500,
        progressiveThreshold: 5000,
        data: [],
      },
    ],
  }

  // 设置基本配置
  chart.setOption(option)

  // 启用脏矩形渲染优化
  ;(chart as any).getZr().configLayer(0, {
    useDirtyRect: true,
  })

  // 注册图表缩放事件
  chart.on("datazoom", (params: any) => {
    const start = params.start as number
    const end = params.end as number
    viewportStart.value = Math.floor((start * props.data.length) / 100)
    viewportEnd.value = Math.floor((end * props.data.length) / 100)

    // 发出视口变化事件
    emit("viewport-change", {
      start: viewportStart.value,
      end: viewportEnd.value,
    })

    updateData()
  })
}

// 处理窗口大小变化
function handleResize() {
  chart?.resize()
}

// 更新缩放级别
function updateZoomLevel(level: number) {
  zoomLevel.value = level
}

// 更新数据和重新渲染
function updateData() {
  if (isProcessing.value || !chart || !props.data.length) return

  isProcessing.value = true
  const start = viewportStart.value
  const end = viewportEnd.value || props.data.length

  const startTime = performance.now()

  if (props.useWorker && worker) {
    // 使用Web Worker进行数据处理
    worker.postMessage({
      data: props.data,
      startIndex: start,
      endIndex: end,
      maxPoints: effectiveMaxPoints.value,
    })
  } else {
    // 在主线程中处理
    let processedData: DataPoint[]

    if (props.useAdvancedAggregation) {
      const options: AggregationOptions = {
        startIndex: start,
        endIndex: end,
        maxPoints: effectiveMaxPoints.value,
      }
      processedData = advancedAggregation(props.data, options)
    } else {
      processedData = aggregateData(props.data, start, end, effectiveMaxPoints.value)
    }

    updateChart(processedData)
    lastRenderTime.value = Math.round(performance.now() - startTime)
    renderedDataCount.value = processedData.length
    isProcessing.value = false

    // 发出渲染完成事件
    emit("render-complete", {
      renderedPoints: renderedDataCount.value,
      renderTime: lastRenderTime.value,
    })
  }
}

// 处理Worker返回的消息
function handleWorkerMessage(e: MessageEvent) {
  const processedData = e.data
  const startTime = performance.now()

  updateChart(processedData)

  lastRenderTime.value = Math.round(performance.now() - startTime)
  renderedDataCount.value = processedData.length
  isProcessing.value = false

  // 发出渲染完成事件
  emit("render-complete", {
    renderedPoints: renderedDataCount.value,
    renderTime: lastRenderTime.value,
  })
}

// 更新图表数据
function updateChart(data: DataPoint[]) {
  if (!chart) return

  chart.setOption({
    series: [
      {
        data: data,
      },
    ],
  })
}

// 暴露组件方法
defineExpose({
  updateZoomLevel,
  updateData,
  getRenderedCount: () => renderedDataCount.value,
  getRenderTime: () => lastRenderTime.value,
  getChart: () => chart,
})
</script>

<template>
  <div class="data-zoom-chart">
    <div class="chart-controls">
      <slot name="controls">
        <div class="zoom-controls">
          <label>缩放级别: </label>
          <input type="range" min="1" max="10" v-model="zoomLevel" @input="updateData" />
          <span>{{ zoomLevel }}</span>
        </div>
      </slot>

      <div class="render-info">
        <slot name="info">
          渲染数据点: {{ renderedDataCount.toLocaleString() }} | 渲染时间: {{ lastRenderTime }}ms
        </slot>
      </div>
    </div>

    <div class="chart-container" ref="chartContainer"></div>
  </div>
</template>

<style scoped>
.data-zoom-chart {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.chart-controls {
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.zoom-controls {
  display: flex;
  align-items: center;
  gap: 8px;
}

.chart-container {
  width: 100%;
  height: 500px;
  margin-bottom: 20px;
}

.render-info {
  font-size: 0.9rem;
  color: #666;
}
</style>
