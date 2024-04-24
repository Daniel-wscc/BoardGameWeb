import { expect } from 'chai';
import { handleGameOverMessage } from '../MessageType/GameOverHandler.js';

describe('handleGameOverMessage', function() {
  it('should return the correct serverMsg.text when blue team wins', function() {
    const gameData = {
      shuffle: ['B1', 'B2', 'R1', 'R2'],
      userList: ['B1', 'B2', 'R1', 'R2'],
      redTeam: ['R1', 'R2'],
      blueTeam: ['B1', 'B2']
    };
    const msg = {
      attackID: 'B1',
      beenKilledID: 'R1'
    };
    const serverMsg = {
      type: "GameOver",
      shuffle: gameData.shuffle,
      text: "藍隊獲勝",
      id: '系統訊息',
      date: Date.now()
    };
    const result = handleGameOverMessage(null, null, gameData, msg);
    expect(result).to.deep.equal(serverMsg);
  });

  it('should return the correct serverMsg.text when red team wins', function() {
    const gameData = {
      shuffle: ['B1', 'B2', 'R1', 'R2'],
      userList: ['B1', 'B2', 'R1', 'R2'],
      redTeam: ['R1', 'R2'],
      blueTeam: ['B1', 'B2']
    };
    const msg = {
      attackID: 'R1',
      beenKilledID: 'B1'
    };
    const serverMsg = {
      type: "GameOver",
      shuffle: gameData.shuffle,
      text: "紅隊獲勝",
      id: '系統訊息',
      date: Date.now()
    };
    const result = handleGameOverMessage(null, null, gameData, msg);
    console.log(result);
    expect(result).to.deep.equal(serverMsg);
  });
});
