<template>
  <header class="h-16 bg-card border-b border-border px-6 flex items-center justify-between shadow-sm">
    <div class="flex items-center gap-4">
      <h2 class="text-xl font-semibold text-foreground">{{ pageTitle }}</h2>
    </div>

    <div class="flex items-center gap-4">
      <button
        @click="themeStore.toggleTheme"
        class="p-2 rounded-md hover:bg-accent/70 text-foreground/70 hover:text-foreground transition-colors"
        title="切换主题"
      >
        <Moon v-if="!themeStore.isDark" class="w-5 h-5" />
        <Sun v-else class="w-5 h-5" />
      </button>

      <div class="flex items-center gap-3 pl-4 border-l border-border">
        <div class="text-right">
          <p class="text-sm font-semibold text-foreground">{{ authStore.user?.name || '管理员' }}</p>
          <p class="text-xs text-foreground/60 font-medium">{{ authStore.user?.role || '系统管理员' }}</p>
        </div>
        
        <button
          @click="handleLogout"
          class="p-2 rounded-md hover:bg-destructive/10 text-foreground/70 hover:text-destructive transition-colors"
          title="退出登录"
        >
          <LogOut class="w-5 h-5" />
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useThemeStore } from '@/stores/theme'
import { Sun, Moon, LogOut } from 'lucide-vue-next'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const themeStore = useThemeStore()

const pageTitleMap = {
  Dashboard: '仪表盘',
  Department: '科室管理',
  Doctor: '医生管理',
  Schedule: '排班规则',
  Booking: '挂号退号规则',
  Pricing: '号别与价格',
  Audit: '信息审核',
  ExtraNumber: '加号管理',
  Statistics: '统计分析',
  AntiScalper: '防黄牛',
  Sync: '数据同步'
}

const pageTitle = computed(() => {
  return pageTitleMap[route.name] || '医院管理系统'
})

function handleLogout() {
  authStore.logout()
  router.push('/login')
}
</script>
