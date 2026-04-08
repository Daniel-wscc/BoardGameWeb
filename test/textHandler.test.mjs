import { expect } from 'chai';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const handleGameOverMessage = require('../MessageType/GameOverHandler.js');

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
    const result = handleGameOverMessage(null, null, gameData, msg);
    expect(result.type).to.equal("GameOver");
    expect(result.text).to.equal("藍隊獲勝");
    expect(result.shuffle).to.deep.equal(gameData.shuffle);
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
    const result = handleGameOverMessage(null, null, gameData, msg);
    console.log(result);
    expect(result.type).to.equal("GameOver");
    expect(result.text).to.equal("紅隊獲勝");
    expect(result.shuffle).to.deep.equal(gameData.shuffle);
  });
});
