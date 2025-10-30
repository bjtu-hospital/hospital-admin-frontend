<template>
  <Teleport to="body">
    <div class="fixed top-20 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[9999] space-y-2 pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          :class="[
            'pointer-events-auto px-6 py-4 rounded-lg shadow-2xl border min-w-[350px] max-w-md',
            'flex items-center gap-3 transition-all duration-300',
            toastClasses[toast.type]
          ]"
        >
          <component :is="toastIcons[toast.type]" class="w-6 h-6 flex-shrink-0" />
          <p class="text-base font-medium flex-1">{{ toast.message }}</p>
          <button
            @click="removeToast(toast.id)"
            class="flex-shrink-0 p-1 hover:bg-white/20 rounded transition-colors"
          >
            <X class="w-4 h-4" />
          </button>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
import { CheckCircle, AlertCircle, AlertTriangle, Info, X } from 'lucide-vue-next'
import { useToast } from '@/utils/toast'

const { toasts, removeToast } = useToast()

const toastClasses = {
  success: 'bg-green-500 border-green-600 text-white',
  error: 'bg-red-500 border-red-600 text-white',
  warning: 'bg-orange-500 border-orange-600 text-white',
  info: 'bg-blue-500 border-blue-600 text-white'
}

const toastIcons = {
  success: CheckCircle,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info
}
</script>

<style scoped>
.toast-enter-active {
  animation: toast-in 0.3s ease-out;
}

.toast-leave-active {
  animation: toast-out 0.3s ease-in;
}

@keyframes toast-in {
  from {
    opacity: 0;
    transform: scale(0.8);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes toast-out {
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(0.8);
  }
}
</style>