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

### 1. Prerequisites
- **Node.js** (v14 or higher)
- **npm** (comes with Node.js)

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/it-is-athi/gateway_backend.git
cd gateway_backend
npm install
```

### 3. Environment Configuration (Optional)
Create a `.env` file in the root directory to customize settings:
```env
PORT=3000
```

### 4. Start the Server
```bash
# Development mode (with auto-restart using nodemon)
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3000`

### 5. Database Initialization
On the first run, the system automatically:
- Creates `gateway.db` in the `/db` folder
- Sets up tables: `users`, `rules`, `audit_logs`
- Seeds default users and security rules

## 🧪 Testing (Default Credentials)
The database is auto-seeded with these users on the first run:

| Role   | Username | API Key           | Credits |
|--------|----------|-------------------|---------|
| Admin  | admin    | admin-key-123     | 999     |
| Member | athi     | member-key-456    | 100     |

### Default Security Rules
Pre-configured rules block dangerous commands and allow safe ones:

**AUTO_REJECT (Blocked):**
- `:(){ :|:& };:` - Fork bomb
- `rm -rf /` - Root deletion
- `mkfs.` - Disk formatting

**AUTO_ACCEPT (Allowed):**
- `git status|log|diff` - Safe git commands
- `ls|cat|pwd|echo` - Basic file operations

## 📡 API Documentation

**Base URL:** `http://localhost:3000/api`  
**Auth Header:** `x-api-key: <YOUR_KEY>`

---

### 🔐 Authentication Endpoints

#### **GET /api/me**
Get current user profile and credit balance.

**Headers:**
```
x-api-key: admin-key-123
```

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "credits": 999
}
```

---

### 🎯 Command Execution

#### **POST /api/commands**
Submit a command for validation and execution.

**Headers:**
```
x-api-key: member-key-456
Content-Type: application/json
```

**Request Body:**
```json
{
  "command_text": "ls -la"
}
```

**Response (Success - Auto Accept):**
```json
{
  "status": "AUTO_ACCEPT",
  "message": "Command approved by rule",
  "matched_rule": "^(ls|cat|pwd|echo)",
  "remaining_credits": 99
}
```

**Response (Blocked):**
```json
{
  "status": "AUTO_REJECT",
  "message": "Command blocked by security rule",
  "matched_rule": "rm\\s+-rf\\s+/"
}
```

**Response (Manual Review Required):**
```json
{
  "status": "MANUAL_REVIEW",
  "message": "Command requires manual approval",
  "remaining_credits": 98
}
```

**Error (Insufficient Credits):**
```json
{
  "error": "Insufficient credits"
}
```

---

### 📜 Audit & History

#### **GET /api/my-history**
Get execution history for the logged-in user.

**Headers:**
```
x-api-key: member-key-456
```

**Response:**
```json
[
  {
    "id": 5,
    "command_text": "ls -la",
    "action_taken": "AUTO_ACCEPT",
    "response_status": "SUCCESS",
    "timestamp": "2025-12-11 10:30:45"
  },
  {
    "id": 4,
    "command_text": "git status",
    "action_taken": "AUTO_ACCEPT",
    "response_status": "SUCCESS",
    "timestamp": "2025-12-11 10:25:30"
  }
]
```

#### **GET /api/audit-logs** (Admin Only)
View global system logs for all users.

**Headers:**
```
x-api-key: admin-key-123
```

**Response:**
```json
[
  {
    "id": 10,
    "user_id": 2,
    "username": "athi",
    "command_text": "rm -rf /",
    "action_taken": "AUTO_REJECT",
    "response_status": "BLOCKED",
    "timestamp": "2025-12-11 10:35:00"
  },
  {
    "id": 9,
    "user_id": 2,
    "username": "athi",
    "command_text": "ls -la",
    "action_taken": "AUTO_ACCEPT",
    "response_status": "SUCCESS",
    "timestamp": "2025-12-11 10:30:45"
  }
]
```

---

### 👥 User Management (Admin Only)

#### **POST /api/users**
Create a new user with API key and role.

**Headers:**
```
x-api-key: admin-key-123
Content-Type: application/json
```

**Request Body:**
```json
{
  "username": "john_doe",
  "role": "member"
}
```

**Response:**
```json
{
  "message": "User created successfully",
  "user": {
    "id": 3,
    "username": "john_doe",
    "api_key": "a1b2c3d4e5f6g7h8",
    "role": "member",
    "credits": 100
  }
}
```

---

### 🛡️ Rule Management (Admin Only)

#### **GET /api/rules**
List all active security rules.

**Headers:**
```
x-api-key: admin-key-123
```

**Response:**
```json
[
  {
    "id": 1,
    "pattern": ":(){ :|:& };:",
    "action": "AUTO_REJECT"
  },
  {
    "id": 4,
    "pattern": "git\\s+(status|log|diff)",
    "action": "AUTO_ACCEPT"
  }
]
```

#### **POST /api/rules**
Add a new security rule.

**Headers:**
```
x-api-key: admin-key-123
Content-Type: application/json
```

**Request Body:**
```json
{
  "pattern": "^docker\\s+ps",
  "action": "AUTO_ACCEPT"
}
```

**Response:**
```json
{
  "message": "Rule added successfully",
  "rule": {
    "id": 6,
    "pattern": "^docker\\s+ps",
    "action": "AUTO_ACCEPT"
  }
}
```

---

## 🔄 Testing with cURL

### Submit a Safe Command
```bash
curl -X POST http://localhost:3000/api/commands \
  -H "x-api-key: member-key-456" \
  -H "Content-Type: application/json" \
  -d '{"command_text": "ls -la"}'
