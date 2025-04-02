const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./dbHeros.sqlite');

class Attack {
  constructor(baseStat, name, multiplicateur) {
    this.baseStat = baseStat;
    this.name = name;
    this.multiplicateur = multiplicateur;
  }

  static getAll(callback) {
    const sql = 'SELECT * FROM ATTACKS';
    db.all(sql, [], (err, rows) => {
      if (err) {
        callback(err, null);
      } else {
        // Transformer chaque ligne en une instance de Attack
        const attacks = rows.map(row => new Attack(row.BASE_STAT, row.NAME, row.MULTIPLICATEUR));
        callback(null, attacks);
      }
    });
  }
}

module.exports = Attack;