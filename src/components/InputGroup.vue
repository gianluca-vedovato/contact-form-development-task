<template>
  <div class="inputGroup">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.inputGroup {
  display: flex;
  gap: 1px;
  width: 100%;

  :slotted(div) {
    flex: 1;
    &:first-child {
      input {
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
      }
    }

    &:last-child {
      input {
        border-top-left-radius: 0;
        border-bottom-left-radius: 0;
      }
    }
  }
}
</style>
