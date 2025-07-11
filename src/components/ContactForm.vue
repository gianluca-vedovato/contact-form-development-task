<script setup lang="ts">
import BasicText from './BasicText.vue'
import PrimaryButton from './PrimaryButton.vue'
import InputText from './InputText.vue'
import InputGroup from './InputGroup.vue'
import { useFormValidation } from '@/composables/useFormValidation'
import { useRecaptcha } from '@/composables/useRecaptcha'
import z from 'zod'
import { computed, ref } from 'vue'
import TextArea from './TextArea.vue'
import { CircleCheck, CircleAlert } from 'lucide-vue-next'
import { useSupabase } from '@/composables/useSupabase'

const formStatus = ref<'idle' | 'loading' | 'success' | 'error'>('idle')

const contactFormSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
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

const { insertFormSubmission } = useSupabase()

const submit = (token: string) => {
  validateAndSubmit(async (data) => {
    // Form is valid, proceed with submission
    try {
      await insertFormSubmission({
        ...data,
        recaptchaToken: token,
      })

      formStatus.value = 'success'
    } catch (error) {
      console.error('Error inserting form submission:', error)
      formStatus.value = 'error'
    }
  })
}

const { execute: executeRecaptcha } = useRecaptcha({
  sitekey: '6LcDN38rAAAAAK0MndMGS0G5H4dIdmUQRUblwNaf',
  elementId: 'recaptcha-widget',
})

const handleSubmit = async (event: Event) => {
  event.preventDefault()
  formStatus.value = 'loading'

  try {
    const token = await executeRecaptcha()
    submit(token)
  } catch (error) {
    console.error('reCAPTCHA execution failed:', error)
    formStatus.value = 'error'
  }
}

const submitButtonStatus = computed(() => {
  if (formStatus.value === 'loading') return 'loading'
  if (Object.values(errors).some((error) => error)) return 'disabled'
  return 'idle'
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
    <Transition name="message" :duration="300">
      <div :class="[$style.success, $style.message]" v-if="formStatus === 'success'" role="status">
        <CircleCheck :size="36" />
        <p>Your message has been sent. We will get back to you as soon as possible.</p>
      </div>
      <div :class="[$style.error, $style.message]" v-else-if="formStatus === 'error'" role="alert">
        <CircleAlert :size="36" />
        <p>An error occurred while sending your message. Please try again.</p>
      </div>
    </Transition>
    <div
      id="recaptcha-widget"
      :class="[$style.recaptcha, 'g-recaptcha']"
      data-sitekey="6LcDN38rAAAAAK0MndMGS0G5H4dIdmUQRUblwNaf"
      data-size="invisible"
      data-callback="onCaptchaSuccess"
      data-error-callback="onCaptchaError"
      data-badge="inline"
    ></div>
    <PrimaryButton label="Send Message" type="submit" :status="submitButtonStatus" />
    <BasicText size="s" :class="$style.recaptchaDisclaimer">
      This site is protected by reCAPTCHA and the Google
      <a href="https://policies.google.com/privacy">Privacy Policy</a> and
      <a href="https://policies.google.com/terms">Terms of Service</a> apply.
    </BasicText>
  </form>
</template>

<style module lang="scss">
.contactForm {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-l);
}

.success {
  color: var(--color-success);
}

.error {
  color: var(--color-error);
}

.message {
  margin: var(--space-m) 0;
  font-size: var(--text-m);
  display: flex;
  align-items: center;
  gap: var(--space-s);
  p {
    color: var(--color-text-100);
  }
}

.recaptcha {
  position: absolute;
}
</style>

<style>
.message-enter-active,
.message-leave-active {
  svg {
    transition:
      opacity 0.3s ease-in-out,
      transform 0.3s ease-in-out;
  }
  p {
    transition: opacity 0.3s ease-in-out;
  }
}

.message-enter-from,
.message-leave-to {
  svg {
    transform: scale(0.5);
    opacity: 0;
  }
  p {
    opacity: 0;
  }
}
</style>
