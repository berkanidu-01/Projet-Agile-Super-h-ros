const CombatEngine = require('./combatengine');
const combat = new CombatEngine();

// Example players
const player1 = {
  id: 'player1',
  stats: {
    strength: 50,
    magic: 70
  }
};

const player2 = {
  id: 'player2',
  stats: {
    strength: 60,
    magic: 40
  }
};

// Example attack and defense choices
const fireball = {
  type: 'fireball',
  stat: 'magic',
  statValue: player1.stats.magic,
  modifier: 1.2
};

const shield = {
  type: 'shield',
  defenseReduction: 30
};

// Process turn
const result = combat.processTurn(
  { id: 'player1', hp: 1000, ...player1 },
  { id: 'player2', hp: 1000, ...player2 },
  fireball,
  shield
);

console.log(result);
/* Output:
{
  damageDealt: 54, // (70 * 1.2) - 30 = 84 - 30 = 54
  attacker: 'player1',
  defenderHp: 946,
  attackUsed: 'fireball',
  defenseUsed: 'shield',
  isDefeated: false
}
*/