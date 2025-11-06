<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div class="bg-card rounded-xl border border-border shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div class="bg-gradient-to-r from-muted/80 to-muted/50 border-b border-border p-6 flex items-center justify-between flex-shrink-0">
          <h3 class="text-xl font-semibold text-foreground">
            {{ schedule ? '修改排班' : '新增排班' }}
          </h3>
          <button
            @click="handleClose"
            class="p-2 hover:bg-accent/80 rounded-lg transition-all hover:scale-105"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <div class="p-6 space-y-4 overflow-y-auto flex-1">
          <!-- 医生信息 -->
          <div class="p-4 bg-accent/30 rounded-lg">
            <div class="text-sm text-muted-foreground">医生</div>
            <div class="font-semibold text-foreground">{{ doctor?.name }} - {{ doctor?.title }}</div>
          </div>

          <!-- 日期选择 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              日期 * <span class="text-xs text-muted-foreground">(最多只能排往后一个月)</span>
            </label>
            <input
              v-model="form.date"
              type="date"
              :min="minDate"
              :max="maxDate"
              class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <!-- 门诊选择 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">门诊 *</label>
            <select
              v-model="form.clinic_id"
              @change="handleClinicChange"
              class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option :value="null" disabled>请选择门诊</option>
              <option
                v-for="clinic in clinics"
                :key="clinic.clinic_id"
                :value="clinic.clinic_id"
              >
                {{ clinic.name }} ({{ getClinicTypeName(clinic.type) }})
              </option>
            </select>
          </div>

          <!-- 时段选择 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">时段 *</label>
            <select
              v-model="form.time_section"
              class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value="上午">上午</option>
              <option value="下午">下午</option>
              <option value="晚上">晚上</option>
            </select>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <!-- 类型选择 -->
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">类型 *</label>
              <select
                v-model="form.slot_type"
                :disabled="!form.clinic_id"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50"
              >
                <option
                  v-for="type in availableSlotTypes"
                  :key="type"
                  :value="type"
                >
                  {{ type }}
                </option>
              </select>
              <p v-if="selectedClinic?.type === 2" class="text-xs text-orange-600 mt-1">
                特需门诊只能选择特需类型
              </p>
            </div>

            <!-- 状态选择 -->
            <div>
              <label class="block text-sm font-medium text-foreground mb-2">状态 *</label>
              <select
                v-model="form.status"
                class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="正常">正常</option>
                <option value="停诊">停诊</option>
              </select>
            </div>
          </div>

          <!-- 价格设置 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">价格设置 *</label>
            <div class="space-y-2">
              <!-- 价格类型选择 -->
              <div class="flex items-center gap-4">
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    v-model="priceMode"
                    value="default"
                    class="w-4 h-4 text-primary focus:ring-0 focus:outline-none accent-primary cursor-pointer"
                  />
                  <span class="text-sm">使用门诊默认价格</span>
                </label>
                <label class="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    v-model="priceMode"
                    value="custom"
                    class="w-4 h-4 text-primary focus:ring-0 focus:outline-none accent-primary cursor-pointer"
                  />
                  <span class="text-sm">自定义价格</span>
                </label>
              </div>

              <!-- 默认价格提示 -->
              <div v-if="priceMode === 'default'" class="p-2 bg-blue-500/10 border border-blue-500/20 rounded text-xs text-blue-600">
                <span v-if="getDefaultPrice()">
                  将使用门诊默认价格: ¥{{ getDefaultPrice() }}
                </span>
                <span v-else class="text-orange-600">
                  该门诊尚未设置{{ form.slot_type }}类型的默认价格，将使用系统默认值
                </span>
              </div>

              <!-- 自定义价格输入 -->
              <div v-if="priceMode === 'custom'" class="grid grid-cols-2 gap-4">
                <div>
                  <input
                    v-model.number="form.price"
                    type="number"
                    min="1"
                    max="10000"
                    step="1"
                    class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                    placeholder="1-10000"
                  />
                </div>
                <div class="flex items-center text-xs text-muted-foreground">
                  范围: 1-10000 元
                </div>
              </div>
            </div>
          </div>

          <!-- 总号源数 -->
          <div>
            <label class="block text-sm font-medium text-foreground mb-2">
              总号源数 <span class="text-xs text-muted-foreground">(默认20)</span>
            </label>
            <input
              v-model.number="form.total_slots"
              type="number"
              min="0"
              max="100"
              class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
              placeholder="0-100"
            />
          </div>

          <!-- 提示信息 -->
          <div class="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-sm text-blue-600">
            <div class="font-medium mb-1">排班规则提示：</div>
            <ul class="list-disc list-inside space-y-1 text-xs">
              <li>特需门诊只能选择特需类型</li>
              <li>国疗和普通门诊可以选择普通或专家类型</li>
              <li>价格范围：1-10000元</li>
              <li>最多只能排往后一个月的班</li>
            </ul>
          </div>
        </div>

        <div class="bg-gradient-to-r from-muted/50 to-muted/30 border-t border-border p-6 flex justify-end gap-3 flex-shrink-0">
          <button
            @click="handleClose"
            class="px-5 py-2.5 bg-background/80 hover:bg-background border border-border text-foreground rounded-lg hover:shadow-md transition-all font-medium"
          >
            取消
          </button>
          <button
            @click="handleSubmit"
            :disabled="!isFormValid"
            class="px-5 py-2.5 bg-primary/90 hover:bg-primary text-primary-foreground rounded-lg hover:shadow-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
          >
            {{ schedule ? '保存' : '创建' }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'
import * as scheduleApi from '@/api/schedule'
import { useToast } from '@/utils/toast'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  schedule: {
    type: Object,
    default: null
  },
  doctor: {
    type: Object,
    required: true
  },
  deptId: {
    type: Number,
    required: true
  },
  clinics: {
    type: Array,
    default: () => []
  }
})

