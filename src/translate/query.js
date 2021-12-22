

function query(humanize) {
  return new Promise((resolve) => {
    let words = new Array()
    let result = new Array()
    let phonetic = new Array()
    let lang = ""

    humanize.split(' ').forEach(wd => {
      if (wd.search(/[^a-zA-Z]+/) >= 0) {
        let wds = wd.split(/([A-Z0-9]*[0-9]+[A-Z0-9]*)/g)
        wds.forEach(w => {
          if (w.match(/^[A-Z0-9]*[0-9]+[A-Z0-9]*$/)) {
            words.push(w)
          } else {
            let nws = w.split(/([a-zA-Z0-9]+)/g)
            nws.forEach(nw => {
              if (nw.match(/^[a-zA-Z0-9]+$/)) {
                words.push(nw)
              } else {
                let nodejieba = require("nodejieba")
                words.push(...nodejieba.cut(nw))
              }
            })
          }
        })
      } else {
        words.push(wd)
      }
    })

    words.forEach(word => {
      if (word.match(/^[a-zA-Z0-9]+$/) && !word.match(/^[A-Z0-9]*[0-9]+[A-Z0-9]*$/)) {
        if (lang == "汉") {
          lang = "合"
        } else if (lang == "") {
          lang = "美"
        }

        word = word.toLowerCase()
        let wresult = ''
        let wphonetic = ''
        if (word.length > 0) {
          let dict = null
          if (word.length < 2) {
            dict = require(__dirname + `/dict/w.json`)
          } else {
            let prefix = word.substring(0, 2)
            dict = require(__dirname + `/dict/${prefix}.json`)
          }
          if (dict[word]) {
            if (words.length > 1) {
              result.push(">>>" + word)
            }
            if (dict[word] instanceof Object) {
              wresult = dict[word].t
              wphonetic = dict[word].p
            } else {
              wresult = dict[word]
            }
            dict = null
          }
        }
        result.push(wresult)
        phonetic.push(wphonetic)
      } else {
        if (lang == "美") {
          lang = "合"
        } else if (lang == "") {
          lang = "汉"
        }
        let wresult = ''
        let wphonetic = ''
        let cedict = require(__dirname + `/dict/cedict.json`)
        let dict = cedict[word]
        if (words.length > 1) {
          result.push(">>>" + word)
        }
        if (dict) {
          wresult = dict.english
          wphonetic = dict.pinyin
        }
        result.push(wresult)
        phonetic.push(wphonetic)
        dict = null
      }
    })

    resolve({
      "word": words.join(' '),
      "text": result.join('\\n'),
      "candidate": [],
      "link": "",
      "phonetic": {
        "name": lang,
        "value": phonetic.join(' '),
        "ttsURI": ""
      }
    })
  })
}

module.exports = query