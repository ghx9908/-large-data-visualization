import { createRouter, createWebHistory } from "vue-router"
import Dashboard from "../views/Dashboard.vue"

const routes = [
  {
    path: "/",
    name: "Dashboard",
    component: Dashboard,
  },
  {
    path: "/about",
    name: "About",
    component: () => import("../views/About.vue"),
  },
  {
    path: "/worker-demo",
    name: "WorkerDemo",
    component: () => import("../views/WorkerDemo.vue"),
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

export default router
