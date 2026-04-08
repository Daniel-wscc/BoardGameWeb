#!/usr/bin/env node
const http = require('http');
const WebSocket = require('ws');

// ==================== ANSI 顏色 ====================
const C = {
    reset: '\x1b[0m',
    bold: '\x1b[1m',
    dim: '\x1b[2m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    magenta: '\x1b[35m',
    cyan: '\x1b[36m',
    white: '\x1b[37m',
};

const ROLES = ["調查官", "長老", "刺客", "弄臣", "煉金術師", "靈喻者", "衛士", "狂戰士", "法師", "舞妓"];
const NAMES = ['小明', '小華', '小美', '小龍', '小芳', '小強'];
const SKILL_LIST = ["NFF", "1TT", "2NN", "3NN", "4NN", "5TT", "6TT", "7TN", "8TN", "9TN"];
const SKILL_NAMES = {
    '1': '族長轉移', '2': '刺殺', '3': '窺探', '4': '煉金',
    '5': '靈視', '6': '守護', '7': '狂暴', '8': '法杖', '9': '舞扇', 'N': '詛咒',
};
const PORT = 3001;

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

function log(prefix, color, message) {
    console.log(`  ${color}[${prefix}]${C.reset} ${message}`);
}

function teamColor(team) { return team === 'B' ? C.blue : C.red; }
function teamName(team) { return team === 'B' ? '藍' : '紅'; }
function playerTag(p) {
    return `${teamColor(p.team)}${C.bold}${p.name}${C.reset}${C.dim}(${teamName(p.team)})${C.reset}`;
}

function hpBar(p) {
    var bar = '';
    for (var h = 0; h < 3; h++) {
        bar += (h < p.exposedCount) ? `${C.red}X${C.reset}` : `${C.green}O${C.reset}`;
    }
    return '[' + bar + ']';
}

function pickRandom(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

// ==================== 測試伺服器 ====================
function createTestServer() {
    var gameData = {
        userList: [], blueTeam: [], redTeam: [], neutral: [],
        gameState: 0, shuffle: [], haveKnife: "", purpleBeenUsed: false,
    };
    var messageHandlers = require('../messageHandler');
    var server = http.createServer();
    var wss = new WebSocket.Server({ server: server });

    wss.on('connection', function (ws) {
        wss.clients.forEach(function (client) {
            client.send(JSON.stringify({
                type: "firstUserList", user: gameData.userList, gameState: gameData.gameState
            }));
        });
        ws.on('message', function (data) {
            var msg = JSON.parse(data.toString());
            if (Object.prototype.hasOwnProperty.call(messageHandlers, msg.type)) {
                messageHandlers[msg.type](wss, ws, gameData, msg);
            }
        });
        ws.on('close', function () {
            var idx = gameData.userList.indexOf(ws.id);
            if (idx !== -1) gameData.userList.splice(idx, 1);
        });
    });

    return new Promise(function (resolve) {
        server.listen(PORT, function () { resolve({ server, wss, gameData }); });
    });
}

// ==================== 玩家類別 ====================
class Player {
    constructor(name) {
        this.name = name;
        this.ws = null;
        this.character = null;
        this.team = null;
        this.roleName = null;
        this.roleNum = -1;
        this.exposedCount = 0;
        this.index = -1;
        this.exposeStr = '';
        this.skillActivated = false;
        this.isProtected = false;
        this.protectedBy = null;
        this.protectTargets = [];
        this.hasFan = false;
        this.hasMagicStaff = false;
        this.received = [];
    }
    connect() {
        var self = this;
        return new Promise(function (resolve, reject) {
            self.ws = new WebSocket('ws://localhost:' + PORT);
            self.ws.on('open', resolve);
            self.ws.on('error', reject);
            self.ws.on('message', function (data) {
                self.received.push(JSON.parse(data.toString()));
            });
        });
    }
    send(data) { this.ws.send(JSON.stringify(data)); }
    getLastMessage(type) {
        for (var i = this.received.length - 1; i >= 0; i--) {
            if (this.received[i].type === type) return this.received[i];
        }
        return null;
    }
    close() { if (this.ws) this.ws.close(); }
}

// ==================== 技能系統 ====================
var simLog = []; // 收集子步驟，最後一次輸出

function logStep(prefix, color, message) {
    simLog.push(`    ${color}> ${C.reset}${message}`);
}

function flushSteps() {
    simLog.forEach(function (line) { console.log(line); });
    simLog = [];
}

// 描述揭露的指示物內容
function describeIndicator(exposeChar, indicatorNum) {
    // 第 1 個指示物 = 技能指示物
    if (indicatorNum === 1) {
        var name = SKILL_NAMES[exposeChar] || exposeChar;
        return `${C.magenta}${C.bold}技能:${name}${C.reset}`;
    }
    // 第 2、3 個指示物 = 陣營指示物
    switch (exposeChar) {
        case 'B': return `${C.blue}${C.bold}藍色陣營${C.reset}`;
        case 'R': return `${C.red}${C.bold}紅色陣營${C.reset}`;
        case 'N': return `${C.white}${C.bold}未知陣營${C.reset}`;
        case 'F': return `${C.yellow}${C.bold}自選陣營${C.reset}`;
        default:  return `${C.dim}${exposeChar}${C.reset}`;
    }
}

// 對某玩家施加傷害
// isSkillDamage: 被技能觸發的傷害不可再發動技能，只揭露指示物
// 回傳: 'alive' | 'dead'
function dealDamage(target, attacker, allPlayers, gameData, isSkillDamage) {
    if (target.exposedCount >= 3) return 'dead';

    target.exposedCount++;
    var indicatorNum = target.exposedCount;
    var exposeChar = target.exposeStr[indicatorNum - 1];
    var indicatorDesc = describeIndicator(exposeChar, indicatorNum);

    logStep('傷害', C.red,
        `${playerTag(target)} 受到傷害 ${hpBar(target)} (${target.exposedCount}/3) - 揭露【${indicatorDesc}】`);

    // 發送揭露訊息到伺服器
    target.send({
        type: 'banSkill', team: target.character[0], index: target.index,
        id: target.name, exposeType: target.character[1],
        skillEffects: { skill4: false, skill7: false }
    });

    // 只有一般攻擊造成的第一次傷害才觸發技能，技能傷害不觸發
    if (!isSkillDamage && indicatorNum === 1 && !target.skillActivated) {
        target.skillActivated = true;
        var skillType = target.exposeStr[0];
        activateSkill(skillType, target, attacker, allPlayers, gameData);
    } else if (isSkillDamage && indicatorNum === 1 && !target.skillActivated) {
        logStep('效果', C.dim,
            `${playerTag(target)} 因技能傷害揭露指示物，不發動技能`);
    }

    return target.exposedCount >= 3 ? 'dead' : 'alive';
}

function activateSkill(skillType, player, attacker, allPlayers, gameData) {
    var skillName = SKILL_NAMES[skillType] || skillType;

    switch (skillType) {
        case '1': { // 長老 - 族長轉移
            logStep('技能', C.magenta,
                `${playerTag(player)} 發動【${skillName}】- 族長轉移至同隊最大數字玩家`);
            player.send({
                type: 'skill', team: player.character[0], index: player.index,
                id: player.name, exposeType: 1
            });
            break;
        }
        case '2': { // 刺客 - 強制2點傷害
            var targets = allPlayers.filter(function (p) {
                return p !== player && !p.isProtected && p.exposedCount < 3;
            });
            if (targets.length === 0) break;
            var victim = pickRandom(targets);
            logStep('技能', C.magenta,
                `${playerTag(player)} 發動【${skillName}】→ 強制 ${playerTag(victim)} 受到2點傷害!`);
            player.send({
                type: 'skill', index: player.index, id: player.name,
                to: victim.name, exposeType: 2, date: Date.now()
            });
            dealDamage(victim, player, allPlayers, gameData, true);
            if (victim.exposedCount < 3) {
                dealDamage(victim, player, allPlayers, gameData, true);
            }
            break;
        }
        case '3': { // 弄臣 - 查看2名玩家角色
            var candidates = allPlayers.filter(function (p) { return p !== player; });
            var look1 = pickRandom(candidates);
            var remaining = candidates.filter(function (p) { return p !== look1; });
            var look2 = remaining.length > 0 ? pickRandom(remaining) : null;
            logStep('技能', C.magenta,
                `${playerTag(player)} 發動【${skillName}】→ 查看 ${playerTag(look1)} 的角色: ${C.bold}${look1.roleName}${C.reset}`);
            player.send({
                type: 'skill', index: player.index, id: player.name,
                to: look1.name, exposeType: 3, date: Date.now()
            });
            if (look2) {
                logStep('技能', C.magenta,
                    `${playerTag(player)} 發動【${skillName}】→ 查看 ${playerTag(look2)} 的角色: ${C.bold}${look2.roleName}${C.reset}`);
                player.send({
                    type: 'skill', index: player.index, id: player.name,
                    to: look2.name, exposeType: 3, date: Date.now()
                });
            }
            break;
        }
        case '4': { // 煉金術師 - 傷害或治療
            var willHeal = player.exposedCount >= 2 && Math.random() < 0.7;
            if (willHeal && player.exposedCount > 1) {
                // 治療：恢復一個指示物
                player.exposedCount--;
                logStep('技能', C.green,
                    `${playerTag(player)} 發動【${skillName}:治療】→ 恢復1個指示物 ${hpBar(player)} (${player.exposedCount}/3)`);
                player.send({
                    type: 'skill', index: player.index, id: player.name,
                    to: attacker ? attacker.name : player.name,
                    skill: 'Heal', exposeType: 4, date: Date.now()
                });
            } else {
                // 傷害：對攻擊者造成傷害
                var dmgTarget = attacker || player;
                if (dmgTarget.exposedCount < 3 && !dmgTarget.isProtected) {
                    logStep('技能', C.magenta,
                        `${playerTag(player)} 發動【${skillName}:傷害】→ ${playerTag(dmgTarget)} 受到1點傷害!`);
                    player.send({
                        type: 'skill', index: player.index, id: player.name,
                        to: dmgTarget.name, skill: 'Damage', exposeType: 4, date: Date.now()
                    });
                    dealDamage(dmgTarget, player, allPlayers, gameData, true);
                } else {
                    logStep('技能', C.dim,
                        `${playerTag(player)} 發動【${skillName}】但目標已受保護或已倒下`);
                }
            }
            break;
        }
        case '5': { // 靈喻者 - 強制1點傷害(優先等級)
            var targets = allPlayers.filter(function (p) {
                return p !== player && !p.isProtected && p.exposedCount < 3;
            });
            if (targets.length === 0) break;
            var victim = pickRandom(targets);
            logStep('技能', C.magenta,
                `${playerTag(player)} 發動【${skillName}】→ 強制 ${playerTag(victim)} 受到1點傷害!`);
            player.send({
                type: 'skill', index: player.index, id: player.name,
                to: victim.name, exposeType: 5, date: Date.now()
            });
            dealDamage(victim, player, allPlayers, gameData, true);
            break;
        }
        case '6': { // 衛士 - 給予盾牌保護
            var teammates = allPlayers.filter(function (p) {
                return p !== player && p.team === player.team && !p.isProtected;
            });
            if (teammates.length === 0) {
                // 保護對方隊伍隨機一人（如果沒有隊友可保護）
                teammates = allPlayers.filter(function (p) {
                    return p !== player && !p.isProtected;
                });
            }
            if (teammates.length === 0) break;
            var protectTarget = pickRandom(teammates);
            protectTarget.isProtected = true;
            protectTarget.protectedBy = player;
            player.protectTargets.push(protectTarget);
            logStep('技能', C.cyan,
                `${playerTag(player)} 發動【${skillName}】→ 給予 ${playerTag(protectTarget)} 盾牌保護`);
            player.send({
                type: 'skill', index: player.index, id: player.name,
                to: protectTarget.name, exposeType: 6, date: Date.now()
            });
            break;
        }
        case '7': { // 狂戰士 - 反擊攻擊者1點傷害
            if (attacker && attacker.exposedCount < 3 && !attacker.isProtected) {
                logStep('技能', C.magenta,
                    `${playerTag(player)} 發動【${skillName}】→ 反擊 ${playerTag(attacker)} 1點傷害!`);
                player.send({
                    type: 'skill', index: player.index, id: player.name,
                    to: attacker.name, exposeType: 7, date: Date.now()
                });
                dealDamage(attacker, player, allPlayers, gameData, true);
            } else {
                logStep('技能', C.dim,
                    `${playerTag(player)} 發動【${skillName}】但無法反擊`);
            }
            break;
        }
        case '8': { // 法師 - 給予法杖
            var others = allPlayers.filter(function (p) { return p !== player; });
            if (others.length === 0) break;
            var staffTarget = pickRandom(others);
            staffTarget.hasMagicStaff = true;
            player.hasMagicStaff = true;
            logStep('技能', C.cyan,
                `${playerTag(player)} 發動【${skillName}】→ 將法杖給予 ${playerTag(staffTarget)}，雙方揭露指示物時必須拿取未知陣營`);
            player.send({
                type: 'skill', index: player.index, id: player.name,
                to: staffTarget.name, exposeType: 8, date: Date.now()
            });
            break;
        }
        case '9': { // 舞妓 - 給予折扇
            var others = allPlayers.filter(function (p) { return p !== player; });
            if (others.length === 0) break;
            // 優先給對手
            var opponents = others.filter(function (p) { return p.team !== player.team; });
            var fanTarget = opponents.length > 0 ? pickRandom(opponents) : pickRandom(others);
            fanTarget.hasFan = true;
            logStep('技能', C.cyan,
                `${playerTag(player)} 發動【${skillName}】→ 將折扇給予 ${playerTag(fanTarget)}，被攻擊時無法請求干涉`);
            player.send({
                type: 'skill', index: player.index, id: player.name,
                to: fanTarget.name, exposeType: 9, date: Date.now()
            });
            break;
        }
        case 'N': { // 調查官 - 給予詛咒
            var others = allPlayers.filter(function (p) { return p !== player; });
            var curseCount = allPlayers.length >= 9 ? 3 : 2;
            var cursed = [];
            for (var c = 0; c < curseCount && others.length > 0; c++) {
                var idx = Math.floor(Math.random() * others.length);
                cursed.push(others[idx]);
                others.splice(idx, 1);
            }
            var cursedNames = cursed.map(function (p) { return playerTag(p); }).join(', ');
            logStep('技能', C.magenta,
                `${playerTag(player)} 發動【${skillName}】→ 詛咒 ${cursedNames}`);
            break;
        }
        default:
            break;
    }
}

// 衛士受到第3點傷害時，解除保護
function checkUnprotect(player) {
    if (player.protectTargets.length > 0 && player.exposedCount >= 3) {
        player.protectTargets.forEach(function (t) {
            t.isProtected = false;
            t.protectedBy = null;
            logStep('效果', C.dim,
                `${playerTag(player)} 倒下，${playerTag(t)} 的盾牌保護解除`);
        });
        player.protectTargets = [];
    }
}

// ==================== 模擬主程式 ====================
async function runSimulation() {
    console.log('');
    console.log(`${C.bold}${C.cyan}====================================${C.reset}`);
    console.log(`${C.bold}${C.cyan}       桌遊模擬測試器${C.reset}`);
    console.log(`${C.bold}${C.cyan}====================================${C.reset}`);
    console.log('');

    var env = await createTestServer();
    var server = env.server;
    var gameData = env.gameData;
    log('伺服器', C.green, '測試伺服器啟動於 port ' + PORT);
    console.log('');

    // ===== 登入 =====
    console.log(`${C.bold}--- 登入階段 ---${C.reset}`);
    var players = [];
    for (var i = 0; i < NAMES.length; i++) {
        var player = new Player(NAMES[i]);
        await player.connect();
        await sleep(50);
        player.send({ type: 'login', text: NAMES[i], id: NAMES[i], date: Date.now() });
        await sleep(50);
        log('+', C.green, `${C.bold}${NAMES[i]}${C.reset} 加入房間`);
        players.push(player);
    }
    log('房間', C.cyan, '人數: ' + players.length + '/10');
    console.log('');

    // ===== 開始遊戲 =====
    players[0].send({ type: 'startGame' });
    await sleep(300);

    var blueTeamPlayers = [];
    var redTeamPlayers = [];

    for (var i = 0; i < players.length; i++) {
        var p = players[i];
        var dist = p.getLastMessage('distribute');
        if (dist) {
            p.character = dist.team;
            p.team = dist.team[0];
            p.roleNum = parseInt(dist.team[1]);
            p.roleName = ROLES[p.roleNum];
            p.index = gameData.userList.indexOf(p.name);
            // 計算 exposeStr
            var raw = SKILL_LIST[p.roleNum];
            p.exposeStr = raw.replace(/T/g, p.team);
            if (p.team === 'B') blueTeamPlayers.push(p);
            else redTeamPlayers.push(p);
        }
    }

    // 顯示隊伍
    console.log(`${C.bold}--- 角色分配 ---${C.reset}`);
    console.log(`  ${C.blue}${C.bold}藍隊:${C.reset}`);
    blueTeamPlayers.forEach(function (p) {
        var leaderMark = (gameData.blueTeam[0] === p.character) ? ` ${C.yellow}[族長]${C.reset}` : '';
        var skillType = p.exposeStr[0];
        var skillDesc = SKILL_NAMES[skillType] || '?';
        console.log(`    ${C.blue}${p.name} - ${p.roleName} (${p.character})${C.reset}${leaderMark} ${C.dim}技能:${skillDesc}${C.reset}`);
    });
    console.log(`  ${C.red}${C.bold}紅隊:${C.reset}`);
    redTeamPlayers.forEach(function (p) {
        var leaderMark = (gameData.redTeam[0] === p.character) ? ` ${C.yellow}[族長]${C.reset}` : '';
        var skillType = p.exposeStr[0];
        var skillDesc = SKILL_NAMES[skillType] || '?';
        console.log(`    ${C.red}${p.name} - ${p.roleName} (${p.character})${C.reset}${leaderMark} ${C.dim}技能:${skillDesc}${C.reset}`);
    });
    console.log('');

    var knifeHolder = players.find(function (p) { return p.name === gameData.haveKnife; });
    log('刀', C.yellow, playerTag(knifeHolder) + ' 獲得匕首');
    console.log('');

    // ===== 遊戲迴圈 =====
    var round = 1;
    var gameOver = false;
    var MAX_ROUNDS = 50;

    while (!gameOver && round <= MAX_ROUNDS) {
        await sleep(500);
        console.log(`${C.bold}${C.cyan}=== 第 ${round} 回合 ===${C.reset}`);
        simLog = [];

        // 決定行動：70% 攻擊, 30% 傳刀
        var willAttack = Math.random() < 0.70;

        if (willAttack) {
            // 選擇目標：優先對方隊伍中最受傷的、排除受保護的
            var opponents = players.filter(function (p) {
                return p.team !== knifeHolder.team && !p.isProtected && p.exposedCount < 3;
            });
            // 如果所有對手都被保護了，選沒保護的任何人
            if (opponents.length === 0) {
                opponents = players.filter(function (p) {
                    return p !== knifeHolder && !p.isProtected && p.exposedCount < 3;
                });
            }
            // 如果還是沒有，攻擊已經 3/3 的對手（致命一擊）
            if (opponents.length === 0) {
                opponents = players.filter(function (p) {
                    return p.team !== knifeHolder.team && p.exposedCount >= 3;
                });
            }
            if (opponents.length === 0) {
                // 無法攻擊，傳刀
                willAttack = false;
            } else {
                // 排序：最多傷害的優先
                opponents.sort(function (a, b) { return b.exposedCount - a.exposedCount; });
                var target = opponents[0];

                log('攻擊', C.yellow, playerTag(knifeHolder) + ' 攻擊 ' + playerTag(target));

                knifeHolder.send({
                    type: 'attack', index: knifeHolder.index,
                    attackCharacter: knifeHolder.character,
                    id: knifeHolder.name, to: target.name, date: Date.now()
                });
                await sleep(100);

                // ===== 致命一擊 =====
                if (target.exposedCount >= 3) {
                    knifeHolder.send({
                        type: 'GameOver', attackID: knifeHolder.name,
                        beenKilledID: target.name, date: Date.now()
                    });
                    await sleep(200);

                    var goMsg = players[0].getLastMessage('GameOver');
                    flushSteps();
                    console.log('');
                    console.log(`${C.bold}${C.red}====================================${C.reset}`);
                    console.log(`${C.bold}${C.red}            遊戲結束${C.reset}`);
                    console.log(`${C.bold}${C.red}====================================${C.reset}`);
                    log('死亡', C.red, `${playerTag(target)} (${target.roleName}/${target.character}) 陣亡`);
                    if (goMsg) {
                        var isBlueWin = goMsg.text.indexOf('藍') !== -1;
                        var winColor = isBlueWin ? C.blue : C.red;
                        log('結果', C.bold, `${winColor}${C.bold}${goMsg.text}!${C.reset}`);
                    }
                    gameOver = true;
                    break;
                }

                // ===== 干涉系統 =====
                var wasIntercepted = false;
                // 有折扇的玩家不能請求干涉
                var canAskHelp = !target.hasFan && Math.random() < 0.35;

                if (canAskHelp) {
                    // 尋找可能的干涉者（非攻擊者、非目標、同隊優先）
                    var helpers = players.filter(function (p) {
                        return p !== knifeHolder && p !== target &&
                            p.exposedCount < 3 && !p.isProtected;
                    });
                    var teamHelpers = helpers.filter(function (p) { return p.team === target.team; });
                    var helperPool = teamHelpers.length > 0 ? teamHelpers : helpers;

                    if (helperPool.length > 0 && Math.random() < 0.5) {
                        var helper = pickRandom(helperPool);
                        wasIntercepted = true;

                        log('求助', C.cyan, playerTag(target) + ' 請求干涉!');

                        target.send({
                            type: 'help', index: target.index,
                            id: target.name, date: Date.now()
                        });
                        await sleep(100);

                        log('干涉', C.green, playerTag(helper) + ' 挺身干涉，替 ' + playerTag(target) + ' 承受傷害!');

                        helper.send({
                            type: 'inter', index: helper.index,
                            id: helper.name, date: Date.now()
                        });
                        await sleep(50);

                        // 干涉者承受 1 點傷害（trueDamage）
                        target.send({
                            type: 'trueDamage', index: target.index,
                            id: target.name, to: helper.name, date: Date.now()
                        });
                        await sleep(100);

                        dealDamage(helper, knifeHolder, players, gameData, 0);
                        checkUnprotect(helper);

                        // 匕首轉移給干涉者
                        knifeHolder = helper;
                    }
                }

                // ===== 正常承受傷害 =====
                if (!wasIntercepted) {
                    var result = dealDamage(target, knifeHolder, players, gameData, 0);
                    checkUnprotect(target);

                    // 匕首轉移給被攻擊者
                    knifeHolder = target;

                    // 如果技能造成連鎖殺死了某人
                    var deadPlayer = players.find(function (p) { return p.exposedCount >= 3; });
                    if (deadPlayer) {
                        // 檢查是否有人可以終結
                        var killerCandidates = players.filter(function (p) {
                            return p !== deadPlayer && p.team !== deadPlayer.team;
                        });
                        // 不在這裡結束遊戲，下一回合攻擊時才判定
                    }
                }

                flushSteps();
                log('刀', C.yellow, '匕首 -> ' + playerTag(knifeHolder));
            }
        }

        if (!willAttack) {
            // 傳刀
            var others = players.filter(function (p) { return p !== knifeHolder; });
            var receiver = pickRandom(others);

            log('傳遞', C.cyan, playerTag(knifeHolder) + ' 將匕首傳給 ' + playerTag(receiver));

            knifeHolder.send({
                type: 'knife', index: knifeHolder.index,
                toKnife: receiver.name,
                text: knifeHolder.name + ' 將匕首傳給 ' + receiver.name,
                id: '系統訊息', date: Date.now()
            });
            await sleep(100);

            knifeHolder = receiver;
            flushSteps();
            log('刀', C.yellow, '匕首 -> ' + playerTag(knifeHolder));
        }

        console.log('');
        round++;
    }

    if (!gameOver) {
        log('系統', C.red, '已達最大回合數 (' + MAX_ROUNDS + ')，模擬結束');
    }

    // ===== 最終狀態 =====
    console.log(`${C.bold}--- 玩家狀態總覽 ---${C.reset}`);
    players.forEach(function (p) {
        var tc = teamColor(p.team);
        var status = '';
        if (p.exposedCount >= 3) status = ` ${C.red}${C.bold}[陣亡]${C.reset}`;
        if (p.isProtected) status += ` ${C.cyan}[盾牌]${C.reset}`;
        if (p.hasFan) status += ` ${C.dim}[折扇]${C.reset}`;
        if (p.hasMagicStaff) status += ` ${C.dim}[法杖]${C.reset}`;
        var skillUsed = p.skillActivated ? `${C.dim}(技能已發動)${C.reset}` : '';
        console.log(`  ${tc}${p.name}${C.reset} ${p.roleName}/${p.character} ${hpBar(p)} ${skillUsed}${status}`);
    });
    console.log('');

    // 清理
    players.forEach(function (p) { p.close(); });
    await sleep(200);
    server.close();
    log('伺服器', C.green, '測試完成，伺服器已關閉');
    console.log('');
}

// ==================== 執行 ====================
var _origLog = console.log;
var _origWarn = console.warn;

function silenceServerLogs() {
    console.log = function () {
        var msg = Array.prototype.join.call(arguments, ' ');
        if (msg.indexOf('\x1b[') !== -1 || msg.trim() === '') {
            _origLog.apply(console, arguments);
        }
    };
    console.warn = function () { };
}

function restoreLogs() {
    console.log = _origLog;
    console.warn = _origWarn;
}

silenceServerLogs();
runSimulation()
    .then(function () { restoreLogs(); })
    .catch(function (err) {
        restoreLogs();
        console.error(C.red + '模擬發生錯誤:' + C.reset, err);
        process.exit(1);
    });
