<script setup lang="ts">
import { computed, onMounted, useAttrs } from 'vue'
import { LoaderCircle } from 'lucide-vue-next'

interface Props {
  label?: string
  href?: string
  status?: 'idle' | 'loading' | 'disabled'
}

const props = withDefaults(defineProps<Props>(), {
  status: 'idle',
})
const attrs = useAttrs()

const buttonType = computed(() => (props.href ? 'a' : 'button'))

// Check if button has functionality
const hasFunctionality = computed(() => {
  const hasHref = !!props.href
  const hasSubmitType = attrs.type === 'submit'
  const hasOnClick = !!attrs.onClick

  return hasHref || hasSubmitType || hasOnClick
})

// Check if button has accessibility
const hasAccessibility = computed(() => {
  const hasLabel = !!props.label
  const hasAriaLabel = !!attrs['aria-label']

  return hasLabel || hasAriaLabel
})

onMounted(() => {
  if (!hasFunctionality.value && process.env.NODE_ENV === 'development') {
    console.warn(
      `[PrimaryButton] Button "${props.label}" is missing required functionality. Please provide either: href, type="submit", or @click function.`,
    )
  }

  if (!hasAccessibility.value && process.env.NODE_ENV === 'development') {
    console.warn(
      `[PrimaryButton] Button is missing accessibility. Please provide either a label or aria-label.`,
    )
  }
})
</script>

<template>
  <component
    :is="buttonType"
    :class="[$style.primaryButton, $style[`status-${status}`]]"
    :href="href"
    v-bind="$attrs"
    :disabled="status === 'loading' || status === 'disabled'"
  >
    <Transition name="loading-icon" mode="out-in">
      <span v-if="status === 'loading'" :class="$style.loading">
        <LoaderCircle :size="20" :class="$style.spinner" />
      </span>
    </Transition>
    <span :class="$style.label">{{ label }}</span>
  </component>
</template>

<style module lang="scss">
@use '@/assets/styles/variables';
@use 'sass:color';

.primaryButton {
  position: relative;
  background-color: var(--color-primary-100);
  color: var(--color-primary-50);
  padding: var(--space-s) var(--space-l);
  border-radius: var(--rounded);
  font-family: var(--font-body);
  font-size: 1rem;
  line-height: 1.5;
  font-weight: var(--font-weight-medium);
  box-shadow: 0px 4px 4px 0px rgba(0, 0, 0, 0.4);
  cursor: pointer;
  max-width: 250px;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  transition:
    transform 0.1s ease-in-out,
    box-shadow 0.1s ease-in-out,
    background-color 0.1s ease-in-out;
  &:hover,
  &:focus-visible,
  &.status-loading {
    background-color: color.adjust(variables.$color-primary-100, $lightness: 3%);
    transform: translateY(2px);
    box-shadow: 0px 0px 0px 0px rgba(0, 0, 0, 0.4);
  }
  &:focus-visible {
    box-shadow: 0px 0px 0px 2px var(--color-accent-100);
  }

  .label {
    position: relative;
    display: block;
    transition:
      transform 0.2s ease-in-out,
      opacity 0.2s ease-in-out;
  }

  &.status-loading {
    pointer-events: none;
    background-color: var(--color-text-50);

    .label {
      transform: translateX(0.75rem);
    }
  }

  &.status-disabled {
    pointer-events: none;
    background-color: var(--color-text-50);
  }
}

.loading {
  position: absolute;
  top: 50%;
  left: calc(var(--space-l) - 0.75rem);
  transform: translateY(-50%);
}

.spinner {
  display: block;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>

<style>
.loading-icon-enter-active,
.loading-icon-leave-active {
  transition:
    opacity 0.2s ease-in-out,
    transform 0.2s ease-in-out;
}

.loading-icon-enter-from,
.loading-icon-leave-to {
  opacity: 0.6;
  transform: translateY(-50%) scale(0);
}
</style>
