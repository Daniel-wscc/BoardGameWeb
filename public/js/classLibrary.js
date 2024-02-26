var skillEffects = {
    skill1: false,
    skill2: false,
    skill3: false,
    skill4: false,
    skill5: false,
    skill6: false,
    skill7: false,
    skill8: false,
    skill9: false,
    skill10: false,
}

var userList = [];
var nickname = "";
var myIndex = -1;
var gameState;

// var haveKnife = "";
var skill1Used = 0;
var skill2Used = 0;
var skill3Used = 0;
var skillList = ["NFF","1TT","2NN","3NN","4NN","5TT","6TT","7TN","8TN","9TN"];
var exposeStr = "";
var helpList = [];
var protectList = [];
var myProtectList = [];
var skill10CantAttack = [];
var needHelp = "";
var beenHelp = false;
var myCharacter = "";
var attackFlag = 0;
var passFlag = 0;
var helpFlag = 0;
var bearFlag = 0;
var chooseTwo = 0;
var chooseOne = "";
var lastAttackID = "";
var colorSkill = "";
var skill2Flag = 0;
var skill3Flag = 0;
var skill4Flag = 0;
var skill5Flag = 0;
var skill6Flag = 0;
var skill8Flag = 0;
var skill9Flag = 0;
var skill10Flag = 0;
var skill10_NeedChoose = 0;
var skill10_BeenChoose = 0;
var skill10_BeenClicked = [];
var expose10Index = 0;

function initial() {
    $('.choose').hide(1000);
    $('#skill1').attr('disabled',false);
    $('#skill2').attr('disabled',false);
    $('#skill3').attr('disabled',false);
    gameState = 0;
    for (let index = 0; index < 10; index++) {
        $('#player'+index+"_cardBack").attr('src',"./img/card-back.png") ;
        $('#player'+index+'_knife').attr('src',"./img/knife-back.png") ;
        for (let selectionIndex = 1; selectionIndex <= 3; selectionIndex++) {
            $("#player"+index+" .selection"+selectionIndex).css({'background-image':'none'})
        }
        for (let itemIndex = 1; itemIndex <= 6; itemIndex++) {
            $("#player"+index+" .item"+itemIndex).css({'background-image':'none'})
            $('#player'+index+" .item"+itemIndex).attr('title',"");
        }
    }
    
    // haveKnife = "";
    needHelp = "";
    beenHelp = false;
    skill1Used = 0;
    skill2Used = 0;
    skill3Used = 0;
    exposeStr = "";
    helpList = [];
    protectList = [];
    myProtectList = [];
    skill10CantAttack = [];
    myCharacter = "";
    attackFlag = 0;
    passFlag = 0;
    helpFlag = 0;
    bearFlag = 0;
    chooseTwo = 0;
    chooseOne = "";
    lastAttackID = "";
    colorSkill = "";
    skill2Flag = 0;
    skill3Flag = 0;
    skill4Flag = 0;
    skill5Flag = 0;
    skill6Flag = 0;
    skill8Flag = 0;
    skill9Flag = 0;
    expose10Index = 0;
    skillEffects = {
        skill1: false,
        skill2: false,
        skill3: false,
        skill4: false,
        skill5: false,
        skill6: false,
        skill7: false,
        skill8: false,
        skill9: false,
        skill10: false,
    }
    skill10Flag = 0;
    skill10_NeedChoose = 0;
    skill10_BeenChoose = 0;
    skill10_BeenClicked = [];
}