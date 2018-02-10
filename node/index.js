const WebSocket = require('ws')
const os = require('os')

class AppNode {
  constructor (app) {
    this.app = app
    this.config = app.config
    this.ws = null

    this.status = os.cpus().map(cpu => 0)
  }

  run () {
    this.connect()
  }

  connect () {
    this.ws = new WebSocket(`ws${this.config.secure ? 's' : ''}://${this.config.host}/worker/${this.config.secret}`)

    this.ws.on('open', () => {
      console.info('[ws.CONNECTED]')
      this.sendStatus()
    })

    this.ws.on('close', () => {
      console.info('[ws.CLOSED]')
      this.ws = null
      setTimeout(() => this.connect(), 5000)
    })

    this.ws.on('error', error => {
      console.error('[ws.ERROR]', error)
      this.ws.close()
    })
  }

  sendStatus () {
    this.ws.send(JSON.stringify({
      name: this.config.name,
      status: this.status
    }))
  }
}

module.exports = AppNode
