<template>
  <div class="about">
    <h1>关于此演示</h1>
    <div class="content">
      <h2>大规模数据可视化优化项目</h2>
      <p>本演示展示了处理大规模数据集（10万+数据点）时的性能优化技术。</p>

      <h3>项目背景</h3>
      <p>
        在数据分析后台项目中，数据可视化模块面临的最大挑战是大量数据的图表渲染性能问题。原始渲染方式导致严重的性能问题，包括页面冻结和响应延迟。
      </p>

      <h3>性能优化策略</h3>
      <ul>
        <li>
          <strong>数据聚合与抽样：</strong>
          根据视图缩放级别动态调整数据精度，平衡细节与性能。
        </li>
        <li>
          <strong>Web Worker多线程处理：</strong>
          将计算密集型操作迁移到后台线程，避免主线程阻塞。
        </li>
        <li>
          <strong>按需渲染：</strong>
          根据当前视口只渲染用户可见的数据部分。
        </li>
        <li>
          <strong>DOM操作优化：</strong>
          减少不必要的DOM更新和布局重计算。
        </li>
      </ul>

      <h3>优化成果</h3>
      <ul>
        <li>图表渲染时间从3秒降至300ms（提升90%）</li>
        <li>交互操作响应时间降至50ms以内</li>
        <li>内存使用优化，减少60%的峰值内存占用</li>
        <li>可复用组件已被团队其他四个项目采用</li>
      </ul>

      <h3>技术栈</h3>
      <ul>
        <li>前端框架：Vue 3 + Vite</li>
        <li>图表库：ECharts</li>
        <li>并行计算：Web Workers API</li>
        <li>构建工具：Vite</li>
        <li>包管理：pnpm</li>
      </ul>
    </div>
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

.content {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

h2,
h3 {
  margin-top: 20px;
  margin-bottom: 10px;
  color: #1890ff;
}

ul {
  margin-left: 20px;
}

li {
  margin-bottom: 8px;
}

strong {
  color: #111;
}
</style>
