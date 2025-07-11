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

  const execute = (): Promise<string> => {
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

      try {
        // Check if grecaptcha is available and has the execute method
        if (typeof window.grecaptcha !== 'undefined' && typeof window.grecaptcha.execute === 'function') {

          window.onCaptchaSuccess = (token: string) => {
            if (options.onSuccess) {
              options.onSuccess(token)
            }
            resolve(token)
          }

          window.onCaptchaError = () => {
            const errorMsg = 'reCAPTCHA verification failed'
            error.value = errorMsg
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
          reject(new Error(errorMsg))
        }
      } catch (err) {
        const errorMsg = 'reCAPTCHA execution failed'
        console.error(errorMsg, err)
        error.value = errorMsg
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

    // If grecaptcha is already available, initialize immediately
    if (typeof window.grecaptcha !== 'undefined') {
      initializeRecaptcha()
    }
  })

  return {
    isReady,
    error,
    execute,
    reset
  }
}
