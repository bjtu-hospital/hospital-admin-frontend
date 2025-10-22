<template>
  <div class="min-h-screen bg-background">
    <Sidebar />
    
    <div
      class="transition-all duration-300"
      :class="sidebarStore.isCollapsed ? 'ml-16' : 'ml-64'"
    >
      <Header />
      
      <main class="p-6">
        <router-view />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useSidebarStore } from '@/stores/sidebar'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'

const sidebarStore = useSidebarStore()
</script>
