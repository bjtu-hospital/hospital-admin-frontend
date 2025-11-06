<template>
  <!-- 对话框遮罩 -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="handleClose"
    >
      <!-- 对话框内容 -->
      <div class="bg-card rounded-lg border border-border shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- 头部 -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <div class="flex items-center gap-3">
            <CalendarCheck class="w-6 h-6 text-primary" />
            <div>
              <h2 class="text-xl font-semibold text-foreground">排班审核</h2>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ audit?.departmentName }} - {{ audit?.clinicName }} - {{ formatDateRange(audit?.weekStart, audit?.weekEnd) }}
              </p>
            </div>
          </div>
          <button
            @click="handleClose"
            class="p-2 hover:bg-muted rounded-lg transition-colors"
          >
            <X class="w-5 h-5 text-muted-foreground" />
          </button>
        </div>

        <!-- 内容区域 -->
        <div class="flex-1 overflow-y-auto p-6 space-y-6">
          <!-- 基本信息 -->
          <div class="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
            <div>
              <span class="text-sm text-muted-foreground">门诊：</span>
              <span class="text-sm font-medium text-foreground ml-2">{{ audit?.clinicName }}</span>
            </div>
            <div>
              <span class="text-sm text-muted-foreground">提交人：</span>
              <span class="text-sm font-medium text-foreground ml-2">{{ audit?.submitterName }}</span>
            </div>
            <div>
              <span class="text-sm text-muted-foreground">排班周期：</span>
              <span class="text-sm font-medium text-foreground ml-2">{{ formatDateRange(audit?.weekStart, audit?.weekEnd) }}</span>
            </div>
            <div>
              <span class="text-sm text-muted-foreground">提交时间：</span>
              <span class="text-sm font-medium text-foreground ml-2">{{ formatDateTime(audit?.submitTime) }}</span>
            </div>
            <div class="col-span-2">
              <span class="text-sm text-muted-foreground">备注：</span>
              <span class="text-sm text-foreground ml-2">{{ audit?.remark || '无' }}</span>
            </div>
          </div>

          <!-- 排班表 -->
          <div class="border border-border rounded-lg overflow-hidden">
            <div class="overflow-x-auto">
              <table class="w-full">
                <thead class="bg-muted/50">
                  <tr>
                    <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-24">时间</th>
                    <th
                      v-for="(day, index) in weekDays"
                      :key="index"
                      class="px-4 py-3 text-center text-sm font-medium text-muted-foreground"
                    >
                      <div>{{ day }}</div>
                      <div class="text-xs text-muted-foreground/70 mt-1">
                        {{ formatWeekDate(index) }}
                      </div>
                    </th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-border">
                  <tr v-for="(period, periodIndex) in periods" :key="periodIndex">
                    <td class="px-4 py-3 text-sm font-medium text-foreground bg-muted/30">
                      {{ period }}
                    </td>
                    <td
                      v-for="dayIndex in 7"
                      :key="dayIndex"
                      class="px-4 py-3 text-center border-l border-border"
                    >
                      <div
                        v-if="currentWeek === 0 && getDoctorForSlot(dayIndex - 1, periodIndex)"
                        class="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 text-primary rounded-md text-sm"
                      >
                        <UserCircle class="w-4 h-4" />
                        {{ getDoctorForSlot(dayIndex - 1, periodIndex)?.doctorName }}
                      </div>
                      <span v-else class="text-muted-foreground text-sm">-</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- 周切换按钮 -->
          <div class="flex items-center justify-center gap-4">
            <button
              @click="changeWeek(-1)"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
            >
              <ChevronLeft class="w-4 h-4" />
              上一周
            </button>
            <span class="text-sm text-muted-foreground">
              {{ currentWeek === 0 ? '当前申请周' : currentWeek > 0 ? `+${currentWeek}周` : `${currentWeek}周` }}
            </span>
            <button
              @click="changeWeek(1)"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
            >
              下一周
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>

          <!-- 提示信息 -->
          <div v-if="currentWeek !== 0" class="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
            <p class="text-sm text-yellow-800 dark:text-yellow-400">
              当前显示的是相对于申请周的第 {{ currentWeek > 0 ? '+' : '' }}{{ currentWeek }} 周，该周暂无排班数据。
            </p>
          </div>

          <!-- 审核状态 -->
          <div v-if="audit?.status !== 'pending'" class="p-4 rounded-lg" :class="audit?.status === 'approved' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'">
            <div class="flex items-start gap-3">
              <CheckCircle v-if="audit?.status === 'approved'" class="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" />
              <XCircle v-else class="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div class="flex-1">
                <p class="text-sm font-medium" :class="audit?.status === 'approved' ? 'text-green-800 dark:text-green-400' : 'text-red-800 dark:text-red-400'">
                  {{ audit?.status === 'approved' ? '已通过审核' : '已拒绝' }}
                </p>
                <p class="text-sm text-muted-foreground mt-1">
                  审核人：{{ audit?.auditorName }} | 时间：{{ formatDateTime(audit?.auditTime) }}
                </p>
                <p v-if="audit?.rejectReason" class="text-sm mt-2">
                  <span class="font-medium">拒绝原因：</span>{{ audit?.rejectReason }}
                </p>
              </div>
            </div>
          </div>
        </div>

        <!-- 底部操作栏 -->
        <div v-if="audit?.status === 'pending'" class="px-6 py-4 border-t border-border bg-muted/30">
          <div class="flex items-center justify-end gap-3">
            <button
              @click="handleClose"
              class="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
            >
              取消
            </button>
            <button
              @click="handleReject"
              :disabled="isSubmitting"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <XCircle class="w-4 h-4" />
              拒绝
            </button>
            <button
              @click="handleApprove"
              :disabled="isSubmitting"
              class="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <CheckCircle class="w-4 h-4" />
              通过
            </button>
          </div>
        </div>
      </div>

      <!-- 拒绝原因对话框 -->
      <Transition name="fade">
        <div
          v-if="showRejectDialog"
          class="absolute inset-0 bg-black/50 flex items-center justify-center p-4"
          @click.self="showRejectDialog = false"
        >
          <div class="bg-card rounded-lg border border-border shadow-xl max-w-md w-full p-6">
            <h3 class="text-lg font-semibold text-foreground mb-4">请输入拒绝原因</h3>
            <textarea
              v-model="rejectReason"
              rows="4"
              placeholder="请输入至少10个字符的拒绝原因..."
              class="w-full px-3 py-2 text-sm text-foreground bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary resize-none"
            ></textarea>
            <div class="text-xs text-muted-foreground mt-2">
              已输入 {{ rejectReason.length }} 个字符（至少需要10个字符）
            </div>
            <div class="flex items-center justify-end gap-3 mt-6">
              <button
                @click="showRejectDialog = false"
                class="px-4 py-2 text-sm font-medium text-foreground bg-card border border-border rounded-lg hover:bg-muted transition-colors"
              >
                取消
              </button>
              <button
                @click="confirmReject"
                :disabled="rejectReason.length < 10 || isSubmitting"
                class="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
              >
                确认拒绝
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X, CalendarCheck, UserCircle, ChevronLeft, ChevronRight, CheckCircle, XCircle } from 'lucide-vue-next'
import { approveScheduleAudit, rejectScheduleAudit } from '@/api/audit'
import { useToast } from '@/utils/toast'

