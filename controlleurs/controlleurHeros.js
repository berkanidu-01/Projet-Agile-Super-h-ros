const Superhero = require('../models/super_heros');

exports.getAllSuperheroes = (req, res) => {
  Superhero.getAll((err, superheroes) => {
    if (err) {
      console.error('Erreur lors de la récupération des super-héros :', err.message);
      res.status(500).send('Erreur serveur');
    } else {
      res.send(superheroes); // Retourne des instances de Superhero
    }
  });
};

exports.getSuperheroById = (req, res) => {
  const { id } = req.params;
  Superhero.getById(id, (err, superhero) => {
    if (err) {
      console.error('Erreur lors de la récupération du super-héros :', err.message);
      res.status(500).send('Erreur serveur');
    } else if (!superhero) {
      res.status(404).send('Super-héros non trouvé');
    } else {
      res.send(superhero); // Retourne une instance de Superhero
    }
  });
};