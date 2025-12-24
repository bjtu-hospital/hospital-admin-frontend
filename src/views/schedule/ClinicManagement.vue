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
          class="flex items-center justify-between p-3 bg-accent/30"
        >
          <div 
            @click="toggleClinic(clinic.clinic_id)"
            class="flex items-center gap-3 flex-1 cursor-pointer hover:bg-accent/50 transition-colors -m-3 p-3"
          >
            <button class="text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight 
                :class="['w-4 h-4 transition-transform', expandedClinics[clinic.clinic_id] ? 'rotate-90' : '']"
              />
            </button>
            <div class="flex-1">
              <div class="flex items-center gap-2 flex-wrap">
                <h4 class="font-semibold text-foreground">{{ clinic.name }}</h4>
                <span
                  :class="[
                    'px-2 py-0.5 rounded text-xs font-medium',
                    (clinic.type ?? clinic.clinic_type) === 0
                      ? 'bg-blue-500/10 text-blue-600'
                      : (clinic.type ?? clinic.clinic_type) === 1
                      ? 'bg-purple-500/10 text-purple-600'
                      : 'bg-orange-500/10 text-orange-600'
                  ]"
                >
                  {{ getClinicTypeName(clinic.type ?? clinic.clinic_type) }}
                </span>
                <span class="text-xs text-muted-foreground">
                  ({{ clinicSchedules[clinic.clinic_id]?.length || 0 }} 条排班)
                </span>
              </div>
              <div class="flex items-center gap-3 mt-1 flex-wrap">
                <p class="text-xs text-muted-foreground">{{ clinic.address || '未设置地址' }}</p>
                <!-- 显示默认价格 -->
                <div v-if="hasDefaultPrice(clinic)" class="flex items-center gap-2 text-xs">
                  <span class="text-muted-foreground">默认价格:</span>
                  <span v-if="clinic.default_price_normal" class="text-blue-600 font-medium">
                    普通 ¥{{ clinic.default_price_normal }}
                  </span>
                  <span v-if="clinic.default_price_expert" class="text-blue-600 font-medium">
                    专家 ¥{{ clinic.default_price_expert }}
                  </span>
                  <span v-if="clinic.default_price_special" class="text-orange-600 font-medium">
                    特需 ¥{{ clinic.default_price_special }}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            @click="openEditClinicDialog(clinic)"
            class="p-2 hover:bg-accent rounded-md transition-colors"
            title="编辑门诊"
          >
            <Pencil class="w-4 h-4 text-muted-foreground hover:text-foreground" />
          </button>
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
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-xl border border-border shadow-2xl max-w-md w-full overflow-hidden flex flex-col">
          <div class="bg-gradient-to-r from-muted/80 to-muted/50 p-6 border-b border-border flex items-center justify-between flex-shrink-0">
            <h3 class="text-xl font-semibold text-foreground">新增门诊</h3>
            <button
              @click="showAddClinicDialog = false"
              class="p-2 hover:bg-accent/80 rounded-lg transition-all hover:scale-105"
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

          <div class="bg-gradient-to-r from-muted/50 to-muted/30 p-6 border-t border-border flex justify-end gap-3 flex-shrink-0">
            <button
              @click="showAddClinicDialog = false"
              class="px-5 py-2.5 bg-background/80 hover:bg-background border border-border text-foreground rounded-lg hover:shadow-md transition-all font-medium"
            >
              取消
            </button>
            <button
              @click="handleAddClinic"
              :disabled="!clinicForm.name || clinicForm.clinic_type === null"
              class="px-5 py-2.5 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              确认
            </button>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- 编辑门诊对话框 -->
    <Teleport to="body">
      <div
        v-if="showEditClinicDialog"
        class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
      >
        <div class="bg-card rounded-xl border border-border shadow-2xl max-w-lg w-full max-h-[90vh] overflow-hidden flex flex-col">
          <div class="bg-gradient-to-r from-muted/80 to-muted/50 p-6 border-b border-border flex items-center justify-between flex-shrink-0">
            <h3 class="text-xl font-semibold text-foreground">编辑门诊</h3>
            <button
              @click="closeEditClinicDialog"
              class="p-2 hover:bg-accent/80 rounded-lg transition-all hover:scale-105"
            >
              <X class="w-5 h-5" />
            </button>
          </div>

          <div class="p-6 space-y-4 overflow-y-auto flex-1">
            <!-- 基本信息 -->
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">门诊名称 *</label>
              <input
                v-model="editClinicForm.name"
                type="text"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入门诊名称"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">门诊类型</label>
              <div class="px-3 py-2 bg-muted/50 border border-border rounded-md text-foreground">
                <span
                  :class="[
                    'px-2 py-1 rounded text-sm font-medium',
                    editClinicForm.clinic_type === 0
                      ? 'bg-blue-500/10 text-blue-600'
                      : editClinicForm.clinic_type === 1
                      ? 'bg-purple-500/10 text-purple-600'
                      : 'bg-orange-500/10 text-orange-600'
                  ]"
                >
                  {{ getClinicTypeName(editClinicForm.clinic_type) }}
                </span>
              </div>
              <p class="text-xs text-muted-foreground mt-1">
                门诊类型创建后不可修改
              </p>
            </div>

            <div>
              <label class="block text-sm font-medium text-foreground mb-2">门诊地址</label>
              <input
                v-model="editClinicForm.address"
                type="text"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入门诊地址"
              />
            </div>

            <!-- 默认价格设置 -->
            <div class="border-t border-border pt-4 mt-4">
              <h4 class="text-sm font-semibold text-foreground mb-3">默认价格设置</h4>
              <p class="text-xs text-muted-foreground mb-3">
                设置该门诊不同类型号源的默认价格，创建排班时可以选择使用默认价格。留空表示不设置默认价格。
              </p>

              <div class="space-y-3">
                <!-- 普通号默认价格 -->
                <div v-if="editClinicForm.clinic_type !== 2">
                  <label class="block text-sm font-medium text-foreground mb-2">
                    普通号默认价格 (元)
                  </label>
                  <input
                    v-model.number="editClinicForm.default_price_normal"
                    type="number"
                    min="0"
                    max="10000"
                    step="1"
                    class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="留空表示不设置"
                  />
                </div>

                <!-- 专家号默认价格 -->
                <div v-if="editClinicForm.clinic_type !== 2">
                  <label class="block text-sm font-medium text-foreground mb-2">
                    专家号默认价格 (元)
                  </label>
                  <input
                    v-model.number="editClinicForm.default_price_expert"
                    type="number"
                    min="0"
                    max="10000"
                    step="1"
                    class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="留空表示不设置"
                  />
                </div>

                <!-- 特需号默认价格 -->
                <div v-if="editClinicForm.clinic_type === 2">
                  <label class="block text-sm font-medium text-foreground mb-2">
                    特需号默认价格 (元)
                  </label>
                  <input
                    v-model.number="editClinicForm.default_price_special"
                    type="number"
                    min="0"
                    max="10000"
                    step="1"
                    class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="留空表示不设置"
                  />
                </div>
              </div>

              <div class="mt-3 p-3 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-600">
                <div class="font-medium mb-1">价格说明：</div>
                <ul class="list-disc list-inside space-y-1">
                  <li>设置默认价格后，创建排班时可选择使用门诊默认价格</li>
                  <li>普通和国疗门诊可设置普通号和专家号价格</li>
                  <li>特需门诊只能设置特需号价格</li>
                </ul>
              </div>
            </div>
          </div>

          <div class="bg-gradient-to-r from-muted/50 to-muted/30 p-6 border-t border-border flex justify-end gap-3 flex-shrink-0">
            <button
              @click="closeEditClinicDialog"
              class="px-5 py-2.5 bg-background/80 hover:bg-background border border-border text-foreground rounded-lg hover:shadow-md transition-all font-medium"
            >
              取消
            </button>
            <button
              @click="handleUpdateClinic"
              :disabled="!editClinicForm.name"
              class="px-5 py-2.5 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              保存
            </button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, watch, computed, onMounted } from 'vue'
