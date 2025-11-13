<template>
  <nav class="bg-white dark:bg-gray-800 rounded-lg shadow-sm px-4 py-3 mb-6">
    <ol class="flex items-center space-x-2 text-sm">
      <li 
        v-for="(item, index) in breadcrumbs" 
        :key="index"
        class="flex items-center"
      >
        <button
          v-if="index < breadcrumbs.length - 1"
          @click="handleClick(item, index)"
          class="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:underline transition-colors"
        >
          {{ item.name }}
        </button>
        <span v-else class="text-gray-700 dark:text-gray-300 font-medium">
          {{ item.name }}
        </span>
        
        <svg
          v-if="index < breadcrumbs.length - 1"
          class="w-4 h-4 mx-2 text-gray-400 dark:text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            stroke-width="2"
            d="M9 5l7 7-7 7"
          />
        </svg>
      </li>
    </ol>
  </nav>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  items: {
    type: Array,
    required: true,
    default: () => []
  }
})

const emit = defineEmits(['navigate'])

const breadcrumbs = computed(() => props.items)

const handleClick = (item, index) => {
  emit('navigate', { item, index })
}
</script>

<style scoped>
button:focus {
  outline: none;
}
</style>
