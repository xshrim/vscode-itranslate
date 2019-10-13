// function getExtensionPath() {
//     var myExtDir = vscode.extensions.getExtension("publisher.name").extensionPath;
// }
//
// 图片格式转换
// convert iheader.jpeg header.png
// convert -resize 16x16 header.png header.png 

function getGithubImage(path, name) {
    // return `https://raw.githubusercontent.com/im/vscode-wizard-translate/master/images/${name}`
    return `https://raw.githubusercontent.com/xshrim/vscode-itranslate/master/images/${name}`
}

function githubNameText(path) {
    // return `[![](https://raw.githubusercontent.com/im/vscode-wizard-translate/master/images/header.png) 糖小米](https://github.com/im)`
    return `[![](https://raw.githubusercontent.com/xshrim/vscode-itranslate/master/images/header.png) xshrim](https://github.com/xshrim)`
}

function translateSlogo(path) {
    let imgpath = path + `/images/origin.png`
    return `![](${imgpath})`
}

function translateDlogo(path) {
    let imgpath = path + `/images/trans.png`
    return `![](${imgpath})`
}

function translateLink(path, type, link) {
    // return `[![${type}](https://raw.githubusercontent.com/im/vscode-wizard-translate/master/images/${type}.png) [${type.toLocaleUpperCase()}]](${link})`
    let imgpath = path + `/images/${type}.png`
    return `[![${type}](${imgpath}) [${type.toLocaleUpperCase()}]](${link})`
}

function translatePhonetic(phonetic) {
    return `[[${phonetic.name}: ${phonetic.value}]](${phonetic.ttsURI})`
}

function getByteLength(str) {
    var l = str.length;
    var unicodeLen = 0;
    for (i = 0; i < l; i++) {
        if ((str.charCodeAt(i) > 127)) {
            unicodeLen++;
        }
        unicodeLen++;
    }
    return unicodeLen;
}

module.exports = {
    getGithubImage,
    translateLink,
    translatePhonetic,
    translateSlogo,
    translateDlogo,
    githubNameText,
    getByteLength
}