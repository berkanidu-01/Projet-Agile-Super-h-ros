const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dbHeros.sqlite');

class Defense {
  constructor(baseStat, name, multiplicateur) {
    this.baseStat = baseStat;
    this.name = name;
    this.multiplicateur = multiplicateur;
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM DEFENSES';
    db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        // Transformer chaque ligne en une instance de Defense
        const defenses = rows.map(row => new Defense(row.BASE_STAT, row.NAME, row.MULTIPLICATEUR));
        callback(null, defenses);
      }
    });
  }
}

module.exports = Defense;