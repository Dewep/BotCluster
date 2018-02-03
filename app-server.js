const _ = require('lodash')
const config = require('./config')

const app = {
  config
}

async function runModules (modules) {
  // Rename modules
  modules = modules.map(m => ({ directory: m, name: _.camelCase(m) }))

  // Init modules
  modules.forEach(function (definition) {
    const ComponentClass = require(`./${definition.directory}`)
    app[definition.name] = new ComponentClass(app)
  })

  // Run modules (cron-tasks, server listening, and so on)
  for (let index = 0; index < modules.length; index++) {
    if (app[modules[index].name].run) {
      await app[modules[index].name].run()
    }
  }
}

runModules(['server-web', 'websocket', 'task-manager']).catch(err => {
  console.error('[run-error]', err)
  process.exit(1)
})
