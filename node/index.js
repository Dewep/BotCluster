const WebSocket = require('ws')
const os = require('os')
const cp = require('child_process')
const request = require('request-promise')
const fs = require('fs')
const path = require('path')

class AppNode {
  constructor (app) {
    this.app = app
    this.config = app.config
    this.ws = null

    this.children = []
    this.status = os.cpus().map(cpu => 0)
    this.statusUpdated = true
  }

  run () {
    this.status.forEach(cpu => {
      const child = {
        isAvailable: true,
        progress: 0,
        process: cp.fork(path.join(__dirname, 'child.js'))
      }

      child.process.on('message', m => {
        if (m.progress !== undefined) {
          child.progress = m.progress
          this.status = this.children.map(c => c.progress)
          this.statusUpdated = true
        }

        if (m.result && this.ws) {
          child.isAvailable = true
          child.progress = 0
          this.status = this.children.map(c => c.progress)
          this.statusUpdated = true
          this.ws.send(JSON.stringify(m.result))
        }
      })

      this.children.push(child)
    })

    this.connect()

    setInterval(() => this.sendStatus(), 500)
  }

  connect () {
    const ws = new WebSocket(`ws${this.config.secure ? 's' : ''}://${this.config.host}/worker/${this.config.secret}`)

    ws.on('open', () => {
      console.info('[ws.CONNECTED]')
      this.statusUpdated = true
      this.ws = ws
    })

    ws.on('close', () => {
      console.info('[ws.CLOSED]')
      this.ws = null
      setTimeout(() => this.connect(), 5000)
    })

    ws.on('error', error => {
      console.error('[ws.ERROR]', error)
      ws.close()
    })

    ws.on('message', message => {
      const content = JSON.parse(message)

      if (content.type === 'job' && content.job) {
        this.runJob(content.job).catch(err => {
          console.error('[runJob.error]', err)

          if (this.ws) {
            this.ws.send(JSON.stringify({
              type: 'error',
              slug: content.job.slug,
              id: content.job.job.id
            }))
          }
        })
      }
    })
  }

  async saveFile (slug, fileModule) {
    const filePath = path.join(this.app.config.modulesDirectory, slug + '-' + fileModule)

    if (!fs.existsSync(filePath)) {
      const result = await request(`http${this.config.secure ? 's' : ''}://${this.config.host}/task/${this.config.secret}/${slug}/${fileModule}`)
      fs.writeFileSync(filePath, result)
    }

    return filePath
  }

  async runJob (job) {
    job.modulePath = await this.saveFile(job.slug, job.fileModule)

    for (const index in this.children) {
      const child = this.children[index]
      if (child.isAvailable) {
        child.isAvailable = false
        child.process.send({ job })
        return
      }
    }

    throw new Error('No child available for a new job!')
  }

  sendStatus () {
    if (this.ws && this.statusUpdated) {
      this.statusUpdated = false
      this.ws.send(JSON.stringify({
        type: 'status',
        name: this.config.name,
        status: this.status
      }))
    }
  }
}

module.exports = AppNode