import { Hospital, Plus, X, ChevronRight, ChevronLeft, Pencil } from 'lucide-vue-next'
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
const showEditClinicDialog = ref(false)
const clinicForm = ref({
  name: '',
  clinic_type: 0,
  address: ''
})
const editClinicForm = ref({
  clinic_id: null,
  name: '',
  address: '',
  clinic_type: 0,
  default_price_normal: null,
  default_price_expert: null,
  default_price_special: null
})

// 切换门诊展开/折叠
const toggleClinic = (clinicId) => {
  expandedClinics.value[clinicId] = !expandedClinics.value[clinicId]
}

// 检查门诊是否有设置默认价格
const hasDefaultPrice = (clinic) => {
  return clinic.default_price_normal || clinic.default_price_expert || clinic.default_price_special
}

const getClinicTypeName = (type) => {
  const map = { 0: '普通', 1: '国疗', 2: '特需' }
  return map[type] || '未知'
}

// 初始化为本周（从当前日期所在的周开始）
const initWeek = () => {
  // 使用当前日期作为基准日期
  const now = new Date()
  const day = now.getDay()
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

// 打开编辑门诊对话框
const openEditClinicDialog = (clinic) => {
  // 兼容 type 和 clinic_type 字段
  const clinicType = clinic.type ?? clinic.clinic_type
  
  editClinicForm.value = {
    clinic_id: clinic.clinic_id,
    name: clinic.name,
    address: clinic.address || '',
    clinic_type: clinicType,
    default_price_normal: clinic.default_price_normal || null,
    default_price_expert: clinic.default_price_expert || null,
    default_price_special: clinic.default_price_special || null
  }
  showEditClinicDialog.value = true
}

// 关闭编辑门诊对话框
const closeEditClinicDialog = () => {
  showEditClinicDialog.value = false
  editClinicForm.value = {
    clinic_id: null,
    name: '',
    address: '',
    clinic_type: 0,
    default_price_normal: null,
    default_price_expert: null,
    default_price_special: null
  }
}

// 更新门诊信息
const handleUpdateClinic = async () => {
  if (!editClinicForm.value.name) {
    toast.error('请输入门诊名称')
    return
  }

  try {
    const data = {
      name: editClinicForm.value.name,
      address: editClinicForm.value.address || undefined,
      default_price_normal: editClinicForm.value.default_price_normal || undefined,
      default_price_expert: editClinicForm.value.default_price_expert || undefined,
      default_price_special: editClinicForm.value.default_price_special || undefined
    }
    
    const response = await scheduleApi.updateClinic(editClinicForm.value.clinic_id, data)
    if (response.data.code !== 0) {
      toast.error(response.data.message?.msg || '更新门诊失败')
      return
    }

    toast.success('门诊信息更新成功')
    closeEditClinicDialog()
    loadClinics()
  } catch (error) {
    console.error('更新门诊失败:', error)
    toast.error('更新门诊失败')
  }
}

watch(() => props.deptId, () => {
  loadClinics()
}, { immediate: true })

// 初始化周
initWeek()
</script>
