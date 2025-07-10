<script setup lang="ts">
import BasicText from './BasicText.vue'
import PrimaryButton from './PrimaryButton.vue'
import InputText from './InputText.vue'
import InputGroup from './InputGroup.vue'
import { useFormValidation } from '../composables/useFormValidation'
import z from 'zod'
import { onMounted, ref } from 'vue'
import TextArea from './TextArea.vue'

declare global {
  interface Window {
    grecaptcha: {
      execute: () => void
    }
    onCaptchaSuccess: () => void
    onCaptchaError: () => void
  }
}
const formStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

const contactFormSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.email('Please enter a valid email address'),
  message: z.string().min(1, 'Message is required'),
})

const {
  formData,
  errors,
  handleBlur,
  handleInputChange,
  handleSubmit: validateAndSubmit,
} = useFormValidation(contactFormSchema)

const handleSubmit = (event: Event) => {
  event.preventDefault()
  window.grecaptcha.execute()
}

const onCaptchaSuccess = () => {
  validateAndSubmit((data) => {
    // Form is valid, proceed with submission
    console.log('Form submitted:', data)
  })
}

const onCaptchaError = () => {
  formStatus.value = 'error'
}

onMounted(() => {
  window.onCaptchaSuccess = onCaptchaSuccess
  window.onCaptchaError = onCaptchaError
})

defineExpose({ formStatus })
</script>

<template>
  <form :class="$style.contactForm" @submit="handleSubmit">
    <InputGroup>
      <InputText
        id="name"
        label="First name"
        type="text"
        v-model="formData.name"
        :error="errors.name"
        required
        @blur="handleBlur('name')"
        @input="handleInputChange('name')"
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
    <div :class="[$style.success, $style.message]" v-if="formStatus === 'success'" role="status">
      <p>Your message has been sent. We will get back to you as soon as possible.</p>
    </div>
    <div :class="[$style.error, $style.message]" v-else-if="formStatus === 'error'" role="alert">
      <p>An error occurred while sending your message. Please try again.</p>
    </div>
    <div
      :class="[$style.recaptcha, 'g-recaptcha']"
      data-sitekey="6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI"
      data-size="invisible"
      data-callback="onCaptchaSuccess"
      data-error-callback="onCaptchaError"
    ></div>
    <PrimaryButton
      label="Send Message"
      type="submit"
      :status="formStatus === 'loading' ? 'loading' : 'idle'"
    />
  </form>
</template>

<style module lang="scss">
.contactForm {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-l);
}

.message {
  margin: var(--space-m);
  font-size: var(--text-s);
}

.recaptcha {
  position: absolute;
}
</style>
