<template>
  <div class="space-y-6">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div
        v-for="stat in stats"
        :key="stat.label"
        class="bg-card rounded-lg border border-border p-6"
      >
        <div class="flex items-center justify-between">
          <div>
            <p class="text-sm text-muted-foreground">{{ stat.label }}</p>
            <p class="text-2xl font-bold text-foreground mt-2">{{ stat.value }}</p>
          </div>
          <div class="p-3 rounded-full bg-primary/10">
            <component :is="stat.icon" class="w-6 h-6 text-primary" />
          </div>
        </div>
      </div>
    </div>

    <div class="bg-card rounded-lg border border-border p-6">
      <h3 class="text-lg font-semibold text-foreground mb-4">欢迎使用医院管理系统</h3>
      <p class="text-muted-foreground">请从左侧菜单选择功能模块开始使用</p>
    </div>
  </div>
</template>

<script setup>
import { Building2, UserCog, Calendar, ClipboardList } from 'lucide-vue-next'

const stats = [
  { label: '科室总数', value: '24', icon: Building2 },
  { label: '医生总数', value: '156', icon: UserCog },
  { label: '今日排班', value: '89', icon: Calendar },
  { label: '今日挂号', value: '342', icon: ClipboardList }
]
</script>
