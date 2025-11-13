<template>
  <div class="statistics-view p-6 bg-gray-50 min-h-screen">
    <!-- Header -->
    <div class="mb-6">
      <h1 class="text-2xl font-bold text-gray-800 mb-2">数据统计分析</h1>
      <p class="text-gray-600">查看医院挂号数据的可视化统计与分析</p>
    </div>

    <!-- Date Selector -->
    <div class="bg-white rounded-lg shadow-sm p-4 mb-6">
      <div class="flex items-center justify-between flex-wrap gap-4">
        <div class="flex items-center gap-4">
          <label class="text-sm font-medium text-gray-700">统计日期:</label>
          <input
            v-model="selectedDate"
            type="date"
            class="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            @change="handleDateChange"
          />
        </div>
        
        <div class="flex items-center gap-2">
          <label class="text-sm font-medium text-gray-700">时间范围:</label>
          <button
            v-for="range in dateRanges"
            :key="range.value"
            @click="handleRangeChange(range.value)"
            :class="[
              'px-4 py-2 rounded-md text-sm font-medium transition-colors',
              selectedRange === range.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
            :value="hospitalStats.areas?.length || 0"
            subtitle="分院区统计"
            icon="building"
            color="purple"
            :clickable="false"
          />
          <StatsCard
            title="平均挂号量"
            :value="Math.round(hospitalStats.avg_daily_registrations || 0)"
            subtitle="日均挂号量"
            icon="users"
            color="yellow"
            :clickable="false"
          />
        </div>

        <!-- Charts Row 1 -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Slot Type Distribution -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">号源类型分布</h3>
            <PieChart
              :data="slotTypeChartData"
              :title="''"
              height="350px"
            />
          </div>

          <!-- Area Distribution -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">院区挂号分布</h3>
            <BarChart
              :data="areaChartData"
              :title="''"
              :clickable="true"
              height="350px"
              @chartClick="handleAreaClick"
            />
          </div>
        </div>

        <!-- Time Series Chart -->
        <div v-if="selectedRange !== 'today'" class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">挂号趋势分析</h3>
          <LineChart
            :data="timeSeriesChartData"
            :title="''"
            height="400px"
          />
        </div>

        <!-- Department Ranking -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <div class="flex justify-between items-center mb-4">
            <h3 class="text-lg font-semibold text-gray-800">科室排行榜（Top 10）</h3>
            <select
              v-model="rankingOrderBy"
              @change="loadDepartmentRanking"
              class="px-3 py-2 border border-gray-300 rounded-md text-sm"
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

      <!-- Department Level View -->
      <div v-else-if="currentLevel === 'department'">
        <!-- Summary Cards -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <StatsCard
            title="科室总挂号数"
            :value="departmentStats.total_registrations || 0"
            :subtitle="`${departmentStats.dept_name}`"
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
            title="平均挂号量"
            :value="Math.round(departmentStats.avg_daily_registrations || 0)"
            subtitle="日均挂号量"
            icon="chart"
            color="yellow"
            :clickable="false"
          />
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Slot Type Distribution -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">号源类型分布</h3>
            <PieChart
              :data="departmentSlotTypeData"
              :title="''"
              height="350px"
            />
          </div>

          <!-- Doctor Distribution -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">医生挂号分布</h3>
            <BarChart
              :data="doctorChartData"
              :title="''"
              :clickable="true"
              height="350px"
              @chartClick="handleDoctorClick"
            />
          </div>
        </div>

        <!-- Time Series Chart -->
        <div v-if="selectedRange !== 'today'" class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">科室挂号趋势</h3>
          <LineChart
            :data="departmentTimeSeriesData"
            :title="''"
            height="400px"
          />
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
            title="平均挂号量"
            :value="Math.round(doctorStats.avg_daily_registrations || 0)"
            subtitle="日均挂号量"
            icon="chart"
            color="yellow"
            :clickable="false"
          />
        </div>

        <!-- Charts Row -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <!-- Slot Type Distribution -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">号源类型分布</h3>
            <PieChart
              :data="doctorSlotTypeData"
              :title="''"
              height="350px"
            />
          </div>

          <!-- Time Section Distribution -->
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-semibold text-gray-800 mb-4">时段分布</h3>
            <BarChart
              :data="timeSectionChartData"
              :title="''"
              height="350px"
            />
          </div>
        </div>

        <!-- Time Series Chart -->
        <div v-if="selectedRange !== 'today'" class="bg-white rounded-lg shadow-md p-6 mb-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">医生挂号趋势</h3>
          <LineChart
            :data="doctorTimeSeriesData"
            :title="''"
            height="400px"
          />
        </div>

        <!-- Schedule Details -->
        <div v-if="doctorStats.schedules?.length" class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-semibold text-gray-800 mb-4">排班详情</h3>
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-gray-200">
              <thead class="bg-gray-50">
                <tr>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    诊室
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    时段
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    号源类型
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    挂号数
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    总号源
                  </th>
                  <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    利用率
                  </th>
                </tr>
              </thead>
              <tbody class="bg-white divide-y divide-gray-200">
                <tr v-for="schedule in doctorStats.schedules" :key="schedule.schedule_id">
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ schedule.clinic_name }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ schedule.time_section }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ schedule.slot_type }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ schedule.registrations }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {{ schedule.total_slots }}
                  </td>
                  <td class="px-6 py-4 whitespace-nowrap text-sm">
                    <div class="flex items-center">
                      <div class="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div
                          class="bg-blue-600 h-2 rounded-full"
                          :style="{ width: `${schedule.utilization_rate * 100}%` }"
                        ></div>
                      </div>
                      <span class="text-gray-900">
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
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useToast } from '@/utils/toast'
import {
  getHospitalRegistrations,
  getDepartmentRegistrations,
  getDoctorRegistrations,
  getDepartmentRanking
} from '@/api/statistics'
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
const departmentStats = ref({})
const doctorStats = ref({})
const departmentRankingList = ref([])

