//使用 WebSocket 的網址向 Server 開啟連結
let ws = new WebSocket('wss://' + window.location.hostname + ':3000');

function getLength(str){
    return str.replace(/[^\x00-\xff]/g,"OO").length;
}

function Set_Nickname() {
    if (ws.readyState === 1) {
        nickname = document.getElementById("input_Nickname")

        if (nickname.value.length < 1) {
            $('#nickError').html("<b>請輸入名稱</b>");
            return;
        }
        if (nickname.value.indexOf(" ") != -1) {
            $('#nickError').html("<b>字打好==</b>");
            return;
        }
        if (getLength(nickname.value) > 10) {
            $('#nickError').html("<b>名字太長了啦==你有什麼毛病</b>");
            return;
        }
        if (gameState == 1) {
            $('#nickError').html("<b>遊戲已經開始，請稍後加入</b>");
            return;
        }
        if (userList.indexOf(nickname.value) > -1   ) {
            $('#nickError').html("<b>房間內已有相同名稱，請重新命名</b>");
            console.log(userList.indexOf(nickname.value));
            return;
        }
        if (userList.length >= 10) {
            $('#nickError').html("<b>房間滿了啦好扯，是不是有人多開啊==</b>");
            console.log(userList.indexOf(nickname.value));
            return;
        }
        var msg = {
            type: "login",
            text: nickname.value,
            id: document.getElementById("input_Nickname").value,
            date: Date.now()
        };
        $('#nickWrap').fadeOut().hide(1000);
        $('#contentWrap').fadeIn().show(1000);
        ws.send(JSON.stringify(msg));
        // $('#btn_start').show(1000);
    }
    else{
        $('#nickError').html('無法建立連線，請重新整理或稍後嘗試!');
        return;
    }


    // socket.emit('new user', $nickBox.val() );

    // $nickBox.val('');
};

function StartGame() {
    var msg = {
        type: "startGame",
        //text: _nickname.value,
        //id: document.getElementById("input_Nickname").value,
        //date: Date.now()
    };
    if (ws.readyState === 1) {
        ws.send(JSON.stringify(msg));
    }
}

function Attack() {
    $('.choose').fadeOut().hide();
    var unProtect = $(userList).not(protectList).toArray();
    var canAttack = $(unProtect).not([nickname.value]).toArray();
    for (let index = 0; index < canAttack.length; index++) {
        $('#player'+userList.indexOf(canAttack[index])).css("border-color","yellow");
    }
    attackFlag = 1;
    passFlag = 0;
    $('#btn_back').show();
}

function Pass() {
    var canGive = $(userList).not([nickname.value]).toArray();
    for (let index = 0; index < canGive.length; index++) {
        $('#player'+userList.indexOf(canGive[index])).css("border-color","yellow");
    }
    $('.choose').fadeOut().hide();
    passFlag = 1;
    attackFlag = 0;
    $('#btn_back').show();
}

function Bear() {
    bearFlag = 1;
    if (skill1Used + skill2Used + skill3Used >= 3) {
        $('.choose').fadeOut().hide();
        GameOver(lastAttackID,nickname.value);
    } else {
        $('.choose').fadeOut().hide();
        $('#expose').fadeIn().show();
        $('#btn_back').fadeIn().show();
    }
}

function back() {
    choosen();
    $('#btn_back').hide();
    if (helpFlag == 1) {
        helpFlag = 0;
        $('#bearOrHelp').show();
    }
    else if (attackFlag == 1) {
        attackFlag = 0;
        $('#attackOrPass').show();
    }
    else if(passFlag == 1) {
        passFlag = 0;
        $('#attackOrPass').show();
    }
    else if (bearFlag = 1){
        bearFlag = 0;
        $('#expose').hide();
        $('#bearOrHelp').fadeIn().show();
    }
}

function Help() {
    helpFlag = 1;
    $('.choose').fadeOut(100).hide();
    var msg = {
        type: "help",
        index: myIndex,
        id: nickname.value,
        date: Date.now()
    };
    ws.send(JSON.stringify(msg));
    $('#btn_back').show();
}

function Inter() {
    beenHelp = true;
    $('.choose').fadeOut(100).hide();
    if (skill1Used == 0) {
        var msg = {
            type: "inter",
            index: myIndex,
            id: nickname.value,
            date: Date.now()
        };
        ws.send(JSON.stringify(msg));
    }
}

