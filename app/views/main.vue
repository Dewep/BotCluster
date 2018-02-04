<template>
  <div class="container">
    <div class="columns">
      <div class="column col-7">
        <router-view></router-view>
      </div>
      <div class="column col-5">
        <div class="menu columns">
          <div class="column col-6" v-for="(host, $index) in sortedHosts" :key="$index">
            <div class="divider text-center" :data-content="host.name || `worker-${$index}`"></div>
            <div class="bar bar-sm my-1" v-for="(worker, $indexWorker) in host.workers" :key="'worker-' + $index + '-' + $indexWorker">
              <div class="bar-item" role="progressbar" :style="{ width: (worker || 0) + '%' }" :aria-valuenow="worker || 0" aria-valuemin="0" aria-valuemax="100"></div>
            </div>
          </div>
        </div>
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

  computed: {
    ...mapGetters(['isConnected', 'hosts']),
    sortedHosts () {
      return this.hosts.map(h => h).sort((a, b) => b.workers.length - a.workers.length)
    }
  },

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
