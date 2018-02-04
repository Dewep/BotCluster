export default (store, type, data) => {
  if (type === 'hosts') {
    store.commit('SET_HOSTS', { hosts: data.hosts || [] })
  }
  if (type === 'tasks') {
    store.commit('SET_TASKS', { tasks: data.tasks || [] })
  }
}
