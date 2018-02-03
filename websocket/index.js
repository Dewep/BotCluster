const ws = require('ws')
const tools = require('./tools')
const WebSocketAdmin = require('./admin')
const WebSocketWorker = require('./worker')

class WebSocket {
  constructor (app) {
    this.app = app

    this.ws = new ws.Server({ server: app.serverWeb.getServer() })

    this.admin = new WebSocketAdmin(app, this)
    this.worker = new WebSocketWorker(app, this)

    this.ws.on('connection', this.onConnection.bind(this))

    this.clients = []
  }

  onConnection (wsConnection, req) {
    let handler = null

    if (req.url === '/admin/' + this.app.config.application.secret) {
      handler = this.admin
    } else if (req.url === '/worker/' + this.app.config.application.secret) {
      handler = this.worker
    } else {
      return wsConnection.close()
    }

    wsConnection.sendJSON = (type, data) => {
      return wsConnection.send(tools.encodeData({ type, data }))
    }

    handler.addClient(wsConnection)

    wsConnection.on('close', () => {
      handler.removeClient(wsConnection)
    })

    wsConnection.on('error', () => {
      try {
        wsConnection.close()
      } catch (error) {
      }
    })
  }
}

module.exports = WebSocket
