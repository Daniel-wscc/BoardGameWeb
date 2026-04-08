const { broadcast, escapeHtml } = require('../utils/broadcast');

function handleLoginMessage(wss, ws, gameData, msg) {
    if (gameData.gameState == 0) {
        gameData.userList.push(msg.id);
        ws.id = msg.id;
        var welcome = {
            type: "welcome",
            text: escapeHtml(msg.id) + ' 已連接。',
            user: gameData.userList,
            id: '系統訊息',
            date: Date.now()
        };
        broadcast(wss, welcome);
    }
    else {
        var alreadyStart = {
            type: "alreadyStart",
            gameState: gameData.gameState,
        };
        ws.send(JSON.stringify(alreadyStart));
    }
    console.log("Received [Login] message:", msg.text);
}

module.exports = handleLoginMessage;
