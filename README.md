# 🌸 Annyeong Sara! — Coreano in 45 Giorni (v5.0)

Un'app web progressiva (PWA) per imparare il coreano in 45 giorni, personalizzata per Sara con:
- 💪 **Palestra & Fitness** — frasi per gym, proteine, allenamenti
- 🎮 **League of Legends** — vocabolario gaming, PC Bang
- 🎭 **Cosplay & Anime** — negozi, fiere, Animate Store
- 📺 **K-Drama** — scene da 2521, Start-Up e altri
- 🐾 **Animali** — cat café, zoo di Seoul
- 🗺️ **Korea Tour** — mappa interattiva con 13 location da sbloccare

---

## 🚀 Come usare

1. Vai su **https://[tuo-username].github.io/[nome-repo]/**
2. Su Android: tocca "Aggiungi alla schermata Home" per installare come app
3. Studia ogni giorno e sblocca nuove location!

---

## 📁 Struttura Files

```
/
├── index.html          # App principale
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker (offline support)
├── _config.yml         # Config GitHub Pages
├── .gitignore
├── css/
│   └── style.css       # Stili, dark mode, animazioni
├── js/
│   ├── lessons.js      # ⭐ LE 45 LEZIONI — modifica qui il contenuto!
│   ├── data.js         # Mappa, dizionario, badge, parola del giorno
│   └── app.js          # Logica app (non toccare se non sei sviluppatore)
└── icons/
    ├── icon-192.png    # Icona app (192x192)
    └── icon-512.png    # Icona app (512x512)
```

---

## ✏️ Come modificare le lezioni (senza saper programmare)

### Il file da modificare è sempre: `js/lessons.js`

Apri `js/lessons.js` in qualsiasi editor di testo (Blocco Note, TextEdit, VS Code).
In cima al file trovi una guida completa in italiano.

**Per cambiare una frase in una lezione:**
```
"hangul": "안녕하세요",       ← testo coreano (puoi copiarlo da Google)
"romaji": "Annyeonghaseyo", ← come si pronuncia (SEMPRE modificare insieme all'hangul!)
"eng": "Ciao (Formale)",   ← traduzione in italiano
```

**Per cambiare una domanda a scelta multipla:**
```
"question": "La tua domanda qui",
"options": ["Opzione A romaji", "Opzione B romaji", "Opzione C romaji"],
"optionsHangul": ["옵션 A", "옵션 B", "옵션 C"],
"answer": 1,   ← 0 = prima opzione, 1 = seconda, 2 = terza
```

> ⚠️ **Non modificare mai** i nomi dei campi (`day`, `type`, `answer`, ecc.)  
> ✅ **Modifica solo** i valori tra virgolette `"..."` o i numeri di `answer`

---

## 🎯 Funzionalità v5.0

- ✅ **45 Giorni di Lezioni** progressive con esercizi vari
- ✅ **7 Tipi di Esercizi**:
  - Scelta multipla (con Hangul + romaji sempre visibili!)
  - Test di ascolto (mostra il testo dopo la risposta)
  - Pronuncia vocale (con target Hangul + romaji visibile sopra il microfono)
  - Simulazione dialogo
  - Completa la frase
  - **NUOVO** Costruisci il dialogo (giorni 35-45) — conversazioni reali
  - **NUOVO** Completa il testo (giorni 40-45) — paragrafi con più blank
- ✅ **Pronuncia sempre visibile** — romaji sotto ogni opzione Hangul
- ✅ **Mappa Interattiva** con 13 location della Corea da sbloccare
- ✅ **Dizionario** con 8 categorie e ricerca live
- ✅ **Traduttore** con rilevamento formalità (Formale/Informale)
- ✅ **Parola del Giorno** con timer reset mezzanotte (ora di Roma)
- ✅ **Sistema XP & Livelli** + Badge personalizzati
- ✅ **Streak giornaliero** con fiamma animata
- ✅ **Dark Mode** completo
- ✅ **Voice Recognition** in coreano (ko-KR)
- ✅ **Offline Support** via Service Worker
- ✅ **PWA installabile** su Android/iOS

---

## 🔧 GitHub Pages Setup

1. Fai **push** di tutti questi files nella root del repository
2. Vai su **Settings > Pages**
3. Seleziona branch `main`, cartella `/root`
4. Salva — il sito sarà live in pochi minuti!

## 📱 Icone

Per le icone, crea due immagini PNG:
- `icons/icon-192.png` — 192×192 pixels
- `icons/icon-512.png` — 512×512 pixels

Puoi usare il carattere 🌸 o la bandiera 🇰🇷 su sfondo rosa (#f472b6).

---

## 🆕 Changelog v5.0

- **Struttura file**: `COURSE_DATA` spostato in `js/lessons.js` separato per facilità di modifica
- **Bug fix**: reset corretto dello stato `sentence_builder` tra un esercizio e l'altro
- **Bug fix**: migrazione del salvataggio da v4 a v5 senza perdita dati
- **UX**: romaji sempre mostrato sotto l'Hangul nelle opzioni a scelta multipla
- **UX**: esercizi `speak` mostrano il testo target (Hangul + romaji) sopra il microfono
- **UX**: esercizi `listen` mostrano il testo Hangul dopo la risposta
- **Nuovi esercizi** per giorni 35-45: `dialogue` (costruisci dialogo reale) e `text_fill` (completa un paragrafo)
- **CSS**: classi dedicate per i nuovi tipi di esercizio

---

**화이팅 Sara! 🌸** *Forza, puoi farcela!*
