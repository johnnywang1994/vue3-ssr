<template>
  <div class="view-home">
    {{ msg }}
    <router-link to="/about">To About</router-link>
  </div>
</template>

<script>
import { useMeta } from 'vue-meta';

export default {
  name: 'ViewHome',
  data() {
    return {
      msg: 'Hello World',
    }
  },
  setup () {
    const { meta } = useMeta({
      title: 'My Default App - Home',
    })
  },
};
</script>

<style lang="scss">
.view-home {
  color: red;
}
</style>
