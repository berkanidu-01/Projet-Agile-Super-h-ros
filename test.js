// index.js
const CombatEngine = require('./combatengine');
const Superhero = require('./models/super_heros');
const readline = require('readline');

// Helper to create a player object
function createPlayer(id, hero, attacks, defenses) {
  return {
    id,
    superhero: hero,
    hp: 100,
    attacks,
    defenses
  };
}

const combatEngine = new CombatEngine();
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Assume a maximum champion ID (e.g., 4 heroes available)
const maxChampionId = 4;

// Retrieve a random hero for each player using a custom function that wraps pickRandomChampion
function getRandomHero(callback) {
  // Instead of using pickRandomChampion (which requires a callback),
  // we can simulate randomness with a simple random ID since dependencies are set.
  const randomId = Math.floor(Math.random() * maxChampionId) + 1;
  Superhero.getByIdWithPowerstats(randomId, callback);
}

// Setup both players
getRandomHero((err, hero1) => {
  if (err) throw err;
  getRandomHero((err, hero2) => {
    if (err) throw err;

    // Get 4 random attacks and defenses for each player
    combatEngine.pickRandomAttacks((err, attacks1) => {
      if (err) throw err;
      combatEngine.pickRandomDefenses((err, defenses1) => {
        if (err) throw err;
        combatEngine.pickRandomAttacks((err, attacks2) => {
          if (err) throw err;
          combatEngine.pickRandomDefenses((err, defenses2) => {
            if (err) throw err;

            const player1 = createPlayer(1, hero1, attacks1, defenses1);
            const player2 = createPlayer(2, hero2, attacks2, defenses2);

            console.log('Game Start!');
            console.log(`Player 1: ${player1.superhero.name}`);
            console.log(`Player 2: ${player2.superhero.name}`);
            console.log(`\nPlayer 1 Attacks: ${player1.attacks.map((atk, i) => `[${i}] ${atk.name}`).join(', ')}`);
            console.log(`Player 2 Attacks: ${player2.attacks.map((atk, i) => `[${i}] ${atk.name}`).join(', ')}`);

            let attacker = player1;
            let defender = player2;
            let turn = 1;

            function nextTurn() {
              if (defender.hp <= 0) {
                console.log(`\nPlayer ${attacker.id} wins the battle!`);
                rl.close();
                return;
              }
              console.log(`\nTurn ${turn}: Player ${attacker.id} is attacking Player ${defender.id}`);
              console.log(`Player ${attacker.id} HP: ${attacker.hp} | Player ${defender.id} HP: ${defender.hp}`);
              console.log(`Available Attacks for Player ${attacker.id}:`);
              attacker.attacks.forEach((atk, index) => {
                console.log(`  [${index}]: ${atk.name}`);
              });
              rl.question(`Player ${attacker.id}, choose your attack index: `, (input) => {
                let attackIndex = parseInt(input);
                if (isNaN(attackIndex) || attackIndex < 0 || attackIndex >= attacker.attacks.length) {
                  console.log('Invalid input. Defaulting to attack index 0.');
                  attackIndex = 0;
                }
                // For this example, we'll pick a random defense index from the defender's defenses.
                const defenseIndex = Math.floor(Math.random() * defender.defenses.length);
                try {
                  const result = combatEngine.processTurn(attacker, defender, attackIndex, defenseIndex);
                  console.log(`\nPlayer ${attacker.id} used ${result.attackUsed} vs Player ${defender.id}'s ${result.defenseUsed}`);
                  console.log(`Damage Dealt: ${result.damage}`);
                  console.log(`Player ${defender.id}'s HP is now: ${result.defenderHp}`);
                } catch (error) {
                  console.log('Error processing turn:', error.message);
                }
                // Swap roles
                [attacker, defender] = [defender, attacker];
                turn++;
                nextTurn();
              });
            }
            nextTurn();
          });
        });
      });
    });
  });
});