const props = defineProps({
  audit: {
    type: Object,
    default: null
  },
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'refresh'])

const toast = useToast()

// 数据
const currentWeek = ref(0) // 0表示当前申请的周，-1表示上一周，1表示下一周
const isSubmitting = ref(false)
const showRejectDialog = ref(false)
const rejectReason = ref('')

// 周几
const weekDays = ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
// 时段
const periods = ['上午', '下午', '晚上']

// 格式化日期范围
const formatDateRange = (start, end) => {
  if (!start || !end) return ''
  const startDate = new Date(start)
  const endDate = new Date(end)
  return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 格式化周内日期
const formatWeekDate = (dayIndex) => {
  if (!props.audit?.weekStart) return ''
  const startDate = new Date(props.audit.weekStart)
  const targetDate = new Date(startDate)
  targetDate.setDate(startDate.getDate() + dayIndex)
  return `${targetDate.getMonth() + 1}/${targetDate.getDate()}`
}

// 获取指定时间段的医生
const getDoctorForSlot = (dayIndex, periodIndex) => {
  if (!props.audit?.schedule) return null
  const daySchedule = props.audit.schedule[dayIndex]
  return daySchedule ? daySchedule[periodIndex] : null
}

// 切换周（显示空数据）
const changeWeek = (offset) => {
  currentWeek.value += offset
}

// 关闭对话框
const handleClose = () => {
  if (!isSubmitting.value) {
    rejectReason.value = ''
    showRejectDialog.value = false
    currentWeek.value = 0 // 重置周切换
    emit('close')
  }
}

// 通过审核
const handleApprove = async () => {
  if (!props.audit) return

  try {
    isSubmitting.value = true
    const response = await approveScheduleAudit(props.audit.id, {
      comment: ''
    })

    if (response.data.code === 0) {
      toast.success('审核通过成功')
      emit('refresh')
      handleClose()
    } else {
      toast.error('操作失败')
    }
  } catch (error) {
    console.error('审核通过失败:', error)
    toast.error('操作失败')
  } finally {
    isSubmitting.value = false
  }
}

// 显示拒绝对话框
const handleReject = () => {
  showRejectDialog.value = true
  rejectReason.value = ''
}

// 确认拒绝
const confirmReject = async () => {
  if (!props.audit || rejectReason.value.length < 10) return

  try {
    isSubmitting.value = true
    const response = await rejectScheduleAudit(props.audit.id, {
      reason: rejectReason.value
    })

    if (response.data.code === 0) {
      toast.success('已拒绝该排班申请')
      showRejectDialog.value = false  // 关闭拒绝对话框
      emit('refresh')
      setTimeout(() => {
        handleClose()  // 延迟关闭主对话框
      }, 300)
    } else {
      toast.error('操作失败')
    }
  } catch (error) {
    console.error('拒绝审核失败:', error)
    toast.error('操作失败')
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
