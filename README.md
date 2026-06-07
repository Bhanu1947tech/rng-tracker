# 🎲 RNG Tracker - Color Prediction Analysis Tool

A powerful web application that logs into color prediction gaming sites, analyzes RNG patterns, and predicts upcoming results with confidence scoring.

## Features

✨ **Web Login & Automation**
- Automatic browser automation using Puppeteer
- Secure credential handling
- Session management
- Multi-site support

📊 **Data Collection**
- Real-time game result scraping
- Historical data storage
- Continuous monitoring
- Result logging

🔍 **Advanced Analysis**
- Color distribution analysis
- Pattern recognition (bigrams)
- Probability calculations
- Anomaly detection
- RNG bias identification
- Trend analysis

🎯 **Prediction Engine**
- Next result prediction
- Multi-step predictions (batch)
- Confidence scoring
- Pattern-based forecasting
- Accuracy tracking

📈 **Visualization**
- Real-time dashboard
- Interactive charts
- Color statistics
- Trend graphs
- Pattern frequency display

💾 **Data Management**
- SQLite database
- Historical tracking
- Analysis history
- User profiles

## Installation

### Prerequisites
- Node.js (v14+)
- npm or yarn
- Chrome/Chromium browser

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/Bhanu1947tech/rng-tracker.git
cd rng-tracker
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment**
```bash
cp .env.example .env
# Edit .env with your settings
```

4. **Create data directory**
```bash
mkdir -p data
```

5. **Start the server**
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

6. **Access the application**
Open your browser and navigate to:
```
http://localhost:5000
```

## Usage

### Login & Connect
1. Open the application in your browser
2. Enter your credentials for the gaming site
3. Provide the site URL (e.g., https://91club.com)
4. Click "Login & Start Tracking"

### Dashboard
- View real-time game results
- Monitor color statistics
- See pattern frequencies
- View next prediction

### Analysis
- Run full data analysis
- View probability distribution
- Check for anomalies
- Identify RNG bias

### Predictions
- Get next result prediction
- View multi-step predictions
- Check confidence scores
- Analyze trends

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login to gaming site
- `GET /api/auth/session` - Check session
- `GET /api/auth/live-data` - Get live game data
- `POST /api/auth/logout` - Logout

### Analysis
- `POST /api/analysis/analyze` - Run analysis
- `POST /api/analysis/probabilities` - Calculate probabilities
- `POST /api/analysis/anomalies` - Detect anomalies
- `GET /api/analysis/history` - Get analysis history
- `GET /api/analysis/stats` - Get statistics

### Prediction
- `POST /api/prediction/next` - Get next prediction
- `POST /api/prediction/batch` - Get multiple predictions
- `GET /api/prediction/trends` - Get trend analysis

## Architecture

```
rng-tracker/
├── server.js              # Main server
├── package.json          # Dependencies
├── .env.example          # Environment template
├── utils/
│   ├── webScraper.js     # Browser automation
│   ├── database.js       # Data management
│   └── analyzer.js       # RNG analysis
├── routes/
│   ├── login.js          # Authentication
│   ├── analysis.js       # Analysis endpoints
│   └── prediction.js     # Prediction endpoints
├── public/
│   ├── index.html        # Dashboard HTML
│   ├── styles.css        # Styling
│   └── script.js         # Frontend logic
└── data/
    └── tracker.db        # SQLite database
```

## How It Works

### 1. Web Login
- Uses Puppeteer to automate browser login
- Handles captchas and multi-step authentication
- Maintains session cookies
- Extracts game history from page DOM

### 2. Data Collection
- Continuously scrapes game results
- Stores results with timestamps
- Tracks color outcomes (Red, Green, Purple)
- Logs amounts and metadata

### 3. Analysis
- **Distribution Analysis**: Calculates percentage for each color
- **Pattern Detection**: Identifies color sequences and their frequencies
- **Anomaly Detection**: Finds unusual streaks and biases
- **Probability**: Calculates likelihood of each outcome

### 4. Prediction
- Uses pattern frequency to predict next result
- Analyzes bigrams (2-color sequences)
- Assigns confidence scores
- Provides multi-step predictions

## Troubleshooting

### Login Fails
- Check credentials
- Verify site URL
- Check browser permissions
- Disable VPN if using one

### No Data Collected
- Verify selectors match site structure
- Check browser console for errors
- Ensure site loads correctly
- Check database permissions

## License

MIT License - See LICENSE file for details

## ⚠️ Disclaimer

This tool is for **educational and analytical purposes only**. RNG systems are designed to be unpredictable. No prediction tool is 100% accurate. Use responsibly and ethically.

---

**Created with ❤️ by Bhanu1947tech**
