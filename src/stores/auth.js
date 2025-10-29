import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { login as apiLogin } from "@/api/auth"

export const useAuthStore = defineStore("auth", () => {
  // 从 localStorage 获取 token，如果是 "undefined" 或 "null" 字符串则清除
  const storedToken = localStorage.getItem("token")
  const token = ref("")

  // 初始化 token，确保不是无效值
  if (storedToken && storedToken !== "undefined" && storedToken !== "null") {
    token.value = storedToken
  } else if (storedToken) {
    // 清除无效的 token
    localStorage.removeItem("token")
  }

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    try {
      const response = await apiLogin(credentials)
      console.log('Login API response:', response) // 调试日志

      // API 返回格式: { code: 0, message: "token字符串" }
      const accessToken = response.message

      if (!accessToken || typeof accessToken !== 'string') {
        console.error('Invalid token received:', accessToken)
        throw new Error('未收到有效的访问令牌')
      }

      // 设置 token
      token.value = accessToken
      localStorage.setItem("token", accessToken)

      console.log('Login successful, token set:', accessToken.substring(0, 30) + '...')

      return { success: true }
    } catch (error) {
      console.error('Login error:', error)
      // 清除可能存在的无效 token
      token.value = ""
      localStorage.removeItem("token")
      return { success: false, error: error.message || '登录失败' }
    }
  }

  function logout() {
    token.value = ""
    localStorage.removeItem("token")
    console.log('User logged out')
  }

  return {
    token,
    isAuthenticated,
    login,
    logout,
  }
})
