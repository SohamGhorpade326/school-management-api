const express = require('express');
require('dotenv').config();
const db = require('./db'); // This ensures the DB connection is initiated
const schoolRoutes = require('./routes/schoolRoutes');

const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Mount the routes
app.use('/api', schoolRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});