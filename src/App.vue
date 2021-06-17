<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useMeta } from 'vue-meta';

export default {
  name: 'App',
  mounted() {
    console.log(this.$store);
  },
  setup () {
    useMeta({
      title: 'My Default App',
      htmlAttrs: {
        lang: 'en',
      }
    })
  },
};
</script>

<style lang="scss">
#app {
  font-size: 16px;
}
</style>
