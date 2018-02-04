import instanceGenerator from './instance'
import processEvent from './events'

export default store => {
  // called when the store is initialized

  let instance = null

  const removeInstance = () => {
    if (instance) {
      instance.close()
      instance = null
    }
  }

  const createInstance = (secret) => {
    removeInstance()

    const secure = document.location.protocol === 'https:' ? 's' : ''
    instance = instanceGenerator(`ws${secure}://${document.location.host}/admin/${secret}`, {
      onSuccess () {
        store.commit('LOGIN_SUCCESS', {})
      },
      onError (error) {
        store.commit('LOGIN_ERROR', { error: error.message || 'Connection refused' })
      },
      onMessage (type, payload) {
        processEvent(store, type, payload)
      },
      onClose () {
        instance = null
        store.commit('LOGIN_ERROR', { error: 'Connection refused' })
      }
    })
  }

  store.subscribe((mutation, state) => {
    // called after every mutation.
    // The mutation comes in the format of { type, payload }.

    if (!mutation.payload) {
      return
    }

    if (mutation.type === 'LOGIN_REQUEST') {
      createInstance(mutation.payload.secret)
    }

    if (mutation.type === 'LOGOUT') {
      removeInstance()
    }

    if (instance) {
      if (mutation.type === 'ADD_TASK') {
        instance.send({ type: 'addTask', data: mutation.payload })
      }

      if (mutation.type === 'RESUME_TASK') {
        instance.send({ type: 'resumeTask', data: mutation.payload })
      }

      if (mutation.type === 'PAUSE_TASK') {
        instance.send({ type: 'pauseTask', data: mutation.payload })
      }

      if (mutation.type === 'DELETE_TASK') {
        instance.send({ type: 'deleteTask', data: mutation.payload })
      }
    }
  })
}
