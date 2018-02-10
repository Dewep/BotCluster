const _ = require('lodash')
const generalConfig = require('./config')

async function runModules (app, modules) {
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

module.exports.Server = async function (localConfig) {
  const app = {
    config: _.merge({}, generalConfig, localConfig)
  }

  await runModules(app, ['server-web', 'websocket', 'task-manager'])

  return app
}

module.exports.Node = async function (config) {
  const app = {
    config
  }

  await runModules(app, ['node'])

  return app
}
