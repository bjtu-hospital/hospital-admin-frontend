<template>
  <div class="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
    <h2 class="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
      申请加号
    </h2>
    
    <form @submit.prevent="handleSubmit" class="space-y-4">
      <!-- 排班ID -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          排班ID <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="formData.schedule_id"
          type="number"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入排班ID"
        />
      </div>

      <!-- 患者ID -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          患者ID <span class="text-red-500">*</span>
        </label>
        <input
          v-model.number="formData.patient_id"
          type="number"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请输入患者ID"
        />
      </div>

      <!-- 号源类型 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          号源类型 <span class="text-red-500">*</span>
        </label>
        <select
          v-model="formData.slot_type"
          required
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">请选择号源类型</option>
          <option value="普通">普通</option>
          <option value="专家">专家</option>
          <option value="特需">特需</option>
        </select>
      </div>

      <!-- 申请原因 -->
      <div>
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          申请原因
        </label>
        <textarea
          v-model="formData.reason"
          rows="3"
          class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="请简要说明加号原因（可选）"
        ></textarea>
      </div>

      <!-- 提交按钮 -->
      <div class="flex justify-end space-x-3">
        <button
          type="button"
          @click="handleReset"
          class="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md 
                 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700
                 transition-colors"
        >
          重置
        </button>
        <button
          type="submit"
          :disabled="isSubmitting"
          class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md 
                 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          {{ isSubmitting ? '提交中...' : '提交申请' }}
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { createAddSlot } from '@/api/addslot'
import { useToast } from '@/utils/toast'

const emit = defineEmits(['success'])
const { success, error } = useToast()

const isSubmitting = ref(false)

const formData = reactive({
  schedule_id: null,
  patient_id: null,
  slot_type: '',
  reason: ''
})

const handleSubmit = async () => {
  if (isSubmitting.value) return
  
  isSubmitting.value = true
  
  try {
    const response = await createAddSlot({
      schedule_id: formData.schedule_id,
      patient_id: formData.patient_id,
      slot_type: formData.slot_type,
      reason: formData.reason || undefined
    })
    
    if (response.code === 0) {
      // 判断是管理员直接创建还是医生提交申请
      if (response.message.order_id) {
        success(`加号成功！挂号订单ID：${response.message.order_id}`)
      } else {
        success('加号申请已提交，等待管理员审核')
      }
      
      handleReset()
      emit('success', response.message)
    } else {
      error(response.message || '提交失败')
    }
  } catch (err) {
    console.error('Submit error:', err)
    error(err.response?.data?.message || '提交失败，请稍后重试')
  } finally {
    isSubmitting.value = false
  }
}

const handleReset = () => {
  formData.schedule_id = null
  formData.patient_id = null
  formData.slot_type = ''
  formData.reason = ''
}
</script>
