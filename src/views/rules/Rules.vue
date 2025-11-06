<template>
  <div class="space-y-6">
    <!-- 页面标题 -->
    <div>
      <h1 class="text-2xl font-bold text-foreground">系统配置</h1>
      <p class="text-muted-foreground mt-1">管理系统的挂号、排班等相关配置</p>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-muted-foreground">加载中...</div>
    </div>

    <!-- 配置表单 -->
    <div v-else class="space-y-6">
      <!-- 挂号配置 -->
      <div class="bg-card rounded-lg border border-border p-6">
        <h2 class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
          挂号相关配置
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 提前挂号天数 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground flex items-center gap-2">
              提前挂号天数
              <span class="text-xs text-muted-foreground font-normal">(1-90天)</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="config.registration.advanceBookingDays"
                type="number"
                min="1"
                max="90"
                class="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span class="text-sm text-muted-foreground">天</span>
            </div>
            <p class="text-xs text-muted-foreground">患者最多可以提前多少天预约挂号</p>
          </div>

          <!-- 当日挂号截止时间 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground">
              当日挂号截止时间
            </label>
            <input
              v-model="config.registration.sameDayDeadline"
              type="time"
              class="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
            />
            <p class="text-xs text-muted-foreground">例如设置为8:00，则当天8点后无法挂号</p>
          </div>

          <!-- 爽约次数限制 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground flex items-center gap-2">
              爽约次数限制
              <span class="text-xs text-muted-foreground font-normal">(1-10次)</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="config.registration.noShowLimit"
                type="number"
                min="1"
                max="10"
                class="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span class="text-sm text-muted-foreground">次</span>
            </div>
            <p class="text-xs text-muted-foreground">超过次数后将限制患者挂号</p>
          </div>

          <!-- 退号提前时间 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground flex items-center gap-2">
              退号提前时间
              <span class="text-xs text-muted-foreground font-normal">(1-72小时)</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="config.registration.cancelHoursBefore"
                type="number"
                min="1"
                max="72"
                class="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span class="text-sm text-muted-foreground">小时</span>
            </div>
            <p class="text-xs text-muted-foreground">就诊前多少小时内不允许退号</p>
          </div>

          <!-- 同科室挂号间隔 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground flex items-center gap-2">
              同科室挂号间隔
              <span class="text-xs text-muted-foreground font-normal">(1-30天)</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="config.registration.sameClinicInterval"
                type="number"
                min="1"
                max="30"
                class="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span class="text-sm text-muted-foreground">天</span>
            </div>
            <p class="text-xs text-muted-foreground">防止黄牛，同一患者在同科室挂号的最小间隔</p>
          </div>
        </div>
      </div>

      <!-- 排班配置 -->
      <div class="bg-card rounded-lg border border-border p-6">
        <h2 class="text-xl font-semibold text-foreground mb-4 flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-primary">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2"/>
            <line x1="16" x2="16" y1="2" y2="6"/>
            <line x1="8" x2="8" y1="2" y2="6"/>
            <line x1="3" x2="21" y1="10" y2="10"/>
          </svg>
          排班管理配置
        </h2>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 最多排未来天数 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground flex items-center gap-2">
              最多排未来天数
              <span class="text-xs text-muted-foreground font-normal">(7-180天)</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="config.schedule.maxFutureDays"
                type="number"
                min="7"
                max="180"
                class="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span class="text-sm text-muted-foreground">天</span>
            </div>
            <p class="text-xs text-muted-foreground">排班表最多可以排到未来多少天</p>
          </div>

          <!-- 单次就诊时长 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground flex items-center gap-2">
              单次就诊时长
              <span class="text-xs text-muted-foreground font-normal">(5-60分钟)</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="config.schedule.consultationDuration"
                type="number"
                min="5"
                max="60"
                step="5"
                class="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span class="text-sm text-muted-foreground">分钟</span>
            </div>
            <p class="text-xs text-muted-foreground">每位患者的标准就诊时间</p>
          </div>

          <!-- 就诊间隔时间 -->
          <div class="space-y-2">
            <label class="text-sm font-medium text-foreground flex items-center gap-2">
              就诊间隔时间
              <span class="text-xs text-muted-foreground font-normal">(0-30分钟)</span>
            </label>
            <div class="flex items-center gap-2">
              <input
                v-model.number="config.schedule.intervalTime"
                type="number"
                min="0"
                max="30"
                step="5"
                class="flex-1 px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              />
              <span class="text-sm text-muted-foreground">分钟</span>
            </div>
            <p class="text-xs text-muted-foreground">两位患者之间的缓冲时间</p>
          </div>
        </div>

        <!-- 班次时间设置 -->
        <div class="mt-6 pt-6 border-t border-border">
          <h3 class="text-base font-semibold text-foreground mb-4">班次时间设置</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- 上午班 -->
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm font-medium text-foreground">
                <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                上午班
              </div>
              <div class="space-y-2">
                <label class="text-xs text-muted-foreground">开始时间</label>
                <input
                  v-model="config.schedule.morningStart"
                  type="time"
                  class="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div class="space-y-2">
                <label class="text-xs text-muted-foreground">结束时间</label>
                <input
                  v-model="config.schedule.morningEnd"
                  type="time"
                  class="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <!-- 下午班 -->
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm font-medium text-foreground">
                <div class="w-2 h-2 rounded-full bg-green-500"></div>
                下午班
              </div>
              <div class="space-y-2">
                <label class="text-xs text-muted-foreground">开始时间</label>
                <input
                  v-model="config.schedule.afternoonStart"
                  type="time"
                  class="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div class="space-y-2">
                <label class="text-xs text-muted-foreground">结束时间</label>
                <input
                  v-model="config.schedule.afternoonEnd"
                  type="time"
                  class="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>

            <!-- 晚班 -->
            <div class="space-y-3">
              <div class="flex items-center gap-2 text-sm font-medium text-foreground">
                <div class="w-2 h-2 rounded-full bg-purple-500"></div>
                晚班
              </div>
              <div class="space-y-2">
                <label class="text-xs text-muted-foreground">开始时间</label>
                <input
                  v-model="config.schedule.eveningStart"
                  type="time"
                  class="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
              <div class="space-y-2">
                <label class="text-xs text-muted-foreground">结束时间</label>
                <input
                  v-model="config.schedule.eveningEnd"
                  type="time"
                  class="w-full px-3 py-2 bg-background border border-border rounded-md text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="flex items-center justify-end gap-3">
        <button
          @click="handleReset"
          class="px-6 py-2.5 text-sm font-medium text-foreground bg-background border border-border rounded-md hover:bg-muted transition-colors"
        >
          重置
        </button>
        <button
          @click="handleSave"
          :disabled="saving"
          class="px-6 py-2.5 text-sm font-medium text-white bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {{ saving ? '保存中...' : '保存配置' }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { getSystemConfig, updateSystemConfig } from '@/api/config'
