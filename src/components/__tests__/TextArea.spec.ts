import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import TextArea from '../TextArea.vue'

describe('TextArea', () => {
  it('renders with required props', () => {
    const wrapper = mount(TextArea, {
      props: {
        id: 'test-textarea',
        label: 'Test Label',
        required: true,
        placeholder: 'Type here...',
      },
    })

    const textarea = wrapper.find('textarea')
    const label = wrapper.find('label')

    expect(textarea.exists()).toBe(true)
    expect(label.exists()).toBe(true)
    expect(textarea.attributes('id')).toBe('test-textarea')
    expect(textarea.attributes('required')).toBeDefined()
    expect(textarea.attributes('placeholder')).toBe('Type here...')
    expect(label.text()).toContain('Test Label')
    expect(label.text()).toContain('*')
  })

  it('displays error message when error prop is provided', () => {
    const errorMessage = 'This field is required'
    const wrapper = mount(TextArea, {
      props: {
        id: 'test-textarea',
        label: 'Test Label',
        required: false,
        error: errorMessage,
      },
    })

    const errorElement = wrapper.find('[role="alert"]')
    const textarea = wrapper.find('textarea')

    expect(errorElement.exists()).toBe(true)
    expect(errorElement.text()).toBe(errorMessage)
    expect(textarea.classes().some((cls) => cls.includes('error'))).toBe(true)
    expect(textarea.attributes('aria-invalid')).toBe('true')
    expect(textarea.attributes('aria-describedby')).toBe('test-textarea-error')
  })

  it('does not show required asterisk when required is false', () => {
    const wrapper = mount(TextArea, {
      props: {
        id: 'test-textarea',
        label: 'Test Label',
        required: false,
      },
    })

    const label = wrapper.find('label')
    expect(label.text()).not.toContain('*')
  })

  it('binds v-model correctly', async () => {
    let modelValue = ''
    const wrapper = mount(TextArea, {
      props: {
        id: 'test-textarea',
        label: 'Test Label',
        required: false,
        modelValue,
        'onUpdate:modelValue': (val?: string) => {
          modelValue = val ?? ''
          wrapper.setProps({ modelValue })
        },
      },
    })

    const textarea = wrapper.find('textarea')
    await textarea.setValue('Hello world')
    expect(modelValue).toBe('Hello world')
  })
})
