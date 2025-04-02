const readline = require('readline');
const CombatEngine = require('./combatengine');
const Superhero = require('./models/super_heros');

const combatEngine = new CombatEngine();

// Interface pour lire les entrées utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Fonction pour poser une question à l'utilisateur
function askQuestion(query, callback) {
  rl.question(query, (answer) => callback(answer));
}

// Configuration des joueurs avec leurs héros, attaques et défenses
function setupPlayer(playerId, callback) {
  console.log(`Configuration du joueur ${playerId}...`);
  combatEngine.pickRandomChampion(532, (err, champion) => {
    if (err) {
      console.error(`Erreur lors de la sélection du champion pour le joueur ${playerId} :`, err);
      process.exit(1);
    }

    combatEngine.pickRandomAttacks((err, attacks) => {
      if (err) {
        console.error(`Erreur lors de la sélection des attaques pour le joueur ${playerId} :`, err);
        process.exit(1);
      }

      combatEngine.pickRandomDefenses((err, defenses) => {
        if (err) {
          console.error(`Erreur lors de la sélection des défenses pour le joueur ${playerId} :`, err);
          process.exit(1);
        }

        const player = {
          id: playerId,
          superhero: champion,
          hp: 100,
          attacks,
          defenses,
        };

        console.log(`Joueur ${playerId} configuré : ${champion.name}`);
        callback(player);
      });
    });
  });
}

// Boucle de jeu : les joueurs jouent à tour de rôle jusqu'à ce qu'un soit vaincu
function gameLoop(player1, player2) {
  let attacker = player1;
  let defender = player2;

  function nextTurn() {
    if (player1.hp <= 0 || player2.hp <= 0) {
      const winner = player1.hp > 0 ? player1 : player2;
      console.log(`\nLe joueur ${winner.id} (${winner.superhero.name}) a gagné le combat !`);
      rl.close();
      return;
    }

    console.log(`\n--- Tour du joueur ${attacker.id} ---`);
    console.log(`Champion : ${attacker.superhero.name}`);
    console.log('Statistiques :', attacker.superhero.powerstats);
    console.log('Attaques disponibles :');
    attacker.attacks.forEach((atk, index) => {
      console.log(`  ${index}: ${atk.name} (Stat de base : ${atk.baseStat}, Multiplicateur : ${atk.multiplicateur})`);
    });

    askQuestion(`Joueur ${attacker.id}, choisissez une attaque (0-${attacker.attacks.length - 1}) : `, (attackIndex) => {
      attackIndex = parseInt(attackIndex, 10);
      if (isNaN(attackIndex) || attackIndex < 0 || attackIndex >= attacker.attacks.length) {
        console.log('Choix invalide. Attaque par défaut sélectionnée (index 0).');
        attackIndex = 0;
      }

      const defenseIndex = Math.floor(Math.random() * defender.defenses.length);
      const chosenDefense = defender.defenses[defenseIndex];

      console.log(`Défense choisie pour le joueur ${defender.id} : ${chosenDefense.name} (Stat de base : ${chosenDefense.baseStat}, Multiplicateur : ${chosenDefense.multiplicateur})`);

      try {
        const result = combatEngine.processTurn(attacker, defender, attackIndex, defenseIndex);
        console.log(`Le joueur ${attacker.id} utilise ${result.attackUsed} et inflige ${result.damage} dégâts !`);
        console.log(`HP restants du joueur ${defender.id} : ${result.defenderHp}`);

        if (result.isDefeated) {
          console.log(`\nLe joueur ${defender.id} (${defender.superhero.name}) est vaincu !`);
          console.log(`Le joueur ${attacker.id} (${attacker.superhero.name}) remporte le combat !`);
          rl.close();
          return;
        }
      } catch (err) {
        console.error('Erreur pendant le tour :', err.message);
      }

      // Inverser les rôles pour le prochain tour
      [attacker, defender] = [defender, attacker];
      nextTurn();
    });
  }

  nextTurn();
}

// Initialisation du jeu
function startGame() {
  console.log('Préparation des joueurs...');

  setupPlayer(1, (player1) => {
    setupPlayer(2, (player2) => {
      console.log('\nLe combat commence !');
      console.log(`Joueur 1 : ${player1.superhero.name} (HP : ${player1.hp})`);
      console.log(`Joueur 2 : ${player2.superhero.name} (HP : ${player2.hp})`);

      gameLoop(player1, player2);
    });
  });
}

startGame();