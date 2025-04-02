const express = require('express');
const path = require('path');
const Superhero = require('./models/super_heros'); // Import du modèle Superhero
const Attack = require('./models/attacks'); // Import du modèle Attack
const Defense = require('./models/defenses'); // Import du modèle Defense

const app = express();
const port = 3000;

app.use(express.json());

// Serve static files from the "superheros" directory
app.use(express.static(path.join(__dirname, 'superheros')));

// Route for the root URL to serve the index.html file
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'superheros', 'index.html'));
});

// Route pour récupérer tous les super-héros
app.get('/api/superheros', (req, res) => {
  Superhero.getAll((err, superheroes) => {
    if (err) {
      console.error('Erreur lors de la récupération des super-héros :', err.message);
      res.status(500).send('Erreur serveur');
    } else {
      res.send(superheroes);
    }
  });
});

// Route pour récupérer un super-héros par ID
app.get('/api/superheroes/:id', (req, res) => {
  const { id } = req.params;
  Superhero.getById(id, (err, superhero) => {
    if (err) {
      console.error('Erreur lors de la récupération du super-héros :', err.message);
      res.status(500).send('Erreur serveur');
    } else if (!superhero) {
      res.status(404).send('Super-héros non trouvé');
    } else {
      res.send(superhero); 
    }
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

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});