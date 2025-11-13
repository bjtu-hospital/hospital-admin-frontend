<template>
  <aside
    class="fixed left-0 top-0 h-screen bg-card border-r border-border transition-all duration-300 z-40"
    :class="sidebarStore.isCollapsed ? 'w-16' : 'w-64'"
  >
    <div class="flex items-center h-16 px-4 border-b border-border"
         :class="sidebarStore.isCollapsed ? 'justify-center' : 'justify-between'">
      <div class="flex items-center gap-2" :class="{ 'justify-center': sidebarStore.isCollapsed }">
        <Hospital class="w-6 h-6 text-primary flex-shrink-0" />
        <transition name="fade">
          <span v-if="!sidebarStore.isCollapsed" class="font-semibold text-lg text-foreground whitespace-nowrap">医院管理</span>
        </transition>
      </div>
      <button
        v-if="!sidebarStore.isCollapsed"
        @click="sidebarStore.toggle"
        class="p-2 rounded-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors flex-shrink-0"
      >
        <PanelLeftClose class="w-5 h-5" />
      </button>
      <button
        v-else
        @click="sidebarStore.toggle"
        class="absolute top-4 -right-3 p-1.5 rounded-full bg-card border border-border shadow-md hover:bg-accent text-muted-foreground hover:text-accent-foreground transition-colors"
      >
        <PanelLeftOpen class="w-4 h-4" />
      </button>
    </div>

    <nav class="p-2 space-y-1 overflow-y-auto" style="height: calc(100vh - 4rem);">
      <router-link
        v-for="item in menuItems"
        :key="item.path"
        :to="item.path"
        v-slot="{ isActive, isExactActive }"
        custom
      >
        <a
          @click="$router.push(item.path)"
          class="flex items-center gap-3 px-3 py-2.5 rounded-md transition-all duration-200 cursor-pointer"
          :class="[
            (item.path === '/' ? isExactActive : isActive)
              ? 'bg-primary/10 text-primary font-medium shadow-sm' 
              : 'text-foreground/70 hover:bg-accent/50 hover:text-foreground',
            sidebarStore.isCollapsed ? 'justify-center' : ''
          ]"
        >
          <component :is="item.icon" class="w-5 h-5 flex-shrink-0" />
          <transition name="fade">
            <span v-if="!sidebarStore.isCollapsed" class="text-sm whitespace-nowrap">{{ item.label }}</span>
          </transition>
        </a>
      </router-link>
    </nav>
  </aside>
</template>

<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import {
  Hospital,
  LayoutDashboard,
  Building2,
  UserCog,
  Calendar,
  ClipboardList,
  DollarSign,
  FileCheck,
  UserPlus,
  BarChart3,
  Shield,
  RefreshCw,
  PanelLeftClose,
  PanelLeftOpen,
  RulerIcon,
  Settings2
} from 'lucide-vue-next'

const sidebarStore = useSidebarStore()

const menuItems = [
  { path: '/', label: '仪表盘', icon: LayoutDashboard },
  { path: '/department', label: '科室管理', icon: Building2 },
  { path: '/doctor', label: '医生管理', icon: UserCog },
  { path: '/schedule', label: '排班规则', icon: Calendar },
  { path: '/audit', label: '信息审核', icon: FileCheck },
  { path: '/rules', label: '规则配置', icon: Settings2 },
  { path: '/anti-bot', label: '用户异常行为管理', icon: FileCheck }
]
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.15s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 滚动条样式 */
nav::-webkit-scrollbar {
  width: 4px;
}

nav::-webkit-scrollbar-track {
  background: transparent;
}

nav::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 2px;
}

nav::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--muted-foreground) / 0.3);
}
</style>
