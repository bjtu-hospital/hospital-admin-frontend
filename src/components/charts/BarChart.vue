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
  },
  xAxisLabel: {
    type: String,
    default: ''
  },
  yAxisLabel: {
    type: String,
    default: '挂号数量'
  },
  clickable: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['chartClick'])

const chartRef = ref(null)
let chartInstance = null
const themeStore = useThemeStore()

const textColor = computed(() => themeStore.isDark ? '#e5e7eb' : '#374151')

const initChart = () => {
  if (!chartRef.value) return

  // Dispose existing instance to prevent duplicate initialization
  if (chartInstance) {
    chartInstance.dispose()
    chartInstance = null
  }

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
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      formatter: (params) => {
        const param = params[0]
        return `${param.name}<br/>${param.seriesName}: ${param.value}`
      },
      backgroundColor: themeStore.isDark ? '#1f2937' : '#fff',
      borderColor: themeStore.isDark ? '#374151' : '#e5e7eb',
      textStyle: {
        color: textColor.value
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '15%',
      top: '80px',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: props.data.map(item => item.name),
      axisLabel: {
        interval: 0,
        rotate: props.data.length > 5 ? 30 : 0,
        fontSize: 11,
        color: textColor.value,
        overflow: 'truncate',
        width: props.data.length > 10 ? 60 : undefined
      },
      axisLine: {
        lineStyle: {
          color: themeStore.isDark ? '#374151' : '#e5e7eb'
        }
      },
      name: props.xAxisLabel,
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: textColor.value
      }
    },
    yAxis: {
      type: 'value',
      name: props.yAxisLabel,
      nameLocation: 'middle',
      nameGap: 50,
      nameTextStyle: {
        color: textColor.value
      },
      axisLabel: {
        color: textColor.value
      },
      axisLine: {
        lineStyle: {
          color: themeStore.isDark ? '#374151' : '#e5e7eb'
        }
      },
      splitLine: {
        lineStyle: {
          color: themeStore.isDark ? '#374151' : '#e5e7eb'
        }
      }
    },
    series: [
      {
        name: props.yAxisLabel,
        type: 'bar',
        data: props.data.map(item => item.value),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#83bff6' },
            { offset: 0.5, color: '#188df0' },
            { offset: 1, color: '#188df0' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        emphasis: {
          itemStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: '#2378f7' },
              { offset: 0.7, color: '#2378f7' },
              { offset: 1, color: '#83bff6' }
            ])
          }
        },
        barMaxWidth: 50
      }
    ]
  }

  chartInstance.setOption(option)

  if (props.clickable) {
    chartInstance.on('click', (params) => {
      emit('chartClick', {
        name: params.name,
        value: params.value,
        data: props.data[params.dataIndex]
      })
    })
  }
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
