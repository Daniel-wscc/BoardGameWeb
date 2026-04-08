const { broadcast, escapeHtml } = require('../utils/broadcast');

function handleToKnifeMessage(wss, ws, gameData, msg) {
    console.log(msg);
    var serverMsg = {
        type: "knife",
        text: "<b> " + escapeHtml(msg.id) + "</b> 將匕首傳給 <b>" + escapeHtml(msg.to) + "</b> 。",
        haveKnife: gameData.haveKnife,
        user: gameData.userList,
        give: msg.id,
        toKnife: msg.to,
        id: '系統訊息',
        date: Date.now()
    };
    broadcast(wss, serverMsg);
}

module.exports = handleToKnifeMessage;
