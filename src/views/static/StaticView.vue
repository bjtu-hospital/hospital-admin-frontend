<template>
  <div class="statistics-view p-6 bg-gray-50 dark:bg-gray-900 min-h-screen">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 dark:text-gray-100 mb-2">数据统计分析</h1>
      <p class="text-gray-600 dark:text-gray-400">查看医院挂号数据的可视化统计与分析</p>
    </div>

    <!-- Date Selector -->
    <div class="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 mb-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">统计日期:</label>
          <input
            v-model="selectedDate"
            type="date"
            class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            @change="handleDateChange"
          />
        </div>
        
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700 dark:text-gray-300">时间范围:</label>
          <button
            v-for="range in dateRanges"
            :key="range.value"
            @click="handleRangeChange(range.value)"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              selectedRange === range.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
            ]"
          >
            {{ range.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Breadcrumb Navigation -->
    <BreadcrumbNav :items="breadcrumbs" @navigate="handleBreadcrumbNav" />

    <!-- Loading State -->
    <div v-if="loading" class="flex justify-center items-center py-20">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Main Content -->
    <div v-else>
      <!-- Hospital Level View -->
      <div v-if="currentLevel === 'hospital'">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="总挂号数"
            :value="hospitalStats.total_registrations || 0"
            subtitle="今日总挂号量"
            icon="chart"
            color="blue"
            :clickable="false"
          />
          <StatsCard
            title="总收入"
            :value="hospitalStats.total_revenue || 0"
            subtitle="今日总收入（元）"
            icon="chart"
            color="green"
            :clickable="false"
          />
          <StatsCard
            title="院区数量"
            :value="hospitalAreas.length || 0"
            subtitle="分院区统计"
            icon="building"
            color="purple"
            :clickable="false"
          />
          <StatsCard
            title="已就诊完成"
            :value="hospitalStats.completed_consultations || 0"
            subtitle="已完成就诊人数"
            icon="users"
            color="yellow"
            :clickable="false"
          />
        </div>

        <!-- Charts Row 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Slot Type Distribution -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">号源类型分布</h3>
            <PieChart
              :data="slotTypeChartData"
              :title="''"
              height="350px"
            />
          </div>

          <!-- Area Distribution -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">院区挂号分布</h3>
            <BarChart
              :data="areaChartData"
              :title="''"
              :clickable="true"
              height="350px"
              @chartClick="handleAreaClick"
            />
          </div>
        </div>

        <!-- Department Ranking -->
        <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100">科室排行榜（Top 10）</h3>
            <select
              v-model="rankingOrderBy"
              @change="loadDepartmentRanking"
              class="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
            >
              <option value="registrations">按挂号量</option>
              <option value="revenue">按收入</option>
            </select>
          </div>
          <BarChart
            :data="departmentRankingData"
            :title="''"
            :clickable="true"
            height="400px"
            @chartClick="handleDepartmentClick"
          />
        </div>
      </div>

      <!-- Area Level View -->
      <div v-else-if="currentLevel === 'area'">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="院区总挂号数"
            :value="areaStats.total_registrations || 0"
            :subtitle="areaStats.area_name || '未知院区'"
            icon="chart"
            color="blue"
            :clickable="false"
          />
          <StatsCard
            title="院区总收入"
            :value="areaStats.total_revenue || 0"
            subtitle="今日收入（元）"
            icon="chart"
            color="green"
            :clickable="false"
          />
          <StatsCard
            title="科室数量"
            :value="areaStats.departments?.length || 0"
            subtitle="科室统计"
            icon="users"
            color="purple"
            :clickable="false"
          />
          <StatsCard
            title="已就诊完成"
            :value="areaStats.completed_consultations || 0"
            subtitle="已完成就诊人数"
            icon="chart"
            color="yellow"
            :clickable="false"
          />
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Slot Type Distribution -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">号源类型分布</h3>
            <PieChart
              :data="areaSlotTypeData"
              :title="''"
              height="350px"
            />
          </div>

          <!-- Department Distribution -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">科室挂号分布</h3>
            <BarChart
              :data="areaDepartmentChartData"
              :title="''"
              :clickable="true"
              height="350px"
              @chartClick="handleDepartmentClick"
            />
          </div>
        </div>
      </div>

      <!-- Department Level View -->
      <div v-else-if="currentLevel === 'department'">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="科室总挂号数"
            :value="departmentStats.total_registrations || 0"
            :subtitle="departmentStats.dept_name || '未知科室'"
            icon="chart"
            color="blue"
            :clickable="false"
          />
          <StatsCard
            title="科室总收入"
            :value="departmentStats.total_revenue || 0"
            subtitle="今日收入（元）"
            icon="chart"
            color="green"
            :clickable="false"
          />
          <StatsCard
            title="医生数量"
            :value="departmentStats.doctors?.length || 0"
            subtitle="在职医生"
            icon="users"
            color="purple"
            :clickable="false"
          />
          <StatsCard
            title="已就诊完成"
            :value="departmentStats.completed_consultations || 0"
            subtitle="已完成就诊人数"
            icon="chart"
            color="yellow"
            :clickable="false"
          />
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Slot Type Distribution -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">号源类型分布</h3>
            <PieChart
              :data="departmentSlotTypeData"
              :title="''"
              height="350px"
            />
          </div>

          <!-- Doctor Distribution -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">医生挂号分布</h3>
            <BarChart
              :data="doctorChartData"
              :title="''"
              :clickable="true"
              height="350px"
              @chartClick="handleDoctorClick"
            />
          </div>
        </div>
      </div>

      <!-- Doctor Level View -->
      <div v-else-if="currentLevel === 'doctor'">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="医生总挂号数"
            :value="doctorStats.total_registrations || 0"
            :subtitle="`${doctorStats.doctor_name} - ${doctorStats.title}`"
            icon="user"
            color="blue"
            :clickable="false"
          />
          <StatsCard
            title="医生总收入"
            :value="doctorStats.total_revenue || 0"
            subtitle="今日收入（元）"
            icon="chart"
            color="green"
            :clickable="false"
          />
          <StatsCard
            title="排班数量"
            :value="doctorStats.schedules?.length || 0"
            subtitle="今日排班"
            icon="chart"
            color="purple"
            :clickable="false"
          />
          <StatsCard
            title="已就诊完成"
            :value="doctorStats.completed_consultations || 0"
            subtitle="已完成就诊人数"
            icon="chart"
            color="yellow"
            :clickable="false"
          />
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Slot Type Distribution -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">号源类型分布</h3>
            <PieChart
              :data="doctorSlotTypeData"
              :title="''"
              height="350px"
            />
          </div>

          <!-- Time Section Distribution -->
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">时段分布</h3>
            <BarChart
              :data="timeSectionChartData"
              :title="''"
              height="350px"
            />
          </div>
        </div>

        <!-- Time Series Chart -->
        <div v-if="selectedRange !== 'today'" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">医生挂号趋势</h3>
          <LineChart
            :data="doctorTimeSeriesData"
            :title="''"
            height="400px"
          />
        </div>

        <!-- Schedule Details -->
        <div v-if="doctorStats.schedules?.length" class="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4">排班详情</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead class="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    诊室
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    时段
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    号源类型
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    挂号数
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    总号源
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    利用率
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                <tr v-for="schedule in doctorStats.schedules" :key="schedule.schedule_id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {{ schedule.clinic_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {{ schedule.time_section }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {{ schedule.slot_type }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {{ schedule.registrations }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                    {{ schedule.total_slots }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex items-center">
                      <div class="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2 mr-2">
                        <div
                          class="bg-blue-600 h-2 rounded-full"
                          :style="{ width: `${schedule.utilization_rate * 100}%` }"
                        ></div>
                      </div>
                      <span class="text-gray-900 dark:text-gray-100">
                        {{ (schedule.utilization_rate * 100).toFixed(1) }}%
                      </span>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>

    <!-- Quick Navigation Section -->
    <div class="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
      <h3 class="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        快速导航
      </h3>
      
      <!-- Level Selection -->
      <div class="mb-6">
        <div class="flex gap-4 border-b border-gray-200 dark:border-gray-700">
          <button
            @click="showDepartmentSelectionPanel"
            :class="[
              'px-4 py-2 font-medium text-sm transition-all',
              showDepartmentSelection
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            ]"
          >
            科室统计
          </button>
          <button
            @click="showDoctorSelectionPanel"
            :class="[
              'px-4 py-2 font-medium text-sm transition-all',
              showDoctorSelection
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400'
            ]"
          >
            医生统计
          </button>
        </div>
      </div>

      <!-- Department Selection Panel -->
      <div v-if="showDepartmentSelection" class="mb-4">
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">选择科室</h4>
          <button
            @click="showDepartmentSelection = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div v-if="loading" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <div v-else-if="departmentList.length === 0" class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          暂无科室数据
        </div>
        <div v-else class="flex flex-wrap gap-2">
          <button
            v-for="dept in departmentList"
            :key="dept.minor_dept_id"
            @click="handleDepartmentSelect(dept.minor_dept_id, dept.name)"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all text-sm text-gray-900 dark:text-gray-100"
          >
            {{ dept.name }}
          </button>
        </div>
      </div>

      <!-- Doctor Selection Panel -->
      <div v-if="showDoctorSelection" class="mb-4">
        <div class="flex justify-between items-center mb-3">
          <h4 class="text-sm font-medium text-gray-700 dark:text-gray-300">选择医生</h4>
          <button
            @click="showDoctorSelection = false"
            class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <!-- Search Input -->
        <div class="mb-3">
          <input
            v-model="doctorSearchInput"
            type="text"
            placeholder="搜索医生姓名..."
            class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        
        <div v-if="loading" class="text-center py-4">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        </div>
        <div v-else-if="filteredDoctorList.length === 0" class="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
          暂无医生数据
        </div>
        <div v-else class="flex flex-wrap gap-2">
          <button
            v-for="doctor in filteredDoctorList"
            :key="doctor.doctor_id"
            @click="handleDoctorSelect(doctor.doctor_id, doctor.name)"
            class="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-gray-700 transition-all text-sm text-gray-900 dark:text-gray-100"
          >
            {{ doctor.name }}
          </button>
        </div>
      </div>


    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/utils/toast'
