// textHandler.js
function handleHelpMessage(wss, ws, gameData, msg) {
    console.log(msg);
    wss.clients.forEach(client => {
        var serverMsg = {
            type: "help",
            text: "<b> "+ msg.id + "</b> 正等待干涉 。 ",
            needHelp: msg.id,
            id: '系統訊息',
            date: Date.now()
        };
        client.send(JSON.stringify(serverMsg))
    })
  }
  
  module.exports = handleHelpMessage;
  