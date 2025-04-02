// combatengine.js
const Superhero = require('./models/super_heros');
const Attack = require('./models/attacks');
const Defense = require('./models/defenses');

class CombatEngine {
  constructor() {
    this.attackHistory = new Map(); // Tracks consecutive attacks: { playerId: [lastTwoAttacks] }
  }

  // Damage formula: (stat × attackModifier) - (defenseStat × defenseModifier)
  calculateDamage(attackerStat, attackModifier, defenderStat, defenseModifier) {
    const damage = (attackerStat * attackModifier) - (defenderStat * defenseModifier);
    return Math.max(0, Math.floor(damage)); // No negative damage, integer values
  }

  // Random champion selection
  pickRandomChampion(maxChampionId, callback) {
    const randomId = Math.floor(Math.random() * maxChampionId) + 1;
    Superhero.getByIdWithPowerstats(randomId, (err, champion) => {
      if (err || !champion) {
        callback(err || new Error('Champion not found'), null);
      
    }});
  }

  // Random attacks (4/13)
  pickRandomAttacks(callback) {
    Attack.getAll((err, attacks) => {
      if (err || attacks.length < 4) {
        callback(err || new Error('Not enough attacks'), null);
      } else {
        const shuffled = [...attacks].sort(() => 0.5 - Math.random());
        callback(null, shuffled.slice(0, 4));
      }
    });
  }

  // Random defenses (4 from pool)
  pickRandomDefenses(callback) {
    Defense.getAll((err, defenses) => {
      if (err || defenses.length < 4) {
        callback(err || new Error('Not enough defenses'), null);
      } else {
        const shuffled = [...defenses].sort(() => 0.5 - Math.random());
        callback(null, shuffled.slice(0, 4));
      }
    });
  }

  // Validate attack sequence (max 2 consecutive)
  validateAttack(playerId, attackName) {
    const history = this.attackHistory.get(playerId) || [];
    return !(history.length >= 2 && history.every(a => a === attackName));
  }

  // Process a combat turn
  processTurn(attacker, defender, attackIndex, defenseIndex) {
    const attack = attacker.attacks[attackIndex];
    const defense = defender.defenses[defenseIndex];

    // 1. Validate attack
    if (!this.validateAttack(attacker.id, attack.name)) {
      throw new Error(`Cannot use ${attack.name} three times consecutively`);
    }

    // 2. Calculate stats
    const attackerStat = attacker.superhero.powerstats[attack.baseStat];
    const defenderStat = defender.superhero.powerstats[defense.baseStat];

    // 3. Calculate damage
    const damage = this.calculateDamage(
      attackerStat,
      attack.multiplicateur,
      defenderStat,
      defense.multiplicateur
    );

    // 4. Apply damage
    defender.hp = Math.max(0, defender.hp - damage);

    // 5. Update history
    this.updateAttackHistory(attacker.id, attack.name);

    return {
      damage,
      attacker: attacker.id,
      defenderHp: defender.hp,
      attackUsed: attack.name,
      defenseUsed: defense.name,
      isDefeated: defender.hp <= 0
    };
  }

  // Update attack history
  updateAttackHistory(playerId, attackName) {
    const history = this.attackHistory.get(playerId) || [];
    history.push(attackName);
    if (history.length > 2) history.shift();
    this.attackHistory.set(playerId, history);
  }
}

module.exports = CombatEngine;