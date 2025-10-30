<template>
  <div class="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10">
    <div class="w-full max-w-md p-8">
      <div class="bg-card rounded-lg shadow-lg p-8 border border-border">
        <div class="text-center mb-8">
          <div class="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
            <Hospital class="w-8 h-8 text-primary" />
          </div>
          <h1 class="text-2xl font-bold text-foreground">医院管理系统</h1>
          <p class="text-muted-foreground mt-2">请登录您的账户</p>
        </div>

        <form @submit.prevent="handleLogin" class="space-y-6">
          <div class="space-y-2">
            <label for="username" class="text-sm font-medium text-foreground">
              用户名
            </label>
            <div class="relative">
              <User class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="username"
                v-model="form.identifier"
                type="text"
                required
                class="w-full pl-10 pr-4 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入用户名"
              />
            </div>
          </div>

          <div class="space-y-2">
            <label for="password" class="text-sm font-medium text-foreground">
              密码
            </label>
            <div class="relative">
              <Lock class="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <input
                id="password"
                v-model="form.password"
                :type="showPassword ? 'text' : 'password'"
                required
                class="w-full pl-10 pr-12 py-2 border border-input rounded-md bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                placeholder="请输入密码"
              />
              <button
                type="button"
                @click="showPassword = !showPassword"
                class="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <EyeOff v-if="showPassword" class="w-5 h-5" />
                <Eye v-else class="w-5 h-5" />
              </button>
            </div>
          </div>

          <div v-if="error" class="p-3 rounded-md bg-destructive/10 border border-destructive/20">
            <p class="text-sm text-destructive">{{ error }}</p>
          </div>

          <button
            type="submit"
            :disabled="loading"
            class="w-full py-2 px-4 bg-primary text-primary-foreground rounded-md font-medium hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <span v-if="loading">登录中...</span>
            <span v-else>登录</span>
          </button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { Hospital, User, Lock, Eye, EyeOff } from 'lucide-vue-next'

const router = useRouter()
const authStore = useAuthStore()

const form = ref({
  identifier: '',
  password: ''
})

const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  loading.value = true
  error.value = ''

  try {
    const result = await authStore.login(form.value)
    
    if (result.success) {
      // 等待一小会儿确保 store 已更新
      await new Promise(resolve => setTimeout(resolve, 100))
      // 使用 replace 而不是 push，避免可以返回到登录页
      await router.replace('/')
    } else {
      error.value = result.error || '登录失败,请检查用户名和密码'
    }
  } catch (err) {
    console.error('Login error:', err)
    error.value = '登录失败,请稍后重试'
  } finally {
    loading.value = false
  }
}
</script>
