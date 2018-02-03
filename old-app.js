const http = require('http')
const express = require('express')
const bodyParser = require('body-parser')

let app = express()
let projects = {
    pcspecialist: {
        good: [],
        running: [],
        clusterWorkSize: 100,
        states: {
            c1: 0,
            c2: 0,
            c3: 0
        }
    }
}

app.use(bodyParser.json())

app.get('/', (req, res) => {
    res.json(projects)
})

app.get('/node', (req, res) => {
    res.sendFile(__dirname + '/node.js')
})

app.get('/script/:projectKey', (req, res) => {
    if (!projects[req.params.projectKey]) {
        res.status(404)
        res.json({error: 'Project not found'})
        return
    }

    let script = require(`./${req.params.projectKey}`).script
    res.json({script: script.toString()})
})

app.get('/work/:projectKey', (req, res) => {
    if (!projects[req.params.projectKey]) {
        res.status(404)
        res.json({error: 'Project not found'})
        return
    }

    let next = require(`./${req.params.projectKey}`).next
    let data = next(projects[req.params.projectKey])
    projects[req.params.projectKey].running = projects[req.params.projectKey].running.concat(data)
    res.json(data)
})

app.post('/work/:projectKey', (req, res) => {
    if (!projects[req.params.projectKey]) {
        res.status(404)
        res.json({error: 'Project not found'})
        return
    }

    for (let i = 0; i < req.body.good.length; i++) {
        let index = projects[req.params.projectKey].running.indexOf(req.body.good[i])
        if (index > -1) {
            projects[req.params.projectKey].good.push(req.body.good[i])
            projects[req.params.projectKey].running.splice(index, 1)
        }
    }

    for (let i = 0; i < req.body.bad.length; i++) {
        let index = projects[req.params.projectKey].running.indexOf(req.body.bad[i])
        if (index > -1) {
            projects[req.params.projectKey].running.splice(index, 1)
        }
        index = projects[req.params.projectKey].good.indexOf(req.body.bad[i])
        if (index > -1) {
            projects[req.params.projectKey].good.splice(index, 1)
        }
    }

    res.json({})
})

let server = http.createServer(app)
server.listen(1423)
