// controllers/userController.js
const db = require('../db/database');

exports.getMe = (req, res) => {
    db.get("SELECT username, role, credits FROM users WHERE id = ?", [req.user.id], (err, row) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        res.json(row);
    });
};

exports.getMyHistory = (req, res) => {
    db.all("SELECT * FROM audit_logs WHERE user_id = ? ORDER BY timestamp DESC", [req.user.id], (err, rows) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        res.json(rows);
    });
};
// Add this at the top of userController.js
const crypto = require('crypto'); // Built-in node module for random strings

// ... (keep existing getMe and getMyHistory) ...

// --- NEW FUNCTION: Create User ---
exports.createUser = (req, res) => {
    // 1. Check if requester is Admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: "Only admins can create users" });
    }

    const { username, role } = req.body;

    if (!username || !role) {
        return res.status(400).json({ error: "Username and role are required" });
    }

    // 2. Generate a random API Key
    // unique random string (hex format)
    const newApiKey = crypto.randomBytes(16).toString('hex');

    // 3. Insert into DB
    const startCredits = 100; // Default starting credits
    
    db.run(
        "INSERT INTO users (username, api_key, role, credits) VALUES (?, ?, ?, ?)",
        [username, newApiKey, role, startCredits],
        function (err) {
            if (err) {
                // Check if username/key already exists
                return res.status(500).json({ error: "Failed to create user. Name might be taken." });
            }

            // 4. Return the Key (The "Once-Only" reveal)
            res.status(201).json({
                message: "User created successfully",
                user: {
                    id: this.lastID,
                    username: username,
                    role: role,
                    credits: startCredits,
                    api_key: newApiKey // <--- ONLY TIME WE SEND THIS
                }
            });
        }
    );
};