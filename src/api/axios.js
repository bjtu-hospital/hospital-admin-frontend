import axios from "axios"
import { useAuthStore } from "@/stores/auth"

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:8000",
  timeout: 10000,
})

instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

instance.interceptors.response.use(
  (response) => {
    // 检查业务代码，code: 105 表示认证失效
    if (response.data?.code === 105) {
      const authStore = useAuthStore()
      authStore.logout()

      // 重定向到登录页
      if (window.location.pathname !== '/login') {
        window.location.href = "/login"
      }

      // 返回一个被拒绝的 Promise
      return Promise.reject(new Error(response.data?.message?.msg || '认证失效'))
    }
    return response
  },
  (error) => {
    // 同时保留 HTTP 401 的处理
    if (error.response?.status === 401) {
      const authStore = useAuthStore()
      authStore.logout()

      if (window.location.pathname !== '/login') {
        window.location.href = "/login"
      }
    }
    return Promise.reject(error)
  },
)

export default instance
