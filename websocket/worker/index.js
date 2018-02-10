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
      status: [],
      jobs: []
    }

    this.clients.push(client)

    client.wsConnection.on('message', data => {
      const content = JSON.parse(data)

      if (content.type === 'status') {
        this.updateStatus(client, content)
        this.checkJobs()
      } else if (content.type === 'job') {
        this.jobDone(client, content)
        this.checkJobs()
      }
    })
  }

  updateStatus (client, content) {
    client.name = content.name || null
    client.status = content.status || []
    this.ws.admin.updateHosts()
  }

  checkJobs () {
    this.clients.forEach(client => {
      while (client.status.length > client.jobs.length) {
        const job = this.app.taskManager.getJob()

        if (!job) {
          return
        }

        client.jobs.push({ slug: job.slug, id: job.job.id })
        client.wsConnection.send(JSON.stringify({
          type: 'job',
          job
        }))
      }
    })
  }

  jobDone (client, content) {
    this.app.taskManager.jobDone(content.slug, content.id, content.results)
    client.jobs = client.jobs.filter(j => j.slug !== content.slug || j.id !== content.id)
  }

  removeClient (wsConnection) {
    this.clients = this.clients.filter(c => c.wsConnection !== wsConnection)
    this.ws.admin.updateHosts()
  }
}

module.exports = WebSocketWorker
