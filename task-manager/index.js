const path = require('path')
const requireWithoutCache = require('./require-without-cache')

class TaskManager {
  constructor (app) {
    this.app = app

    this.tasks = []
    this.lastTaskIndex = 0
  }

  run () {
    this.addTask('nearest-point')
  }

  getTasks () {
    return this.tasks.map(task => task.status)
  }

  _randomIdentifier () {
    return '-' + ('' + Math.random()).substr(2, 4)
  }

  addTask (directory, doNotRefresh) {
    const moduleName = path.basename(directory)
    const moduleDirectory = path.join(this.app.config.application.modulesDirectory, moduleName)
    let mod = null

    try {
      mod = requireWithoutCache(moduleDirectory)
    } catch (err) {
      console.warn(`[Cannot import module "${moduleName}"]`, err)
      return null
    }

    const task = {
      path: moduleDirectory,
      status: {
        slug: moduleName + this._randomIdentifier(),
        moduleName,
        isRunning: true,
        isOver: false,
        isDeleted: false,
        jobsToRetry: 0,
        jobsRunning: 0,
        jobsDone: 0,
        jobsTotal: 0,
        result: ''
      },
      nextJobId: 0,
      state: {},
      retry: [],
      running: [],
      module: mod
    }

    task.state = task.module.initialState()
    task.status.jobsTotal = task.module.workSize
    task.status.result = task.module.result(task.state)

    this.tasks.push(task)

    if (doNotRefresh !== true) {
      this.refreshTasksToAdmins()
    }

    this.refreshCheckJobs()

    return task
  }

  resumeTask (slug) {
    const task = this.tasks.find(t => t.status.slug === slug)
    if (task && !task.isOver) {
      task.status.isRunning = true
      task.status.isDeleted = false
      this.refreshTasksToAdmins()
    }
  }

  pauseTask (slug) {
    const task = this.tasks.find(t => t.status.slug === slug)
    if (task) {
      task.status.isRunning = false
      this.refreshTasksToAdmins()
    }
  }

  deleteTask (slug) {
    const task = this.tasks.find(t => t.status.slug === slug)
    if (task) {
      this.tasks = this.tasks.filter(t => t.status.slug !== slug)
      if (!task.status.isDeleted) {
        const newTask = this.addTask(task.status.moduleName, true)
        if (newTask) {
          newTask.status.isRunning = false
          newTask.status.isDeleted = true
        }
      }
      this.refreshTasksToAdmins()
    }
  }

  getJob (retry) {
    this.lastTaskIndex++

    for (; this.lastTaskIndex < this.tasks.length; this.lastTaskIndex++) {
      if (this.tasks[this.lastTaskIndex].status.isRunning) {
        const task = this.tasks[this.lastTaskIndex]
        const jobs = task.retry.shift() || task.module.next(task.state)

        if (jobs.length) {
          const job = { id: task.nextJobId, jobs }
          task.running.push(job)
          task.nextJobId++
          task.status.jobsToRetry = task.retry.reduce((p, c) => p + c.length, 0)
          task.status.jobsRunning = task.running.reduce((p, c) => p + c.jobs.length, 0)

          this.refreshTasksToAdmins()

          return {
            slug: task.status.slug,
            fileModule: task.module.nodeFileModule,
            config: task.module.configNode,
            job
          }
        }
      }
    }

    if (retry !== false) {
      this.lastTaskIndex = -1

      return this.getJob(false)
    }

    return null
  }

  jobDone (slug, id, results) {
    // const task = this.tasks.find(t => t.status.slug === slug)
  }

  getFileModule (slug, file) {
    const task = this.tasks.find(t => t.status.slug === slug)
    if (task && task.status.isRunning && task.module.nodeFileModule === file) {
      return path.join(task.path, file)
    }
    return null
  }

  refreshTasksToAdmins () {
    this.app.websocket.admin.updateTasks()
  }

  refreshCheckJobs () {
    this.app.websocket.worker.checkJobs()
  }
}

module.exports = TaskManager
