const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../data/tracker.db');

class Database {
  constructor() {
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('Database connection error:', err);
      } else {
        console.log('✓ Database connected');
        this.initTables();
      }
    });
  }

  initTables() {
    // Users table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        email TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Game results table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS game_results (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        timestamp DATETIME,
        result TEXT NOT NULL,
        amount REAL,
        rawData TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `);

    // Analysis data table
    this.db.run(`
      CREATE TABLE IF NOT EXISTS analysis (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        totalGames INTEGER,
        redCount INTEGER,
        greenCount INTEGER,
        purpleCount INTEGER,
        redPercentage REAL,
        greenPercentage REAL,
        purplePercentage REAL,
        pattern TEXT,
        predictedNext TEXT,
        accuracy REAL,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(userId) REFERENCES users(id)
      )
    `);

    console.log('✓ Database tables initialized');
  }

  addUser(username, password, email) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
        [username, password, email],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getUser(username) {
    return new Promise((resolve, reject) => {
      this.db.get(
        'SELECT * FROM users WHERE username = ?',
        [username],
        (err, row) => {
          if (err) reject(err);
          else resolve(row);
        }
      );
    });
  }

  addGameResult(userId, timestamp, result, amount, rawData) {
    return new Promise((resolve, reject) => {
      this.db.run(
        'INSERT INTO game_results (userId, timestamp, result, amount, rawData) VALUES (?, ?, ?, ?, ?)',
        [userId, timestamp, result, amount, rawData],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getGameResults(userId, limit = 100) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM game_results WHERE userId = ? ORDER BY timestamp DESC LIMIT ?',
        [userId, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  saveAnalysis(userId, analysisData) {
    return new Promise((resolve, reject) => {
      this.db.run(
        `INSERT INTO analysis 
         (userId, totalGames, redCount, greenCount, purpleCount, 
          redPercentage, greenPercentage, purplePercentage, pattern, predictedNext, accuracy) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userId,
          analysisData.totalGames,
          analysisData.redCount,
          analysisData.greenCount,
          analysisData.purpleCount,
          analysisData.redPercentage,
          analysisData.greenPercentage,
          analysisData.purplePercentage,
          analysisData.pattern,
          analysisData.predictedNext,
          analysisData.accuracy
        ],
        function (err) {
          if (err) reject(err);
          else resolve(this.lastID);
        }
      );
    });
  }

  getAnalysis(userId, limit = 10) {
    return new Promise((resolve, reject) => {
      this.db.all(
        'SELECT * FROM analysis WHERE userId = ? ORDER BY createdAt DESC LIMIT ?',
        [userId, limit],
        (err, rows) => {
          if (err) reject(err);
          else resolve(rows);
        }
      );
    });
  }

  close() {
    this.db.close();
  }
}

module.exports = new Database();
