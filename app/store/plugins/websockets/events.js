export default (store, type, data) => {
  if (type === 'hosts') {
    store.commit('SET_HOSTS', { hosts: data.hosts || [] })
  }
}
