// ============================================================
// render.js — All view renderers
// ============================================================
import { state, escHtml } from './state.js';
import { renderHangul } from './helpers.js';
import { getAllDaysMeta, getDay } from './course.js';
import { LIBRARY_DATA, MAP_REGIONS } from './data.js';

// ─── HELPERS ─────────────────────────────────────────────────
const navBtn = (view, icon, label) => `
  <button onclick="window.app.changeView('${view}')" 
    class="nav-btn flex flex-col items-center gap-1 transition-all ${state.currentView === view ? 'text-pink-500 scale-110' : 'text-gray-400 dark:text-slate-400 hover:text-blue-500'}"
    aria-current="${state.currentView === view ? 'page' : 'false'}"
    aria-label="${label}">
    <i data-lucide="${icon}" class="w-7 h-7"></i>
    <span class="text-[10px] md:text-xs font-black uppercase tracking-widest">${label}</span>
  </button>`;

// ─── NAV ─────────────────────────────────────────────────────
export const renderNav = () => `
  <nav class="fixed bottom-0 w-full bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-t border-blue-100 dark:border-slate-800 pb-safe z-[9999] shadow-[0_-10px_20px_-5px_rgba(0,0,0,0.05)] md:relative md:border-b md:border-t-0 flex-shrink-0" role="navigation" aria-label="Navigazione principale">
    <div class="max-w-4xl mx-auto flex justify-between md:justify-center md:gap-16 px-4 py-3 md:p-5">
      ${navBtn('dashboard','map-pin','Percorso')}
      ${navBtn('explore','compass','Korea Tour')}
      ${navBtn('library','book-marked','Guida')}
      ${navBtn('profile','circle-user-round','Profilo')}
    </div>
  </nav>`;

// ─── DASHBOARD ───────────────────────────────────────────────
export const renderDashboard = () => {
  const allMeta = getAllDaysMeta();
  const totalProgress = Math.min((state.completedDays.length / 45) * 100, 100);
  const streak = state.combo > 0 ? state.combo : (state.completedDays.length > 0 ? 1 : 0);
  const safeProfileName = escHtml(state.profileName);

  let dayItems = allMeta.map(meta => {
    const isCompleted = state.completedDays.includes(meta.day);
    const isLocked = meta.day > 1 && !state.completedDays.includes(meta.day - 1);
    const dayMistakes = state.mistakesRecord[meta.day] || [];
    const needsReview = isCompleted && dayMistakes.length > 0;

    let circleClass = "bg-pink-500 text-white shadow-lg shadow-pink-500/40 border-4 border-white";
    let circleContent = meta.day;
    if (isCompleted) { circleClass = "bg-blue-500 text-white shadow-md border-4 border-blue-100"; circleContent = `<i data-lucide="check" class="w-5 h-5"></i>`; }
    else if (isLocked) { circleClass = "bg-gray-200 dark:bg-slate-700 text-gray-400 border-4 border-white dark:border-slate-600"; }

    let badges = '';
    if (isCompleted && !needsReview) badges += `<span class="text-[10px] font-black text-blue-700 bg-blue-100 px-3 py-1 rounded-full uppercase tracking-wider">✓ Completato</span>`;
    if (needsReview) badges += `<span class="text-[10px] font-black text-orange-700 bg-orange-100 px-3 py-1 rounded-full uppercase tracking-wider">↺ Ripasso</span>`;
    if (isLocked) badges += `<span class="text-[10px] font-black text-gray-400 bg-gray-100 dark:bg-slate-800 px-3 py-1 rounded-full uppercase tracking-wider">🔒 Bloccato</span>`;

    const btnClass = isCompleted ? 'bg-blue-50 text-blue-600 hover:bg-blue-100 border border-blue-100' : 'bg-pink-500 text-white hover:bg-pink-600 shadow-md shadow-pink-500/30';
    const btnIcon = needsReview ? 'rotate-ccw' : 'play';
    const btnHtml = !isLocked
      ? `<button onclick="window.app.startDay(${meta.day})" class="p-3 rounded-full transition-all hover:scale-110 shrink-0 ${btnClass} min-h-[48px] min-w-[48px] flex items-center justify-center" aria-label="Inizia ${escHtml(meta.title)}"><i data-lucide="${btnIcon}" class="w-5 h-5"></i></button>`
      : '';

    return `
      <div class="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group ${isLocked ? 'opacity-60 grayscale-[30%]' : ''}">
        <div class="flex items-center justify-center w-10 h-10 md:w-12 md:h-12 rounded-full shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 font-black text-base transition-transform ${circleClass}">
          ${circleContent}
        </div>
        <div class="w-[calc(100%-3.5rem)] md:w-[calc(50%-3rem)] bg-white dark:bg-slate-800 p-5 rounded-2xl shadow-sm border-2 border-gray-50 dark:border-slate-700 transition-all hover:shadow-lg hover:-translate-y-1 hover:border-pink-200 cursor-pointer" onclick="${!isLocked ? `window.app.startDay(${meta.day})` : ''}">
          <div class="flex justify-between items-center gap-3">
            <div class="flex-1">
              <span class="text-[10px] font-black text-pink-500 uppercase tracking-widest block mb-1">${meta.topic}</span>
              <h3 class="font-black text-gray-800 dark:text-slate-100 leading-tight mb-2 text-lg">${escHtml(meta.title)}</h3>
              <p class="text-[11px] text-gray-400 font-bold mb-2 flex items-center gap-1"><i data-lucide="clock" class="w-3 h-3"></i> ${meta.exerciseCount} Esercizi</p>
              <div class="flex flex-wrap gap-2 mt-2">${badges}</div>
            </div>
            ${btnHtml}
          </div>
        </div>
      </div>`;
  }).join('');

  return `
  <div class="max-w-4xl mx-auto relative">
    <div class="hangul-watermark" aria-hidden="true">가자</div>
    
    <header class="bg-gradient-to-br from-pink-400 via-pink-300 to-blue-400 text-white rounded-2xl md:rounded-[2rem] p-6 md:p-10 mb-6 korean-shadow flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
      <div class="absolute top-0 right-0 opacity-10 pointer-events-none" aria-hidden="true"><i data-lucide="sparkles" class="w-48 h-48"></i></div>
      <div class="z-10 w-full">
        <h1 class="text-3xl md:text-5xl font-black mb-3 tracking-tight no-select">Studio in Corso 🌸</h1>
        <p class="text-pink-50 text-base md:text-xl font-bold mb-4">Il tuo percorso per padroneggiare il Coreano in 45 giorni.</p>
        <div class="w-full max-w-md bg-white/20 h-4 rounded-full overflow-hidden" role="progressbar" aria-valuenow="${Math.round(totalProgress)}" aria-valuemin="0" aria-valuemax="100">
          <div class="bg-white h-full transition-all duration-1000" style="width:${totalProgress}%"></div>
        </div>
        <p class="text-xs md:text-sm font-bold mt-2">${Math.round(totalProgress)}% Completato — ${totalProgress === 100 ? "Grandiosa! 화이팅! ✊" : "Forza " + safeProfileName + ", 화이팅! ✊"}</p>
      </div>
      <div class="flex gap-3 w-full md:w-auto z-10 shrink-0">
        <div class="flex-1 md:flex-none flex flex-col items-center justify-center bg-white/20 p-3 md:p-4 rounded-2xl border border-white/20 min-w-[80px]">
          <i data-lucide="flame" class="${streak > 0 ? 'text-orange-400 animate-pulse' : 'text-gray-300'} mb-1 w-8 h-8" aria-hidden="true"></i>
          <span class="font-black text-xs">${streak} Streak</span>
        </div>
        <div class="flex-1 md:flex-none flex flex-col items-center justify-center bg-white/20 p-3 md:p-4 rounded-2xl border border-white/20 min-w-[80px]">
          <i data-lucide="award" class="text-yellow-300 mb-1 w-8 h-8" aria-hidden="true"></i>
          <span class="font-black text-xs">${state.completedDays.length} / 45</span>
        </div>
      </div>
    </header>

    <div class="bg-white dark:bg-slate-800 rounded-2xl korean-shadow p-5 md:p-10 mb-8 border border-blue-50 dark:border-slate-700 relative z-10">
      <div class="flex justify-between items-center mb-6 border-b-2 border-blue-50 dark:border-slate-700 pb-4">
        <h2 class="text-2xl md:text-3xl font-black text-gray-800 dark:text-slate-100 flex items-center gap-3">
          <i data-lucide="map" class="text-blue-400 w-7 h-7" aria-hidden="true"></i> Syllabus Formativo
        </h2>
      </div>
      <div class="space-y-6 relative before:absolute before:inset-0 before:ml-[1.35rem] before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-1 before:bg-gradient-to-b before:from-pink-200 before:via-blue-200 before:to-gray-200 before:rounded-full">
        ${dayItems}
      </div>
    </div>
  </div>`;
};

