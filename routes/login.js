const express = require('express');
const router = express.Router();
const WebScraper = require('../utils/webScraper');
const database = require('../utils/database');

let scraper = null;
let currentUserId = null;

// Login endpoint
router.post('/login', async (req, res) => {
  try {
    const { username, password, siteUrl } = req.body;

    if (!username || !password || !siteUrl) {
      return res.status(400).json({ error: 'Missing credentials or site URL' });
    }

    // Initialize scraper
    scraper = new WebScraper();
    const loginResult = await scraper.login(username, password, siteUrl);

    if (!loginResult.success) {
      return res.status(401).json(loginResult);
    }

    // Save or get user
    try {
      let user = await database.getUser(username);
      if (!user) {
        const userId = await database.addUser(username, password, 'email@example.com');
        currentUserId = userId;
      } else {
        currentUserId = user.id;
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
    }

    // Start scraping game data
    const gameData = await scraper.getGameData();

    req.session.userId = currentUserId;
    req.session.username = username;
    req.session.loggedIn = true;

    res.json({
      success: true,
      message: 'Login successful',
      userId: currentUserId,
      gameData,
      session: {
        userId: currentUserId,
        username: username
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get current session
router.get('/session', (req, res) => {
  if (req.session.loggedIn) {
    res.json({
      loggedIn: true,
      userId: req.session.userId,
      username: req.session.username
    });
  } else {
    res.json({ loggedIn: false });
  }
});

// Start continuous scraping
router.post('/start-scraping', async (req, res) => {
  try {
    if (!scraper) {
      return res.status(400).json({ error: 'Not logged in' });
    }

    const scrapingSession = await scraper.continueScraping(5000);

    res.json({
      success: true,
      message: 'Scraping started',
      scrapingInterval: scrapingSession.scrapeInterval
    });
  } catch (error) {
    console.error('Scraping error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get live data
router.get('/live-data', async (req, res) => {
  try {
    if (!scraper) {
      return res.status(400).json({ error: 'Not logged in' });
    }

    const gameData = await scraper.getGameData();
    res.json({
      success: true,
      data: gameData,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error getting live data:', error);
    res.status(500).json({ error: error.message });
  }
});

// Logout
router.post('/logout', async (req, res) => {
  try {
    if (scraper) {
      await scraper.closeBrowser();
      scraper = null;
    }
    req.session.destroy();
    res.json({ success: true, message: 'Logged out' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
