/* ===== app.js — Sara Korean App Core Logic ===== */
'use strict';

/* ========= STATE ========= */

let state = {
  builderSelectedWords: [],
  builderAvailableWords: [],
  currentView: 'home',
  activeDay: null,
  gameStep: 0,
  score: 0,
  combo: 0,
  selectedAnswer: null,
  showFeedback: false,
  isRecording: false,
  fallbackActive: false,
  fallbackOptions: [],
  completedDays: [],
  mistakesRecord: {},
  streak: 0,
  xp: 0,
  profileName: "Sara",
  wotdIndex: null,
  isDarkMode: false,
  hangulScale: 1,
  mapUnlockSeen: [],
  newlyUnlockedLocation: null,
  isTransitioning: false,
  isAuthLoading: false,
  transResult: "",
  transRomaji: "",
  transLoading: false,
  currentMistakes: [],
  dictSearch: "",
  dictCategory: "all",
  showHomepage: true,
  unlockedBadges: [],
  wotdTimeLeft: 0,
  wotdTimerInterval: null,
  user: null
};

let myMap = null;
let speechTimeout = null;

/* ========= HELPERS ========= */
window.renderHangul = (text) => {
  if (!text) return text;
  return text.replace(/([\u3131-\uD79D]+)/g, match =>
    `<span class="korean-click hangul-display" onclick="window.playAudio(event,'${match}')" role="button" aria-label="Ascolta ${match}">${match}</span>`
  );
};

window.haptic = (pattern) => {
  if ('vibrate' in navigator) {
    if (Array.isArray(pattern)) navigator.vibrate(pattern);
    else navigator.vibrate(pattern || 10);
  }
};

const computeStreak = (days) => {
  if (!days || !days.length) return 0;
  const sorted = [...days].sort((a, b) => a - b);
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    if (sorted[i] === sorted[i-1] + 1) streak++;
    else break;
  }
  return streak;
};

const computeXP = (days, mistakes) => {
  let xp = 0;
  days.forEach(d => { xp += ((mistakes[d] || []).length === 0) ? 120 : 80; });
  return xp;
};

const getXPLevel = (xp) => {
  if (xp < 200) return { level: 1, title: "🌱 Principiante", next: 200 };
  if (xp < 500) return { level: 2, title: "🌸 Studente", next: 500 };
  if (xp < 1000) return { level: 3, title: "⚔️ Avventuriera", next: 1000 };
  if (xp < 2000) return { level: 4, title: "🎮 Semi-Pro", next: 2000 };
  if (xp < 3500) return { level: 5, title: "🏆 Esperta", next: 3500 };
  return { level: 6, title: "👑 Campionessa Coreana", next: null };
};

const checkNewBadges = () => {
  const newBadges = [];
  (window.BADGES || []).forEach(badge => {
    if (!state.unlockedBadges.includes(badge.id) && badge.condition(state)) {
      state.unlockedBadges.push(badge.id);
      newBadges.push(badge);
    }
  });
  return newBadges;
};

/* ========= ROME MIDNIGHT TIMER ========= */
const getRomeSecondsUntilMidnight = () => {
  const now = new Date();
  const rome = new Date(now.toLocaleString("en-US", { timeZone: "Europe/Rome" }));
  const midnight = new Date(rome);
  midnight.setHours(24, 0, 0, 0);
  return Math.round((midnight - rome) / 1000);
};

const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;
};

const startWotdTimer = () => {
  if (state.wotdTimerInterval) clearInterval(state.wotdTimerInterval);
  state.wotdTimeLeft = getRomeSecondsUntilMidnight();
  state.wotdTimerInterval = setInterval(() => {
    state.wotdTimeLeft = Math.max(0, state.wotdTimeLeft - 1);
    const el = document.getElementById('wotd-timer');
    if (el) {
      const total = 86400;
      const pct = (state.wotdTimeLeft / total) * 100;
      el.textContent = formatTime(state.wotdTimeLeft);
      const bar = document.getElementById('wotd-timer-bar');
      if (bar) bar.style.width = pct + '%';
    }
    if (state.wotdTimeLeft === 0) {
      clearInterval(state.wotdTimerInterval);
      // Refresh WOTD
      const dayOfYear = Math.floor(Date.now() / 86400000);
      state.wotdIndex = dayOfYear % (window.WOTD_POOL || []).length;
      renderApp();
    }
  }, 1000);
};

/* ========= LOCALSTORAGE ========= */
const SAVE_KEY = 'sara_korean_save_v4';

const saveProgress = () => {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify({
      completedDays: state.completedDays,
      mistakesRecord: state.mistakesRecord,
      profileName: state.profileName,
      hangulScale: state.hangulScale,
      mapUnlockSeen: state.mapUnlockSeen,
      isDarkMode: state.isDarkMode,
      unlockedBadges: state.unlockedBadges,
      version: window.APP_VERSION
    }));
  } catch(e) { console.warn("Save error", e); }
};

const loadProgress = () => {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (raw) {
      const data = JSON.parse(raw);
      state.completedDays = data.completedDays || [];
      state.mistakesRecord = data.mistakesRecord || {};
      if (data.profileName) state.profileName = data.profileName;
      if (data.hangulScale) {
        state.hangulScale = data.hangulScale;
        document.documentElement.style.setProperty('--hangul-scale', state.hangulScale);
      }
      state.mapUnlockSeen = data.mapUnlockSeen || [];
      state.isDarkMode = data.isDarkMode || false;
      state.unlockedBadges = data.unlockedBadges || [];
      // Always show homepage on app start (don't restore from save)
    }
    // Check for old save keys and migrate
    const oldKeys = ['sara_korean_save_v3', 'sara_korean_save_v2'];
    if (!raw) {
      for (const k of oldKeys) {
        const old = localStorage.getItem(k);
        if (old) {
          const d = JSON.parse(old);
          state.completedDays = d.completedDays || [];
          state.mistakesRecord = d.mistakesRecord || {};
          if (d.profileName) state.profileName = d.profileName;
          break;
        }
      }
    }
    state.streak = computeStreak(state.completedDays);
    state.xp = computeXP(state.completedDays, state.mistakesRecord);
    const dayOfYear = Math.floor(Date.now() / 86400000);
    state.wotdIndex = dayOfYear % (window.WOTD_POOL || []).length;
    if (state.isDarkMode) document.documentElement.classList.add('dark');
  } catch(e) { console.warn("Load error", e); }
};

