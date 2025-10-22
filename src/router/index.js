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
        path: "booking",
        name: "Booking",
        component: () => import("@/views/booking/BookingView.vue"),
      },
      {
        path: "pricing",
        name: "Pricing",
        component: () => import("@/views/pricing/PricingView.vue"),
      },
      {
        path: "audit",
        name: "Audit",
        component: () => import("@/views/audit/AuditView.vue"),
      },
      {
        path: "extra-number",
        name: "ExtraNumber",
        component: () => import("@/views/extra-number/ExtraNumberView.vue"),
      },
      {
        path: "statistics",
        name: "Statistics",
        component: () => import("@/views/statistics/StatisticsView.vue"),
      },
      {
        path: "anti-scalper",
        name: "AntiScalper",
        component: () => import("@/views/anti-scalper/AntiScalperView.vue"),
      },
      {
        path: "sync",
        name: "Sync",
        component: () => import("@/views/sync/SyncView.vue"),
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

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next("/login")
  } else if (to.path === "/login" && authStore.isAuthenticated) {
    next("/")
  } else {
    next()
  }
})

export default router
