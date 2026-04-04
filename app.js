// State management
let state = {
  balance: 0,
  dailyLimit: 3600,
  history: [],
};

let activeTimer = null;
let timerInterval = null;
let startTime = null;
let startMs = null;

// DOM Elements (Cached)
const elements = {
  balanceDisplay: document.getElementById("balance-display"),
  negativeWarning: document.getElementById("negative-warning"),
  studyTimerDisplay: document.getElementById("study-timer"),
  playTimerDisplay: document.getElementById("play-timer"),
  remainingDailyDisplay: document.getElementById("remaining-daily"),
  historyBody: document.getElementById("history-body"),
  btnShowHistory: document.getElementById("btn-show-history"),
  studyView: document.getElementById("study-view"),
  playView: document.getElementById("play-view"),
  historyView: document.getElementById("history-view"),
  btnShowStudy: document.getElementById("btn-show-study"),
  btnShowPlay: document.getElementById("btn-show-play"),
  btnStopStudy: document.getElementById("btn-stop-study"),
  btnCancelStudy: document.getElementById("btn-cancel-study"),
  btnStopPlay: document.getElementById("btn-stop-play"),
  btnCancelPlay: document.getElementById("btn-cancel-play"),
};

// Initial Load
function init() {
  const savedData = localStorage.getItem("learnPlayTime");
  if (savedData) {
    state = JSON.parse(savedData);
  }

  // Register Event Listeners once
  setupEventListeners();

  updateUI();
}

// Data Persistence
function saveState() {
  localStorage.setItem("learnPlayTime", JSON.stringify(state));
}

// Formatting
function formatTime(totalSeconds) {
  const isNegative = totalSeconds < 0;
  const absSeconds = Math.abs(totalSeconds);
  const h = Math.floor(absSeconds / 3600);
  const m = Math.floor((absSeconds % 3600) / 60);
  const s = absSeconds % 60;

  const timeStr = [h, m, s].map((v) => (v < 10 ? "0" + v : v)).join(":");

  return (isNegative ? "-" : "") + timeStr;
}

function getLocalDateString(date) {
  return new Date(date).toLocaleDateString("sv");
}

function getPlayTimeToday() {
  const today = getLocalDateString(new Date());
  return state.history
    .filter(
      (entry) =>
        entry.type === "play" && getLocalDateString(entry.start) === today,
    )
    .reduce((sum, entry) => sum + entry.seconds, 0);
}

function updateUI() {
  elements.balanceDisplay.textContent = formatTime(state.balance);

  if (state.balance < 0) {
    elements.negativeWarning.classList.remove("hidden");
  } else {
    elements.negativeWarning.classList.add("hidden");
  }

  // Daily remaining
  const playToday = getPlayTimeToday();
  const currentPlaySeconds = activeTimer === "play" ? Math.round((Date.now() - startMs) / 1000) : 0;
  const remaining = Math.max(0, state.dailyLimit - (playToday + currentPlaySeconds));
  elements.remainingDailyDisplay.textContent = formatTime(remaining).replace(/^-/, "");

  // Auto-stop if limit reached
  if (activeTimer === "play" && remaining <= 0) {
    stopTimer(true);
    showView(null);
    alert("Tageslimit erreicht! Zeit für heute ist um.");
  }

  // Only update history table if it's currently visible
  if (!elements.historyView.classList.contains("hidden")) {
    updateHistoryTable();
  }
}

function updateHistoryTable() {
  elements.historyBody.innerHTML = "";

  // Use a fragment for batch DOM updates
  const fragment = document.createDocumentFragment();

  [...state.history].reverse().forEach((entry) => {
    const row = document.createElement("tr");
    const date = new Date(entry.start).toLocaleString("de-DE", {
      day: "2-digit",
      month: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });

    row.innerHTML = `
            <td>${entry.type === "study" ? "📚 Lernen" : "🎮 Spielen"}</td>
            <td>${formatTime(entry.seconds).replace(/^-/, "")}</td>
            <td>${date}</td>
        `;
    fragment.appendChild(row);
  });

  elements.historyBody.appendChild(fragment);
}

// Timer Logic
function refreshTimerDisplay() {
  if (startMs === null) return;
  const elapsed = Math.round((Date.now() - startMs) / 1000);
  const display = activeTimer === "study" ? elements.studyTimerDisplay : elements.playTimerDisplay;
  display.textContent = formatTime(elapsed).replace(/^-/, "");
  if (activeTimer === "play") {
    updateUI();
  }
}

function startTimer(type) {
  if (timerInterval) stopTimer(false); // Should not happen with view logic but for safety

  activeTimer = type;
  startMs = Date.now();
  startTime = new Date(startMs).toISOString();

  const display = type === "study" ? elements.studyTimerDisplay : elements.playTimerDisplay;
  display.textContent = "00:00:00";

  timerInterval = setInterval(refreshTimerDisplay, 1000);
  document.addEventListener("visibilitychange", onVisibilityChange);
}

function onVisibilityChange() {
  if (document.visibilityState === "visible" && timerInterval && startMs !== null) {
    refreshTimerDisplay();
  }
}

function stopTimer(shouldSave) {
  clearInterval(timerInterval);
  timerInterval = null;
  document.removeEventListener("visibilitychange", onVisibilityChange);

  const type = activeTimer;
  const savedStartMs = startMs;
  activeTimer = null;
  startMs = null;
  startTime = null;

  if (shouldSave && savedStartMs !== null) {
    const elapsed = Math.round((Date.now() - savedStartMs) / 1000);
    const endTime = new Date().toISOString();
    const entry = {
      type: type,
      seconds: elapsed,
      start: new Date(savedStartMs).toISOString(),
      end: endTime,
    };

    state.history.push(entry);

    if (type === "study") {
      state.balance += elapsed;
    } else {
      state.balance -= elapsed;
    }

    saveState();
    updateUI();
  }
}

// View Switching
function showView(view) {
  elements.studyView.classList.add("hidden");
  elements.playView.classList.add("hidden");
  if (view) {
    view.classList.remove("hidden");
  }
}

function toggleHistory() {
  const isShowing = !elements.historyView.classList.contains("hidden");

  if (isShowing) {
    elements.historyView.classList.add("hidden");
    elements.btnShowHistory.textContent = "Historie anzeigen";
  } else {
    elements.historyView.classList.remove("hidden");
    elements.btnShowHistory.textContent = "Historie ausblenden";
    updateHistoryTable();
  }
}

// Event Listeners
function setupEventListeners() {
  elements.btnShowStudy.addEventListener("click", () => {
    showView(elements.studyView);
    startTimer("study");
  });

  elements.btnShowPlay.addEventListener("click", () => {
    showView(elements.playView);
    startTimer("play");
  });

  elements.btnShowHistory.addEventListener("click", () => {
    toggleHistory();
  });

  elements.btnStopStudy.addEventListener("click", () => {
    stopTimer(true);
    showView(null);
  });

  elements.btnCancelStudy.addEventListener("click", () => {
    stopTimer(false);
    showView(null);
  });

  elements.btnStopPlay.addEventListener("click", () => {
    stopTimer(true);
    showView(null);
  });

  elements.btnCancelPlay.addEventListener("click", () => {
    stopTimer(false);
    showView(null);
  });
}

// Start the app
init();
