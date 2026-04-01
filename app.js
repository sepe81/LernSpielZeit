// State management
let state = {
    balance: 0,
    dailyLimit: 3600,
    history: []
};

let activeTimer = null;
let timerSeconds = 0;
let timerInterval = null;
let startTime = null;

// DOM Elements
const balanceDisplay = document.getElementById('balance-display');
const negativeWarning = document.getElementById('negative-warning');
const studyTimerDisplay = document.getElementById('study-timer');
const playTimerDisplay = document.getElementById('play-timer');
const remainingDailyDisplay = document.getElementById('remaining-daily');
const historyBody = document.getElementById('history-body');
const btnShowHistory = document.getElementById('btn-show-history');

// Views
const studyView = document.getElementById('study-view');
const playView = document.getElementById('play-view');
const historyView = document.getElementById('history-view');
const controlsSection = document.getElementById('controls-section');

// Initial Load
function init() {
    const savedData = localStorage.getItem('learnPlayTime');
    if (savedData) {
        state = JSON.parse(savedData);
    }
    updateUI();
}

// Data Persistence
function saveState() {
    localStorage.setItem('learnPlayTime', JSON.stringify(state));
}

// Formatting
function formatTime(totalSeconds) {
    const isNegative = totalSeconds < 0;
    const absSeconds = Math.abs(totalSeconds);
    const h = Math.floor(absSeconds / 3600);
    const m = Math.floor((absSeconds % 3600) / 60);
    const s = absSeconds % 60;
    
    const timeStr = [h, m, s]
        .map(v => v < 10 ? "0" + v : v)
        .join(":");
    
    return (isNegative ? "-" : "") + timeStr;
}

function getPlayTimeToday() {
    const today = new Date().toISOString().split('T')[0];
    return state.history
        .filter(entry => entry.type === 'play' && entry.start.startsWith(today))
        .reduce((sum, entry) => sum + entry.seconds, 0);
}

function updateUI() {
    balanceDisplay.textContent = formatTime(state.balance);
    
    if (state.balance < 0) {
        negativeWarning.classList.remove('hidden');
    } else {
        negativeWarning.classList.add('hidden');
    }
    
    // Daily remaining
    const playToday = getPlayTimeToday();
    const currentPlaySeconds = activeTimer === 'play' ? timerSeconds : 0;
    const remaining = Math.max(0, state.dailyLimit - (playToday + currentPlaySeconds));
    remainingDailyDisplay.textContent = formatTime(remaining).replace(/^-/, '');
    
    // Auto-stop if limit reached
    if (activeTimer === 'play' && remaining <= 0) {
        stopTimer(true);
        showView(null);
        alert("Tageslimit erreicht! Zeit für heute ist um.");
    }
    
    // Only update history table if it's currently visible
    if (!historyView.classList.contains('hidden')) {
        updateHistoryTable();
    }
}

function updateHistoryTable() {
    historyBody.innerHTML = '';
    [...state.history].reverse().forEach(entry => {
        const row = document.createElement('tr');
        const date = new Date(entry.start).toLocaleString('de-DE', { 
            day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' 
        });
        
        row.innerHTML = `
            <td>${entry.type === 'study' ? '📚 Lernen' : '🎮 Spielen'}</td>
            <td>${formatTime(entry.seconds).replace(/^-/, '')}</td>
            <td>${date}</td>
        `;
        historyBody.appendChild(row);
    });
}

// Timer Logic
function startTimer(type) {
    if (timerInterval) stopTimer(false); // Should not happen with view logic but for safety
    
    activeTimer = type;
    timerSeconds = 0;
    startTime = new Date().toISOString();
    
    const display = type === 'study' ? studyTimerDisplay : playTimerDisplay;
    display.textContent = "00:00:00";
    
    timerInterval = setInterval(() => {
        timerSeconds++;
        display.textContent = formatTime(timerSeconds).replace(/^-/, '');
        
        if (activeTimer === 'play') {
            updateUI();
        }
    }, 1000);
    
    // UI feedback (Buttons are now always visible in their view)
}

function stopTimer(shouldSave) {
    clearInterval(timerInterval);
    timerInterval = null;
    
    if (shouldSave && timerSeconds > 0) {
        const endTime = new Date().toISOString();
        const entry = {
            type: activeTimer,
            seconds: timerSeconds,
            start: startTime,
            end: endTime
        };
        
        state.history.push(entry);
        
        if (activeTimer === 'study') {
            state.balance += timerSeconds;
        } else {
            state.balance -= timerSeconds;
        }
        
        saveState();
        updateUI();
    }
    
    // Reset state
    activeTimer = null;
}

// View Switching
function showView(view) {
    studyView.classList.add('hidden');
    playView.classList.add('hidden');
    if (view) {
        view.classList.remove('hidden');
    }
}

function toggleHistory() {
    const isShowing = !historyView.classList.contains('hidden');
    
    if (isShowing) {
        historyView.classList.add('hidden');
        btnShowHistory.textContent = 'Historie anzeigen';
    } else {
        historyView.classList.remove('hidden');
        btnShowHistory.textContent = 'Historie ausblenden';
        updateHistoryTable();
    }
}

// Event Listeners
document.getElementById('btn-show-study').addEventListener('click', () => {
    showView(studyView);
    startTimer('study');
});

document.getElementById('btn-show-play').addEventListener('click', () => {
    showView(playView);
    startTimer('play');
});

btnShowHistory.addEventListener('click', () => {
    toggleHistory();
});

document.getElementById('btn-stop-study').addEventListener('click', () => {
    stopTimer(true);
    showView(null);
});
document.getElementById('btn-cancel-study').addEventListener('click', () => {
    stopTimer(false);
    showView(null);
});

document.getElementById('btn-stop-play').addEventListener('click', () => {
    stopTimer(true);
    showView(null);
});
document.getElementById('btn-cancel-play').addEventListener('click', () => {
    stopTimer(false);
    showView(null);
});

// Start the app
init();
