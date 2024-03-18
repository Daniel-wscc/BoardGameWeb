// SkillHandler.js
function handleSkillMessage(wss, ws, gameData, msg) {
    console.log(msg);
    var clickChara = gameData.shuffle[gameData.userList.indexOf(msg.to)]
    var serverMsg = {
        type: "skill", 
        text: "",
        subject: msg.id,
        index: msg.index,
        to: msg.to,
        chara: clickChara,
        exposeType: msg.exposeType,
        purpleBeenUsed: gameData.purpleBeenUsed,
        id: '系統訊息',
        date: Date.now()
    };
    switch (msg.exposeType) {
        case 1:
            if (msg.team == "B") {
                gameData.blueTeam.reverse();
            } else {
                gameData.redTeam.reverse();
            }
            break;
        case 2:
            serverMsg.text =  "<b> "+ msg.id + "</b> 強制使 <b>" + msg.to + "</b> 受到兩點傷害。"
            break;
        case 3:
            serverMsg.text =  "<b> "+ msg.id + "</b> 選擇查看 <b>" + msg.to + "</b> 的角色。"
            break;
        case 5:
            serverMsg.text =   "<b> "+ msg.id + "</b> 強制使 <b>" + msg.to + "</b> 受到一點傷害(優先揭露等級指示物)。"
            break;
        case 6:
            serverMsg.text = "將盾牌給予 <b>" + msg.to + "</b> 直到 <b> "+ msg.id + "</b> 受到三點傷害。"
            gameData.purpleBeenUsed = true;
            break;
        case 7:
            serverMsg.text =  "<b>" + msg.id + "</b> 強制使 <b> "+ msg.to + "</b> 受到一點傷害。"
            break;
        case 8:
            serverMsg.text = "<b> "+ msg.id + "</b> 將法杖給予 <b>" + msg.to + "</b> 並自己拿取法杖。"
            break;
        case 9:
            serverMsg.text = "<b> "+ msg.id + "</b> 將折扇給予 <b>" + msg.to + "</b> 。"
            break;
    }
    wss.clients.forEach(client => {
        client.send(JSON.stringify(serverMsg))
    })
  }
  
  module.exports = handleSkillMessage;
  