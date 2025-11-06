<template>
  <div class="bg-card rounded-lg border border-border p-4 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
        <UserCircle class="w-5 h-5 text-primary" />
        医生排班数据
        <span v-if="selectedDoctor" class="text-primary">- {{ selectedDoctor.name }}</span>
      </h3>
      <div v-if="selectedDoctor" class="flex items-center gap-2">
        <!-- 视图切换按钮 -->
        <div class="flex items-center gap-1 border border-border rounded-md p-0.5">
          <button
            @click="viewMode = 'list'"
            :class="[
              'px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1',
              viewMode === 'list'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <List class="w-4 h-4" />
            列表
          </button>
          <button
            @click="viewMode = 'calendar'"
            :class="[
              'px-3 py-1.5 rounded text-sm font-medium transition-colors flex items-center gap-1',
              viewMode === 'calendar'
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <CalendarDays class="w-4 h-4" />
            月历
          </button>
        </div>
        <button
          @click="openAddDialog"
          class="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 hover:border-primary/50 transition-colors text-sm shadow-sm font-medium"
        >
          <Plus class="w-4 h-4" />
          新增排班
        </button>
      </div>
    </div>

    <div v-if="selectedDoctor">
      <!-- 日期范围导航 - 只在列表视图显示 -->
      <div v-if="viewMode === 'list'" class="flex items-center justify-between mb-4 bg-accent/30 p-3 rounded-lg">
        <button
          @click="previousWeekList"
          class="flex items-center gap-1 px-3 py-1.5 rounded-md bg-background border border-border hover:bg-accent transition-colors text-sm"
          title="上一周"
        >
          <ChevronLeft class="w-4 h-4" />
          上一周
        </button>
        <span class="text-sm font-medium text-foreground">
          {{ formatDateRange(listStartDate, listEndDate) }}
        </span>
        <button
          @click="nextWeekList"
          class="flex items-center gap-1 px-3 py-1.5 rounded-md bg-background border border-border hover:bg-accent transition-colors text-sm"
          title="下一周"
        >
          下一周
          <ChevronRight class="w-4 h-4" />
        </button>
      </div>

      <!-- 列表视图 -->
      <div v-if="viewMode === 'list' && schedules.length > 0" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-border">
              <th class="text-left p-2 font-semibold text-foreground">日期</th>
              <th class="text-left p-2 font-semibold text-foreground">星期</th>
              <th class="text-left p-2 font-semibold text-foreground">时段</th>
              <th class="text-left p-2 font-semibold text-foreground">门诊</th>
              <th class="text-left p-2 font-semibold text-foreground">类型</th>
              <th class="text-left p-2 font-semibold text-foreground">价格</th>
              <th class="text-left p-2 font-semibold text-foreground">状态</th>
              <th class="text-left p-2 font-semibold text-foreground">号源</th>
              <th class="text-left p-2 font-semibold text-foreground">操作</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="schedule in schedules"
              :key="schedule.schedule_id"
              class="border-b border-border hover:bg-accent/50 transition-colors"
            >
              <td class="p-2">{{ schedule.date }}</td>
              <td class="p-2">星期{{ schedule.week_day }}</td>
              <td class="p-2">{{ schedule.time_section }}</td>
              <td class="p-2 text-xs">{{ schedule.clinic_name }}</td>
              <td class="p-2">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-xs',
                    schedule.slot_type === '特需'
                      ? 'bg-orange-500/10 text-orange-600'
                      : schedule.slot_type === '专家'
                      ? 'bg-blue-500/10 text-blue-600'
                      : 'bg-gray-500/10 text-gray-600'
                  ]"
                >
                  {{ schedule.slot_type }}
                </span>
              </td>
              <td class="p-2">¥{{ schedule.price }}</td>
              <td class="p-2">
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-xs',
                    schedule.status === '正常'
                      ? 'bg-green-500/10 text-green-600'
                      : 'bg-red-500/10 text-red-600'
                  ]"
                >
                  {{ schedule.status }}
                </span>
              </td>
              <td class="p-2">{{ schedule.remaining_slots }}/{{ schedule.total_slots }}</td>
              <td class="p-2">
                <div class="flex items-center gap-1">
                  <button
                    @click="openEditDialog(schedule)"
                    class="p-1 hover:bg-accent rounded transition-colors"
                    title="编辑"
                  >
                    <Pencil class="w-4 h-4" />
                  </button>
                  <button
                    @click="handleDelete(schedule.schedule_id)"
                    class="p-1 hover:bg-destructive/10 text-destructive rounded transition-colors"
                    title="删除"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- 月历视图 -->
      <div v-if="viewMode === 'calendar' && schedules.length > 0" class="space-y-4">
        <!-- 周导航 -->
        <div class="flex items-center justify-between bg-accent/30 p-3 rounded-lg">
          <button
            @click="previousWeek"
            :disabled="currentWeekIndex === 0"
            class="flex items-center gap-1 px-3 py-1.5 rounded-md bg-background border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <ChevronLeft class="w-4 h-4" />
            上一周
          </button>
          <div class="text-sm font-medium text-foreground">
            第 {{ currentWeekIndex + 1 }} 周 / 共 {{ totalWeeks }} 周
            <span class="text-xs text-muted-foreground ml-2">
              ({{ currentWeekDates[0]?.day }} - {{ currentWeekDates[currentWeekDates.length - 1]?.day }})
            </span>
          </div>
          <button
            @click="nextWeek"
            :disabled="currentWeekIndex >= totalWeeks - 1"
            class="flex items-center gap-1 px-3 py-1.5 rounded-md bg-background border border-border hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            下一周
            <ChevronRight class="w-4 h-4" />
          </button>
        </div>

        <!-- 日历表格容器 - 添加滚动条 -->
        <div class="overflow-x-auto rounded-lg border border-border">
          <div class="min-w-[800px] bg-card">
            <!-- 日期表头 -->
            <div class="grid grid-cols-8 gap-1 p-2 bg-muted/50">
              <div class="font-semibold text-sm text-muted-foreground p-2">日期/时段</div>
              <div 
                v-for="date in currentWeekDates" 
                :key="date.dateStr"
                :class="[
                  'text-center p-2 rounded',
                  isToday(date.dateStr) ? 'bg-primary/20 border-2 border-primary' : 'bg-accent/50'
                ]"
              >
                <div class="text-xs font-semibold text-foreground">{{ date.day }}</div>
                <div class="text-xs text-muted-foreground">{{ date.weekDay }}</div>
              </div>
            </div>

            <!-- 上午 -->
            <div class="grid grid-cols-8 gap-1 p-2">
              <div class="p-2 bg-accent/30 rounded font-medium text-sm flex items-center">
                <Sunrise class="w-4 h-4 mr-1 text-orange-500" />
                上午
              </div>
              <div 
                v-for="date in currentWeekDates" 
                :key="`morning-${date.dateStr}`"
                class="p-1.5 border border-border rounded min-h-[70px] bg-background hover:bg-accent/30 transition-colors"
              >
                <div 
                  v-for="schedule in getSchedulesByDateAndTime(date.dateStr, '上午')"
                  :key="schedule.schedule_id"
                  :class="[
                    'mb-1 p-1 rounded text-xs cursor-pointer transition-all',
                    schedule.status === '停诊'
                      ? 'bg-red-500/10 text-red-600 line-through opacity-70'
                      : schedule.slot_type === '特需'
                      ? 'bg-orange-500/20 text-orange-600 hover:bg-orange-500/30'
                      : schedule.slot_type === '专家'
                      ? 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'
                      : 'bg-gray-500/20 text-gray-600 hover:bg-gray-500/30'
                  ]"
                  @click="openEditDialog(schedule)"
                  :title="`${schedule.clinic_name} - ${schedule.slot_type} - ¥${schedule.price}`"
                >
                  <div class="font-medium truncate">{{ schedule.slot_type }}</div>
                  <div class="text-[10px] opacity-80 truncate">{{ schedule.clinic_name.substring(0, 5) }}</div>
                  <div class="text-[10px]">¥{{ schedule.price }}</div>
                </div>
                <div v-if="getSchedulesByDateAndTime(date.dateStr, '上午').length === 0" class="text-xs text-muted-foreground/50 text-center py-4">
                  -
                </div>
              </div>
            </div>

            <!-- 下午 -->
            <div class="grid grid-cols-8 gap-1 p-2">
              <div class="p-2 bg-accent/30 rounded font-medium text-sm flex items-center">
                <Sun class="w-4 h-4 mr-1 text-yellow-500" />
                下午
              </div>
              <div 
                v-for="date in currentWeekDates" 
                :key="`afternoon-${date.dateStr}`"
                class="p-1.5 border border-border rounded min-h-[70px] bg-background hover:bg-accent/30 transition-colors"
              >
                <div 
                  v-for="schedule in getSchedulesByDateAndTime(date.dateStr, '下午')"
                  :key="schedule.schedule_id"
                  :class="[
                    'mb-1 p-1 rounded text-xs cursor-pointer transition-all',
                    schedule.status === '停诊'
                      ? 'bg-red-500/10 text-red-600 line-through opacity-70'
                      : schedule.slot_type === '特需'
                      ? 'bg-orange-500/20 text-orange-600 hover:bg-orange-500/30'
                      : schedule.slot_type === '专家'
                      ? 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'
                      : 'bg-gray-500/20 text-gray-600 hover:bg-gray-500/30'
                  ]"
                  @click="openEditDialog(schedule)"
                  :title="`${schedule.clinic_name} - ${schedule.slot_type} - ¥${schedule.price}`"
                >
                  <div class="font-medium truncate">{{ schedule.slot_type }}</div>
                  <div class="text-[10px] opacity-80 truncate">{{ schedule.clinic_name.substring(0, 5) }}</div>
                  <div class="text-[10px]">¥{{ schedule.price }}</div>
                </div>
                <div v-if="getSchedulesByDateAndTime(date.dateStr, '下午').length === 0" class="text-xs text-muted-foreground/50 text-center py-4">
                  -
                </div>
              </div>
            </div>

            <!-- 晚上 -->
            <div class="grid grid-cols-8 gap-1 p-2">
              <div class="p-2 bg-accent/30 rounded font-medium text-sm flex items-center">
                <Moon class="w-4 h-4 mr-1 text-blue-500" />
                晚上
              </div>
              <div 
                v-for="date in currentWeekDates" 
                :key="`evening-${date.dateStr}`"
                class="p-1.5 border border-border rounded min-h-[70px] bg-background hover:bg-accent/30 transition-colors"
              >
                <div 
                  v-for="schedule in getSchedulesByDateAndTime(date.dateStr, '晚上')"
                  :key="schedule.schedule_id"
                  :class="[
                    'mb-1 p-1 rounded text-xs cursor-pointer transition-all',
                    schedule.status === '停诊'
                      ? 'bg-red-500/10 text-red-600 line-through opacity-70'
                      : schedule.slot_type === '特需'
                      ? 'bg-orange-500/20 text-orange-600 hover:bg-orange-500/30'
                      : schedule.slot_type === '专家'
                      ? 'bg-blue-500/20 text-blue-600 hover:bg-blue-500/30'
                      : 'bg-gray-500/20 text-gray-600 hover:bg-gray-500/30'
                  ]"
                  @click="openEditDialog(schedule)"
                  :title="`${schedule.clinic_name} - ${schedule.slot_type} - ¥${schedule.price}`"
                >
                  <div class="font-medium truncate">{{ schedule.slot_type }}</div>
                  <div class="text-[10px] opacity-80 truncate">{{ schedule.clinic_name.substring(0, 5) }}</div>
                  <div class="text-[10px]">¥{{ schedule.price }}</div>
                </div>
                <div v-if="getSchedulesByDateAndTime(date.dateStr, '晚上').length === 0" class="text-xs text-muted-foreground/50 text-center py-4">
                  -
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 图例和说明 -->
        <div class="flex items-center justify-between text-xs px-2">
          <div class="flex items-center gap-4 text-muted-foreground">
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 rounded bg-gray-500/20"></div>
              <span>普通</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 rounded bg-blue-500/20"></div>
              <span>专家</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 rounded bg-orange-500/20"></div>
              <span>特需</span>
            </div>
            <div class="flex items-center gap-1">
              <div class="w-3 h-3 rounded bg-red-500/10"></div>
              <span>停诊</span>
            </div>
          </div>
          <span class="text-muted-foreground">
            <span class="font-medium text-foreground">提示：</span>
            点击排班卡片可编辑 | 使用左右按钮切换周
          </span>
        </div>
      </div>

    <!-- 空状态 -->
    <div v-if="schedules.length === 0" class="text-center py-12 text-muted-foreground">
      <Calendar class="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>该医生暂无排班数据</p>
    </div>
  </div>

  <!-- 未选择医生 -->
  <div v-if="!selectedDoctor" class="text-center py-12 text-muted-foreground">
    <UserCircle class="w-12 h-12 mx-auto mb-2 opacity-50" />
    <p>请选择医生查看排班数据</p>
  </div>

  <!-- 排班对话框 -->
  <ScheduleDialog
    v-if="showScheduleDialog"
    :visible="showScheduleDialog"
    :schedule="editingSchedule"
    :doctor="selectedDoctor"
    :dept-id="deptId"
    :clinics="clinics"
    @close="showScheduleDialog = false"
    @success="handleScheduleSuccess"
  />
  </div>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { UserCircle, Plus, Calendar, Pencil, Trash2, List, CalendarDays, Sunrise, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import * as scheduleApi from '@/api/schedule'
import { useToast } from '@/utils/toast'
import ScheduleDialog from './ScheduleDialog.vue'

const props = defineProps({
  selectedDoctor: {
    type: Object,
    default: null
  },
  deptId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['schedule-updated'])

const toast = useToast()

const schedules = ref([])
const clinics = ref([])
const showScheduleDialog = ref(false)
const editingSchedule = ref(null)
const viewMode = ref('list') // 'list' 或 'calendar'
const currentWeekIndex = ref(0) // 当前显示的周索引（用于calendar视图）

// 列表视图的日期范围
const listStartDate = ref(new Date())
const listEndDate = ref(new Date())

// 获取所有日期并分组为周
const allCalendarDates = computed(() => {
  if (schedules.value.length === 0) return []
  
  // 获取所有排班日期并排序
  const allDates = [...new Set(schedules.value.map(s => s.date))].sort()
  
  return allDates.map(dateStr => {
    const date = new Date(dateStr)
    const weekDays = ['日', '一', '二', '三', '四', '五', '六']
    return {
      dateStr,
      day: `${date.getMonth() + 1}/${date.getDate()}`,
      weekDay: `周${weekDays[date.getDay()]}`
    }
  })
})

// 计算总周数（每周7天）
const totalWeeks = computed(() => {
  return Math.ceil(allCalendarDates.value.length / 7)
})

// 获取当前周的日期
const currentWeekDates = computed(() => {
  const start = currentWeekIndex.value * 7
  const end = start + 7
  return allCalendarDates.value.slice(start, end)
})

// 上一周
const previousWeek = () => {
  if (currentWeekIndex.value > 0) {
    currentWeekIndex.value--
  }
}

// 下一周
const nextWeek = () => {
  if (currentWeekIndex.value < totalWeeks.value - 1) {
    currentWeekIndex.value++
  }
}

// 判断是否是今天
const isToday = (dateStr) => {
  const today = new Date('2025-10-31')
  const todayStr = today.toISOString().split('T')[0]
  return dateStr === todayStr
}

// 根据日期和时段获取排班
const getSchedulesByDateAndTime = (date, timeSection) => {
  return schedules.value.filter(s => s.date === date && s.time_section === timeSection)
}

// 列表视图 - 初始化为本周
const initWeekList = () => {
  const now = new Date('2025-10-31')
  const day = now.getDay()
  const diff = now.getDate() - day + (day === 0 ? -6 : 1)
  listStartDate.value = new Date(now.setDate(diff))
  listStartDate.value.setHours(0, 0, 0, 0)
  
  listEndDate.value = new Date(listStartDate.value)
  listEndDate.value.setDate(listStartDate.value.getDate() + 6)
  listEndDate.value.setHours(23, 59, 59, 999)
}

// 列表视图 - 上一周
const previousWeekList = () => {
  listStartDate.value = new Date(listStartDate.value.setDate(listStartDate.value.getDate() - 7))
  listEndDate.value = new Date(listEndDate.value.setDate(listEndDate.value.getDate() - 7))
  loadSchedules()
}

// 列表视图 - 下一周
const nextWeekList = () => {
  listStartDate.value = new Date(listStartDate.value.setDate(listStartDate.value.getDate() + 7))
  listEndDate.value = new Date(listEndDate.value.setDate(listEndDate.value.getDate() + 7))
  loadSchedules()
}

// 格式化日期范围
const formatDateRange = (start, end) => {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日 - ${e.getMonth() + 1}月${e.getDate()}日`
}

// 切换视图时重置到第一周
watch(viewMode, (newMode) => {
  if (newMode === 'calendar') {
    currentWeekIndex.value = 0
  }
})

const loadSchedules = async () => {
  if (!props.selectedDoctor) {
    schedules.value = []
    return
  }

  try {
    // 列表视图使用listStartDate/listEndDate，月历视图使用固定的30天范围
    let startDate, endDate
    
    if (viewMode.value === 'list') {
      startDate = listStartDate.value.toISOString().split('T')[0]
      endDate = listEndDate.value.toISOString().split('T')[0]
    } else {
      // 月历视图获取30天数据
      const today = new Date('2025-10-31')
      const oneMonthLater = new Date(today)
      oneMonthLater.setMonth(today.getMonth() + 1)
      
      startDate = today.toISOString().split('T')[0]
      endDate = oneMonthLater.toISOString().split('T')[0]
    }

    // 使用医生排班接口
    const response = await scheduleApi.getDoctorSchedules(
      props.selectedDoctor.doctor_id,
      startDate,
      endDate
    )
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

const loadClinics = async () => {
  if (!props.deptId) return

  try {
    const response = await scheduleApi.getDepartmentClinics(props.deptId)
    if (response.data.code === 0) {
      clinics.value = response.data.message.clinics
    }
  } catch (error) {
    console.error('加载门诊列表失败:', error)
  }
}

const openAddDialog = () => {
  editingSchedule.value = null
  showScheduleDialog.value = true
}

const openEditDialog = (schedule) => {
  editingSchedule.value = { ...schedule }
  showScheduleDialog.value = true
}

const handleDelete = async (scheduleId) => {
  if (!confirm('确定要删除这条排班记录吗？')) return

  try {
    const response = await scheduleApi.deleteSchedule(scheduleId)
    if (response.data.code !== 0) {
      toast.error(response.data.message?.msg || '删除失败')
      return
    }
    toast.success('删除成功')
    loadSchedules()
    emit('schedule-updated') // 通知父组件刷新门诊数据
  } catch (error) {
    console.error('删除排班失败:', error)
    toast.error('删除失败')
  }
}

const handleScheduleSuccess = () => {
  showScheduleDialog.value = false
  loadSchedules()
  emit('schedule-updated') // 通知父组件刷新门诊数据
}

watch(() => props.selectedDoctor, (newDoctor) => {
  if (newDoctor) {
    loadSchedules()
  }
})

watch(() => props.deptId, () => {
  loadClinics()
}, { immediate: true })

// 初始化列表视图的周
initWeekList()
</script>
