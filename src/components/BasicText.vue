<script setup lang="ts"></script>

<template>
  <p :class="$style.basicText"><slot /></p>
</template>

<style module lang="scss">
.basicText {
  font-size: var(--text-m);
  line-height: var(--leading-m);
  color: var(--color-text-50);
  a {
    color: var(--color-primary-100);
    text-decoration: underline;
    transition: opacity 0.2s ease-in-out;
    &:hover {
      opacity: 0.7;
    }
  }
}
</style>