```

### Submit a Dangerous Command
```bash
curl -X POST http://localhost:3000/api/commands \
  -H "x-api-key: member-key-456" \
  -H "Content-Type: application/json" \
  -d '{"command_text": "rm -rf /"}'
```

### Check User Profile
```bash
curl -X GET http://localhost:3000/api/me \
  -H "x-api-key: member-key-456"
```

### View My History
```bash
curl -X GET http://localhost:3000/api/my-history \
  -H "x-api-key: member-key-456"
```

### Admin: Create New User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "x-api-key: admin-key-123" \
  -H "Content-Type: application/json" \
  -d '{"username": "new_user", "role": "member"}'
```

### Admin: Add Security Rule
```bash
curl -X POST http://localhost:3000/api/rules \
  -H "x-api-key: admin-key-123" \
  -H "Content-Type: application/json" \
  -d '{"pattern": "^npm\\s+install", "action": "AUTO_ACCEPT"}'
```

---

## 📁 Project Structure
```
gateway_backend/
├── server.js              # Main application entry point
├── package.json           # Dependencies and scripts
├── db/
│   ├── database.js        # Database initialization & schema
│   └── gateway.db         # SQLite database file (auto-generated)
├── controllers/
│   ├── commandController.js   # Command execution logic
│   ├── userController.js      # User management
│   └── ruleController.js      # Rule CRUD operations
├── middleware/
│   └── authMiddleware.js      # API key authentication
└── routes/
    └── api.js             # API route definitions
```

---

## 🔒 Security Features
- **API Key Authentication:** Every request requires a valid API key
- **Role-Based Access Control:** Admin vs Member permissions
- **Regex Pattern Matching:** Blocks malicious commands before execution
- **Credit System:** Prevents abuse through usage limits
- **Transaction Safety:** Ensures database consistency
- **Comprehensive Logging:** Full audit trail for compliance

---

## 🐛 Troubleshooting

### Database Locked Error
If you see "database is locked":
1. Stop all running instances of the server
2. Delete `db/gateway.db`
3. Restart the server to regenerate the database

### Port Already in Use
If port 3000 is occupied:
1. Change the port in `.env` file: `PORT=3001`
2. Or kill the process using port 3000

### Module Not Found
Run `npm install` to ensure all dependencies are installed.

---

## 📝 License
ISC
