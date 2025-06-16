<script setup lang="ts">
// 无需导入组件
</script>

<template>
  <div class="app">
    <nav class="navbar">
      <div class="logo">大数据可视化优化</div>
      <div class="nav-links">
        <router-link to="/">仪表盘</router-link>
        <router-link to="/about">关于</router-link>
      </div>
    </nav>

    <main class="main-content">
      <router-view></router-view>
    </main>

    <footer class="footer">
      <p>大规模数据可视化性能优化演示 © {{ new Date().getFullYear() }}</p>
    </footer>
  </div>
</template>

<style>
:root {
  --primary-color: #1890ff;
  --secondary-color: #f5f5f5;
  --text-color: #333;
  --light-text: #666;
  --border-color: #eaeaea;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: "Helvetica Neue", Arial, sans-serif;
  color: var(--text-color);
  line-height: 1.6;
  background-color: #fafafa;
}

.app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.navbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 30px;
  background-color: white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.logo {
  font-size: 1.5rem;
  font-weight: bold;
  color: var(--primary-color);
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-links a {
  color: var(--light-text);
  text-decoration: none;
  padding: 5px 10px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.nav-links a:hover {
  background-color: var(--secondary-color);
}

.nav-links a.router-link-active {
  color: var(--primary-color);
  font-weight: 500;
}

.main-content {
  flex: 1;
  padding: 20px;
}

.footer {
  text-align: center;
  padding: 15px;
  background-color: var(--secondary-color);
  color: var(--light-text);
  margin-top: auto;
}
</style>