// ─── THEORY ──────────────────────────────────────────────────
export const renderTheory = () => {
  const lesson = getDay(state.activeDay);
  const examplesHtml = lesson.theory.examples.map(ex => `
    <div class="bg-white dark:bg-slate-800 border-2 border-gray-100 dark:border-slate-700 p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm hover:shadow-md hover:border-pink-200 transition-all group">
      <div>
        <p class="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-pink-600 transition-colors hangul-display">${renderHangul(ex.hangul)}</p>
        <p class="text-blue-500 font-bold text-sm mb-1 tracking-wide">${escHtml(ex.romaji)}</p>
        <p class="text-gray-700 dark:text-slate-300 font-black text-base mb-2">"${escHtml(ex.eng)}"</p>
        ${ex.context ? `<p class="text-xs text-gray-500 bg-gray-50 dark:bg-slate-700 p-2.5 rounded-xl font-bold border border-gray-100 dark:border-slate-600 inline-block mt-1">${escHtml(ex.context)}</p>` : ''}
      </div>
      <button onclick="window.app.playAudio('${ex.hangul.replace(/'/g,"&#39;")}')" class="flex items-center justify-center gap-2 bg-blue-50 hover:bg-blue-100 border-2 border-blue-100 text-blue-700 px-5 py-3 rounded-xl transition-transform hover:scale-105 shrink-0 shadow-sm w-full sm:w-auto min-h-[50px]" aria-label="Ascolta pronuncia">
        <i data-lucide="volume-2" class="w-5 h-5" aria-hidden="true"></i><span class="font-black text-sm">Ascolta</span>
      </button>
    </div>
  `).join('');

  return `
  <div class="max-w-3xl mx-auto animate-pop">
    <button onclick="window.app.changeView('dashboard')" class="text-gray-500 mb-4 flex items-center hover:text-gray-800 dark:text-slate-400 dark:hover:text-white font-black text-sm transition-colors px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 w-fit min-h-[44px]" aria-label="Torna alla dashboard">
      <i data-lucide="arrow-left" class="w-5 h-5 mr-2" aria-hidden="true"></i> Torna alla Mappa
    </button>

    <article class="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[2rem] korean-shadow overflow-hidden border border-blue-50 dark:border-slate-700">
      <div class="bg-gradient-to-r from-blue-400 to-pink-400 p-6 md:p-10 relative overflow-hidden">
        <span class="text-xs md:text-sm font-black text-white/70 uppercase tracking-widest mb-2 block">${escHtml(lesson.topic)}</span>
        <h1 class="text-2xl md:text-4xl font-black text-white leading-tight">${escHtml(lesson.title)}</h1>
      </div>

      <div class="p-6 md:p-10 space-y-6">
        <section class="bg-blue-50 dark:bg-blue-900/20 p-5 rounded-2xl border border-blue-100 dark:border-blue-800">
          <h2 class="font-black text-blue-900 dark:text-blue-300 flex items-center gap-2 mb-2"><i data-lucide="book-open" class="w-5 h-5" aria-hidden="true"></i> Introduzione</h2>
          <p class="text-blue-800 dark:text-blue-200 font-bold text-sm md:text-base leading-relaxed">${escHtml(lesson.theory.intro)}</p>
        </section>

        <section class="bg-pink-50 dark:bg-pink-900/20 p-5 rounded-2xl border border-pink-100 dark:border-pink-800">
          <h2 class="font-black text-pink-900 dark:text-pink-300 flex items-center gap-2 mb-2"><i data-lucide="lightbulb" class="w-5 h-5" aria-hidden="true"></i> Concetto Chiave</h2>
          <p class="text-pink-800 dark:text-pink-200 font-bold text-sm md:text-base leading-relaxed">${escHtml(lesson.theory.concept)}</p>
        </section>

        <section class="bg-green-50 dark:bg-green-900/20 p-5 rounded-2xl border border-green-100 dark:border-green-800">
          <h2 class="font-black text-green-900 dark:text-green-300 flex items-center gap-2 mb-2"><i data-lucide="link" class="w-5 h-5" aria-hidden="true"></i> Regola Builder</h2>
          <p class="text-green-800 dark:text-green-200 font-bold text-sm md:text-base leading-relaxed">${escHtml(lesson.theory.builderRule)}</p>
        </section>

        <section>
          <h2 class="font-black text-gray-800 dark:text-slate-100 flex items-center gap-2 mb-4"><i data-lucide="star" class="w-5 h-5 text-yellow-500" aria-hidden="true"></i> Frasi Chiave</h2>
          <div class="space-y-4">${examplesHtml}</div>
        </section>

        ${lesson.theory.culture ? `
        <section class="bg-amber-50 dark:bg-amber-900/20 p-5 rounded-2xl border border-amber-100 dark:border-amber-800">
          <h2 class="font-black text-amber-900 dark:text-amber-300 flex items-center gap-2 mb-2"><i data-lucide="info" class="w-5 h-5" aria-hidden="true"></i> Nota Culturale</h2>
          <p class="text-amber-800 dark:text-amber-200 font-bold text-sm md:text-base leading-relaxed">${escHtml(lesson.theory.culture)}</p>
        </section>` : ''}

        <button onclick="window.app.startGame()" class="w-full bg-gradient-to-r from-pink-500 to-blue-500 hover:from-pink-600 hover:to-blue-600 text-white py-5 rounded-2xl font-black text-xl shadow-xl transition-transform hover:scale-[1.02] flex justify-center items-center gap-3 min-h-[60px]">
          <i data-lucide="play" class="w-6 h-6" aria-hidden="true"></i> Inizia gli Esercizi
        </button>
      </div>
    </article>
  </div>`;
};

