const google = require('./google');
const microsoft = require('./microsoft');
const baidu = require('./baidu');
const youdao = require('./youdao');
const tencent = require('./tencent');
const yandex = require('./yandex');

const providers = {
  "google": google,
  "microsoft": microsoft,
  "baidu": baidu,
  "youdao": youdao,
  "tencent": tencent,
  "yandex": yandex,
}

// module.exports = {
//   google, microsoft, youdao, baidu, yandex, tencent
// }

async function itranslate(provider, word, options) {
  if (global.translateProxyUrl && global.translateProviderProxyList.indexOf(provider) >= 0) {
    global.translateProxyAgentUrl = global.translateProxyUrl
  } else {
    global.translateProxyAgentUrl = undefined
  }

  if (options.from) {
    options.from = providers[provider][options.from]
  }

  if (options.to) {
    options.to = providers[provider][options.to]
  }

  const regexp = /^.*[^A-Za-z\s]+.*$/
  if (regexp.test(word)) {
    options.to = providers[provider]['en']
  }

  try {
    let result = await providers[provider](word, options)
    if (result.candidate[0] == result.text) {
      result.candidate.shift();
    }
    return result
  } catch (err) {
    console.log(err)
  }

  return {}
}

module.exports = itranslate