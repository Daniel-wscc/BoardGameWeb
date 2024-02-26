// textHandler.js
function handleBroadcastMessage(wss, ws, gameData, msg) {
    // 處理文字訊息的邏輯
    wss.clients.forEach(client => {
        client.send(JSON.stringify(msg));
    })
    console.log("[handleBroadcastMessage] Received message:", msg);
  }
  
  module.exports = handleBroadcastMessage;
  