// ─── GAME ────────────────────────────────────────────────────
export const renderGame = () => {
  const lesson = getDay(state.activeDay);
  const exercise = lesson.exercises[state.gameStep];
  const isAnswered = state.showFeedback;
  const progressWidth = ((state.gameStep) / lesson.exercises.length) * 100;

  const isCorrect = state.selectedAnswer === true ||
    (typeof state.selectedAnswer === 'number' && state.selectedAnswer === exercise.answer);

  // Type label & styling
  const typeMap = {
    multiple_choice: { label: 'Scelta Multipla', icon: 'list', color: 'bg-blue-100 text-blue-700 border-blue-200' },
    listen: { label: 'Ascolto', icon: 'ear', color: 'bg-purple-100 text-purple-700 border-purple-200' },
    speak: { label: 'Pronuncia', icon: 'mic', color: 'bg-pink-100 text-pink-700 border-pink-200' },
    conversation: { label: 'Scenario Reale', icon: 'message-circle', color: 'bg-green-100 text-green-700 border-green-200' },
  };
  const { label: typeLabel, icon: typeIcon, color: typeColor } = typeMap[exercise.type] || typeMap.multiple_choice;

  let exerciseHtml = '';

  if (exercise.type === 'multiple_choice' || exercise.type === 'listen' || exercise.type === 'conversation') {
    exerciseHtml = `<div class="grid gap-3 md:gap-4" role="radiogroup" aria-label="Opzioni di risposta">`;
    exercise.options.forEach((opt, i) => {
      let btnClass = 'bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-800 dark:text-slate-100 hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30';
      if (isAnswered) {
        if (i === exercise.answer) btnClass = 'bg-green-500 border-green-500 text-white shadow-lg scale-[1.02]';
        else if (i === state.selectedAnswer && i !== exercise.answer) btnClass = 'bg-red-400 border-red-400 text-white opacity-80';
        else btnClass = 'bg-white dark:bg-slate-700 border-2 border-gray-100 dark:border-slate-600 text-gray-400 opacity-60';
      }
      exerciseHtml += `
        <button 
          onclick="window.app.handleMultipleChoiceAnswer(${i})" 
          class="w-full text-left p-4 md:p-5 rounded-2xl font-bold text-base md:text-lg transition-all shadow-sm border-2 ${btnClass} ${isAnswered ? 'cursor-default pointer-events-none' : ''} min-h-[60px]"
          ${isAnswered ? 'disabled aria-disabled="true"' : ''}
          role="radio" aria-checked="${isAnswered && i === exercise.answer}">
          <span class="flex items-center gap-3">
            <span class="shrink-0 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center font-black text-sm text-gray-500">${String.fromCharCode(65 + i)}</span>
            <span class="flex-1">${escHtml(opt)}${exercise.optionsHangul && exercise.optionsHangul[i] ? `<br><span class="text-sm font-black opacity-70" style="font-family:'Noto Sans KR'">${escHtml(exercise.optionsHangul[i])}</span>` : ''}</span>
          </span>
        </button>`;
    });
    exerciseHtml += '</div>';
  }

  if (exercise.type === 'speak') {
    if (state.fallbackActive) {
      exerciseHtml = `<div class="space-y-3" role="radiogroup">`;
      state.fallbackOptions.forEach((opt, i) => {
        let btnClass = 'bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 text-gray-800 dark:text-slate-100 hover:border-blue-400';
        if (isAnswered) {
          if (opt === exercise.expectedRomaji[0]) btnClass = 'bg-green-500 border-green-500 text-white scale-[1.02]';
          else btnClass = 'bg-white dark:bg-slate-700 border-2 border-gray-100 text-gray-400 opacity-60';
        }
        exerciseHtml += `<button onclick="window.app.handleFallbackAnswer(${i})" class="w-full text-left p-4 rounded-2xl font-bold text-base transition-all ${btnClass} min-h-[56px] ${isAnswered ? 'pointer-events-none' : ''}" ${isAnswered ? 'disabled' : ''}>${escHtml(opt)}</button>`;
      });
      exerciseHtml += '</div>';
    } else {
      exerciseHtml = `
        <div class="flex flex-col items-center gap-4">
          <button onclick="window.app.handleSpeechRecognition()" 
            class="relative ${state.isRecording ? 'recording-pulse bg-red-500' : 'bg-pink-500 hover:bg-pink-600'} text-white w-28 h-28 md:w-36 md:h-36 rounded-full shadow-2xl shadow-pink-500/30 flex flex-col items-center justify-center gap-2 transition-transform hover:scale-105"
            aria-label="${state.isRecording ? 'Registrazione in corso' : 'Avvia registrazione'}">
            <i data-lucide="${state.isRecording ? 'mic-off' : 'mic'}" class="w-10 h-10 md:w-14 md:h-14" aria-hidden="true"></i>
            <span class="text-xs font-black">${state.isRecording ? 'Ascoltando…' : 'Parla!'}</span>
          </button>
          <button onclick="window.app.triggerSpeechFallback()" class="text-xs text-gray-400 hover:text-gray-600 underline">Il microfono non funziona? Usa il quiz fonetico</button>
        </div>`;
    }
  }

  const feedbackClass = isCorrect ? 'bg-green-50 dark:bg-green-900/20 border-green-200 text-green-900 dark:text-green-100' : 'bg-rose-50 dark:bg-rose-900/20 border-rose-200 text-rose-900 dark:text-rose-100';
  const iconClass = isCorrect ? 'bg-green-500' : 'bg-rose-500';
  const headingText = isCorrect ? 'Perfetto! 🎉' : 'Non ti arrendere! 💪';
  const btnFeedClass = isCorrect ? 'bg-green-500 hover:bg-green-600 shadow-green-500/30' : 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30';
  const btnText = state.gameStep === lesson.exercises.length - 1 ? 'Termina Lezione' : 'Prossima Domanda →';

  return `
  <div class="max-w-2xl mx-auto animate-pop">
    <div class="flex justify-between items-center mb-4 px-1">
      <div class="flex items-center gap-2 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700">
        <i data-lucide="flame" class="w-5 h-5 ${state.combo > 1 ? 'text-orange-500 animate-pulse' : 'text-gray-300'}" aria-hidden="true"></i>
        <span class="font-black text-sm ${state.combo > 1 ? 'text-orange-600' : 'text-gray-400'}">Streak: ${state.combo}</span>
      </div>
      <span class="font-black text-gray-500 dark:text-slate-400 text-sm bg-white dark:bg-slate-800 px-3 py-1.5 rounded-xl shadow-sm border border-gray-100 dark:border-slate-700" aria-live="polite">${state.gameStep + 1} / ${lesson.exercises.length}</span>
    </div>

    <div class="mb-6 flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-gray-100 dark:border-slate-700" role="progressbar" aria-valuenow="${Math.round(progressWidth)}" aria-valuemin="0" aria-valuemax="100">
      <div class="flex-grow bg-gray-100 dark:bg-slate-700 h-3 md:h-4 rounded-xl overflow-hidden shadow-inner">
        <div class="bg-gradient-to-r from-blue-400 to-pink-500 h-full transition-all duration-700 ease-out" style="width:${progressWidth}%"></div>
      </div>
    </div>

    <div class="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[2.5rem] korean-shadow p-5 md:p-12 min-h-[450px] flex flex-col border border-blue-50 dark:border-slate-700 relative overflow-hidden">
      <div class="flex-grow z-10">
        <div class="flex justify-center mb-6">
          <span class="${typeColor} text-[10px] md:text-sm font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-sm border flex items-center gap-2">
            <i data-lucide="${typeIcon}" class="w-3 h-3 md:w-4 md:h-4" aria-hidden="true"></i> ${typeLabel}
          </span>
        </div>

        ${exercise.type === 'listen' ? `
          <div class="flex justify-center mb-5">
            <button onclick="window.app.playAudio('${exercise.audioHangul.replace(/'/g,"&#39;")}')" class="flex items-center justify-center gap-3 bg-pink-500 hover:bg-pink-600 text-white px-8 py-4 rounded-full transition-transform hover:scale-105 shadow-xl shadow-pink-500/30" aria-label="Riproduci audio coreano">
              <i data-lucide="volume-2" class="w-8 h-8 animate-pulse" aria-hidden="true"></i><span class="font-black text-xl">Riproduci Audio</span>
            </button>
          </div>` : ''}

        ${exercise.context ? `<div class="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800 p-4 rounded-2xl mb-5 text-indigo-900 dark:text-indigo-200 font-bold text-sm leading-relaxed"><i data-lucide="map" class="w-4 h-4 inline mr-2 text-indigo-500" aria-hidden="true"></i>${escHtml(exercise.context)}</div>` : ''}

        <h2 class="text-xl md:text-3xl font-black text-gray-800 dark:text-slate-100 mb-6 text-center leading-snug">${escHtml(exercise.question)}</h2>

        ${exerciseHtml}
      </div>

      <div class="mt-8 transition-all duration-500 z-10 ${isAnswered ? 'block' : 'hidden'}" aria-live="polite">
        <div class="p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start shadow-sm border-2 ${feedbackClass}">
          <div class="p-3 rounded-full text-white shrink-0 shadow-md ${iconClass}"><i data-lucide="${isCorrect ? 'check' : 'x'}" class="w-6 h-6" aria-hidden="true"></i></div>
          <div class="flex-grow w-full">
            <h4 class="font-black text-xl mb-1">${headingText}</h4>
            <p class="font-bold text-sm mb-2">${isCorrect ? "Ottima risposta, vai avanti così." : escHtml(exercise.feedback_incorrect || 'Riprova la prossima volta!')}</p>
            ${!isCorrect && exercise.tip ? `<div class="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-white/40 mt-2 font-bold text-xs text-gray-700 dark:text-slate-200 shadow-inner">💡 <strong>Hint del Sensei:</strong> ${escHtml(exercise.tip)}</div>` : ''}
          </div>
        </div>
        <button onclick="window.app.nextQuestion()" class="w-full mt-4 py-5 rounded-2xl font-black text-xl text-white shadow-xl transition-transform hover:scale-[1.02] min-h-[60px] ${btnFeedClass}">
          ${btnText}
        </button>
      </div>
    </div>
  </div>`;
};

