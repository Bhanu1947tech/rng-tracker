// Global state
let gameData = [];
let colorChart = null;
let trendChart = null;
const API_BASE = 'http://localhost:5000/api';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  checkSession();
  updateTimestamp();
  setInterval(updateTimestamp, 1000);
});

// Check if user is already logged in
async function checkSession() {
  try {
    const response = await fetch(`${API_BASE}/auth/session`);
    const data = await response.json();

    if (data.loggedIn) {
      showSection('dashboard');
      getLiveData();
      analyzeData();
    } else {
      showSection('login-section');
    }
  } catch (error) {
    console.error('Session check error:', error);
    showSection('login-section');
  }
}

// Show section
function showSection(sectionId) {
  document.querySelectorAll('.section').forEach(section => {
    section.classList.add('hidden');
  });

  const section = document.getElementById(sectionId);
  if (section) {
    section.classList.remove('hidden');
  }
}

// Handle login
async function handleLogin(event) {
  event.preventDefault();
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const siteUrl = document.getElementById('siteUrl').value;
  const statusDiv = document.getElementById('login-status');

  statusDiv.innerHTML = '<span class="loading"></span> Logging in...';
  statusDiv.className = 'status-message';

  try {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password, siteUrl })
    });

    const data = await response.json();

    if (data.success) {
      statusDiv.innerHTML = '✓ Login successful! Redirecting...';
      statusDiv.className = 'status-message success';
      gameData = data.gameData || [];
      
      setTimeout(() => {
        document.getElementById('login-form').reset();
        showSection('dashboard');
        getLiveData();
      }, 1500);
    } else {
      statusDiv.innerHTML = `✗ ${data.error || 'Login failed'}`;
      statusDiv.className = 'status-message error';
    }
  } catch (error) {
    statusDiv.innerHTML = `✗ Error: ${error.message}`;
    statusDiv.className = 'status-message error';
  }
}

// Get live data
async function getLiveData() {
  try {
    const response = await fetch(`${API_BASE}/auth/live-data`);
    const data = await response.json();

    if (data.success) {
      gameData = data.data;
      displayLiveData();
      updateColorChart();
      updatePrediction();
    }
  } catch (error) {
    console.error('Error getting live data:', error);
    document.getElementById('live-data').innerHTML = `<p>Error loading data: ${error.message}</p>`;
  }
}

// Display live data
function displayLiveData() {
  const container = document.getElementById('live-data');
  
  if (gameData.length === 0) {
    container.innerHTML = '<p>No data available</p>';
    return;
  }

  const recentData = gameData.slice(0, 10);
  let html = '<ul style="list-style: none;">';
  
  recentData.forEach((game, index) => {
    const colorClass = `color-${game.result.toLowerCase()}`;
    html += `<li class="data-item">
      <strong>#${index + 1}</strong> 
      <span class="${colorClass}">${game.result.toUpperCase()}</span>
      <span style="color: #999;"> @ ${game.timestamp || 'N/A'}</span>
    </li>`;
  });
  
  html += '</ul>';
  container.innerHTML = html;
}

// Update color chart
function updateColorChart() {
  if (gameData.length === 0) return;

  const colors = { red: 0, green: 0, purple: 0 };
  gameData.forEach(game => {
    colors[game.result.toLowerCase()]++;
  });

  const ctx = document.getElementById('colorChart');
  if (!ctx) return;

  if (colorChart) colorChart.destroy();

  colorChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels: ['Red', 'Green', 'Purple'],
      datasets: [{
        data: [colors.red, colors.green, colors.purple],
        backgroundColor: ['#ef4444', '#10b981', '#a855f7'],
        borderColor: ['#dc2626', '#059669', '#9333ea'],
        borderWidth: 2
      }]
    },
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: 'bottom',
        }
      }
    }
  });
}

// Analyze data
async function analyzeData() {
  if (gameData.length === 0) {
    alert('No game data to analyze');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/analysis/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameResults: gameData })
    });

    const data = await response.json();

    if (data.success) {
      displayAnalysis(data.analysis);
    }
  } catch (error) {
    console.error('Analysis error:', error);
  }
}

