const WebSocket = require('ws')
const os = require('os')
const cp = require('child_process')

class AppNode {
  constructor (app) {
    this.app = app
    this.config = app.config
    this.ws = null
    this.children = []

    this.status = os.cpus().map(cpu => 0)
  }

  run () {
    os.cpus().forEach(cpu => {
      let turn = 0
      const child = cp.fork(`${__dirname}/child.js`)
      console.log('Created instance', { child })
      child.on('message', m => {
        console.log(`[${child.pid}]\t'${m.message}'`)
      })
      child.send({ start: turn * 100000000, stop: ((turn + 1) * 100000000 - 1) })
      this.children.push(child)
      turn += 1
    })
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
