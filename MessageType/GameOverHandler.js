// textHandler.js
function handleGameOverMessage(wss, ws, gameData, msg) {
    var serverMsg = {
        type: "GameOver",
        shuffle: gameData.shuffle,
        text: "",
        id: '系統訊息',
        date: Date.now()
    };
    let attackCharacter = gameData.shuffle[gameData.userList.indexOf(msg.attackID)]
    let beenKilledCharacter = gameData.shuffle[gameData.userList.indexOf(msg.beenKilledID)]
    if (attackCharacter[0] == "B") {
        if (beenKilledCharacter == gameData.redTeam[0])
            serverMsg.text = "藍隊獲勝"
        else
            serverMsg.text = "紅隊獲勝"
    }
    else if (attackCharacter[0] == "R") {
        if (beenKilledCharacter == gameData.blueTeam[0])
            serverMsg.text = "紅隊獲勝"
        else
            serverMsg.text = "藍隊獲勝"
    }
    wss.clients.forEach(client => {
        client.send(JSON.stringify(serverMsg))
    })
  }
  
  module.exports = handleGameOverMessage;
  