import { devLog } from '@/components/utils/dev-log'
import { ref, onMounted } from 'vue'

declare global {
  interface Window {
    grecaptcha: {
      execute: () => void
      ready: (callback: () => void) => void
      render: (element: string | Element, options: Record<string, unknown>) => number
    }
    onCaptchaSuccess: (token: string) => void
    onCaptchaError: () => void
    onloadCallback: () => void
  }
}

interface RecaptchaOptions {
  sitekey: string
  elementId: string
  onSuccess?: (token: string) => void
  onError?: () => void
  timeoutMs?: number
}

export function useRecaptcha(options: RecaptchaOptions) {
  const isReady = ref(false)
  const error = ref<string | null>(null)

  const initializeRecaptcha = () => {
    // Explicitly render the reCAPTCHA widget
    const recaptchaElement = document.getElementById(options.elementId)
    if (recaptchaElement) {
      try {
        window.grecaptcha.render(options.elementId, {
          sitekey: options.sitekey,
          size: 'invisible',
          callback: 'onCaptchaSuccess',
          'error-callback': 'onCaptchaError',
          badge: 'inline'
        })

        isReady.value = true
        error.value = null
      } catch (err) {
        console.error('Failed to render reCAPTCHA widget:', err)
        error.value = 'Failed to initialize reCAPTCHA'
      }
    } else {
      console.error('reCAPTCHA element not found')
      error.value = 'reCAPTCHA element not found'
    }
  }

  const execute = (): Promise<{ success: boolean, data?: { token: string }, error?: string }> => {
    devLog('execute recaptcha', 'useRecaptcha.ts')

    const timeoutMs = options.timeoutMs || 10000

    return new Promise((resolve, reject) => {
      if (!isReady.value) {
        const errorMsg = 'reCAPTCHA not ready'
        console.error(errorMsg)
        error.value = errorMsg
        reject(new Error(errorMsg))
        return
      }

      // Check if reCAPTCHA widget exists
      const recaptchaWidget = document.getElementById(options.elementId)
      if (!recaptchaWidget) {
        const errorMsg = 'reCAPTCHA widget not found'
        console.error(errorMsg)
        error.value = errorMsg
        reject(new Error(errorMsg))
        return
      }

      error.value = null

      // Set up timeout to reject the promise if the recaptcha takes too long
      const timeoutId = setTimeout(() => {
        reject(new Error('reCAPTCHA verification timeout'))
      }, timeoutMs)

      try {
        // Check if grecaptcha is available and has the execute method
        if (typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function') {
          devLog('grecaptcha is available and has the execute method', 'useRecaptcha.ts')
          window.onCaptchaSuccess = (token: string) => {
            devLog('Recaptcha success', 'useRecaptcha.ts')
            clearTimeout(timeoutId)
            if (options.onSuccess) {
              options.onSuccess(token)
            }
            resolve({ success: true, data: { token } })
          }

          window.onCaptchaError = () => {
            const errorMsg = 'reCAPTCHA verification failed'
            error.value = errorMsg
            clearTimeout(timeoutId)
            if (options.onError) {
              options.onError()
            }
            reject(new Error(errorMsg))
          }

          window.grecaptcha.execute()
        } else {
          const errorMsg = 'grecaptcha.execute is not available'
          console.error(errorMsg)
          error.value = errorMsg
          clearTimeout(timeoutId)
          reject(new Error(errorMsg))
        }
      } catch (err) {
        const errorMsg = 'reCAPTCHA execution failed'
        console.error(errorMsg, err)
        error.value = errorMsg
        clearTimeout(timeoutId)
        reject(new Error(errorMsg))
      }
    })
  }

  const reset = () => {
    error.value = null
  }

  onMounted(() => {
    window.onloadCallback = () => {
      // Initialize reCAPTCHA when the script loads if it's not already initialized
      if (typeof window.grecaptcha !== 'undefined') {
        initializeRecaptcha()
      }
    }

    const script = document.createElement('script')
    script.src = 'https://www.google.com/recaptcha/api.js?onload=onloadCallback&render=explicit'
    script.async = true
    script.defer = true
    document.head.appendChild(script)
  })

  return {
    isReady,
    error,
    execute,
    reset
  }
}
