<template>
  <div class="bg-card rounded-lg border border-border p-4 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
        <Calendar class="w-5 h-5 text-primary" />
        科室排班表预览
      </h3>
      <div class="flex items-center gap-2">
        <button
          @click="previousWeek"
          class="p-2 rounded-md hover:bg-accent transition-colors"
          title="上一周"
        >
          <ChevronLeft class="w-4 h-4" />
        </button>
        <span class="text-sm text-muted-foreground whitespace-nowrap">
          {{ formatDateRange(startDate, endDate) }}
        </span>
        <button
          @click="nextWeek"
          class="p-2 rounded-md hover:bg-accent transition-colors"
          title="下一周"
        >
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>
    </div>

    <div v-if="schedules.length > 0" class="overflow-x-auto">
      <div class="min-w-[800px]">
        <!-- 表头 -->
        <div class="grid grid-cols-4 gap-2 mb-2">
          <div class="font-semibold text-sm text-foreground">日期</div>
          <div class="font-semibold text-sm text-foreground">上午</div>
          <div class="font-semibold text-sm text-foreground">下午</div>
          <div class="font-semibold text-sm text-foreground">晚上</div>
        </div>

        <!-- 数据行 -->
        <div
          v-for="day in groupedSchedules"
          :key="day.date"
          class="grid grid-cols-4 gap-2 mb-2 p-2 rounded-lg hover:bg-accent/50 transition-colors"
        >
          <div class="flex flex-col justify-center">
            <div class="font-medium text-foreground">{{ day.weekDay }}</div>
            <div class="text-xs text-muted-foreground">{{ formatDate(day.date) }}</div>
          </div>

          <!-- 上午 -->
          <div class="flex flex-wrap gap-1">
            <span
              v-for="doctor in day.morning"
              :key="doctor.schedule_id"
              @click="highlightDoctor(doctor.doctor_id)"
              :class="[
                'px-2 py-1 rounded text-xs cursor-pointer transition-all font-medium',
                highlightedDoctorId === doctor.doctor_id
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/50 shadow-sm'
                  : doctor.status === '停诊'
                  ? 'bg-destructive/10 text-destructive line-through'
                  : 'bg-accent text-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400'
              ]"
            >
              {{ doctor.doctor_name }}
            </span>
            <span v-if="day.morning.length === 0" class="text-xs text-muted-foreground">-</span>
          </div>

          <!-- 下午 -->
          <div class="flex flex-wrap gap-1">
            <span
              v-for="doctor in day.afternoon"
              :key="doctor.schedule_id"
              @click="highlightDoctor(doctor.doctor_id)"
              :class="[
                'px-2 py-1 rounded text-xs cursor-pointer transition-all font-medium',
                highlightedDoctorId === doctor.doctor_id
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/50 shadow-sm'
                  : doctor.status === '停诊'
                  ? 'bg-destructive/10 text-destructive line-through'
                  : 'bg-accent text-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400'
              ]"
            >
              {{ doctor.doctor_name }}
            </span>
            <span v-if="day.afternoon.length === 0" class="text-xs text-muted-foreground">-</span>
          </div>

          <!-- 晚上 -->
          <div class="flex flex-wrap gap-1">
            <span
              v-for="doctor in day.evening"
              :key="doctor.schedule_id"
              @click="highlightDoctor(doctor.doctor_id)"
              :class="[
                'px-2 py-1 rounded text-xs cursor-pointer transition-all font-medium',
                highlightedDoctorId === doctor.doctor_id
                  ? 'bg-blue-500/20 text-blue-600 dark:text-blue-400 ring-2 ring-blue-500/50 shadow-sm'
                  : doctor.status === '停诊'
                  ? 'bg-destructive/10 text-destructive line-through'
                  : 'bg-accent text-foreground hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400'
              ]"
            >
              {{ doctor.doctor_name }}
            </span>
            <span v-if="day.evening.length === 0" class="text-xs text-muted-foreground">-</span>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 text-muted-foreground">
      <Calendar class="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>{{ deptId ? '暂无排班数据' : '请先选择科室' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import * as scheduleApi from '@/api/schedule'
import { useToast } from '@/utils/toast'

const props = defineProps({
  deptId: {
    type: Number,
    default: null
  },
  highlightedDoctorId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['update:highlightedDoctorId'])
const toast = useToast()

const schedules = ref([])
const startDate = ref(new Date())
const endDate = ref(new Date())

// 初始化为本周（从2025-10-31所在的周开始）
const initWeek = () => {
  // 固定使用2025年10月31日作为基准日期
  const now = new Date('2025-10-31')
  const day = now.getDay() // 5 (星期五)
  const diff = now.getDate() - day + (day === 0 ? -6 : 1) // 调整为周一
  startDate.value = new Date(now.setDate(diff))
  startDate.value.setHours(0, 0, 0, 0)
  
  endDate.value = new Date(startDate.value)
  endDate.value.setDate(startDate.value.getDate() + 6)
  endDate.value.setHours(23, 59, 59, 999)
}

const previousWeek = () => {
  startDate.value = new Date(startDate.value.setDate(startDate.value.getDate() - 7))
  endDate.value = new Date(endDate.value.setDate(endDate.value.getDate() - 7))
  loadSchedules()
}

const nextWeek = () => {
  startDate.value = new Date(startDate.value.setDate(startDate.value.getDate() + 7))
  endDate.value = new Date(endDate.value.setDate(endDate.value.getDate() + 7))
  loadSchedules()
}

const formatDate = (dateStr) => {
  const date = new Date(dateStr)
  return `${date.getMonth() + 1}月${date.getDate()}日`
}

const formatDateRange = (start, end) => {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日 - ${e.getMonth() + 1}月${e.getDate()}日`
}

const groupedSchedules = computed(() => {
  const grouped = []
  const dateMap = new Map()

  // 按日期分组
  schedules.value.forEach(schedule => {
    if (!dateMap.has(schedule.date)) {
      dateMap.set(schedule.date, {
        date: schedule.date,
        weekDay: `星期${schedule.week_day}`,
        morning: [],
        afternoon: [],
        evening: []
      })
    }

    const day = dateMap.get(schedule.date)
    if (schedule.time_section === '上午') {
      day.morning.push(schedule)
    } else if (schedule.time_section === '下午') {
      day.afternoon.push(schedule)
    } else if (schedule.time_section === '晚上') {
      day.evening.push(schedule)
    }
  })

  // 转换为数组并排序
  grouped.push(...Array.from(dateMap.values()))
  grouped.sort((a, b) => new Date(a.date) - new Date(b.date))

  return grouped
})

const highlightDoctor = (doctorId) => {
  emit('update:highlightedDoctorId', doctorId)
}

const loadSchedules = async () => {
  if (!props.deptId) {
    schedules.value = []
    return
  }

  try {
    const start = startDate.value.toISOString().split('T')[0]
    const end = endDate.value.toISOString().split('T')[0]
    
    const response = await scheduleApi.getDepartmentSchedules(props.deptId, start, end)
    if (response.data.code !== 0) {
      toast.error(response.data.message?.msg || '加载排班数据失败')
      return
    }
    schedules.value = response.data.message.schedules
  } catch (error) {
    console.error('加载排班数据失败:', error)
    toast.error('加载排班数据失败')
  }
}

watch(() => props.deptId, () => {
  if (props.deptId) {
    loadSchedules()
  }
}, { immediate: false })

// 初始化
initWeek()
</script>
