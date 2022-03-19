<script setup lang="ts">
import { RouterView } from 'vue-router'
import ReloadPrompt from './components/ReloadPrompt.vue'
</script>

<template>
  <ReloadPrompt />
  <RouterView class="router" />
</template>

<style lang="scss">
@import "bulma/sass/utilities/_all.sass";
@import "bulma/sass/base/_all.sass";
@import "bulma/sass/helpers/_all.sass";
@import "bulma/sass/elements/button.sass";
@import "bulma/sass/elements/container.sass";
@import "bulma/sass/elements/icon.sass";
@import "bulma/sass/elements/image.sass";
@import "bulma/sass/elements/other.sass";
@import "bulma/sass/elements/title.sass";
@import "bulma/sass/form/_all.sass";
@import "bulma/sass/components/card.sass";
@import "bulma/sass/components/media.sass";
@import "bulma/sass/components/modal.sass";
@import "bulma/sass/layout/hero.sass";
@import "bulma/sass/layout/section.sass";
html,
body, #app, .router {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>

