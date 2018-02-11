process.on('message', message => {
  if (message.job) {
    const job = message.job

    runJob(job).catch(err => {
      process.send({
        result: {
          type: 'error',
          slug: job.slug,
          id: job.job.id
        }
      })

      console.error('Failed to run job', job.slug, job.job.id, err)
    })
  }
})

async function runJob (job) {
  const childModule = require(job.modulePath)

  const tasks = job.job.jobs
  const results = []
  let progress = 0

  for (const taskNumber in tasks) {
    const toCompute = tasks[taskNumber]

    const result = await childModule(job.config, toCompute)
    results.push(result)

    const newProgress = Math.round(100 * taskNumber / tasks.length)
    if (newProgress > progress) {
      await new Promise(resolve => setTimeout(resolve))
      progress = newProgress
      process.send({ progress })
    }
  }

  process.send({
    result: {
      type: 'job',
      slug: job.slug,
      id: job.job.id,
      results
    }
  })
}
