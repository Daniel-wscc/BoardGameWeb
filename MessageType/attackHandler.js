const { broadcast, escapeHtml } = require('../utils/broadcast');

function handleAttackMessage(wss, ws, gameData, msg) {
    console.log(msg);
    var serverMsg = {
        type: "attack",
        text: "<b> " + escapeHtml(msg.id) + "</b> 選擇攻擊 <b>" + escapeHtml(msg.to) + "</b> 。",
        user: gameData.userList,
        subject: msg.id,
        attackTo: msg.to,
        id: '系統訊息',
        date: Date.now()
    };
    broadcast(wss, serverMsg);
}

module.exports = handleAttackMessage;
