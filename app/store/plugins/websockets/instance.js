const encodeData = data => {
  return unescape(encodeURIComponent(JSON.stringify(data)))
}

const decodeData = data => {
  return JSON.parse(decodeURIComponent(escape(data)))
}

export default (wsUrl, { onSuccess, onError, onMessage, onClose }) => {
  const socket = new WebSocket(wsUrl)
  let state = 0

  const send = (payload) => {
    socket.send(encodeData(payload))
  }

  const close = () => {
    socket.close()
  }

  socket.onclose = event => {
    onClose(event)
  }

  socket.onerror = error => {
    console.warn('[ws.error] code =', error.code, ' ; reason =', error.reason)
    onError(error)
  }

  socket.onmessage = event => {
    if (state === 1) {
      state = 2
      onSuccess()
    }
    const data = decodeData(event.data)
    return onMessage(data.type, data.data)
  }

  socket.onopen = event => {
    state = 1
  }

  return { send, close, socket }
}
