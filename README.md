# 🛡️ Command Gateway - Backend

The secure server core for the Command Gateway system. It acts as a security checkpoint, handling authentication, credit management, regex-based rule matching, and audit logging.

## ⚡ Key Features
- **Authentication:** Role-based access (Admin/Member) via API Keys in headers.
- **Transactional Integrity:** Uses SQLite Transactions (`BEGIN`...`COMMIT`) to ensure credits are deducted *only* if the command is successfully logged.
- **Rule Engine:** Regex-based Allow/Block system. Blocks dangerous commands (e.g., `rm -rf`) and allows safe ones.
- **Audit Logging:** Records every action (User, Command, Status, Timestamp) for compliance.
- **Admin Tools:** API endpoints for creating users and configuring system rules.

## 🛠️ Tech Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** SQLite3 (Persistent file `gateway.db`)

## ⚙️ Setup & Run

### 1. Installation
Clone the repository and install dependencies:
```bash
npm install
```

### 2. Start the Server
```bash
# Development mode (with auto-restart)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

## 🧪 Testing (Default Credentials)
The database is auto-seeded with these users on the first run:

| Role   | API Key           | Credits |
|--------|-------------------|---------|
| Admin  | admin-key-123     | 999     |
| Member | member-key-456    | 100     |

## 📡 API Documentation

**Base URL:** `http://localhost:3000/api`  
**Auth Header:** `x-api-key: <YOUR_KEY>`

| Method | Endpoint        | Description                                                      |
|--------|-----------------|------------------------------------------------------------------|
| POST   | `/commands`     | Submit a command. Body: `{ "command_text": "ls -la" }`         |
| GET    | `/me`           | Get current user profile and credit balance.                     |
| GET    | `/my-history`   | Get the execution history of the logged-in user.                |
| GET    | `/audit-logs`   | (Admin) View global system logs for all users.                  |
| POST   | `/users`        | (Admin) Create a new user. Body: `{ "username": "...", "role": "member" }` |
| GET    | `/rules`        | (Admin) List all active regex rules.                            |
| POST   | `/rules`        | (Admin) Add a rule. Body: `{ "pattern": "^git", "action": "AUTO_ACCEPT" }` |
