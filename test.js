// test.js
const CombatEngine = require('./combatengine');
const readline = require('readline');

const engine = new CombatEngine();

// Promisified readline question
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
function questionPromise(query) {
  return new Promise(resolve => rl.question(query, answer => resolve(answer)));
}

// Promisify the engine functions to work with async/await
function pickChampion(maxId) {
  return new Promise((resolve, reject) => {
    engine.pickRandomChampion(maxId, (err, champion) => {
      if (err) {
        reject(err);
      } else {
        resolve(champion);
      }
    });
  });
}

function pickAttacks() {
  return new Promise((resolve, reject) => {
    engine.pickRandomAttacks((err, attacks) => {
      if (err) {
        reject(err);
      } else {
        resolve(attacks);
      }
    });
  });
}

function pickDefenses() {
  return new Promise((resolve, reject) => {
    engine.pickRandomDefenses((err, defenses) => {
      if (err) {
        reject(err);
      } else {
        resolve(defenses);
      }
    });
  });
}

// Set up players with champion, attacks, defenses and initial HP.
async function setupPlayer(playerId) {
  try {
    // Assuming max champion id is 100; adjust as needed.
    const champion = await pickChampion(532);
    const attacks = await pickAttacks();
    const defenses = await pickDefenses();
    return {
      id: playerId,
      superhero: champion,
      hp: 100,
      attacks,
      defenses
    };
  } catch (err) {
    console.error(`Error setting up player ${playerId}:`, err);
    process.exit(1);
  }
}

// The game loop: players take turns until one is defeated.
async function gameLoop(player1, player2) {
  let attacker = player1;
  let defender = player2;

  while (player1.hp > 0 && player2.hp > 0) {
    console.log(`\n--- Player ${attacker.id}'s Turn ---`);
    console.log(`Your Champion: ${attacker.superhero.name}`);
    console.log('Powerstats:', attacker.superhero.powerstats);
    console.log('Available Attacks:');
    attacker.attacks.forEach((atk, index) => {
      console.log(`  ${index}: ${atk.name} (Base stat: ${atk.baseStat}, Modifier: ${atk.multiplicateur})`);
    });

    // Prompt the attacker for which attack to use.
    let answer = await questionPromise(`Player ${attacker.id}, choose an attack index (0-${attacker.attacks.length - 1}): `);
    let attackIndex = parseInt(answer, 10);
    if (isNaN(attackIndex) || attackIndex < 0 || attackIndex >= attacker.attacks.length) {
      console.log('Invalid choice. Defaulting to index 0.');
      attackIndex = 0;
    }

    // Randomly choose a defense for the defender.
    const defenseIndex = Math.floor(Math.random() * defender.defenses.length);
    const chosenDefense = defender.defenses[defenseIndex];

    console.log(`Player ${defender.id}'s defense chosen: ${chosenDefense.name} (Base stat: ${chosenDefense.baseStat}, Modifier: ${chosenDefense.multiplicateur})`);

    // Process the turn.
    try {
      const result = engine.processTurn(attacker, defender, attackIndex, defenseIndex);
      console.log(`Player ${attacker.id} used ${result.attackUsed} and dealt ${result.damage} damage!`);
      console.log(`Player ${defender.id}'s HP is now ${result.defenderHp}`);
      if (result.isDefeated) {
        console.log(`\nPlayer ${defender.id} is defeated! Player ${attacker.id} wins the game!`);
        break;
      }
    } catch (err) {
      console.error('Error during turn:', err.message);
    }

    // Swap roles for the next turn.
    [attacker, defender] = [defender, attacker];
  }

  rl.close();
}

// Initialize the game.
async function startGame() {
  console.log('Setting up players...');
  const player1 = await setupPlayer(1);
  const player2 = await setupPlayer(2);

  console.log('\nGame start!');
  console.log(`Player 1: ${player1.superhero.name} (HP: ${player1.hp})`);
  console.log(`Player 2: ${player2.superhero.name} (HP: ${player2.hp})`);

  await gameLoop(player1, player2);
}

startGame();
