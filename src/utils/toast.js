import { ref } from 'vue'

const toasts = ref([])
let toastId = 0

export function useToast() {
    const showToast = (message, type = 'info', duration = 3000) => {
        const id = toastId++
        toasts.value.push({ id, message, type })

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }

    const removeToast = (id) => {
        const index = toasts.value.findIndex(t => t.id === id)
        if (index > -1) {
            toasts.value.splice(index, 1)
        }
    }

    const success = (message, duration = 3000) => {
        showToast(message, 'success', duration)
    }

    const error = (message, duration = 3000) => {
        showToast(message, 'error', duration)
    }

    const warning = (message, duration = 3000) => {
        showToast(message, 'warning', duration)
    }

    const info = (message, duration = 3000) => {
        showToast(message, 'info', duration)
    }

    return {
        toasts,
        success,
        error,
        warning,
        info,
        removeToast
    }
}
