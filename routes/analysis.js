const express = require('express');
const router = express.Router();
const analyzer = require('../utils/analyzer');
const database = require('../utils/database');

// Analyze game results
router.post('/analyze', async (req, res) => {
  try {
    const { gameResults } = req.body;
    const userId = req.session.userId;

    if (!gameResults || gameResults.length === 0) {
      return res.status(400).json({ error: 'No game results provided' });
    }

    // Perform analysis
    const analysisResult = analyzer.analyze(gameResults);

    // Save results to database
    if (userId) {
      await database.saveAnalysis(userId, analysisResult);
    }

    res.json({
      success: true,
      analysis: analysisResult,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Analysis error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get probabilities
router.post('/probabilities', (req, res) => {
  try {
    const { gameResults } = req.body;

    if (!gameResults || gameResults.length === 0) {
      return res.status(400).json({ error: 'No game results provided' });
    }

    const probabilities = analyzer.calculateProbabilities(gameResults);

    res.json({
      success: true,
      probabilities,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Probability error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Detect anomalies
router.post('/anomalies', (req, res) => {
  try {
    const { gameResults } = req.body;

    if (!gameResults || gameResults.length === 0) {
      return res.status(400).json({ error: 'No game results provided' });
    }

    const anomalies = analyzer.detectAnomalies(gameResults);

    res.json({
      success: true,
      anomalies,
      count: anomalies.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Anomaly detection error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get past analysis
router.get('/history', async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const history = await database.getAnalysis(userId, 20);

    res.json({
      success: true,
      history,
      count: history.length
    });
  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
router.get('/stats', async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const gameResults = await database.getGameResults(userId, 500);

    if (gameResults.length === 0) {
      return res.json({
        success: true,
        stats: null,
        message: 'No data available'
      });
    }

    const analysis = analyzer.analyze(gameResults);

    res.json({
      success: true,
      stats: {
        totalScraped: gameResults.length,
        analysis,
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
