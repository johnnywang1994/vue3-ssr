<template>
  <div class="view-about">
    {{ msg }}
    <router-link to="/">To Home</router-link>
  </div>
</template>

<script>
import { useMeta } from 'vue-meta';

export default {
  name: 'ViewAbout',
  data() {
    return {
      msg: 'Hello About',
    }
  },
  setup () {
    useMeta({
      title: 'My Default App - About',
    })
  },
};
</script>

<style lang="scss">
.view-about {
  color: blue;
}
</style>
