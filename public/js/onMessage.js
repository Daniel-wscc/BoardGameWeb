function playSound(name, volume) {
    var audio = new Audio('./sounds/' + name + '.wav');
    audio.volume = (volume !== undefined) ? volume : 0.2;
    audio.play();
}

var messageHandlers = {
    firstUserList: function(msg) {
        userList = msg.user;
        gameState = msg.gameState;
    },
    welcome: function(msg) {
        initial();
        userList = msg.user;
        if (nickname.value != null) {
            updateOnlineList(userList);
            console.log(msg);
        }
    },
    alreadyStart: function(msg) {
        gameState = 1;
        $('#nickError').html("遊戲已經開始，請稍後加入");
    },
    disconnect: function(msg) {
        initial();
        $('#nickError').html("");
        userList = msg.user;
        $('#btn_start').fadeOut().hide(1000);
        updateOnlineList(userList);
    },
    distribute: function(msg) {
        playSound('shuffle');
        initial();
        myCharacter = msg.team;
        var characterImg = './img/' + msg.team + '.png';
        exposeStr = skillList[msg.team[1]].replaceAll('T', msg.team[0]);
        $('#skill1').css('background-image', 'url("./img/skill-' + exposeStr[0] + '.png")');
        $('#skill2').css('background-image', 'url("./img/expose-' + exposeStr[1] + '.png")');
        $('#skill3').css('background-image', 'url("./img/expose-' + exposeStr[2] + '.png")');
        $('#player' + userList.indexOf(nickname.value) + "_cardBack").attr('src', characterImg);
        $('#btn_start').fadeOut().hide(1000);
        gameState = 1;
    },
    knife: function(msg) {
        knifeChange(msg.haveKnife);
        if (nickname.value == msg.toKnife) {
            playSound('playerenter');
            $("#attackOrPass").delay(3000).fadeIn().show(1000);
        }
    },
    leftTeamMsg: function(msg) {
        var leftCharacterImg = './img/card-' + msg.team + '.png';
        if (myIndex != userList.length - 1) {
            $('#player' + (myIndex + 1) + "_cardBack").delay(5000).attr('src', leftCharacterImg);
        } else {
            $("#player0_cardBack").delay(5000).attr('src', leftCharacterImg);
        }
    },
    sound: function(msg) {
        playSound(msg.text);
    },
    attack: function(msg) {
        $(".chooose").fadeOut(100).hide();
        lastAttackID = msg.subject;
        if (nickname.value == msg.attackTo) {
            playSound('playerenter');
            if (myCharacter[0] == "N" && (skill1Used + skill2Used + skill3Used) == 3) {
                var sendMsg = {
                    type: "skill10CantKill",
                    team: myCharacter[0],
                    skill10ID: msg.subject,
                    id: nickname.value,
                };
                ws.send(JSON.stringify(sendMsg));
                return;
            }
            if (skillEffects.skill9 == 1) {
                Bear();
            } else {
                $("#bearOrHelp").delay(1000).fadeIn().show(1000);
            }
        }
    },
    help: function(msg) {
        if (nickname.value != msg.needHelp && nickname.value != msg.haveKnife) {
            if (skill1Used != 1) {
                $('#interOrNot').fadeIn().show(1000);
            }
        }
    },
    inter: function(msg) {
        helpList.push(msg.subject);
        $('#player' + userList.indexOf(msg.subject)).css("border-color", "yellow");
    },
    trueDamage: function(msg) {
        $(".choose").fadeOut().hide(1000);
        choosen();
        if (nickname.value == msg.to) {
            playSound('playerenter');
            knifeChange(msg.to);
            skill1();
        }
    },
    expose: function(msg) {
        $("#interOrNot").fadeOut(100).hide();
        $("#player" + msg.index + " .selection" + msg.selectionIndex).css({ 'background-image': 'url("./img/expose-' + msg.exposeType + '.png")', "background-size": "32px 32px" });
        if (!msg.skillEffects.skill4 && !msg.skillEffects.skill7) {
            knifeChange(msg.subject);
        } else {
            knifeChange(msg.lastAttack);
            if (nickname.value == msg.lastAttack) {
                $("#attackOrPass").fadeIn().show(1000);
            }
        }
    },
    skill10CantKill: function(msg) {
        if (nickname.value == msg.skill10ID) {
            playSound('playerenter');
            $('#attackOrPass').fadeIn().show(1000);
        }
    },
    skill: function(msg) {
        $("#player" + msg.index + " .selection1").css({ 'background-image': 'url("./img/skill-' + msg.exposeType + '.png")', "background-size": "32px 32px" });
        var skillSubHandlers = {
            1: function() {
                knifeChange(msg.subject);
                $("#player" + msg.index + " .item1").css({ 'background-image': 'url("./img/leader.png")', "background-size": "32px 32px" });
                $('#player' + msg.index + " .item1").attr('title', "由你所屬氏族中等級數字最大的玩家接任族長。");
            },
            2: function() {
                knifeChange(msg.to);
                lastAttackID = msg.subject;
                if (nickname.value == msg.to) {
                    if (skill1Used + skill2Used + skill3Used >= 2) {
                        GameOver(lastAttackID, msg.to);
                        return;
                    }
                    skillEffects.skill2 = true;
                    $('#expose').fadeIn().show(1000);
                    playSound('playerenter');
                }
            },
            3: function() {
                knifeChange(msg.subject);
                if (msg.subject == nickname.value) {
                    var characterImg = './img/' + msg.chara + '.png';
                    $('#player' + userList.indexOf(msg.to) + "_cardBack").attr('src', characterImg);
                }
            },
            4: function() {
                lastAttackID = msg.subject;
                knifeChange(msg.subject);
                if (msg.skill == "Damage") {
                    if (msg.needHelpID == nickname.value) {
                        if (skill1Used + skill2Used + skill3Used >= 3) {
                            GameOver(lastAttackID, msg.to);
                            return;
                        }
                        skillEffects.skill4 = 1;
                        $('#expose').fadeIn().show(1000);
                        playSound('playerenter');
                    }
                } else if (msg.skill == "Heal") {
                    if (msg.needHelpID == nickname.value) {
                        if (skill1Used == 0 && skill2Used == 0 && skill3Used == 0) {
                            var healMsg = {
                                type: "Heal",
                                skill4ID: lastAttackID,
                            };
                            ws.send(JSON.stringify(healMsg));
                            return;
                        }
                        if (skill1Used == 1) {
                            $('#skill1-heal').css('background-image', 'url("./img/skill-' + exposeStr[0] + '.png")');
                            $('#skill1-heal').attr('disabled', false);
                        }
                        if (skill2Used == 1) {
                            $('#skill2-heal').css('background-image', 'url("./img/expose-' + exposeStr[1] + '.png")');
                            $('#skill2-heal').attr('disabled', false);
                        }
                        if (skill3Used == 1) {
                            $('#skill3-heal').css('background-image', 'url("./img/expose-' + exposeStr[2] + '.png")');
                            $('#skill3-heal').attr('disabled', false);
                        }
                        $('#skill4-heal').fadeIn().show();
                        playSound('playerenter');
                    }
                }
            },
            5: function() {
                knifeChange(msg.to);
                lastAttackID = msg.subject;
                if (msg.to == nickname.value) {
                    if (skill1Used + skill2Used + skill3Used >= 3) {
                        GameOver(lastAttackID, msg.to);
                        return;
                    }
                    skillEffects.skill5 = 1;
                    playSound('playerenter');
                    if (skill1Used == 0) {
                        skill1();
                    } else {
                        $('#expose').fadeIn().show(1000);
                    }
                }
            },
            6: function() {
                knifeChange(msg.subject);
                protectList.push(msg.to);
                if (nickname.value == msg.subject) {
                    myProtectList.push(msg.to);
                }
                if (msg.purpleBeenUsed == false) {
                    colorSkill = "purple";
                } else if (msg.purpleBeenUsed == true) {
                    colorSkill = "blue";
                }
                $("#player" + msg.index + " .item3").css({ 'background-image': 'url("./img/' + colorSkill + '-sword.png")', "background-size": "32px 32px" });
                $('#player' + msg.index + " .item3").attr('title', "你保護任何有同色「盾牌」的玩家直到你受到第三點傷害。");
                $("#player" + userList.indexOf(msg.to) + " .item2").css({ 'background-image': 'url("./img/' + colorSkill + '-guard.png")', "background-size": "32px 32px" });
                $('#player' + userList.indexOf(msg.to) + " .item2").attr('title', "玩家不能攻擊你或強制你受傷，直到妳的玩家受到地三點傷害，但你可以進行干涉。");
            },
            7: function() {
                lastAttackID = msg.subject;
                knifeChange(msg.subject);
                if (msg.to == nickname.value) {
                    if (skill1Used + skill2Used + skill3Used >= 3) {
                        GameOver(lastAttackID, msg.to);
                        return;
                    }
                    skillEffects.skill7 = 1;
                    $('#expose').fadeIn().show(1000);
                    playSound('playerenter');
                }
            },
            8: function() {
                knifeChange(msg.subject);
                $("#player" + userList.indexOf(msg.subject) + " .item4").css({ 'background-image': 'url("./img/magic.png")', "background-size": "32px 32px" });
                $('#player' + userList.indexOf(msg.subject) + " .item4").attr('title', "當你拿取陣營指示物時，你必須拿取未知陣營指示物。");
                $("#player" + userList.indexOf(msg.to) + " .item4").css({ 'background-image': 'url("./img/magic.png")', "background-size": "32px 32px" });
                $('#player' + userList.indexOf(msg.to) + " .item4").attr('title', "當你拿取陣營指示物時，你必須拿取未知陣營指示物。");
                if (msg.to == nickname.value || msg.subject == nickname.value) {
                    skillEffects.skill8 = 1;
                }
            },
            9: function() {
                knifeChange(msg.subject);
                $("#player" + userList.indexOf(msg.to) + " .item5").css({ 'background-image': 'url("./img/fan.png")', "background-size": "32px 32px" });
                $('#player' + userList.indexOf(msg.to) + " .item5").attr('title', "當玩家攻擊你時其它玩家不能進行干涉。");
                if (msg.to == nickname.value) {
                    skillEffects.skill9 = 1;
                }
            },
            10: function() {
                knifeChange(msg.subject);
                msg.curseList.forEach(function(element) {
                    $("#player" + userList.indexOf(element) + " .item6").css({ 'background-image': 'url("./img/curse.png")', "background-size": "32px 32px" });
                    $('#player' + userList.indexOf(element) + " .item6").attr('title', "當獲勝的氏族族長拿到真詛咒時，調查官獲勝。");
                });
            }
        };
        if (skillSubHandlers[msg.exposeType]) {
            skillSubHandlers[msg.exposeType]();
        }
    },
    Heal: function(msg) {
        if (msg.selectionIndex != null) {
            $("#player" + msg.index + " .selection" + msg.selectionIndex).css({ 'background-image': 'none' });
        }
        if (nickname.value == msg.skill4ID) {
            $("#attackOrPass").fadeIn().show();
        }
    },
    banSkill: function(msg) {
        $("#player" + msg.index + " .selection1").css({ 'background-image': 'url("./img/skill-' + msg.exposeType + '.png")', "background-size": "32px 32px" });
        if (!msg.skillEffects.skill4 && !msg.skillEffects.skill7) {
            knifeChange(msg.id);
        } else {
            if (nickname.value == lastAttackID) {
                $("#attackOrPass").fadeIn().show(1000);
            }
        }
    },
    unProtect: function(msg) {
        $("#player" + msg.index + " .item3").css({ 'background-image': 'none' });
        $('#player' + msg.index + " .item3").attr('title', "");
        msg.myProtectList.forEach(function(element) {
            $("#player" + userList.indexOf(element) + " .item2").css({ 'background-image': 'none' });
            $('#player' + userList.indexOf(element) + " .item2").attr('title', "");
        });
        protectList = $(protectList).not(msg.myProtectList).toArray();
    },
    GameOver: function(msg) {
        playSound('damage');
        for (var index = 0; index < msg.shuffle.length; index++) {
            $('#player' + index + "_cardBack").attr('src', './img/' + msg.shuffle[index] + '.png');
        }
        updateOnlineList(userList);
    }
};

ws.onmessage = function(evt) {
    var msg = JSON.parse(evt.data);
    console.log(msg);
    var time = new Date(msg.date);
    var timeStr = time.toLocaleTimeString();
    var chatbox = $('#chatbox').contents();

    if (msg.text != null) {
        var text = "(" + timeStr + ") <b>" + msg.id + "</b>: " + msg.text + "<br>";
        chatbox.find("body").append(text);
        chatbox.scrollTop(chatbox.height());
    }

    if (messageHandlers[msg.type]) {
        messageHandlers[msg.type](msg);
    }
};
