// ============================================================
// app.js — Main application controller
// ============================================================
import { state, loadProgress, saveProgress, resetProgress, checkUnlockCode, applyTheme, escHtml } from './state.js';
import { haptic, showToast, playAudio, translateToKorean } from './helpers.js';
import { getDay } from './course.js';
import { MAP_REGIONS } from './data.js';
import {
  renderNav, renderDashboard, renderTheory, renderGame,
  renderResult, renderLibrary, renderExplore, renderProfile
} from './render.js';

let myMap = null;
let speechTimeout = null;
let touchstartX = 0;

// ─── RENDER ──────────────────────────────────────────────────
const renderApp = () => {
  const root = document.getElementById('root');

  if (state.isTransitioning) {
    root.innerHTML = `
      <div class="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-[10000] flex items-center justify-center animate-fadein">
        <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col items-center">
          <div class="w-12 h-12 border-4 border-pink-500 border-t-transparent rounded-full animate-spin mb-3" role="status" aria-label="Caricamento"></div>
          <span class="font-black text-gray-600 dark:text-gray-300 tracking-widest uppercase text-xs">Caricamento</span>
        </div>
      </div>`;
    lucide.createIcons();
    return;
  }

  let content = '';
  if (state.currentView === 'dashboard') content = renderDashboard();
  else if (state.currentView === 'theory') content = renderTheory();
  else if (state.currentView === 'game') content = renderGame();
  else if (state.currentView === 'result') content = renderResult();
  else if (state.currentView === 'library') content = renderLibrary();
  else if (state.currentView === 'explore') content = renderExplore(state.completedDays);
  else if (state.currentView === 'profile') content = renderProfile();

  const safeProfileName = escHtml(state.profileName);

  root.innerHTML = `
    <header class="app-top-bar w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 z-[9000] flex-shrink-0 pt-safe transition-colors" role="banner">
      <div class="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center">
        <div class="font-black text-pink-500 text-lg flex items-center gap-2">
          <i data-lucide="sparkles" class="w-5 h-5" aria-hidden="true"></i>
          <span class="hidden sm:inline">Annyeong, ${safeProfileName}!</span>
          <span class="sm:hidden">Learn Korean 🌸</span>
        </div>
        <button onclick="window.app.toggleDarkMode()" class="p-2.5 rounded-full bg-gray-50 dark:bg-slate-800 shadow-sm border border-gray-200 dark:border-slate-700 transition-transform hover:scale-110 active:scale-95 flex items-center justify-center"
          aria-label="${state.isDarkMode ? 'Attiva modalità chiara' : 'Attiva modalità scura'}">
          <i data-lucide="${state.isDarkMode ? 'moon' : 'sun'}" class="w-5 h-5 ${state.isDarkMode ? 'text-blue-300' : 'text-yellow-500'}" aria-hidden="true"></i>
        </button>
      </div>
    </header>

    <main class="flex-1 overflow-y-auto overscroll-y-contain w-full pb-20 md:pb-0 hide-scroll bg-transparent" 
      id="main-content"
      ontouchstart="window.app.handleTouchStart(event)" 
      ontouchend="window.app.handleTouchEnd(event)"
      role="main">
      <div class="max-w-[100vw] mx-auto p-4 md:p-8 w-full relative animate-fadein">
        ${content}
      </div>
    </main>
    ${renderNav()}
  `;

  lucide.createIcons();

  if (state.currentView === 'explore') {
    setTimeout(initMap, 80);
  }
  // Auto-save mid-lesson progress
  if (state.currentView === 'game') {
    saveProgress();
  }
};

// ─── TRANSITIONS ─────────────────────────────────────────────
const transition = (fn, delay = 250) => {
  haptic(20);
  state.isTransitioning = true;
  renderApp();
  setTimeout(() => {
    fn();
    state.isTransitioning = false;
    renderApp();
  }, delay);
};

