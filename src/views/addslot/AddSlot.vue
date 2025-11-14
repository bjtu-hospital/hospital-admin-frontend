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
      :doctors="doctors"
      :patients="patients"
      :is-loading-data="isLoadingData"
      @close="handleAdminDialogClose"
      @success="handleAdminAddSlotSuccess"
    />
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import AddSlotAuditList from './AddSlotAuditList.vue'
import AddSlotAuditDialog from './AddSlotAuditDialog.vue'
import AdminAddSlotDialog from './AdminAddSlotDialog.vue'
import { getDoctors, getPatients } from '@/api/addslot'
import { useToast } from '@/utils/toast'

const { error } = useToast()

const auditListRef = ref(null)
const dialogOpen = ref(false)
const selectedAudit = ref(null)
const dialogMode = ref('audit') // 'audit' 或 'view'
const adminDialogOpen = ref(false)

// 医生和患者数据
const doctors = ref([])
const patients = ref([])
const isLoadingData = ref(false)

// 页面加载时预先请求医生和患者数据
onMounted(async () => {
  await loadDoctorsAndPatients()
})

// 加载医生和患者数据
const loadDoctorsAndPatients = async () => {
  isLoadingData.value = true
  try {
    // 并行请求医生和患者数据
    const [doctorsRes, patientsRes] = await Promise.all([
      getDoctors({}).catch(err => {
        console.error('加载医生列表失败:', err)
        return { code: -1, message: [] }
      }),
      getPatients({}).catch(err => {
        console.error('加载患者列表失败:', err)
        return { code: -1, message: [] }
      })
    ])

    // 处理医生数据
    if (doctorsRes.code === 0) {
      doctors.value = doctorsRes.message.doctors || []
    } else {
      doctors.value = []
      error('加载医生列表失败')
    }

    // 处理患者数据
    if (patientsRes.code === 0) {
      patients.value = patientsRes.message.patients || []
    } else {
      patients.value = []
      error('加载患者列表失败')
    }
  } catch (err) {
    console.error('加载数据失败:', err)
    error('加载数据失败')
  } finally {
    isLoadingData.value = false
  }
}

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
