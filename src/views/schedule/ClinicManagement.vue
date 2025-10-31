<template>
  <div class="bg-card rounded-lg border border-border p-4 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h3 class="text-lg font-semibold text-foreground flex items-center gap-2">
        <Hospital class="w-5 h-5 text-primary" />
        门诊管理
      </h3>
      <div class="flex items-center gap-2">
        <!-- 周导航 -->
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
        <button
          @click="showAddClinicDialog = true"
          class="flex items-center gap-2 px-3 py-2 bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 hover:border-primary/50 transition-colors text-sm shadow-sm font-medium ml-2"
        >
          <Plus class="w-4 h-4" />
          新增门诊
        </button>
      </div>
    </div>

    <div v-if="clinics.length > 0" class="space-y-3">
      <div
        v-for="clinic in clinics"
        :key="clinic.clinic_id"
        class="border border-border rounded-lg overflow-hidden"
      >
        <!-- 门诊头部 - 可点击展开 -->
        <div 
          @click="toggleClinic(clinic.clinic_id)"
          class="flex items-center justify-between p-3 bg-accent/30 cursor-pointer hover:bg-accent/50 transition-colors"
        >
          <div class="flex items-center gap-3 flex-1">
            <button class="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight 
                :class="['w-4 h-4 transition-transform', expandedClinics[clinic.clinic_id] ? 'rotate-90' : '']"
              />
            </button>
            <div class="flex-1">
              <div class="flex items-center gap-2">
                <h4 class="font-semibold text-foreground">{{ clinic.name }}</h4>
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-xs font-medium',
                    clinic.clinic_type === 0
                      ? 'bg-blue-500/10 text-blue-600'
                      : clinic.clinic_type === 1
                      ? 'bg-purple-500/10 text-purple-600'
                      : 'bg-orange-500/10 text-orange-600'
                  ]"
                >
                  {{ getClinicTypeName(clinic.clinic_type) }}
                </span>
                <span class="text-xs text-muted-foreground">
                  ({{ clinicSchedules[clinic.clinic_id]?.length || 0 }} 条排班)
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-0.5">{{ clinic.address || '未设置地址' }}</p>
            </div>
          </div>
        </div>

        <!-- 门诊排班表 - 可展开 -->
        <div v-show="expandedClinics[clinic.clinic_id]" class="p-3 border-t border-border bg-card">
          <div v-if="clinicSchedules[clinic.clinic_id]?.length > 0" class="overflow-x-auto">
            <table class="w-full text-xs">
              <thead>
                <tr class="border-b border-border">
                  <th class="text-left p-2 font-semibold text-muted-foreground">日期</th>
                  <th class="text-left p-2 font-semibold text-muted-foreground">星期</th>
                  <th class="text-left p-2 font-semibold text-muted-foreground">时段</th>
                  <th class="text-left p-2 font-semibold text-muted-foreground">医生</th>
                  <th class="text-left p-2 font-semibold text-muted-foreground">类型</th>
                  <th class="text-left p-2 font-semibold text-muted-foreground">价格</th>
                  <th class="text-left p-2 font-semibold text-muted-foreground">状态</th>
                  <th class="text-left p-2 font-semibold text-muted-foreground">剩余/总数</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="schedule in clinicSchedules[clinic.clinic_id]"
                  :key="schedule.schedule_id"
                  class="border-b border-border hover:bg-accent/30 transition-colors"
                >
                  <td class="p-2">{{ schedule.date }}</td>
                  <td class="p-2">星期{{ schedule.week_day }}</td>
                  <td class="p-2">{{ schedule.time_section }}</td>
                  <td class="p-2 font-medium">{{ schedule.doctor_name }}</td>
                  <td class="p-2">
                    <span
                      :class="[
                        'px-1.5 py-0.5 rounded text-xs',
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
                        'px-1.5 py-0.5 rounded text-xs',
                        schedule.status === '正常'
                          ? 'bg-green-500/10 text-green-600'
                          : 'bg-red-500/10 text-red-600'
                      ]"
                    >
                      {{ schedule.status }}
                    </span>
                  </td>
                  <td class="p-2">{{ schedule.remaining_slots }}/{{ schedule.total_slots }}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div v-else class="text-sm text-muted-foreground py-4 text-center">
            暂无排班数据
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center py-12 text-muted-foreground">
      <Hospital class="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>{{ deptId ? '暂无门诊数据' : '请先选择科室' }}</p>
    </div>

    <!-- 新增门诊对话框 -->
    <Teleport to="body">
      <div
        v-if="showAddClinicDialog"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-lg border border-border shadow-2xl max-w-md w-full">
          <div class="p-6 border-b border-border flex items-center justify-between bg-muted/30">
            <h3 class="text-xl font-semibold text-foreground">新增门诊</h3>
            <button
              @click="showAddClinicDialog = false"
              class="p-2 hover:bg-accent rounded-md transition-colors"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">门诊名称 *</label>
              <input
                v-model="clinicForm.name"
                type="text"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入门诊名称"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">门诊类型 *</label>
              <select
                v-model="clinicForm.clinic_type"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option :value="0">普通</option>
                <option :value="1">国疗</option>
                <option :value="2">特需</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">门诊地址</label>
              <input
                v-model="clinicForm.address"
                type="text"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入门诊地址"
              />
            </div>
          </div>

          <div class="p-6 border-t border-border flex justify-end gap-3 bg-muted/20">
            <button
              @click="showAddClinicDialog = false"
              class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium shadow-sm"
            >
              取消
            </button>
            <button
              @click="handleAddClinic"
              :disabled="!clinicForm.name || clinicForm.clinic_type === null"
              class="px-4 py-2 bg-primary/10 text-primary border border-primary/30 rounded-md hover:bg-primary/20 hover:border-primary/50 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { Hospital, Plus, X, ChevronRight, ChevronLeft } from 'lucide-vue-next'
