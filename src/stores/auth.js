import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { login as apiLogin } from "@/api/auth"

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token") || "")
  const user = ref(JSON.parse(localStorage.getItem("user") || "null"))

  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    try {
      const response = await apiLogin(credentials)
      token.value = response.token
      user.value = response.user

      localStorage.setItem("token", response.token)
      localStorage.setItem("user", JSON.stringify(response.user))

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  function logout() {
    token.value = ""
    user.value = null
    localStorage.removeItem("token")
    localStorage.removeItem("user")
  }

  return {
    token,
    user,
    isAuthenticated,
    login,
    logout,
  }
})
