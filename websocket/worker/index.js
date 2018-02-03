// const tools = require('./tools')

class WebSocketWorker {
  constructor (app, ws) {
    this.app = app
    this.ws = ws

    this.clients = []
  }

  getHosts () {
    return this.clients.map(c => ({ name: c.name, workers: c.status }))
  }

  addClient (wsConnection) {
    console.info('New worker wsConnection')
    const client = {
      wsConnection,
      name: null,
      status: []
    }

    this.clients.push(client)

    client.wsConnection.on('message', data => {
      const content = JSON.parse(data)
      client.name = content.name || null
      client.status = content.status || []
      this.ws.admin.updateHosts()
    })
  }

  removeClient (wsConnection) {
    this.clients = this.clients.filter(c => c.wsConnection !== wsConnection)
    this.ws.admin.updateHosts()
  }
}

module.exports = WebSocketWorker
