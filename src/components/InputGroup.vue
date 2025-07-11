<template>
  <div class="inputGroup">
    <slot />
  </div>
</template>

<style scoped lang="scss">
.inputGroup {
  display: flex;
  width: 100%;
  gap: 1px;

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
