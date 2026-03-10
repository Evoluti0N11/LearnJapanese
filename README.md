# 🌸 Annyeong! Coreano in 45 Giorni

Una Progressive Web App (PWA) per imparare il coreano in 45 giorni — con lezioni personalizzate su K-Drama, gaming, cosplay e palestra.

## ✨ Funzionalità

- **45 giorni di lezioni** — 5 giorni dettagliati + 40 giorni generati proceduralmente
- **4 tipi di esercizi**: scelta multipla, ascolto, pronuncia (microfono), conversazione
- **Ripetizione spaziata** — ripasso attivo dei giorni precedenti
- **TTS coreano** — pronuncia nativa via Web Speech API
- **Traduttore AI** — italiano → coreano con romanizzazione
- **Mappa interattiva** — location di 2521 e tour turistico, sbloccabili con i progressi
- **Dizionario interattivo** — frasi cliccabili per la pronuncia
- **Dark mode** — via CSS variables (nessun `!important`)
- **Mid-lesson save** — i progressi vengono salvati a ogni risposta
- **PWA + Offline** — service worker con cache shell
- **Accessibilità** — ARIA labels, `role`, `focus-visible`, navigazione da tastiera

## 🛡️ Miglioramenti di sicurezza rispetto all'originale

- **Nessuna iniezione XSS** — tutti i dati utente passano per `escHtml()` prima di entrare nel DOM
- **Nessun `inline onclick` con dati utente** — i click su Hangul usano `data-hangul` + event delegation
- **Codici sblocco non esposti** — validati a runtime, non memorizzati come array leggibile
- **Popup mappa sicuri** — costruiti con `createElement`, nessuna interpolazione HTML

## 📁 Struttura

```
├── index.html          # Shell HTML (minima, solo imports)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker
├── css/
│   └── styles.css      # Tutti gli stili custom + CSS variables dark mode
├── js/
│   ├── data.js         # Dati statici: lezioni, vocabolario, mappa
│   ├── course.js       # Generatore corso lazy (day-on-demand)
│   ├── state.js        # Stato app, persistenza localStorage, helper sicurezza
│   ├── helpers.js      # Audio TTS, haptic, toast, traduzione
│   ├── render.js       # Tutte le funzioni di rendering
│   └── app.js          # Controller principale + window.app API
└── .github/
    └── workflows/
        └── deploy.yml  # GitHub Actions → GitHub Pages
```

## 🚀 Deploy su GitHub Pages

### Metodo 1: Automatico (consigliato)

1. Crea un nuovo repo su GitHub
2. Carica tutti i file
3. Vai su **Settings → Pages → Source** e seleziona **GitHub Actions**
4. Il workflow `.github/workflows/deploy.yml` si occuperà di tutto

### Metodo 2: Manuale

1. Vai su **Settings → Pages**
2. Source: **Deploy from branch → main → / (root)**
3. Salva. Il sito sarà online in pochi minuti.

## 🖼️ Icone PWA

Aggiungi due file nella root:
- `icon-192.png` — 192×192 px
- `icon-512.png` — 512×512 px

Puoi generarle da qualsiasi immagine su [maskable.app](https://maskable.app/).

## 🔧 Sviluppo locale

```bash
# Usando Python (senza install)
python3 -m http.server 8080

# Oppure con Node.js
npx serve .
```

Apri `http://localhost:8080`.

> **Nota:** il file usa ES Modules (`type="module"`). È necessario un server HTTP locale — aprire `index.html` direttamente nel browser non funziona.

## 📱 Installazione come App

1. Apri l'URL su Chrome (Android) o Safari (iOS)
2. Tocca **"Aggiungi alla schermata Home"**
3. L'app funziona offline dopo la prima visita

## 🔐 Codici Sblocco

I codici seguono il pattern `SR{giorno * 13 + 7}K`. Esempio:
- Giorno 1 → `SR20K`
- Giorno 5 → `SR72K`
- Giorno 10 → `SR137K`

Inseriscili nella sezione **Profilo → Inserisci Codice Sblocco**.
