<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-start justify-center bg-black bg-opacity-50 p-4 pt-20 overflow-y-auto"
    @click.self="handleClose"
  >
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full overflow-y-auto">
      <!-- 标题栏 -->
      <div class="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
          管理员加号
        </h3>
        <button
          @click="handleClose"
          class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- 内容区域 -->
      <div class="px-6 py-4">
        <form @submit.prevent="handleSubmit" class="space-y-4">
          <!-- 选择医生 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              医生 <span class="text-red-500">*</span>
            </label>
            <button
              type="button"
              @click="openDoctorSelector"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-left
                     hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div v-if="selectedDoctor" class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-900 dark:text-white font-medium">
                    {{ selectedDoctor.name }}
                  </div>
                  <div class="text-xs text-gray-600 dark:text-gray-400">
                    {{ selectedDoctor.department_name }} · {{ selectedDoctor.title }}
                  </div>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div v-else class="flex items-center justify-between text-gray-500">
                <span class="text-sm">点击选择医生</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          <!-- 选择排班 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              门诊排班 <span class="text-red-500">*</span>
            </label>
            <div v-if="!formData.doctor_id" class="text-sm text-gray-500 dark:text-gray-400 italic">
              请先选择医生
            </div>
            <div v-else-if="isLoadingSchedules" class="text-center py-3 text-gray-500">
              <div class="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div>
            </div>
            <div v-else-if="schedules.length === 0" class="text-sm text-gray-500 dark:text-gray-400 italic">
              该医生今日无排班
            </div>
            <select
              v-else
              v-model="formData.schedule_id"
              @change="handleScheduleChange"
              class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option :value="null">请选择排班</option>
              <option v-for="schedule in schedules" :key="schedule.schedule_id" :value="schedule.schedule_id">
                {{ schedule.clinic_name }} - {{ getClinicTypeText(schedule.clinic_type) }} - {{ schedule.time_section }}
                (余号: {{ schedule.remaining_slots }}/{{ schedule.total_slots }})
              </option>
            </select>
            <div v-if="selectedSchedule" class="mt-2 p-2 bg-gray-50 dark:bg-gray-750 rounded text-xs">
              <span class="text-gray-600 dark:text-gray-400">门诊类型: </span>
              <span 
                class="px-2 py-0.5 rounded-full text-xs font-medium"
                :class="getClinicTypeClass(selectedSchedule.clinic_type)"
              >
                {{ getClinicTypeText(selectedSchedule.clinic_type) }}
              </span>
            </div>
          </div>

          <!-- 选择号源类型 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              号源类型 <span class="text-red-500">*</span>
            </label>
            <div v-if="!selectedSchedule" class="text-sm text-gray-500 dark:text-gray-400 italic">
              请先选择排班
            </div>
            <div v-else class="grid grid-cols-3 gap-2">
              <button
                v-for="slotType in availableSlotTypes"
                :key="slotType"
                type="button"
                @click="formData.slot_type = slotType"
                class="px-4 py-2 border rounded-md text-sm transition-colors
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
                :class="formData.slot_type === slotType 
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 font-medium'
                  : 'border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300'"
              >
                {{ slotType }}
              </button>
            </div>
          </div>

          <!-- 选择患者 -->
          <div>
            <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              患者 <span class="text-red-500">*</span>
            </label>
            <button
              type="button"
              @click="openPatientSelector"
              class="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     bg-white dark:bg-gray-700 text-left
                     hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors
                     focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <div v-if="selectedPatient" class="flex items-center justify-between">
                <div>
                  <div class="text-sm text-gray-900 dark:text-white font-medium">
                    {{ selectedPatient.name }}
                  </div>
                  <div class="text-xs text-gray-600 dark:text-gray-400">
                    {{ selectedPatient.phone }} · {{ selectedPatient.gender }} · {{ selectedPatient.age }}岁
                  </div>
                </div>
                <svg class="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
              <div v-else class="flex items-center justify-between text-gray-500">
                <span class="text-sm">点击选择患者</span>
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </button>
          </div>

          <!-- 提交按钮 -->
          <div class="flex justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              @click="handleClose"
              class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                     text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                     transition-colors"
            >
              取消
            </button>
            <button
              type="submit"
              :disabled="!canSubmit || isSubmitting"
              class="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md 
                     disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {{ isSubmitting ? '创建中...' : '确认加号' }}
            </button>
          </div>
        </form>
      </div>
    </div>

    <!-- 医生选择器 -->
    <DoctorSelectorDialog
      :is-open="doctorSelectorOpen"
      :selected-id="formData.doctor_id"
      :doctors="props.doctors"
      :is-loading="props.isLoadingData"
      @close="doctorSelectorOpen = false"
      @select="handleDoctorSelect"
    />

    <!-- 患者选择器 -->
    <PatientSelectorDialog
      :is-open="patientSelectorOpen"
      :selected-id="formData.patient_id"
      :patients="props.patients"
      :is-loading="props.isLoadingData"
      @close="patientSelectorOpen = false"
      @select="handlePatientSelect"
    />
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { getDoctorSchedulesToday, createAdminAddSlot } from '@/api/addslot'
import { useToast } from '@/utils/toast'
import DoctorSelectorDialog from './DoctorSelectorDialog.vue'
import PatientSelectorDialog from './PatientSelectorDialog.vue'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  doctors: {
    type: Array,
    default: () => []
  },
  patients: {
    type: Array,
    default: () => []
  },
  isLoadingData: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'success'])
