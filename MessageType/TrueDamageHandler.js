const { broadcast } = require('../utils/broadcast');

function handleTrueDamageMessage(wss, ws, gameData, msg) {
    console.log(msg);
    var serverMsg = {
        type: "trueDamage",
        subject: msg.id,
        to: msg.to
    };
    broadcast(wss, serverMsg);
}

module.exports = handleTrueDamageMessage;
