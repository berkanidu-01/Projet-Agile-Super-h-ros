// combat_engine.js

const Attack = require('./models/attacks');
const Superhero = require('./models/super_heros');
const Defense = require('./models/defenses');


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
  getRandomAttacks(callback) {
    Attack.getAll((err, attacks) => {
      if (err) return callback(err, null);
      if (attacks.length < 4) return callback(new Error("Not enough attacks available"), null);

      const availableAttacks = [];
      const attacksCopy = [...attacks];
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * attacksCopy.length);
        availableAttacks.push(attacksCopy[randomIndex]);
        attacksCopy.splice(randomIndex, 1);
      }
      callback(null, availableAttacks);
    });
  }

  // Process a combat turn
  processTurn(attacker, defender, attackUsed, defenseUsed) {
    // Calculate damage using the defense_modifier from API.js
    const damage = this.calculateDamage(
      attackUsed.baseStat,
      attackUsed.multiplicateur,
      defenseUsed.baseStat,
      defenseUsed.multiplicateur
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
  startRandomCombat(callback) {
    Superhero.getRandomPair((err, heroes) => {
      if (err) {
        callback(err, null);
      } else {
        const [hero1, hero2] = heroes;
        const combatDetails = {
          hero1: hero1,
          hero2: hero2,
          message: `${hero1.name} affronte ${hero2.name} dans un combat épique !`
        };
        callback(null, combatDetails);
      }
    });
  }
  getRandomAttacks(callback) {
    Attack.getAll((err, attacks) => {
      if (err) return callback(err, null);
      if (attacks.length < 4) return callback(new Error("Pas assez d'attaques disponibles"), null);
  
      const selectedAttacks = [];
      const attacksCopy = [...attacks];
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * attacksCopy.length);
        selectedAttacks.push(attacksCopy[randomIndex]);
        attacksCopy.splice(randomIndex, 1);
      }
      callback(null, selectedAttacks);
    });
  }
  getRandomDefenses(callback) {
    Defense.getAll((err, defenses) => {
      if (err) return callback(err, null);
      if (defenses.length < 4) return callback(new Error("Pas assez de défenses disponibles"), null);
  
      const selectedDefenses = [];
      const defensesCopy = [...defenses];
      for (let i = 0; i < 4; i++) {
        const randomIndex = Math.floor(Math.random() * defensesCopy.length);
        selectedDefenses.push(defensesCopy[randomIndex]);
        defensesCopy.splice(randomIndex, 1);
      }
      callback(null, selectedDefenses);
    });
  }
  // Reset combat state if needed (not used in this version)
  resetCombat() {
    // No state to reset in this version.
  }
}

module.exports = CombatEngine;
