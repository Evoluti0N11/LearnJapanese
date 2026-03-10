// --- APPLICATION STATE ---
const state = {
  profileName: "Sara",
  isDarkMode: localStorage.getItem('sara_theme') === 'dark',
  hangulScale: 1,
  isTransitioning: false, 
  currentView: 'dashboard', 
  activeDay: 1,
  completedDays: [],
  mistakesRecord: {},
  gameStep: 0,
  score: 0,
  selectedAnswer: null,
  showFeedback: false,
  isRecording: false,
  fallbackActive: false,
  fallbackOptions: [],
  currentMistakes: [],
  transInput: '', transResult: '', transRomaji: '', transLoading: false,
  combo: 0, xp: 0, streak: 0,
  mapUnlockSeen: [],
  newlyUnlockedLocation: null,
  wotdIndex: 0,
  
  builderSelection: [],
  matchingState: { selectedId: null, matched: [] },
  matchingSetup: null
};

if (state.isDarkMode) {
    document.documentElement.classList.add('dark');
    document.querySelector('meta[name="theme-color"]').setAttribute('content', '#0f172a');
}

let myMap = null;
let speechTimeout = null;

window.haptic = (ms = 40) => { if (navigator.vibrate) navigator.vibrate(ms); };

window.toggleDarkMode = () => {
    window.haptic(20);
    state.isDarkMode = !state.isDarkMode;
    document.documentElement.classList.toggle('dark', state.isDarkMode);
    localStorage.setItem('sara_theme', state.isDarkMode ? 'dark' : 'light');
    renderApp();
};

window.updateHangulSize = (val) => {
    state.hangulScale = parseFloat(val);
    document.documentElement.style.setProperty('--hangul-scale', state.hangulScale);
    saveProgress(state.completedDays, state.mistakesRecord);
};

// --- DATA & SAVING LOGIC (LocalStorage Native) ---
const computeStreak = (days) => {
  if (!days || days.length === 0) return 0;
  const sorted = [...days].sort((a, b) => a - b);
  let streak = 1;
  for (let i = sorted.length - 1; i > 0; i--) {
    if (sorted[i] === sorted[i-1] + 1) streak++; else break;
  }
  return streak;
};

const computeXP = (days, mistakes) => {
  let xp = 0;
  days.forEach(d => { xp += (mistakes[d] || []).length === 0 ? 120 : 80; });
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

const showSaveToast = (msg = "Progressi Salvati!", isError = false) => {
  const toast = document.createElement('div');
  const bg = isError ? 'bg-red-500' : 'bg-green-500';
  const icon = isError ? 'alert-triangle' : 'check-circle';
  toast.className = `fixed top-5 left-1/2 transform -translate-x-1/2 ${bg} text-white px-6 py-3 rounded-full shadow-2xl z-[10000] text-sm font-bold flex items-center gap-2 animate-pop border border-white/20`;
  toast.innerHTML = `<i data-lucide="${icon}" class="w-4 h-4 text-white"></i> ${msg}`;
  document.body.appendChild(toast);
  lucide.createIcons();
  setTimeout(() => { toast.style.opacity = '0'; setTimeout(() => toast.remove(), 300); }, 2500);
};

const loadLocalProgress = () => {
  try {
    const saved = localStorage.getItem('sara_korean_save_v3');
    if (saved) {
      const data = JSON.parse(saved);
      state.completedDays = data.completedDays || [];
      state.mistakesRecord = data.mistakesRecord || {};
      if (data.profileName) state.profileName = data.profileName;
      if (data.hangulScale) { state.hangulScale = data.hangulScale; document.documentElement.style.setProperty('--hangul-scale', state.hangulScale); }
      state.mapUnlockSeen = data.mapUnlockSeen || [];
    }
    state.streak = computeStreak(state.completedDays);
    state.xp = computeXP(state.completedDays, state.mistakesRecord);
    state.wotdIndex = Math.floor(Date.now() / 86400000) % window.WOTD_POOL.length;
  } catch(e) { console.error("Local storage error", e); }
};

const saveProgress = (newCompleted, newMistakes) => {
  state.streak = computeStreak(newCompleted);
  state.xp = computeXP(newCompleted, newMistakes);
  localStorage.setItem('sara_korean_save_v3', JSON.stringify({
    completedDays: newCompleted, mistakesRecord: newMistakes,
    profileName: state.profileName, hangulScale: state.hangulScale, mapUnlockSeen: state.mapUnlockSeen,
  }));
  showSaveToast();
};

window.unlockDayWithCode = (code) => {
    window.haptic();
    if(!code || code.length < 4) return;
    const upperCode = code.toUpperCase().trim();
    const foundDayIndex = window._s_k_d.indexOf(upperCode);
    
    if(foundDayIndex > 0 && foundDayIndex <= 45) {
        if(!state.completedDays.includes(foundDayIndex)) {
            const newDays = [...state.completedDays];
            for(let i=1; i<=foundDayIndex; i++) { if(!newDays.includes(i)) newDays.push(i); }
            state.completedDays = newDays;
            saveProgress(newDays, state.mistakesRecord);
            showSaveToast(`Livello ${foundDayIndex} sbloccato! Magia! ✨`);
            document.getElementById('unlockCodeInput').value = '';
            renderApp();
        } else { showSaveToast("Hai già sbloccato questo livello!", true); }
    } else { showSaveToast("Codice Segreto non valido! Riprova.", true); }
};

// --- AUDIO E MIC ---
window.playAudio = (e, textHangul) => {
  if (e) { e.stopPropagation(); e.preventDefault(); }
  window.haptic(30);
  if (!textHangul) return;
  const cleanText = textHangul.replace(/<[^>]*>?/gm, '');
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ko-KR'; utterance.rate = 0.85; 
    const voices = window.speechSynthesis.getVoices();
    const koVoices = voices.filter(v => v.lang.includes('ko'));
    if(koVoices.length > 0) utterance.voice = koVoices.find(v => /Yuna|Somi|Female|Google/i.test(v.name)) || koVoices[0];
    window.speechSynthesis.speak(utterance);
  } else { showSaveToast("Il tuo browser non supporta la pronuncia.", true); }
};

window.triggerSpeechFallback = () => {
    window.haptic();
    if(speechTimeout) clearTimeout(speechTimeout);
    state.isRecording = false; state.fallbackActive = true;
    const ex = window.COURSE_DATA.find(d => d.day === state.activeDay).exercises[state.gameStep];
    const correct = ex.expectedRomaji[0];
    const opt1 = correct.replace(/[aeiou]/g, (m) => m==='a'?'e':m==='e'?'i':m==='i'?'o':m==='o'?'u':'a');
    const opt2 = correct.replace(/k|g|t|d|p|b|j/g, (m) => m==='k'?'g':m==='g'?'k':m==='t'?'d':m==='d'?'t':m==='p'?'b':'p').replace(/[aeiou]/g, 'a');
    state.fallbackOptions = [correct, opt1, opt2].sort(() => Math.random() - 0.5);
    renderApp();
};

window.handleFallbackAnswer = (index) => {
   if (state.showFeedback) return;
   const ex = window.COURSE_DATA.find(d => d.day === state.activeDay).exercises[state.gameStep];
   const correct = ex.expectedRomaji[0];
   const isCorrect = state.fallbackOptions[index] === correct;
   if(isCorrect) {
      window.playAudio(null, ex.expectedHangul[0]);
      state.selectedAnswer = true; state.score += 1; state.combo += 1; state.showFeedback = true; window.haptic([30, 50, 30]);
      ex.feedback_incorrect = "Bravissima! L'Hai riconosciuta perfettamente.";
   } else {
      state.selectedAnswer = false; state.combo = 0; state.currentMistakes.push(ex.conceptTag); state.showFeedback = true; window.haptic(100);
      ex.feedback_incorrect = `Quella non era la pronuncia esatta. Era: "${correct}".`;
   }
   renderApp();
};

