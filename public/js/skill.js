function checkUnProtectAfterSkill() {
    if (skillEffects.skill6 == 1) {
        if (skill1Used + skill2Used + skill3Used >= 3) {
            var msg = {
                type: "unProtect",
                team: myCharacter[0],
                index: myIndex,
                myProtectList: myProtectList,
                id: nickname.value,
                exposeType: myCharacter[1]
            };
            ws.send(JSON.stringify(msg));
            skillEffects.skill6 = 0;
            myProtectList = [];
        }
    }
}

function resetDamageEffects() {
    skillEffects.skill4 = 0;
    skillEffects.skill5 = 0;
    skillEffects.skill7 = 0;
}

function skill1() {
    if (skill1Used == 1) return;
    skill1Used = 1;
    $('#skill1').attr('disabled', 'disabled');
    $('#skill1').css('background-image', 'none');
    if (skillEffects.skill2 == 0 && skillEffects.skill4 == 0 && skillEffects.skill5 == 0 && skillEffects.skill7 == 0) {
        switch (exposeStr[0]) {
            case "1":
                var msg = {
                    type: "skill",
                    team: myCharacter[0],
                    index: myIndex,
                    id: nickname.value,
                    exposeType: 1
                };
                ws.send(JSON.stringify(msg));
                $("#expose").fadeOut(100).hide();
                $("#attackOrPass").fadeIn().show(1000);
                break;
            case "2":
                skillFlag.skill2 = 1;
                var unProtect = $(userList).not(protectList).toArray();
                var canAttack = $(unProtect).not([nickname.value]).toArray();
                canAttack.forEach(function(element) {
                    $('#player' + userList.indexOf(element)).css("border-color", "yellow");
                });
                $("#expose").fadeOut(100).hide();
                break;
            case "3":
                skillFlag.skill3 = 1;
                userList.forEach(function(element) {
                    if (element != nickname.value) {
                        $('#player' + userList.indexOf(element)).css("border-color", "yellow");
                    }
                });
                $("#expose").fadeOut(100).hide();
                break;
            case "4":
                $("#expose").fadeOut(100).hide();
                if (beenHelp) {
                    $("#skill-4").fadeIn().show(1000);
                } else {
                    var msg = {
                        type: "banSkill",
                        team: myCharacter[0],
                        index: myIndex,
                        id: nickname.value,
                        exposeType: 4
                    };
                    ws.send(JSON.stringify(msg));
                    $("#attackOrPass").fadeIn().show();
                }
                break;
            case "5":
                skillFlag.skill5 = 1;
                var unProtect = $(userList).not(protectList).toArray();
                var canAttack = $(unProtect).not([nickname.value]).toArray();
                canAttack.forEach(function(element) {
                    $('#player' + userList.indexOf(element)).css("border-color", "yellow");
                });
                $("#expose").fadeOut(100).hide();
                break;
            case "6":
                skillFlag.skill6 = 1;
                skillEffects.skill6 = 1;
                if (skill1Used + skill2Used + skill3Used >= 3) {
                    var msg = {
                        type: "banSkill",
                        team: myCharacter[0],
                        index: myIndex,
                        myProtectList: myProtectList,
                        id: nickname.value,
                        exposeType: 6
                    };
                    ws.send(JSON.stringify(msg));
                    skillEffects.skill6 = 0;
                    myProtectList = [];
                    $("#expose").fadeOut(100).hide();
                    $("#attackOrPass").fadeIn().show();
                } else {
                    var unProtect = $(userList).not(protectList).toArray();
                    var canAttack = $(unProtect).not([nickname.value]).toArray();
                    canAttack.forEach(function(element) {
                        $('#player' + userList.indexOf(element)).css("border-color", "yellow");
                    });
                    $("#expose").fadeOut(100).hide();
                }
                break;
            case "7":
                var msg = {
                    type: "skill",
                    team: myCharacter[0],
                    index: myIndex,
                    to: lastAttackID,
                    id: nickname.value,
                    exposeType: 7
                };
                ws.send(JSON.stringify(msg));
                $("#expose").fadeOut(100).hide();
                break;
            case "8":
                skillFlag.skill8 = 1;
                userList.forEach(function(element) {
                    if (element != nickname.value) {
                        $('#player' + userList.indexOf(element)).css("border-color", "yellow");
                    }
                });
                $("#expose").fadeOut(100).hide();
                break;
            case "9":
                skillFlag.skill9 = 1;
                userList.forEach(function(element) {
                    if (element != nickname.value) {
                        $('#player' + userList.indexOf(element)).css("border-color", "yellow");
                    }
                });
                $("#expose").fadeOut(100).hide();
                break;
            case "N":
                if (userList.length == 7) {
                    skillFlag.skill10_NeedChoose = 2;
                } else if (userList.length == 9) {
                    skillFlag.skill10_NeedChoose = 3;
                }
                skillFlag.skill10 = 1;
                userList.forEach(function(element) {
                    if (element != nickname.value) {
                        $('#player' + userList.indexOf(element)).css("border-color", "yellow");
                    }
                });
                $("#expose").fadeOut(100).hide();
                break;
            default:
                break;
        }
    } else if (skillEffects.skill2 == 1) {
        chooseTwo++;
        var msg = {
            type: "banSkill",
            team: myCharacter[0],
            index: myIndex,
            id: nickname.value,
            exposeType: myCharacter[1]
        };
        ws.send(JSON.stringify(msg));
        if (chooseTwo == 2) {
            skillEffects.skill2 = 0;
            $("#expose").fadeOut(100).hide();
            $("#attackOrPass").fadeIn().show();
        }
    } else if (skillEffects.skill4 == 1 || skillEffects.skill5 == 1 || skillEffects.skill7 == 1) {
        var msg = {
            type: "banSkill",
            team: myCharacter[0],
            index: myIndex,
            id: nickname.value,
            lastAttack: lastAttackID,
            skillEffects: skillEffects,
            exposeType: myCharacter[1]
        };
        ws.send(JSON.stringify(msg));
        $('#expose').fadeOut(100).hide();
    }
    if (skillEffects.skill5 == 1) {
        $("#attackOrPass").fadeIn().show();
    }
    if (skill1Used + skill2Used + skill3Used >= 3) {
        checkUnProtectAfterSkill();
        if (myCharacter[1] == "N") {
            skill10CantAttack.push();
        }
    }
    helpList = [];
    resetDamageEffects();
}

