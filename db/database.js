const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// 1. Create the database file (it will appear in your folder automatically)
const dbPath = path.resolve(__dirname, 'gateway.db');
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the SQLite database.');
    }
});

// 2. Initialize Tables and Seed Data
db.serialize(() => {
    // --- Enable Foreign Keys ---
    db.run("PRAGMA foreign_keys = ON");

    // --- Table: Users ---
    // Stores API keys and Credits. 
    // API Key must be unique so two people don't share one.
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT,
        api_key TEXT UNIQUE,
        role TEXT, 
        credits INTEGER DEFAULT 100
    )`);

    // --- Table: Rules ---
    // Stores the Regex patterns and what to do (Allow/Block)
    db.run(`CREATE TABLE IF NOT EXISTS rules (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        pattern TEXT,
        action TEXT
    )`);

    // --- Table: Audit Logs ---
    // The "History Book". Links back to the User via user_id.
    db.run(`CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        command_text TEXT,
        action_taken TEXT,
        response_status TEXT,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(user_id) REFERENCES users(id)
    )`);

    // --- SEEDING: Default Admin ---
    // Check if users table is empty before inserting
    db.get("SELECT count(*) as count FROM users", (err, row) => {
        if (row.count === 0) {
            console.log("Seeding default users...");
            const insertUser = db.prepare("INSERT INTO users (username, api_key, role, credits) VALUES (?, ?, ?, ?)");
            insertUser.run("admin", "admin-key-123", "admin", 999); // Infinite power!
            insertUser.run("athi", "member-key-456", "member", 100); // Standard user
            insertUser.finalize();
        }
    });

    // --- SEEDING: Default Rules ---
    // Check if rules table is empty before inserting
    db.get("SELECT count(*) as count FROM rules", (err, row) => {
        if (row.count === 0) {
            console.log("Seeding default rules...");
            const insertRule = db.prepare("INSERT INTO rules (pattern, action) VALUES (?, ?)");
            
            // Dangerous stuff -> BLOCK
            insertRule.run(":(){ :|:& };:", "AUTO_REJECT"); // Fork Bomb
            insertRule.run("rm\\s+-rf\\s+/", "AUTO_REJECT"); // Nuke root
            insertRule.run("mkfs\\.", "AUTO_REJECT");        // Format disk

            // Safe stuff -> ACCEPT
            insertRule.run("git\\s+(status|log|diff)", "AUTO_ACCEPT");
            insertRule.run("^(ls|cat|pwd|echo)", "AUTO_ACCEPT");
            
            insertRule.finalize();
        }
    });
});

module.exports = db;