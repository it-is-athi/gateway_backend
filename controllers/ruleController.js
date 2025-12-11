// controllers/ruleController.js
const db = require('../db/database');

exports.getRules = (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Admins only" });
    
    db.all("SELECT * FROM rules", [], (err, rows) => {
        if (err) return res.status(500).json({ error: "DB Error" });
        res.json(rows);
    });
};

exports.addRule = (req, res) => {
    if (req.user.role !== 'admin') return res.status(403).json({ error: "Admins only" });
    const { pattern, action } = req.body;

    try {
        new RegExp(pattern); // Validate Regex
    } catch (e) {
        return res.status(400).json({ error: "Invalid Regex Pattern" });
    }

    db.run("INSERT INTO rules (pattern, action) VALUES (?, ?)", [pattern, action], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ id: this.lastID, pattern, action });
    });
};