// textHandler.js
function handleAttackMessage(wss, ws, gameData, msg) {
    console.log(msg);
    wss.clients.forEach(client => {
        var serverMsg = {
            type: "attack",
            text: "<b> "+ msg.id + "</b> 選擇攻擊 <b>" + msg.to + "</b> 。",
            user: gameData.userList,
            subject: msg.id,
            attackTo: msg.to,
            id: '系統訊息',
            date: Date.now()
        };
        client.send(JSON.stringify(serverMsg))
    })
  }
  
  module.exports = handleAttackMessage;
  