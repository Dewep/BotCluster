const botCluster = require('..')

botCluster.Server({
  application: {
    secret: 42,
    modulesDirectory: __dirname
  }
}).catch(err => {
  console.error('[general-error]', err)
  process.exit(1)
})
