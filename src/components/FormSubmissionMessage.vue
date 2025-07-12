<script setup lang="ts">
import { CircleCheck, CircleAlert } from 'lucide-vue-next'

defineProps<{
  status: 'idle' | 'loading' | 'success' | 'error'
}>()
</script>

<template>
  <Transition name="message" :duration="300">
    <div :class="[$style.success, $style.message]" v-if="status === 'success'" role="status">
      <CircleCheck :size="36" />
      <p>Your message has been sent. <br />We will get back to you as soon as possible.</p>
    </div>
    <div :class="[$style.error, $style.message]" v-else-if="status === 'error'" role="alert">
      <CircleAlert :size="36" />
      <p>An error occurred while sending your message. <br />Please try again.</p>
    </div>
  </Transition>
</template>

<style module lang="scss">
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
  overflow: hidden;
  p {
    color: var(--color-text-100);
  }
}
</style>

<style lang="scss">
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
