const path = require('path')
const requireWithoutCache = require('./require-without-cache')

class TaskManager {
  constructor (app) {
    this.app = app

    this.tasks = []
  }

  run () {
    this.addTask('example')
    this.addTask('example2')
    this.addTask('example3')
    this.addTask('example4')
  }

  getTasks () {
    return this.tasks.map(task => task.state)
  }

  _randomIdentifier () {
    return '#' + ('' + Math.random()).substr(2, 4)
  }

  addTask (directory, doNotRefresh) {
    const moduleName = path.basename(directory)
    let mod = null

    try {
      mod = requireWithoutCache(`./tasks/${moduleName}`)
    } catch (err) {
      // TODO: do not add if module not found
      // return null
    }

    const task = {
      state: {
        slug: moduleName + this._randomIdentifier(),
        moduleName,
        isRunning: true,
        isOver: false,
        isDeleted: false,
        jobsToRetry: 15,
        jobsRunning: 48,
        jobsDone: 1844,
        jobsTotal: 10000,
        result: 'adz zadzad zadazdzad azdazd\nefzef zefezf zefzef zef\nefzef zefezf zef zefzf\nezfez fzef efzefz fzef'
      },
      config: {},
      retry: [],
      running: [],
      module: mod
    }

    this.tasks.push(task)

    if (doNotRefresh !== true) {
      this.refreshTasksToAdmins()
    }

    return task
  }

  resumeTask (slug) {
    const task = this.tasks.find(t => t.state.slug === slug)
    if (task) {
      task.state.isRunning = true
      task.state.isDeleted = false
      this.refreshTasksToAdmins()
    }
  }

  pauseTask (slug) {
    const task = this.tasks.find(t => t.state.slug === slug)
    if (task) {
      task.state.isRunning = false
      this.refreshTasksToAdmins()
    }
  }

  deleteTask (slug) {
    const task = this.tasks.find(t => t.state.slug === slug)
    if (task) {
      this.tasks = this.tasks.filter(t => t.state.slug !== slug)
      if (!task.state.isDeleted) {
        const newTask = this.addTask(task.state.moduleName, true)
        if (newTask) {
          newTask.state.isRunning = false
          newTask.state.isDeleted = true
        }
      }
      this.refreshTasksToAdmins()
    }
  }

  refreshTasksToAdmins () {
    this.app.websocket.admin.updateTasks()
  }
}

module.exports = TaskManager
