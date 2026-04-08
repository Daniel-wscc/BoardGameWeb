const { broadcast, escapeHtml } = require('../utils/broadcast');

function handleInterMessage(wss, ws, gameData, msg) {
    console.log(msg);
    var serverMsg = {
        type: "inter",
        text: "<b> " + escapeHtml(msg.id) + "</b> 選擇干涉 。 ",
        subject: msg.id,
        id: '系統訊息',
        date: Date.now()
    };
    broadcast(wss, serverMsg);
}

module.exports = handleInterMessage;
