const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dbHeros.sqlite');

class Superhero {
  constructor(id, name, slug) {
    this.id = id;
    this.name = name;
    this.slug = slug;
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM SuperHeroes';
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
    const sql = 'SELECT * FROM SuperHeroes WHERE id = ?';
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
    const sql = 'SELECT * FROM PowerStats WHERE superhero_id = ?';
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
    const sql = 'SELECT * FROM Images WHERE id = ?';
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
  static getRandomPair(callback) {
    const sql = 'SELECT * FROM SuperHeroes ORDER BY RANDOM() LIMIT 2';
    db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
      } else if (rows.length < 2) {
        callback(new Error('Pas assez de super-héros dans la base de données'), null);
      } else {
        const heroes = rows.map(row => new Superhero(row.id, row.name, row.slug));
        callback(null, heroes);
      }
    });
  }
}

module.exports = Superhero;