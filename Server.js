//import express 和 ws 套件
const express = require('express')
const https = require('https');
const fs = require('fs');
const SocketServer = require('ws').Server

//指定開啟的 port
const PORT = 3000

// 讀取 SSL 憑證
const privateKey = fs.readFileSync('./CA/privkey.pem', 'utf8');
const certificate = fs.readFileSync('./CA/cert.pem', 'utf8');
const ca = fs.readFileSync('./CA/chain.pem', 'utf8'); // (可選) 有時需要中介憑證

const credentials = { key: privateKey, cert: certificate, ca: ca };

//創建 express 的物件，並綁定及監聽 3000 port ，且設定開啟後在 console 中提示
// const server = express()
//     .listen(PORT, () => console.log(`Listening on ${PORT}`))
const app = express();
// 設置靜態文件目錄
app.use(express.static('public'));

const server = https.createServer(credentials, app).listen(PORT, () => console.log(`Listening on ${PORT}`));
//將 express 交給 SocketServer 開啟 WebSocket 的服務
const wss = new SocketServer({ server });

var gameData = {
	userList: [],
	blueTeam: [],
	redTeam: [],
	neutral: [],
	gameState: 0,
	shuffle: [],
	haveKnife: "",
	purpleBeenUsed: false,
};
function gameInitial() {
	gameData.blueTeam = [];
	gameData.redTeam = [];
	gameData.neutral = [];
	gameData.gameState = 0;
	gameData.shuffle = [];
	gameData.purpleBeenUsed = false;
	gameData.haveKnife = "";
}
module.exports = gameInitial;
const messageHandlers = require('./messageHandler');
// messageHandlers.userList = userList;
// messageHandlers.gameState = gameState;

wss.on('connection',function connection(ws){
    // messageHandlers.ws = ws;
    //連結時執行此 console 提示
    // console.log('Client connected')

    wss.clients.forEach(client => {
        var firstUserList = {
            type: "firstUserList",
            user: gameData.userList,
            gameState: gameData.gameState
        }
        client.send(JSON.stringify(firstUserList));
    })

    ws.onmessage = function(receivedData) {
        var msg = JSON.parse(receivedData.data);
        var messageType = msg.type;
        console.log(msg);

        // 使用訊息處理器處理訊息
        if (messageHandlers.hasOwnProperty(messageType)) {
            messageHandlers[messageType](wss, ws, gameData, msg);
        } 
		else {
            // 未知訊息類型的處理邏輯
            console.warn("Unknown message type:", messageType);
		}
    }

    ws.on('close', () => {
        gameData.gameState = 0;
        gameInitial();
        if (gameData.userList.indexOf(ws.id) != -1) {
            
            gameData.userList.splice(gameData.userList.indexOf(ws.id), 1)
            wss.clients.forEach(client => {
                var leave = {
                    type: "disconnect",
                    text: ws.id + " 離開了房間",
                    user: gameData.userList,
                    id: '系統訊息',
                    date: Date.now()
                };
                client.send(JSON.stringify(leave))
                console.log(leave);
            })
            console.log(ws.id + ' Close connected')        
        }
    });
});