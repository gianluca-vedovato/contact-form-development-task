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

  // Validate a single field on blur
  const handleBlur = (field: string) => {
    validateField(field)
  }

  // Validate a single field on input if there is an error
  const handleInputChange = (field: string) => {
    if (!errors[field]) return
    validateField(field)
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

  const handleSubmit = (onSuccess?: (data: Record<string, string>) => void) => {
    const result = validateForm()

    if (result.success) {
      messageSent.value = true
      onSuccess?.(result.data)
      clearForm()
      return result
    }

    return result
  }

  return {
    formData,
    errors,
    messageSent,
    clearForm,
    validateField,
    handleBlur,
    handleInputChange,
    validateForm,
    handleSubmit,
  }
}
