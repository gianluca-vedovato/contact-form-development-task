<script setup lang="ts">
import BasicText from './BasicText.vue'
import PrimaryButton from './PrimaryButton.vue'
import InputText from './InputText.vue'
import InputGroup from './InputGroup.vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { useRecaptcha } from '@/composables/useRecaptcha'
import z from 'zod'
import { computed, ref, watch } from 'vue'
import TextArea from './TextArea.vue'
import { useSupabase } from '@/composables/useSupabase'
import RecaptchaElement from './RecaptchaElement.vue'
import FormSubmissionMessage from './FormSubmissionMessage.vue'
import { devLog } from './utils/dev-log'

const formStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  message: z.string().min(1, 'Message is required'),
})

const {
  formData,
  errors,
  validateField,
  handleSubmit: validateAndSubmit,
} = useFormValidation(contactFormSchema)

const { insertFormSubmission } = useSupabase()

const { execute: executeRecaptcha } = useRecaptcha({
  sitekey: '6LcDN38rAAAAAK0MndMGS0G5H4dIdmUQRUblwNaf',
  elementId: 'recaptcha-widget',
  timeoutMs: 10000,
})

// Validate a single field on blur
const handleBlur = (field: string) => {
  validateField(field)
}

// Validate a single field on input if there is an error
const handleInputChange = (field: string) => {
  if (!errors[field]) return
  validateField(field)
}

// Form submission handler
// 1. Form validation
// 2. Recaptcha validation
// 3. Supabase submission
const handleSubmit = async () => {
  devLog('handleSubmit', 'ContactForm.vue')
  formStatus.value = 'loading'

  validateAndSubmit(async (data) => {
    try {
      // Execute recaptcha with built-in timeout
      const { data: recaptchaValidationData } = await executeRecaptcha()
      devLog(
        `Recaptcha execution result: ${recaptchaValidationData?.token ? 'success' : 'error'}`,
        'ContactForm.vue',
      )

      if (!recaptchaValidationData) {
        formStatus.value = 'error'
        return
      }

      // Submit form with built-in timeout
      const submissionResult = await insertFormSubmission({
        ...data,
        recaptchaToken: recaptchaValidationData.token,
      })

      devLog(`Submission result: ${JSON.stringify(submissionResult)}`, 'ContactForm.vue')
      if (!submissionResult.success) {
        formStatus.value = 'error'
        return
      }
      devLog('Form submission successful', 'ContactForm.vue')
      formStatus.value = 'success'
    } catch (error) {
      devLog(
        `Form submission error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'ContactForm.vue',
      )
      formStatus.value = 'error'
    }
  })
}

// Submit button is in loading state if form is loading
// Submit button is disabled if there are errors
// Submit button is idle if there are no errors
const submitButtonStatus = computed(() => {
  if (formStatus.value === 'loading') return 'loading'
  if (Object.values(errors).some((error) => error)) return 'disabled'
  return 'idle'
})

// Reset form status after 3 seconds
watch(formStatus, (newStatus: 'idle' | 'loading' | 'success' | 'error') => {
  if (newStatus === 'success' || newStatus === 'error') {
    setTimeout(() => {
      formStatus.value = 'idle'
    }, 6000)
  }
})
</script>

<template>
  <form :class="$style.contactForm" @submit.prevent="handleSubmit">
    <InputGroup>
      <InputText
        id="name"
        label="First name"
        type="text"
        v-model="formData.firstName"
        :error="errors.firstName"
        required
        @blur="handleBlur('firstName')"
        @input="handleInputChange('firstName')"
      />
      <InputText
        id="lastName"
        label="Last name"
        type="text"
        v-model="formData.lastName"
        :error="errors.lastName"
        required
        @blur="handleBlur('lastName')"
        @input="handleInputChange('lastName')"
      />
    </InputGroup>
    <InputText
      id="email"
      label="Work Email"
      type="email"
      v-model="formData.email"
      :error="errors.email"
      required
      @blur="handleBlur('email')"
      @input="handleInputChange('email')"
    />
    <TextArea
      id="message"
      label="Message"
      placeholder="Enter your message"
      v-model="formData.message"
      :error="errors.message"
      required
      @blur="handleBlur('message')"
      @input="handleInputChange('message')"
    />
    <BasicText>
      For information about our privacy practices and commitment to protecting your privacy, please
      review our <a href="#">Privacy Policy</a>.
    </BasicText>
    <FormSubmissionMessage :status="formStatus" />
    <PrimaryButton label="Send Message" type="submit" :status="submitButtonStatus" />
    <RecaptchaElement />
  </form>
</template>

<style module lang="scss">
.contactForm {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-l);
}
</style>
