<template>
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 flex items-start justify-center z-50 p-4 pt-20 overflow-y-auto"
      @click.self="handleClose"
    >
      <div class="bg-card rounded-lg border border-border shadow-2xl max-w-2xl w-full overflow-y-auto">
        <!-- 标题栏 -->
        <div class="sticky top-0 bg-card border-b border-border p-6 flex items-center justify-between z-10 bg-muted/30">
          <h3 class="text-xl font-semibold text-foreground">选择医生</h3>
          <button
            @click="handleClose"
            class="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 搜索区域 -->
        <div class="p-6 space-y-4">
          <div>
            <input
              v-model="searchQuery"
              type="text"
              placeholder="搜索医生姓名、科室、职称、专长..."
              class="w-full px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <!-- 列表区域 -->
        <div class="px-6 pb-4 space-y-2">
          <div v-if="isLoading" class="p-8 text-center text-muted-foreground">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            加载中...
          </div>
          <div v-else-if="doctors.length === 0" class="p-8 text-center text-muted-foreground">
            暂无医生数据
          </div>
          <div v-else class="space-y-2 max-h-96 overflow-y-auto">
            <button
              v-for="doctor in doctors"
              :key="doctor.doctor_id"
              type="button"
              @click="handleSelect(doctor)"
              class="w-full px-4 py-3 text-left rounded-md border transition-all duration-200"
              :class="selectedDoctor?.doctor_id === doctor.doctor_id 
                ? 'bg-primary/10 border-primary shadow-sm' 
                : 'bg-background border-border hover:bg-accent'"
            >
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-sm font-medium text-foreground">{{ doctor.name }}</div>
                  <div class="text-xs mt-1 text-muted-foreground">
                    {{ doctor.department_name }} · {{ doctor.title }}
                  </div>
                </div>
                <div class="text-xs text-muted-foreground">ID: {{ doctor.doctor_id }}</div>
              </div>
            </button>
          </div>
        </div>

        <!-- 底部按钮 -->
        <div class="sticky bottom-0 bg-card border-t border-border p-6 flex justify-end gap-3 bg-muted/20">
          <button
            type="button"
            @click="handleClose"
            class="px-4 py-2 bg-accent text-accent-foreground rounded-md hover:bg-accent/80 transition-colors font-medium shadow-sm"
          >
            取消
          </button>
          <button
            type="button"
            @click="handleConfirm"
            :disabled="!selectedDoctor"
            class="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
          >
            确认
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { getDoctors } from '@/api/addslot'
import { useToast } from '@/utils/toast'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  selectedId: {
    type: Number,
    default: null
  }
})

const emit = defineEmits(['close', 'select'])
const { error } = useToast()

const searchQuery = ref('')
const allDoctors = ref([])
const isLoading = ref(false)
const selectedDoctor = ref(null)

// 使用 computed 实现实时过滤
const doctors = computed(() => {
  if (!searchQuery.value) {
    return allDoctors.value
  }
  
  const keyword = searchQuery.value.toLowerCase()
  return allDoctors.value.filter(doctor =>
    doctor.name.toLowerCase().includes(keyword) ||
    doctor.department_name?.toLowerCase().includes(keyword) ||
    doctor.title?.toLowerCase().includes(keyword) ||
    doctor.specialization?.toLowerCase().includes(keyword)
  )
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    searchQuery.value = ''
    selectedDoctor.value = null
    loadDoctors()
  }
})

watch(() => props.selectedId, (newVal) => {
  if (newVal && allDoctors.value.length > 0) {
    selectedDoctor.value = allDoctors.value.find(d => d.doctor_id === newVal)
  }
})

const loadDoctors = async () => {
  isLoading.value = true
  try {
    const response = await getDoctors({})
    if (response.code === 0) {
      allDoctors.value = response.message.doctors || []
    } else {
      error('加载医生列表失败')
    }
  } catch (err) {
    console.error('Load doctors error:', err)
    error('加载医生列表失败')
  } finally {
    isLoading.value = false
  }
}

const handleSelect = (doctor) => {
  selectedDoctor.value = doctor
}

const handleConfirm = () => {
  if (selectedDoctor.value) {
    emit('select', selectedDoctor.value)
    handleClose()
  }
}

const handleClose = () => {
  emit('close')
}
</script>
