const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dbHeros.sqlite');

class Superhero {
  constructor(id, name, slug) {
    this.id = id;
    this.name = name;
    this.slug = slug;
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM superheroes';
    db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        const superheroes = rows.map(row => new Superhero(row.id, row.name, row.slug));
        callback(null, superheroes);
      }
    });
  }

  static getById(id, callback) {
    const sql = 'SELECT * FROM superheroes WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else if (!row) {
        callback(null, null); // Aucun super-héros trouvé
      } else {
        // Transformer la ligne en une instance de Superhero
        const superhero = new Superhero(row.id, row.name, row.slug);
        callback(null, superhero);
      }
    });
  }

  static getPowerstats(id, callback) {
    const sql = 'SELECT * FROM powerstats WHERE superhero_id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else if (!row) {
        callback(null, null); // Aucune statistique trouvée
      } else {
        // Retourner les statistiques sous forme d'objet
        const powerstats = {
          intelligence: row.intelligence,
          strength: row.strength,
          speed: row.speed,
          durability: row.durability,
          power: row.power,
          combat: row.combat,
        };
        callback(null, powerstats);
      }
    });
  }
}

module.exports = Superhero;