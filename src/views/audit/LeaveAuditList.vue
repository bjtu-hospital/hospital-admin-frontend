<template>
  <div class="space-y-4">
    <!-- 表格 -->
    <div class="bg-card rounded-lg border border-border shadow-sm overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-muted/50">
            <tr>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-16">序号</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">医生姓名</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">职称</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">科室</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">请假时间</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground w-24">请假天数</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">原因预览</th>
              <th class="px-4 py-3 text-left text-sm font-medium text-muted-foreground">请求时间</th>
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
                {{ audit.doctorName }}
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ audit.doctorTitle }}
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ audit.departmentName }}
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ formatDateRange(audit.leaveStartDate, audit.leaveEndDate) }}
              </td>
              <td class="px-4 py-3 text-sm text-foreground font-medium">
                {{ audit.leaveDays }} 天
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground max-w-xs truncate" :title="audit.reason">
                {{ audit.reasonPreview }}
              </td>
              <td class="px-4 py-3 text-sm text-muted-foreground">
                {{ formatDateTime(audit.submitTime) }}
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
              <td colspan="10" class="px-4 py-12 text-center text-muted-foreground">
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
import { getLeaveAudits } from '@/api/audit'
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
const allAudits = ref([]) // 存储所有数据
const currentPage = ref(1)
const pageSize = ref(10)

// 根据 status 筛选的数据
const filteredAudits = computed(() => {
  if (props.status === 'all') {
    return allAudits.value
  }
  return allAudits.value.filter(item => item.status === props.status)
})

// 总记录数
const total = computed(() => filteredAudits.value.length)

// 计算总页数
const totalPages = computed(() => Math.ceil(total.value / pageSize.value))

// 当前页显示的数据
const audits = computed(() => {
  const start = (currentPage.value - 1) * pageSize.value
  const end = start + pageSize.value
  return filteredAudits.value.slice(start, end)
})

// 监听 status 变化，重置到第一页
watch(() => props.status, () => {
  currentPage.value = 1
})

// 加载所有数据
const loadData = async () => {
  try {
    const response = await getLeaveAudits()

    if (response.data.code === 0) {
      allAudits.value = response.data.message.audits
    } else {
      toast.error('加载失败')
    }
  } catch (error) {
    console.error('加载请假审核列表失败:', error)
    toast.error('加载失败')
  }
}

// 格式化日期范围
const formatDateRange = (start, end) => {
  const startDate = new Date(start)
  const endDate = new Date(end)
  
  // 如果是同一天
  if (start === end) {
    return `${startDate.getMonth() + 1}/${startDate.getDate()}`
  }
  
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
