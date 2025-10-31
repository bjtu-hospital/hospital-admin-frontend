<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div class="flex items-center gap-3">
      <Calendar class="w-8 h-8 text-primary" />
      <div>
        <h1 class="text-2xl font-bold text-foreground">排班管理</h1>
        <p class="text-sm text-muted-foreground">管理科室、门诊和医生的排班信息</p>
      </div>
    </div>

    <!-- 科室选择器 -->
    <DepartmentSelector @department-selected="handleDepartmentSelected" />

    <!-- 医生列表 -->
    <DoctorList
      ref="doctorListRef"
      :dept-id="selectedDeptId"
      @doctor-selected="handleDoctorSelected"
    />

    <!-- 标签页切换 -->
    <div class="bg-card rounded-lg border border-border shadow-sm">
      <div class="border-b border-border">
        <div class="flex items-center gap-4 px-4">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            :class="[
              'px-4 py-3 font-medium transition-all relative',
              activeTab === tab.id
                ? 'text-primary'
                : 'text-muted-foreground hover:text-foreground'
            ]"
          >
            <div class="flex items-center gap-2">
              <component :is="tab.icon" class="w-4 h-4" />
              {{ tab.label }}
            </div>
            <div
              v-if="activeTab === tab.id"
              class="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
            ></div>
          </button>
        </div>
      </div>
    </div>

    <!-- 标签页内容 -->
    <div class="space-y-6">
      <!-- a. 科室排班表预览 -->
      <SchedulePreview
        ref="schedulePreviewRef"
        v-show="activeTab === 'preview'"
        :dept-id="selectedDeptId"
        :highlighted-doctor-id="highlightedDoctorId"
        @update:highlighted-doctor-id="highlightedDoctorId = $event"
      />

      <!-- b. 门诊管理 -->
      <ClinicManagement
        ref="clinicManagementRef"
        v-show="activeTab === 'clinic'"
        :dept-id="selectedDeptId"
      />

      <!-- c. 医生排班数据 -->
      <DoctorSchedule
        v-show="activeTab === 'doctor'"
        :selected-doctor="selectedDoctor"
        :dept-id="selectedDeptId"
        @schedule-updated="handleScheduleUpdated"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { Calendar, CalendarDays, Hospital, UserCircle } from 'lucide-vue-next'
import DepartmentSelector from './DepartmentSelector.vue'
import DoctorList from './DoctorList.vue'
import SchedulePreview from './SchedulePreview.vue'
import ClinicManagement from './ClinicManagement.vue'
import DoctorSchedule from './DoctorSchedule.vue'

// 选中的科室和医生
const selectedDeptId = ref(null)
const selectedDoctor = ref(null)
const highlightedDoctorId = ref(null)

// 标签页
const activeTab = ref('preview')
const tabs = [
  { id: 'preview', label: '科室排班表预览', icon: CalendarDays },
  { id: 'clinic', label: '门诊管理', icon: Hospital },
  { id: 'doctor', label: '医生排班数据', icon: UserCircle }
]

const doctorListRef = ref(null)
const clinicManagementRef = ref(null)
const schedulePreviewRef = ref(null)

const handleDepartmentSelected = (dept) => {
  selectedDeptId.value = dept.minor_dept_id
  selectedDoctor.value = null
  highlightedDoctorId.value = null
}

const handleDoctorSelected = (doctor) => {
  selectedDoctor.value = doctor
  highlightedDoctorId.value = doctor?.doctor_id || null
  
  // 如果选择了医生，切换到医生排班数据页面
  if (doctor) {
    activeTab.value = 'doctor'
  }
}

// 当医生排班更新时，刷新门诊管理和科室排班预览的数据
const handleScheduleUpdated = () => {
  // 刷新门诊管理
  if (clinicManagementRef.value) {
    clinicManagementRef.value.refreshClinicSchedules()
  }
  
  // 刷新科室排班表预览
  if (schedulePreviewRef.value) {
    schedulePreviewRef.value.refreshSchedules()
  }
}

// 监听高亮的医生ID，同步到医生列表并加载医生数据
watch(highlightedDoctorId, (doctorId) => {
  if (doctorId && doctorListRef.value) {
    // 更新医生列表的选中状态
    doctorListRef.value.selectedDoctorId = doctorId
    
    // 获取完整的医生对象
    const doctor = doctorListRef.value.getDoctorById(doctorId)
    if (doctor) {
      selectedDoctor.value = doctor
      // 切换到医生排班数据页面
      activeTab.value = 'doctor'
    }
  }
})
</script>

