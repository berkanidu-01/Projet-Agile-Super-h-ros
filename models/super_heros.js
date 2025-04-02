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
        callback(null, null); 
      } else {
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
        callback(null, null); 
      } else {
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

  static getImage(id, callback) {
    const sql = 'SELECT * FROM images WHERE id = ?';
    db.get(sql, [id], (err, row) => {
      if (err) {
        callback(err, null);
      } else if (!row) {
        callback(null, null); // Aucune image trouvée
      } else {
        // Retourner l'image
        const image = row.sm;
        callback(null, image);
      }
    });
  }
}

module.exports = Superhero;