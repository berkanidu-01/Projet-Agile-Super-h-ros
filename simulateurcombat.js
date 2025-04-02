const CombatEngine = require('./combatengine');
const Superhero = require('./models/super_heros');
const Attack = require('./models/attacks');
const Defense = require('./models/defenses');

const combatEngine = new CombatEngine();

// Fonction pour simuler un combat
function simulateCombat() {
  // Récupérer deux héros aléatoires
  Superhero.getRandomPair((err, heroes) => {
    if (err) {
      console.error("Erreur lors de la récupération des super-héros :", err);
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

          combatEngine.getRandomDefenses((err, hero2Defenses) => {
            if (err) return console.error("Erreur lors de la récupération des défenses pour Hero 2 :", err);

            // Afficher les choix d'attaques et défenses
            console.log(`${hero1.name} a les attaques :`, hero1Attacks);
            console.log(`${hero1.name} a les défenses :`, hero1Defenses);
            console.log(`${hero2.name} a les attaques :`, hero2Attacks);
            console.log(`${hero2.name} a les défenses :`, hero2Defenses);

            // Simuler 5 tours de combat
            for (let turn = 1; turn <= 5; turn++) {
              console.log(`\n--- Tour ${turn} ---`);

              // Sélectionner une attaque et une défense aléatoires pour chaque héros
              const hero1Attack = hero1Attacks[Math.floor(Math.random() * hero1Attacks.length)];
              const hero2Defense = hero2Defenses[Math.floor(Math.random() * hero2Defenses.length)];
              const hero2Attack = hero2Attacks[Math.floor(Math.random() * hero2Attacks.length)];
              const hero1Defense = hero1Defenses[Math.floor(Math.random() * hero1Defenses.length)];

              // Hero 1 attaque Hero 2
              const result1 = combatEngine.processTurn(
                hero1,
                hero2,
                hero1Attack,
                hero2Defense
              );
              console.log(`${hero1.name} utilise ${hero1Attack.name} contre ${hero2.name} (${hero2Defense.name})`);
              console.log(`Dégâts infligés : ${result1.damageDealt}, HP restants de ${hero2.name} : ${result1.defenderHp}`);

              // Vérifier si Hero 2 est vaincu
              if (result1.isDefeated) {
                console.log(`${hero2.name} est vaincu ! ${hero1.name} gagne le combat !`);
                return;
              }

              // Hero 2 attaque Hero 1
              const result2 = combatEngine.processTurn(
                hero2,
                hero1,
                hero2Attack,
                hero1Defense
              );
              console.log(`${hero2.name} utilise ${hero2Attack.name} contre ${hero1.name} (${hero1Defense.name})`);
              console.log(`Dégâts infligés : ${result2.damageDealt}, HP restants de ${hero1.name} : ${result2.defenderHp}`);

              // Vérifier si Hero 1 est vaincu
              if (result2.isDefeated) {
                console.log(`${hero1.name} est vaincu ! ${hero2.name} gagne le combat !`);
                return;
              }
            }

            // Si aucun héros n'est vaincu après 5 tours
            console.log("\nLe combat se termine sans vainqueur !");
            console.log(`${hero1.name} HP restants : ${hero1.hp}`);
            console.log(`${hero2.name} HP restants : ${hero2.hp}`);
          });
        });
      });
    });
  });
}

// Lancer la simulation
simulateCombat();