// https://stackoverflow.com/a/14801711

function purgeCache (moduleName) {
  const modId = require.resolve(moduleName)

  if (modId) {
    const modCache = require.cache[modId]

    if (modCache !== undefined) {
      const traverse = mod => {
        mod.children.forEach(traverse)
        delete require.cache[mod.id]
      }
      traverse(modCache)
    }
  }

  Object.keys(module.constructor._pathCache).forEach(cacheKey => {
    if (cacheKey.indexOf(moduleName) > 0) {
      delete module.constructor._pathCache[cacheKey]
    }
  })
}

module.exports = (moduleName) => {
  purgeCache(moduleName)
  return require(moduleName)
}
