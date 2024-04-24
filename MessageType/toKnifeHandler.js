// textHandler.js
function handleToKnifeMessage(wss, ws, gameData, msg) {
    console.log(msg);
    wss.clients.forEach(client => {
        var serverMsg = {
            type: "knife",
            text: "<b> "+ msg.id + "</b> 將匕首傳給 <b>" + msg.to + "</b> 。",
            gameData: gameData,
            user: gameData.userList,
            give: msg.id,
            toKnife: msg.to,
            id: '系統訊息',
            date: Date.now()
        };
        client.send(JSON.stringify(serverMsg))
    })
  }
  
  module.exports = handleToKnifeMessage;
  