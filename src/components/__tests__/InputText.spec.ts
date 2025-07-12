import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import InputText from '../InputText.vue'

describe('InputText', () => {
  it('renders with required props', () => {
    const wrapper = mount(InputText, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        type: 'text',
        required: true,
      },
    })

    const input = wrapper.find('input')
    const label = wrapper.find('label')

    expect(input.exists()).toBe(true)
    expect(label.exists()).toBe(true)
    expect(input.attributes('id')).toBe('test-input')
    expect(input.attributes('type')).toBe('text')
    expect(input.attributes('required')).toBeDefined()
    expect(label.text()).toContain('Test Label')
    expect(label.text()).toContain('*')
  })

  it('shows floating label when input has value', async () => {
    const wrapper = mount(InputText, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        type: 'text',
        required: false,
      },
    })

    const label = wrapper.find('label')
    const input = wrapper.find('input')

    // Initially, label should not be floating
    expect(label.classes().some((cls) => cls.includes('floating'))).toBe(false)

    // After setting value, label should float
    await input.setValue('test value')
    expect(label.classes().some((cls) => cls.includes('floating'))).toBe(true)
  })

  it('shows floating label when input is focused', async () => {
    const wrapper = mount(InputText, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        type: 'text',
        required: false,
      },
    })

    const label = wrapper.find('label')
    const input = wrapper.find('input')

    // Initially, label should not be floating
    expect(label.classes().some((cls) => cls.includes('floating'))).toBe(false)

    // After focus, label should float
    await input.trigger('focus')
    expect(label.classes().some((cls) => cls.includes('floating'))).toBe(true)

    // After blur, label should not float (if no value)
    await input.trigger('blur')
    expect(label.classes().some((cls) => cls.includes('floating'))).toBe(false)
  })

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'This field is required'
    const wrapper = mount(InputText, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        type: 'text',
        required: false,
        error: errorMessage,
      },
    })

    const errorElement = wrapper.find('[role="alert"]')
    const input = wrapper.find('input')

    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toBe(errorMessage)
    expect(input.classes().some((cls) => cls.includes('error'))).toBe(true)
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('test-input-error')
  })

  it('does not show required asterisk when required is false', () => {
    const wrapper = mount(InputText, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        type: 'text',
        required: false,
      },
    })

    const label = wrapper.find('label')
    expect(label.text()).not.toContain('*')
  })

  it('displays error message with correct styling and accessibility attributes', () => {
    const errorMessage = 'Invalid email format'
    const wrapper = mount(InputText, {
      props: {
        id: 'email-input',
        label: 'Email',
        type: 'email',
        required: true,
        error: errorMessage,
      },
    })

    const errorElement = wrapper.find('[role="alert"]')
    const input = wrapper.find('input')

    // Check error message exists and has correct content
    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toBe(errorMessage)
    expect(errorElement.attributes('id')).toBe('email-input-error')

    // Check input has error styling
    expect(input.classes().some((cls) => cls.includes('error'))).toBe(true)

    // Check accessibility attributes
    expect(input.attributes('aria-invalid')).toBe('true')
    expect(input.attributes('aria-describedby')).toBe('email-input-error')
  })

  it('removes error message when error prop is cleared', async () => {
    const wrapper = mount(InputText, {
      props: {
        id: 'test-input',
        label: 'Test Label',
        type: 'text',
        required: false,
        error: 'Some error',
      },
    })

    let errorElement = wrapper.find('[role="alert"]')
    expect(errorElement.exists()).toBe(true)

    // Clear the error prop
    await wrapper.setProps({ error: undefined })

    errorElement = wrapper.find('[role="alert"]')
    expect(errorElement.exists()).toBe(false)
  })
})
