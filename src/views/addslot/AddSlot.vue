<template>
  <div class="space-y-6">
    <!-- 页面标题和操作按钮 -->
    <div class="flex items-center justify-between">
      <h1 class="text-2xl font-bold text-gray-900 dark:text-white">
        加号管理
      </h1>
      <button
        @click="openAdminAddSlotDialog"
        class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md 
               flex items-center gap-2 transition-colors"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        管理员加号
      </button>
    </div>

    <!-- 加号申请列表 -->
    <AddSlotAuditList
      ref="auditListRef"
      @audit="handleAudit"
      @view-detail="handleViewDetail"
    />

    <!-- 审批/详情对话框 -->
    <AddSlotAuditDialog
      :is-open="dialogOpen"
      :audit="selectedAudit"
      :mode="dialogMode"
      @close="handleDialogClose"
      @success="handleAuditSuccess"
    />

    <!-- 管理员加号对话框 -->
    <AdminAddSlotDialog
      :is-open="adminDialogOpen"
      @close="handleAdminDialogClose"
      @success="handleAdminAddSlotSuccess"
    />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import AddSlotAuditList from './AddSlotAuditList.vue'
import AddSlotAuditDialog from './AddSlotAuditDialog.vue'
import AdminAddSlotDialog from './AdminAddSlotDialog.vue'

const auditListRef = ref(null)
const dialogOpen = ref(false)
const selectedAudit = ref(null)
const dialogMode = ref('audit') // 'audit' 或 'view'
const adminDialogOpen = ref(false)

// 打开管理员加号对话框
const openAdminAddSlotDialog = () => {
  adminDialogOpen.value = true
}

// 打开审批对话框
const handleAudit = (audit) => {
  selectedAudit.value = audit
  dialogMode.value = 'audit'
  dialogOpen.value = true
}

// 查看详情
const handleViewDetail = (audit) => {
  selectedAudit.value = audit
  dialogMode.value = 'view'
  dialogOpen.value = true
}

// 关闭审批对话框
const handleDialogClose = () => {
  dialogOpen.value = false
  selectedAudit.value = null
}

// 关闭管理员加号对话框
const handleAdminDialogClose = () => {
  adminDialogOpen.value = false
}

// 审批成功
const handleAuditSuccess = () => {
  // 刷新列表
  auditListRef.value?.loadAudits()
}

// 管理员加号成功
const handleAdminAddSlotSuccess = () => {
  // 刷新列表
  auditListRef.value?.loadAudits()
}
</script>