window.handleSpeechRecognition = (e) => {
  if (e) e.preventDefault();
  if (state.selectedAnswer !== null || state.isRecording) return;
  window.haptic(50);
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SpeechRecognition) { window.triggerSpeechFallback(); return; }
  const recognition = new SpeechRecognition();
  recognition.lang = 'ko-KR'; recognition.interimResults = false; recognition.maxAlternatives = 1; recognition.continuous = false;
  state.isRecording = true; renderApp();

  speechTimeout = setTimeout(() => { if (state.isRecording) { recognition.stop(); window.triggerSpeechFallback(); } }, 7000);

  recognition.onresult = (event) => {
    clearTimeout(speechTimeout); state.isRecording = false;
    let transcript = event.results[0][0].transcript.toLowerCase().trim();
    const cleanTranscript = transcript.replace(/[.,!?。、！？\s~]/g, '');
    const exercise = window.COURSE_DATA.find(d => d.day === state.activeDay).exercises[state.gameStep];
    const isMatch = exercise.expectedHangul.some(k => cleanTranscript.includes(k.replace(/[.,!?。、！？\s~]/g, ''))) || exercise.expectedRomaji.some(r => cleanTranscript.includes(r.replace(/[.,!?。、！？\s~]/g, '')));
    state.selectedAnswer = isMatch; state.showFeedback = true;
    if (isMatch) { state.score += 1; state.combo += 1; window.haptic([30, 50, 30]); } 
    else { state.combo = 0; window.haptic(100); exercise.feedback_incorrect = `Hai detto: "${event.results[0][0].transcript}". Riprova!`; state.currentMistakes.push(exercise.conceptTag); }
    renderApp();
  };
  recognition.onerror = (event) => {
    clearTimeout(speechTimeout);
    if(event.error === 'not-allowed' || event.error === 'no-speech') window.triggerSpeechFallback();
    else { state.isRecording = false; state.showFeedback = true; state.selectedAnswer = false; state.combo = 0; window.COURSE_DATA.find(d => d.day === state.activeDay).exercises[state.gameStep].feedback_incorrect = "Errore microfono. Passa al prossimo."; renderApp(); }
  };
  try { recognition.start(); } catch(err) { clearTimeout(speechTimeout); window.triggerSpeechFallback(); }
};

window.runTranslation = async () => {
  window.haptic();
  const text = document.getElementById('transInput').value.trim();
  if (!text) return;
  state.transLoading = true; state.transResult = "Traducendo..."; state.transRomaji = ""; renderApp();
  try {
    const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=it&tl=ko&dt=t&dt=rm&q=${encodeURIComponent(text)}`);
    const data = await res.json();
    if (data && data[0]) {
        let koText = ""; let romajiText = "";
        data[0].forEach(item => {
            if (item[0] && typeof item[0] === 'string' && item[0] !== "null" && !item[0].match(/^[a-zA-Z\s]+$/)) koText += item[0];
            if (item[2] && typeof item[2] === 'string' && /^[a-zA-Zāēīōūōōuu\-\s\'eou]+$/i.test(item[2])) romajiText += item[2];
            else if (item[3] && typeof item[3] === 'string' && /^[a-zA-Zāēīōūōōuu\-\s\'eou]+$/i.test(item[3])) romajiText += item[3];
        });
        state.transResult = koText || "Impossibile tradurre."; state.transRomaji = romajiText ? romajiText.trim() : "Audio disponibile sotto";
    }
  } catch(e) { state.transResult = "Errore di rete."; showSaveToast("Errore traduzione.", true); }
  state.transLoading = false; renderApp();
};

window.initMap = () => {
    if (!document.getElementById('korea-map')) return;
    if (myMap !== null) { myMap.remove(); myMap = null; }
    myMap = L.map('korea-map', { zoomControl: false, scrollWheelZoom: false }).setView([36.5, 127.5], 7);
    L.control.zoom({ position: 'topright' }).addTo(myMap);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', { attribution: '&copy; OpenStreetMap' }).addTo(myMap);

    window.MAP_REGIONS.forEach(region => {
        const isUnlocked = state.completedDays.includes(region.unlocksAtDay);
        const icon = L.divIcon({
            className: isUnlocked ? 'custom-map-icon' : 'custom-map-icon map-icon-locked',
            html: isUnlocked ? `<div class="border-4 border-pink-400 animate-bounce-slow" onclick="window.haptic(20)">${region.icon}</div>` : `<div class="border-4 border-gray-300">🔒</div>`,
            iconSize: [44, 44], iconAnchor: [22, 22]
        });
        const marker = L.marker([region.lat, region.lng], {icon: icon}).addTo(myMap);
        if (isUnlocked) {
          marker.bindPopup(`
            <div class="p-0 text-center min-w-[260px] flex flex-col items-center">
                <img src="${region.image}" class="w-full h-32 object-cover rounded-t-xl mb-3 border-b-2 border-pink-100" onerror="this.src='https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&q=80'" />
                <div class="px-3 pb-3 w-full"><h3 class="font-black text-lg text-gray-800 mb-1">${region.name}</h3>
                <p class="text-xs font-bold text-gray-600 mb-2">${region.desc}</p></div>
            </div>`);
        } else {
          marker.bindPopup(`<div class="p-4 text-center min-w-[200px]"><div class="text-4xl mb-2">🔒</div><h3 class="font-black text-base text-gray-800 mb-1">${region.name}</h3><div class="bg-pink-50 border-pink-100 rounded-xl px-3 py-2"><p class="text-xs font-black text-pink-600">Completa il Giorno ${region.unlocksAtDay}</p></div></div>`);
        }
    });
};

// --- LOGICA ESERCIZI ---
const setupSpecialExercise = (ex) => {
    if (ex.type === 'matching') {
        const koOptions = ex.pairs.map((p, i) => ({ id: i, text: p.ko, type: 'ko' })).sort(() => 0.5 - Math.random());
        const itOptions = ex.pairs.map((p, i) => ({ id: i, text: p.it, type: 'it' })).sort(() => 0.5 - Math.random());
        state.matchingSetup = { koOptions, itOptions, pairs: ex.pairs };
    }
};

window.handleMultipleChoiceAnswer = (index) => {
  if (state.showFeedback) return;
  const ex = window.COURSE_DATA.find(d => d.day === state.activeDay).exercises[state.gameStep];
  if (ex.optionsHangul && ex.optionsHangul[index]) window.playAudio(null, ex.optionsHangul[index]);
  state.selectedAnswer = index; state.showFeedback = true;
  if (index === ex.answer) { state.score += 1; state.combo += 1; window.haptic([30, 50, 30]); } 
  else { state.combo = 0; state.currentMistakes.push(ex.conceptTag); window.haptic(100); }
  renderApp();
};

window.handleBuilderClick = (word, isFromPool) => {
    if (state.showFeedback) return;
    window.haptic(20);
    if (isFromPool) state.builderSelection.push(word);
    else state.builderSelection.splice(state.builderSelection.indexOf(word), 1);
    renderApp();
};

window.checkSentenceBuilder = () => {
    if (state.showFeedback) return;
    const ex = window.COURSE_DATA.find(d => d.day === state.activeDay).exercises[state.gameStep];
    const isCorrect = state.builderSelection.join(' ') === ex.expected.join(' ');
    state.selectedAnswer = isCorrect; state.showFeedback = true;
    if (isCorrect) { window.playAudio(null, ex.expected.join(' ')); state.score += 1; state.combo += 1; window.haptic([30, 50, 30]); } 
    else { state.combo = 0; state.currentMistakes.push(ex.conceptTag); window.haptic(100); ex.feedback_incorrect = `L'ordine corretto era: ${ex.expected.join(' ')}`; }
    renderApp();
};

window.handleMatchClick = (id, type, value) => {
    if (state.showFeedback || state.matchingState.matched.includes(id)) return;
    window.haptic(20);
    if (!state.matchingState.selectedId) { state.matchingState.selectedId = { id, type, value }; } 
    else {
        if (state.matchingState.selectedId.type === type) { state.matchingState.selectedId = { id, type, value }; } 
        else {
            const isMatch = state.matchingState.selectedId.id === id;
            if (isMatch) {
                state.matchingState.matched.push(id); window.haptic([20, 30]);
                if(type === 'ko') window.playAudio(null, value); else window.playAudio(null, state.matchingState.selectedId.value);
            } else { window.haptic(100); }
            state.matchingState.selectedId = null;
            if (state.matchingState.matched.length === state.matchingSetup.pairs.length) { state.selectedAnswer = true; state.showFeedback = true; state.score += 1; state.combo += 1; }
        }
    }
    renderApp();
};

window.nextQuestion = () => {
  window.haptic(20);
  const currentLesson = window.COURSE_DATA.find(d => d.day === state.activeDay);
  if (state.gameStep < currentLesson.exercises.length - 1) {
    state.gameStep += 1; state.selectedAnswer = null; state.showFeedback = false; state.fallbackActive = false;
    state.builderSelection = []; state.matchingState = { selectedId: null, matched: [] };
    setupSpecialExercise(currentLesson.exercises[state.gameStep]);
  } else {
    const newCompleted = state.completedDays.includes(state.activeDay) ? state.completedDays : [...state.completedDays, state.activeDay];
    const newMistakes = { ...state.mistakesRecord, [state.activeDay]: state.currentMistakes };
    const newUnlocks = window.MAP_REGIONS.filter(r => newCompleted.includes(r.unlocksAtDay) && !state.completedDays.includes(r.unlocksAtDay));
    state.newlyUnlockedLocation = newUnlocks.length > 0 ? newUnlocks[0] : null;
    if (state.newlyUnlockedLocation && !state.mapUnlockSeen.includes(state.newlyUnlockedLocation.name)) state.mapUnlockSeen.push(state.newlyUnlockedLocation.name);
    state.completedDays = newCompleted; state.mistakesRecord = newMistakes;
    saveProgress(newCompleted, newMistakes); state.currentView = 'result';
    if ((state.score === currentLesson.exercises.length || state.newlyUnlockedLocation) && typeof confetti !== 'undefined') {
        setTimeout(() => { confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 }, colors: ['#f472b6', '#60a5fa', '#fcd34d', '#34d399'] }); window.haptic([50, 50, 50, 50, 100]); }, 300);
    }
  }
  renderApp();
};

