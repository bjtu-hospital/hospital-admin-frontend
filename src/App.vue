<template>
  <Toast />
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import Toast from '@/components/Toast.vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initTheme()
})
</script>
