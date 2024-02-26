// textHandler.js
function handleTrueDamageMessage(wss, ws, gameData, msg) {
    console.log(msg);
    wss.clients.forEach(client => {
        var serverMsg = {
            type: "trueDamage", 
            subject: msg.id,
            to: msg.to
        };
        client.send(JSON.stringify(serverMsg))
    })
  }
  
  module.exports = handleTrueDamageMessage;
  