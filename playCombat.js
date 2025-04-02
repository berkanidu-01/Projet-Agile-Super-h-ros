const readline = require('readline');
const CombatEngine = require('./combatengine');
const Superhero = require('./models/super_heros');

const combatEngine = new CombatEngine();

// Interface pour lire les entrées utilisateur
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Fonction pour demander une entrée utilisateur
function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

// Fonction principale pour jouer une partie
async function playCombat() {
  console.log("Préparation du combat...");

  // Récupérer deux héros aléatoires
  Superhero.getRandomPair(async (err, heroes) => {
    if (err) {
      console.error("Erreur lors de la récupération des super-héros :", err);
      rl.close();
      return;
    }

    const [hero1, hero2] = heroes;
    hero1.hp = 100; // Initialiser les points de vie
    hero2.hp = 100;

    console.log(`Combat entre ${hero1.name} et ${hero2.name} commence !`);

    // Récupérer les attaques et défenses pour chaque héros
    combatEngine.getRandomAttacks((err, hero1Attacks) => {
      if (err) return console.error("Erreur lors de la récupération des attaques pour Hero 1 :", err);

      combatEngine.getRandomDefenses((err, hero1Defenses) => {
        if (err) return console.error("Erreur lors de la récupération des défenses pour Hero 1 :", err);

        combatEngine.getRandomAttacks((err, hero2Attacks) => {
          if (err) return console.error("Erreur lors de la récupération des attaques pour Hero 2 :", err);

          combatEngine.getRandomDefenses(async (err, hero2Defenses) => {
            if (err) return console.error("Erreur lors de la récupération des défenses pour Hero 2 :", err);

            // Afficher les choix d'attaques et défenses
            console.log(`${hero1.name} a les attaques :`, hero1Attacks.map((a, i) => `${i + 1}: ${a.name}`));
            console.log(`${hero1.name} a les défenses :`, hero1Defenses.map((d, i) => `${i + 1}: ${d.name}`));
            console.log(`${hero2.name} a les attaques :`, hero2Attacks.map((a, i) => `${i + 1}: ${a.name}`));
            console.log(`${hero2.name} a les défenses :`, hero2Defenses.map((d, i) => `${i + 1}: ${d.name}`));

            // Boucle de combat
            let turn = 1;
            while (hero1.hp > 0 && hero2.hp > 0) {
              console.log(`\n--- Tour ${turn} ---`);

              // Tour du joueur 1
              console.log(`C'est au tour de ${hero1.name} !`);
              const hero1AttackIndex = await askQuestion(`Choisissez une attaque (1-4) : `);
              const hero1DefenseIndex = await askQuestion(`Choisissez une défense pour vous protéger (1-4) : `);

              const hero1Attack = hero1Attacks[parseInt(hero1AttackIndex) - 1];
              const hero2Defense = hero2Defenses[Math.floor(Math.random() * hero2Defenses.length)];

              const result1 = combatEngine.processTurn(hero1, hero2, hero1Attack, hero2Defense);
              console.log(`${hero1.name} utilise ${hero1Attack.name} contre ${hero2.name} (${hero2Defense.name})`);
              console.log(`Dégâts infligés : ${result1.damageDealt}, HP restants de ${hero2.name} : ${result1.defenderHp}`);

              if (result1.isDefeated) {
                console.log(`${hero2.name} est vaincu ! ${hero1.name} gagne le combat !`);
                break;
              }

              // Tour du joueur 2
              console.log(`C'est au tour de ${hero2.name} !`);
              const hero2AttackIndex = await askQuestion(`Choisissez une attaque (1-4) : `);
              const hero2DefenseIndex = await askQuestion(`Choisissez une défense pour vous protéger (1-4) : `);

              const hero2Attack = hero2Attacks[parseInt(hero2AttackIndex) - 1];
              const hero1Defense = hero1Defenses[Math.floor(Math.random() * hero1Defenses.length)];

              const result2 = combatEngine.processTurn(hero2, hero1, hero2Attack, hero1Defense);
              console.log(`${hero2.name} utilise ${hero2Attack.name} contre ${hero1.name} (${hero1Defense.name})`);
              console.log(`Dégâts infligés : ${result2.damageDealt}, HP restants de ${hero1.name} : ${result2.defenderHp}`);

              if (result2.isDefeated) {
                console.log(`${hero1.name} est vaincu ! ${hero2.name} gagne le combat !`);
                break;
              }

              turn++;
            }

            rl.close();
          });
        });
      });
    });
  });
}

// Lancer la partie
playCombat();