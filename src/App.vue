<script setup lang="ts">
import MainCard from './components/MainCard.vue'
import ContactForm from './components/ContactForm.vue'
</script>

<template>
  <MainCard>
    <ContactForm />
  </MainCard>
</template>

<style scoped lang="scss">
.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
}
</style>