import { useToast } from '@/utils/toast'

const toast = useToast()

// 状态
const loading = ref(true)
const saving = ref(false)

// 配置数据
const config = ref({
  registration: {
    advanceBookingDays: 14,
    sameDayDeadline: '08:00',
    noShowLimit: 3,
    cancelHoursBefore: 24,
    sameClinicInterval: 7
  },
  schedule: {
    maxFutureDays: 60,
    morningStart: '08:00',
    morningEnd: '12:00',
    afternoonStart: '14:00',
    afternoonEnd: '18:00',
    eveningStart: '18:30',
    eveningEnd: '21:00',
    consultationDuration: 15,
    intervalTime: 5
  }
})

// 保存原始配置用于重置
const originalConfig = ref(null)

// 加载配置
const loadConfig = async () => {
  try {
    loading.value = true
    const response = await getSystemConfig()
    
    if (response.data.code === 0) {
      config.value = response.data.message
      // 深拷贝保存原始配置
      originalConfig.value = JSON.parse(JSON.stringify(response.data.message))
    } else {
      toast.error('加载配置失败')
    }
  } catch (error) {
    console.error('加载系统配置失败:', error)
    toast.error('加载配置失败')
  } finally {
    loading.value = false
  }
}

// 保存配置
const handleSave = async () => {
  // 验证数据
  if (!validateConfig()) {
    return
  }

  try {
    saving.value = true
    const response = await updateSystemConfig(config.value)
    
    if (response.data.code === 0) {
      toast.success('保存成功')
      // 更新原始配置
      originalConfig.value = JSON.parse(JSON.stringify(config.value))
    } else {
      toast.error('保存失败')
    }
  } catch (error) {
    console.error('保存系统配置失败:', error)
    toast.error('保存失败')
  } finally {
    saving.value = false
  }
}

// 重置配置
const handleReset = () => {
  if (originalConfig.value) {
    config.value = JSON.parse(JSON.stringify(originalConfig.value))
    toast.info('已重置为原始配置')
  }
}

// 验证配置
const validateConfig = () => {
  const { registration, schedule } = config.value

  // 验证挂号配置
  if (registration.advanceBookingDays < 1 || registration.advanceBookingDays > 90) {
    toast.error('提前挂号天数必须在1-90之间')
    return false
  }
  if (registration.noShowLimit < 1 || registration.noShowLimit > 10) {
    toast.error('爽约次数限制必须在1-10之间')
    return false
  }
  if (registration.cancelHoursBefore < 1 || registration.cancelHoursBefore > 72) {
    toast.error('退号提前时间必须在1-72小时之间')
    return false
  }
  if (registration.sameClinicInterval < 1 || registration.sameClinicInterval > 30) {
    toast.error('同科室挂号间隔必须在1-30天之间')
    return false
  }

  // 验证排班配置
  if (schedule.maxFutureDays < 7 || schedule.maxFutureDays > 180) {
    toast.error('最多排未来天数必须在7-180之间')
    return false
  }
  if (schedule.consultationDuration < 5 || schedule.consultationDuration > 60) {
    toast.error('单次就诊时长必须在5-60分钟之间')
    return false
  }
  if (schedule.intervalTime < 0 || schedule.intervalTime > 30) {
    toast.error('就诊间隔时间必须在0-30分钟之间')
    return false
  }

  // 验证时间段的合理性
  if (schedule.morningStart >= schedule.morningEnd) {
    toast.error('上午班开始时间必须早于结束时间')
    return false
  }
  if (schedule.afternoonStart >= schedule.afternoonEnd) {
    toast.error('下午班开始时间必须早于结束时间')
    return false
  }
  if (schedule.eveningStart >= schedule.eveningEnd) {
    toast.error('晚班开始时间必须早于结束时间')
    return false
  }

  return true
}

// 初始化
onMounted(() => {
  loadConfig()
})
</script>