// --- NAVIGAZIONE ---
window.changeView = (view) => {
  window.haptic(20); state.isTransitioning = true; renderApp();
  setTimeout(() => { state.currentView = view; state.isTransitioning = false; renderApp(); }, 300);
};

window.startDay = (dayNum) => {
  window.haptic(40); state.isTransitioning = true; renderApp();
  setTimeout(() => { state.activeDay = dayNum; state.currentView = 'theory'; state.gameStep = 0; state.score = 0; state.combo = 0; state.selectedAnswer = null; state.showFeedback = false; state.fallbackActive = false; state.currentMistakes = []; state.isTransitioning = false; renderApp(); }, 300);
};

window.startGame = () => {
  window.haptic(40); state.isTransitioning = true; renderApp();
  const lesson = window.COURSE_DATA.find(d => d.day === state.activeDay);
  setupSpecialExercise(lesson.exercises[0]);
  setTimeout(() => { state.currentView = 'game'; state.isTransitioning = false; renderApp(); }, 300);
};

// --- RENDERERS (INTERFACCIA) ---
const renderNav = () => {
  const navItems = [
    { view: 'dashboard', icon: 'map-pin', label: 'Percorso' }, { view: 'explore', icon: 'compass', label: 'Korea Tour' },
    { view: 'library', icon: 'book-marked', label: 'Guida Base' }, { view: 'profile', icon: 'circle-user-round', label: 'Profilo' },
  ];
  return `<nav class="fixed bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-blue-100 pb-safe z-[9999] shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] md:relative md:border-b md:border-t-0 flex-shrink-0"><div class="max-w-4xl mx-auto flex justify-between md:justify-center md:gap-16 px-4 py-2 md:p-5">${navItems.map(item => `<button onclick="window.changeView('${item.view}')" class="flex flex-col items-center gap-1 transition-all min-w-[60px] ${state.currentView === item.view ? 'scale-105' : 'hover:scale-105'}"><div class="${state.currentView === item.view ? 'bg-pink-100 text-pink-600' : 'text-gray-400 hover:text-blue-500'} p-2 rounded-2xl transition-all"><i data-lucide="${item.icon}" class="w-6 h-6"></i></div><span class="text-[10px] md:text-xs font-black uppercase tracking-widest ${state.currentView === item.view ? 'text-pink-600' : 'text-gray-400'}">${item.label}</span></button>`).join('')}</div></nav>`;
};

