const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dbHeros.sqlite');

class Superhero {
  constructor(id, name, slug) {
    this.id = id;
    this.name = name;
    this.slug = slug;
    this.powerstats = null; // Initialiser les powerstats à null
  }

  // Charger les powerstats pour un super-héros
  loadPowerstats(callback) {
    const sql = 'SELECT * FROM powerstats WHERE hero_id = ?';
    db.get(sql, [this.id], (err, row) => {
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
        callback(null, this);
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
}

module.exports = Superhero;