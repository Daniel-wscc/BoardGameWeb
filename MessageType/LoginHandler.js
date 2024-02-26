// LoginHandler.js
// var userList = module.exports.userList;
// var _gameState = module.exports.gameState;
//var ws = module.exports.ws;
function handleloginMessage(wss, ws, gameData, msg) {
    // 處理文字訊息的邏輯
    if (gameData.gameState == 0) {
        gameData.userList.push(msg.id);
        wss.clients.forEach(client => {
            var welcome = {
                type: "welcome",
                text: msg.id + ' 已連接。',
                user: gameData.userList,
                id: '系統訊息',
                date: Date.now()
            };
            ws.id = msg.id;
            client.send(JSON.stringify(welcome))
            //console.log(welcome);
        })
    }
    else{
        var alreadyStart = {
            type: "alreadyStart",
            gameState: gameData.gameState,
        };
        ws.send(JSON.stringify(alreadyStart));
    }
    console.log("Received [Login] message:", msg.text);
  }
  
  module.exports = handleloginMessage;
  