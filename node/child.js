// const process = require('child_process')

process.on('message', m => {
  const childModule = require(m.childModule)
  const result = await childModule.run(m.config, m.params)
  process.send({ result })
  // squareRoot(m.start, m.stop)
})

function squareRoot (start, stop) {
  for (let i = start; i < stop; i++) {
    const result = Math.sqrt(i)
    if (result === Math.round(result)) {
      process.send({ message: `The square root of ${i} is ${result} !` })
    }
  }
}

function sendMessage () {
  process.send({ message: 'I\'m alive !' });
  setTimeout(sendMessage, 2000)
}

sendMessage()