const renderDashboard = () => {
    const totalProgress = Math.min((state.completedDays.length / 45) * 100, 100);
    const xpData = getXPLevel(state.xp);
    const xpProgress = xpData.next ? Math.min(((state.xp % (xpData.next / xpData.level)) / (xpData.next / xpData.level)) * 100, 100) : 100;
    const nextDay = (() => { for (let i = 1; i <= 45; i++) { if (!state.completedDays.includes(i)) return i; } return null; })();
    const wotd = window.WOTD_POOL[state.wotdIndex !== null ? state.wotdIndex : 0];

    let html = `
    <div class="max-w-4xl mx-auto relative"><div class="hangul-watermark">가자</div>
      <header class="bg-gradient-to-br from-pink-400 via-pink-300 to-blue-400 text-white rounded-2xl md:rounded-[2rem] p-6 md:p-10 mb-6 korean-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
        <div class="absolute top-0 right-0 opacity-10 transform translate-x-4 -translate-y-4"><i data-lucide="sparkles" class="w-48 h-48"></i></div>
        <div class="z-10 w-full"><h1 class="text-3xl md:text-5xl font-black mb-3">Studio in Corso 🌸</h1>
          <p class="text-pink-50 font-bold mb-4">Il tuo percorso per padroneggiare il Coreano in 45 giorni.</p>
          <div class="w-full max-w-md bg-white/20 h-4 rounded-full overflow-hidden backdrop-blur-sm border border-white/30"><div class="bg-white h-full transition-all" style="width: ${totalProgress}%"></div></div>
        </div>
        <div class="flex gap-3 w-full md:w-auto z-10 shrink-0">
           <div class="flex-1 flex flex-col items-center justify-center bg-white/20 p-3 rounded-2xl shadow-inner"><i data-lucide="flame" class="${state.streak > 0 ? 'text-orange-400 animate-pulse' : 'text-gray-300'} mb-1 w-6 h-6"></i><span class="font-black text-xs">${state.streak} Streak</span></div>
           <div class="flex-1 flex flex-col items-center justify-center bg-white/20 p-3 rounded-2xl shadow-inner"><i data-lucide="award" class="text-yellow-300 mb-1 w-6 h-6"></i><span class="font-black text-xs">${state.completedDays.length} / 45</span></div>
           <div class="flex-1 flex flex-col items-center justify-center bg-white/20 p-3 rounded-2xl shadow-inner"><i data-lucide="zap" class="text-yellow-200 mb-1 w-6 h-6"></i><span class="font-black text-xs">${state.xp} XP</span></div>
        </div>
      </header>
      <div class="bg-white rounded-2xl p-4 md:p-5 mb-5 border shadow-sm flex items-center gap-4"><div class="p-2 bg-yellow-50 rounded-xl shrink-0"><i data-lucide="zap" class="w-5 h-5 text-yellow-500"></i></div><div class="flex-1"><div class="flex justify-between items-center mb-1.5"><span class="font-black text-gray-800 text-sm">${xpData.title}</span><span class="text-xs font-black text-gray-400">${state.xp} XP${xpData.next ? ` / ${xpData.next}` : ''}</span></div><div class="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden"><div class="xp-bar bg-gradient-to-r from-yellow-400 to-pink-500 h-full rounded-full" style="width:${xpProgress}%"></div></div></div></div>
      <div class="wotd-card rounded-2xl md:rounded-[1.5rem] p-5 mb-5 border flex justify-between items-center gap-4"><div class="flex items-center gap-3"><div class="text-2xl">✨</div><div><p class="text-[10px] font-black text-pink-500 uppercase">${wotd.category} — Parola del Giorno</p><p class="text-2xl font-black text-gray-900" style="font-family:'Noto Sans KR'">${wotd.hangul}</p><p class="text-xs font-bold text-blue-500">${wotd.romaji} — <span class="text-gray-600">${wotd.eng}</span></p></div></div><button onclick="window.playAudio(event,'${wotd.hangul}')" class="shrink-0 bg-white border-2 border-pink-200 text-pink-500 p-3 rounded-2xl shadow-sm hover:scale-110"><i data-lucide="volume-2" class="w-5 h-5"></i></button></div>
      ${nextDay ? `<div class="bg-gray-900 rounded-2xl md:rounded-[1.5rem] p-5 mb-6 flex items-center justify-between gap-4 shadow-xl"><div class="flex items-center gap-3"><div class="p-2.5 bg-pink-500 rounded-xl shrink-0"><i data-lucide="play" class="w-5 h-5 text-white"></i></div><div><p class="text-gray-400 text-[10px] font-black uppercase">Prossima Lezione</p><p class="font-black text-white text-base">${window.COURSE_DATA.find(d => d.day === nextDay)?.title}</p></div></div><button onclick="window.startDay(${nextDay})" class="bg-pink-500 text-white px-6 py-3 rounded-xl font-black shadow-lg hover:scale-105 flex items-center gap-2">Inizia Ora <i data-lucide="arrow-right" class="w-5 h-5"></i></button></div>` : ``}
      <div class="bg-white rounded-2xl p-5 mb-6 border shadow-sm"><div class="flex items-center justify-between mb-3"><h3 class="font-black text-gray-800 flex items-center gap-2 text-sm"><i data-lucide="map-pin" class="w-4 h-4 text-pink-500"></i> Korea Tour Sbloccato</h3><span class="text-xs font-black text-pink-500">${window.MAP_REGIONS.filter(r => state.completedDays.includes(r.unlocksAtDay)).length} / ${window.MAP_REGIONS.length}</span></div><div class="flex gap-1.5 flex-wrap">${window.MAP_REGIONS.map(r => `<span class="text-xl ${state.completedDays.includes(r.unlocksAtDay) ? '' : 'grayscale opacity-30'}">${r.icon}</span>`).join('')}</div></div>
      <div class="bg-white rounded-2xl md:rounded-[2rem] korean-shadow p-5 md:p-10 mb-8 border relative z-10"><h2 class="text-2xl md:text-3xl font-black text-gray-800 flex items-center gap-3 border-b-2 pb-4 mb-6"><i data-lucide="map" class="text-blue-400 w-6 h-6"></i> Syllabus Formativo</h2><div class="space-y-6 md:space-y-8 relative before:absolute before:inset-0 before:ml-[1.35rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 md:before:w-1.5 before:bg-gradient-to-b before:from-pink-200 before:via-blue-200 before:to-gray-200 before:rounded-full">`;

    window.COURSE_DATA.forEach(dayData => {
      const isCompleted = state.completedDays.includes(dayData.day);
      const isLocked = dayData.day > 1 && !state.completedDays.includes(dayData.day - 1);
      const needsReview = isCompleted && (state.mistakesRecord[dayData.day] || []).length > 0;
      let circleClass = isCompleted ? "bg-blue-500 text-white shadow-md border-blue-100" : isLocked ? "bg-gray-200 text-gray-400 border-white" : "bg-pink-500 text-white scale-110 shadow-pink-500/40 border-white";
      let circleContent = isCompleted ? `<i data-lucide="check" class="w-5 h-5"></i>` : dayData.day;
      let badgeHtml = isCompleted && !needsReview ? `<span class="text-[10px] font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase">Completato</span>` : needsReview ? `<span class="text-[10px] font-black text-orange-700 bg-orange-100 px-3 py-1 rounded-full uppercase flex gap-1"><i data-lucide="alert-circle" class="w-3 h-3"></i> Ripasso</span>` : isLocked ? `<span class="text-[10px] font-black text-gray-400 bg-gray-100 px-3 py-1 rounded-full uppercase">Bloccato</span>` : '';
      let btnHtml = !isLocked ? `<button onclick="window.startDay(${dayData.day})" class="p-3 rounded-full hover:scale-110 shrink-0 ${isCompleted ? 'bg-blue-50 text-blue-600 border border-blue-100' : 'bg-pink-500 text-white shadow-md'} flex items-center justify-center">${needsReview ? '<i data-lucide="rotate-ccw" class="w-5 h-5"></i>' : '<i data-lucide="play" class="w-5 h-5"></i>'}</button>` : '';

      html += `<div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isLocked ? 'opacity-60 grayscale-[30%]' : ''}"><div class="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-black text-base md:text-lg border-4 ${circleClass}">${circleContent}</div><div class="w-[calc(100%-3.5rem)] md:w-[calc(50%-3rem)] bg-white p-5 rounded-2xl shadow-sm border-2 border-gray-50 transition-all hover:shadow-lg cursor-pointer" onclick="if(!${isLocked}) window.startDay(${dayData.day})"><div class="flex justify-between items-center gap-3"><div class="flex-1"><span class="text-[10px] font-black text-pink-500 uppercase block mb-1">${dayData.topic}</span><h3 class="font-black text-gray-800 leading-tight mb-2 text-lg">${dayData.title}</h3><div class="flex flex-wrap gap-2 mt-2">${badgeHtml}</div></div>${btnHtml}</div></div></div>`;
    });
    return html + `</div></div></div>`;
};

