const express = require('express');
const session = require('express-session');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

const loginRoutes = require('./routes/login');
const analysisRoutes = require('./routes/analysis');
const predictionRoutes = require('./routes/prediction');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false, maxAge: 3600000 }
}));

app.use(express.static('public'));

// Routes
app.use('/api/auth', loginRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/prediction', predictionRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'Server is running', timestamp: new Date() });
});

app.listen(PORT, () => {
  console.log(`🚀 RNG Tracker Server running on http://localhost:${PORT}`);
});
