<template>
  <!-- 对话框遮罩 -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
      @click.self="handleClose"
    >
      <!-- 对话框内容 -->
      <div class="bg-card rounded-lg border border-border shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <!-- 头部 -->
        <div class="flex items-center justify-between px-6 py-4 border-b border-border">
          <div class="flex items-center gap-3">
            <UserX class="w-6 h-6 text-primary" />
            <div>
              <h2 class="text-xl font-semibold text-foreground">请假审核</h2>
              <p class="text-sm text-muted-foreground mt-0.5">
                {{ audit?.doctorName }} - {{ audit?.doctorTitle }}
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
          <div class="space-y-4">
            <h3 class="text-base font-semibold text-foreground">基本信息</h3>
            <div class="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <span class="text-sm text-muted-foreground">医生姓名：</span>
                <span class="text-sm font-medium text-foreground ml-2">{{ audit?.doctorName }}</span>
              </div>
              <div>
                <span class="text-sm text-muted-foreground">职称：</span>
                <span class="text-sm font-medium text-foreground ml-2">{{ audit?.doctorTitle }}</span>
              </div>
              <div>
                <span class="text-sm text-muted-foreground">所属科室：</span>
                <span class="text-sm font-medium text-foreground ml-2">{{ audit?.departmentName }}</span>
              </div>
              <div>
                <span class="text-sm text-muted-foreground">提交时间：</span>
                <span class="text-sm font-medium text-foreground ml-2">{{ formatDateTime(audit?.submitTime) }}</span>
              </div>
            </div>
          </div>

          <!-- 请假时间 -->
          <div class="space-y-4">
            <h3 class="text-base font-semibold text-foreground">请假时间</h3>
            <div class="p-4 bg-muted/30 rounded-lg">
              <div class="flex items-center gap-6">
                <div class="flex items-center gap-2">
                  <Calendar class="w-5 h-5 text-primary" />
                  <div>
                    <div class="text-xs text-muted-foreground">开始日期</div>
                    <div class="text-sm font-medium text-foreground mt-1">{{ formatDate(audit?.leaveStartDate) }}</div>
                  </div>
                </div>
                <div class="text-muted-foreground">→</div>
                <div class="flex items-center gap-2">
                  <Calendar class="w-5 h-5 text-primary" />
                  <div>
                    <div class="text-xs text-muted-foreground">结束日期</div>
                    <div class="text-sm font-medium text-foreground mt-1">{{ formatDate(audit?.leaveEndDate) }}</div>
                  </div>
                </div>
                <div class="ml-auto">
                  <div class="px-4 py-2 bg-primary/10 text-primary rounded-lg">
                    <span class="text-lg font-semibold">{{ audit?.leaveDays }}</span>
                    <span class="text-sm ml-1">天</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 请假原因 -->
          <div class="space-y-4">
            <h3 class="text-base font-semibold text-foreground">请假原因</h3>
            <div class="p-4 bg-muted/30 rounded-lg">
              <p class="text-sm text-foreground whitespace-pre-wrap leading-relaxed">{{ audit?.reason }}</p>
            </div>
          </div>

          <!-- 附件图片 -->
          <div v-if="audit?.attachments && audit.attachments.length > 0" class="space-y-4">
            <h3 class="text-base font-semibold text-foreground">
              附件材料
              <span class="text-sm font-normal text-muted-foreground ml-2">({{ audit.attachments.length }})</span>
            </h3>
            <div class="grid grid-cols-2 gap-4">
              <div
                v-for="(attachment, index) in audit.attachments"
                :key="index"
                class="group relative aspect-video bg-muted/30 rounded-lg overflow-hidden border border-border hover:border-primary transition-colors cursor-pointer"
                @click="previewImage(attachment.url)"
              >
                <img
                  :src="attachment.url"
                  :alt="attachment.name"
                  class="w-full h-full object-cover"
                />
                <div class="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-colors flex items-center justify-center">
                  <Eye class="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div class="absolute bottom-0 left-0 right-0 px-3 py-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p class="text-xs text-white truncate">{{ attachment.name }}</p>
                </div>
              </div>
            </div>
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

      <!-- 图片预览对话框 -->
      <Transition name="fade">
        <div
          v-if="previewImageUrl"
          class="absolute inset-0 bg-black/80 flex items-center justify-center p-4"
          @click="previewImageUrl = null"
        >
          <div class="relative max-w-5xl max-h-full">
            <img
              :src="previewImageUrl"
              class="max-w-full max-h-[80vh] object-contain"
              @click.stop
            />
            <button
              @click="previewImageUrl = null"
              class="absolute top-4 right-4 p-2 bg-black/50 hover:bg-black/70 rounded-lg transition-colors"
            >
              <X class="w-6 h-6 text-white" />
            </button>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>

<script setup>
import { ref } from 'vue'
import { X, UserX, Calendar, Eye, CheckCircle, XCircle } from 'lucide-vue-next'
import { approveLeaveAudit, rejectLeaveAudit } from '@/api/audit'
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
const isSubmitting = ref(false)
const showRejectDialog = ref(false)
const rejectReason = ref('')
const previewImageUrl = ref(null)

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const weekday = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'][date.getDay()]
  return `${year}年${month}月${day}日 ${weekday}`
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

// 预览图片
const previewImage = (url) => {
  previewImageUrl.value = url
}

// 关闭对话框
const handleClose = () => {
  if (!isSubmitting.value) {
    rejectReason.value = ''
    showRejectDialog.value = false
    previewImageUrl.value = null
    emit('close')
  }
}

// 通过审核
const handleApprove = async () => {
  if (!props.audit) return

  try {
    isSubmitting.value = true
    const response = await approveLeaveAudit(props.audit.id, {
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
    const response = await rejectLeaveAudit(props.audit.id, {
      reason: rejectReason.value
    })

    if (response.data.code === 0) {
      toast.success('已拒绝该请假申请')
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