// Chart data transformations
const slotTypeChartData = computed(() => {
  const data = hospitalStats.value.by_slot_type || {}
  return Object.entries(data).map(([name, value]) => ({ name, value }))
})

const areaChartData = computed(() => {
  const areas = hospitalStats.value.areas || []
  return areas.map(area => ({
    name: area.area_name,
    value: area.registrations,
    id: area.area_id
  }))
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
      hospitalStats.value = response.message
    } else {
      showError('加载医院统计数据失败')
    }
  } catch (error) {
    console.error('Error loading hospital stats:', error)
    showError('加载医院统计数据失败')
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
      departmentStats.value = response.message
    } else {
      showError('加载科室统计数据失败')
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
      doctorStats.value = response.message
    } else {
      showError('加载医生统计数据失败')
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
      departmentRankingList.value = response.message.ranking || []
    }
  } catch (error) {
    console.error('Error loading department ranking:', error)
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
  // Note: Area level not fully implemented in API spec
  // You can navigate to department selection if needed
  showInfo(`点击了院区: ${data.name}`)
}

const handleDepartmentClick = (data) => {
  navigationStack.value.push({
    level: 'department',
    name: data.name,
    id: data.data.id
  })
  currentLevel.value = 'department'
  loadDepartmentStats(data.data.id)
}

const handleDoctorClick = (data) => {
  navigationStack.value.push({
    level: 'doctor',
    name: data.name,
    id: data.data.id
  })
  currentLevel.value = 'doctor'
  loadDoctorStats(data.data.id)
}

const handleBreadcrumbNav = ({ item, index }) => {
  navigationStack.value = navigationStack.value.slice(0, index + 1)
  currentLevel.value = item.level
  refreshCurrentLevel()
}

// Lifecycle
onMounted(() => {
  loadHospitalStats()
  loadDepartmentRanking()
})
</script>

<style scoped>
/* Additional custom styles if needed */
</style>