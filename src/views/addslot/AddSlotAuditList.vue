<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
    <!-- 标题栏 -->
    <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
      <h2 class="text-xl font-semibold text-gray-900 dark:text-white">
        加号申请列表
      </h2>
      <button
        @click="loadAudits"
        :disabled="isLoading"
        class="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded 
               disabled:bg-gray-400 transition-colors"
      >
        {{ isLoading ? '加载中...' : '刷新' }}
      </button>
    </div>

    <!-- 筛选器 -->
    <div class="px-6 py-3 bg-gray-50 dark:bg-gray-750 border-b border-gray-200 dark:border-gray-700">
      <div class="flex items-center space-x-4">
        <div>
          <label class="text-sm text-gray-600 dark:text-gray-400 mr-2">状态:</label>
          <select
            v-model="filterStatus"
            class="px-3 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          >
            <option value="all">全部</option>
            <option value="pending">待审批</option>
            <option value="approved">已通过</option>
            <option value="rejected">已拒绝</option>
          </select>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="isLoading" class="p-8 text-center text-gray-500 dark:text-gray-400">
      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
      <p class="mt-2">加载中...</p>
    </div>

    <!-- 空状态 -->
    <div v-else-if="filteredAudits.length === 0" class="p-8 text-center text-gray-500 dark:text-gray-400">
      暂无申请记录
    </div>

    <!-- 列表 -->
    <div v-else class="overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 dark:bg-gray-750">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              申请ID
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              医生
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              患者
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              号源类型
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              申请原因
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              提交时间
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              状态
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              操作
            </th>
          </tr>
        </thead>
        <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
          <tr v-for="audit in filteredAudits" :key="audit.audit_id" class="hover:bg-gray-50 dark:hover:bg-gray-750">
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              #{{ audit.audit_id }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              <div>
                <span class="font-medium">{{ getDoctorName(audit.doctor_id, audit.doctor_name) }}</span>
                <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">(ID: {{ audit.doctor_id }})</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
              <div>
                <span class="font-medium">{{ getPatientName(audit.patient_id, audit.patient_name) }}</span>
                <span class="ml-1 text-xs text-gray-500 dark:text-gray-400">(ID: {{ audit.patient_id }})</span>
              </div>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="getSlotTypeClass(audit.slot_type)"
              >
                {{ audit.slot_type }}
              </span>
            </td>
            <td class="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs" :title="audit.reason">
              {{ truncateReason(audit.reason) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
              {{ formatDateTime(audit.submit_time) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <span
                class="px-2 py-1 rounded-full text-xs font-medium"
                :class="getStatusClass(audit.status)"
              >
                {{ getStatusText(audit.status) }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-sm">
              <button
                v-if="audit.status === 'pending'"
                @click="handleAudit(audit)"
                class="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 mr-3"
              >
                审批
              </button>
              <button
                v-else
                @click="handleViewDetail(audit)"
                class="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-300"
              >
                查看详情
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { getAddSlotAudits } from '@/api/addslot'
import { useToast } from '@/utils/toast'

const props = defineProps({
  doctors: {
    type: Array,
    default: () => []
  },
  patients: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['audit', 'view-detail'])
const { error } = useToast()

const audits = ref([])
const isLoading = ref(false)
const filterStatus = ref('all')

// 根据医生ID查找医生姓名
const getDoctorName = (doctorId, fallbackName) => {
  if (fallbackName) return fallbackName
  const doctor = props.doctors.find(d => d.doctor_id === doctorId)
  return doctor?.name || '未知医生'
}

// 根据患者ID查找患者姓名
const getPatientName = (patientId, fallbackName) => {
  if (fallbackName) return fallbackName
  const patient = props.patients.find(p => p.patient_id === patientId)
  return patient?.name || '未知患者'
}

const filteredAudits = computed(() => {
  if (filterStatus.value === 'all') {
    return audits.value
  }
  return audits.value.filter(audit => audit.status === filterStatus.value)
})

const loadAudits = async () => {
  isLoading.value = true
  try {
    const response = await getAddSlotAudits()
    if (response.code === 0) {
      audits.value = response.message.audits || []
    } else {
      error('加载申请列表失败')
    }
  } catch (err) {
    console.error('Load audits error:', err)
    error('加载申请列表失败')
  } finally {
    isLoading.value = false
  }
}

const handleAudit = (audit) => {
  emit('audit', audit)
}

const handleViewDetail = (audit) => {
  emit('view-detail', audit)
}

const getStatusText = (status) => {
  const statusMap = {
    pending: '待审批',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return statusMap[status] || status
}

const getStatusClass = (status) => {
  const classMap = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300'
  }
  return classMap[status] || 'bg-gray-100 text-gray-800'
}

const getSlotTypeClass = (type) => {
  const classMap = {
    '普通': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    '专家': 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    '特需': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  }
  return classMap[type] || 'bg-gray-100 text-gray-800'
}

const formatDateTime = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const truncateReason = (reason) => {
  if (!reason) return '-'
  return reason.length > 15 ? reason.substring(0, 15) + '...' : reason
}

onMounted(() => {
  loadAudits()
})

// 暴露方法供父组件调用
defineExpose({
  loadAudits
})
</script>
