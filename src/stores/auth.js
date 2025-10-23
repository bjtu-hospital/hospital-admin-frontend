import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { login as apiLogin } from "@/api/auth"

export const useAuthStore = defineStore("auth", () => {
  const token = ref(localStorage.getItem("token") || "")
  const isAuthenticated = computed(() => !!token.value)

  async function login(credentials) {
    try {
      const response = await apiLogin(credentials)
      token.value = response.message.access_token
      localStorage.setItem("token", token.value)

      return { success: true }
    } catch (error) {
      return { success: false, error: error.message }
    }
  }

  function logout() {
    token.value = ""
    localStorage.removeItem("token")
  }

  return {
    token,
    isAuthenticated,
    login,
    logout,
  }
})
