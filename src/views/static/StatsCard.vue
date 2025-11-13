<template>
  <div class="stats-card bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer" 
       @click="handleClick">
    <div class="flex items-center justify-between">
      <div class="flex-1">
        <p class="text-gray-500 dark:text-gray-400 text-sm mb-1">{{ title }}</p>
        <h3 class="text-3xl font-bold text-gray-800 dark:text-gray-100">{{ formatNumber(value) }}</h3>
        <div v-if="subtitle" class="mt-2 text-sm text-gray-600 dark:text-gray-400">
          {{ subtitle }}
        </div>
      </div>
      <div class="icon-container ml-4" :class="`bg-${color}-100 dark:bg-${color}-900`">
        <div :class="`text-${color}-600 dark:text-${color}-400 text-3xl`">
          <component :is="iconComponent" />
        </div>
      </div>
    </div>
    
    <div v-if="trend" class="mt-4 flex items-center text-sm">
      <span v-if="trend > 0" class="text-green-600 dark:text-green-400 flex items-center">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 10l7-7m0 0l7 7m-7-7v18" />
        </svg>
        +{{ trend }}%
      </span>
      <span v-else-if="trend < 0" class="text-red-600 dark:text-red-400 flex items-center">
        <svg class="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
        {{ trend }}%
      </span>
      <span v-else class="text-gray-500 dark:text-gray-400">
        持平
      </span>
      <span class="text-gray-500 dark:text-gray-400 ml-2">较昨日</span>
    </div>
  </div>
</template>

<script setup>
import { computed, h } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: Number,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'chart'
  },
  color: {
    type: String,
    default: 'blue',
    validator: (value) => ['blue', 'green', 'purple', 'yellow', 'red'].includes(value)
  },
  trend: {
    type: Number,
    default: null
  },
  clickable: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['click'])

// Icon components using render functions
const ChartIcon = {
  render: () => h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '1.5',
    stroke: 'currentColor',
    class: 'w-8 h-8'
  }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z'
    })
  ])
}

const UserIcon = {
  render: () => h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '1.5',
    stroke: 'currentColor',
    class: 'w-8 h-8'
  }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z'
    })
  ])
}

const BuildingIcon = {
  render: () => h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '1.5',
    stroke: 'currentColor',
    class: 'w-8 h-8'
  }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 3.75h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008zm0 3h.008v.008h-.008v-.008z'
    })
  ])
}

const UsersIcon = {
  render: () => h('svg', {
    xmlns: 'http://www.w3.org/2000/svg',
    fill: 'none',
    viewBox: '0 0 24 24',
    'stroke-width': '1.5',
    stroke: 'currentColor',
    class: 'w-8 h-8'
  }, [
    h('path', {
      'stroke-linecap': 'round',
      'stroke-linejoin': 'round',
      d: 'M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z'
    })
  ])
}

const iconComponent = computed(() => {
  const icons = {
    chart: ChartIcon,
    user: UserIcon,
    building: BuildingIcon,
    users: UsersIcon
  }
  return icons[props.icon] || ChartIcon
})

const formatNumber = (num) => {
  return num?.toLocaleString() || '0'
}

const handleClick = () => {
  if (props.clickable) {
    emit('click')
  }
}
</script>

<style scoped>
.stats-card {
  transition: all 0.3s ease;
}

.stats-card:hover {
  transform: translateY(-2px);
}

.icon-container {
  width: 64px;
  height: 64px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