const renderTheory = () => {
    const lesson = window.COURSE_DATA.find(d => d.day === state.activeDay);
    const examplesHtml = lesson.theory.examples.map(ex => `<div class="bg-white border-2 border-gray-100 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:border-pink-200 transition-all"><div><p class="text-2xl font-black text-gray-900 mb-1 hangul-display">${window.renderHangul(ex.hangul)}</p><p class="text-blue-500 font-bold text-sm mb-1">${ex.romaji}</p><p class="text-gray-700 font-black text-base mb-2">"${ex.eng}"</p>${ex.context ? `<p class="text-xs text-gray-500 bg-gray-50 p-2.5 rounded-xl font-bold border">${ex.context}</p>` : ''}</div><button onclick="window.playAudio(event, '${ex.hangul}')" class="flex items-center justify-center gap-2 bg-blue-50 text-blue-700 px-5 py-3 rounded-xl hover:scale-105 shrink-0"><i data-lucide="volume-2" class="w-5 h-5"></i><span class="font-black text-sm">Ascolta</span></button></div>`).join('');
    
    return `<div class="max-w-3xl mx-auto animate-pop"><button onclick="window.changeView('dashboard')" class="text-gray-500 mb-4 flex items-center font-black text-sm hover:bg-gray-100 px-3 py-2 rounded-lg"><i data-lucide="arrow-left" class="w-5 h-5 mr-2"></i> Torna alla Mappa</button><div class="bg-white rounded-2xl korean-shadow overflow-hidden border border-blue-50"><div class="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 md:p-12 relative overflow-hidden"><span class="bg-white/20 px-3 py-1.5 rounded-full text-[10px] font-black uppercase mb-4 inline-block shadow-sm border border-white/30">Giorno ${lesson.day} • Teoria</span><h2 class="text-2xl md:text-4xl font-black relative z-10">${lesson.title}</h2></div><div class="p-5 md:p-10 space-y-8 text-gray-700"><div class="flex gap-4 bg-pink-50 p-5 rounded-2xl border border-pink-100 shadow-sm"><i data-lucide="quote" class="text-pink-500 shrink-0 w-8 h-8"></i><p class="font-bold text-pink-900 text-base">${lesson.theory.intro}</p></div><div><h3 class="font-black text-gray-800 mb-4 flex items-center gap-3 text-xl"><div class="p-2 bg-blue-100 rounded-xl text-blue-600"><i data-lucide="brain" class="w-5 h-5"></i></div> Il Concetto Base</h3><p class="font-bold text-base">${lesson.theory.concept}</p></div><div><h3 class="font-black text-gray-800 mb-4 text-xl border-b-2 pb-3 border-gray-100">Frasi Chiave 📝</h3><div class="space-y-4">${examplesHtml}</div></div>${lesson.theory.builderRule ? `<div class="bg-indigo-50 rounded-2xl p-5 border border-indigo-100 flex gap-4 shadow-sm"><i data-lucide="link" class="text-indigo-500 shrink-0 w-8 h-8"></i><div><h3 class="font-black text-indigo-900 mb-1 text-lg">Conversation Builder</h3><p class="font-bold text-sm">${lesson.theory.builderRule}</p></div></div>` : ''}${lesson.theory.buildingBlocks ? `<div class="bg-yellow-50 rounded-2xl p-5 border border-yellow-200 flex gap-4 shadow-sm"><i data-lucide="puzzle" class="text-yellow-500 shrink-0 w-8 h-8"></i><div><h3 class="font-black text-yellow-900 mb-1 text-lg">Mattoncini della Frase 🧩</h3><p class="font-bold text-sm">${lesson.theory.buildingBlocks}</p></div></div>` : ''}</div><div class="p-5 bg-gray-50 border-t-2 border-gray-100 flex justify-end"><button onclick="window.startGame()" class="bg-pink-500 text-white px-6 py-4 rounded-xl font-black text-lg shadow-lg hover:scale-105 flex items-center gap-3 w-full md:w-auto">Inizia la Pratica (${lesson.exercises.length} Es) <i data-lucide="play-circle" class="w-6 h-6"></i></button></div></div></div>`;
};

