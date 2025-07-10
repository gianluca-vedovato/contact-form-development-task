<script setup lang="ts"></script>

<template>
  <div :class="$style.card">
    <slot />
  </div>
</template>

<style module lang="scss">
@use '@/assets/styles/mixins';

.card {
  background-color: var(--color-primary-50);
  border-radius: var(--rounded);
  padding: var(--space-xl);
  width: 100%;

  @include mixins.mq(md) {
    width: 500px;
  }
}
</style>
