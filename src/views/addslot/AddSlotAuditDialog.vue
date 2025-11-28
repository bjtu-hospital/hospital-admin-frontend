<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4 pt-20 overflow-y-auto"
    @click.self="handleClose"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full overflow-y-auto">
      <!-- 标题栏 -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          {{ isAuditMode ? '审批加号申请' : '申请详情' }}
        </h3>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="px-6 py-4 space-y-4">
        <!-- 申请信息 -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              申请ID
            </label>
            <p class="text-gray-900 dark:text-white">#{{ audit?.audit_id }}</p>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              状态
            </label>
            <span
              class="inline-block px-2 py-1 rounded-full text-xs font-medium"
              :class="getStatusClass(audit?.status)"
            >
              {{ getStatusText(audit?.status) }}
            </span>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              排班ID
            </label>
            <p class="text-gray-900 dark:text-white">{{ audit?.schedule_id }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              号源类型
            </label>
            <span
              class="inline-block px-2 py-1 rounded-full text-xs font-medium"
              :class="getSlotTypeClass(audit?.slot_type)"
            >
              {{ audit?.slot_type }}
            </span>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              医生
            </label>
            <p class="text-gray-900 dark:text-white">
              <span class="font-medium">{{ audit?.doctor_name || '未知医生' }}</span>
              <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">(ID: {{ audit?.doctor_id }})</span>
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              患者
            </label>
            <p class="text-gray-900 dark:text-white">
              <span class="font-medium">{{ audit?.patient_name || '未知患者' }}</span>
              <span class="ml-2 text-sm text-gray-500 dark:text-gray-400">(ID: {{ audit?.patient_id }})</span>
            </p>
          </div>

          <div class="col-span-2">
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              申请原因
            </label>
            <p class="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-750 p-3 rounded">
              {{ audit?.reason || '未填写' }}
            </p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              提交时间
            </label>
            <p class="text-gray-900 dark:text-white">{{ formatDateTime(audit?.submit_time) }}</p>
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
              申请人ID
            </label>
            <p class="text-gray-900 dark:text-white">{{ audit?.applicant_id }}</p>
          </div>
        </div>

        <!-- 审批信息（如果已审批） -->
        <div v-if="audit?.status !== 'pending'" class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <h4 class="text-sm font-semibold text-gray-900 dark:text-white mb-3">审批信息</h4>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                审批人ID
              </label>
              <p class="text-gray-900 dark:text-white">{{ audit?.auditor_admin_id || '-' }}</p>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                审批时间
              </label>
              <p class="text-gray-900 dark:text-white">{{ formatDateTime(audit?.audit_time) }}</p>
            </div>

            <div class="col-span-2">
              <label class="block text-sm font-medium text-gray-600 dark:text-gray-400 mb-1">
                审批意见
              </label>
              <p class="text-gray-900 dark:text-white bg-gray-50 dark:bg-gray-750 p-3 rounded">
                {{ audit?.audit_remark || '-' }}
              </p>
            </div>
          </div>
        </div>

        <!-- 审批操作区（待审批状态且为审批模式） -->
        <div v-if="isAuditMode && audit?.status === 'pending'" class="border-t border-gray-200 dark:border-gray-700 pt-4">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            审批意见
          </label>
          <textarea
            v-model="auditComment"
            rows="3"
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="请输入审批意见（可选）"
          ></textarea>
        </div>
      </div>

      <!-- 底部按钮 -->
      <div class="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex justify-end space-x-3">
        <button
          @click="handleClose"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                 transition-colors"
        >
          {{ isAuditMode && audit?.status === 'pending' ? '取消' : '关闭' }}
        </button>
        
        <template v-if="isAuditMode && audit?.status === 'pending'">
          <button
            @click="handleReject"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md 
                   disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSubmitting ? '处理中...' : '拒绝' }}
          </button>
          <button
            @click="handleApprove"
            :disabled="isSubmitting"
            class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md 
                   disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            {{ isSubmitting ? '处理中...' : '通过' }}
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { approveAddSlot, rejectAddSlot } from '@/api/addslot'
import { useToast } from '@/utils/toast'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  audit: {
    type: Object,
    default: null
  },
  mode: {
    type: String,
    default: 'audit', // 'audit' 或 'view'
    validator: (value) => ['audit', 'view'].includes(value)
  }
})

const emit = defineEmits(['close', 'success'])
const { success, error } = useToast()

const auditComment = ref('')
const isSubmitting = ref(false)

const isAuditMode = computed(() => props.mode === 'audit')

const handleClose = () => {
  auditComment.value = ''
  emit('close')
}

const handleApprove = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const response = await approveAddSlot(props.audit.audit_id, auditComment.value)
    
    if (response.code === 0) {
      success('审批通过！加号记录已创建')
      emit('success', { action: 'approve', audit: props.audit })
      handleClose()
    } else {
      error(response.message || '审批失败')
    }
  } catch (err) {
    console.error('Approve error:', err)
    error(err.response?.data?.message || '审批失败')
  } finally {
    isSubmitting.value = false
  }
}

const handleReject = async () => {
  if (isSubmitting.value) return
  
  if (!auditComment.value.trim()) {
    error('请填写拒绝原因')
    return
  }
  
  isSubmitting.value = true
  
  try {
    const response = await rejectAddSlot(props.audit.audit_id, auditComment.value)
    
    if (response.code === 0) {
      success('已拒绝该申请')
      emit('success', { action: 'reject', audit: props.audit })
      handleClose()
    } else {
      error(response.message || '操作失败')
    }
  } catch (err) {
    console.error('Reject error:', err)
    error(err.response?.data?.message || '操作失败')
  } finally {
    isSubmitting.value = false
  }
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
    minute: '2-digit',
    second: '2-digit'
  })
}
</script>