import {
  getHospitalRegistrations,
  getAreaRegistrations,
  getDepartmentRegistrations,
  getDoctorRegistrations,
  getDepartmentRanking
} from '@/api/statistics'
import { getMinorDepartments } from '@/api/department'
import { getDoctors } from '@/api/doctor'
import { getHospitalAreas } from '@/api/area'
import BreadcrumbNav from './BreadcrumbNav.vue'
import StatsCard from './StatsCard.vue'
import PieChart from '@/components/charts/PieChart.vue'
import BarChart from '@/components/charts/BarChart.vue'
import LineChart from '@/components/charts/LineChart.vue'

// Initialize toast
const { error: showError, info: showInfo } = useToast()

// State
const loading = ref(false)
const currentLevel = ref('hospital') // hospital, department, doctor
const selectedDate = ref(new Date().toISOString().split('T')[0])
const selectedRange = ref('today')
const rankingOrderBy = ref('registrations')

// Navigation panel state
const showDepartmentSelection = ref(true)
const showDoctorSelection = ref(false)

// Breadcrumb navigation
const navigationStack = ref([
  { level: 'hospital', name: '医院总览', id: null }
])

const breadcrumbs = computed(() => navigationStack.value)

// Date ranges
const dateRanges = [
  { label: '今日', value: 'today' },
  { label: '近7天', value: '7days' },
  { label: '近30天', value: '30days' }
]