function Not() {
    $('.choose').fadeOut(100).hide();
}

function playerbeenClick(playIndex) {
    //player1
    beenClickID = userList[playIndex.id[6]];
    if (attackFlag == 1) {
        var unProtect = $(userList).not(protectList).toArray();
        var canAttack = $(unProtect).not([nickname.value]).toArray();
        if (canAttack.indexOf(beenClickID) == -1){ //點自己
            //$('#attackOrPass').fadeIn().show();
            return;
        }
        attackFlag = 0;
        choosen();
        $('#btn_back').hide();
        var msg = {
            type: "attack",
            index: myIndex,
            attackCharacter: myCharacter,
            id: nickname.value,
            to: beenClickID,
            date: Date.now()
        };
        ws.send(JSON.stringify(msg));

    }
    else if (passFlag == 1) {
        if (nickname.value == beenClickID) { //點自己
            //$('#attackOrPass').fadeIn().show();
            return;
        }
        passFlag = 0;
        choosen();
        $('#btn_back').hide();
        var msg = {
            type: "knife",
            index: myIndex,
            toKnife: beenClickID,
            text: "<b> "+ nickname.value + "</b> 將匕首傳給 <b>" + beenClickID + "</b> 。",
            id: '系統訊息',
            date: Date.now()
        };
        ws.send(JSON.stringify(msg));
    }
    else if (helpFlag == 1){
        if(helpList.indexOf(beenClickID)!=-1){
            helpFlag = 0;
            choosen();
            $('#btn_back').hide();
            var msg = {
                type: "trueDamage",
                index: myIndex,
                id: nickname.value,
                to: beenClickID,
                date: Date.now()
            };
            ws.send(JSON.stringify(msg));
        }
    }
    else if (skillFlag.skill2 == 1 ) {//刺客
        if (nickname.value == beenClickID && protectList.indexOf(beenClickID) !=-1 ) { //點自己
            return;
        }
        skillFlag.skill2 = 0;
        choosen();
        var msg = {
            type: "skill",
            index: myIndex,
            id: nickname.value,
            to: beenClickID,
            exposeType: 2,
            date: Date.now()
        };
        ws.send(JSON.stringify(msg));
    }
    else if (skillFlag.skill3 == 1 ) {//看兩張
        if (nickname.value == beenClickID || chooseOne == beenClickID) { //點自己
            return;
        }
        chooseOne = beenClickID;
        $('#player'+userList.indexOf(beenClickID)).css("border-color","black");
        chooseTwo++;
        var msg = {
            type: "skill",
            index: myIndex,
            id: nickname.value,
            to: beenClickID,
            exposeType: 3,
            date: Date.now()
        };
        ws.send(JSON.stringify(msg));
        if (chooseTwo == 2) {
            skillFlag.skill3 = 0;
            chooseTwo = 0;
            chooseOne = "";
            choosen();
            $('#attackOrPass').fadeIn().show(1000);
        }
    }
    else if (skillFlag.skill5 == 1 ) {//強制一個人受到傷害
        if (nickname.value == beenClickID && protectList.indexOf(beenClickID) != -1) { //點自己
            return;
        }
        choosen();
        skillFlag.skill5 = 0;
        var msg = {
            type: "skill",
            index: myIndex,
            id: nickname.value,
            to: beenClickID,
            exposeType: 5,
            date: Date.now()
        };
        ws.send(JSON.stringify(msg));
    }
    else if (skillFlag.skill6 == 1 ) {//給盾牌
        if (nickname.value == beenClickID && protectList.indexOf(beenClickID) != -1) { //點自己
            return;
        }
        choosen();
        skillFlag.skill6 = 0;
        var msg = {
            type: "skill",
            index: myIndex,
            id: nickname.value,
            to: beenClickID,
            exposeType: 6,
            date: Date.now()
        };
        ws.send(JSON.stringify(msg));
        $('#attackOrPass').fadeIn().show(1000);
    }
    else if (skillFlag.skill8 == 1 ) {//給法杖
        if (nickname.value == beenClickID) { //點自己
            return;
        }
        choosen();
        skillFlag.skill8 = 0;
        var msg = {
            type: "skill",
            index: myIndex,
            id: nickname.value,
            to: beenClickID,
            exposeType: 8
        };
        ws.send(JSON.stringify(msg));
        $('#attackOrPass').fadeIn().show(1000);
    }
    else if (skillFlag.skill9 == 1 ) {//給摺扇
        if (nickname.value == beenClickID) { //點自己
            return;
        }
        choosen();
        skillFlag.skill9 = 0;
        var msg = {
            type: "skill",
            index: myIndex,
            id: nickname.value,
            to: beenClickID,
            exposeType: 9
        };
        ws.send(JSON.stringify(msg));
        $('#attackOrPass').fadeIn().show(1000);
    }
    else if (skillFlag.skill10 == 1 ) {//給詛咒
        if (nickname.value == beenClickID || skillFlag.skill10_BeenClicked.indexOf(beenClickID) != -1) { //點自己
            return;
        }
        skillFlag.skill10_BeenClicked.push(beenClickID);
        $('#player'+userList.indexOf(beenClickID)).css("border-color","black");
        skillFlag.skill10_BeenChoose++;
        if (skillFlag.skill10_NeedChoose == skillFlag.skill10_BeenChoose) {
            var msg = {
                type: "skill",
                index: myIndex,
                id: nickname.value,
                curseList: skillFlag.skill10_BeenClicked,
                exposeType: 10,
                date: Date.now()
            };
            ws.send(JSON.stringify(msg));
            skillFlag.skill10_BeenChoose = 0;
            skillFlag.skill10_BeenClicked = [];
            choosen();
            $('#attackOrPass').fadeIn().show(1000);
        }
    }
}



