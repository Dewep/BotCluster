<template>
  <div id="auth-page">
    <div class="empty">
      <p class="empty-title h5">Bot Cluster Administration</p>
      <p class="empty-subtitle">Authentication required</p>
      <div class="empty-action">
        <p class="toast toast-error" v-if="authError">{{ authError }}</p>
        <form @submit.prevent="login({ secret })">
          <div class="form-group">
            <input type="text" v-model="secret" placeholder="Application secret" class="form-input text-center" :disabled="!!authLoading" required>
          </div>
          <br>
          <div class="form-group">
            <button type="submit" class="btn btn-primary" :class="{ loading: authLoading }">&nbsp;&nbsp;&nbsp;Load&nbsp;&nbsp;&nbsp;</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { mapGetters, mapActions } from 'vuex'

export default {
  name: 'auth',

  data () {
    return {
      secret: ''
    }
  },

  computed: mapGetters(['isConnected', 'authLoading', 'authError']),

  methods: mapActions(['login']),

  watch: {
    isConnected: {
      handler (isConnected) {
        if (isConnected) {
          this.$router.push({ name: 'home' })
        }
      },
      immediate: true
    }
  }
}
</script>

<style lang="scss">
#auth-page {
  display: flex;
  align-content: center;
  height: 100vh;
  margin: 0;
  padding: 0;
  min-width: 320px;
  overflow: hidden;
  background: #f8f9fa;
  align-items: center;

  & > .empty {
    flex: 1 1 auto;
    max-width: 700px;
    margin: 0 auto;
  }
}
</style>