// Display analysis
function displayAnalysis(analysis) {
  // Probabilities
  const probDiv = document.getElementById('probabilities');
  let probHtml = '';
  for (const [color, prob] of Object.entries(analysis.probabilities || {})) {
    probHtml += `<div class="data-item">
      <strong class="color-${color}">${color.toUpperCase()}</strong><br>
      Count: ${prob.count} | ${prob.percentage}%
    </div>`;
  }
  probDiv.innerHTML = probHtml;

  // Anomalies
  const anomalyDiv = document.getElementById('anomalies');
  const anomalies = analysis.anomalies || [];
  if (anomalies.length === 0) {
    anomalyDiv.innerHTML = '<p>✓ No anomalies detected</p>';
  } else {
    let anomalyHtml = '';
    anomalies.forEach(anom => {
      anomalyHtml += `<div class="data-item anomaly-${anom.severity.toLowerCase()}">
        <strong>${anom.type}</strong><br>
        Color: ${anom.color?.toUpperCase() || 'N/A'} | ${anom.percentage || anom.length}
      </div>`;
    });
    anomalyDiv.innerHTML = anomalyHtml;
  }

  // Bias Check
  const biasDiv = document.getElementById('bias-check');
  const mostCommon = analysis.analysis?.mostCommon || 'N/A';
  const leastCommon = analysis.analysis?.leastCommon || 'N/A';
  biasDiv.innerHTML = `<div class="data-item">
    <strong>Most Common:</strong> <span class="color-${mostCommon.toLowerCase()}">${mostCommon.toUpperCase()}</span><br>
    <strong>Least Common:</strong> <span class="color-${leastCommon.toLowerCase()}">${leastCommon.toUpperCase()}</span>
  </div>`;
}

// Update prediction
function updatePrediction() {
  if (gameData.length === 0) return;

  fetch(`${API_BASE}/prediction/next`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ gameResults: gameData })
  })
  .then(res => res.json())
  .then(data => {
    if (data.success) {
      const pred = data.prediction;
      const predDisplay = document.getElementById('prediction-display');
      if (predDisplay) {
        predDisplay.innerHTML = `
          <div class="prediction-value color-${pred.nextResult.toLowerCase()}">
            ${pred.nextResult}
          </div>
          <div style="font-size: 0.9rem; color: rgba(255,255,255,0.9);">
            Confidence: ${pred.confidence}%
          </div>
        `;
      }

      // Single prediction card
      const singlePred = document.getElementById('single-prediction');
      if (singlePred) {
        singlePred.innerHTML = `<div class="data-item">
          <strong>Next Result:</strong> <span class="color-${pred.nextResult.toLowerCase()}">${pred.nextResult}</span><br>
          <strong>Confidence:</strong> ${pred.confidence}%<br>
          <strong>Reason:</strong> ${pred.reasoning}
        </div>`;
      }
    }
  })
  .catch(console.error);
}

// Get predictions
async function getPredictions() {
  if (gameData.length === 0) {
    alert('No game data to predict from');
    return;
  }

  try {
    const response = await fetch(`${API_BASE}/prediction/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ gameResults: gameData, count: 5 })
    });

    const data = await response.json();

    if (data.success) {
      const batchDiv = document.getElementById('batch-predictions');
      let html = '';
      data.predictions.forEach(pred => {
        html += `<div class="data-item">
          <strong>#${pred.number}</strong>: <span class="color-${pred.prediction.toLowerCase()}">${pred.prediction}</span>
          <span style="float: right; color: #666;">${pred.confidence}%</span>
        </div>`;
      });
      batchDiv.innerHTML = html;

      // Update confidence
      const confDiv = document.getElementById('confidence');
      const avgConfidence = (data.predictions.reduce((a, p) => a + p.confidence, 0) / data.predictions.length).toFixed(2);
      confDiv.innerHTML = `<div style="text-align: center; padding: 1rem;">
        <div style="font-size: 2.5rem; color: var(--primary-color);">${avgConfidence}%</div>
        <div style="color: #666;">Average Confidence</div>
      </div>`;
    }
  } catch (error) {
    console.error('Prediction error:', error);
  }
}

// Logout
async function logout() {
  try {
    await fetch(`${API_BASE}/auth/logout`, { method: 'POST' });
    gameData = [];
    document.getElementById('login-form').reset();
    showSection('login-section');
  } catch (error) {
    console.error('Logout error:', error);
  }
}

// Update timestamp
function updateTimestamp() {
  const now = new Date();
  document.getElementById('timestamp').textContent = `Last updated: ${now.toLocaleTimeString()}`;
}
