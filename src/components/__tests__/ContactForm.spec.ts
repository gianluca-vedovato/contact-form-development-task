import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import ContactForm from '../ContactForm.vue'

// Mock the composable
vi.mock('../composables/useFormValidation', () => ({
  useFormValidation: () => ({
    formData: {
      name: '',
      lastName: '',
      email: '',
      message: '',
    },
    errors: {},
    handleBlur: vi.fn(),
    handleInputChange: vi.fn(),
    handleSubmit: vi.fn(),
  }),
}))

describe('ContactForm', () => {
  let mockGrecaptcha: { execute: () => void }
  let mockOnCaptchaSuccess: () => void
  let mockOnCaptchaError: () => void

  beforeEach(() => {
    // Mock window.grecaptcha
    mockGrecaptcha = {
      execute: vi.fn(),
    }

    mockOnCaptchaSuccess = vi.fn()
    mockOnCaptchaError = vi.fn()

    // Mock window object
    Object.defineProperty(window, 'grecaptcha', {
      value: mockGrecaptcha,
      writable: true,
    })

    Object.defineProperty(window, 'onCaptchaSuccess', {
      value: mockOnCaptchaSuccess,
      writable: true,
    })

    Object.defineProperty(window, 'onCaptchaError', {
      value: mockOnCaptchaError,
      writable: true,
    })
  })

  it('renders all form fields correctly', () => {
    const wrapper = mount(ContactForm)

    // Check that all required form fields are present
    expect(wrapper.find('input[id="name"]').exists()).toBe(true)
    expect(wrapper.find('input[id="lastName"]').exists()).toBe(true)
    expect(wrapper.find('input[id="email"]').exists()).toBe(true)
    expect(wrapper.find('input[id="message"]').exists()).toBe(true)

    // Check that submit button is present
    expect(wrapper.find('button[type="submit"]').exists()).toBe(true)
    expect(wrapper.text()).toContain('Send Message')
  })

  it('renders privacy policy text', () => {
    const wrapper = mount(ContactForm)

    expect(wrapper.text()).toContain('For information about our privacy practices')
    expect(wrapper.text()).toContain('Privacy Policy')
    expect(wrapper.find('a[href="#"]').exists()).toBe(true)
  })

  it('triggers reCAPTCHA on form submission', async () => {
    const wrapper = mount(ContactForm)

    await wrapper.find('form').trigger('submit')

    expect(mockGrecaptcha.execute).toHaveBeenCalledTimes(1)
  })

  it('shows success message when formStatus is success', async () => {
    const wrapper = mount(ContactForm)

    // Set form status to success by directly accessing the ref
    wrapper.vm.formStatus = 'success'
    await wrapper.vm.$nextTick()

    const successMessage = wrapper.find('[role="status"]')
    expect(successMessage.exists()).toBe(true)
    expect(successMessage.text()).toContain('Your message has been sent')
  })

  it('shows error message when formStatus is error', async () => {
    const wrapper = mount(ContactForm)

    // Set form status to error by directly accessing the ref
    wrapper.vm.formStatus = 'error'
    await wrapper.vm.$nextTick()

    const errorMessage = wrapper.find('[role="alert"]')
    expect(errorMessage.exists()).toBe(true)
    expect(errorMessage.text()).toContain('An error occurred while sending your message')
  })

  it('sets loading status when form is clicked', async () => {
    const wrapper = mount(ContactForm)

    await wrapper.find('form').trigger('click')

    expect(wrapper.vm.formStatus).toBe('loading')
  })

  it('renders reCAPTCHA div with correct attributes', () => {
    const wrapper = mount(ContactForm)

    const recaptchaDiv = wrapper.find('.g-recaptcha')
    expect(recaptchaDiv.exists()).toBe(true)
    expect(recaptchaDiv.attributes('data-sitekey')).toBe('6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI')
    expect(recaptchaDiv.attributes('data-size')).toBe('invisible')
    expect(recaptchaDiv.attributes('data-callback')).toBe('onCaptchaSuccess')
    expect(recaptchaDiv.attributes('data-error-callback')).toBe('onCaptchaError')
  })
})
