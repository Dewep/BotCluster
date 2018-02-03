const state = {
  hosts: []
}

const getters = {
  hosts: state => state.hosts || []
}

const actions = {
}

const mutations = {
  SET_HOSTS (state, { hosts }) {
    state.hosts = hosts || []
  }
}

export default { state, getters, actions, mutations }