// ─── RESULT ──────────────────────────────────────────────────
export const renderResult = () => {
  const lesson = getDay(state.activeDay);
  const total = lesson.exercises.length;
  const isPerfect = state.score === total;
  const adminCode = `SR${state.activeDay * 13 + 7}K`;

  const mistakesHtml = state.currentMistakes.length > 0
    ? `<div class="bg-rose-50 dark:bg-rose-900/20 border-2 border-rose-200 text-rose-900 dark:text-rose-100 p-4 rounded-2xl mb-8 text-left shadow-sm">
         <span class="font-black block mb-2 flex items-center gap-2"><i data-lucide="book-open" class="w-5 h-5" aria-hidden="true"></i> Punti deboli da ripassare:</span>
         <div class="flex flex-wrap gap-2 mt-2">
           ${[...new Set(state.currentMistakes)].map(m => `<span class="bg-rose-200 text-rose-800 px-3 py-1 rounded-full font-bold text-xs">${escHtml(m)}</span>`).join('')}
         </div>
       </div>`
    : '';

  const finalMissionText = state.activeDay <= 5
    ? "Registra ad alta voce un monologo: immagina di entrare in palestra o al PC Bang, presentati velocemente e saluta."
    : `Sfida: Fai finta di vivere ora la situazione "${escHtml(lesson.topic)}". Saluta, usa la frase chiave di oggi, poi ringrazia. Parla forte e chiaro!`;

  return `
  <div class="max-w-lg mx-auto text-center px-2 animate-pop">
    <div class="bg-white dark:bg-slate-800 rounded-3xl korean-shadow p-8 md:p-16 border border-blue-50 dark:border-slate-700 relative overflow-hidden mt-4">
      <div class="w-24 h-24 md:w-32 md:h-32 bg-gradient-to-br from-yellow-300 to-orange-500 text-white rounded-full flex items-center justify-center mx-auto mb-6 shadow-2xl shadow-yellow-500/40 animate-pop" aria-hidden="true">
        <i data-lucide="trophy" class="w-12 h-12 md:w-16 md:h-16"></i>
      </div>
      <h2 class="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-2">Lezione Completata!</h2>
      <p class="text-blue-500 mb-8 font-black uppercase tracking-widest text-[10px] md:text-sm">Giorno ${state.activeDay}: ${escHtml(lesson.topic)}</p>
      
      <div class="text-[4rem] md:text-[5rem] font-black text-pink-500 mb-4 drop-shadow-md leading-none" aria-label="${state.score} su ${total} risposte corrette">
        ${state.score}<span class="text-3xl md:text-4xl text-gray-400">/${total}</span>
      </div>
      
      ${mistakesHtml}

      <p class="text-base md:text-xl font-bold text-gray-600 dark:text-slate-300 mb-6 leading-relaxed">
        ${isPerfect ? "Sei stata IMPECCABILE! Zero errori. 🌸 화이팅! ✊" : "Ottimo sforzo! 화이팅! (Fighting!) ✊ Gli errori si sistemano con la Ripetizione Spaziata."}
      </p>

      <div class="bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 p-5 rounded-2xl border border-indigo-100 dark:border-indigo-800 mb-8 shadow-md text-left">
        <div class="flex items-center justify-between mb-3">
          <span class="font-black text-indigo-900 dark:text-indigo-300 flex items-center gap-2 text-sm md:text-lg"><i data-lucide="mic-2" class="w-5 h-5 text-indigo-500" aria-hidden="true"></i> Roleplay</span>
          <span class="bg-indigo-600 text-white text-[8px] font-black px-2 py-1 rounded-full uppercase tracking-widest">Task Finale</span>
        </div>
        <p class="text-indigo-800 dark:text-indigo-200 font-bold text-xs md:text-base leading-relaxed mb-4">${finalMissionText}</p>
        <button onclick="window.app.markRoleplayDone(this)" class="w-full bg-white dark:bg-slate-700 border-2 border-indigo-200 dark:border-indigo-700 text-indigo-600 dark:text-indigo-300 hover:bg-indigo-50 py-3 rounded-xl font-black text-sm transition-all flex items-center justify-center gap-2 shadow-sm">
          <i data-lucide="play-circle" class="w-5 h-5" aria-hidden="true"></i> Ho parlato per 20 secondi
        </button>
      </div>

      <div class="bg-gray-100 dark:bg-slate-700 p-3 rounded-xl mb-8 border border-gray-200 dark:border-slate-600 text-xs font-bold text-gray-600 dark:text-slate-300 text-left shadow-sm">
        <i data-lucide="key" class="w-4 h-4 inline text-pink-500 mb-0.5" aria-hidden="true"></i> Codice segreto: 
        <span class="font-mono bg-white dark:bg-slate-800 px-2 py-1 rounded shadow-sm text-pink-600 select-all border border-pink-100 dark:border-pink-900">${adminCode}</span>
        <div class="text-[10px] text-gray-400 mt-1">Usalo nel "Profilo" su un altro dispositivo per sbloccare questo livello.</div>
      </div>

      <button onclick="window.app.changeView('dashboard')" class="w-full bg-gray-900 dark:bg-white dark:text-gray-900 hover:bg-black text-white py-5 rounded-2xl font-black text-lg md:text-2xl shadow-xl transition-transform hover:scale-[1.02] flex justify-center items-center gap-3 min-h-[60px]">
        <i data-lucide="map" class="w-6 h-6" aria-hidden="true"></i> Salva e Torna al Percorso
      </button>
    </div>
  </div>`;
};

