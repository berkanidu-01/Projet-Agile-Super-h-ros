const express = require('express');
const Superhero = require('./models/super_heros');
const Attack = require('./models/attacks');
const Defense = require('./models/defenses');
const CombatEngine = require('./sys/combatengine');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static('public'));

// Récupère tous les super-héros
app.get('/api/superheros', (req, res) => {
  Superhero.getAll((err, superheroes) => {
    if (err) return res.status(500).send('Erreur serveur');
    res.send(superheroes);
  });
});

// Récupère un super-héros par ID
app.get('/api/superheroes/:id', (req, res) => {
  Superhero.getByIdWithPowerstats(req.params.id, (err, superhero) => {
    if (err) return res.status(500).send('Erreur serveur');
    if (!superhero) return res.status(404).send('Super-héros non trouvé');
    res.send(superhero);
  });
});

// Route pour récupérer les statistiques d'un super-héros par ID
app.get('/api/superheroes/:id/powerstats', (req, res) => {
  const { id } = req.params;
  Superhero.getPowerstats(id, (err, powerstats) => {
    if (err) {
      console.error('Erreur lors de la récupération des statistiques :', err.message);
      res.status(500).send('Erreur serveur');
    } else if (!powerstats) {
      res.status(404).send('Statistiques non trouvées');
    } else {
      res.send(powerstats);
    }
  });
});

// Route pour récupérer toutes les attaques
app.get('/api/attacks', (req, res) => {
  Attack.getAll((err, attacks) => {
    if (err) {
      console.error('Erreur lors de la récupération des attaques :', err.message);
      res.status(500).send('Erreur serveur');
    } else {
      res.send(attacks);
    }
  });
});

// Route pour récupérer toutes les défenses
app.get('/api/defenses', (req, res) => {
  Defense.getAll((err, defenses) => {
    if (err) {
      console.error('Erreur lors de la récupération des défenses :', err.message);
      res.status(500).send('Erreur serveur');
    } else {
      res.send(defenses);
    }
  });
});

app.get('/api/superheroes/random-pair', (req, res) => {
  Superhero.getRandomPair((err, heroes) => {
    if (err) {
      console.error('Erreur lors de la récupération des super-héros aléatoires :', err.message);
      res.status(500).send('Erreur serveur');
    } else {
      res.send(heroes);
    }
  });
});

// Initialise un combat avec deux héros aléatoires
app.post('/api/combat/init', (req, res) => {
  Superhero.getRandomPair((err, heroes) => {
    if (err) return res.status(500).send('Erreur serveur');
    const combatData = {
      hero1: { ...heroes[0], hp: 1000, attacks: [], defenses: [] },
      hero2: { ...heroes[1], hp: 1000, attacks: [], defenses: [] },
      currentTurn: 'hero1',
      currentPhase: 'attack',
    };
    Attack.getAll((err, attacks) => {
      if (err) return res.status(500).send('Erreur serveur');
      combatData.hero1.attacks = attacks.slice(0, 4);
      combatData.hero2.attacks = attacks.slice(4, 8);
      Defense.getAll((err, defenses) => {
        if (err) return res.status(500).send('Erreur serveur');
        combatData.hero1.defenses = defenses.slice(0, 4);
        combatData.hero2.defenses = defenses.slice(4, 8);
        res.json(combatData);
      });
    });
  });
});

// Gère un tour de combat
app.post('/api/combat/turn', (req, res) => {
  const { combatData, attackIndex, defenseIndex } = req.body;
  const combatEngine = new CombatEngine();
  const attacker = combatData[combatData.currentTurn];
  const defender = combatData.currentTurn === 'hero1' ? combatData.hero2 : combatData.hero1;

  try {
    if (combatData.currentPhase === 'attack') {
      combatData.selectedAttackIndex = attackIndex;
      combatData.currentPhase = 'defense';
      res.json({ combatData, message: `Attaque choisie : ${attacker.attacks[attackIndex].name}. En attente de la défense.` });
    } else if (combatData.currentPhase === 'defense') {
      const result = combatEngine.processTurn(attacker, defender, combatData.selectedAttackIndex, defenseIndex);
      defender.hp = result.defenderHp;
      combatData.currentTurn = combatData.currentTurn === 'hero1' ? 'hero2' : 'hero1';
      combatData.currentPhase = 'attack';
      if (result.isDefeated) {
        res.json({ combatData, winner: attacker.name, message: `${attacker.name} a gagné le combat !` });
      } else {
        res.json({ combatData, result });
      }
    } else {
      res.status(400).send('Phase de combat invalide');
    }
  } catch (err) {
    res.status(500).send('Erreur pendant le tour de combat');
  }
});

app.listen(port, () => console.log(`Serveur démarré sur http://localhost:${port}`));