// Data stores
const hospitalStats = ref({})
const hospitalAreas = ref([]) // 院区列表
const areaStats = ref({})
const areaDetailsMap = ref(new Map()) // 存储所有院区的详细数据
const departmentStats = ref({})
const doctorStats = ref({})
const departmentRankingList = ref([])
const departmentList = ref([]) // 科室列表
const doctorList = ref([]) // 医生列表
const doctorSearchInput = ref('') // 医生搜索输入

// Chart data transformations
const slotTypeChartData = computed(() => {
  const data = hospitalStats.value.by_slot_type || {}
  return Object.entries(data).map(([name, value]) => ({ name, value }))
})

const areaChartData = computed(() => {
  // 使用院区列表和详细数据生成图表数据
  return hospitalAreas.value.map(area => {
    const details = areaDetailsMap.value.get(area.area_id)
    return {
      name: area.name,
      value: details?.total_registrations || 0,
      id: area.area_id
    }
  })
})

const timeSeriesChartData = computed(() => {
  const series = hospitalStats.value.time_series || []
  return series.map(item => ({
    date: item.date,
    value: item.registrations
  }))
})

const departmentRankingData = computed(() => {
  return departmentRankingList.value.map(dept => ({
    name: dept.dept_name,
    value: rankingOrderBy.value === 'registrations' ? dept.registrations : dept.revenue,
    id: dept.minor_dept_id
  }))
})

