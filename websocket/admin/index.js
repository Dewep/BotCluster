const tools = require('../tools')

class WebSocketAdmin {
  constructor (app, ws) {
    this.app = app
    this.ws = ws

    this.clients = []
  }

  addClient (wsConnection) {
    console.info('New admin wsConnection')
    this.clients.push(wsConnection)
    this.updateHosts(wsConnection)
    this.updateTasks(wsConnection)

    wsConnection.on('message', data => {
      const content = tools.decodeData(data)

      console.log('[ws.admin]', content.type, content.data)
      if (['addTask', 'resumeTask', 'pauseTask', 'deleteTask'].indexOf(content.type) !== -1 && content.data && content.data.slug) {
        this.app.taskManager[content.type](content.data.slug)
      }
    })
  }

  removeClient (wsConnection) {
    this.clients = this.clients.filter(c => c !== wsConnection)
  }

  updateHosts (instance) {
    const hosts = this.ws.worker.getHosts()
    this.clients.forEach(client => {
      if (!instance || instance === client) {
        client.sendJSON('hosts', { hosts })
      }
    })
  }

  updateTasks (instance) {
    const tasks = this.app.taskManager.getTasks()
    this.clients.forEach(client => {
      if (!instance || instance === client) {
        client.sendJSON('tasks', { tasks })
      }
    })
  }
}

module.exports = WebSocketAdmin
