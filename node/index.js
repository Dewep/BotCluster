const WebSocket = require('ws')
const os = require('os')
const cp = require('child_process')
const request = require('request-promise')
const fs = require('fs')

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
      const child = cp.fork(`${__dirname}/child.js`)
      console.log('Created instance', { child })
      child.on('message', m => {
        if (m.isAvailable !== undefined) {
          child.isAvailable = m.isAvailable
        }
        if (m.progress !== undefined) {
          console.log(`[${child.pid}]\t${m.progress} %`)
        }
        if (m.result !== undefined) {
          this.ws.send(JSON.stringify(m.result))
        }
      })
      child.isAvailable = true
      this.children.push(child)
    })
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

    this.ws.on('message', message => {
      const content = JSON.parse(message)
      if (content.type === 'job' && content.job) {
        this.runJob(content.job)
      }
    })
  }

  getAvailableChild () {
    for (let index in this.children) {
      const child = this.children[index]
      if (child.isAvailable) {
        return child
      }
    }
    return null
  }

  async saveFile (slug, fileModule) {
    const filePath = this.app.config.modulesDirectory + '\\' + slug + '-' + fileModule
    if (!fs.existsSync(filePath)) {
      let options = {
        uri: `http://127.0.0.1:4242/task/42/${slug}/${fileModule}` // C CRADE
      }
      const result = await request(options)
      fs.writeFileSync(filePath, result)
    }
    return filePath
  }

  async runJob (job) {
    const jobs = job.job.jobs
    job.modulePath = await this.saveFile(job.slug, job.fileModule)
    const child = this.getAvailableChild()
    if (child) {
      child.isAvailable = false
      child.send({ job })
    } else {
      console.error('====================================== THIS SHOULD NOT HAPPEN 1 ======================================')
    }
  }

  sendStatus () {
    this.ws.send(JSON.stringify({
      type: 'status',
      name: this.config.name,
      status: this.status
    }))
  }
}

module.exports = AppNode