const areaSlotTypeData = computed(() => {
  const data = areaStats.value.by_slot_type || {}
  return Object.entries(data).map(([name, value]) => ({ name, value }))
})

const areaDepartmentChartData = computed(() => {
  const departments = areaStats.value.departments || []
  return departments.map(dept => ({
    name: dept.dept_name || `科室${dept.minor_dept_id}`,
    value: dept.registrations,
    id: dept.minor_dept_id
  }))
})

const departmentSlotTypeData = computed(() => {
  const data = departmentStats.value.by_slot_type || {}
  return Object.entries(data).map(([name, value]) => ({ name, value }))
})

const doctorChartData = computed(() => {
  const doctors = departmentStats.value.doctors || []
  return doctors.map(doctor => ({
    name: doctor.doctor_name,
    value: doctor.registrations,
    id: doctor.doctor_id
  }))
})

const departmentTimeSeriesData = computed(() => {
  const series = departmentStats.value.time_series || []
  return series.map(item => ({
    date: item.date,
    value: item.registrations
  }))
})

const doctorSlotTypeData = computed(() => {
  const data = doctorStats.value.by_slot_type || {}
  return Object.entries(data).map(([name, value]) => ({ name, value }))
})

const timeSectionChartData = computed(() => {
  const data = doctorStats.value.by_time_section || {}
  return Object.entries(data).map(([name, value]) => ({ name, value }))
})

const doctorTimeSeriesData = computed(() => {
  const series = doctorStats.value.time_series || []
  return series.map(item => ({
    date: item.date,
    value: item.registrations
  }))
})

// 医生搜索过滤
const filteredDoctorList = computed(() => {
  const searchText = doctorSearchInput.value.toLowerCase().trim()
  if (!searchText) {
    return doctorList.value
  }
  return doctorList.value.filter(doctor => 
    doctor.name.toLowerCase().includes(searchText)
  )
})

// Methods
const loadHospitalStats = async () => {
  loading.value = true
  try {
    const params = {
      date: selectedDate.value,
      date_range: selectedRange.value
    }
    const response = await getHospitalRegistrations(params)
    if (response.code === 0) {
      hospitalStats.value = response.message || {}
    } else {
      showError(response.message || '加载医院统计数据失败')
    }
  } catch (error) {
    console.error('Error loading hospital stats:', error)
    showError('加载医院统计数据失败')
  } finally {
    loading.value = false
  }
}

