// middleware/authMiddleware.js
const db = require('../db/database');

const authenticate = (req, res, next) => {
    const apiKey = req.headers['x-api-key'];
    
    if (!apiKey) {
        return res.status(401).json({ error: "Missing API Key" });
    }

    db.get("SELECT * FROM users WHERE api_key = ?", [apiKey], (err, user) => {
        if (err) return res.status(500).json({ error: "Database error" });
        if (!user) return res.status(403).json({ error: "Invalid API Key" });
        
        req.user = user; // Attach user to the request
        next();
    });
};

module.exports = authenticate;