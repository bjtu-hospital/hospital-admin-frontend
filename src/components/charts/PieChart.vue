<template>
  <div ref="chartRef" :style="{ width: width, height: height }"></div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from 'vue'
import * as echarts from 'echarts'
import { useThemeStore } from '@/stores/theme'

const props = defineProps({
  data: {
    type: Array,
    required: true,
    default: () => []
  },
  width: {
    type: String,
    default: '100%'
  },
  height: {
    type: String,
    default: '400px'
  },
  title: {
    type: String,
    default: ''
  }
})

const chartRef = ref(null)
let chartInstance = null
const themeStore = useThemeStore()

const textColor = computed(() => themeStore.isDark ? '#e5e7eb' : '#374151')
const borderColor = computed(() => themeStore.isDark ? '#1f2937' : '#fff')

const initChart = () => {
  if (!chartRef.value) return

  chartInstance = echarts.init(chartRef.value)
  
  const option = {
    title: {
      text: props.title,
      left: 'center',
      top: 20,
      textStyle: {
        fontSize: 16,
        fontWeight: 'normal',
        color: textColor.value
      }
    },
    tooltip: {
      trigger: 'item',
      formatter: '{b}: {c} ({d}%)',
      backgroundColor: themeStore.isDark ? '#1f2937' : '#fff',
      borderColor: themeStore.isDark ? '#374151' : '#e5e7eb',
      textStyle: {
        color: textColor.value
      }
    },
    legend: {
      orient: 'vertical',
      right: 20,
      top: 'center',
      textStyle: {
        color: textColor.value
      }
    },
    series: [
      {
        name: '挂号数量',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['40%', '55%'],
        avoidLabelOverlap: true,
        itemStyle: {
          borderRadius: 10,
          borderColor: borderColor.value,
          borderWidth: 2
        },
        label: {
          show: true,
          formatter: '{b}\n{c}',
          color: textColor.value
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 'bold'
          }
        },
        labelLine: {
          show: true,
          lineStyle: {
            color: textColor.value
          }
        },
        data: props.data
      }
    ]
  }

  chartInstance.setOption(option)
}

const resizeChart = () => {
  chartInstance?.resize()
}

watch(() => props.data, () => {
  if (chartInstance) {
    initChart()
  }
}, { deep: true })

watch(() => themeStore.isDark, () => {
  if (chartInstance) {
    initChart()
  }
})

onMounted(() => {
  initChart()
  window.addEventListener('resize', resizeChart)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart)
  chartInstance?.dispose()
})
</script>

<style scoped>
/* ECharts container styles */
</style>