// 加载院区列表
const loadHospitalAreas = async () => {
  try {
    const response = await getHospitalAreas()
    if (response.data && response.data.code === 0) {
      hospitalAreas.value = response.data.message.areas || []
      // 加载完院区列表后，自动加载所有院区的详细统计数据
      await loadAllAreasDetails()
    } else {
      showError(response.data?.message || '加载院区列表失败')
    }
  } catch (error) {
    console.error('Error loading hospital areas:', error)
    showError('加载院区列表失败')
  }
}

// 加载所有院区的详细数据
const loadAllAreasDetails = async () => {
  const areas = hospitalAreas.value
  if (areas.length === 0) return

  try {
    // 并行请求所有院区的详细数据
    const promises = areas.map(area => 
      getAreaRegistrations(area.area_id, { date: selectedDate.value })
    )
    const responses = await Promise.all(promises)
    
    // 存储每个院区的详细数据
    responses.forEach((response, index) => {
      if (response.code === 0) {
        areaDetailsMap.value.set(areas[index].area_id, response.message)
      }
    })
  } catch (error) {
    console.error('Error loading area details:', error)
  }
}

const loadAreaStats = async (areaId) => {
  loading.value = true
  try {
    const params = {
      date: selectedDate.value
    }
    const response = await getAreaRegistrations(areaId, params)
    if (response.code === 0) {
      areaStats.value = response.message || {}
    } else {
      showError(response.message || '加载院区统计数据失败')
    }
  } catch (error) {
    console.error('Error loading area stats:', error)
    showError('加载院区统计数据失败')
  } finally {
    loading.value = false
  }
}

const loadDepartmentStats = async (deptId) => {
  loading.value = true
  try {
    const params = {
      date: selectedDate.value,
      date_range: selectedRange.value
    }
    const response = await getDepartmentRegistrations(deptId, params)
    if (response.code === 0) {
      departmentStats.value = response.message || {}
      // 确保有dept_name字段，从导航栈中获取
      if (!departmentStats.value.dept_name) {
        const current = navigationStack.value[navigationStack.value.length - 1]
        departmentStats.value.dept_name = current.name
      }
    } else {
      showError(response.message || '加载科室统计数据失败')
    }
  } catch (error) {
    console.error('Error loading department stats:', error)
    showError('加载科室统计数据失败')
  } finally {
    loading.value = false
  }
}

const loadDoctorStats = async (doctorId) => {
  loading.value = true
  try {
    const params = {
      date: selectedDate.value,
      date_range: selectedRange.value
    }
    const response = await getDoctorRegistrations(doctorId, params)
    if (response.code === 0) {
      doctorStats.value = response.message || {}
    } else {
      showError(response.message || '加载医生统计数据失败')
    }
  } catch (error) {
    console.error('Error loading doctor stats:', error)
    showError('加载医生统计数据失败')
  } finally {
    loading.value = false
  }
}

const loadDepartmentRanking = async () => {
  try {
    const params = {
      date: selectedDate.value,
      order_by: rankingOrderBy.value,
      limit: 10
    }
    const response = await getDepartmentRanking(params)
    if (response.code === 0) {
      departmentRankingList.value = response.message?.ranking || []
    } else {
      console.error('Load department ranking failed:', response.message)
    }
  } catch (error) {
    console.error('Error loading department ranking:', error)
  }
}

// 加载科室列表（持久化，只加载一次）
const loadDepartmentList = async () => {
  // 如果已经加载过，直接返回
  if (departmentList.value.length > 0) {
    return
  }
  
  try {
    const response = await getMinorDepartments({})
    if (response.data && response.data.code === 0) {
      departmentList.value = response.data.message.departments || []
    } else {
      showError(response.data?.message || '加载科室列表失败')
    }
  } catch (error) {
    console.error('Error loading department list:', error)
    showError('加载科室列表失败')
  }
}

