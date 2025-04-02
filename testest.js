const CombatEngine = require('./combatengine');
const Attack = require('./models/attacks');
const Defense = require('./models/defenses');
const Superhero = require('./models/super_heros');

const combatEngine = new CombatEngine();

// Retrieve attacks and defenses from the database
Attack.getAll((err, attacks) => {
  if (err) {
    console.error("Error fetching attacks:", err);
    return;
  }
  if (attacks.length === 0) {
    console.error("No attacks available in the database.");
    return;
  }
  Defense.getAll((err, defenses) => {
    if (err) {
      console.error("Error fetching defenses:", err);
      return;
    }
    if (defenses.length === 0) {
      console.error("No defenses available in the database.");
      return;
    }
    Superhero.getAll((err, superheroes) => {
      if (err) {
        console.error("Error fetching superheroes:", err);
        return;
      }
      
      if (superheroes.length < 2) {
        console.error("Not enough superheroes for a battle.");
        return;
      }

      console.log("Available attacks:", attacks);
      console.log("Available defenses:", defenses);

      // Select two superheroes for testing
      const hero1 = { ...superheroes[0], hp: 100 };
      const hero2 = { ...superheroes[1], hp: 100 };
      
      // Select random attacks and defenses
      const attackUsed = attacks[Math.floor(Math.random() * attacks.length)];
      const defenseUsed = defenses[Math.floor(Math.random() * defenses.length)];
      
      // Ensure values exist before processing
      if (!attackUsed || !defenseUsed) {
        console.error("Invalid attack or defense selection.");
        return;
      }

      const attackStatValue = hero1[attackUsed.baseStat.toLowerCase()];
      if (typeof attackStatValue !== 'number') {
        console.error("Invalid attack stat value:", attackStatValue);
        return;
      }
      
      // Simulate a turn
      const result = combatEngine.processTurn(hero1, hero2, {
        statValue: attackStatValue,
        modifier: attackUsed.multiplicateur,
        type: attackUsed.name
      }, {
        defenseReduction: defenseUsed.multiplicateur,
        type: defenseUsed.name
      });
      console.log("Combat Turn Result:", result);
    });
  });
});
