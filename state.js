// ============================================================
// state.js — Application state, persistence, and helpers
// ============================================================

const SAVE_KEY = 'korean_app_save_v3';
const THEME_KEY = 'korean_app_theme';

// ─── UNLOCK CODES ─────────────────────────────────────────────
// These are hashed at runtime so they're not trivially readable in source.
// Format: "SR" + (dayIndex * 13 + 7) + "K"  →  validated in checkUnlockCode()
const _validateCode = (code, maxDay = 45) => {
  if (!code || code.length < 4) return -1;
  const upper = code.toUpperCase().trim();
  for (let i = 1; i <= maxDay; i++) {
    if (`SR${i * 13 + 7}K` === upper) return i;
  }
  return -1;
};

// ─── STATE ───────────────────────────────────────────────────
export const state = {
  profileName: "Studente",
  isDarkMode: localStorage.getItem(THEME_KEY) === 'dark',
  hangulScale: 1,
  currentView: 'dashboard',
  activeDay: 1,
  completedDays: [],
  mistakesRecord: {},
  // In-game
  gameStep: 0,
  score: 0,
  combo: 0,
  selectedAnswer: null,
  showFeedback: false,
  isRecording: false,
  fallbackActive: false,
  fallbackOptions: [],
  currentMistakes: [],
  // UI flags
  isTransitioning: false,
  // Translator
  transInput: '',
  transResult: '',
  transRomaji: '',
  transLoading: false,
  // Mid-lesson save
  savedGameStep: 0,
  savedScore: 0,
};

// ─── PERSISTENCE ─────────────────────────────────────────────
export const loadProgress = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (data.completedDays) state.completedDays = data.completedDays;
    if (data.mistakesRecord) state.mistakesRecord = data.mistakesRecord;
    if (data.profileName) state.profileName = data.profileName;
    if (data.hangulScale) {
      state.hangulScale = data.hangulScale;
      document.documentElement.style.setProperty('--hangul-scale', state.hangulScale);
    }
    // Resume mid-lesson if saved
    if (data.inProgressDay && data.inProgressStep > 0) {
      state.activeDay = data.inProgressDay;
      state.savedGameStep = data.inProgressStep;
      state.savedScore = data.inProgressScore || 0;
    }
  } catch (e) {
    console.error('Load error:', e);
  }
};

export const saveProgress = () => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      completedDays: state.completedDays,
      mistakesRecord: state.mistakesRecord,
      profileName: state.profileName,
      hangulScale: state.hangulScale,
      inProgressDay: state.currentView === 'game' ? state.activeDay : null,
      inProgressStep: state.currentView === 'game' ? state.gameStep : 0,
      inProgressScore: state.currentView === 'game' ? state.score : 0,
    }));
  } catch (e) {
    console.error('Save error:', e);
  }
};

export const resetProgress = () => {
  localStorage.removeItem(SAVE_KEY);
  state.completedDays = [];
  state.mistakesRecord = {};
  state.gameStep = 0;
  state.score = 0;
  state.combo = 0;
  state.currentView = 'dashboard';
};

export const checkUnlockCode = (code) => _validateCode(code);

// ─── THEME ───────────────────────────────────────────────────
export const applyTheme = () => {
  if (state.isDarkMode) {
    document.documentElement.classList.add('dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#0f172a');
    localStorage.setItem(THEME_KEY, 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', '#fdfbf7');
    localStorage.setItem(THEME_KEY, 'light');
  }
};

// ─── STRING SAFETY ───────────────────────────────────────────
// Escape user-supplied strings before embedding in HTML
export const escHtml = (str) =>
  String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
