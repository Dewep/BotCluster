const path = require('path')
const requireWithoutCache = require('./require-without-cache')

class TaskManager {
  constructor (app) {
    this.app = app

    this.tasks = []
  }

  addTask (directory) {
    const slug = path.basename(directory)
    const mod = requireWithoutCache(`./tasks/${slug}`)

    this.tasks.append({
      state: {
        slug,
        isRunning: true,
        isOver: false,
        isDeleted: false,
        jobsToRetry: 0,
        jobsRunning: 0,
        jobsDone: 0,
        progress: 0,
        result: null
      },
      config: {},
      retry: [],
      running: [],
      module: mod
    })
  }
}

module.exports = TaskManager
