// controllers/commandController.js
const db = require('../db/database');

exports.processCommand = (req, res) => {
    const { command_text } = req.body;
    const user = req.user;

    if (!command_text) return res.status(400).json({ error: "No command provided" });

    // 1. Check Credits
    if (user.credits <= 0) {
        return res.status(403).json({ error: "Insufficient credits", balance: 0 });
    }

    // 2. Fetch Rules
    db.all("SELECT * FROM rules", [], (err, rules) => {
        if (err) return res.status(500).json({ error: "Failed to load rules" });

        let action = "AUTO_REJECT";
        let matchedRule = null;

        for (const rule of rules) {
            try {
                const regex = new RegExp(rule.pattern);
                if (regex.test(command_text)) {
                    action = rule.action;
                    matchedRule = rule;
                    break;
                }
            } catch (e) {
                console.error("Invalid Regex:", rule.pattern);
            }
        }

        const isExecuted = action === "AUTO_ACCEPT";

        // 3. Transaction
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            if (isExecuted) {
                db.run("UPDATE users SET credits = credits - 1 WHERE id = ?", [user.id], (err) => {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: "Transaction failed" });
                    }
                });
            }

            const logStatus = isExecuted ? "EXECUTED" : "REJECTED";
            db.run(
                "INSERT INTO audit_logs (user_id, command_text, action_taken, response_status) VALUES (?, ?, ?, ?)",
                [user.id, command_text, action, logStatus],
                function (err) {
                    if (err) {
                        db.run("ROLLBACK");
                        return res.status(500).json({ error: "Logging failed" });
                    }
                    db.run("COMMIT");

                    const newBalance = isExecuted ? user.credits - 1 : user.credits;
                    res.json({
                        status: logStatus,
                        action_taken: action,
                        new_balance: newBalance,
                        message: isExecuted ? "Command Executed" : "Command Blocked"
                    });
                }
            );
        });
    });
};