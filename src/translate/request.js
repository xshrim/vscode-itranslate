const got = require('got');
const { HttpProxyAgent, HttpsProxyAgent } = require('hpagent')

module.exports = Object.assign(async (method, url, options) => {
  let req

  if (options === undefined) {
    options = {}
  }

  if (!options.hasOwnProperty("timeout")) {
    options.timeout = 5000
  }

  if (!options.hasOwnProperty("headers")) {
    options.headers = {
      'User-Agent': 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36'
    }
  } else {
    if (!options.headers.hasOwnProperty("User-Agent")) {
      options.headers['User-Agent'] = 'Mozilla/5.0 (Linux; Android 5.0; SM-G900P Build/LRX21T) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/69.0.3497.100 Mobile Safari/537.36'
    }
  }

  if (global.translateProxyAgentUrl && !options.hasOwnProperty("agent")) {
    if (url.startsWith("https://")) {
      options.agent = {
        https: new HttpsProxyAgent({
          keepAlive: true,
          keepAliveMsecs: 1000,
          maxSockets: 256,
          maxFreeSockets: 256,
          scheduling: 'lifo',
          proxy: global.translateProxyUrl
        })
      }
    } else {
      options.agent = {
        https: new HttpProxyAgent({
          keepAlive: true,
          keepAliveMsecs: 1000,
          maxSockets: 256,
          maxFreeSockets: 256,
          scheduling: 'lifo',
          proxy: global.translateProxyUrl
        })
      }
    }
  }

  switch (method) {
    case "get":
      req = await got.get(url, options)
      break
    case "post":
      req = await got.post(url, options)
      break
    case "put":
      req = await got.put(url, options)
      break
    case "patch":
      req = await got.patch(url, options)
      break
    case "delete":
      req = await got.delete(url, options)
      break
  }

  return req
})