// ─── LIBRARY ─────────────────────────────────────────────────
export const renderLibrary = () => {
  const sectionsHtml = LIBRARY_DATA.map(section => {
    const itemsHtml = section.items.map(item => `
      <div class="bg-white dark:bg-slate-800 p-5 rounded-[1.2rem] shadow-sm border-2 border-gray-50 dark:border-slate-700 flex flex-col justify-between hover:shadow-xl hover:border-pink-100 transition-all group">
        <div class="mb-2">
          <div class="flex justify-between items-start mb-3 gap-3">
            <div class="w-full">
              <p class="text-xl md:text-3xl font-black text-gray-900 dark:text-white mb-1 group-hover:text-pink-600 transition-colors hangul-display" style="font-family:'Noto Sans KR'">${renderHangul(item.hangul)}</p>
              <p class="text-[10px] font-black text-blue-500 uppercase tracking-widest">${escHtml(item.romaji)}</p>
            </div>
            <button onclick="window.app.playAudio('${item.hangul.replace(/'/g,"&#39;")}')" class="shrink-0 flex items-center justify-center bg-gray-50 dark:bg-slate-700 hover:bg-pink-50 dark:hover:bg-pink-900/30 border border-gray-200 dark:border-slate-600 hover:border-pink-200 text-gray-700 dark:text-slate-300 hover:text-pink-700 p-2 rounded-full transition-all shadow-sm w-10 h-10" aria-label="Ascolta pronuncia">
              <i data-lucide="volume-2" class="w-5 h-5" aria-hidden="true"></i>
            </button>
          </div>
          <p class="text-gray-700 dark:text-slate-200 font-black text-base mb-3">"${escHtml(item.eng)}"</p>
          <div class="bg-gray-50 dark:bg-slate-700/50 p-3 rounded-xl border border-gray-100 dark:border-slate-600">
            <p class="text-gray-600 dark:text-slate-300 text-xs font-bold leading-relaxed flex items-start gap-2"><i data-lucide="info" class="w-4 h-4 text-pink-400 shrink-0 mt-0.5" aria-hidden="true"></i> ${escHtml(item.context)}</p>
          </div>
        </div>
      </div>`).join('');

    return `
      <details class="group bg-white dark:bg-slate-800 rounded-2xl border-2 border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden mb-4 open:shadow-lg open:border-pink-200 transition-all">
        <summary class="flex items-center justify-between p-5 cursor-pointer bg-white dark:bg-slate-800 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors no-select outline-none" onclick="window.app.haptic(20)">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gray-100 dark:bg-slate-700 rounded-xl group-open:bg-pink-100 dark:group-open:bg-pink-900/30 transition-colors"><i data-lucide="${section.icon}" class="${section.iconColor} w-6 h-6 group-open:text-pink-600" aria-hidden="true"></i></div>
            <h2 class="text-lg md:text-3xl font-black text-gray-800 dark:text-slate-100">${escHtml(section.category)}</h2>
          </div>
          <div class="bg-gray-100 dark:bg-slate-700 p-1.5 rounded-full text-gray-500 group-open:bg-pink-100 dark:group-open:bg-pink-900/30 group-open:text-pink-500 group-open:rotate-180 transition-all shrink-0" aria-hidden="true">
            <i data-lucide="chevron-down" class="w-5 h-5"></i>
          </div>
        </summary>
        <div class="p-5 pt-0 grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50/50 dark:bg-slate-900/20">${itemsHtml}</div>
      </details>`;
  }).join('');

  const transResultHtml = state.transResult ? `
    <div class="mt-6 bg-gray-900 p-5 md:p-8 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-2xl animate-pop border border-gray-800">
      <div class="w-full">
        <span class="text-2xl md:text-4xl font-black text-white block mb-2 hangul-display" style="font-family:'Noto Sans KR'">${renderHangul(state.transResult)}</span>
        <span class="text-sm md:text-xl font-bold text-blue-300 tracking-wide">${escHtml(state.transRomaji)}</span>
      </div>
      <button onclick="window.app.playAudio('${state.transResult.replace(/'/g,"&#39;")}')" class="bg-blue-500 hover:bg-blue-400 shadow-lg text-white p-4 rounded-full transition-transform hover:scale-110 shrink-0 w-full md:w-auto flex justify-center min-h-[56px] min-w-[56px]" aria-label="Ascolta la traduzione">
        <i data-lucide="volume-2" class="w-6 h-6 md:w-8 md:h-8" aria-hidden="true"></i>
      </button>
    </div>` : '';

  return `
  <div class="max-w-5xl mx-auto animate-pop">
    <section class="bg-white dark:bg-slate-800 p-6 md:p-10 rounded-[2rem] korean-shadow border border-blue-50 dark:border-slate-700 mb-8 relative overflow-hidden" aria-label="Traduttore AI">
      <h2 class="text-2xl md:text-3xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-2">
        <div class="p-2 bg-pink-100 dark:bg-pink-900/30 text-pink-600 rounded-xl"><i data-lucide="bot" class="w-6 h-6 md:w-8 md:h-8" aria-hidden="true"></i></div> 
        Traduttore AI
      </h2>
      <p class="text-gray-500 dark:text-slate-400 font-bold mb-6 text-sm md:text-lg">Scrivi in Italiano. Otterrai Hangul, romanizzazione e audio.</p>
      <div class="flex flex-col md:flex-row gap-3 mb-3 relative">
        <label for="transInput" class="sr-only">Testo da tradurre in italiano</label>
        <input type="text" id="transInput" value="${escHtml(state.transInput)}" oninput="window.app.updateTransInput(this.value)" placeholder="es., Quanto costa un biglietto?" 
          class="flex-grow border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-4 text-base font-bold text-gray-800 focus:border-pink-500 focus:ring-4 focus:ring-pink-100 outline-none transition-all shadow-sm min-h-[50px]"
          aria-label="Testo italiano da tradurre" />
        <button onclick="window.app.runTranslation()" class="bg-pink-500 hover:bg-pink-600 text-white px-6 md:px-10 py-4 rounded-xl font-black text-base transition-transform hover:scale-105 shadow-xl shadow-pink-500/30 flex justify-center items-center gap-2 min-h-[50px]" aria-label="Traduci in coreano">
          ${state.transLoading ? `<i data-lucide="loader-2" class="animate-spin w-5 h-5" aria-hidden="true"></i>` : `<i data-lucide="languages" class="w-5 h-5" aria-hidden="true"></i>`}
          <span>${state.transLoading ? 'Traducendo…' : 'Traduci'}</span>
        </button>
      </div>
      ${transResultHtml}
    </section>

    <section class="bg-white dark:bg-slate-800 rounded-[2rem] p-8 md:p-12 mb-8 shadow-sm border-2 border-red-50 dark:border-slate-700 relative overflow-hidden flex flex-col md:flex-row items-center gap-6 group hover:shadow-lg transition-shadow" aria-label="Risorse YouTube">
      <div class="p-4 md:p-6 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-full shrink-0 group-hover:scale-110 transition-transform" aria-hidden="true">
        <i data-lucide="youtube" class="w-10 h-10 md:w-16 md:h-16"></i>
      </div>
      <div class="flex-grow text-center md:text-left">
        <h2 class="text-xl md:text-2xl font-black text-gray-900 dark:text-white mb-2">Risorse Extra: Impara di Più!</h2>
        <p class="text-gray-600 dark:text-slate-300 font-bold mb-4 text-sm md:text-lg">Sei in treno verso Jeju-do? Guarda questo corso base per ampliare vocabolario e grammatica.</p>
        <a href="https://www.youtube.com/watch?v=sx0yyQqkpqo&list=PLbFrQnW0BNMUkAFj4MjYauXBPtO3I9O_k" target="_blank" rel="noopener noreferrer" class="inline-flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-black px-4 md:px-6 py-3 md:py-4 rounded-xl shadow-md min-h-[44px] transition-colors w-full md:w-auto text-sm" onclick="window.app.haptic()">
          Apri Playlist YouTube <i data-lucide="external-link" class="w-4 h-4" aria-hidden="true"></i>
        </a>
      </div>
    </section>

    <div class="bg-gradient-to-r from-blue-400 to-pink-400 text-white rounded-[2rem] p-8 md:p-12 mb-8 shadow-xl text-center md:text-left relative overflow-hidden" aria-hidden="true">
      <i data-lucide="book-marked" class="absolute right-0 bottom-0 w-48 h-48 opacity-10 transform translate-x-6 translate-y-6"></i>
      <h2 class="text-3xl md:text-5xl font-black mb-3 flex items-center justify-center md:justify-start gap-3 relative z-10">Dizionario Interattivo 🎒</h2>
      <p class="text-blue-50 text-sm md:text-xl font-bold relative z-10">Tocca le frasi in Hangul per allenare la pronuncia.</p>
    </div>
    <div class="space-y-4">${sectionsHtml}</div>
  </div>`;
};

