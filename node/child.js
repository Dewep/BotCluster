// const process = require('child_process')

let childModule
let progress
let stop = false

process.on('message', message => {
  if (message.job) {
    runJob(message.job)
  }
})

async function runJob (job) {
  childModule = require(job.modulePath)
  const tasks = job.job.jobs
  const results = []
  progress = 0
  for (let taskNumber in tasks) {
    const toCompute = job.job.jobs[taskNumber]

    let result
    try { // Sometimes childModule == {} wtf ?
      result = childModule(job.config, toCompute)
    } catch (error) {
      console.error(job.modulePath, {childModule}, {error})
      // process.send({isAvailable: true})
    }
    if (result && result.then) {
      result = await result
    }
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
