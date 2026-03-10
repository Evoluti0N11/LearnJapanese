# 🇰🇷 Annyeong Sara! — Korean in 45 Days

A personalized Korean learning Progressive Web App built for Sara.

## 🚀 How to Deploy on GitHub Pages

1. **Create a new GitHub repository** (e.g. `korean-sara`)
2. **Upload all these files** to the root of the repository:
   - `Korean.html` → rename to `index.html` for cleaner URL, OR keep as `Korean.html`
   - `manifest.json`
   - `sw.js`
   - `icon-192.png` *(create or use any 192×192 pink icon)*
   - `icon-512.png` *(create or use any 512×512 pink icon)*

3. **Enable GitHub Pages**:
   - Go to your repo → Settings → Pages
   - Source: Deploy from a branch → `main` → `/ (root)`
   - Click Save

4. **Access the app** at:  
   `https://YOUR-USERNAME.github.io/REPO-NAME/Korean.html`

---

## 📁 Files Explained

| File | Purpose |
|------|---------|
| `Korean.html` | Main app — all lessons, map, game logic |
| `manifest.json` | Makes the app installable on phone (PWA) |
| `sw.js` | Service Worker — enables offline mode |
| `icon-192.png` | App icon (small) — used on home screen |
| `icon-512.png` | App icon (large) — used on splash screen |

---

## 📱 Installing as App on iPhone

1. Open the URL in **Safari** (not Chrome)
2. Tap the **Share** button (square with arrow up)
3. Scroll down → **"Add to Home Screen"**
4. Done! It'll appear like a real app 🌸

## 📱 Installing on Android

1. Open the URL in **Chrome**
2. Tap the **3-dot menu** → **"Add to Home Screen"** or **"Install App"**
3. Done!

---

## 🎨 Icons

You need `icon-192.png` and `icon-512.png`. Quick options:
- Use any Korean-themed image (hanbok, cherry blossom, etc.)
- Use an emoji screenshot (🇰🇷 or 🌸)
- Use [favicon.io](https://favicon.io/emoji-favicons/) to generate from emoji

---

## ✨ Features

- 45-day personalized course (Sara's interests: K-Drama 2521, LoL, Cosplay, Gym)
- Interactive Korea map with filming locations from 2521 + tourist spots
- **Each map location shows survival phrases to use there**
- Speech recognition exercises (mic) with phonetic fallback
- Dark mode, haptic feedback, PWA installable
- Emergency cheat sheet (10 survival phrases for day 1 in Korea)
- Formality guide (formal -요 vs casual)
- Building blocks breakdown for each new phrase
- Spaced repetition reviews
- Translator with formality hint
- Admin unlock codes for remote progress sync
- Firebase sync support (optional)

---

*Made with ❤️ for Sara's Korea adventure* 🇰🇷
