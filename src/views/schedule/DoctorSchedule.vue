<template>
  <div class="bg-card rounded-lg border border-border p-4 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
        <UserCircle class="w-5 h-5 text-primary" />
        医生排班数据
        <span v-if="selectedDoctor" class="text-primary">- {{ selectedDoctor.name }}</span>
      </h3>
      <div v-if="selectedDoctor" class="flex items-center gap-2">
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
      <div v-if="schedules.length > 0" class="overflow-x-auto">
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

      <div v-else class="text-center py-12 text-muted-foreground">
        <Calendar class="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>该医生暂无排班数据</p>
      </div>
    </div>

    <div v-else class="text-center py-12 text-muted-foreground">
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
import { ref, watch } from 'vue'
import { UserCircle, Plus, Calendar, Pencil, Trash2 } from 'lucide-vue-next'
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

const loadSchedules = async () => {
  if (!props.selectedDoctor) {
    schedules.value = []
    return
  }

  try {
    const today = new Date('2025-10-31') // 使用固定日期
    const oneMonthLater = new Date(today)
    oneMonthLater.setMonth(today.getMonth() + 1)

    const startDate = today.toISOString().split('T')[0]
    const endDate = oneMonthLater.toISOString().split('T')[0]

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

watch(() => props.selectedDoctor, () => {
  loadSchedules()
}, { immediate: true })

watch(() => props.deptId, () => {
  loadClinics()
}, { immediate: true })
</script>
