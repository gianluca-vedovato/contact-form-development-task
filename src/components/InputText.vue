<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({
  inheritAttrs: false,
})

defineProps<{
  id: string
  label: string
  type: string
  required: boolean
  error?: string
}>()

const model = defineModel<string>()
const hasFocus = ref(false)

const floatingLabel = computed(() => {
  return (model.value?.length ?? 0) > 0 || hasFocus.value
})
</script>

<template>
  <div :class="$style.inputText">
    <label :for="id" :class="{ [$style.floating]: floatingLabel }"
      >{{ label }} <span v-if="required">*</span></label
    >
    <input
      :id="id"
      :type="type"
      :required="required"
      v-model="model"
      @focus="hasFocus = true"
      @blur="hasFocus = false"
      :class="{ [$style.error]: error }"
      v-bind="{
        ...$attrs,
        'aria-describedby': error ? `${id}-error` : undefined,
        'aria-invalid': error ? true : undefined,
      }"
    />
    <p :id="`${id}-error`" :class="$style.errorMessage" v-if="error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style module lang="scss">
@use '@/assets/styles/_form-field.scss' as f;

.inputText {
  width: 100%;
  position: relative;

  input {
    @include f.formField();
    height: 3.375rem;
  }

  label {
    position: absolute;
    top: 0;
    left: 0;
    font-size: var(--text-m);
    color: var(--color-text-50);
    z-index: 1;
    padding: 0.7rem var(--space-m);
    transform-origin: left top;
    transform: scale(1) translateY(0.5rem);
    transition: transform 0.2s ease-out;

    &.floating {
      transform: scale(0.857) translateY(0);
    }
  }

  .errorMessage {
    color: var(--color-error);
    font-size: var(--text-s);
    margin-top: var(--space-xs);
  }
}
</style>
