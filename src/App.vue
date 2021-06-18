<template>
  <div v-if="inClient"><metainfo></metainfo></div>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
import { useMeta } from 'vue-meta';

export default {
  name: 'App',
  data() {
    return {
      inClient: false,
    }
  },
  mounted() {
    console.log(this.$store);
    this.inClient = true;
  },
  setup () {
    useMeta({
      title: 'My Default App',
      htmlAttrs: {
        lang: 'en',
      },
    })
  },
};
</script>

<style lang="scss">
#app {
  font-size: 16px;
}
</style>
