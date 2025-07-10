import { describe, it, expect, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import PrimaryButton from '../PrimaryButton.vue'

describe('PrimaryButton', () => {
  it('shows label correctly', () => {
    const label = 'Click me'
    const wrapper = mount(PrimaryButton, { props: { label } })

    expect(wrapper.text()).toBe(label)
  })

  it('inserts attributes correctly from outside', () => {
    const wrapper = mount(PrimaryButton, {
      props: { label: 'Submit' },
      attrs: { type: 'submit', disabled: true },
    })

    const button = wrapper.find('button')
    expect(button.attributes('type')).toBe('submit')
    expect(button.attributes('disabled')).toBeDefined()
  })

  it('handles click events when @click is provided', async () => {
    const onClick = vi.fn()
    const wrapper = mount(PrimaryButton, {
      props: { label: 'Clickable Button' },
      attrs: { onClick },
    })

    const button = wrapper.find('button')
    await button.trigger('click')

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders button element when no href is provided', () => {
    const wrapper = mount(PrimaryButton, { props: { label: 'Button' } })

    expect(wrapper.find('button').exists()).toBe(true)
    expect(wrapper.find('a').exists()).toBe(false)
  })

  it('renders anchor element when href is provided', () => {
    const wrapper = mount(PrimaryButton, {
      props: { label: 'Link', href: '/some-page' },
    })

    expect(wrapper.find('a').exists()).toBe(true)
    expect(wrapper.find('button').exists()).toBe(false)
    expect(wrapper.find('a').attributes('href')).toBe('/some-page')
  })

  describe('status functionality', () => {
    it('renders with idle status by default', () => {
      const wrapper = mount(PrimaryButton, { props: { label: 'Test Button' } })

      const button = wrapper.find('button')
      expect(button.classes().some((cls) => cls.includes('status-idle'))).toBe(true)
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('renders with idle status when explicitly set', () => {
      const wrapper = mount(PrimaryButton, {
        props: { label: 'Test Button', status: 'idle' },
      })

      const button = wrapper.find('button')
      expect(button.classes().some((cls) => cls.includes('status-idle'))).toBe(true)
      expect(button.attributes('disabled')).toBeUndefined()
    })

    it('renders with loading status and shows spinner', () => {
      const wrapper = mount(PrimaryButton, {
        props: { label: 'Loading Button', status: 'loading' },
      })

      const button = wrapper.find('button')
      expect(button.classes().some((cls) => cls.includes('status-loading'))).toBe(true)
      expect(button.attributes('disabled')).toBeDefined()

      // Check for loading spinner
      const spinner = wrapper.find('svg')
      expect(spinner.exists()).toBe(true)
    })

    it('renders with disabled status', () => {
      const wrapper = mount(PrimaryButton, {
        props: { label: 'Disabled Button', status: 'disabled' },
      })

      const button = wrapper.find('button')
      expect(button.classes().some((cls) => cls.includes('status-disabled'))).toBe(true)
      expect(button.attributes('disabled')).toBeDefined()
    })

    it('prevents click events when in loading status', async () => {
      const onClick = vi.fn()
      const wrapper = mount(PrimaryButton, {
        props: { label: 'Loading Button', status: 'loading' },
        attrs: { onClick },
      })

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(onClick).not.toHaveBeenCalled()
    })

    it('prevents click events when in disabled status', async () => {
      const onClick = vi.fn()
      const wrapper = mount(PrimaryButton, {
        props: { label: 'Disabled Button', status: 'disabled' },
        attrs: { onClick },
      })

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(onClick).not.toHaveBeenCalled()
    })

    it('allows click events when in idle status', async () => {
      const onClick = vi.fn()
      const wrapper = mount(PrimaryButton, {
        props: { label: 'Idle Button', status: 'idle' },
        attrs: { onClick },
      })

      const button = wrapper.find('button')
      await button.trigger('click')

      expect(onClick).toHaveBeenCalledTimes(1)
    })
  })
})