function useExposeSkill(skillIndex) {
    var skillUsedKey = 'skill' + skillIndex + 'Used';
    if (window[skillUsedKey] == 1) return;
    window[skillUsedKey] = 1;
    $('#skill' + skillIndex).attr('disabled', 'disabled');
    $('#skill' + skillIndex).css('background-image', 'none');

    var exposeChar = exposeStr[skillIndex - 1];
    if (skillEffects.skill8 == 1) {
        Expose(skillIndex, "N");
    } else {
        switch (exposeChar) {
            case 'F':
                expose10Index = skillIndex;
                $('#expose10').fadeIn().show();
                break;
            default:
                Expose(skillIndex, exposeChar);
                break;
        }
    }

    if (skillEffects.skill2 == 1) {
        chooseTwo++;
        if (chooseTwo == 2) {
            skillEffects.skill2 = 0;
            $('#expose').fadeOut(100).hide();
            $("#attackOrPass").fadeIn().show();
        }
    } else if (skillEffects.skill4 == 1 || skillEffects.skill7 == 1 || exposeStr[0] == "N") {
        $('#expose').fadeOut(100).hide();
    } else {
        $('#expose').fadeOut(100).hide();
        $("#attackOrPass").fadeIn().show();
    }

    checkUnProtectAfterSkill();
    resetDamageEffects();
}

function skill2() {
    useExposeSkill(2);
}

function skill3() {
    useExposeSkill(3);
}

function skill4(skillType) {
    var msg = {
        type: "skill",
        team: myCharacter[0],
        index: myIndex,
        to: lastAttackID,
        id: nickname.value,
        skill: skillType,
        exposeType: 4
    };
    ws.send(JSON.stringify(msg));
    $("#skill-4").fadeOut(100).hide();
}

function Expose(_selectionIndex, _selectionType) {
    var msg = {
        type: "expose",
        index: myIndex,
        subject: nickname.value,
        selectionIndex: _selectionIndex,
        exposeType: _selectionType,
        skillEffects: skillEffects,
        lastAttack: lastAttackID,
        date: Date.now()
    };
    ws.send(JSON.stringify(msg));
    $('#expose10').fadeOut(100).hide();
    if (exposeStr[0] == "N" && skillEffects.skill2 == 0 && skillEffects.skill4 == 0 && skillEffects.skill5 == 0 && skillEffects.skill7 == 0) {
        $("#attackOrPass").fadeIn().show();
    }
}
