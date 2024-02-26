function Heal(_selectionIndex) {
    $('#skill4-heal').fadeOut(100).hide();
    switch (_selectionIndex) {
        case 1:
            skill1Used = 0;
            $('#skill1').attr('disabled',false);
            $('#skill1').css('background-image','url("./img/skill-'+exposeStr[0]+'.png")')
            break;
        case 2:
            skill2Used = 0;
            $('#skill2').attr('disabled',false);
            $('#skill2').css('background-image','url("./img/expose-'+exposeStr[1]+'.png")')
            break;
        case 3:
            skill3Used = 0;
            $('#skill3').attr('disabled',false);
            $('#skill3').css('background-image','url("./img/expose-'+exposeStr[2]+'.png")')
            break;
    
        default:
            break;
    }
    var msg = {
        type: "Heal",
        team: myCharacter[0],
        index: myIndex,
        skill4ID: lastAttackID,
        selectionIndex: _selectionIndex
    };
    ws.send(JSON.stringify(msg));
} 