const renderGame = () => {
    const lesson = window.COURSE_DATA.find(d => d.day === state.activeDay);
    const exercise = lesson.exercises[state.gameStep];
    const isAnswered = state.selectedAnswer !== null;
    let isCorrect = isAnswered && state.selectedAnswer === (exercise.answer ?? true);

    let exerciseHtml = '';
    
    // 1. Multiple Choice / Listen / Conversation
    if (['multiple_choice', 'listen', 'conversation'].includes(exercise.type)) {
        exerciseHtml = `<div class="space-y-3">` + exercise.options.map((opt, i) => {
            let btnClass = "bg-white border-2 border-gray-200 hover:border-pink-400 hover:bg-pink-50 text-gray-700";
            let iconHtml = '';
            if (isAnswered) {
                if (i === exercise.answer) { btnClass = "bg-green-50 border-green-500 text-green-900 shadow-md scale-[1.02] z-10"; iconHtml = `<i data-lucide="check-circle-2" class="text-green-500 w-6 h-6 animate-pop"></i>`; } 
                else if (i === state.selectedAnswer) { btnClass = "bg-rose-50 border-rose-500 text-rose-900"; iconHtml = `<i data-lucide="x-circle" class="text-rose-500 w-6 h-6"></i>`; } 
                else { btnClass = "bg-gray-50 border-gray-100 text-gray-400 opacity-60"; }
            }
            const hasHangul = /[\u3131-\uD79D]/ugi.test(opt);
            const optionText = hasHangul ? window.renderHangul(opt) : opt;
            const audioBtn = (exercise.optionsHangul && exercise.optionsHangul[i]) ? `<button onclick="window.playAudio(event, '${exercise.optionsHangul[i]}')" class="p-3 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-200 mr-3 border border-blue-100 z-10 outline-none"><i data-lucide="volume-2" class="w-5 h-5"></i></button>` : '';

            return `<div class="relative w-full rounded-[1rem] transition-all cursor-pointer shadow-sm min-h-[70px] flex items-center ${btnClass}" onclick="if(!${isAnswered}) window.handleMultipleChoiceAnswer(${i})"><div class="flex items-center w-full p-3 md:p-4 h-full">${audioBtn}<span class="font-black text-lg md:text-xl flex-grow ${hasHangul ? 'hangul-display' : ''}">${optionText}</span><div class="flex items-center gap-2 shrink-0 ml-2">${iconHtml}</div></div></div>`;
        }).join('') + `</div>`;
    } 
    // 2. Sentence Builder
    else if (exercise.type === 'sentence_builder') {
        const availableWords = exercise.options.filter(w => !state.builderSelection.includes(w));
        exerciseHtml = `<div class="space-y-6"><div class="min-h-[80px] p-4 rounded-2xl border-2 border-dashed ${isAnswered ? (isCorrect ? 'border-green-400 bg-green-50' : 'border-rose-400 bg-rose-50') : 'border-pink-300 bg-pink-50'} flex flex-wrap gap-2 items-center">${state.builderSelection.map(w => `<span class="word-chip bg-pink-500 text-white font-black px-4 py-2 rounded-xl shadow-md text-lg" onclick="window.handleBuilderClick('${w}', false)">${w}</span>`).join('')}${state.builderSelection.length === 0 ? `<span class="text-pink-400 font-bold ml-2">Tocca le parole qui sotto...</span>` : ''}</div><div class="flex flex-wrap gap-2 justify-center border-t pt-6 border-gray-100">${availableWords.map(w => `<span class="word-chip bg-white border-2 border-gray-200 text-gray-700 font-black px-4 py-2 rounded-xl shadow-sm text-lg hover:border-pink-400 hover:text-pink-600" onclick="window.handleBuilderClick('${w}', true)">${w}</span>`).join('')}</div>${!isAnswered ? `<button onclick="window.checkSentenceBuilder()" class="w-full mt-4 bg-blue-500 hover:bg-blue-600 text-white font-black py-4 rounded-xl shadow-md transition-colors disabled:opacity-50 disabled:bg-gray-300" ${state.builderSelection.length===0?'disabled':''}>Verifica Frase</button>` : ''}</div>`;
    }
    // 3. Matching
    else if (exercise.type === 'matching') {
        const { koOptions, itOptions } = state.matchingSetup;
        const renderCol = (opts) => opts.map(opt => {
            const isMatched = state.matchingState.matched.includes(opt.id);
            const isSelected = state.matchingState.selectedId && state.matchingState.selectedId.id === opt.id && state.matchingState.selectedId.type === opt.type;
            let btnClass = isMatched ? 'bg-green-100 border-green-300 text-green-700 opacity-50 scale-95 cursor-default' : isSelected ? 'bg-pink-100 border-pink-500 text-pink-700 scale-[1.02] shadow-md' : 'bg-white border-gray-200 text-gray-700 shadow-sm hover:border-pink-300';
            return `<div onclick="window.handleMatchClick(${opt.id}, '${opt.type}', '${opt.text}')" class="word-chip p-3 md:p-4 rounded-xl border-2 font-black text-center min-h-[60px] flex items-center justify-center transition-all ${btnClass}">${opt.text}</div>`;
        }).join('');
        exerciseHtml = `<div class="grid grid-cols-2 gap-4"><div class="flex flex-col gap-3 flex-1">${renderCol(koOptions)}</div><div class="flex flex-col gap-3 flex-1">${renderCol(itOptions)}</div></div>`;
    }
    // 4. Speak
    else if (exercise.type === 'speak') {
        if(state.fallbackActive && !isAnswered) {
            exerciseHtml = `<div class="space-y-3 w-full animate-pop"><p class="text-xs font-bold text-orange-600 bg-orange-50 p-3 rounded-xl border border-orange-200 mb-4 flex items-start gap-2"><i data-lucide="info" class="w-4 h-4 mt-0.5"></i> Scegli la <b>pronuncia fonetica esatta</b>!</p>${state.fallbackOptions.map((opt, i) => `<button onclick="window.handleFallbackAnswer(${i})" class="w-full text-left p-4 rounded-xl border-2 border-gray-200 hover:border-pink-400 hover:bg-pink-50 font-black text-lg transition-all shadow-sm flex items-center justify-between min-h-[70px]"><span class="break-words mr-3">${opt}</span> <i data-lucide="ear" class="w-5 h-5 text-pink-400"></i></button>`).join('')}</div>`;
        } else {
            const btnClasses = state.isRecording ? 'bg-pink-500 scale-110 shadow-2xl shadow-pink-500/50 recording-pulse border-white border-4' : isAnswered ? 'bg-gray-200 text-gray-400' : 'bg-blue-500 text-white shadow-xl hover:scale-105 border-4 border-blue-200';
            const msg = state.isRecording ? "Ti sto ascoltando..." : isAnswered ? "Analisi completata." : "Tocca per parlare";
            exerciseHtml = `<div class="flex flex-col items-center justify-center mt-6 space-y-6 bg-gray-50 p-6 rounded-3xl border-2 border-dashed border-gray-200 min-h-[250px] relative"><button ${isAnswered || state.isRecording ? 'disabled' : ''} onmousedown="window.handleSpeechRecognition(event)" ontouchstart="window.handleSpeechRecognition(event)" class="relative w-32 h-32 rounded-full flex items-center justify-center transition-all ${btnClasses} no-select outline-none"><i data-lucide="mic" class="w-12 h-12 ${state.isRecording ? 'animate-bounce' : ''}"></i></button><p class="text-gray-600 font-black text-center text-lg">${msg}</p>${(!isAnswered && !state.isRecording) ? `<button onclick="window.triggerSpeechFallback()" class="absolute bottom-3 right-3 text-[10px] font-bold text-gray-400 bg-white border border-gray-200 px-3 py-2 rounded-lg">Salta</button>` : ''}</div>`;
        }
    }

    const typeLabels = {
        speak: { label: 'Pronuncia', icon: 'mic', classes: 'text-pink-700 bg-pink-50 border-pink-100' },
        listen: { label: 'Ascolto', icon: 'headphones', classes: 'text-indigo-700 bg-indigo-50 border-indigo-100' },
        matching: { label: 'Coppie', icon: 'puzzle', classes: 'text-purple-700 bg-purple-50 border-purple-100' },
        sentence_builder: { label: 'Costruzione', icon: 'blocks', classes: 'text-teal-700 bg-teal-50 border-teal-100' },
        multiple_choice: { label: 'Quiz', icon: 'brain', classes: 'text-blue-700 bg-blue-50 border-blue-100' },
        conversation: { label: 'Dialogo', icon: 'message-square', classes: 'text-orange-700 bg-orange-50 border-orange-100' }
    };
    const tData = typeLabels[exercise.type] || typeLabels.multiple_choice;

    return `
    <div class="max-w-2xl mx-auto animate-pop">
        <div class="flex justify-between items-center mb-4 px-1"><div class="flex items-center gap-2 bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100"><i data-lucide="flame" class="w-5 h-5 ${state.combo > 1 ? 'text-orange-500 animate-pulse' : 'text-gray-300'}"></i><span class="font-black text-sm ${state.combo > 1 ? 'text-orange-600' : 'text-gray-400'}">Streak: ${state.combo}</span></div><span class="font-black text-gray-500 text-sm bg-white px-3 py-1.5 rounded-xl shadow-sm border border-gray-100">${state.gameStep + 1} / ${lesson.exercises.length}</span></div>
        <div class="mb-6 flex items-center gap-4 bg-white p-2 rounded-2xl shadow-sm border border-gray-100"><div class="flex-grow bg-gray-100 h-3 rounded-xl overflow-hidden shadow-inner"><div class="bg-gradient-to-r from-blue-400 to-pink-500 h-full transition-all duration-700" style="width: ${(state.gameStep / lesson.exercises.length) * 100}%"></div></div></div>
        <div class="bg-white rounded-[2rem] korean-shadow p-5 md:p-10 min-h-[450px] flex flex-col border border-blue-50 relative overflow-hidden">
          <div class="flex-grow z-10">
            <div class="flex justify-center mb-6"><span class="${tData.classes} text-[10px] md:text-sm font-black px-4 py-1.5 rounded-full uppercase shadow-sm border flex items-center gap-2"><i data-lucide="${tData.icon}" class="w-4 h-4 shrink-0"></i> ${tData.label}</span></div>
            ${exercise.type === 'listen' ? `<div class="flex justify-center mb-5"><button onclick="window.playAudio(event, '${exercise.audioHangul}')" class="flex items-center gap-3 bg-pink-500 text-white px-6 py-4 rounded-full hover:scale-105 shadow-xl shadow-pink-500/30"><i data-lucide="volume-2" class="w-6 h-6 animate-pulse"></i><span class="font-black text-lg">Riproduci Audio</span></button></div>` : ''}
            ${exercise.context ? `<div class="mb-6 w-full flex justify-start"><div class="chat-bubble bg-orange-50 border-2 border-orange-200 p-4 rounded-2xl rounded-bl-none shadow-sm w-11/12"><p class="text-orange-900 font-bold text-sm md:text-lg">${exercise.context}</p></div></div>` : ''}
            <h2 class="text-xl md:text-3xl font-black text-gray-800 mb-6 text-center leading-snug">${exercise.question}</h2>
            ${exerciseHtml}
          </div>
          <div class="mt-8 transition-all duration-500 z-10 ${isAnswered ? 'opacity-100 translate-y-0 block' : 'opacity-0 translate-y-4 hidden'}">
            <div class="p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start shadow-sm border-2 ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-rose-50 border-rose-200'}">
              <div class="p-3 rounded-full text-white shadow-md ${isCorrect ? 'bg-green-500' : 'bg-rose-500'}"><i data-lucide="${isCorrect ? 'check' : 'message-circle-warning'}" class="w-6 h-6"></i></div>
              <div class="flex-grow"><h4 class="font-black text-xl mb-1">${isCorrect ? 'Perfetto, Sara! 🎉' : 'Oops, non ti arrendere! 💪'}</h4><p class="font-bold text-sm text-gray-800">${isCorrect ? "Ottima risposta, vai avanti così." : (exercise.feedback_incorrect || "Riprova.")}</p>${!isCorrect && exercise.tip ? `<div class="bg-white/50 p-3 rounded-xl border border-white/40 mt-2 font-bold text-xs text-gray-700 shadow-inner"><strong>💡 Hint del Sensei:</strong><br/>${exercise.tip}</div>` : ''}</div>
            </div>
            <button onclick="window.nextQuestion()" class="w-full mt-4 py-4 rounded-xl font-black text-lg text-white shadow-xl hover:scale-[1.02] ${isCorrect ? 'bg-green-500 shadow-green-500/30' : 'bg-rose-500 shadow-rose-500/30'}">${state.gameStep === lesson.exercises.length - 1 ? 'Termina Lezione' : 'Prossima Domanda'}</button>
          </div>
        </div>
    </div>`;
};

