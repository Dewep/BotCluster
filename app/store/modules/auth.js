const state = {
  loading: null,
  isConnected: false,
  error: null
}

const getters = {
  isConnected: state => state.isConnected,
  authLoading: state => state.loading,
  authError: state => state.error
}

const actions = {
  login ({ commit }, { secret }) {
    commit('LOGIN_REQUEST', { secret })
  }
}

const mutations = {
  LOGIN_REQUEST (state) {
    state.loading = true
    state.error = null
  },
  LOGIN_SUCCESS (state) {
    state.loading = false
    state.isConnected = true
  },
  LOGIN_ERROR (state, { error }) {
    state.loading = false
    state.isConnected = false
    if (error) {
      state.error = error || null
    }
  }
}

export default { state, getters, actions, mutations }
