const gameInitial = require('./../Server');
function handleStartGameMessage(wss, ws, gameData, msg) {
    gameInitial();
    _gameState = 1;
    console.log(gameData.userList.length);
    var allCard = [];
    var oddflag = 0;
    if (gameData.userList.length %2 == 1) {
        //奇數玩家加入調查官
        if (parseInt(Math.random()*2))
            allCard.push("B0");
        else
            allCard.push("R0");
        oddflag = 1;
    }
    for (let index = 0; index < gameData.userList.length - oddflag; ) {
        if (index % 2 == 0) {
            var _rand = parseInt(Math.random()*9) + 1;
            var blueCard = 'B' + _rand;
            if (allCard.indexOf(blueCard) == -1) {
                allCard.push(blueCard);
                gameData.blueTeam.push(blueCard);
                index++;
            }
        }
        else{
            var _rand = parseInt(Math.random()*9) + 1;
            var redCard = 'R' + _rand;
            if (allCard.indexOf(redCard) == -1) {
                allCard.push(redCard);
                gameData.redTeam.push(redCard);
                index++;
            }
        }
    }
    //排序各隊技能大小，用來判斷族長
    gameData.blueTeam.sort();
    gameData.redTeam.sort();
    gameData.blueTeam.forEach(element => {
        console.log('blueTeam= ' + element);
    });
    gameData.redTeam.forEach(element => {
        console.log('redTeam= ' + element);
    });
    
    var _rand = parseInt(Math.random()*allCard.length);
    var _kniferand = parseInt(Math.random()*gameData.userList.length);

    for (let index = allCard.length; index > 0; index--) {
        var _shfflerand = parseInt(Math.random()*index);
        gameData.shuffle.push(allCard[_shfflerand]);
        allCard.splice(_shfflerand,1);
    }
    wss.clients.forEach(client => {
        // var alreadyStart = {.
        //     type: "alreadyStart",
        //     gameState: _gameState,
        // };
        // client.send(JSON.stringify(alreadyStart));
        if (gameData.userList.indexOf(client.id)==-1) {
            return;
        }
        var clientTeam = gameData.shuffle[gameData.userList.indexOf(client.id)];
        if (gameData.userList.indexOf(client.id) != gameData.shuffle.length-1) {
            var leftTeam = gameData.shuffle[gameData.userList.indexOf(client.id)+1];
        }
        else{
            var leftTeam = gameData.shuffle[0];
        }
        var clientText = "遊戲開始，你被分配到 ";
        gameData.shuffle.forEach(element => {
            console.log('shuffle= ' + element);
        });
        console.log("clientTeam="+clientTeam);
        console.log(gameData.userList.indexOf(client.id));
        console.log("gameData.shuffle.Length="+gameData.shuffle.length);
        
        if (clientTeam[0] == "B") {
            clientText+="<span style = 'color:blue'> 藍隊 </span>的 <b>"
        }
        else if (clientTeam[0] == "R") {
            clientText+="<span style = 'color:red'> 紅隊 </span>的 <b>"
        }
        var role = ["","長老","刺客","弄臣","煉金術師","靈喻者","衛士","狂戰士","法師","舞妓","調查官"];
        clientText += role[parseInt(clientTeam[1])];
        clientText += "。</b>"
        var distribute = {
            type: "distribute",
            text: clientText,
            team: clientTeam,
            user: gameData.userList,
            id: '系統訊息',
            date: Date.now()
        };
        client.send(JSON.stringify(distribute))
        //console.log(client.id);
        allCard.splice(allCard.indexOf(clientTeam),1);
        if ((leftTeam[0] == "B" && leftTeam != "B3") || leftTeam == "R3") {
            var leftRB = 'B'
            var leftTeamText = "右邊玩家向您接露陣營提示為 <span style = 'color:blue'> 藍色 </span>";
        } 
        else{
            var leftRB = 'R'
            var leftTeamText = "右邊玩家向您接露陣營提示為 <span style = 'color:red'> 紅色 </span>";
        }
        var leftTeamMsg = {
            type: "leftTeamMsg",
            text: leftTeamText,
            team: leftRB,
            user: gameData.userList,
            id: '系統訊息',
            date: Date.now()
        }
        client.send(JSON.stringify(leftTeamMsg))
        
        gameData.haveKnife = gameData.userList[_kniferand];
        var kinfeStart = {
            type: "knife",
            text: "<b> "+ gameData.haveKnife + "</b> 被選為起始玩家，請選擇攻擊或是跳過。",
            toKnife: gameData.haveKnife,
            user: gameData.userList,
            gameData: gameData,
            id: '系統訊息',
            date: Date.now()
        };
        client.send(JSON.stringify(kinfeStart))
        console.log(kinfeStart.text);
    })
  }
  
  module.exports = handleStartGameMessage;
  