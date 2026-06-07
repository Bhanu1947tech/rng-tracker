const puppeteer = require('puppeteer');
const axios = require('axios');

class WebScraper {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async launchBrowser() {
    try {
      this.browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      console.log('✓ Browser launched');
    } catch (error) {
      console.error('Browser launch failed:', error);
    }
  }

  async closeBrowser() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async login(username, password, siteUrl) {
    try {
      await this.launchBrowser();
      this.page = await this.browser.newPage();

      // Set viewport and user agent
      await this.page.setViewport({ width: 1366, height: 768 });
      await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36');

      // Navigate to site
      console.log(`Navigating to ${siteUrl}...`);
      await this.page.goto(siteUrl, { waitUntil: 'networkidle2', timeout: 60000 });

      // Wait for login form
      await this.page.waitForSelector('input[type="text"], input[type="email"], input[type="password"]', { timeout: 10000 });

      // Fill login credentials
      const usernameSelectors = ['input[name="username"]', 'input[name="email"]', 'input[type="email"]', 'input[type="text"]'];
      const passwordSelector = 'input[type="password"]';

      for (let selector of usernameSelectors) {
        try {
          await this.page.type(selector, username, { delay: 50 });
          break;
        } catch (e) {
          continue;
        }
      }

      await this.page.type(passwordSelector, password, { delay: 50 });

      // Submit login
      const loginButton = await this.page.$('button[type="submit"]');
      if (loginButton) {
        await loginButton.click();
      }

      // Wait for navigation after login
      await this.page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 30000 });

      console.log('✓ Login successful');
      return { success: true, message: 'Login successful' };
    } catch (error) {
      console.error('Login error:', error.message);
      return { success: false, error: error.message };
    }
  }

  async scrapeGameResults() {
    try {
      if (!this.page) {
        throw new Error('Page not initialized');
      }

      // Extract game results from page
      const results = await this.page.evaluate(() => {
        const gameHistory = [];
        
        // Adjust selectors based on the actual site structure
        const rows = document.querySelectorAll('[class*="history"], [class*="result"], [class*="game-row"]');
        
        rows.forEach((row) => {
          const timeText = row.querySelector('[class*="time"]')?.textContent || '';
          const resultText = row.querySelector('[class*="result"], [class*="color"]')?.textContent || '';
          const amountText = row.querySelector('[class*="amount"]')?.textContent || '';
          
          if (timeText && resultText) {
            gameHistory.push({
              timestamp: timeText.trim(),
              result: resultText.trim().toLowerCase(),
              amount: amountText.trim(),
              rawData: row.innerHTML
            });
          }
        });

        return gameHistory;
      });

      return results;
    } catch (error) {
      console.error('Scraping error:', error.message);
      return [];
    }
  }

  async getGameData() {
    try {
      const gameData = await this.scrapeGameResults();
      return gameData;
    } catch (error) {
      console.error('Error getting game data:', error);
      return [];
    }
  }

  async continueScraping(interval = 5000) {
    try {
      const allResults = [];
      
      const scrapeInterval = setInterval(async () => {
        const newResults = await this.scrapeGameResults();
        if (newResults.length > 0) {
          allResults.push(...newResults);
          console.log(`📊 Scraped ${newResults.length} new results`);
        }
      }, interval);

      return { scrapeInterval, results: allResults };
    } catch (error) {
      console.error('Continuous scraping error:', error);
      return null;
    }
  }
}

module.exports = WebScraper;
