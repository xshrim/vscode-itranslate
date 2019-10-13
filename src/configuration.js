
const { env, Position, window, workspace } = require('vscode');

const configuration = workspace.getConfiguration('iTranslate')

const translateServers = [
    ['google', '谷歌（谷歌旗下在线翻译服务）'],
    ['youdao', '有道（网易旗下在线翻译服务）'],
    ['baidu', '百度（百度旗下在线翻译服务）']
]

async function translateServerSelect() {
    let res = await window.showQuickPick(translateServers.map(item => item[1]), {
        placeHolder: '请选择翻译服务'
    });
    let target = translateServers.find(item => item[1] === res);
    if (target) {
        await configuration.update('translateServes', target[0]);
        console.log(configuration.translateServes)
    }
}

module.exports = {
    proxyUrl: configuration.proxy,
    translateServerSelect,
    configuration
}