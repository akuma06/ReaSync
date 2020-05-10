<template>
  <router-view></router-view>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
  name: "App",

  data: () => ({
    //
  })
});
</script>

<style lang="scss">
@import "~bulma/sass/utilities/_all";
@import "~bulma/sass/base/_all";
@import "~bulma/sass/elements/button";
@import "~bulma/sass/elements/container";
@import "~bulma/sass/elements/icon";
@import "~bulma/sass/elements/image";
@import "~bulma/sass/elements/other";
@import "~bulma/sass/elements/title";
@import "~bulma/sass/form/_all";
@import "~bulma/sass/components/card";
@import "~bulma/sass/components/media";
@import "~bulma/sass/components/modal";
@import "~bulma/sass/layout/hero";
@import "~bulma/sass/layout/section";
html,
body {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