// ─── PUBLIC API (window.app) ─────────────────────────────────
window.app = {
  haptic,
  playAudio,

  toggleDarkMode: () => {
    haptic(20);
    state.isDarkMode = !state.isDarkMode;
    applyTheme();
    renderApp();
  },

  updateHangulSize: (val) => {
    state.hangulScale = parseFloat(val);
    document.documentElement.style.setProperty('--hangul-scale', state.hangulScale);
    saveProgress();
  },

  updateProfileName: (val) => {
    // Sanitize: strip HTML tags, limit length
    state.profileName = String(val).replace(/<[^>]*>/g, '').slice(0, 30);
    saveProgress();
    // Update header greeting without full re-render
    const span = document.querySelector('.app-top-bar .hidden.sm\\:inline');
    if (span) span.textContent = `Annyeong, ${state.profileName}!`;
  },

  updateTransInput: (val) => {
    state.transInput = val;
  },

  changeView: (view) => {
    transition(() => { state.currentView = view; });
  },

  startDay: (dayNum) => {
    haptic(40);
    transition(() => {
      state.activeDay = dayNum;
      state.currentView = 'theory';
      state.gameStep = 0;
      state.score = 0;
      state.combo = 0;
      state.selectedAnswer = null;
      state.showFeedback = false;
      state.fallbackActive = false;
      state.currentMistakes = [];
      // Resume mid-lesson if applicable
      if (state.savedGameStep > 0 && state.activeDay === dayNum) {
        if (confirm(`Riprendi dal punto ${state.savedGameStep + 1} dove avevi lasciato?`)) {
          state.currentView = 'game';
          state.gameStep = state.savedGameStep;
          state.score = state.savedScore;
        }
        state.savedGameStep = 0;
        state.savedScore = 0;
      }
    });
  },

  startGame: () => {
    haptic(40);
    transition(() => { state.currentView = 'game'; });
  },

  handleMultipleChoiceAnswer: (index) => {
    if (state.showFeedback) return;
    const exercise = getDay(state.activeDay).exercises[state.gameStep];
    if (exercise.optionsHangul?.[index]) playAudio(exercise.optionsHangul[index]);
    state.selectedAnswer = index;
    state.showFeedback = true;
    if (index === exercise.answer) {
      state.score++;
      state.combo++;
      haptic([30, 50, 30]);
    } else {
      state.combo = 0;
      state.currentMistakes.push(exercise.conceptTag);
      haptic(100);
    }
    saveProgress(); // auto-save after each answer
    renderApp();
  },

  triggerSpeechFallback: () => {
    haptic();
    if (speechTimeout) clearTimeout(speechTimeout);
    state.isRecording = false;
    state.fallbackActive = true;
    const ex = getDay(state.activeDay).exercises[state.gameStep];
    const correct = ex.expectedRomaji[0];
    // Use real vocabulary from other days as distractors (not algorithmically mangled)
    const distractors = getDay(state.activeDay).speechFallbackOptions || ['mollayo', 'gamsahamnida'];
    const options = [correct, ...distractors.slice(0, 2)];
    state.fallbackOptions = options.sort(() => Math.random() - 0.5);
    renderApp();
  },

  handleFallbackAnswer: (index) => {
    if (state.showFeedback) return;
    const ex = getDay(state.activeDay).exercises[state.gameStep];
    const correct = ex.expectedRomaji[0];
    const isCorrect = state.fallbackOptions[index] === correct;
    if (isCorrect) {
      playAudio(ex.expectedHangul[0]);
      state.selectedAnswer = true;
      state.score++;
      state.combo++;
      haptic([30, 50, 30]);
      ex.feedback_incorrect = "Bravissima! Hai riconosciuto la pronuncia esatta.";
    } else {
      state.selectedAnswer = false;
      state.combo = 0;
      state.currentMistakes.push(ex.conceptTag);
      haptic(100);
      ex.feedback_incorrect = `La romanizzazione corretta era: "${correct}". Ascoltala bene!`;
    }
    state.showFeedback = true;
    saveProgress();
    renderApp();
  },

  handleSpeechRecognition: (e) => {
    if (e) e.preventDefault();
    if (state.selectedAnswer !== null || state.isRecording) return;
    haptic(50);
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { window.app.triggerSpeechFallback(); return; }
    const recognition = new SR();
    recognition.lang = 'ko-KR';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;
    state.isRecording = true;
    renderApp();
    speechTimeout = setTimeout(() => {
      if (state.isRecording) { recognition.stop(); window.app.triggerSpeechFallback(); }
    }, 7000);
    recognition.onresult = (event) => {
      clearTimeout(speechTimeout);
      state.isRecording = false;
      const raw = event.results[0][0].transcript;
      const clean = raw.toLowerCase().trim().replace(/[.,!?。、！？\s~]/g, '');
      const ex = getDay(state.activeDay).exercises[state.gameStep];
      const matchH = ex.expectedHangul.some(k => clean.includes(k.replace(/[.,!?。、！？\s~]/g, '')));
      const matchR = ex.expectedRomaji.some(r => clean.includes(r.replace(/[.,!?。、！？\s~]/g, '')));
      const isMatch = clean.length > 0 && (matchH || matchR);
      state.selectedAnswer = isMatch;
      state.showFeedback = true;
      if (isMatch) { state.score++; state.combo++; haptic([30, 50, 30]); }
      else { state.combo = 0; haptic(100); ex.feedback_incorrect = `Hai detto: "${raw}". Riprova scandendo bene!`; state.currentMistakes.push(ex.conceptTag); }
      saveProgress();
      renderApp();
    };
    recognition.onerror = (event) => {
      clearTimeout(speechTimeout);
      if (event.error === 'not-allowed' || event.error === 'no-speech') { window.app.triggerSpeechFallback(); }
      else { state.isRecording = false; state.showFeedback = true; state.selectedAnswer = false; state.combo = 0; renderApp(); }
    };
    try { recognition.start(); } catch { clearTimeout(speechTimeout); window.app.triggerSpeechFallback(); }
  },

  nextQuestion: () => {
    haptic(20);
    const lesson = getDay(state.activeDay);
    if (state.gameStep < lesson.exercises.length - 1) {
      state.gameStep++;
      state.selectedAnswer = null;
      state.showFeedback = false;
      state.fallbackActive = false;
      state.fallbackOptions = [];
      saveProgress();
    } else {
      // Lesson complete
      const newCompleted = state.completedDays.includes(state.activeDay)
        ? state.completedDays
        : [...state.completedDays, state.activeDay];
      const newMistakes = { ...state.mistakesRecord, [state.activeDay]: state.currentMistakes };
      state.completedDays = newCompleted;
      state.mistakesRecord = newMistakes;
      saveProgress();
      state.currentView = 'result';
      if (state.score === lesson.exercises.length && typeof confetti !== 'undefined') {
        setTimeout(() => {
          confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#f472b6','#60a5fa','#fcd34d'] });
          haptic([50, 50, 50, 50, 100]);
        }, 300);
      }
    }
    renderApp();
  },

  markRoleplayDone: (btn) => {
    haptic([50, 100, 50]);
    btn.textContent = '✓ Fatto!';
    btn.classList.add('bg-green-500', 'text-white', 'border-green-500');
    btn.disabled = true;
    showToast("Ottimo! Continua così, campionessa! 🌸");
  },

  unlockDayWithCode: (code) => {
    haptic();
    const dayIndex = checkUnlockCode(code);
    if (dayIndex > 0 && dayIndex <= 45) {
      if (!state.completedDays.includes(dayIndex)) {
        const newDays = [];
        for (let i = 1; i <= dayIndex; i++) newDays.push(i);
        // Keep previously completed days that are beyond dayIndex
        state.completedDays.forEach(d => { if (!newDays.includes(d)) newDays.push(d); });
        state.completedDays = newDays;
        saveProgress();
        showToast(`Livello ${dayIndex} sbloccato! Magia! ✨`);
        const input = document.getElementById('unlockCodeInput');
        if (input) input.value = '';
        renderApp();
      } else {
        showToast("Hai già sbloccato questo livello!", true);
      }
    } else {
      showToast("Codice non valido! Riprova.", true);
    }
  },

  handleSwitchAccount: () => {
    haptic([50, 100]);
    if (!confirm(`Vuoi davvero azzerare i tuoi progressi? Perderai tutto!`)) return;
    resetProgress();
    saveProgress();
    renderApp();
  },

  runTranslation: async () => {
    haptic();
    const inputEl = document.getElementById('transInput');
    const text = inputEl?.value?.trim();
    if (!text) return;
    state.transInput = text;
    state.transLoading = true;
    state.transResult = '';
    state.transRomaji = '';
    renderApp();
    try {
      const result = await translateToKorean(text);
      state.transResult = result.hangul || "Impossibile tradurre.";
      state.transRomaji = result.romaji;
    } catch (e) {
      state.transResult = "Errore di rete. Riprova.";
      showToast("Errore di rete durante la traduzione.", true);
    }
    state.transLoading = false;
    renderApp();
  },

  handleTouchStart: (e) => { touchstartX = e.changedTouches[0].screenX; },
  handleTouchEnd: (e) => {
    const dx = e.changedTouches[0].screenX - touchstartX;
    if (dx < -75 && state.currentView === 'game' && state.selectedAnswer !== null) window.app.nextQuestion();
    if (dx > 75 && state.currentView === 'game') { /* swipe right = no-op */ }
  },
};

