# 🌸 Annyeong Sara! — Coreano in 45 Giorni

Un'app web progressiva (PWA) per imparare il coreano in 45 giorni, personalizzata per Sara.

## 🆕 Aggiornamenti v5.0

### ✅ Homepage Sempre Attiva al Login
- La homepage ora si mostra **ogni volta** che apri l'app
- Stats aggiornate in tempo reale (Giorni, Streak 🔥, XP ⚡)
- Barra di progresso totale (0–45 giorni = 0–100%)
- Preview della prossima lezione con titolo e topic
- Saluto che cambia ogni 6 ore (Annyeong / Yeoboseyo / Waeosseo / Jal jinaeyo)

### 🔔 Sistema di Notifiche
- Pulsante "Attiva Promemoria Studio" in homepage e in profilo
- Notifica automatica se non studi per più di **23 ore**
- Messaggi personalizzati: Gym, LoL, 2521, Cosplay, Streak
- Gestibile da: Homepage → bottone campana, oppure Profilo → sezione Promemoria
- Funziona su Android (PWA installata) e browser Desktop

### 🛠️ Miglioramenti Codice
- `initApp()` ora carica sempre la homepage (non più Dashboard) così le stats sono sempre fresche
- `enterApp()` non persiste più lo stato "homepage saltata" — ogni apertura = welcome screen
- `markStudySession()` salva il timestamp dell'ultima sessione per il calcolo delle notifiche
- Service Worker aggiornato a **v6** con supporto push notification e `notificationclick`
- Cache naming migliorata, pulizia automatica delle tiles della mappa

## 📁 Struttura Files

```
/
├── index.html          # App principale (CSS paths: css/ e js/)
├── manifest.json       # PWA manifest
├── sw.js               # Service Worker v6 (offline + push)
├── _config.yml         # GitHub Pages config
├── .gitignore
├── css/
│   └── style.css       # Stili, dark mode, animazioni
└── js/
    ├── data.js         # 45 lezioni + mappa + dizionario + WOTD
    └── app.js          # Logica app, render, notifiche, state management
```

## 🚀 Deploy su GitHub Pages

1. Carica tutti i files nella root del repository **mantenendo la struttura cartelle**
2. Settings → Pages → branch `main`, folder `/root`
3. Attendi qualche minuto — il sito è live!

## 📱 Come Attivare le Notifiche

**Su Android (app installata):**
1. Apri l'app
2. Premi "Attiva Promemoria Studio" in homepage
3. Accetta il permesso notifiche

**Su browser Desktop:**
- Stesso procedimento — funziona su Chrome, Edge, Firefox

## 🎯 Struttura 45 Giorni (~15 min/giorno)

| Giorni | Focus |
|--------|-------|
| 1–7    | Basi: Saluti, Presentazioni, Spesa, Gym |
| 8–14   | LoL gaming chat, Cosplay, Ristoranti, Animali |
| 15–21  | K-BBQ, Stanchezza, Mercati, 2521, Subway |
| 22–28  | Spiagge, Busan, Farmacia, Inviti, Socialità |
| 29–35  | Amicizie, Grammatica, Soju, Amore K-Drama |
| 36–45  | Bulguksa, Cosplay crafting, Fangirling, Jeju 🌋 |

**화이팅 Sara! 🌸**
