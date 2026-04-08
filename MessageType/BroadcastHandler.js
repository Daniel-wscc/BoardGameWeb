const { broadcast } = require('../utils/broadcast');

function handleBroadcastMessage(wss, ws, gameData, msg) {
    // 只傳送客戶端需要的資料，避免洩漏完整 gameData（含隊伍陣容、洗牌結果）
    var clientMsg = Object.assign({}, msg);
    clientMsg.haveKnife = gameData.haveKnife;
    clientMsg.userList = gameData.userList;
    broadcast(wss, clientMsg);
    console.log("[handleBroadcastMessage] Received message:", msg.type);
}

module.exports = handleBroadcastMessage;