/* ========= TOAST ========= */
window.showToast = (msg, isError = false, isSuccess = false) => {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const toast = document.createElement('div');
  const bg = isError ? 'bg-red-500' : isSuccess ? 'bg-green-500' : 'bg-gray-800';
  const icon = isError ? '⚠️' : isSuccess ? '✅' : 'ℹ️';
  toast.className = `toast ${bg} text-white`;
  toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translate(-50%, -20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
};

/* ========= AUDIO / SPEECH SYNTHESIS ========= */
window.playAudio = (e, text) => {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  if (!text || !window.speechSynthesis) {
    window.showToast("Audio non supportato dal browser.", true);
    return;
  }
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.85;
  utterance.pitch = 1.0;
  const trySpeak = () => {
    const voices = window.speechSynthesis.getVoices();
    const koVoices = voices.filter(v => v.lang.startsWith('ko'));
    if (koVoices.length > 0) {
      // Priority: Google Korean > named female > first available
      let best = koVoices.find(v => /Google.*Korean|Korean.*Google/i.test(v.name));
      if (!best) best = koVoices.find(v => /Yuna|Somi|Female|여성/i.test(v.name));
      if (!best) best = koVoices[0];
      utterance.voice = best;
    }
    window.speechSynthesis.speak(utterance);
  };
  if (window.speechSynthesis.getVoices().length === 0) {
    window.speechSynthesis.onvoiceschanged = trySpeak;
  } else {
    trySpeak();
  }
};

/* ========= TRANSLATOR WITH FORMALITY DETECTION ========= */
window.runTranslation = async () => {
  window.haptic();
  const inputEl = document.getElementById('transInput');
  if (!inputEl || !inputEl.value.trim()) return;
  const text = inputEl.value.trim();
  state.transLoading = true;
  state.transResult = "Traducendo...";
  state.transRomaji = "";
  renderApp();
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=ko&dt=t&dt=rm&q=${encodeURIComponent(text)}`;
    const res = await fetch(url);
    const data = await res.json();
    let koText = "";
    let romajiText = "";
    if (data && data[0]) {
      data[0].forEach(item => {
        if (item[0] && typeof item[0] === 'string' && item[0] !== "null") koText += item[0];
        if (item[2] && typeof item[2] === 'string') romajiText += item[2];
        else if (item[3] && typeof item[3] === 'string') romajiText += item[3];
      });
      if (!romajiText && data[0].length > 1) {
        const last = data[0][data[0].length - 1];
        if (last && typeof last[2] === 'string') romajiText = last[2];
      }
      state.transResult = koText || "Impossibile tradurre.";
      state.transRomaji = romajiText ? romajiText.trim() : "";
    }
  } catch(e) {
    state.transResult = "Errore di rete. Riprova.";
    window.showToast("Errore di rete durante la traduzione.", true);
  }
  state.transLoading = false;
  renderApp();
};

// Detect formality from Korean text
const detectFormality = (text) => {
  if (!text) return null;
  if (/습니다|십니다|이십니다|하십니다/.test(text)) return 'formal';
  if (/아요|어요|예요|이에요|해요/.test(text)) return 'polite';
  if (/야|아|어|해|지|나|라/.test(text)) return 'informal';
  return 'neutral';
};

/* ========= MAP ========= */
window.initMap = () => {
  const container = document.getElementById('korea-map');
  if (!container) return;
  if (myMap) { myMap.remove(); myMap = null; }
  myMap = L.map('korea-map', { zoomControl: false, scrollWheelZoom: false }).setView([36.5, 127.5], 7);
  L.control.zoom({ position: 'topright' }).addTo(myMap);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap', className: 'map-tiles'
  }).addTo(myMap);

  (window.MAP_REGIONS || []).forEach(region => {
    const isUnlocked = state.completedDays.includes(region.unlocksAtDay);
    const isNew = state.newlyUnlockedLocation && state.newlyUnlockedLocation.name === region.name;
    const borderColor = isNew ? '#4ade80' : (isUnlocked ? '#f472b6' : '#d1d5db');
    const iconHtml = isUnlocked
      ? `<div class="${isNew ? 'unlock-glow' : (isUnlocked ? 'animate-bounce-slow' : '')} border-4" style="border-color:${borderColor}">${region.icon}</div>`
      : `<div class="border-4" style="border-color:${borderColor}">🔒</div>`;
    const icon = L.divIcon({ className: 'custom-map-icon', html: iconHtml, iconSize: [44, 44], iconAnchor: [22, 22], popupAnchor: [0, -25] });
    const marker = L.marker([region.lat, region.lng], { icon }).addTo(myMap);
    if (isUnlocked) {
      marker.bindPopup(`
        <div class="p-0 text-center min-w-[260px]">
          <img src="${region.image}" alt="${region.name}" class="w-full h-32 object-cover rounded-t-xl" onerror="this.src='https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400&q=80'" loading="lazy" />
          <div class="px-3 pb-3">
            <h3 class="font-black text-lg mt-2 mb-1">${region.name}</h3>
            <p class="text-xs text-gray-600 mb-2">${region.desc.substring(0, 80)}...</p>
            <div class="flex flex-wrap gap-1 mb-2 justify-center">
              ${region.keywords.map(kw => `<span class="bg-pink-50 text-pink-600 px-2 py-0.5 rounded text-[10px] font-bold">${kw}</span>`).join('')}
            </div>
            ${region.phrases ? region.phrases.slice(0,2).map(ph => `
              <div class="flex items-center gap-2 mb-1 bg-gray-50 rounded-lg p-1.5">
                <div class="text-left flex-1">
                  <p class="text-sm font-black" style="font-family:'Noto Sans KR'">${ph.hangul}</p>
                  <p class="text-[10px] text-blue-500">${ph.romaji} — ${ph.eng}</p>
                </div>
                <button onclick="window.playAudio(event,'${ph.hangul}')" class="p-1.5 bg-pink-100 text-pink-600 rounded-full text-xs">🔊</button>
              </div>
            `).join('') : ''}
          </div>
        </div>
      `);
    } else {
      marker.bindPopup(`
        <div class="p-4 text-center min-w-[200px]">
          <div class="text-3xl mb-2">🔒</div>
          <h3 class="font-black text-base mb-1">${region.name}</h3>
          <p class="text-xs text-gray-500 mb-2">${region.desc.substring(0, 60)}...</p>
          <p class="text-xs font-black text-pink-600 bg-pink-50 px-3 py-2 rounded-xl">Completa il Giorno ${region.unlocksAtDay}</p>
        </div>
      `);
    }
  });
};

/* ========= VIEW TRANSITIONS ========= */
window.changeView = (view) => {
  window.haptic(20);
  state.isTransitioning = true;
  renderApp();
  setTimeout(() => {
    state.currentView = view;
    state.isTransitioning = false;
    renderApp();
  }, 250);
};

window.startDay = (dayNum) => {
  window.haptic(40);
  state.isTransitioning = true;
  renderApp();
  setTimeout(() => {
    state.activeDay = dayNum;
    state.currentView = 'theory';
    state.gameStep = 0; state.score = 0; state.combo = 0;
    state.selectedAnswer = null; state.showFeedback = false;
    state.fallbackActive = false; state.currentMistakes = [];
	state.builderSelectedWords = [];
    state.builderAvailableWords = [];
    state.isTransitioning = false;
    renderApp();
  }, 250);
};

window.startGame = () => {
  state.isTransitioning = true;
  renderApp();
  setTimeout(() => {
    state.currentView = 'game';
    state.isTransitioning = false;
    renderApp();
  }, 250);
};

/* ========= EXERCISE HANDLERS ========= */
window.handleMultipleChoiceAnswer = (index) => {
  if (state.showFeedback) return;
  const ex = window.COURSE_DATA.find(d => d.day === state.activeDay).exercises[state.gameStep];
  if (ex.optionsHangul && ex.optionsHangul[index]) window.playAudio(null, ex.optionsHangul[index]);
  state.selectedAnswer = index;
  state.showFeedback = true;
  if (index === ex.answer) {
    state.score++; state.combo++;
    window.haptic([30, 50, 30]);
    if (state.combo >= 3) window.showToast(`🔥 Combo x${state.combo}!`);
  } else {
    state.combo = 0;
    state.currentMistakes.push(ex.conceptTag);
    window.haptic(100);
  }
  renderApp();
};

window.triggerSpeechFallback = () => {
  window.haptic();
  if (speechTimeout) clearTimeout(speechTimeout);
  state.isRecording = false;
  state.fallbackActive = true;
  const ex = window.COURSE_DATA.find(d => d.day === state.activeDay).exercises[state.gameStep];
  const correct = ex.expectedRomaji[0];
  const opt1 = correct.replace(/[aeiou]/g, m => ({a:'e',e:'i',i:'o',o:'u',u:'a'})[m] || m);
  const opt2 = correct.replace(/k|g|t|d|p|b/g, m => ({k:'g',g:'k',t:'d',d:'t',p:'b',b:'p'})[m] || m);
  state.fallbackOptions = [correct, opt1, opt2].sort(() => Math.random() - 0.5);
  renderApp();
};

window.handleFallbackAnswer = (index) => {
  if (state.showFeedback) return;
  const ex = window.COURSE_DATA.find(d => d.day === state.activeDay).exercises[state.gameStep];
  const correct = ex.expectedRomaji[0];
  const isCorrect = state.fallbackOptions[index] === correct;
  if (isCorrect) {
    window.playAudio(null, ex.expectedHangul[0]);
    state.selectedAnswer = true; state.score++; state.combo++;
    state.showFeedback = true;
    window.haptic([30, 50, 30]);
    ex._fb = "Ottima scelta! Ascolta come si pronuncia correttamente.";
  } else {
    state.selectedAnswer = false; state.combo = 0;
    state.currentMistakes.push(ex.conceptTag);
    state.showFeedback = true;
    window.haptic(100);
    ex._fb = `Quella non era la pronuncia esatta. La romanizzazione corretta era: "${correct}". Ascoltala bene!`;
  }
  renderApp();
};

window.handleSpeechRecognition = (e) => {
  if (e) e.preventDefault();
  if (state.selectedAnswer !== null || state.isRecording) return;
  window.haptic(50);
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) { window.triggerSpeechFallback(); return; }
  const recognition = new SR();
  recognition.lang = 'ko-KR';
  recognition.interimResults = false;
  recognition.maxAlternatives = 3;
  recognition.continuous = false;
  state.isRecording = true;
  renderApp();
  speechTimeout = setTimeout(() => {
    if (state.isRecording) { recognition.stop(); window.triggerSpeechFallback(); }
  }, 8000);
  recognition.onresult = (event) => {
    clearTimeout(speechTimeout);
    state.isRecording = false;
    const ex = window.COURSE_DATA.find(d => d.day === state.activeDay).exercises[state.gameStep];
    let isMatch = false;
    for (let r = 0; r < event.results[0].length; r++) {
      const raw = event.results[0][r].transcript.toLowerCase().trim();
      const clean = raw.replace(/[.,!?。、！？\s~]/g, '');
      if (ex.expectedHangul.some(k => clean.includes(k.replace(/\s/g, '')))) { isMatch = true; break; }
      if (ex.expectedRomaji.some(r2 => clean.includes(r2.replace(/\s/g, '')))) { isMatch = true; break; }
    }
    const rawTranscript = event.results[0][0].transcript;
    state.selectedAnswer = isMatch;
    state.showFeedback = true;
    if (isMatch) { state.score++; state.combo++; window.haptic([30, 50, 30]); }
    else {
      state.combo = 0;
      ex.feedback_incorrect = `Hai detto: "${rawTranscript}". Non ti ho capito bene, riprova scandendo ogni sillaba!`;
      state.currentMistakes.push(ex.conceptTag);
      window.haptic(100);
    }
    renderApp();
  };
  recognition.onerror = (ev) => {
    clearTimeout(speechTimeout);
    state.isRecording = false;
    if (ev.error === 'not-allowed') window.showToast("Accesso al microfono negato.", true);
    else window.triggerSpeechFallback();
  };
  recognition.onend = () => { if (state.isRecording) { state.isRecording = false; window.triggerSpeechFallback(); } };
  recognition.start();
};

window.nextQuestion = () => {
  window.haptic(20);
  const lesson = window.COURSE_DATA.find(d => d.day === state.activeDay);
  if (state.gameStep >= lesson.exercises.length - 1) {
    // Complete lesson
    const prevDays = [...state.completedDays];
    if (!state.completedDays.includes(state.activeDay)) {
      state.completedDays.push(state.activeDay);
      state.completedDays.sort((a,b) => a - b);
    }
    if (state.currentMistakes.length > 0) {
      state.mistakesRecord[state.activeDay] = state.currentMistakes;
    } else {
      delete state.mistakesRecord[state.activeDay];
    }
    state.streak = computeStreak(state.completedDays);
    state.xp = computeXP(state.completedDays, state.mistakesRecord);
    // Check map unlocks
    const newUnlocks = (window.MAP_REGIONS || []).filter(r =>
      state.completedDays.includes(r.unlocksAtDay) && !prevDays.includes(r.unlocksAtDay)
    );
    if (newUnlocks.length > 0) state.newlyUnlockedLocation = newUnlocks[0];
    else state.newlyUnlockedLocation = null;
    // Check badges
    const newBadges = checkNewBadges();
    saveProgress();
    markStudySession();
    state.currentView = 'result';
    state.isTransitioning = false;
    renderApp();
    if (newBadges.length > 0) {
      setTimeout(() => {
        newBadges.forEach((b, i) => {
          setTimeout(() => window.showToast(`${b.icon} Badge sbloccato: ${b.name}!`, false, true), i * 1500);
        });
      }, 1000);
    }
  } else {
    state.gameStep++;
    state.selectedAnswer = null;
    state.showFeedback = false;
    state.fallbackActive = false;
	state.builderSelectedWords = [];
    state.builderAvailableWords = [];
    renderApp();
  }
};

/* ========= DARK MODE ========= */
window.toggleDarkMode = () => {
  state.isDarkMode = !state.isDarkMode;
  document.documentElement.classList.toggle('dark', state.isDarkMode);
  saveProgress();
  renderApp();
};

/* ========= PROFILE ACTIONS ========= */
window.updateProfileName = (val) => {
  state.profileName = val || "Sara";
  saveProgress();
};

window.updateHangulSize = (val) => {
  state.hangulScale = parseFloat(val);
  document.documentElement.style.setProperty('--hangul-scale', state.hangulScale);
  saveProgress();
};

window.handleSwitchAccount = () => {
  if (!confirm(`Sei sicura di voler resettare tutto il progresso di ${state.profileName}? Questa azione è irreversibile!`)) return;
  state.completedDays = [];
  state.mistakesRecord = {};
  state.unlockedBadges = [];
  state.streak = 0; state.xp = 0;
  saveProgress();
  window.showToast("Progresso resettato.", false, true);
  renderApp();
};

window.enterApp = () => {
  state.showHomepage = false;
  state.currentView = 'dashboard';
  renderApp();
};

/* ========= SWIPE NAVIGATION ========= */
let touchStartX = 0, touchStartY = 0;
window.handleTouchStart = (e) => {
  touchStartX = e.touches[0].clientX;
  touchStartY = e.touches[0].clientY;
};
window.handleTouchEnd = (e) => {
  const dx = e.changedTouches[0].clientX - touchStartX;
  const dy = e.changedTouches[0].clientY - touchStartY;
  if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 60) {
    const views = ['dashboard', 'explore', 'library', 'profile'];
    const idx = views.indexOf(state.currentView);
    if (dx < 0 && idx < views.length - 1) window.changeView(views[idx + 1]);
    else if (dx > 0 && idx > 0) window.changeView(views[idx - 1]);
  }
};

/* ========= DICT SEARCH ========= */
window.updateDictSearch = (val) => {
  state.dictSearch = val;
  renderDictContent();
};

window.updateDictCategory = (val) => {
  state.dictCategory = val;
  
  // Aggiorna visivamente i colori dei bottoni
  document.querySelectorAll('.dict-cat-btn').forEach(btn => {
    if (btn.dataset.cat === val) {
      btn.className = "dict-cat-btn shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-all outline-none bg-pink-500 text-white shadow-md";
    } else {
      btn.className = "dict-cat-btn shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-all outline-none bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-slate-600";
    }
  });
  
  renderDictContent();
};

const renderDictContent = () => {
  const container = document.getElementById('dict-content');
  if (!container) return;
  container.innerHTML = buildDictHtml();
  lucide.createIcons();
};

const buildDictHtml = () => {
  const search = state.dictSearch.toLowerCase();
  const cat = state.dictCategory;
  let html = '';
  (window.DICTIONARY || []).forEach(section => {
    if (cat !== 'all' && section.category !== cat) return;
    const filtered = section.words.filter(w =>
      !search ||
      w.hangul.includes(state.dictSearch) ||
      w.romaji.toLowerCase().includes(search) ||
      w.eng.toLowerCase().includes(search)
    );
    if (filtered.length === 0) return;
    html += `
      <div class="mb-6">
        <h3 class="font-black text-gray-800 dark:text-gray-200 text-sm uppercase tracking-widest mb-3 flex items-center gap-2">
          <span>${section.category}</span>
          <span class="text-gray-400 text-xs font-normal">(${filtered.length})</span>
        </h3>
        <div class="space-y-2">
          ${filtered.map(w => `
            <div class="dict-entry bg-white dark:bg-slate-800 rounded-xl p-4 flex items-center justify-between gap-3 shadow-sm border border-gray-100 dark:border-slate-700 cursor-pointer" onclick="window.playAudio(event,'${w.hangul}')">
              <div class="flex-1">
                <div class="flex items-center gap-2 mb-0.5">
                  <span class="text-xl font-black" style="font-family:'Noto Sans KR'">${w.hangul}</span>
                  <span class="formality-badge ${w.formal ? 'formality-formal' : 'formality-informal'}">${w.formal ? 'Formale' : 'Informale'}</span>
                </div>
                <p class="text-blue-500 font-bold text-xs">${w.romaji}</p>
                <p class="text-gray-600 dark:text-gray-400 font-bold text-sm">${w.eng}</p>
                ${w.example ? `<p class="text-gray-400 dark:text-gray-500 text-xs mt-1 italic">"${w.example}"</p>` : ''}
              </div>
              <button class="shrink-0 w-10 h-10 bg-pink-50 dark:bg-pink-900/30 text-pink-500 rounded-full flex items-center justify-center hover:bg-pink-100 transition-all" aria-label="Ascolta">
                <i data-lucide="volume-2" class="w-4 h-4"></i>
              </button>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  });
  if (!html) html = `<p class="text-gray-400 font-bold text-center py-12">🔍 Nessun risultato per "${state.dictSearch}"</p>`;
  return html;
};

/* ========= RENDER FUNCTIONS ========= */
const renderApp = () => {
  const root = document.getElementById('root');
  if (!root) return;

  if (state.isAuthLoading) {
    root.innerHTML = `<div class="h-screen flex items-center justify-center"><div class="animate-spin text-pink-500"><i data-lucide="loader-2" class="w-12 h-12"></i></div></div>`;
    lucide.createIcons(); return;
  }

  if (state.currentView === 'home') {
    // always render homepage normally
  } else if (state.showHomepage) {
    state.currentView = 'home';
  }

  const overlay = state.isTransitioning ? `
    <div class="fixed inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-[10000] flex items-center justify-center animate-fadein">
      <div class="bg-white dark:bg-slate-800 p-6 rounded-3xl shadow-2xl flex flex-col items-center">
        <i data-lucide="loader-2" class="animate-spin text-pink-500 w-10 h-10 mb-2"></i>
        <span class="font-black text-gray-500 dark:text-gray-300 text-xs uppercase tracking-widest">Caricamento</span>
      </div>
    </div>` : '';

  let content = '';
  if (state.currentView === 'home') content = renderHome();
  else if (state.currentView === 'dashboard') content = renderDashboard();
  else if (state.currentView === 'theory') content = renderTheory();
  else if (state.currentView === 'game') content = renderGame();
  else if (state.currentView === 'result') content = renderResult();
  else if (state.currentView === 'library') content = renderLibrary();
  else if (state.currentView === 'explore') content = renderExplore();
  else if (state.currentView === 'profile') content = renderProfile();

  const isInGame = ['theory', 'game', 'result'].includes(state.currentView);
  const navItems = [
    { view: 'dashboard', label: 'Percorso' },
    { view: 'explore',   label: 'Tour 🇰🇷' },
    { view: 'library',   label: 'Dizionario' },
    { view: 'profile',   label: 'Profilo' }
  ];
  const isGameView = ['theory', 'game', 'result'].includes(state.currentView);
  const headerHtml = state.currentView === 'home' ? '' : `
    <header class="app-top-bar w-full bg-white/97 dark:bg-slate-900/97 backdrop-blur-md border-b border-gray-100 dark:border-slate-800 z-[9000] flex-shrink-0 pt-safe transition-colors" role="banner">
      <div class="max-w-5xl mx-auto px-4 py-2.5 flex justify-between items-center gap-4">
        <button onclick="window.changeView('dashboard')" class="font-black text-pink-500 flex items-center gap-2 outline-none hover:scale-105 transition-transform shrink-0">
          <span class="text-xl">🌸</span>
          <span class="hidden sm:inline text-sm">Annyeong, ${state.profileName}!</span>
        </button>

        <!-- Desktop nav tabs — hidden on mobile -->
        ${!isGameView ? `
        <nav class="desktop-nav-tabs" aria-label="Navigazione desktop">
          ${navItems.map(it => `
            <button onclick="window.changeView('${it.view}')" class="${state.currentView === it.view ? 'active' : ''}">
              ${it.label}
            </button>
          `).join('')}
        </nav>` : ''}

        <div class="flex items-center gap-2 shrink-0">
          <span class="hidden sm:flex items-center gap-1 text-xs font-black text-orange-500 bg-orange-50 dark:bg-orange-900/30 px-2 py-1 rounded-full border border-orange-100 dark:border-orange-900">
            <i data-lucide="flame" class="w-3 h-3"></i> ${state.streak}
          </span>
          <button onclick="window.toggleDarkMode()"
            class="p-2 rounded-full bg-gray-100 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 transition-all hover:scale-110 outline-none"
            aria-label="Modalità ${state.isDarkMode ? 'chiara' : 'scura'}">
            <i data-lucide="${state.isDarkMode ? 'sun' : 'moon'}" class="w-4 h-4 ${state.isDarkMode ? 'text-yellow-400' : 'text-slate-500'}"></i>
          </button>
        </div>
      </div>
    </header>`;

  root.innerHTML = `
    ${overlay}
    ${headerHtml}
    <main id="main-content" class="flex-1 overflow-y-auto overscroll-y-contain w-full hide-scroll" style="background-color: inherit;"
      ontouchstart="window.handleTouchStart(event)" ontouchend="window.handleTouchEnd(event)"
      role="main" aria-label="Contenuto principale">
      <div class="max-w-[100vw] mx-auto ${state.currentView === 'home' ? '' : 'p-4 md:p-8'} w-full relative animate-fadein">
        ${content}
      </div>
    </main>
    ${state.currentView !== 'home' && !['theory','game','result'].includes(state.currentView) ? renderNav() : ''}
  `;

  lucide.createIcons();

  if (state.currentView === 'explore' && !state.isTransitioning) {
    setTimeout(window.initMap, 100);
  }
  if (state.currentView === 'library') {
    renderDictContent();
  }
  if (state.currentView === 'dashboard') {
    startWotdTimer();
  }
};

/* ========= HOMEPAGE ========= */
const renderHome = () => {
  const nextDay = (() => { for (let i = 1; i <= 45; i++) if (!state.completedDays.includes(i)) return i; return null; })();
  const nextLesson = nextDay ? window.COURSE_DATA.find(d => d.day === nextDay) : null;
  const totalProgress = Math.min((state.completedDays.length / 45) * 100, 100);
  const notifStatus = ('Notification' in window) ? (localStorage.getItem('sara_korean_notif') || Notification.permission) : 'unsupported';
  const isReturning = state.completedDays.length > 0;

  // Last 3 completed days for display
  const recentDays = [...state.completedDays].sort((a,b)=>b-a).slice(0,3);

  const greetings = ['Annyeong! 🌸', 'Yeoboseyo! 📞', 'Waeosseo! 🇰🇷', 'Jal jinaeyo? 😊'];
  const greeting = greetings[Math.floor(Date.now() / (1000 * 60 * 60 * 6)) % greetings.length];

  return `
  <div class="min-h-screen korea-pattern hero-gradient relative overflow-hidden flex flex-col items-center justify-center text-white px-4 py-8" style="min-height:100dvh;">
    <!-- Background decorative hangul -->
    <div class="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <div class="absolute top-8 left-4 text-8xl opacity-10 font-black" style="font-family:'Noto Sans KR'">한</div>
      <div class="absolute bottom-12 right-4 text-8xl opacity-10 font-black" style="font-family:'Noto Sans KR'">국</div>
      <div class="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[180px] opacity-5 font-black" style="font-family:'Noto Sans KR'">어</div>
    </div>

    <!-- Content -->
    <div class="relative z-10 text-center w-full max-w-sm mx-auto animate-pop flex flex-col gap-5">

      <!-- Avatar + greeting -->
      <div>
        <div class="avatar-ring w-24 h-24 mx-auto mb-3">
          <div class="w-full h-full rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-5xl border-4 border-white/30">
            🌸
          </div>
        </div>
        <p class="text-pink-200 text-xs font-black uppercase tracking-widest mb-1">${greeting}</p>
        <h1 class="text-3xl font-black leading-tight">
          ${isReturning ? 'Bentornata,' : 'Ciao,'} <span class="text-yellow-300">${state.profileName}</span>! 👋
        </h1>
        ${isReturning
          ? `<p class="text-white/70 text-sm font-bold mt-1">Stai andando benissimo! Continua così 💪</p>`
          : `<p class="text-white/70 text-sm font-bold mt-1">Il tuo percorso per parlare <span style="font-family:'Noto Sans KR'" class="font-black">한국어</span> in 45 giorni</p>`
        }
      </div>

      <!-- Stats grid — always live from localStorage -->
      <div class="grid grid-cols-3 gap-2.5">
        <div class="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/20">
          <div class="text-2xl font-black text-yellow-300">${state.completedDays.length}<span class="text-sm text-white/60">/45</span></div>
          <div class="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">Giorni</div>
        </div>
        <div class="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/20">
          <div class="text-2xl font-black text-orange-300">${state.streak} ${state.streak > 0 ? '🔥' : ''}</div>
          <div class="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">Streak</div>
        </div>
        <div class="bg-white/15 backdrop-blur-sm rounded-2xl p-3 text-center border border-white/20">
          <div class="text-2xl font-black text-green-300">${state.xp}</div>
          <div class="text-[10px] uppercase tracking-wider opacity-80 mt-0.5">XP ⚡</div>
        </div>
      </div>

      <!-- Progress bar -->
      ${isReturning ? `
      <div class="bg-white/10 rounded-2xl p-3 border border-white/20">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-black text-white/80">Progresso totale</span>
          <span class="text-xs font-black text-yellow-300">${Math.round(totalProgress)}%</span>
        </div>
        <div class="w-full bg-white/20 h-2.5 rounded-full overflow-hidden">
          <div class="bg-gradient-to-r from-yellow-300 to-pink-300 h-full rounded-full transition-all duration-1000" style="width:${totalProgress}%"></div>
        </div>
      </div>` : ''}

      <!-- Next lesson preview -->
      ${nextLesson ? `
      <div class="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-left">
        <p class="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1.5">Prossima Lezione</p>
        <div class="flex items-center justify-between gap-3">
          <div>
            <p class="font-black text-base leading-tight">Giorno ${nextDay}: ${nextLesson.title}</p>
            <p class="text-white/60 text-xs mt-0.5">${nextLesson.topic} • ~15 min</p>
          </div>
          <div class="shrink-0 bg-white/20 rounded-xl p-2 text-2xl">📚</div>
        </div>
      </div>` : `
      <div class="bg-white/15 backdrop-blur-sm rounded-2xl p-4 border border-white/20 text-center">
        <div class="text-3xl mb-1">🏆</div>
        <p class="font-black text-base">Percorso Completato!</p>
        <p class="text-white/60 text-xs mt-0.5">Sei una vera campionessa del coreano! 화이팅!</p>
      </div>`}

      <!-- Main CTA -->
      <button onclick="window.enterApp()"
        class="w-full bg-white text-pink-600 py-4 rounded-2xl font-black text-lg shadow-2xl shadow-black/20 active:scale-95 transition-transform flex items-center justify-center gap-3 outline-none touch-manipulation">
        ${state.completedDays.length > 0 ? '🚀 Continua il Percorso' : '🌸 Inizia il Percorso'}
        <i data-lucide="arrow-right" class="w-5 h-5"></i>
      </button>

      <!-- Notification toggle -->
      ${'Notification' in window ? `
      <div class="flex items-center justify-center gap-2">
        ${notifStatus === 'granted'
          ? `<button onclick="window.disableNotifications()" class="flex items-center gap-2 bg-white/10 border border-white/20 text-white/70 px-4 py-2 rounded-full text-xs font-bold transition-all active:scale-95 outline-none touch-manipulation">
              <i data-lucide="bell-off" class="w-3.5 h-3.5"></i> Notifiche attive — Disattiva
            </button>`
          : `<button onclick="window.requestNotificationPermission()" class="flex items-center gap-2 bg-white/15 border border-white/30 text-white px-4 py-2 rounded-full text-xs font-black transition-all active:scale-95 outline-none touch-manipulation">
              <i data-lucide="bell" class="w-3.5 h-3.5 text-yellow-300"></i> Attiva Promemoria Studio
            </button>`
        }
      </div>` : ''}

      <!-- Interest pills -->
      <div class="flex flex-wrap gap-1.5 justify-center">
        ${['💪 Gym', '🎮 LoL', '🎭 Cosplay', '📺 K-Drama', '🐾 Animali'].map(p =>
          `<span class="bg-white/10 border border-white/20 text-white/80 px-3 py-1 rounded-full text-[11px] font-bold">${p}</span>`
        ).join('')}
      </div>

    </div>
  </div>
`;};

/* ========= NAV ========= */
const renderNav = () => {
  if (['home', 'theory', 'game', 'result'].includes(state.currentView)) return '';
  const items = [
    { view: 'dashboard', icon: 'map', label: 'Percorso' },
    { view: 'explore', icon: 'compass', label: 'Tour 🇰🇷' },
    { view: 'library', icon: 'book-marked', label: 'Dizionario' },
    { view: 'profile', icon: 'user', label: 'Profilo' }
  ];
  return `
    <nav class="bottom-nav-el fixed bottom-0 w-full bg-white/97 dark:bg-slate-900/97 backdrop-blur-md border-t border-gray-100 dark:border-slate-800 pb-safe z-[9999] shadow-[0_-4px_12px_rgba(0,0,0,0.06)]" role="navigation" aria-label="Navigazione principale">
      <div class="max-w-4xl mx-auto flex justify-around px-2" style="padding-top:6px;padding-bottom:6px;">
        ${items.map(item => {
          const isActive = state.currentView === item.view;
          return `
            <button onclick="window.changeView('${item.view}')" 
              class="flex flex-col items-center gap-0.5 transition-all min-w-[60px] outline-none ${isActive ? 'scale-105' : ''}"
              aria-label="${item.label}" aria-current="${isActive ? 'page' : 'false'}">
              <div class="${isActive ? 'bg-pink-100 dark:bg-pink-900/40 text-pink-600' : 'text-gray-400 dark:text-gray-500'} p-2 rounded-xl transition-all">
                <i data-lucide="${item.icon}" class="w-5 h-5"></i>
              </div>
              <span class="text-[9px] font-black uppercase tracking-wide ${isActive ? 'text-pink-600' : 'text-gray-400 dark:text-gray-500'}">${item.label}</span>
              ${isActive ? '<div class="nav-active-dot"></div>' : ''}
            </button>
          `;
        }).join('')}
      </div>
    </nav>
  `;
};

/* ========= DASHBOARD ========= */
const renderDashboard = () => {
  const totalProgress = Math.min((state.completedDays.length / 45) * 100, 100);
  const xpData = getXPLevel(state.xp);
  const xpProgress = xpData.next ? Math.min((state.xp / xpData.next) * 100, 100) : 100;
  const nextDay = (() => { for (let i = 1; i <= 45; i++) if (!state.completedDays.includes(i)) return i; return null; })();
  const wotd = (window.WOTD_POOL || [])[state.wotdIndex !== null ? state.wotdIndex : 0];

  return `
  <div class="max-w-4xl mx-auto relative">
    <div class="hangul-watermark">가자</div>

    <!-- Hero Header -->
    <header class="bg-gradient-to-br from-pink-400 via-pink-300 to-blue-400 text-white rounded-2xl md:rounded-[2rem] p-6 md:p-10 mb-6 korean-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden" aria-label="Progresso generale">
      <div class="absolute top-0 right-0 opacity-10 text-[120px] font-black" style="font-family:'Noto Sans KR'">화</div>
      <div class="z-10 w-full">
        <h1 class="text-2xl md:text-4xl font-black mb-2 tracking-tight flex items-center gap-2">
          <span>Studio in Corso</span> <span>🌸</span>
        </h1>
        <p class="text-pink-50 text-sm md:text-base font-bold mb-4">Il tuo percorso per parlare coreano in 45 giorni.</p>
        <div class="w-full max-w-md bg-white/20 h-3 rounded-full overflow-hidden border border-white/30" role="progressbar" aria-valuenow="${Math.round(totalProgress)}" aria-valuemin="0" aria-valuemax="100">
          <div class="bg-white h-full transition-all duration-1000 rounded-full" style="width:${totalProgress}%"></div>
        </div>
        <p class="text-xs font-bold mt-1.5 text-white/80">${Math.round(totalProgress)}% Completato • ${totalProgress === 100 ? '화이팅! 🎉' : 'Forza Sara! ✊'}</p>
      </div>
      <div class="flex gap-2 w-full md:w-auto z-10 shrink-0">
        <div class="flex-1 md:flex-none flex flex-col items-center bg-white/20 p-3 rounded-2xl border border-white/20 min-w-[70px]">
          <i data-lucide="flame" class="${state.streak > 0 ? 'text-orange-400 animate-pulse' : 'text-white/30'} w-6 h-6 mb-1"></i>
          <span class="font-black text-xs">${state.streak} Streak</span>
        </div>
        <div class="flex-1 md:flex-none flex flex-col items-center bg-white/20 p-3 rounded-2xl border border-white/20 min-w-[70px]">
          <i data-lucide="award" class="text-yellow-300 w-6 h-6 mb-1"></i>
          <span class="font-black text-xs">${state.completedDays.length}/45</span>
        </div>
        <div class="flex-1 md:flex-none flex flex-col items-center bg-white/20 p-3 rounded-2xl border border-white/20 min-w-[70px]">
          <i data-lucide="zap" class="text-yellow-200 w-6 h-6 mb-1"></i>
          <span class="font-black text-xs">${state.xp} XP</span>
        </div>
      </div>
    </header>

    <!-- XP Level -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-4 mb-5 border border-gray-100 dark:border-slate-700 shadow-sm flex items-center gap-4">
      <div class="p-2 bg-yellow-50 dark:bg-yellow-900/30 rounded-xl shrink-0">
        <i data-lucide="zap" class="w-5 h-5 text-yellow-500"></i>
      </div>
      <div class="flex-1">
        <div class="flex justify-between items-center mb-1">
          <span class="font-black text-gray-800 dark:text-gray-200 text-sm">${xpData.title}</span>
          <span class="text-xs font-black text-gray-400">${state.xp} XP${xpData.next ? ` / ${xpData.next}` : ''}</span>
        </div>
        <div class="w-full bg-gray-100 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
          <div class="xp-bar bg-gradient-to-r from-yellow-400 to-pink-500 h-full rounded-full" style="width:${xpProgress}%"></div>
        </div>
      </div>
    </div>

    <!-- Word of the Day -->
    ${wotd ? `
    <div class="wotd-card rounded-2xl p-5 mb-5 border border-pink-100 dark:border-pink-900/30 shadow-sm">
      <div class="flex items-center justify-between gap-3">
        <div class="flex items-center gap-3 flex-1">
          <div class="text-2xl">✨</div>
          <div>
            <p class="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-0.5">${wotd.category} — Parola del Giorno</p>
            <p class="text-2xl font-black text-gray-900 dark:text-white" style="font-family:'Noto Sans KR'">${wotd.hangul}</p>
            <p class="text-xs font-bold text-blue-500">${wotd.romaji} — <span class="text-gray-600 dark:text-gray-400">${wotd.eng}</span></p>
          </div>
        </div>
        <div class="flex flex-col items-end gap-2">
          <button onclick="window.playAudio(event,'${wotd.hangul}')" class="shrink-0 bg-white dark:bg-slate-700 border-2 border-pink-200 dark:border-pink-700 text-pink-500 p-2.5 rounded-xl shadow-sm hover:bg-pink-50 transition-all hover:scale-110 outline-none" aria-label="Ascolta pronuncia">
            <i data-lucide="volume-2" class="w-5 h-5"></i>
          </button>
          <div class="text-right">
            <p class="text-[9px] text-gray-400 font-bold">Reset alle 00:00 🕛</p>
            <p class="text-[11px] font-black text-pink-500 tabular-nums" id="wotd-timer">--:--:--</p>
          </div>
        </div>
      </div>
      <div class="mt-3">
        <div class="wotd-timer-bar" id="wotd-timer-bar" style="width:100%"></div>
      </div>
    </div>` : ''}

    <!-- Next Lesson CTA -->
    ${nextDay ? `
    <div class="bg-gray-900 dark:bg-slate-950 rounded-2xl p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
      <div class="flex items-center gap-3">
        <div class="p-2.5 bg-pink-500 rounded-xl shrink-0"><i data-lucide="play" class="w-5 h-5 text-white"></i></div>
        <div>
          <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest">Prossima Lezione</p>
          <p class="font-black text-white text-base">${window.COURSE_DATA.find(d => d.day === nextDay)?.title || `Giorno ${nextDay}`}</p>
        </div>
      </div>
      <button onclick="window.startDay(${nextDay})" class="bg-pink-500 hover:bg-pink-600 text-white px-6 py-3 rounded-xl font-black shadow-lg shadow-pink-500/30 transition-all hover:scale-105 w-full sm:w-auto outline-none flex items-center justify-center gap-2">
        Inizia Ora <i data-lucide="arrow-right" class="w-5 h-5"></i>
      </button>
    </div>` : `
    <div class="bg-gradient-to-r from-pink-500 to-yellow-400 rounded-2xl p-5 mb-6 text-center text-white shadow-xl">
      <p class="text-3xl mb-1">🎉</p>
      <p class="font-black text-xl">Corso Completato, ${state.profileName}! 화이팅!</p>
      <p class="text-sm opacity-90 font-bold mt-1">Sei pronta per la Corea 🇰🇷</p>
    </div>`}

    <!-- Map Unlock Preview -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-6 border border-blue-50 dark:border-slate-700 shadow-sm">
      <div class="flex items-center justify-between mb-3">
        <h3 class="font-black text-gray-800 dark:text-gray-200 flex items-center gap-2 text-sm">
          <i data-lucide="map-pin" class="w-4 h-4 text-pink-500"></i> Korea Tour Sbloccato
        </h3>
        <span class="text-xs font-black text-pink-500">${(window.MAP_REGIONS || []).filter(r => state.completedDays.includes(r.unlocksAtDay)).length} / ${(window.MAP_REGIONS || []).length}</span>
      </div>
      <div class="flex gap-1.5 flex-wrap mb-2">
        ${(window.MAP_REGIONS || []).map(r => {
          const isUnlocked = state.completedDays.includes(r.unlocksAtDay);
          return `<span title="${isUnlocked ? r.name : `Sblocca al Giorno ${r.unlocksAtDay}`}" class="text-xl cursor-default transition-all ${isUnlocked ? '' : 'grayscale opacity-30'}">${r.icon}</span>`;
        }).join('')}
      </div>
      <button onclick="window.changeView('explore')" class="text-xs font-black text-blue-500 hover:text-pink-500 transition-colors flex items-center gap-1 outline-none">
        Vai al Korea Tour <i data-lucide="arrow-right" class="w-3 h-3"></i>
      </button>
    </div>

    <!-- Syllabus -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[2rem] korean-shadow p-5 md:p-10 mb-8 border border-blue-50 dark:border-slate-700">
      <div class="flex justify-between items-center mb-6 border-b-2 border-gray-100 dark:border-slate-700 pb-4">
        <h2 class="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-200 flex items-center gap-2">
          <i data-lucide="map" class="text-blue-400 w-6 h-6"></i> Syllabus
        </h2>
      </div>
      <div class="space-y-5 relative before:absolute before:inset-0 before:ml-[1.35rem] before:-translate-x-px before:h-full before:w-1 before:bg-gradient-to-b before:from-pink-200 before:via-blue-200 before:to-gray-200 before:rounded-full">
        ${(window.COURSE_DATA || []).map(dayData => {
          const isCompleted = state.completedDays.includes(dayData.day);
          const isLocked = dayData.day > 1 && !state.completedDays.includes(dayData.day - 1);
          const dayMistakes = state.mistakesRecord[dayData.day] || [];
          const needsReview = isCompleted && dayMistakes.length > 0;

          let circleClass = "bg-pink-500 text-white shadow-lg shadow-pink-500/40 border-4 border-white dark:border-slate-800";
          let circleContent = dayData.day;
          if (isCompleted) { circleClass = "bg-blue-500 text-white shadow-md border-4 border-blue-100 dark:border-blue-900"; circleContent = `<i data-lucide="check" class="w-5 h-5"></i>`; }
          else if (isLocked) { circleClass = "bg-gray-200 dark:bg-slate-700 text-gray-400 dark:text-slate-500 border-4 border-white dark:border-slate-800"; }

          return `
            <div class="relative flex items-center justify-between ${isLocked ? 'opacity-50' : ''}">
              <div class="flex items-center justify-center w-10 h-10 rounded-full shrink-0 z-10 font-black text-sm ${circleClass}">
                ${circleContent}
              </div>
              <div
                class="syllabus-card w-[calc(100%-3.5rem)] ${isLocked ? 'locked' : ''}"
                ${!isLocked ? `onclick="window.startDay(${dayData.day})" role="button" tabindex="0" onkeydown="if(event.key==='Enter') window.startDay(${dayData.day})"` : ''}
              >
                <div class="flex justify-between items-center gap-3">
                  <div class="flex-1 min-w-0">
                    <span class="text-[10px] font-black text-pink-500 uppercase tracking-widest block mb-0.5">${dayData.topic}</span>
                    <h3 class="font-black text-gray-800 dark:text-gray-200 leading-tight text-base truncate">${dayData.title}</h3>
                    <p class="text-[11px] text-gray-400 font-bold mt-1 flex items-center gap-1">
                      <i data-lucide="clock" class="w-3 h-3"></i> ${dayData.exercises.length} esercizi
                    </p>
                    <div class="flex flex-wrap gap-1.5 mt-1.5">
                      ${isCompleted && !needsReview ? `<span class="badge badge-blue text-[10px]">✓ Completato</span>` : ''}
                      ${needsReview ? `<span class="badge badge-orange text-[10px]">↺ Ripasso</span>` : ''}
                      ${isLocked ? `<span class="badge text-[10px] bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-400">🔒 Bloccato</span>` : ''}
                    </div>
                  </div>
                  ${!isLocked ? `
                  <div class="p-3 rounded-full transition-all shrink-0 ${isCompleted ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600' : 'bg-pink-500 text-white shadow-md shadow-pink-500/30'}">
                    <i data-lucide="${needsReview ? 'rotate-ccw' : 'play'}" class="w-5 h-5"></i>
                  </div>` : ''}
                </div>
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  </div>`;
};

/* ========= EXPLORE (MAP) ========= */
const renderExplore = () => {
  const unlockedCount = (window.MAP_REGIONS || []).filter(r => state.completedDays.includes(r.unlocksAtDay)).length;
  const nextToUnlock = (window.MAP_REGIONS || []).find(r => !state.completedDays.includes(r.unlocksAtDay));

  return `
  <div class="max-w-5xl mx-auto animate-pop">
    <div class="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[2rem] p-6 md:p-10 mb-6 korean-shadow border border-blue-50 dark:border-slate-700 text-center relative overflow-hidden">
      <div class="absolute inset-0 pointer-events-none" style="background:radial-gradient(circle at 50% 0%, rgba(244,114,182,0.08), transparent 70%)"></div>
      <h1 class="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-2 flex justify-center items-center gap-3">
        <i data-lucide="map" class="w-8 h-8 text-blue-500"></i> Korea Tour 🇰🇷
      </h1>
      <p class="text-gray-500 dark:text-gray-400 text-sm md:text-base font-bold mb-5">Esplora le location. Completa le lezioni per sbloccare nuove destinazioni!</p>
      <div class="bg-gray-50 dark:bg-slate-750 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
        <div class="flex justify-between items-center mb-2">
          <span class="text-xs font-black text-gray-600 dark:text-gray-400 uppercase tracking-widest">Location Sbloccate</span>
          <span class="text-sm font-black text-pink-500">${unlockedCount} / ${(window.MAP_REGIONS || []).length}</span>
        </div>
        <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-2.5 overflow-hidden mb-2">
          <div class="bg-gradient-to-r from-pink-400 to-blue-400 h-full rounded-full transition-all duration-1000" style="width:${(unlockedCount/(window.MAP_REGIONS||[1]).length)*100}%"></div>
        </div>
        <div class="flex gap-1 flex-wrap justify-center mt-2">
          ${(window.MAP_REGIONS || []).map(r => `<span class="text-lg ${state.completedDays.includes(r.unlocksAtDay) ? '' : 'grayscale opacity-30'}" title="${r.name}">${r.icon}</span>`).join('')}
        </div>
        ${nextToUnlock ? `<p class="text-[10px] font-bold text-gray-400 dark:text-gray-500 mt-2">Prossimo sblocco: <strong class="text-pink-500">${nextToUnlock.name}</strong> al Giorno ${nextToUnlock.unlocksAtDay}</p>` : `<p class="text-[10px] font-bold text-green-600 mt-2">🎉 Tutte le location sbloccate!</p>`}
      </div>
    </div>

    <!-- Map -->
    <div class="w-full h-[380px] md:h-[550px] rounded-2xl md:rounded-[2rem] shadow-xl border-4 border-white dark:border-slate-700 mb-8 relative overflow-hidden bg-gray-100 flex items-center justify-center">
      <div id="korea-map" class="absolute inset-0 z-10"></div>
      <i data-lucide="loader-2" class="animate-spin w-8 h-8 text-gray-400 absolute z-0"></i>
    </div>

    <!-- Location Cards -->
    <div class="location-cards-grid">
      ${(window.MAP_REGIONS || []).map(region => {
        const isUnlocked = state.completedDays.includes(region.unlocksAtDay);
        return `
          <div class="location-card ${isUnlocked ? '' : 'locked'} ${region.isAnimal ? 'animal-location-card' : ''}">
            <div class="h-40 relative w-full overflow-hidden bg-gray-200 dark:bg-slate-700">
              ${isUnlocked
                ? `<img src="${region.image}" alt="${region.name}" class="w-full h-full object-cover transition-transform duration-700 hover:scale-105" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=400'" />`
                : `<div class="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-200 to-gray-300 dark:from-slate-700 dark:to-slate-600"><i data-lucide="lock" class="w-10 h-10 text-gray-400 dark:text-slate-500"></i></div>`
              }
              <div class="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent"></div>
              <span class="absolute bottom-3 left-3 text-3xl">${region.icon}</span>
              ${!isUnlocked ? `<div class="absolute top-2 right-2 bg-black/60 text-white text-[10px] font-black px-2 py-1 rounded-full">🔒 Giorno ${region.unlocksAtDay}</div>` : ''}
            </div>
            <div class="p-4 flex-1 flex flex-col">
              <h2 class="text-lg font-black text-gray-800 dark:text-gray-200 mb-2">${region.name}</h2>
              ${!isUnlocked
                ? `<div class="flex-1 flex items-center justify-center">
                     <div class="bg-gray-50 dark:bg-slate-750 border border-gray-200 dark:border-slate-600 rounded-xl p-4 text-center w-full">
                       <p class="text-sm font-bold text-gray-500 dark:text-gray-400">Completa il <strong class="text-pink-500">Giorno ${region.unlocksAtDay}</strong> per sbloccare!</p>
                       <button onclick="window.changeView('dashboard')" class="mt-2 text-xs font-black text-pink-500 underline outline-none">Vai alle Lezioni →</button>
                     </div>
                   </div>`
                : `
                   <p class="text-gray-600 dark:text-gray-400 text-sm font-bold mb-3 flex-1">${region.desc}</p>
                   ${region.phrases ? `
                   <div class="bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 rounded-xl p-3 mb-3">
                     <p class="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-2">🗣️ Frasi Utili</p>
                     ${region.phrases.map(ph => `
                       <div class="flex items-center justify-between gap-2 mb-1.5">
                         <div>
                           <p class="text-sm font-black text-gray-800 dark:text-gray-200" style="font-family:'Noto Sans KR'">${ph.hangul}</p>
                           <p class="text-[10px] text-blue-500 font-bold">${ph.romaji} — <span class="text-gray-500 dark:text-gray-400">${ph.eng}</span></p>
                         </div>
                         <button onclick="window.playAudio(event,'${ph.hangul}')" class="shrink-0 w-8 h-8 bg-white dark:bg-slate-700 border border-pink-200 dark:border-pink-700 text-pink-500 rounded-full flex items-center justify-center text-xs shadow-sm">🔊</button>
                       </div>
                     `).join('<hr class="border-pink-100 dark:border-pink-900 my-1">')}
                   </div>` : ''}
                   <div class="flex flex-wrap gap-1.5">
                     ${region.keywords.map(kw => `<span class="badge badge-blue text-[10px]">${kw}</span>`).join('')}
                   </div>
                `}
            </div>
          </div>
        `;
      }).join('')}
    </div>
  </div>`;
};

/* ========= LIBRARY (DICTIONARY + TRANSLATOR) =========  */
const renderLibrary = () => {
  const categories = ['all', ...(window.DICTIONARY || []).map(s => s.category)];
  const formality = detectFormality(state.transResult);
  const formalityLabel = formality === 'formal' ? '<span class="formality-badge formality-formal">🎩 Formale</span>' :
    formality === 'polite' ? '<span class="formality-badge formality-informal">🌸 Educato/Polite</span>' :
    formality === 'informal' ? '<span class="formality-badge formality-informal">😊 Informale</span>' :
    formality === 'neutral' ? '<span class="formality-badge formality-neutral">• Neutrale</span>' : '';

  return `
  <div class="max-w-3xl mx-auto animate-pop">
    <h1 class="text-2xl font-black text-gray-900 dark:text-white mb-6 flex items-center gap-2">
      <i data-lucide="book-marked" class="w-7 h-7 text-blue-500"></i> Guida & Dizionario
    </h1>

    <!-- TRANSLATOR -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 mb-5 border border-gray-100 dark:border-slate-700 shadow-sm">
      <h2 class="font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 text-base">
        <i data-lucide="languages" class="w-5 h-5 text-blue-500"></i> Traduttore con Rilevamento Formalità
      </h2>
      <div class="flex gap-2 mb-3">
        <input 
          type="text" 
          id="transInput" 
          placeholder="Italiano, Inglese... → 한국어"
          value="${state.transResult && !state.transLoading ? '' : ''}"
          class="flex-1 border-2 border-gray-200 dark:border-slate-600 rounded-xl px-4 py-3 font-bold text-gray-800 dark:text-gray-200 dark:bg-slate-700 focus:border-pink-400 outline-none transition-colors text-base"
          onkeyup="if(event.key==='Enter') window.runTranslation()"
        />
        <button onclick="window.runTranslation()" class="bg-pink-500 hover:bg-pink-600 text-white px-4 rounded-xl font-black shadow-md transition-all hover:scale-105 outline-none flex items-center justify-center min-w-[52px]" aria-label="Traduci">
          ${state.transLoading ? '<i data-lucide="loader-2" class="animate-spin w-5 h-5"></i>' : '<i data-lucide="search" class="w-5 h-5"></i>'}
        </button>
      </div>
      ${state.transResult && state.transResult !== "Traducendo..." ? `
      <div class="bg-pink-50 dark:bg-pink-900/20 border border-pink-100 dark:border-pink-800 rounded-xl p-4">
        <div class="flex justify-between items-start gap-3">
          <div class="flex-1">
            <p class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1" style="font-family:'Noto Sans KR'">${state.transResult}</p>
            ${state.transRomaji ? `<p class="text-sm font-bold text-blue-500">${state.transRomaji}</p>` : ''}
            ${formalityLabel}
          </div>
          <button onclick="window.playAudio(event,'${state.transResult}')" class="shrink-0 w-10 h-10 bg-white dark:bg-slate-700 border border-pink-200 dark:border-pink-700 text-pink-500 rounded-xl flex items-center justify-center shadow-sm hover:bg-pink-50 transition-all outline-none">
            <i data-lucide="volume-2" class="w-5 h-5"></i>
          </button>
        </div>
      </div>` : ''}
    </div>

    <!-- DICTIONARY -->
    <div class="bg-white dark:bg-slate-800 rounded-2xl p-5 border border-gray-100 dark:border-slate-700 shadow-sm">
      <h2 class="font-black text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2 text-base">
        <i data-lucide="search" class="w-5 h-5 text-blue-500"></i> Dizionario Interattivo
      </h2>
      
      <!-- Search -->
      <div class="relative mb-3">
        <i data-lucide="search" class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"></i>
        <input 
          type="search" 
          placeholder="Cerca parola... (한국어 or italiano)"
          value="${state.dictSearch}"
          oninput="window.updateDictSearch(this.value)"
          class="w-full pl-10 pr-4 py-3 border-2 border-gray-200 dark:border-slate-600 rounded-xl font-bold text-gray-800 dark:text-gray-200 dark:bg-slate-700 focus:border-pink-400 outline-none transition-colors text-sm"
        />
      </div>

      <!-- Category Filter -->
      <div class="flex gap-2 overflow-x-auto mb-4 pb-3 scroll-smooth snap-x" id="dict-categories">
        <button onclick="window.updateDictCategory('all')" data-cat="all" class="dict-cat-btn shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-all outline-none ${state.dictCategory === 'all' ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'}">
          Tutti
        </button>
        ${(window.DICTIONARY || []).map(s => `
          <button onclick="window.updateDictCategory('${s.category}')" data-cat="${s.category}" class="dict-cat-btn shrink-0 px-3 py-1.5 rounded-full text-xs font-black transition-all outline-none ${state.dictCategory === s.category ? 'bg-pink-500 text-white shadow-md' : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400'}">
            ${s.category}
          </button>
        `).join('')}
      </div>

      <!-- Dict Entries (rendered separately) -->
      <div id="dict-content"></div>
    </div>
  </div>`;
};

/* ========= THEORY VIEW ========= */
const renderTheory = () => {
  const lesson = window.COURSE_DATA.find(d => d.day === state.activeDay);
  if (!lesson) return '<p>Lezione non trovata.</p>';

  return `
  <div class="max-w-3xl mx-auto animate-pop">
    <button onclick="window.changeView('dashboard')" class="text-gray-500 dark:text-gray-400 mb-5 flex items-center hover:text-gray-800 dark:hover:text-white font-black text-sm transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 w-fit outline-none">
      <i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i> Torna al Percorso
    </button>

    <div class="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[2rem] korean-shadow overflow-hidden border border-blue-50 dark:border-slate-700">
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 md:p-10 relative overflow-hidden">
        <i data-lucide="book-open" class="absolute right-0 bottom-0 w-32 h-32 opacity-10 translate-x-6 translate-y-6"></i>
        <span class="bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full text-xs font-black tracking-widest uppercase mb-4 inline-block border border-white/30">
          Giorno ${lesson.day} • Teoria
        </span>
        <h2 class="text-2xl md:text-3xl font-black leading-tight">${lesson.title}</h2>
      </div>

      <div class="p-5 md:p-10 space-y-7 md:space-y-10">
        <!-- Intro -->
        <div class="flex gap-4 items-start bg-pink-50 dark:bg-pink-900/20 p-5 rounded-2xl border border-pink-100 dark:border-pink-800">
          <i data-lucide="quote" class="text-pink-500 shrink-0 w-7 h-7 mt-1"></i>
          <p class="leading-relaxed font-bold text-pink-900 dark:text-pink-200 text-sm md:text-base">${lesson.theory.intro}</p>
        </div>

        <!-- Concept -->
        <div>
          <h3 class="font-black text-gray-800 dark:text-gray-200 mb-3 flex items-center gap-2 text-lg">
            <div class="p-1.5 bg-blue-100 dark:bg-blue-900/40 rounded-xl text-blue-600"><i data-lucide="brain" class="w-5 h-5"></i></div>
            Il Concetto Base
          </h3>
          <p class="text-gray-600 dark:text-gray-300 font-bold leading-relaxed text-sm md:text-base">${lesson.theory.concept}</p>
        </div>

        <!-- Formality reminder for first days -->
        ${lesson.day <= 5 ? `
        <div class="bg-amber-50 dark:bg-amber-900/20 rounded-2xl p-4 border-2 border-amber-200 dark:border-amber-800 flex gap-3 items-start">
          <span class="text-xl shrink-0">📌</span>
          <div>
            <h3 class="font-black text-amber-900 dark:text-amber-300 mb-1 text-sm md:text-base">Formale vs Informale</h3>
            <p class="text-amber-800 dark:text-amber-400 font-bold text-xs md:text-sm leading-relaxed">Con <strong>sconosciuti, negozianti, taxisti</strong> → usa frasi con <strong>-요 (-yo)</strong> o <strong>-니다 (-nida)</strong>. Con <strong>amici della tua età</strong> → puoi togliere il -요. Per i tuoi primi giorni: usa sempre la forma con -요, non sbagli mai!</p>
          </div>
        </div>` : ''}

        <!-- Examples -->
        <div>
          <h3 class="font-black text-gray-800 dark:text-gray-200 mb-4 text-lg border-b-2 border-gray-100 dark:border-slate-700 pb-3">Frasi Chiave 📝</h3>
          <p class="text-xs font-bold text-pink-500 mb-4 bg-pink-50 dark:bg-pink-900/20 p-3 rounded-xl border border-pink-100 dark:border-pink-800 flex gap-2 items-center">
            <i data-lucide="mouse-pointer-click" class="w-4 h-4 shrink-0"></i>
            Tocca le parole coreane per ascoltare la pronuncia!
          </p>
          <div class="space-y-3">
            ${lesson.theory.examples.map(ex => `
              <div class="bg-white dark:bg-slate-750 border-2 border-gray-100 dark:border-slate-600 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm hover:shadow-md hover:border-pink-200 dark:hover:border-pink-700 transition-all group card-hover">
                <div>
                  <p class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-pink-600 transition-colors hangul-display">${window.renderHangul(ex.hangul)}</p>
                  <p class="text-blue-500 font-bold text-sm mb-1">${ex.romaji}</p>
                  <p class="text-gray-700 dark:text-gray-300 font-black text-sm md:text-base mb-1">"${ex.eng}"</p>
                  ${ex.context ? `<p class="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-slate-700 p-2 rounded-lg font-bold border border-gray-100 dark:border-slate-600 mt-1 inline-block">${ex.context}</p>` : ''}
                </div>
                <button onclick="window.playAudio(event,'${ex.hangul}')" class="flex items-center justify-center gap-2 bg-blue-50 dark:bg-blue-900/30 hover:bg-blue-100 border-2 border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-4 py-2.5 rounded-xl transition-all hover:scale-105 shrink-0 w-full sm:w-auto outline-none min-h-[44px]" aria-label="Ascolta ${ex.eng}">
                  <i data-lucide="volume-2" class="w-5 h-5"></i><span class="font-black text-sm">Ascolta</span>
                </button>
              </div>
            `).join('')}
          </div>
        </div>

        ${lesson.theory.builderRule ? `
        <div class="bg-indigo-50 dark:bg-indigo-900/20 rounded-2xl p-5 border border-indigo-100 dark:border-indigo-800 flex gap-4 items-start">
          <i data-lucide="link" class="text-indigo-500 shrink-0 w-7 h-7 mt-1"></i>
          <div>
            <h3 class="font-black text-indigo-900 dark:text-indigo-300 mb-1 text-base">Conversation Builder 🔗</h3>
            <p class="text-indigo-800 dark:text-indigo-400 font-bold leading-relaxed text-sm md:text-base">${lesson.theory.builderRule}</p>
          </div>
        </div>` : ''}

        <!-- Culture -->
        <div class="bg-green-50 dark:bg-green-900/20 rounded-2xl p-5 border border-green-100 dark:border-green-800 flex gap-4 items-start">
          <i data-lucide="leaf" class="text-green-600 shrink-0 w-7 h-7 mt-1"></i>
          <div>
            <h3 class="font-black text-green-900 dark:text-green-300 mb-1 text-base">Dettaglio Culturale 🎎</h3>
            <p class="text-green-800 dark:text-green-400 font-bold leading-relaxed text-sm md:text-base">${lesson.theory.culture}</p>
          </div>
        </div>
      </div>

      <div class="p-5 md:p-8 bg-gray-50 dark:bg-slate-750 border-t-2 border-gray-100 dark:border-slate-700 flex justify-end">
        <button onclick="window.startGame()" class="bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-2xl font-black text-lg shadow-lg shadow-pink-500/30 flex items-center justify-center gap-3 transition-all hover:scale-105 w-full md:w-auto outline-none">
          Inizia la Pratica (${lesson.exercises.length} Es) <i data-lucide="play-circle" class="w-7 h-7"></i>
        </button>
      </div>
    </div>
  </div>`;
};

/* ========= NUOVE FUNZIONI SENTENCE BUILDER ========= */
window.handleBuilderClick = (index, fromPool) => {
  if (state.showFeedback) return;
  window.haptic(15);
  
  if (fromPool) {
    // Sposta dalla pool alla frase
    const word = state.builderAvailableWords[index];
    if (word !== null) {
      state.builderSelectedWords.push({ word, originalIndex: index });
      state.builderAvailableWords[index] = null; // Lascia il "buco" visivo
    }
  } else {
    // Rimuovi dalla frase e rimetti nella pool
    const item = state.builderSelectedWords[index];
    state.builderAvailableWords[item.originalIndex] = item.word;
    state.builderSelectedWords.splice(index, 1);
  }
  renderApp();
};

window.checkBuilderAnswer = () => {
  if (state.showFeedback) return;
  const ex = window.COURSE_DATA.find(d => d.day === state.activeDay).exercises[state.gameStep];
  
  const userSentence = state.builderSelectedWords.map(i => i.word).join(' ');
  const correctSentence = ex.correct_order.join(' ');
  
  state.selectedAnswer = (userSentence === correctSentence);
  state.showFeedback = true;
  
  if (state.selectedAnswer) {
    state.score++; state.combo++;
    window.haptic([30, 50, 30]);
    if (state.combo >= 3) window.showToast(`🔥 Combo x${state.combo}!`);
  } else {
    state.combo = 0;
    state.currentMistakes.push(ex.conceptTag);
    window.haptic(100);
  }
  renderApp();
};

/* ========= GAME VIEW (AGGIORNATA) ========= */
const renderGame = () => {
  const lesson = window.COURSE_DATA.find(d => d.day === state.activeDay);
  if (!lesson) return '';
  const exercise = lesson.exercises[state.gameStep];
  const isAnswered = state.selectedAnswer !== null;

  let isCorrect = false;
  if (['multiple_choice', 'listen', 'conversation', 'fill_blank', 'sentence_builder'].includes(exercise.type)) {
    isCorrect = isAnswered && state.selectedAnswer === (exercise.type === 'sentence_builder' ? true : exercise.answer);
  } else if (exercise.type === 'speak') {
    isCorrect = isAnswered && state.selectedAnswer === true;
  }

  const progressWidth = (state.gameStep / lesson.exercises.length) * 100;

  const typeMap = {
    speak: { label: 'Pronuncia Vocale', icon: 'mic', color: 'text-pink-700 bg-pink-50 border-pink-100 dark:bg-pink-900/30 dark:text-pink-300' },
    listen: { label: 'Test di Ascolto', icon: 'headphones', color: 'text-indigo-700 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300' },
    conversation: { label: 'Simulazione Dialogo', icon: 'message-square', color: 'text-orange-700 bg-orange-50 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300' },
    fill_blank: { label: 'Completa la Frase', icon: 'pencil', color: 'text-purple-700 bg-purple-50 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300' },
    sentence_builder: { label: 'Costruisci la Frase', icon: 'blocks', color: 'text-green-700 bg-green-50 border-green-100 dark:bg-green-900/30 dark:text-green-300' }
  };
  const typeInfo = typeMap[exercise.type] || { label: 'Quiz', icon: 'brain', color: 'text-blue-700 bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300' };

  // Context bubble
  const contextHtml = (exercise.context) ? `
    <div class="mb-6 w-full flex justify-start">
      <div class="chat-bubble bg-orange-50 dark:bg-orange-900/20 border-2 border-orange-200 dark:border-orange-800 p-4 rounded-2xl rounded-bl-none shadow-sm relative w-11/12 md:w-3/4">
        <p class="text-orange-900 dark:text-orange-200 font-bold text-sm">${exercise.context}</p>
      </div>
    </div>` : '';

  let exerciseHtml = '';

  // === SENTENCE BUILDER UI ===
  if (exercise.type === 'sentence_builder') {
    // Inizializza le parole se è la prima volta che si apre l'esercizio
    if (state.builderAvailableWords.length === 0 && state.builderSelectedWords.length === 0 && !isAnswered) {
      state.builderAvailableWords = [...exercise.shuffled_blocks];
    }

    const allUsed = state.builderAvailableWords.every(w => w === null);
    const chipClass = isAnswered ? (isCorrect ? 'correct' : 'wrong') : '';

    exerciseHtml = `
      <div class="space-y-6">
        <!-- Area di costruzione -->
        <div class="builder-area ${state.builderSelectedWords.length > 0 ? 'has-content' : ''}">
          ${state.builderSelectedWords.length === 0 ? `<span class="text-gray-400 font-bold mx-auto self-center text-sm">Tocca le parole sotto per comporre la frase</span>` : ''}
          ${state.builderSelectedWords.map((item, i) => `
            <div class="builder-chip ${chipClass}" onclick="window.handleBuilderClick(${i}, false)">
              ${item.word}
            </div>
          `).join('')}
        </div>

        <hr class="border-gray-100 dark:border-slate-700">

        <!-- Pool di parole -->
        <div class="flex flex-wrap gap-2 justify-center min-h-[100px]">
          ${state.builderAvailableWords.map((word, i) => `
            <div class="builder-chip in-pool ${word === null ? 'used' : ''}" onclick="window.handleBuilderClick(${i}, true)">
              ${word || ''}
            </div>
          `).join('')}
        </div>

        <!-- Bottone di Conferma -->
        ${!isAnswered ? `
          <button onclick="window.checkBuilderAnswer()" 
            class="w-full py-4 rounded-2xl font-black text-lg transition-all outline-none shadow-xl ${allUsed ? 'bg-blue-500 hover:bg-blue-600 text-white hover:scale-105' : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'}" 
            ${!allUsed ? 'disabled' : ''}>
            Controlla Risposta
          </button>
        ` : ''}
      </div>
    `;
  } 
  // === ALTRI ESERCIZI ===
  else if (['multiple_choice', 'listen', 'conversation', 'fill_blank'].includes(exercise.type)) {
    // (Stesso codice precedente per le scelte multiple...)
    exerciseHtml = `<div class="space-y-3">` + exercise.options.map((opt, i) => {
      let cls = "bg-white dark:bg-slate-750 border-2 border-gray-200 dark:border-slate-600 text-gray-700 dark:text-gray-300 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20";
      let iconHtml = '';
      if (isAnswered) {
        if (i === exercise.answer) {
          cls = "bg-green-50 dark:bg-green-900/20 border-2 border-green-500 text-green-900 dark:text-green-300 shadow-md";
          iconHtml = `<i data-lucide="check-circle-2" class="text-green-500 w-7 h-7 animate-pop shrink-0"></i>`;
        } else if (i === state.selectedAnswer) {
          cls = "bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-500 text-rose-900 dark:text-rose-300";
          iconHtml = `<i data-lucide="x-circle" class="text-rose-500 w-7 h-7 shrink-0"></i>`;
        } else {
          cls = "bg-gray-50 dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 text-gray-400 opacity-60";
        }
      }
      const hasHangul = /[\u3131-\uD79D]/u.test(opt);
      const audioBtn = (exercise.optionsHangul && exercise.optionsHangul[i]) ? `
        <button onclick="window.playAudio(event,'${exercise.optionsHangul[i]}')" class="p-2.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl hover:bg-blue-100 transition-colors shrink-0 border border-blue-100 dark:border-blue-800 mr-3 outline-none min-w-[44px] min-h-[44px] flex items-center justify-center">
          <i data-lucide="volume-2" class="w-5 h-5"></i>
        </button>` : '';
      return `
        <div class="relative w-full rounded-2xl transition-all cursor-pointer shadow-sm hover:shadow-md min-h-[68px] flex items-center ${cls}" onclick="if(!${isAnswered}) window.handleMultipleChoiceAnswer(${i})">
          <div class="flex items-center w-full p-3 md:p-5 h-full">
            ${audioBtn}
            <span class="font-black text-lg flex-grow leading-tight ${hasHangul ? 'hangul-display' : ''}">${hasHangul ? window.renderHangul(opt) : opt}</span>
            <div class="flex items-center ml-2">${iconHtml}</div>
          </div>
        </div>`;
    }).join('') + '</div>';
  } else if (exercise.type === 'speak') {
     // (Stesso codice precedente per lo speak...)
     if (state.fallbackActive && !isAnswered) {
      exerciseHtml = `
        <div class="space-y-3 w-full animate-pop">
          <p class="text-xs font-bold text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20 p-3 rounded-xl border border-orange-200 dark:border-orange-800 flex items-start gap-2">
            <i data-lucide="info" class="w-4 h-4 shrink-0 mt-0.5"></i> Scegli la <b>pronuncia fonetica esatta</b>!
          </p>
          ${state.fallbackOptions.map((opt, i) => `
            <button onclick="window.handleFallbackAnswer(${i})" class="w-full text-left p-4 rounded-2xl border-2 border-gray-200 dark:border-slate-600 hover:border-pink-400 hover:bg-pink-50 dark:hover:bg-pink-900/20 font-black text-lg transition-all shadow-sm flex items-center justify-between text-gray-800 dark:text-gray-200 min-h-[60px] outline-none">
              <span>${opt}</span> <i data-lucide="ear" class="w-5 h-5 text-pink-400 shrink-0"></i>
            </button>
          `).join('')}
        </div>`;
    } else {
      const btnCls = state.isRecording
        ? 'bg-pink-500 scale-110 shadow-2xl shadow-pink-500/50 recording-pulse border-white border-4'
        : (isAnswered ? 'bg-gray-200 dark:bg-slate-700 text-gray-400' : 'bg-blue-500 hover:bg-blue-600 text-white shadow-xl hover:scale-105 border-4 border-blue-200');
      const msg = state.isRecording ? "Ti sto ascoltando... 👂" : (isAnswered ? "Analisi completata." : "Tocca per parlare");
      exerciseHtml = `
        <div class="flex flex-col items-center justify-center mt-6 space-y-5 bg-gray-50 dark:bg-slate-750 p-6 rounded-3xl border-2 border-dashed border-gray-200 dark:border-slate-600 min-h-[240px] relative">
          <button ${isAnswered || state.isRecording ? 'disabled' : ''}
            onmousedown="window.handleSpeechRecognition(event)"
            ontouchstart="window.handleSpeechRecognition(event)"
            class="relative w-28 h-28 rounded-full flex items-center justify-center transition-all ${btnCls} no-select outline-none"
            aria-label="Parla in coreano">
            <i data-lucide="mic" class="w-12 h-12 ${state.isRecording ? 'animate-bounce' : ''}"></i>
          </button>
          <p class="text-gray-600 dark:text-gray-400 font-black text-center text-base">${msg}</p>
          ${(!isAnswered && !state.isRecording) ? `
            <button onclick="window.triggerSpeechFallback()" class="absolute bottom-3 right-3 text-[10px] font-bold text-gray-400 hover:text-gray-600 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 px-3 py-2 rounded-lg shadow-sm transition-colors outline-none">
              Alternativa
            </button>` : ''}
        </div>`;
    }
  }

  // === FEEDBACK UI ===
  const feedbackCls = isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-900 dark:text-green-200' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-200';
  const iconCls = isCorrect ? 'bg-green-500' : 'bg-rose-500';
  const iconType = isCorrect ? 'check' : 'alert-circle';
  const headingText = isCorrect ? 'Perfetto, Sara! 🎉' : 'Oops, non ti arrendere! 💪';
  const btnFeedCls = isCorrect ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30';
  const btnText = state.gameStep === lesson.exercises.length - 1 ? 'Termina Lezione 🏁' : 'Prossima Domanda →';
  
  let correctBuilderText = "";
  if (!isCorrect && exercise.type === 'sentence_builder') {
    correctBuilderText = `<p class="mt-2 text-sm">La frase corretta era: <strong class="font-black text-rose-600 dark:text-rose-400 font-['Noto_Sans_KR']">${exercise.correct_order.join(' ')}</strong></p>`;
  }

  const feedbackMsg = exercise._fb || (isCorrect ? "Ottima risposta, vai avanti così!" : exercise.feedback_incorrect);

  return `
  <div class="max-w-2xl mx-auto animate-pop">
    <div class="flex justify-between items-center mb-4 px-1">
      <div class="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <i data-lucide="flame" class="w-5 h-5 ${state.combo > 1 ? 'text-orange-500 animate-pulse' : 'text-gray-300'}"></i>
        <span class="font-black text-sm ${state.combo > 1 ? 'text-orange-600' : 'text-gray-400'}">${state.combo}x</span>
      </div>
      <span class="font-black text-gray-500 dark:text-gray-400 text-sm bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">${state.gameStep + 1} / ${lesson.exercises.length}</span>
    </div>

    <div class="mb-5 bg-white dark:bg-slate-800 p-2 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
      <div class="bg-gray-100 dark:bg-slate-700 h-3 rounded-xl overflow-hidden">
        <div class="bg-gradient-to-r from-blue-400 to-pink-500 h-full transition-all duration-700 ease-out rounded-xl" style="width:${progressWidth}%"></div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[2rem] korean-shadow p-5 md:p-10 min-h-[440px] flex flex-col border border-blue-50 dark:border-slate-700 relative overflow-hidden">
      <div class="flex-grow z-10">
        <div class="flex justify-center mb-6">
          <span class="${typeInfo.color} text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest border flex items-center gap-2">
            <i data-lucide="${typeInfo.icon}" class="w-3 h-3"></i> ${typeInfo.label}
          </span>
        </div>

        ${exercise.type === 'listen' ? `
          <div class="flex justify-center mb-5">
            <button onclick="window.playAudio(event,'${exercise.audioHangul}')" 
              class="flex items-center gap-3 bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-full transition-all hover:scale-105 shadow-xl shadow-pink-500/30 outline-none"
              aria-label="Riproduci audio">
              <i data-lucide="volume-2" class="w-7 h-7 animate-pulse"></i>
              <span class="font-black text-lg">Riproduci Audio</span>
            </button>
          </div>` : ''}

        ${contextHtml}

        <h2 class="text-xl md:text-2xl font-black text-gray-800 dark:text-gray-200 mb-6 text-center leading-snug">
          ${exercise.question}
        </h2>

        ${exerciseHtml}
      </div>

      <div class="mt-6 transition-all duration-500 z-10 ${isAnswered ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'}">
        <div class="p-4 md:p-6 rounded-2xl flex flex-col sm:flex-row gap-4 items-start shadow-sm border-2 ${feedbackCls}">
          <div class="p-2.5 rounded-full text-white shrink-0 shadow-md ${iconCls}">
            <i data-lucide="${iconType}" class="w-5 h-5"></i>
          </div>
          <div class="flex-grow w-full">
            <h4 class="font-black text-xl mb-1">${headingText}</h4>
            <p class="font-bold text-sm mb-2">${feedbackMsg}</p>
            ${correctBuilderText}
            ${!isCorrect && exercise.tip ? `
              <div class="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/40 mt-2 text-xs font-bold text-gray-700 dark:text-gray-300">
                💡 <strong>Hint del Sensei:</strong> ${exercise.tip}
              </div>` : ''}
          </div>
        </div>
        <button onclick="window.nextQuestion()" class="w-full mt-4 py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-all hover:scale-[1.02] ${btnFeedCls} outline-none">
          ${btnText}
        </button>
      </div>
    </div>
  </div>`;
};

/* ========= RESULT VIEW ========= */
const renderResult = () => {
  const lesson = window.COURSE_DATA.find(d => d.day === state.activeDay);
  const total = lesson.exercises.length;
  const isPerfect = state.score === total;
  const pct = Math.round((state.score / total) * 100);

  if (isPerfect) {
    setTimeout(() => {
      if (window.confetti) {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#f472b6', '#60a5fa', '#fbbf24'] });
      }
    }, 200);
  }

  const newUnlock = state.newlyUnlockedLocation;

  return `
  <div class="max-w-lg mx-auto animate-pop">
    <div class="bg-white dark:bg-slate-800 rounded-[2rem] korean-shadow p-8 md:p-10 text-center border border-blue-50 dark:border-slate-700 relative overflow-hidden">
      <div class="hangul-watermark">${isPerfect ? '완' : '노력'}</div>

      <div class="text-7xl mb-4">${isPerfect ? '🏆' : pct >= 70 ? '⭐' : '💪'}</div>
      <h2 class="text-3xl font-black text-gray-900 dark:text-white mb-1">${isPerfect ? 'Perfetta!' : pct >= 70 ? 'Ottimo!' : 'Non Mollare!'}</h2>
      <p class="text-gray-500 dark:text-gray-400 font-bold mb-6 text-sm">Giorno ${lesson.day} — ${lesson.title}</p>

      <!-- Score ring -->
      <div class="relative w-32 h-32 mx-auto mb-6">
        <svg viewBox="0 0 120 120" class="w-full h-full -rotate-90">
          <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" stroke-width="10"/>
          <circle cx="60" cy="60" r="50" fill="none" 
            stroke="${isPerfect ? '#22c55e' : pct >= 70 ? '#f472b6' : '#f97316'}" 
            stroke-width="10" stroke-linecap="round"
            stroke-dasharray="${2 * Math.PI * 50}" 
            stroke-dashoffset="${2 * Math.PI * 50 * (1 - pct / 100)}"
            style="transition: stroke-dashoffset 1s ease-out;"/>
        </svg>
        <div class="absolute inset-0 flex flex-col items-center justify-center">
          <span class="text-3xl font-black text-gray-900 dark:text-white">${state.score}</span>
          <span class="text-xs font-bold text-gray-400">/ ${total}</span>
        </div>
      </div>

      <!-- Stats -->
      <div class="flex gap-3 mb-6 justify-center">
        <div class="bg-orange-50 dark:bg-orange-900/20 rounded-2xl p-3 text-center flex-1 border border-orange-100 dark:border-orange-800">
          <p class="text-xl font-black text-orange-600">${state.streak}</p>
          <p class="text-[10px] text-gray-500 font-bold uppercase">Streak 🔥</p>
        </div>
        <div class="bg-yellow-50 dark:bg-yellow-900/20 rounded-2xl p-3 text-center flex-1 border border-yellow-100 dark:border-yellow-800">
          <p class="text-xl font-black text-yellow-600">+${isPerfect ? 120 : 80} XP</p>
          <p class="text-[10px] text-gray-500 font-bold uppercase">Guadagnati ⚡</p>
        </div>
        <div class="bg-blue-50 dark:bg-blue-900/20 rounded-2xl p-3 text-center flex-1 border border-blue-100 dark:border-blue-800">
          <p class="text-xl font-black text-blue-600">${pct}%</p>
          <p class="text-[10px] text-gray-500 font-bold uppercase">Score 🎯</p>
        </div>
      </div>

      ${newUnlock ? `
      <div class="bg-gradient-to-r from-green-400 to-blue-500 text-white p-4 rounded-2xl mb-5 shadow-lg animate-pop">
        <p class="text-2xl mb-1">🗺️</p>
        <p class="font-black text-lg">Nuova Location Sbloccata!</p>
        <p class="text-white/80 font-bold text-sm">${newUnlock.icon} ${newUnlock.name}</p>
        <p class="text-white/70 text-xs mt-1">${newUnlock.unlockMsg}</p>
      </div>` : ''}

      ${state.currentMistakes.length > 0 ? `
      <div class="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 dark:border-rose-800 text-rose-900 dark:text-rose-300 p-4 rounded-2xl mb-5 text-left">
        <p class="font-black text-sm mb-2 flex items-center gap-2"><i data-lucide="book-open" class="w-4 h-4"></i> Punti deboli da ripassare:</p>
        <div class="flex flex-wrap gap-1.5">
          ${[...new Set(state.currentMistakes)].map(m => `<span class="badge badge-orange text-[10px]">${m}</span>`).join('')}
        </div>
      </div>` : ''}

      <div class="flex flex-col gap-3">
        <button onclick="window.changeView('dashboard')" class="w-full bg-gray-900 dark:bg-slate-950 text-white py-4 rounded-2xl font-black text-lg shadow-xl hover:scale-105 transition-all outline-none">
          🗺️ Torna al Percorso
        </button>
        ${state.completedDays.length < 45 ? `
        <button onclick="window.startDay(${Math.min(state.activeDay + 1, 45)})" class="w-full bg-pink-500 hover:bg-pink-600 text-white py-3 rounded-2xl font-black shadow-md hover:scale-105 transition-all outline-none flex items-center justify-center gap-2">
          Prossima Lezione <i data-lucide="arrow-right" class="w-5 h-5"></i>
        </button>` : ''}
      </div>
    </div>
  </div>`;
};

/* ========= PROFILE VIEW ========= */
const renderProfile = () => {
  const xpData = getXPLevel(state.xp);
  const earnedBadges = (window.BADGES || []).filter(b => state.unlockedBadges.includes(b.id));

  return `
  <div class="max-w-md mx-auto animate-pop">
    <div class="bg-white dark:bg-slate-800 rounded-[2rem] korean-shadow p-6 md:p-10 border border-blue-50 dark:border-slate-700 relative overflow-hidden">
      <div class="hangul-watermark">나</div>

      <!-- Avatar -->
      <div class="avatar-ring w-24 h-24 mx-auto mb-5">
        <div class="w-full h-full rounded-full bg-pink-100 dark:bg-pink-900/40 text-pink-500 flex items-center justify-center border-2 border-white dark:border-slate-800">
          <span class="text-4xl">🌸</span>
        </div>
      </div>

      <h2 class="text-2xl font-black text-gray-900 dark:text-white text-center mb-1">Profilo di Studio</h2>
      <p class="text-gray-500 dark:text-gray-400 text-center font-bold text-sm mb-3">Il tuo viaggio in Corea è al sicuro qui.</p>
      <div class="flex justify-center mb-6">
        <span class="badge badge-gold">${xpData.title} — ${state.xp} XP</span>
      </div>

      <!-- Name -->
      <div class="mb-5">
        <label class="block text-[10px] font-black text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-widest">Nome Studente</label>
        <input type="text" value="${state.profileName}" onchange="window.updateProfileName(this.value)"
          class="w-full border-2 border-gray-200 dark:border-slate-600 rounded-xl p-3 text-lg font-black text-gray-800 dark:text-gray-200 dark:bg-slate-700 focus:border-pink-500 outline-none transition-colors min-h-[50px]" />
      </div>

      <!-- Stats -->
      <div class="bg-gray-900 dark:bg-slate-950 rounded-2xl p-5 mb-5 flex justify-between items-center text-white">
        <div>
          <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Giorni Completati</p>
          <p class="text-4xl font-black text-pink-400">${state.completedDays.length}</p>
        </div>
        <div class="text-right">
          <p class="text-gray-400 text-xs font-black uppercase tracking-widest mb-1">Streak attivo</p>
          <p class="text-4xl font-black text-orange-400">${state.streak} 🔥</p>
        </div>
      </div>

      <!-- Skills -->
      <div class="bg-gray-50 dark:bg-slate-750 rounded-2xl p-4 mb-5 border border-gray-100 dark:border-slate-700">
        <p class="text-[10px] font-black text-gray-800 dark:text-gray-300 uppercase tracking-widest mb-3 flex items-center gap-2">
          <i data-lucide="bar-chart-2" class="w-4 h-4 text-blue-500"></i> Competenze
        </p>
        ${[
          { label: 'Basi & Saluti', pct: Math.min(state.completedDays.filter(d => d <= 5).length * 20, 100), color: 'bg-pink-500' },
          { label: 'Vita Quotidiana', pct: Math.min(state.completedDays.filter(d => d > 5 && d <= 15).length * 10, 100), color: 'bg-blue-500' },
          { label: 'Passioni & Hobby', pct: Math.min(state.completedDays.filter(d => d > 15 && d <= 25).length * 10, 100), color: 'bg-green-500' },
          { label: 'Avanzato', pct: Math.min(state.completedDays.filter(d => d > 25).length * 5, 100), color: 'bg-purple-500' }
        ].map(s => `
          <div class="mb-2.5">
            <div class="flex justify-between text-xs font-bold text-gray-500 dark:text-gray-400 mb-1"><span>${s.label}</span><span>${s.pct}%</span></div>
            <div class="w-full bg-gray-200 dark:bg-slate-700 rounded-full h-1.5"><div class="${s.color} h-1.5 rounded-full" style="width:${s.pct}%"></div></div>
          </div>
        `).join('')}
      </div>

      <!-- Badges -->
      ${earnedBadges.length > 0 ? `
      <div class="mb-5">
        <p class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3">🏅 Badge Sbloccati (${earnedBadges.length})</p>
        <div class="flex flex-wrap gap-2">
          ${earnedBadges.map(b => `
            <div class="badge badge-gold text-[11px] badge-pop" title="${b.desc}">
              ${b.icon} ${b.name}
            </div>
          `).join('')}
        </div>
      </div>` : ''}

      <!-- Reset -->
      <button onclick="window.handleSwitchAccount()" class="w-full bg-white dark:bg-slate-750 border-2 border-gray-200 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/20 hover:border-red-300 hover:text-red-600 text-gray-500 dark:text-gray-400 py-3 rounded-2xl font-black text-sm transition-all flex justify-center items-center gap-2 outline-none">
        <i data-lucide="trash-2" class="w-5 h-5"></i> Resetta Percorso
      </button>

      <!-- Notifications -->
      ${'Notification' in window ? `
      <div class="mt-4 bg-gray-50 dark:bg-slate-750 rounded-2xl p-4 border border-gray-100 dark:border-slate-700">
        <p class="text-[10px] font-black text-gray-500 dark:text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <i data-lucide="bell" class="w-4 h-4 text-pink-500"></i> Promemoria Studio
        </p>
        ${(() => {
          const ns = localStorage.getItem('sara_korean_notif') || Notification.permission;
          if (ns === 'granted') return `
            <p class="text-xs text-green-600 dark:text-green-400 font-bold mb-2">✅ Notifiche attive — ti ricordiamo ogni giorno</p>
            <button onclick="window.disableNotifications()" class="w-full border-2 border-gray-200 dark:border-slate-600 text-gray-500 py-2 rounded-xl font-black text-xs transition-all hover:border-red-300 hover:text-red-500 outline-none">
              Disattiva Notifiche
            </button>`;
          if (ns === 'denied') return `<p class="text-xs text-red-500 font-bold">Le notifiche sono bloccate. Abilita nelle impostazioni del browser.</p>`;
          return `
            <p class="text-xs text-gray-500 dark:text-gray-400 mb-2">Ricevi un promemoria quando non studi per più di 23 ore</p>
            <button onclick="window.requestNotificationPermission()" class="w-full bg-pink-500 text-white py-2.5 rounded-xl font-black text-sm transition-all hover:bg-pink-600 outline-none flex items-center justify-center gap-2">
              <i data-lucide="bell" class="w-4 h-4"></i> Attiva Promemoria
            </button>`;
        })()}
      </div>` : ''}
    </div>
  </div>`;
};

/* ========= NOTIFICATIONS ========= */
const NOTIF_KEY = 'sara_korean_notif';

window.requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    window.showToast("Notifiche non supportate da questo browser.", true);
    return;
  }
  const permission = await Notification.requestPermission();
  if (permission === 'granted') {
    localStorage.setItem(NOTIF_KEY, 'granted');
    scheduleStudyReminder();
    window.showToast("✅ Notifiche attivate! Ti ricorderemo di studiare.", false, true);
    renderApp();
  } else {
    window.showToast("Notifiche non autorizzate.", true);
  }
};

window.disableNotifications = () => {
  localStorage.setItem(NOTIF_KEY, 'denied');
  if (window._notifTimeout) clearTimeout(window._notifTimeout);
  window.showToast("Notifiche disattivate.", false, false);
  renderApp();
};

const getNotifStatus = () => localStorage.getItem(NOTIF_KEY) || Notification.permission;

const scheduleStudyReminder = () => {
  if (!('Notification' in window) || getNotifStatus() !== 'granted') return;
  if (window._notifTimeout) clearTimeout(window._notifTimeout);

  // Check last study time
  const lastStudy = parseInt(localStorage.getItem('sara_last_study') || '0');
  const now = Date.now();
  const hoursSince = (now - lastStudy) / (1000 * 60 * 60);

  // Remind after 23h gap or schedule for next day
  const msUntilReminder = hoursSince >= 23
    ? 5000 // show in 5s if overdue
    : Math.max(0, (23 * 60 * 60 * 1000) - (now - lastStudy));

  window._notifTimeout = setTimeout(() => {
    if (document.visibilityState !== 'visible') {
      const messages = [
        { title: "🌸 Annyeong Sara!", body: "Il tuo coreano ti aspetta! 15 minuti al giorno e tra poco parli con i coreani! 화이팅!" },
        { title: "🔥 Streak in pericolo!", body: "Non perdere la tua serie! Studia oggi per mantenere il tuo streak! 💪" },
        { title: "🎮 LoL in coreano?", body: "I player coreani ti stanno aspettando in chat. Studia ora!" },
        { title: "📺 2521 ti chiama!", body: "Ogni lezione ti avvicina ai tuoi drama preferiti. Dai, 15 minuti!" },
        { title: "💪 Gym time coreano!", body: "Impara le frasi della palestra oggi. Il tuo PT coreano ti ringrazierà!" }
      ];
      const msg = messages[Math.floor(Math.random() * messages.length)];
      try {
        new Notification(msg.title, {
          body: msg.body,
          icon: './icons/icon-192.png',
          badge: './icons/icon-192.png',
          tag: 'study-reminder',
          requireInteraction: false
        });
      } catch(e) { console.warn('Notification error', e); }
    }
    // Reschedule for next day
    scheduleStudyReminder();
  }, msUntilReminder);
};

// Save last study time when completing a lesson
const markStudySession = () => {
  localStorage.setItem('sara_last_study', Date.now().toString());
  scheduleStudyReminder();
};

/* ========= BOOT ========= */
const initApp = () => {
  loadProgress();
  // Always show homepage on app open — stats are live from state
  state.showHomepage = true;
  state.currentView = 'home';
  renderApp();

  // Register SW
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js')
        .then(r => console.log('SW registered:', r.scope))
        .catch(e => console.warn('SW error:', e));
    });
  }

  // Resume notification scheduling if already granted
  if (getNotifStatus() === 'granted') {
    scheduleStudyReminder();
  }
};

document.addEventListener('DOMContentLoaded', initApp);
