// combatengine.js
const Superhero = require('../models/super_heros');
const Attack = require('../models/attacks');
const Defense = require('../models/defenses');

class CombatEngine {
  constructor() {
    this.attackHistory = new Map(); // Tracks consecutive attacks: { playerId: [lastTwoAttacks] }
  }

  // Damage formula: (stat × attackModifier) - (defenseStat × defenseModifier)
  //degats = Stat x Multiplicateur attaque - ((Stat / 2) + reduction de defense)

  calculateDamage(attackerStat, attackModifier, defenderStat, defenseModifier) {
    const damage = (attackerStat * attackModifier) - ((defenderStat/2) + defenseModifier);
    console.log(`Calcul des dégâts : (${attackerStat} * ${attackModifier}) - (${defenderStat} * ${defenseModifier}) = ${damage}`);
    return Math.max(0, Math.floor(damage)); // No negative damage, integer values
  }

  // Random champion selection
  pickRandomChampion(maxChampionId, callback) {
    const randomId = Math.floor(Math.random() * maxChampionId) + 1;
    console.log(`Tentative de sélection d'un champion avec l'ID : ${randomId}`);
    Superhero.getByIdWithPowerstats(randomId, (err, champion) => {
      if (err || !champion) {
        console.error('Erreur lors de la récupération du champion :', err || 'Champion non trouvé');
        callback(err || new Error('Champion not found'), null);
      } else {
        console.log('Champion sélectionné :', champion);
        callback(null, champion);
      }
    });
  }

  // Random attacks (4/13)
  pickRandomAttacks(callback) {
    Attack.getAll((err, attacks) => {
      if (err || attacks.length < 4) {
        console.error('Erreur lors de la récupération des attaques ou pas assez d\'attaques disponibles :', err || 'Attaques insuffisantes');
        callback(err || new Error('Not enough attacks'), null);
      } else {
        console.log('Attaques récupérées :', attacks);
        const shuffled = [...attacks].sort(() => 0.5 - Math.random());
        const selectedAttacks = shuffled.slice(0, 4);
        console.log('Attaques sélectionnées :', selectedAttacks);
        callback(null, selectedAttacks);
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
    console.log('Attacker:', attacker);
    console.log('Defender:', defender);

    const attack = attacker.attacks[attackIndex];
    const defense = defender.defenses[defenseIndex];
    const typeAttack = attack.baseStat;
    const typeDefense = defense.baseStat;

    console.log('Attack:', attack);
    console.log('Defense:', defense);

    // Vérifier si les powerstats existent
    if (!attacker.powerstats) {
      throw new Error(`Les powerstats de l'attaquant sont manquants : ${JSON.stringify(attacker)}`);
    }
    if (!defender.powerstats) {
      throw new Error(`Les powerstats du défenseur sont manquants : ${JSON.stringify(defender)}`);
    }

    // Vérifier si les baseStat sont valides
    if (!attacker.powerstats[typeAttack]) {
      throw new Error(`Statistique d'attaque invalide : ${typeAttack}`);
    }
    if (!defender.powerstats[typeDefense]) {
      throw new Error(`Statistique de défense invalide : ${typeDefense}`);
    }

    const attackerStat = attacker.powerstats[typeAttack];
    const defenderStat = defender.powerstats[typeDefense];

    const damage = this.calculateDamage(
      attackerStat,
      attack.multiplicateur,
      defenderStat,
      defense.multiplicateur
    );

    defender.hp = Math.max(0, defender.hp - damage);

    this.updateAttackHistory(attacker.id, attack.name);

    return {
      damage,
      attacker: attacker.id,
      defenderHp: defender.hp,
      attackUsed: attack.name,
      defenseUsed: defense.name,
      isDefeated: defender.hp <= 0,
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