const emit = defineEmits(['close', 'success'])
const toast = useToast()

const priceMode = ref('default') // 'default' 或 'custom'
const form = ref({
  date: '',
  clinic_id: null,
  time_section: '上午',
  slot_type: '普通',
  status: '正常',
  price: 50,
  total_slots: 20
})

// 日期限制
const minDate = computed(() => {
  const today = new Date()
  return today.toISOString().split('T')[0]
})

const maxDate = computed(() => {
  const today = new Date()
  const oneMonthLater = new Date(today)
  oneMonthLater.setMonth(today.getMonth() + 1)
  return oneMonthLater.toISOString().split('T')[0]
})

// 选中的门诊
const selectedClinic = computed(() => {
  return props.clinics.find(c => c.clinic_id === form.value.clinic_id)
})

// 可用的类型选项
const availableSlotTypes = computed(() => {
  if (!selectedClinic.value) return ['普通', '专家', '特需']
  
  if (selectedClinic.value.type === 2) {
    // 特需门诊只能是特需
    return ['特需']
  } else {
    // 普通和国疗可以是普通或专家
    return ['普通', '专家']
  }
})

const getClinicTypeName = (type) => {
  const map = { 0: '普通', 1: '国疗', 2: '特需' }
  return map[type] || '未知'
}

const handleClinicChange = () => {
  // 当切换门诊时，自动调整类型
  if (selectedClinic.value) {
    if (selectedClinic.value.type === 2) {
      form.value.slot_type = '特需'
    } else {
      form.value.slot_type = '普通'
    }
    // 更新价格（如果是自定义模式）
    updatePriceForSlotType()
  }
}

// 获取门诊默认价格
const getDefaultPrice = () => {
  if (!selectedClinic.value) return null
  
  const priceMap = {
    '普通': selectedClinic.value.default_price_normal,
    '专家': selectedClinic.value.default_price_expert,
    '特需': selectedClinic.value.default_price_special
  }
  
  return priceMap[form.value.slot_type]
}

// 根据类型更新价格
const updatePriceForSlotType = () => {
  if (priceMode.value === 'custom') {
    // 自定义模式：设置建议价格
    if (selectedClinic.value?.type === 2) {
      form.value.price = 500
    } else if (form.value.slot_type === '专家') {
      form.value.price = 100
    } else {
      form.value.price = 50
    }
  }
}

// 监听类型变化
watch(() => form.value.slot_type, () => {
  updatePriceForSlotType()
})

const isFormValid = computed(() => {
  const baseValid = (
    form.value.date &&
    form.value.clinic_id &&
    form.value.time_section &&
    form.value.slot_type &&
    form.value.status &&
    form.value.total_slots >= 0
  )
  
  // 如果是自定义价格模式，需要验证价格
  if (priceMode.value === 'custom') {
    return baseValid && form.value.price > 0 && form.value.price <= 10000
  }
  
  return baseValid
})

const handleClose = () => {
  emit('close')
}

const handleSubmit = async () => {
  if (!isFormValid.value) return

  try {
    const data = {
      doctor_id: props.doctor.doctor_id,
      clinic_id: form.value.clinic_id,
      schedule_date: form.value.date,
      time_section: form.value.time_section,
      slot_type: form.value.slot_type,
      status: form.value.status,
      price: priceMode.value === 'default' ? 0 : form.value.price, // 使用默认价格时发送0
      total_slots: form.value.total_slots
    }

    let response
    if (props.schedule) {
      // 编辑 - 后端更新接口接受 schedule_date 字段
      response = await scheduleApi.updateSchedule(props.schedule.schedule_id, data)
    } else {
      // 新增
      response = await scheduleApi.createSchedule(data)
    }

    if (response.data.code !== 0) {
      toast.error(response.data.message?.msg || '操作失败')
      return
    }

    toast.success(props.schedule ? '排班更新成功' : '排班创建成功')
    emit('success')
  } catch (error) {
    console.error('提交排班失败:', error)
    toast.error(props.schedule ? '更新失败' : '创建失败')
  }
}

// 初始化表单
watch(() => props.visible, (visible) => {
  if (visible) {
    if (props.schedule) {
      // 编辑模式
      form.value = {
        date: props.schedule.date,
        clinic_id: props.schedule.clinic_id,
        time_section: props.schedule.time_section,
        slot_type: props.schedule.slot_type,
        status: props.schedule.status,
        price: props.schedule.price,
        total_slots: props.schedule.total_slots
      }
      // 判断是否使用默认价格（编辑时如果价格为0则认为是默认价格）
      priceMode.value = props.schedule.price === 0 ? 'default' : 'custom'
    } else {
      // 新增模式 - 重置表单
      const today = new Date()
      form.value = {
        date: today.toISOString().split('T')[0],
        clinic_id: null,
        time_section: '上午',
        slot_type: '普通',
        status: '正常',
        price: 50,
        total_slots: 20
      }
      priceMode.value = 'default' // 默认使用门诊默认价格
    }
  }
}, { immediate: true })
</script>
