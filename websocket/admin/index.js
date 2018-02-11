const tools = require('../tools')

class WebSocketAdmin {
  constructor (app, ws) {
    this.app = app
    this.ws = ws

    this.throttleUpdateHostsTimer = null
    this.throttleUpdateTasksTimer = null
    this.clients = []
  }

  addClient (wsConnection) {
    console.info('New admin wsConnection')
    this.clients.push(wsConnection)
    this._updateHosts(wsConnection)
    this._updateTasks(wsConnection)

    wsConnection.on('message', data => {
      const content = tools.decodeData(data)

      console.log('[ws.admin]', content.type, content.data)
      if (['addTask', 'resumeTask', 'pauseTask', 'retryRunningTask', 'deleteTask'].indexOf(content.type) !== -1 && content.data && content.data.slug) {
        this.app.taskManager[content.type](content.data.slug)
      }
    })
  }

  removeClient (wsConnection) {
    this.clients = this.clients.filter(c => c !== wsConnection)
  }

  _updateHosts (instance) {
    const hosts = this.ws.worker.getHosts()
    this.clients.forEach(client => {
      if (!instance || instance === client) {
        client.sendJSON('hosts', { hosts })
      }
    })
  }

  _updateTasks (instance) {
    const tasks = this.app.taskManager.getTasks()
    this.clients.forEach(client => {
      if (!instance || instance === client) {
        client.sendJSON('tasks', { tasks })
      }
    })
  }

  updateHosts (instance) {
    if (!this.throttleUpdateHostsTimer) {
      this.throttleUpdateHostsTimer = setTimeout(() => {
        this.throttleUpdateHostsTimer = null
        this._updateHosts(instance)
      }, 500)
    }
  }

  updateTasks (instance) {
    if (!this.throttleUpdateTasksTimer) {
      this.throttleUpdateTasksTimer = setTimeout(() => {
        this.throttleUpdateTasksTimer = null
        this._updateTasks(instance)
      }, 500)
    }
  }
}

module.exports = WebSocketAdmin
