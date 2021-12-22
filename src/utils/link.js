module.exports = function (type, text) {
  let link = ''
  switch (type) {
    case 'google':
      link = `https://translate.google.cn/#view=home&op=translate&sl=auto&tl=auto&text=${encodeURIComponent(text)}`
      break
    case 'microsoft':
      link = `https://cn.bing.com/translator/`
      break;
    case 'youdao':
      link = `https://dict.youdao.com/search?q=${encodeURIComponent(text)}&keyfrom=fanyi.smartResult`
      break;
    case 'baidu':
      link = `https://fanyi.baidu.com/#en/zh/${encodeURIComponent(text)}`
      break;
    case 'tencent':
      link = `https://fanyi.qq.com/`
      break;
    default:
      link = `https://translate.google.cn/#view=home&op=translate&sl=auto&tl=auto&text=${encodeURIComponent(text)}`
  }
  return link
}