import * as scheduleApi from '@/api/schedule'
import { useToast } from '@/utils/toast'

const props = defineProps({
  deptId: {
    type: Number,
    default: null
  }
})

const toast = useToast()

const clinics = ref([])
const clinicSchedules = ref({})
const expandedClinics = ref({}) // 展开状态
const startDate = ref(new Date())
const endDate = ref(new Date())
const showAddClinicDialog = ref(false)
const clinicForm = ref({
  name: '',
  clinic_type: 0,
  address: ''
})

// 切换门诊展开/折叠
const toggleClinic = (clinicId) => {
  expandedClinics.value[clinicId] = !expandedClinics.value[clinicId]
}

const getClinicTypeName = (type) => {
  const map = { 0: '普通', 1: '国疗', 2: '特需' }
  return map[type] || '未知'
}

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
  loadAllClinicSchedules()
}

const nextWeek = () => {
  startDate.value = new Date(startDate.value.setDate(startDate.value.getDate() + 7))
  endDate.value = new Date(endDate.value.setDate(endDate.value.getDate() + 7))
  loadAllClinicSchedules()
}

const formatDateRange = (start, end) => {
  const s = new Date(start)
  const e = new Date(end)
  return `${s.getFullYear()}年${s.getMonth() + 1}月${s.getDate()}日 - ${e.getMonth() + 1}月${e.getDate()}日`
}

const loadClinics = async () => {
  if (!props.deptId) {
    clinics.value = []
    clinicSchedules.value = {}
    return
  }

  try {
    const response = await scheduleApi.getDepartmentClinics(props.deptId)
    if (response.data.code !== 0) {
      toast.error(response.data.message?.msg || '加载门诊列表失败')
      return
    }
    clinics.value = response.data.message.clinics
    
    // 只有当门诊列表不为空时才加载排班数据
    if (clinics.value.length > 0) {
      loadAllClinicSchedules()
    }
  } catch (error) {
    console.error('加载门诊列表失败:', error)
    toast.error('加载门诊列表失败')
  }
}

const loadAllClinicSchedules = async () => {
  if (clinics.value.length === 0) return

  const start = startDate.value.toISOString().split('T')[0]
  const end = endDate.value.toISOString().split('T')[0]

  // 使用门诊排班接口为每个门诊获取数据
  for (const clinic of clinics.value) {
    try {
      const response = await scheduleApi.getClinicSchedules(clinic.clinic_id, start, end)
      if (response.data.code === 0) {
        clinicSchedules.value[clinic.clinic_id] = response.data.message.schedules
      }
    } catch (error) {
      console.error(`加载门诊 ${clinic.clinic_id} 排班数据失败:`, error)
    }
  }
}

// 刷新门诊排班数据（用于其他页面添加排班后刷新）
const refreshClinicSchedules = () => {
  loadAllClinicSchedules()
}

// 暴露方法给父组件调用
defineExpose({
  refreshClinicSchedules
})

const handleAddClinic = async () => {
  if (!props.deptId) {
    toast.error('请先选择科室')
    return
  }

  try {
    const data = {
      ...clinicForm.value,
      minor_dept_id: props.deptId
    }
    
    const response = await scheduleApi.createClinic(data)
    if (response.data.code !== 0) {
      toast.error(response.data.message?.msg || '创建门诊失败')
      return
    }

    toast.success('门诊创建成功')
    showAddClinicDialog.value = false
    clinicForm.value = { name: '', clinic_type: 0, address: '' }
    loadClinics()
  } catch (error) {
    console.error('创建门诊失败:', error)
    toast.error('创建门诊失败')
  }
}

watch(() => props.deptId, () => {
  loadClinics()
}, { immediate: true })

// 初始化周
initWeek()
</script>
