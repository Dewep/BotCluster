const express = require('express')
// const bodyParser = require('body-parser')
const http = require('http')

class ServerWeb {
  constructor (app) {
    this.config = app.config.serverWeb
    this.app = app

    this.express = express()

    // this.express.use(bodyParser.json({ limit: '10mb' }))
    this.express.use(this.logger)

    this.express.get(`/task/${app.config.application.secret}/:slug/:file`, (req, res) => {
      const file = app.taskManager.getFileModule(req.params.slug, req.params.file)
      if (!file) {
        return res.send(404)
      }
      res.sendFile(file)
    })

    this.express.use(this.errorHandling)

    this.express.use(express.static('public'))

    this.server = http.createServer(this.express)
  }

  getServer () {
    return this.server
  }

  logger (req, res, next) {
    console.info('[server]', req.method, req.originalUrl, 'from', req.ip)
    next()
  }

  errorHandling (err, req, res, next) {
    if (!err.status) {
      err.status = 400
    }
    res.status(err.status)
    res.json({ error: err.message })
    console.error(err.stack)
  }

  async run () {
    this.server.listen(this.config.port, this.config.host, () => {
      console.info('[server] running on', `${this.config.host}:${this.config.port}`)
    })
  }
}

module.exports = ServerWeb
