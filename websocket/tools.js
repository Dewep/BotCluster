function encodeData (data) {
  return unescape(encodeURIComponent(JSON.stringify(data)))
}

function decodeData (data) {
  return JSON.parse(decodeURIComponent(escape(data)))
}

module.exports = {
  encodeData,
  decodeData
}
