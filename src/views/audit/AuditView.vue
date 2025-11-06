<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center gap-3">
      <ClipboardCheck class="w-8 h-8 text-primary" />
      <div>
        <h1 class="text-2xl font-bold text-foreground">信息审核</h1>
        <p class="text-sm text-muted-foreground">审核科室排班表和医生请假申请</p>
      </div>
    </div>

    <!-- 标签页切换 -->
    <div class="bg-card rounded-lg border border-border shadow-sm">
      <div class="border-b border-border">
        <div class="flex items-center gap-4 px-4">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="switchTab(tab.id)"
            :class="[
              'px-4 py-3 font-medium transition-all relative',
              activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <div class="flex items-center gap-2">
              <component :is="tab.icon" class="w-4 h-4" />
              {{ tab.label }}
              <span
                v-if="tab.count > 0"
                class="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full"
                :class="activeTab === tab.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'"
              >
                {{ tab.count }}
              </span>
            </div>
            <div
              v-if="activeTab === tab.id"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            ></div>
          </button>
        </div>
      </div>

      <!-- 过滤器 -->
      <div class="px-4 py-3 border-b border-border bg-muted/30">
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-foreground">筛选状态：</label>
          <div class="flex gap-2">
            <button
              v-for="filter in statusFilters"
              :key="filter.value"
              @click="currentStatus = filter.value"
              :class="[
                'px-3 py-1.5 text-sm font-medium rounded-lg transition-all',
                currentStatus === filter.value
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-card text-muted-foreground hover:bg-muted border border-border'
              ]"
            >
              {{ filter.label }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="space-y-6">
      <!-- 排班审核 -->
      <ScheduleAuditList
        v-show="activeTab === 'schedule'"
        ref="scheduleListRef"
        :status="currentStatus"
        @audit-click="handleScheduleAuditClick"
      />

      <!-- 请假审核 -->
      <LeaveAuditList
        v-show="activeTab === 'leave'"
        ref="leaveListRef"
        :status="currentStatus"
        @audit-click="handleLeaveAuditClick"
      />
    </div>

    <!-- 排班审核对话框 -->
    <ScheduleAuditDialog
      :audit="selectedScheduleAudit"
      :is-open="isScheduleDialogOpen"
      @close="closeScheduleDialog"
      @refresh="refreshScheduleList"
    />

    <!-- 请假审核对话框 -->
    <LeaveAuditDialog
      :audit="selectedLeaveAudit"
      :is-open="isLeaveDialogOpen"
      @close="closeLeaveDialog"
      @refresh="refreshLeaveList"
    />
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ClipboardCheck, CalendarCheck, UserX } from 'lucide-vue-next'
import ScheduleAuditList from './ScheduleAuditList.vue'
import ScheduleAuditDialog from './ScheduleAuditDialog.vue'
import LeaveAuditList from './LeaveAuditList.vue'
import LeaveAuditDialog from './LeaveAuditDialog.vue'

// 当前激活的标签页
const activeTab = ref('schedule')

// 当前状态筛选
const currentStatus = ref('pending')

// 标签页列表
const tabs = ref([
  { id: 'schedule', label: '排班审核', icon: CalendarCheck, count: 0 },
  { id: 'leave', label: '请假审核', icon: UserX, count: 0 }
])

// 状态筛选器
const statusFilters = [
  { label: '待审核', value: 'pending' },
  { label: '已通过', value: 'approved' },
  { label: '已拒绝', value: 'rejected' },
  { label: '全部', value: 'all' }
]

// 列表引用
const scheduleListRef = ref(null)
const leaveListRef = ref(null)

// 排班审核相关
const selectedScheduleAudit = ref(null)
const isScheduleDialogOpen = ref(false)

// 请假审核相关
const selectedLeaveAudit = ref(null)
const isLeaveDialogOpen = ref(false)

// 切换标签页
const switchTab = (tabId) => {
  activeTab.value = tabId
  currentStatus.value = 'pending' // 切换标签页时重置为待审核
}

// 监听状态变化，刷新列表
watch(currentStatus, () => {
  if (activeTab.value === 'schedule') {
    scheduleListRef.value?.refresh()
  } else {
    leaveListRef.value?.refresh()
  }
})

// 排班审核点击
const handleScheduleAuditClick = (audit) => {
  selectedScheduleAudit.value = audit
  isScheduleDialogOpen.value = true
}

// 关闭排班审核对话框
const closeScheduleDialog = () => {
  isScheduleDialogOpen.value = false
  selectedScheduleAudit.value = null
}

// 刷新排班审核列表
const refreshScheduleList = () => {
  scheduleListRef.value?.refresh()
}

// 请假审核点击
const handleLeaveAuditClick = (audit) => {
  selectedLeaveAudit.value = audit
  isLeaveDialogOpen.value = true
}

// 关闭请假审核对话框
const closeLeaveDialog = () => {
  isLeaveDialogOpen.value = false
  selectedLeaveAudit.value = null
}

// 刷新请假审核列表
const refreshLeaveList = () => {
  leaveListRef.value?.refresh()
}
</script>
