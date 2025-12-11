// routes/api.js
const express = require('express');
const router = express.Router();
const authenticate = require('../middleware/authMiddleware');

const commandController = require('../controllers/commandController');
const userController = require('../controllers/userController');
const ruleController = require('../controllers/ruleController');

// All routes here use 'authenticate'
router.use(authenticate);

// Command Routes
router.post('/commands', commandController.processCommand);

// User Routes
router.get('/me', userController.getMe);
router.get('/my-history', userController.getMyHistory);
router.get('/audit-logs', userController.getAllLogs);

// Admin Routes
router.get('/rules', ruleController.getRules);
router.post('/rules', ruleController.addRule);

// User Management (Admin Only)
router.post('/users', userController.createUser);

module.exports = router;