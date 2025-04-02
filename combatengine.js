// combat_engine.js

const API = require('./API');

class CombatEngine {
  constructor() {
    // No attack history required in this version.
  }
  
  // Calculate damage using: stat × modifier - (defenseReduction × defenseModifier)
  calculateDamage(usedStat, modifier, defenseReduction, defenseModifier) {
    const rawDamage = (usedStat * modifier) - (defenseReduction * defenseModifier);
    return Math.max(0, rawDamage); // Damage cannot be negative.
  }
  
  // Get 4 random attacks from the list of available attacks imported from API.js
  getRandomAttacks() {
    const attacks = API.attacks;
    if (!Array.isArray(attacks)) {
      throw new Error("API.attacks must be an array");
    }
    if (attacks.length < 4) {
      throw new Error("Not enough attacks available in API.attacks");
    }
    
    // Randomly pick 4 unique attacks.
    const availableAttacks = [];
    const attacksCopy = [...attacks];
    for (let i = 0; i < 4; i++) {
      const randomIndex = Math.floor(Math.random() * attacksCopy.length);
      availableAttacks.push(attacksCopy[randomIndex]);
      attacksCopy.splice(randomIndex, 1); // Remove chosen attack to ensure uniqueness.
    }
    return availableAttacks;
  }
  
  // Process a combat turn
  processTurn(attacker, defender, attackUsed, defenseUsed) {
    // Calculate damage using the defense_modifier from API.js
    const damage = this.calculateDamage(
      attackUsed.statValue,
      attackUsed.modifier,
      defenseUsed.defenseReduction,
      API.defense_modifier
    );
    
    // Update defender's HP ensuring it doesn't go below zero.
    defender.hp = Math.max(0, defender.hp - damage);
    
    return {
      damageDealt: damage,
      attacker: attacker.id,
      defenderHp: defender.hp,
      attackUsed: attackUsed.type,
      defenseUsed: defenseUsed.type,
      isDefeated: defender.hp === 0
    };
  }
  
  // Reset combat state if needed (not used in this version)
  resetCombat() {
    // No state to reset in this version.
  }
}

module.exports = CombatEngine;
