import { devLog } from '@/utils/dev-log'
import { reactive, ref } from 'vue'
import z from 'zod'

export function useFormValidation(schema: z.ZodObject<Record<string, z.ZodTypeAny>>) {
  // Initialize formData with empty strings
  const initialFormData: Record<string, string> = {}
  Object.keys(schema.shape).forEach((key) => {
    initialFormData[key] = ''
  })

  const formData = reactive<Record<string, string>>(initialFormData)
  const errors = reactive<Record<string, string | undefined>>({})
  const messageSent = ref(false)

  // Clear form data and errors
  const clearForm = () => {
    Object.keys(formData).forEach((key) => {
      formData[key] = ''
    })
    Object.keys(errors).forEach((key) => {
      errors[key] = undefined
    })
    messageSent.value = false
  }

  // Validate a single field
  const validateField = (field: string) => {
    const fieldSchema = schema.shape[field]
    const { error } = fieldSchema.safeParse(formData[field])
    errors[field] = error?.issues[0].message
  }

  // Validate the entire form
  const validateForm = () => {
    const { error } = schema.safeParse(formData)

    if (error) {
      // Set all error messages
      error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        errors[field] = issue.message
      })
      return { success: false, errors }
    }

    // On success, return the form data
    return { success: true, data: formData }
  }

  const handleSubmit = async (onSuccess?: (data: Record<string, string>) => Promise<void>): Promise<{ success: boolean, data?: Record<string, string>, errors?: Record<string, string | undefined> }> => {
    const result = validateForm()
    devLog(`Form validation result: ${JSON.stringify(result)}`, 'useFormValidation.ts')

    // If form is valid, call onSuccess and return the data
    if (result.success && result.data) {
      messageSent.value = true
      await onSuccess?.(result.data)
      clearForm()
      return { success: true, data: result.data }
    }

    // If form is invalid, return the errors
    return { success: false, errors: result.errors }
  }

  return {
    formData,
    errors,
    messageSent,
    clearForm,
    validateField,
    validateForm,
    handleSubmit,
  }
}
