const { broadcast, escapeHtml } = require('../utils/broadcast');

function handleHelpMessage(wss, ws, gameData, msg) {
    console.log(msg);
    var serverMsg = {
        type: "help",
        text: "<b> " + escapeHtml(msg.id) + "</b> 正等待干涉 。 ",
        needHelp: msg.id,
        haveKnife: gameData.haveKnife,
        id: '系統訊息',
        date: Date.now()
    };
    broadcast(wss, serverMsg);
}

module.exports = handleHelpMessage;
