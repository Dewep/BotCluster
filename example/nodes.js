const botCluster = require('..')
const path = require('path')
const fs = require('fs')

const tmp = path.join(__dirname, 'tmp')
const tmp0 = path.join(tmp, 'node0')
const tmp1 = path.join(tmp, 'node1')
const tmp2 = path.join(tmp, 'node2')

if (!fs.existsSync(tmp)) {
  fs.mkdirSync(tmp)
}
if (!fs.existsSync(tmp0)) {
  fs.mkdirSync(tmp0)
}
if (!fs.existsSync(tmp1)) {
  fs.mkdirSync(tmp1)
}
if (!fs.existsSync(tmp2)) {
  fs.mkdirSync(tmp2)
}

botCluster.Node({
  host: '127.0.0.1:4242',
  secure: false, // if true, use wss and https instead of ws and http
  secret: 42,
  name: 'LocalNode-0',
  modulesDirectory: tmp1
}).catch(err => {
  console.error('[general-error-0]', err)
})

botCluster.Node({
  host: '127.0.0.1:4242',
  secure: false, // if true, use wss and https instead of ws and http
  secret: 42,
  name: 'LocalNode-1',
  modulesDirectory: tmp1
}).catch(err => {
  console.error('[general-error-1]', err)
})

botCluster.Node({
  host: '127.0.0.1:4242',
  secure: false, // if true, use wss and https instead of ws and http
  secret: 42,
  name: 'LocalNode-2',
  modulesDirectory: tmp1
}).catch(err => {
  console.error('[general-error-2]', err)
})
