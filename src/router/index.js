import { createRouter, createWebHistory } from "vue-router"
import { useAuthStore } from "@/stores/auth"

const routes = [
  {
    path: "/login",
    name: "Login",
    component: () => import("@/views/auth/LoginView.vue"),
    meta: { requiresAuth: false },
  },
  {
    path: "/",
    component: () => import("@/layouts/MainLayout.vue"),
    meta: { requiresAuth: false },
    children: [
      {
        path: "",
        name: "Dashboard",
        component: () => import("@/views/DashboardView.vue"),
      },
      {
        path: "department",
        name: "Department",
        component: () => import("@/views/department/DepartmentView.vue"),
      },
      {
        path: "doctor",
        name: "Doctor",
        component: () => import("@/views/doctor/DoctorView.vue"),
      },
      {
        path: "schedule",
        name: "Schedule",
        component: () => import("@/views/schedule/ScheduleView.vue"),
      },
      {
        path: "audit",
        name: "Audit",
        component: () => import("@/views/audit/AuditView.vue"),
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  console.log('Route guard:', {
    to: to.path,
    from: from.path,
    isAuthenticated: authStore.isAuthenticated,
    token: authStore.token // ref 会自动解包
  })

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    // 需要认证但未登录，跳转到登录页
    console.log('Not authenticated, redirecting to login')
    next("/login")
  } else if (to.path === "/login" && authStore.isAuthenticated) {
    // 已登录但访问登录页，跳转到首页
    console.log('Already authenticated, redirecting to home')
    next("/")
  } else {
    // 允许访问
    next()
  }
})

export default router
