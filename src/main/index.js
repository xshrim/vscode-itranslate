const humanizeString = require('humanize-string')
const { google, youdao, baidu } = require('translation-api')
const { translateLink, translatePhonetic, translateSlogo, translateDlogo, getByteLength } = require('../utils/github')
const changeCase = require('change-case')
const getLink = require('../utils/link')

function Translate(documents, connection) {
    this._connection = connection
    this._documents = documents
}

Translate.prototype.setSettings = async function (setting) {
    this._settings = setting
    this._settings.hover = setting.hover || false
    this._settings.verbose = setting.verbose || false
    this._settings.translateServes = setting.translateServes || 'google'
    global.translateProxyUrl = setting.proxy || ''
}

Translate.prototype.servers = function (translateServes) {
    let s = null
    switch (translateServes) {
        case 'youdao':
            s = youdao
            break;
        case 'baidu':
            s = baidu
            break;
        default:
            s = google
    }
    return s
}

Translate.prototype.replaceText = async function (text, format) {
    const res = await this.servers(this._settings.translateServes).translate(humanizeString(text))
    let result = res.result ? res.result[0] : ''
    if (format === 'hump' && res.from === 'zh-CN') {
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
        const translateServes = this._settings.translateServes
        const humanize = humanizeString(block.comment)
        let targetLanguageComment = null
        let contents = []
        try {
            targetLanguageComment = await this.servers(translateServes).translate(humanize)
        } catch (e) {
            console.log(e)
        }
        if (targetLanguageComment) {
            // console.log(targetLanguageComment)
            let translateResult = targetLanguageComment.result
            if (this._settings.verbose && targetLanguageComment.dict && targetLanguageComment.dict.length > 0) {
                translateResult = targetLanguageComment.dict
            }
            if (targetLanguageComment.phonetic && targetLanguageComment.phonetic.length > 0) {
                phonetic = targetLanguageComment.phonetic[0]
                contents.push(`${translateLink(block.path, translateServes, targetLanguageComment.link)} ${translatePhonetic(phonetic)}`)
            } else {
                contents.push(`${translateLink(block.path, translateServes, targetLanguageComment.link)}`)
            }
            if (getByteLength(humanize) <= 30 && !this._settings.verbose) {  // 30个单字节字符或15个双字节字符
                contents.push(`${humanize} => ` + `${translateResult}`)
            } else {
                contents.push(`${translateSlogo(block.path)} ${humanize}`)
                contents.push(`${translateDlogo(block.path)} ${translateResult}`)
            }
            contents.push(' ')
        } else {
            contents.push(`翻译失败啦/(ㄒoㄒ)/~~ ${translateLink(block.path, translateServes, getLink(translateServes, humanize))}`)
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
