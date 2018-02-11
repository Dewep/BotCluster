const state = {
  hosts: [],
  tasks: []
}

const getters = {
  hosts: state => state.hosts || [],
  tasks: state => state.tasks || []
}

const actions = {
  addTask ({ commit }, slug) {
    commit('ADD_TASK', { slug })
  },
  resumeTask ({ commit }, slug) {
    commit('RESUME_TASK', { slug })
  },
  pauseTask ({ commit }, slug) {
    commit('PAUSE_TASK', { slug })
  },
  retryRunningTask ({ commit }, slug) {
    commit('RETRY_RUNNING_TASK', { slug })
  },
  deleteTask ({ commit }, slug) {
    commit('DELETE_TASK', { slug })
  }
}

const mutations = {
  SET_HOSTS (state, { hosts }) {
    state.hosts = hosts || []
  },
  SET_TASKS (state, { tasks }) {
    state.tasks = tasks || []
  },
  ADD_TASK (state, { slug }) {
  },
  RESUME_TASK (state, { slug }) {
  },
  PAUSE_TASK (state, { slug }) {
  },
  RETRY_RUNNING_TASK (state, { slug }) {
  },
  DELETE_TASK (state, { slug }) {
  }
}

export default { state, getters, actions, mutations }