// ─── EXPLORE ─────────────────────────────────────────────────
export const renderExplore = (completedDays = []) => {
  const unlockedRegions = MAP_REGIONS.filter(r => completedDays.includes(r.unlocksOnDay) || r.unlocksOnDay === 1);
  const lockedCount = MAP_REGIONS.length - unlockedRegions.length;

  const cardsHtml = MAP_REGIONS.map(region => {
    const isUnlocked = completedDays.includes(region.unlocksOnDay) || region.unlocksOnDay === 1;
    return `
      <article class="bg-white dark:bg-slate-800 rounded-2xl overflow-hidden shadow-md border-2 border-gray-50 dark:border-slate-700 hover:shadow-xl hover:-translate-y-1 hover:border-blue-100 transition-all group flex flex-col ${isUnlocked ? '' : 'grayscale opacity-60'}">
        <div class="h-48 md:h-56 relative w-full overflow-hidden bg-gray-200 dark:bg-slate-700">
          ${isUnlocked
            ? `<img src="${region.image}" alt="${escHtml(region.name)}" class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" loading="lazy" onerror="this.src='https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&q=80'" />`
            : `<div class="w-full h-full flex items-center justify-center bg-gray-200 dark:bg-slate-700"><i data-lucide="lock" class="w-12 h-12 text-gray-400" aria-hidden="true"></i></div>`}
          <div class="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" aria-hidden="true"></div>
          <span class="absolute bottom-4 left-4 text-4xl" aria-label="Icona destinazione">${region.icon}</span>
          ${!isUnlocked ? `<span class="absolute top-3 right-3 bg-gray-900/80 text-white text-xs font-black px-2 py-1 rounded-full">🔒 Sblocca al Giorno ${region.unlocksOnDay}</span>` : ''}
        </div>
        <div class="p-6 flex-1 flex flex-col">
          <h2 class="text-xl md:text-2xl font-black text-gray-800 dark:text-slate-100 leading-tight mb-3">${escHtml(region.name)}</h2>
          <p class="text-gray-600 dark:text-slate-300 font-bold text-sm mb-5 leading-relaxed flex-1">${escHtml(region.desc)}</p>
          <div class="bg-gray-50 dark:bg-slate-700/50 rounded-2xl p-4 border border-gray-100 dark:border-slate-600">
            <span class="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-3 block">Highlight</span>
            <div class="flex flex-wrap gap-2 items-center">
              <span class="text-2xl" aria-hidden="true">${region.emoji}</span>
              ${region.keywords.map(kw => `<span class="bg-white dark:bg-slate-800 px-3 py-1.5 rounded-full text-xs font-bold text-gray-700 dark:text-slate-200 shadow-sm border border-gray-100 dark:border-slate-600">${escHtml(kw)}</span>`).join('')}
            </div>
          </div>
        </div>
      </article>`;
  }).join('');

  return `
  <div class="max-w-5xl mx-auto animate-pop">
    <header class="bg-white dark:bg-slate-800 rounded-2xl md:rounded-[3rem] p-6 md:p-12 mb-8 korean-shadow border border-blue-50 dark:border-slate-700 text-center relative overflow-hidden">
      <h1 class="text-3xl md:text-5xl font-black text-gray-900 dark:text-white mb-3 flex justify-center items-center gap-3">
        <i data-lucide="map" class="w-8 h-8 md:w-12 md:h-12 text-blue-500" aria-hidden="true"></i> Korea Tour 🇰🇷
      </h1>
      <p class="text-gray-500 dark:text-slate-400 text-base md:text-xl font-bold">Esplora le location di 2521 e i punti turistici chiave.</p>
      ${lockedCount > 0 ? `<p class="text-sm font-bold text-orange-500 mt-2">🔒 ${lockedCount} location si sbloccano completando le lezioni!</p>` : `<p class="text-sm font-bold text-green-500 mt-2">🎉 Tutte le location sono sbloccate!</p>`}
    </header>

    <div class="w-full h-[400px] md:h-[550px] rounded-2xl md:rounded-[2rem] shadow-xl border-4 border-white dark:border-slate-700 mb-8 relative overflow-hidden bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
      <div id="korea-map" class="absolute inset-0 z-10" role="region" aria-label="Mappa interattiva della Corea del Sud"></div>
      <i data-lucide="loader-2" class="animate-spin w-8 h-8 text-gray-400 absolute z-0" aria-hidden="true"></i>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-6">${cardsHtml}</div>
  </div>`;
};

// ─── PROFILE ─────────────────────────────────────────────────
export const renderProfile = () => {
  const safeProfileName = escHtml(state.profileName);
  let saluti = 0, vita = 0, passioni = 0, avan = 0;
  state.completedDays.forEach(d => {
    if (d <= 5) saluti += 20;
    else if (d <= 15) vita += 10;
    else if (d <= 25) passioni += 10;
    else avan += 5;
  });

  return `
  <div class="max-w-md mx-auto px-2 md:px-4 animate-pop">
    <div class="bg-white dark:bg-slate-800 rounded-[2rem] md:rounded-[3rem] korean-shadow p-6 md:p-10 border border-blue-50 dark:border-slate-700 text-center relative overflow-hidden mt-4">
      
      <div class="w-24 h-24 md:w-32 md:h-32 bg-pink-50 dark:bg-pink-900/30 text-pink-600 rounded-full flex items-center justify-center mx-auto mb-6 border-4 md:border-8 border-white dark:border-slate-800 shadow-xl relative z-10" aria-hidden="true">
        <i data-lucide="user" class="w-12 h-12 md:w-16 md:h-16"></i>
      </div>
      <h2 class="text-2xl md:text-4xl font-black text-gray-900 dark:text-white mb-2">Profilo di Studio</h2>
      <p class="text-gray-500 dark:text-slate-400 mb-8 font-bold text-sm md:text-lg">Il tuo viaggio in Corea è al sicuro qui.</p>
      
      <div class="text-left mb-6">
        <label for="profileNameInput" class="block text-[10px] md:text-sm font-black text-gray-500 dark:text-slate-400 mb-2 uppercase tracking-widest">Il tuo nome studente</label>
        <input id="profileNameInput"
          type="text" 
          value="${safeProfileName}"
          oninput="window.app.updateProfileName(this.value)"
          maxlength="30"
          class="w-full border-2 border-gray-200 dark:border-slate-600 dark:bg-slate-700 dark:text-white rounded-xl p-4 text-xl font-black text-gray-800 focus:border-pink-500 outline-none transition-colors shadow-inner bg-gray-50 focus:bg-white min-h-[50px]"
          aria-label="Nome studente"
        />
      </div>

      <div class="text-left mb-6 bg-gray-50 dark:bg-slate-700/50 p-5 rounded-2xl border border-gray-100 dark:border-slate-600">
        <h3 class="text-[10px] font-black text-gray-800 dark:text-slate-200 mb-3 uppercase tracking-widest flex items-center gap-2"><i data-lucide="bar-chart-2" class="w-4 h-4 text-blue-500" aria-hidden="true"></i> Competenze Apprese</h3>
        ${[
          { label: 'Basi & Saluti', pct: Math.min(saluti,100), color: 'bg-pink-500' },
          { label: 'Vita Quotidiana', pct: Math.min(vita,100), color: 'bg-blue-500' },
          { label: 'Passioni & Hobby', pct: Math.min(passioni,100), color: 'bg-green-500' },
        ].map(s => `
          <div class="mb-3">
            <div class="flex justify-between text-[10px] font-bold text-gray-500 dark:text-slate-400 mb-1"><span>${s.label}</span><span>${s.pct}%</span></div>
            <div class="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2" role="progressbar" aria-valuenow="${s.pct}" aria-valuemin="0" aria-valuemax="100" aria-label="${s.label}">
              <div class="${s.color} h-2 rounded-full transition-all duration-700" style="width:${s.pct}%"></div>
            </div>
          </div>`).join('')}
      </div>

      <div class="text-left mb-6 p-5 rounded-2xl border border-gray-200 dark:border-slate-600">
        <label for="hangulScaleRange" class="block text-[10px] font-black text-gray-800 dark:text-slate-200 mb-1.5 uppercase tracking-widest flex items-center gap-2"><i data-lucide="zoom-in" class="w-4 h-4" aria-hidden="true"></i> Grandezza Testo Coreano</label>
        <p class="text-[10px] text-gray-500 dark:text-slate-400 font-bold mb-3 leading-relaxed">Se i caratteri ti sembrano troppo piccoli, usa questo slider.</p>
        <div class="flex gap-3 items-center">
          <span class="text-xs font-black text-gray-400" aria-hidden="true">가</span>
          <input id="hangulScaleRange" type="range" min="1" max="1.6" step="0.1" value="${state.hangulScale}" oninput="window.app.updateHangulSize(this.value)" class="flex-grow" aria-label="Dimensione testo coreano" />
          <span class="text-xl font-black text-pink-500" aria-hidden="true">가</span>
        </div>
      </div>

      <div class="text-left mb-6 bg-pink-50 dark:bg-pink-900/20 p-5 rounded-2xl border border-pink-100 dark:border-pink-800">
        <label for="unlockCodeInput" class="block text-[10px] font-black text-pink-600 mb-1.5 uppercase tracking-widest flex items-center gap-2"><i data-lucide="unlock" class="w-3 h-3" aria-hidden="true"></i> Inserisci Codice Sblocco</label>
        <p class="text-[10px] text-pink-500 font-bold mb-2 leading-relaxed">Usa il codice segreto per sincronizzare il livello!</p>
        <div class="flex gap-2">
          <input type="text" id="unlockCodeInput" placeholder="es. SR20K" maxlength="10"
            class="w-full border-2 border-pink-200 dark:border-pink-800 dark:bg-slate-700 dark:text-white rounded-xl p-2 text-base font-bold text-gray-800 focus:border-pink-500 outline-none uppercase font-mono shadow-inner min-h-[44px]"
            aria-label="Codice sblocco" />
          <button onclick="window.app.unlockDayWithCode(document.getElementById('unlockCodeInput').value)" class="bg-pink-500 hover:bg-pink-600 text-white px-4 rounded-xl font-bold shadow-md min-h-[44px]" aria-label="Sblocca livello">
            <i data-lucide="arrow-right" class="w-5 h-5" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      <div class="bg-gray-900 p-6 rounded-2xl mb-8 flex justify-between items-center text-left shadow-xl" aria-label="Statistiche studio">
        <div>
          <p class="text-gray-400 text-[10px] font-black uppercase tracking-widest mb-1">Giorni Completati</p>
          <p class="text-4xl md:text-5xl font-black text-pink-400">${state.completedDays.length}</p>
        </div>
        <i data-lucide="award" class="text-yellow-400 w-12 h-12 md:w-16 md:h-16" aria-hidden="true"></i>
      </div>

      <button onclick="window.app.handleSwitchAccount()" class="w-full bg-white dark:bg-slate-700 border-2 border-gray-200 dark:border-slate-600 hover:bg-red-50 dark:hover:bg-red-900/30 hover:border-red-300 hover:text-red-600 text-gray-500 dark:text-slate-400 py-4 rounded-xl font-black text-base shadow-sm transition-all flex justify-center items-center gap-2 min-h-[50px]">
        <i data-lucide="trash-2" class="w-5 h-5" aria-hidden="true"></i> Resetta Percorso
      </button>
    </div>
  </div>`;
};
