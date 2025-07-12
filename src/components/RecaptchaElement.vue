<script setup lang="ts">
import BasicText from './BasicText.vue'
</script>

<template>
  <div
    id="recaptcha-widget"
    :class="['g-recaptcha', $style.recaptcha]"
    data-sitekey="6LcDN38rAAAAAK0MndMGS0G5H4dIdmUQRUblwNaf"
    data-size="invisible"
    data-callback="onCaptchaSuccess"
    data-error-callback="onCaptchaError"
    data-load-callback="onCaptchaLoad"
  ></div>
  <BasicText size="s">
    This site is protected by reCAPTCHA and the Google
    <a href="https://policies.google.com/privacy">Privacy Policy</a> and
    <a href="https://policies.google.com/terms">Terms of Service</a> apply.
  </BasicText>
</template>

<style module>
.recaptcha {
  display: none;
}
</style>
