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
@import "~bulma/bulma";
html,
body {
  height: 100%;
  width: 100%;
  overflow: hidden;
}
</style>
