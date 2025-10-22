import { defineStore } from "pinia"
import { ref } from "vue"

export const useSidebarStore = defineStore("sidebar", () => {
  const isCollapsed = ref(false)

  function toggle() {
    isCollapsed.value = !isCollapsed.value
  }

  return {
    isCollapsed,
    toggle,
  }
})
