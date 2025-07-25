<script setup lang="ts">
defineOptions({
  inheritAttrs: false,
})

defineProps<{
  id: string
  label: string
  required: boolean
  placeholder?: string
  error?: string
}>()

const model = defineModel<string>()
</script>

<template>
  <div :class="$style.wrapper">
    <div :class="$style.textArea">
      <label :for="id"> {{ label }} <span v-if="required">*</span> </label>
      <textarea
        :id="id"
        :required="required"
        :placeholder="placeholder"
        v-model="model"
        :class="{ [$style.error]: error }"
        v-bind="{
          ...$attrs,
          'aria-describedby': error ? `${id}-error` : undefined,
          'aria-invalid': error ? true : undefined,
        }"
      />
    </div>
    <p :id="`${id}-error`" :class="[$style.errorMessage]" v-if="error" role="alert">
      {{ error }}
    </p>
  </div>
</template>

<style module lang="scss">
@use '@/assets/styles/_form-field.scss' as f;

.wrapper {
  width: 100%;
}

.textArea {
  display: flex;
  width: 100%;
  flex-direction: column;
  align-items: flex-start;
  gap: var(--space-s);
  position: relative;

  textarea {
    @include f.formField();
    min-height: 9.5rem;
    padding: var(--space-m);
    font-size: var(--text-m);
    line-height: var(--leading-m);
    font-family: var(--font-body);

    &::placeholder {
      color: var(--color-text-50);
      font-size: var(--text-m);
      line-height: var(--leading-m);
      font-family: var(--font-body);
    }
  }

  label {
    font-size: var(--text-m);
    color: var(--color-text-100);
  }
}
.errorMessage {
  @include f.errorMessage();
}
</style>
