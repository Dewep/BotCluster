<template>
  <div class="container">
    <div class="columns">
      <div class="column col-8">
        <router-view></router-view>
      </div>
      <div class="column col-4">
        <ul class="menu">
          <template v-for="(host, $index) in hosts">
            <li class="divider" :data-content="host.name || `worker-${$index}`" :key="'title-' + $index"></li>
            <li class="menu-item" v-for="(worker, $indexWorker) in host.workers" :key="'worker-' + $index + '-' + $indexWorker">
              <div class="bar bar-sm" v-if="worker >= 0">
                <div class="bar-item" role="progressbar" :style="{ width: worker + '%' }" :aria-valuenow="worker" aria-valuemin="0" aria-valuemax="100"></div>
              </div>
              <i v-else>Not working</i>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'main-component',

  data () {
    return {
    }
  },

  computed: mapGetters(['isConnected', 'hosts']),

  watch: {
    isConnected: {
      handler (isConnected) {
        if (!isConnected) {
          this.$router.push({ name: 'auth' })
        }
      },
      immediate: true
    }
  }
}
</script>
