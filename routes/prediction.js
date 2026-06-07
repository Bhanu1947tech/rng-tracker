const express = require('express');
const router = express.Router();
const analyzer = require('../utils/analyzer');
const database = require('../utils/database');

// Predict next result
router.post('/next', async (req, res) => {
  try {
    const { gameResults } = req.body;
    const userId = req.session.userId;

    if (!gameResults || gameResults.length === 0) {
      return res.status(400).json({ error: 'No game results provided' });
    }

    // Perform analysis
    const analysisResult = analyzer.analyze(gameResults);

    // Get probabilities
    const probabilities = analyzer.calculateProbabilities(gameResults);

    res.json({
      success: true,
      prediction: {
        nextResult: analysisResult.predictedNext,
        confidence: analysisResult.accuracy,
        probabilities,
        patterns: analysisResult.patterns,
        reasoning: `Based on ${gameResults.length} games, predicted next result: ${analysisResult.predictedNext}`
      },
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get prediction trends
router.get('/trends', async (req, res) => {
  try {
    const userId = req.session.userId;

    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const gameResults = await database.getGameResults(userId, 1000);

    if (gameResults.length === 0) {
      return res.json({
        success: true,
        trends: null,
        message: 'No data available'
      });
    }

    // Calculate trends over time
    const hourlyData = {};
    gameResults.forEach(result => {
      const hour = new Date(result.timestamp).getHours();
      if (!hourlyData[hour]) {
        hourlyData[hour] = { red: 0, green: 0, purple: 0, total: 0 };
      }
      hourlyData[hour][result.result.toLowerCase()]++;
      hourlyData[hour].total++;
    });

    res.json({
      success: true,
      trends: hourlyData,
      generatedAt: new Date()
    });
  } catch (error) {
    console.error('Trends error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get multiple predictions
router.post('/batch', async (req, res) => {
  try {
    const { gameResults, count = 5 } = req.body;

    if (!gameResults || gameResults.length === 0) {
      return res.status(400).json({ error: 'No game results provided' });
    }

    const predictions = [];
    let currentResults = [...gameResults];

    for (let i = 0; i < count; i++) {
      const analysis = analyzer.analyze(currentResults);
      predictions.push({
        number: i + 1,
        prediction: analysis.predictedNext,
        confidence: analysis.accuracy
      });

      // Add predicted result to simulate next round
      currentResults.unshift({ result: analysis.predictedNext.toLowerCase() });
    }

    res.json({
      success: true,
      predictions,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Batch prediction error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