// ─── MAP ─────────────────────────────────────────────────────
const initMap = () => {
  const container = document.getElementById('korea-map');
  if (!container) return;
  if (myMap) { myMap.remove(); myMap = null; }
  myMap = L.map('korea-map', { zoomControl: false, scrollWheelZoom: false }).setView([36.5, 127.5], 7);
  L.control.zoom({ position: 'topright' }).addTo(myMap);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
    className: 'map-tiles'
  }).addTo(myMap);

  const unlockedRegions = MAP_REGIONS.filter(r =>
    state.completedDays.includes(r.unlocksOnDay) || r.unlocksOnDay === 1
  );

  unlockedRegions.forEach(region => {
    const icon = L.divIcon({
      className: 'custom-map-icon',
      html: `<div style="display:flex;align-items:center;justify-content:center;width:44px;height:44px;background:white;border-radius:50%;box-shadow:0 10px 15px -3px rgba(0,0,0,.1);border:3px solid #f472b6;font-size:22px;">${region.icon}</div>`,
      iconSize: [44,44], iconAnchor: [22,22], popupAnchor: [0,-22]
    });
    const marker = L.marker([region.lat, region.lng], { icon }).addTo(myMap);
    // Safe popup — no user-controlled HTML injection
    const popupDiv = document.createElement('div');
    popupDiv.style.cssText = 'padding:0;text-align:center;min-width:240px';
    const img = document.createElement('img');
    img.src = region.image;
    img.alt = region.name;
    img.style.cssText = 'width:100%;height:128px;object-fit:cover;border-radius:12px 12px 0 0;';
    img.onerror = () => { img.src = 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&q=80'; };
    img.loading = 'lazy';
    const body = document.createElement('div');
    body.style.cssText = 'padding:12px';
    const h3 = document.createElement('h3');
    h3.textContent = region.name;
    h3.style.cssText = 'font-weight:900;font-size:1.1em;margin:0 0 6px';
    const desc = document.createElement('p');
    desc.textContent = region.desc;
    desc.style.cssText = 'font-size:.75em;font-weight:600;color:#555;margin:0 0 8px';
    const tags = document.createElement('div');
    tags.style.cssText = 'display:flex;flex-wrap:wrap;justify-content:center;gap:4px';
    region.keywords.forEach(kw => {
      const sp = document.createElement('span');
      sp.textContent = kw;
      sp.style.cssText = 'background:#eff6ff;color:#3b82f6;padding:2px 8px;border-radius:4px;font-size:.65em;font-weight:900;text-transform:uppercase';
      tags.appendChild(sp);
    });
    body.append(h3, desc, tags);
    popupDiv.append(img, body);
    marker.bindPopup(popupDiv);
  });
};

// ─── BOOT ────────────────────────────────────────────────────
const init = () => {
  applyTheme();
  loadProgress();
  renderApp();
};

init();
