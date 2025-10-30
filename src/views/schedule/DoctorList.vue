<template>
  <div class="bg-card rounded-lg border border-border p-3 shadow-sm">
    <h3 class="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
      <Users class="w-4 h-4 text-primary" />
      医生列表
    </h3>

    <div v-if="doctors.length > 0" class="flex flex-wrap gap-2">
      <button
        v-for="doctor in doctors"
        :key="doctor.doctor_id"
        @click="selectDoctor(doctor)"
        :class="[
          'px-3 py-1.5 rounded-md border-2 transition-all duration-200 text-sm',
          selectedDoctorId === doctor.doctor_id
            ? 'border-primary bg-primary/20 text-primary shadow-sm font-semibold'
            : 'border-border bg-background hover:border-primary/50 hover:bg-accent'
        ]"
      >
        <div class="font-medium">{{ doctor.name }}</div>
        <div class="text-xs opacity-70">{{ doctor.title }}</div>
      </button>
    </div>

    <div v-else class="text-center py-6 text-muted-foreground">
      <Users class="w-10 h-10 mx-auto mb-2 opacity-50" />
      <p class="text-sm">{{ deptId ? '该科室暂无医生' : '请先选择科室' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Users } from 'lucide-vue-next'
import * as scheduleApi from '@/api/schedule'
import { useToast } from '@/utils/toast'

const props = defineProps({
  deptId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['doctor-selected'])
const toast = useToast()

const doctors = ref([])
const selectedDoctorId = ref(null)

const loadDoctors = async () => {
  if (!props.deptId) {
    doctors.value = []
    return
  }

  try {
    const response = await scheduleApi.getDepartmentDoctors(props.deptId)
    if (response.data.code !== 0) {
      toast.error(response.data.message?.msg || '加载医生列表失败')
      return
    }
    doctors.value = response.data.message.doctors
    selectedDoctorId.value = null
  } catch (error) {
    console.error('加载医生列表失败:', error)
    toast.error('加载医生列表失败')
  }
}

const selectDoctor = (doctor) => {
  if (selectedDoctorId.value === doctor.doctor_id) {
    selectedDoctorId.value = null
    emit('doctor-selected', null)
  } else {
    selectedDoctorId.value = doctor.doctor_id
    emit('doctor-selected', doctor)
  }
}

watch(() => props.deptId, () => {
  loadDoctors()
}, { immediate: true })

defineExpose({
  selectedDoctorId
})
</script>
