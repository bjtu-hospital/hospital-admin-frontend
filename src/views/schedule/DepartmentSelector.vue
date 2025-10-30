<template>
  <div class="bg-card rounded-lg border border-border p-3 shadow-sm">
    <h3 class="text-base font-semibold text-foreground mb-3 flex items-center gap-2">
      <Building2 class="w-4 h-4 text-primary" />
      选择科室
    </h3>
    <div class="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2">
      <button
        v-for="dept in departments"
        :key="dept.minor_dept_id"
        @click="selectDepartment(dept)"
        :class="[
          'px-3 py-2 rounded-md border-2 transition-all duration-200 text-sm font-medium',
          selectedDeptId === dept.minor_dept_id
            ? 'border-primary bg-primary/10 text-primary shadow-sm'
            : 'border-border text-foreground hover:border-primary/50 hover:bg-accent'
        ]"
      >
        {{ dept.name }}
      </button>
    </div>

    <div v-if="departments.length === 0" class="text-center py-8 text-muted-foreground">
      <Building2 class="w-12 h-12 mx-auto mb-2 opacity-50" />
      <p>暂无科室数据</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Building2 } from 'lucide-vue-next'
import * as scheduleApi from '@/api/schedule'
import { useToast } from '@/utils/toast'

const emit = defineEmits(['department-selected'])
const toast = useToast()

const departments = ref([])
const selectedDeptId = ref(null)

const loadDepartments = async () => {
  try {
    const response = await scheduleApi.getDepartments()
    if (response.data.code !== 0) {
      toast.error(response.data.message?.msg || '加载科室列表失败')
      return
    }
    departments.value = response.data.message.departments
  } catch (error) {
    console.error('加载科室列表失败:', error)
    toast.error('加载科室列表失败')
  }
}

const selectDepartment = (dept) => {
  selectedDeptId.value = dept.minor_dept_id
  emit('department-selected', dept)
}

onMounted(() => {
  loadDepartments()
})
</script>