// 加载医生列表（持久化，只加载一次）
const loadDoctorList = async () => {
  // 如果已经加载过，直接返回
  if (doctorList.value.length > 0) {
    return
  }
  
  try {
    const response = await getDoctors({})
    if (response.data && response.data.code === 0) {
      doctorList.value = response.data.message.doctors || []
    } else {
      showError(response.data?.message || '加载医生列表失败')
    }
  } catch (error) {
    console.error('Error loading doctor list:', error)
    showError('加载医生列表失败')
  }
}

const handleDateChange = () => {
  refreshCurrentLevel()
}

const handleRangeChange = (range) => {
  selectedRange.value = range
  refreshCurrentLevel()
}

const refreshCurrentLevel = () => {
  const current = navigationStack.value[navigationStack.value.length - 1]
  switch (current.level) {
    case 'hospital':
      loadHospitalStats()
      loadDepartmentRanking()
      // 重新加载所有院区的详细数据
      loadAllAreasDetails()
      break
    case 'area':
      loadAreaStats(current.id)
      break
    case 'department':
      loadDepartmentStats(current.id)
      break
    case 'doctor':
      loadDoctorStats(current.id)
      break
  }
}

const handleAreaClick = (data) => {
  navigationStack.value.push({
    level: 'area',
    name: data.name,
    id: data.data.id
  })
  currentLevel.value = 'area'
  // 重置快速导航为科室统计
  showDoctorSelection.value = false
  showDepartmentSelection.value = true
  loadAreaStats(data.data.id)
}

const handleDepartmentClick = (data) => {
  navigationStack.value.push({
    level: 'department',
    name: data.name,
    id: data.data.id
  })
  currentLevel.value = 'department'
  // 重置快速导航为科室统计
  showDoctorSelection.value = false
  showDepartmentSelection.value = true
  loadDepartmentStats(data.data.id)
}

const handleDoctorClick = (data) => {
  navigationStack.value.push({
    level: 'doctor',
    name: data.name,
    id: data.data.id
  })
  currentLevel.value = 'doctor'
  // 重置快速导航为科室统计
  showDoctorSelection.value = false
  showDepartmentSelection.value = true
  loadDoctorStats(data.data.id)
}

const handleBreadcrumbNav = ({ item, index }) => {
  navigationStack.value = navigationStack.value.slice(0, index + 1)
  currentLevel.value = item.level
  // 重置快速导航为科室统计
  showDoctorSelection.value = false
  showDepartmentSelection.value = true
  refreshCurrentLevel()
}

// Quick navigation handlers
const showDepartmentSelectionPanel = () => {
  showDoctorSelection.value = false
  showDepartmentSelection.value = true
}

const showDoctorSelectionPanel = () => {
  showDepartmentSelection.value = false
  showDoctorSelection.value = true
}

const handleDepartmentSelect = (deptId, deptName) => {
  navigationStack.value = [
    { level: 'hospital', name: '医院总览', id: null },
    { level: 'department', name: deptName, id: deptId }
  ]
  currentLevel.value = 'department'
  // 关闭面板并重置为科室统计选项卡
  showDoctorSelection.value = false
  showDepartmentSelection.value = true
  loadDepartmentStats(deptId)
}

const handleDoctorSelect = (doctorId, doctorName) => {
  navigationStack.value.push({
    level: 'doctor',
    name: doctorName,
    id: doctorId
  })
  currentLevel.value = 'doctor'
  // 关闭面板并重置为科室统计选项卡
  showDoctorSelection.value = false
  showDepartmentSelection.value = true
  loadDoctorStats(doctorId)
}

// Lifecycle
onMounted(() => {
  loadHospitalStats()
  loadHospitalAreas()
  loadDepartmentRanking()
  loadDepartmentList()
  loadDoctorList()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>