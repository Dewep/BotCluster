// const process = require('child_process')

let childModule
let progress = 0

process.on('message', message => {
  if (message.job) {
    runJob(message.job)
  }
})

function runJob (job) {
  childModule = require(job.modulePath)
  const tasks = job.job.jobs
  const results = []
  for (let taskNumber in tasks) {
    const toCompute = job.job.jobs[taskNumber]

    const result = childModule(job.config, toCompute)
    results.push(result)

    if (Math.round(100 * taskNumber / tasks.length) > progress) {
      progress = Math.round(100 * taskNumber / tasks.length)
      process.send({ progress })
    }
  }

  process.send({
    result: {
      type: 'job',
      slug: job.slug,
      id: job.job.id,
      results
    },
    isAvailable: true
  })
}
