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
          <h3 class="text-xl font-semibold text-foreground">选择患者</h3>
          <button
            @click="handleClose"
            class="p-2 hover:bg-accent rounded-md transition-colors"
          >
            <X class="w-5 h-5" />
          </button>
        </div>

        <!-- 搜索区域 -->
        <div class="p-6 space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <input
              v-model="searchQuery.name"
              type="text"
              placeholder="患者姓名..."
              class="px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <input
              v-model="searchQuery.phone"
              type="text"
              placeholder="手机号..."
              class="px-3 py-2 bg-background border border-input rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        <!-- 列表区域 -->
        <div class="px-6 pb-4 space-y-2">
          <div v-if="isLoading" class="p-8 text-center text-muted-foreground">
            <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
            加载中...
          </div>
          <div v-else-if="patients.length === 0" class="p-8 text-center text-muted-foreground">
            暂无患者数据
          </div>
          <div v-else class="space-y-2 max-h-96 overflow-y-auto">
            <button
              v-for="patient in patients"
              :key="patient.patient_id"
              type="button"
              @click="handleSelect(patient)"
              class="w-full px-4 py-3 text-left rounded-md border transition-all duration-200"
              :class="selectedPatient?.patient_id === patient.patient_id 
                ? 'bg-primary/10 border-primary shadow-sm' 
                : 'bg-background border-border hover:bg-accent'"
            >
              <div class="flex justify-between items-center">
                <div>
                  <div class="text-sm font-medium text-foreground">{{ patient.name }}</div>
                  <div class="text-xs mt-1 text-muted-foreground">
                    {{ patient.phone }} · {{ patient.gender }} · {{ patient.age }}岁
                  </div>
                </div>
                <div class="text-xs text-muted-foreground">ID: {{ patient.patient_id }}</div>
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
            :disabled="!selectedPatient"
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
import { ref, reactive, computed, watch } from 'vue'
import { X } from 'lucide-vue-next'
import { getPatients } from '@/api/addslot'
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

const searchQuery = reactive({ name: '', phone: '' })
const allPatients = ref([])
const isLoading = ref(false)
const selectedPatient = ref(null)

// 使用 computed 实现实时过滤
const patients = computed(() => {
  let result = allPatients.value
  
  // 按姓名过滤
  if (searchQuery.name) {
    const nameKeyword = searchQuery.name.toLowerCase()
    result = result.filter(p => p.name.toLowerCase().includes(nameKeyword))
  }
  
  // 按手机号过滤
  if (searchQuery.phone) {
    result = result.filter(p => p.phone.includes(searchQuery.phone))
  }
  
  return result
})

watch(() => props.isOpen, (newVal) => {
  if (newVal) {
    searchQuery.name = ''
    searchQuery.phone = ''
    selectedPatient.value = null
    loadPatients()
  }
})

watch(() => props.selectedId, (newVal) => {
  if (newVal && allPatients.value.length > 0) {
    selectedPatient.value = allPatients.value.find(p => p.patient_id === newVal)
  }
})

const loadPatients = async () => {
  isLoading.value = true
  try {
    const response = await getPatients({})
    if (response.code === 0) {
      allPatients.value = response.message.patients || []
    } else {
      error('加载患者列表失败')
    }
  } catch (err) {
    console.error('Load patients error:', err)
    error('加载患者列表失败')
  } finally {
    isLoading.value = false
  }
}

const handleSelect = (patient) => {
  selectedPatient.value = patient
}

const handleConfirm = () => {
  if (selectedPatient.value) {
    emit('select', selectedPatient.value)
    handleClose()
  }
}

const handleClose = () => {
  emit('close')
}
</script>
