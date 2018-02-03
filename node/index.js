const WebSocket = require('ws')
const os = require('os')

class AppNode {
  constructor (app) {
    this.app = app
    this.ws = null

    if (process.argv.length < 5 || !process.argv[2] || !process.argv[3] || !process.argv[4]) {
      throw new Error('Usage: npm run node <host:port> <application-secret> <name>')
    }

    this.host = process.argv[2]
    this.secret = process.argv[3]
    this.name = process.argv[4]

    this.status = os.cpus().map(cpu => 0)
  }

  run () {
    this.connect()
  }

  connect () {
    this.ws = new WebSocket(`${this.host}/worker/${this.secret}`)

    this.ws.on('open', () => {
      this.sendStatus()
    })

    this.ws.on('close', () => {
      console.info('[ws.close]')
      this.ws = null
      setTimeout(() => this.connect(), 5000)
    })

    this.ws.on('error', error => {
      console.error('[ws.error]', error)
      this.ws.close()
    })
  }

  sendStatus () {
    this.ws.send(JSON.stringify({
      name: this.name,
      status: this.status
    }))
  }
}

module.exports = AppNode
