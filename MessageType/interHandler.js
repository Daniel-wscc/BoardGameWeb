// textHandler.js
function handleInterMessage(wss, ws, gameData, msg) {
    console.log(msg);
            wss.clients.forEach(client => {
                var serverMsg = {
                    type: "inter",
                    text: "<b> "+ msg.id + "</b> 選擇干涉 。 ",
                    subject: msg.id,
                    id: '系統訊息',
                    date: Date.now()
                };
                client.send(JSON.stringify(serverMsg))
            })
  }
  
  module.exports = handleInterMessage;
  