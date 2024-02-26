// messageHandler.js
const handleBroadcastMessage = require('./MessageType/BroadcastHandler');
const handleLoginMessage = require('./MessageType/LoginHandler');
const handleStartGameMessage = require('./MessageType/startGameHandler');
//const handleSoundMessage = require('./MessageType/soundHandler');
// const handleToKnifeMessage = require('./MessageType/toKnifeHandler');
//const handleAttackThenGiveKnifeMessage = require('./MessageType/attackThenGiveKnifeHandler');
const handleAttackMessage = require('./MessageType/attackHandler');
const handleHelpMessage = require('./MessageType/helpHandler');
const handleInterMessage = require('./MessageType/interHandler');
const handleTrueDamageMessage = require('./MessageType/TrueDamageHandler');
//const handleExposeMessage = require('./MessageType/ExposeHandler');
const handleSkillMessage = require('./MessageType/SkillHandler');
//const handleBanSkillMessage = require('./MessageType/BanSkillHandler');
//const handleUnProtectMessage = require('./MessageType/DELETEUnProtectHandler');
const handleGameOverMessage = require('./MessageType/GameOverHandler');


var messageHandlers = {
    'login': handleLoginMessage,
    'message': handleBroadcastMessage,
    'expose': handleBroadcastMessage,
    'banSkill': handleBroadcastMessage,
    'sound': handleBroadcastMessage,
    'unProtect': handleBroadcastMessage,
    //'attackThenGiveKnife': handleBroadcastMessage,
    'knife': handleBroadcastMessage,
    'startGame': handleStartGameMessage,
    'attack': handleAttackMessage,
    'help': handleHelpMessage,
    'inter': handleInterMessage,
    'trueDamage': handleTrueDamageMessage,
    'skill': handleSkillMessage,
    'GameOver': handleGameOverMessage,
};

module.exports = messageHandlers;
