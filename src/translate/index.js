const { translateLink, translatePhonetic, translateLogo, getByteLength } = require('../utils/github')
const changeCase = require('change-case')
const getLink = require('../utils/link')
const itranslate = require('./itranslate')
const dictQuery = require('./query')

function Translate(documents, connection) {
  this._connection = connection
  this._documents = documents
}

Translate.prototype.setSettings = async function (setting) {
  this._settings = setting
  this._settings.hover = setting.hover || false
  this._settings.verbose = setting.verbose || false
  this._settings.noOriginal = setting.noOriginal || true
  this._settings.threshold = setting.threshold || 0
  this._settings.localLang = setting.localLang || "zh-CN"
  this._settings.priority = setting.priority || "offlineFirst"
  this._settings.provider = setting.provider || 'google'
  global.translateProxyUrl = setting.proxy || ''
  global.translateProviderProxyList = setting.proxyList || ["google"]
}

Translate.prototype.replaceText = async function (text, format) {
  const res = await itranslate(this._settings.provider, text, { to: 'en' })
  let result = res.result ? res.result[0] : ''
  if (format === 'hump' && res.from !== "en") {
    result = changeCase.camelCase(result)
  }
  return result
}

Translate.prototype.getText = async function (textDocumentPosition) {
  let block = await this.getSelectionContainPosition(textDocumentPosition)
  if (!block) {
    if (this._settings.hover) {   // 开启悬停取词才调用
      block = await this.getHoverContainPosition(textDocumentPosition)
    }
  }
  // console.log("BLOCK: ", block)
  if (block) {
    const provider = this._settings.provider
    const regexp = /^[A-Z0-9-\W]+$/
    let humanize = block.comment.trim()

    if (!regexp.test(humanize)) {
      humanize = humanize.replace(/\\|\/|\?|\?|\#|\*|\"|\“|\”|\'|\‘|\’|\(|\)|\<|\>|\{|\}|\[|\]|\[|\]|\:|\:|\.|\^|\$|\!|\~|\`|\||\_|\-|\=|\+|\|\%|\@|\&|\\n|\\r|\\t|\\b/g, " ");
      humanize = humanize.split(/(?=[A-Z0-9])/).join(' ').trim().replace(/\s{2,}/g, ' ');
    }

    let priority = this._settings.priority
    let targetLanguageComment = null
    let contents = []

    if (this._settings.threshold > 0 && humanize.split(' ').length > this._settings.threshold) {
      priority = "onlineFirst"
    }

    switch (priority) {
      case "offlineFirst":
        targetLanguageComment = await dictQuery(humanize)
        if (!targetLanguageComment || targetLanguageComment.text == "") {
          try {
            targetLanguageComment = await itranslate(provider, humanize, { to: this._settings.localLang })
          } catch (e) {
            console.log(e)
          }
        }
        break
      case "onlineFirst":
        try {
          targetLanguageComment = await itranslate(provider, humanize, { to: this._settings.localLang })
          if (!targetLanguageComment || targetLanguageComment.text == "") {
            targetLanguageComment = await dictQuery(humanize)
          }
        } catch (e) {
          console.log(e)
          targetLanguageComment = await dictQuery(humanize)
        }
        break
      case "onlyOffline":
        targetLanguageComment = await dictQuery(humanize)
        break
      case "onlyOnline":
        try {
          targetLanguageComment = await itranslate(provider, humanize, { to: this._settings.localLang })
        } catch (e) {
          console.log(e)
        }
        break
    }

    if (targetLanguageComment && targetLanguageComment.text != "") {
      // console.log(targetLanguageComment)
      let translateResult = targetLanguageComment.text
      if (this._settings.verbose && targetLanguageComment.candidate && targetLanguageComment.candidate.length > 0) {
        translateResult = targetLanguageComment.candidate.join(" ")
      }
      if (targetLanguageComment.phonetic) {
        phonetic = targetLanguageComment.phonetic
        contents.push(`${translateLink(block.path, provider, targetLanguageComment.link)} ${translatePhonetic(phonetic)}`)
      } else {
        contents.push(`${translateLink(block.path, provider, targetLanguageComment.link)}`)
      }
      // if (getByteLength(humanize) + getByteLength(translateResult) <= 60 && !this._settings.verbose) {  // 60个单字节字符或30个双字节字符
      //   contents.push(`${humanize} => ` + `${translateResult}`)
      // } else {
      if (!this._settings.noOriginal) {
        contents.push(`${translateLogo(block.path, "origin")} ${humanize}`)
      }

      let items = translateResult.split("\\n")
      for (let i = 0; i < items.length; i++) {
        let item = items[i]
        let line = ``
        if (item.startsWith(">>>")) {
          item = item.replace(">>>", "")
          line = `${translateLogo(block.path, "sub")} `
        }
        line = line + `${item}`
        if (i == 0) {
          line = `${translateLogo(block.path, "trans")} ` + line
        } else {
          line = `${translateLogo(block.path, "empty")} ` + line
        }
        contents.push(line)
      }
      // }
      contents.push(' ')
    } else {
      contents.push(`${translateLink(block.path, provider, getLink(provider, humanize))} 翻译失败啦/(ㄒoㄒ)/~~`)
    }
    return {
      contents: contents,
      range: block.range
    }
  }

  return null
}


Translate.prototype.getSelectionContainPosition = async function (textDocumentPosition) {
  let block = await this._connection.sendRequest('selectionContains', textDocumentPosition)
  return block
}

Translate.prototype.getHoverContainPosition = async function (textDocumentPosition) {
  let block = await this._connection.sendRequest('hoverContains', textDocumentPosition)
  return block
}

module.exports = Translate

// vsce package
