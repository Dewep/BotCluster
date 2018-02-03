// const tools = require('./tools')

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
}

module.exports = WebSocketAdmin