const renderResult = () => {
    const lesson = window.COURSE_DATA.find(d => d.day === state.activeDay);
    const isPerfect = state.score === lesson.exercises.length;
    const adminCode = window._s_k_d[state.activeDay];

    return `<div class="max-w-lg mx-auto text-center px-4 animate-pop"><div class="bg-white rounded-3xl korean-shadow p-8 border border-blue-50 mt-4"><div class="w-24 h-24 bg-gradient-to-br from-yellow-300 to-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl"><i data-lucide="trophy" class="w-12 h-12"></i></div><h2 class="text-3xl font-black text-gray-900 mb-2">Lezione Completata!</h2><p class="text-blue-500 mb-8 font-black uppercase text-xs">Giorno ${state.activeDay}</p><div class="text-[4rem] font-black text-pink-500 mb-6 drop-shadow-md">${state.score}<span class="text-3xl text-gray-400">/${lesson.exercises.length}</span></div>${state.newlyUnlockedLocation ? `<div class="bg-gradient-to-br from-pink-50 to-blue-50 border-2 border-pink-200 rounded-2xl p-5 mb-6 text-left"><p class="text-xs font-black text-pink-500 uppercase flex items-center gap-2 mb-2"><i data-lucide="map-pin" class="w-4 h-4"></i> Nuova Location Sbloccata!</p><div class="flex gap-4 items-center"><img src="${state.newlyUnlockedLocation.image}" class="w-20 h-16 object-cover rounded-xl border-2 border-pink-100 shadow-md" /><h3 class="font-black text-gray-900 text-base">${state.newlyUnlockedLocation.name}</h3></div><button onclick="window.changeView('explore')" class="mt-4 w-full bg-pink-500 text-white py-2.5 rounded-xl font-black text-sm">Esplora nel Korea Tour</button></div>` : ''}<p class="text-base font-bold text-gray-600 mb-6">${isPerfect ? "Sei stata IMPECCABILE! 🌸 화이팅! ✊" : "Ottimo sforzo! 화이팅! ✊"}</p><div class="bg-gray-100 p-3 rounded-xl mb-8 border border-gray-200 text-xs font-bold text-gray-600 text-left shadow-sm"><i data-lucide="key" class="w-4 h-4 inline text-pink-500 mb-0.5"></i> Codice Segreto: <span class="font-mono bg-white px-2 py-1 rounded shadow-sm text-pink-600 border border-pink-100">${adminCode}</span></div><button onclick="window.changeView('dashboard')" class="w-full bg-gray-900 text-white py-4 rounded-xl font-black text-lg shadow-xl hover:scale-[1.02] flex justify-center items-center gap-2"><i data-lucide="map" class="w-6 h-6"></i> Torna al Percorso</button></div></div>`;
};

const renderExplore = () => {
    const unlockedCount = window.MAP_REGIONS.filter(r => state.completedDays.includes(r.unlocksAtDay)).length;
    let html = `<div class="max-w-5xl mx-auto animate-pop"><div class="bg-white rounded-2xl p-6 mb-6 korean-shadow border border-blue-50 text-center"><h1 class="text-3xl md:text-5xl font-black text-gray-900 mb-3 flex justify-center items-center gap-3"><i data-lucide="map" class="w-8 h-8 text-blue-500"></i> Korea Tour 🇰🇷</h1><div class="bg-gray-50 rounded-2xl p-4 border border-gray-100"><div class="flex justify-between items-center mb-2"><span class="text-xs font-black text-gray-600 uppercase">Location Sbloccate</span><span class="text-sm font-black text-pink-500">${unlockedCount} / ${window.MAP_REGIONS.length}</span></div><div class="w-full bg-gray-200 rounded-full h-3"><div class="bg-gradient-to-r from-pink-400 to-blue-400 h-full rounded-full" style="width:${(unlockedCount/window.MAP_REGIONS.length)*100}%"></div></div></div></div><div class="w-full h-[400px] rounded-2xl shadow-xl border-4 border-white mb-8 relative bg-gray-100 flex items-center justify-center"><div id="korea-map" class="absolute inset-0 z-10"></div><i data-lucide="loader-2" class="animate-spin w-8 h-8 text-gray-400 absolute"></i></div><div class="grid grid-cols-1 md:grid-cols-2 gap-6">`;
    window.MAP_REGIONS.forEach(region => {
      const isUnlocked = state.completedDays.includes(region.unlocksAtDay);
      html += `<div class="bg-white rounded-2xl overflow-hidden shadow-md border-2 ${isUnlocked ? 'border-gray-50 hover:border-blue-100' : 'border-gray-100 opacity-70'} flex flex-col"><div class="h-48 relative bg-gray-200">${isUnlocked ? `<img src="${region.image}" class="w-full h-full object-cover" />` : `<div class="w-full h-full flex items-center justify-center"><i data-lucide="lock" class="w-12 h-12 text-gray-400"></i></div>`}<span class="absolute bottom-4 left-4 text-4xl">${region.icon}</span>${!isUnlocked ? `<div class="absolute top-3 right-3 bg-black/60 text-white text-[10px] font-black px-2 py-1 rounded-full">🔒 Giorno ${region.unlocksAtDay}</div>` : ''}</div><div class="p-6 flex-1 flex flex-col"><h2 class="text-xl font-black text-gray-800 mb-2">${region.name}</h2>${!isUnlocked ? `<p class="text-xs font-bold text-gray-400">Completa il Giorno ${region.unlocksAtDay} per sbloccare.</p>` : `<p class="text-sm text-gray-600 font-bold mb-4">${region.desc}</p>`}</div></div>`;
    });
    return html + `</div></div>`;
};