function Send_Chat() {
    if (document.getElementById("input_chat").value <1) {
        return;
    }
    var msg = {
        type: "message",
        text: document.getElementById("input_chat").value,
        id: document.getElementById("input_Nickname").value,
        date: Date.now()
    };
    ws.send(JSON.stringify(msg));
    document.getElementById("input_chat").value = '';
}

var frmNick = ('#setNick');
var nickError = ('#nickError');


function updateOnlineList(user){
    var _onlineList = $("#onlineList").contents().find('body');
    var _text = ""
    myIndex = user.indexOf(nickname.value)
    if (myIndex == -1) {
        ws.close();
    }
    if (user.length >=6 && nickname.value!='' && myIndex == 0) {
        $('#btn_start').fadeIn().show(1000);
    }
    for (let index = 0; index < 10; index++) {
        $('#player'+index).hide();
    }
    for (let index = 0; index < user.length; index++) {
        const element = user[index];
        _text += "<br>" + element + "</br>";
        $('#player'+index).show(1000);
        $('#player'+index+'_nickname').text(element);
    }
    _onlineList.html(_text);
}

function GameOver(attackID,beenKilledID) {
    var msg = {
        type: "GameOver",
        attackID: attackID,
        beenKilledID: beenKilledID,
        date: Date.now()
    };
    ws.send(JSON.stringify(msg));
}



function choosen() {
    helpList = [];
    for (let index = 0; index < 10; index++) {
        $('#player'+index).css("border-color","black");
    }
}

function knifeChange(newKnife) {
    // haveKnife = newKnife;
    for (let index = 0; index < 10; index++) {
        $('#player'+index+'_knife').attr('src',"./img/knife-back.png") ;
    }
    $('#player'+userList.indexOf(newKnife)+'_knife').attr('src',"./img/knife.png") ;

}
//#region 音訊
var timer; //重複執行
var val; //倒數
function progress() {
    $("#soundCoolDown").show();
    $( "#menu" ).menu( "option", "disabled", true )
    progressbar = $( "#soundCoolDown" ),
    progressbarValue = progressbar.find( ".ui-progressbar-value" );

    console.log(progressbarValue);
    $("#soundCoolDown").progressbar("value", val-=1);
    if(val <= 0){
        $("#soundCoolDown").fadeOut().hide(1000);
        clearInterval(timer);
        $( "#menu" ).menu( "option", "disabled", false )
    }
}
function sound(soundIndex) {
    val=10
    progress();
    var msg = {
        type: "sound",
        text: "",
        id: document.getElementById("input_Nickname").value,
        date: Date.now()
    };
    switch (soundIndex) {
        case 1:
            msg.text = "水啦"
            break;
        case 2:
            msg.text = "爽啦"
            break;
        case 3:
            msg.text = "然後，將匕首交給他"
            break;
        case 4:
            msg.text = "I Got You Homie"
            break;
    
        default:
            break;
    }
    ws.send(JSON.stringify(msg));
    $("#menu").fadeOut().hide(1000);
    timer=setInterval(progress, 500);
}