const { success, error } = useToast()

const schedules = ref([])
const isLoadingSchedules = ref(false)
const isSubmitting = ref(false)
const doctorSelectorOpen = ref(false)
const patientSelectorOpen = ref(false)

const selectedDoctor = ref(null)
const selectedPatient = ref(null)
const selectedSchedule = ref(null)

const formData = reactive({
  doctor_id: null,
  schedule_id: null,
  slot_type: '',
  patient_id: null
})

const availableSlotTypes = computed(() => {
  return selectedSchedule.value?.available_slot_types || []
})

const canSubmit = computed(() => {
  return formData.doctor_id && formData.schedule_id && formData.slot_type && formData.patient_id
})

// 监听医生选择，自动加载排班
watch(() => formData.doctor_id, (newVal) => {
  if (newVal) {
    loadDoctorSchedules(newVal)
  } else {
    schedules.value = []
  }
  formData.schedule_id = null
  formData.slot_type = ''
  selectedSchedule.value = null
})

// 打开医生选择器
const openDoctorSelector = () => {
  doctorSelectorOpen.value = true
}

// 打开患者选择器
const openPatientSelector = () => {
  patientSelectorOpen.value = true
}

// 处理医生选择
const handleDoctorSelect = (doctor) => {
  selectedDoctor.value = doctor
  formData.doctor_id = doctor.doctor_id
}

// 处理患者选择
const handlePatientSelect = (patient) => {
  selectedPatient.value = patient
  formData.patient_id = patient.patient_id
}

// 处理排班选择变化
const handleScheduleChange = () => {
  if (formData.schedule_id) {
    selectedSchedule.value = schedules.value.find(s => s.schedule_id === formData.schedule_id)
    formData.slot_type = '' // 重置号源类型
  } else {
    selectedSchedule.value = null
    formData.slot_type = ''
  }
}

// 加载医生排班
const loadDoctorSchedules = async (doctorId) => {
  isLoadingSchedules.value = true
  try {
    const response = await getDoctorSchedulesToday(doctorId)
    if (response.code === 0) {
      schedules.value = response.message.schedules || []
    } else {
      schedules.value = []
      error(response.message || '加载排班失败')
    }
  } catch (err) {
    console.error('Load schedules error:', err)
    error('加载排班失败')
    schedules.value = []
  } finally {
    isLoadingSchedules.value = false
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!canSubmit.value || isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const response = await createAdminAddSlot({
      schedule_id: formData.schedule_id,
      patient_id: formData.patient_id,
      slot_type: formData.slot_type,
      reason: "管理员直接加号"
    })
    
    if (response.code === 0) {
      success(`加号成功！订单ID：${response.message.order_id}`)
      emit('success', response.message)
      handleClose()
    } else {
      error(response.message || '加号失败')
    }
  } catch (err) {
    console.error('Submit error:', err)
    error(err.response?.data?.message || '加号失败')
  } finally {
    isSubmitting.value = false
  }
}

// 关闭对话框
const handleClose = () => {
  // 重置表单
  formData.doctor_id = null
  formData.schedule_id = null
  formData.slot_type = ''
  formData.patient_id = null
  selectedDoctor.value = null
  selectedPatient.value = null
  selectedSchedule.value = null
  schedules.value = []
  
  emit('close')
}

// 获取门诊类型样式
const getClinicTypeClass = (type) => {
  const classMap = {
    0: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300',
    1: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300',
    2: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  }
  return classMap[type] || 'bg-gray-100 text-gray-800'
}

// 获取门诊类型文本
const getClinicTypeText = (type) => {
  const textMap = {
    0: '普通门诊',
    1: '专家门诊',
    2: '特需门诊'
  }
  return textMap[type] || '未知'
}
</script>