const renderLibrary = () => {
    let html = `<div class="max-w-5xl mx-auto animate-pop"><div class="bg-white p-6 rounded-[2rem] korean-shadow border mb-8"><h2 class="text-2xl font-black text-gray-900 mb-2 flex items-center gap-2"><div class="p-2 bg-pink-100 text-pink-600 rounded-xl"><i data-lucide="bot" class="w-6 h-6"></i></div> Traduttore AI</h2><div class="flex flex-col md:flex-row gap-3"><input type="text" id="transInput" value="${state.transInput}" onchange="state.transInput = this.value" placeholder="es., Quanto costa?" class="flex-grow border-2 rounded-xl p-4 font-bold outline-none focus:border-pink-500" /><button onclick="window.runTranslation()" class="bg-pink-500 text-white px-6 py-4 rounded-xl font-black hover:scale-105 shadow-md flex items-center gap-2"><i data-lucide="languages" class="w-5 h-5"></i> Traduci</button></div>${state.transResult ? `<div class="mt-6 bg-gray-900 p-5 rounded-2xl flex justify-between items-center text-white"><div class="w-full"><span class="text-2xl font-black block mb-2 hangul-display">${window.renderHangul(state.transResult)}</span><span class="text-sm font-bold text-blue-300">${state.transRomaji}</span></div><button onclick="window.playAudio(event, '${state.transResult}')" class="bg-blue-500 text-white p-4 rounded-full hover:scale-110"><i data-lucide="volume-2" class="w-6 h-6"></i></button></div>` : ''}</div><div class="space-y-4">`;
    window.LIBRARY_DATA.forEach(section => {
      let itemsHtml = section.items.map(item => `<div class="bg-white p-5 rounded-[1.2rem] shadow-sm border border-gray-50"><div class="flex justify-between items-start mb-3"><div class="w-full"><p class="text-xl font-black text-gray-900 mb-1 hangul-display">${window.renderHangul(item.hangul)}</p><p class="text-[10px] font-black text-blue-500 uppercase">${item.romaji}</p></div><button onclick="window.playAudio(event, '${item.hangul}')" class="bg-gray-50 p-2 rounded-full text-gray-700"><i data-lucide="volume-2" class="w-5 h-5"></i></button></div><p class="font-black text-base mb-2">"${item.eng}"</p><p class="text-xs text-gray-500 bg-gray-50 p-3 rounded-xl font-bold">${item.context}</p></div>`).join('');
      html += `<details class="group bg-white rounded-2xl border-2 border-gray-100 shadow-sm overflow-hidden mb-4"><summary class="flex items-center justify-between p-5 cursor-pointer outline-none"><div class="flex items-center gap-3"><div class="p-2 bg-gray-100 rounded-xl group-open:bg-pink-100"><i data-lucide="${section.icon}" class="${section.iconColor} w-6 h-6"></i></div><h2 class="text-lg font-black text-gray-800">${section.category}</h2></div><div class="bg-gray-100 p-1.5 rounded-full text-gray-500 group-open:bg-pink-100 group-open:text-pink-500 group-open:rotate-180"><i data-lucide="chevron-down" class="w-5 h-5"></i></div></summary><div class="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50">${itemsHtml}</div></details>`;
    });
    return html + `</div></div>`;
};

const renderProfile = () => {
    return `<div class="max-w-md mx-auto px-4 animate-pop"><div class="bg-white rounded-[2rem] korean-shadow p-6 border text-center mt-4"><div class="w-24 h-24 bg-pink-50 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl border-4 border-white"><i data-lucide="user" class="w-12 h-12"></i></div><h2 class="text-2xl font-black text-gray-900 mb-1">Profilo di Studio</h2><p class="text-gray-500 mb-2 font-bold text-sm">Il tuo viaggio in Corea è al sicuro qui.</p><div class="inline-flex items-center gap-2 bg-yellow-50 px-4 py-2 rounded-full mb-8"><i data-lucide="zap" class="w-4 h-4 text-yellow-500"></i><span class="font-black text-yellow-700 text-sm">${getXPLevel(state.xp).title} — ${state.xp} XP</span></div><div class="text-left mb-6"><label class="block text-[10px] font-black text-gray-500 mb-2 uppercase">Cambia Nome Studente</label><input type="text" value="${state.profileName}" onchange="state.profileName = this.value; saveProgress(state.completedDays, state.mistakesRecord);" class="w-full border-2 rounded-xl p-4 text-xl font-black outline-none focus:border-pink-500 bg-gray-50 focus:bg-white" /></div><div class="text-left mb-6 p-5 rounded-2xl border"><label class="block text-[10px] font-black text-gray-800 mb-2 uppercase">Grandezza Testo</label><div class="flex gap-4 items-center"><span class="text-xs font-black text-gray-400">가</span><input type="range" min="1" max="1.6" step="0.1" value="${state.hangulScale || 1}" onchange="window.updateHangulSize(this.value)" class="flex-grow" /><span class="text-xl font-black text-pink-500">가</span></div></div><div class="text-left mb-8 bg-pink-50 p-5 rounded-2xl border border-pink-100"><label class="block text-[10px] font-black text-pink-600 mb-2 uppercase">Inserisci Codice Sblocco</label><div class="flex gap-2"><input type="text" id="unlockCodeInput" placeholder="es. SR20K" class="w-full border-2 border-pink-200 rounded-xl p-3 font-bold uppercase outline-none focus:border-pink-500" /><button onclick="window.unlockDayWithCode(document.getElementById('unlockCodeInput').value)" class="bg-pink-500 text-white px-4 rounded-xl font-bold"><i data-lucide="arrow-right" class="w-5 h-5"></i></button></div></div><button onclick="if(confirm('Vuoi davvero azzerare i tuoi progressi?')) { localStorage.removeItem('sara_korean_save_v3'); state.completedDays = []; state.mistakesRecord = {}; saveProgress([], {}); renderApp(); }" class="w-full bg-white border-2 border-gray-200 hover:bg-red-50 hover:text-red-600 text-gray-500 py-4 rounded-xl font-black text-base shadow-sm flex justify-center items-center gap-2"><i data-lucide="trash-2" class="w-5 h-5"></i> Resetta Percorso</button></div></div>`;
};

const renderApp = () => {
  const root = document.getElementById('root');
  let overlayHtml = state.isTransitioning ? `<div class="fixed inset-0 bg-white/80 backdrop-blur-sm z-[10000] flex items-center justify-center animate-fadein"><div class="bg-white p-6 rounded-3xl shadow-2xl flex flex-col items-center"><i data-lucide="loader-2" class="animate-spin text-pink-500 w-12 h-12 mb-3"></i><span class="font-black text-gray-600 uppercase text-xs">Caricamento</span></div></div>` : '';
  
  let content = '';
  if (state.currentView === 'dashboard') content = renderDashboard();
  else if (state.currentView === 'theory') content = renderTheory();
  else if (state.currentView === 'game') content = renderGame();
  else if (state.currentView === 'result') content = renderResult();
  else if (state.currentView === 'library') content = renderLibrary();
  else if (state.currentView === 'explore') content = renderExplore();
  else if (state.currentView === 'profile') content = renderProfile();

  root.innerHTML = `
    ${overlayHtml}
    <header class="app-top-bar w-full bg-white/95 backdrop-blur-md border-b border-gray-100 z-[9000] flex-shrink-0 pt-safe"><div class="max-w-4xl mx-auto px-4 py-3 flex justify-between items-center"><div class="font-black text-pink-500 text-lg flex items-center gap-2"><i data-lucide="sparkles" class="w-5 h-5"></i><span>Annyeong, ${state.profileName}!</span></div><button onclick="window.toggleDarkMode()" class="p-2.5 rounded-full bg-gray-50 shadow-sm border border-gray-200 outline-none"><i data-lucide="${state.isDarkMode ? 'moon' : 'sun'}" class="w-5 h-5 ${state.isDarkMode ? 'text-blue-300' : 'text-yellow-500'}"></i></button></div></header>
    <main class="flex-1 overflow-y-auto w-full pb-20 md:pb-0 hide-scroll"><div class="max-w-[100vw] mx-auto p-4 md:p-8 w-full relative animate-fadein">${content}</div></main>
    ${renderNav()}
  `;
  lucide.createIcons();
  if (state.currentView === 'explore' && !state.isTransitioning) setTimeout(window.initMap, 50);
};

// Avvio applicazione
loadLocalProgress();
renderApp();
