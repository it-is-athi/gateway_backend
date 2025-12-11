const express = require('express');
const cors = require('cors');
require('dotenv').config();

const apiRoutes = require('./routes/api');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Use our new modular routes
// All endpoints will look like: localhost:3000/api/commands
app.use('/api', apiRoutes);

app.listen(PORT, () => {
    console.log(`Gateway Backend running on port ${PORT}`);
});