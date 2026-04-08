const { escapeHtml } = require('../utils/broadcast');

function resetGameData(gameData) {
    gameData.blueTeam = [];
    gameData.redTeam = [];
    gameData.neutral = [];
    gameData.gameState = 0;
    gameData.shuffle = [];
    gameData.purpleBeenUsed = false;
    gameData.haveKnife = "";
}

function fisherYatesShuffle(arr) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1));
        var temp = arr[i];
        arr[i] = arr[j];
        arr[j] = temp;
    }
    return arr;
}

function handleStartGameMessage(wss, ws, gameData, msg) {
    resetGameData(gameData);
    var _gameState = 1;
    console.log(gameData.userList.length);

    // 建立候選池再隨機抽取，避免碰撞式隨機的效能問題
    var bluePool = [];
    var redPool = [];
    for (var i = 1; i <= 9; i++) {
        bluePool.push('B' + i);
        redPool.push('R' + i);
    }
    fisherYatesShuffle(bluePool);
    fisherYatesShuffle(redPool);

    var allCard = [];
    var oddflag = 0;
    if (gameData.userList.length % 2 == 1) {
        // 奇數玩家加入調查官
        if (Math.random() < 0.5)
            allCard.push("B0");
        else
            allCard.push("R0");
        oddflag = 1;
    }

    var blueCount = 0;
    var redCount = 0;
    for (var index = 0; index < gameData.userList.length - oddflag; index++) {
        if (index % 2 == 0) {
            allCard.push(bluePool[blueCount]);
            gameData.blueTeam.push(bluePool[blueCount]);
            blueCount++;
        } else {
            allCard.push(redPool[redCount]);
            gameData.redTeam.push(redPool[redCount]);
            redCount++;
        }
    }

    // 排序各隊技能大小，用來判斷族長
    gameData.blueTeam.sort();
    gameData.redTeam.sort();
    gameData.blueTeam.forEach(function(element) {
        console.log('blueTeam= ' + element);
    });
    gameData.redTeam.forEach(function(element) {
        console.log('redTeam= ' + element);
    });

    var _kniferand = Math.floor(Math.random() * gameData.userList.length);

    // Fisher-Yates 洗牌
    gameData.shuffle = fisherYatesShuffle(allCard.slice());

    var role = ["調查官", "長老", "刺客", "弄臣", "煉金術師", "靈喻者", "衛士", "狂戰士", "法師", "舞妓"];

    wss.clients.forEach(function(client) {
        if (gameData.userList.indexOf(client.id) == -1) {
            return;
        }
        var clientIdx = gameData.userList.indexOf(client.id);
        var clientTeam = gameData.shuffle[clientIdx];
        var leftTeam;
        if (clientIdx != gameData.shuffle.length - 1) {
            leftTeam = gameData.shuffle[clientIdx + 1];
        } else {
            leftTeam = gameData.shuffle[0];
        }

        gameData.shuffle.forEach(function(element) {
            console.log('shuffle= ' + element);
        });
        console.log("clientTeam=" + clientTeam);
        console.log(clientIdx);
        console.log("gameData.shuffle.Length=" + gameData.shuffle.length);

        var clientText = "遊戲開始，你被分配到 ";
        if (clientTeam[0] == "B") {
            clientText += "<span style = 'color:blue'> 藍隊 </span>的 <b>";
        } else if (clientTeam[0] == "R") {
            clientText += "<span style = 'color:red'> 紅隊 </span>的 <b>";
        }
        clientText += role[parseInt(clientTeam[1])];
        clientText += "。</b>";

        var distribute = {
            type: "distribute",
            text: clientText,
            team: clientTeam,
            user: gameData.userList,
            id: '系統訊息',
            date: Date.now()
        };
        client.send(JSON.stringify(distribute));

        var leftRB, leftTeamText;
        if ((leftTeam[0] == "B" && leftTeam != "B3") || leftTeam == "R3") {
            leftRB = 'B';
            leftTeamText = "右邊玩家向您揭露陣營提示為 <span style = 'color:blue'> 藍色 </span>";
        } else {
            leftRB = 'R';
            leftTeamText = "右邊玩家向您揭露陣營提示為 <span style = 'color:red'> 紅色 </span>";
        }
        var leftTeamMsg = {
            type: "leftTeamMsg",
            text: leftTeamText,
            team: leftRB,
            user: gameData.userList,
            id: '系統訊息',
            date: Date.now()
        };
        client.send(JSON.stringify(leftTeamMsg));

        gameData.haveKnife = gameData.userList[_kniferand];
        var safeKnife = escapeHtml(gameData.haveKnife);
        var knifeStart = {
            type: "knife",
            text: "<b> " + safeKnife + "</b> 被選為起始玩家，請選擇攻擊或是跳過。",
            toKnife: gameData.haveKnife,
            user: gameData.userList,
            haveKnife: gameData.haveKnife,
            id: '系統訊息',
            date: Date.now()
        };
        client.send(JSON.stringify(knifeStart));
        console.log(knifeStart.text);
    });
}

module.exports = handleStartGameMessage;
