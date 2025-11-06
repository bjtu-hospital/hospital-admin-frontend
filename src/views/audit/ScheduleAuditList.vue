<template>
  <div class="space-y-4">
    <!-- 表格 -->
    <div class="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-16">序号</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">科室</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">门诊</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">请求医生</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">排班周期</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">请求时间</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">备注</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">状态</th>
              <th class="px-4 py-3 text-center text-sm font-medium text-muted-foreground w-32">操作</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-border">
            <tr
              v-for="(audit, index) in audits"
              :key="audit.id"
              class="hover:bg-muted/30 transition-colors cursor-pointer"
              @click="handleRowClick(audit)"
            >
              <td class="px-4 py-3 text-sm text-foreground">
                {{ (currentPage - 1) * pageSize + index + 1 }}
              </td>
              <td class="px-4 py-3 text-sm text-foreground font-medium">
                {{ audit.departmentName }}
              </td>
              <td class="px-4 py-3 text-sm text-primary font-medium">
                {{ audit.clinicName }}
              </td>
              <td class="px-4 py-3 text-sm text-foreground">
                {{ audit.submitterName }}
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ formatDateRange(audit.weekStart, audit.weekEnd) }}
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ formatDateTime(audit.submitTime) }}
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate" :title="audit.remark">
                {{ audit.remark || '-' }}
              </td>
              <td class="px-4 py-3 text-sm">
                <span
                  :class="[
                    'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium whitespace-nowrap',
                    getStatusClass(audit.status)
                  ]"
                >
                  {{ getStatusText(audit.status) }}
                </span>
              </td>
              <td class="px-4 py-3 text-center">
                <button
                  @click.stop="handleAudit(audit)"
                  class="inline-flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-primary hover:text-primary/80 hover:bg-primary/10 rounded-md transition-colors"
                >
                  <FileCheck class="w-4 h-4" />
                  审核
                </button>
              </td>
            </tr>
            <tr v-if="audits.length === 0">
              <td colspan="9" class="px-4 py-12 text-center text-muted-foreground">
                <div class="flex flex-col items-center gap-2">
                  <FileX class="w-12 h-12 text-muted-foreground/50" />
                  <p>暂无审核数据</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- 分页 -->
    <div v-if="total > 0" class="flex items-center justify-between px-4">
      <div class="text-sm text-muted-foreground">
        共 {{ total }} 条记录，当前第 {{ currentPage }} / {{ totalPages }} 页
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="handlePageChange(currentPage - 1)"
          :disabled="currentPage === 1"
          class="px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          上一页
        </button>
        <button
          @click="handlePageChange(currentPage + 1)"
          :disabled="currentPage === totalPages"
          class="px-3 py-1.5 text-sm font-medium text-foreground bg-card border border-border rounded-md hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          下一页
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { FileCheck, FileX } from 'lucide-vue-next'
import { getScheduleAudits } from '@/api/audit'
import { useToast } from '@/utils/toast'

const props = defineProps({
  status: {
    type: String,
    default: 'pending'
  }
})

const emit = defineEmits(['audit-click', 'refresh'])

const toast = useToast()

// 数据
const audits = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 监听 status 变化，重新加载数据
watch(() => props.status, () => {
  currentPage.value = 1 // 重置到第一页
  loadData()
})

// 加载数据
const loadData = async () => {
  try {
    const response = await getScheduleAudits({
      status: props.status,
      page: currentPage.value,
      pageSize: pageSize.value
    })

    if (response.data.code === 0) {
      audits.value = response.data.message.audits
      total.value = response.data.message.total
      currentPage.value = response.data.message.page
    } else {
      toast.error('加载失败')
    }
  } catch (error) {
    console.error('加载排班审核列表失败:', error)
    toast.error('加载失败')
  }
}

// 格式化日期范围
const formatDateRange = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  return `${startDate.getMonth() + 1}/${startDate.getDate()} - ${endDate.getMonth() + 1}/${endDate.getDate()}`
}

// 格式化日期时间
const formatDateTime = (dateString) => {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hours}:${minutes}`
}

// 获取状态样式
const getStatusClass = (status) => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
    approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
  }
  return classes[status] || ''
}

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    pending: '待审核',
    approved: '已通过',
    rejected: '已拒绝'
  }
  return texts[status] || status
}

// 点击行
const handleRowClick = (audit) => {
  emit('audit-click', audit)
}

// 审核按钮点击
const handleAudit = (audit) => {
  emit('audit-click', audit)
}

// 分页切换
const handlePageChange = (page) => {
  if (page < 1 || page > totalPages.value) return
  currentPage.value = page
  loadData()
}

// 刷新数据
const refresh = () => {
  currentPage.value = 1
  loadData()
}

// 暴露方法供父组件调用
defineExpose({
  refresh
})

// 初始化
onMounted(() => {
  loadData()
})
</script>
