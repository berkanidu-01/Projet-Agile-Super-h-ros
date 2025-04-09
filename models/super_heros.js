const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dbHeros.sqlite');

class Superhero {
  constructor(id, name, slug) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.powerstats = null; // Initialiser les powerstats à null
    this.image = null; // Initialiser l'image à null
  }
  

  // Charger les powerstats pour un super-héros
  loadPowerstats(callback) {
    const sqlPowerstats = 'SELECT * FROM powerstats WHERE hero_id = ?';
    const sqlImage = 'SELECT * FROM images WHERE hero_id = ?';
  
    db.get(sqlPowerstats, [this.id], (err, row) => {
      if (err) {
        callback(err, null);
      } else if (!row) {
        this.powerstats = null; // Aucun powerstats trouvé
        callback(null, this);
      } else {
        // Ajouter les powerstats à l'instance
        this.powerstats = {
          intelligence: row.intelligence,
          strength: row.strength,
          speed: row.speed,
          durability: row.durability,
          power: row.power,
          combat: row.combat,
        };
  
        // Charger l'image
        db.get(sqlImage, [this.id], (err, row) => {
          if (err) {
            callback(err, null);
          } else if (!row) {
            this.image = null; // Aucune image trouvée
          } else {
            this.image = "https://cdn.jsdelivr.net/gh/rtomczak/superhero-api@0.3.0/api/images/" + row.url;
          }
          callback(null, this);
        });
      }
    });
  }

  // Récupérer tous les super-héros avec leurs powerstats
  static getAllWithPowerstats(callback) {
    const sql = 'SELECT * FROM superheroes';
    db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        const superheroes = rows.map(row => new Superhero(row.id, row.name, row.slug));
        let loadedCount = 0;

        // Charger les powerstats pour chaque super-héros
        superheroes.forEach(hero => {
          hero.loadPowerstats((err) => {
            if (err) {
              callback(err, null);
              return;
            }
            loadedCount++;
            if (loadedCount === superheroes.length) {
              callback(null, superheroes);
            }
          });
        });
      }
    });
  }

  // Récupérer un super-héros par ID avec ses powerstats
  static getByIdWithPowerstats(id, callback) {
    const sql = 'SELECT * FROM SuperHeros WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else if (!row) {
        callback(null, null); // Aucun super-héros trouvé
      } else {
        const superhero = new Superhero(row.id, row.name, row.slug);
        superhero.loadPowerstats((err) => {
          if (err) {
            callback(err, null);
          } else {
            callback(null, superhero);
          }
        });
      }
    });
  }

  // Récupérer deux super-héros aléatoires avec leurs powerstats et images
  static getRandomPair(callback) {
    /// const sql = 'SELECT * FROM SuperHeros ORDER BY RANDOM() LIMIT 2';
    const sql = 'SELECT * FROM SuperHeros WHERE id IN (210, 209)'; // Récupérer deux héros par ID
    db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
      } else if (rows.length < 2) {
        callback(new Error('Pas assez de super-héros dans la base de données'), null);
      } else {
        const heroes = rows.map(row => new Superhero(row.id, row.name, row.slug));
        let loadedCount = 0;

        // Charger les powerstats et images pour chaque super-héros
        heroes.forEach(hero => {
          hero.loadPowerstats((err) => {
            if (err) {
              callback(err, null);
              return;
            }
            loadedCount++;
            if (loadedCount === heroes.length) {
              callback(null, heroes);
            }
          });
        });
      }
    });
  }
}

module.exports = Superhero;