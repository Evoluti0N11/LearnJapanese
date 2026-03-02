# Korean Learning App - Learn Korean in 45 Days

A comprehensive, interactive Korean language learning platform with **Hangul alphabet lessons**, **grammar guide**, **45 key situations**, and **culturally immersive content**. Optimized for offline use and mobile.

## 🌟 Features

### Core Functionality
- **45 Key Situations** - Master essential conversational scenarios
- **Hangul Alphabet Lessons** - Learn Korean writing system with interactive cards (5 characters/day)
- **Grammar Cheat Sheet** - Explicit reference guide for all grammar patterns
- **Mini Dialogues** - Context-based conversations with comprehension questions
- **Varied Exercises**:
  - Multiple choice
  - Listen and respond
  - Unscramble sentences (reinforces SOV grammar)
  - Speak recognition (using Web Speech API)
  - Dialogue response selection

### Formality Levels
Korean has distinct speech levels. The app explicitly teaches:
- **Formal (존댓말)** - For elders, strangers, authority figures
- **Informal (반말)** - For close friends and peers
- Visual badges show formality level for each phrase

### Teaching Methodology Improvements
✅ **Not repetitive** - Days 6-45 include varied exercise types
✅ **Hangul integrated** - Early lessons teach 5 characters per day
✅ **Grammar explicit** - Persistent Grammar Guide tab with complete reference
✅ **Audio feedback** - TTS with visual loading states
✅ **Spaced repetition** - Review system scales with lessons learned
✅ **Gamification** - Combo system, points, best streak tracking

### User Experience
- **Mobile-first responsive design** - Works on all screen sizes
- **Dark mode friendly** - Gentle purple & pink gradient UI
- **Accessibility** - Adjustable text size for Hangul (0.8x - 1.5x)
- **Sticky "Start Exercises" button** - Jump to practice on mobile
- **Score & Combo tracking** - Visual feedback with animations
- **Persistent progress** - localStorage saves all learner data

### Offline Support & PWA
- **Service Worker** - Caches essential assets for offline use
- **Manifest.json** - Install as standalone app on mobile
- **Offline banner** - Alerts user when cache is being used
- **No trackers** - Complete privacy, all data stored locally

### Map Integration
- **2500+ Korean filming locations** - Real locations from K-dramas
- **Contextual phrases** - Learn phrases associated with specific places
- Interactive Leaflet map showing location clusters

## 🚀 Deployment on GitHub Pages

### Step 1: Create a GitHub Repository
```bash
# Create new repo on GitHub (e.g., "korean-learning-app")
git clone https://github.com/YOUR_USERNAME/korean-learning-app.git
cd korean-learning-app
```

### Step 2: Add Files
Copy these files to your repository:
- `Korean.html` (main app)
- `manifest.json` (PWA config)
- `sw.js` (Service Worker)
- `README.md` (this file)

### Step 3: Enable GitHub Pages
1. Go to **Settings** → **Pages**
2. Select **Source**: Deploy from a branch
3. Select **Branch**: main (or master)
4. Select **Folder**: / (root)
5. Click **Save**

### Step 4: Update HTML References
If deploying to a subdirectory (e.g., `github.com/user/korean-app`):
- Edit `Korean.html` line with manifest:
  ```html
  <link rel="manifest" href="/korean-learning-app/manifest.json">
  ```
- Edit `manifest.json`:
  ```json
  "start_url": "./korean-learning-app/Korean.html"
  ```
- No change needed for `sw.js` (uses relative paths)

### Step 5: Push to GitHub
```bash
git add .
git commit -m "Initial Korean learning app"
git push origin main
```

Your app will be live at: `https://YOUR_USERNAME.github.io/korean-learning-app`

## 📱 Installation

### On Desktop
Simply open the URL in your browser. No installation needed.

### On Mobile (Android/iOS)
1. Open the app URL in your browser
2. Tap the **+ Add to Home Screen** option
3. App installs as standalone app
4. Works offline after first visit

### Browser Compatibility
- ✅ Chrome/Edge (full support)
- ✅ Firefox (full support)
- ✅ Safari (partial - PWA limited on iOS)
- ✅ Mobile browsers (full support)

## 💾 Data & Privacy

- **All progress saved locally** - Uses browser localStorage
- **No backend server required** - Completely client-side
- **No analytics or tracking** - Your data stays with you
- **Works offline** - Once cached, no internet needed

### Resetting Progress
1. Tap the ⚙️ settings icon (top right)
2. Scroll to "Reset All Progress"
3. Confirm the reset

## 🎓 Curriculum Overview

### Days 1-5: Foundation
- Greetings & politeness
- Self-introduction
- Basic questions
- Numbers & counting
- Everyday verbs

### Days 6-45: Key Situations
- Ordering at restaurants
- Asking directions
- Shopping & bargaining
- Making friends
- Telling time & weather
- Describing feelings & emotions
- Family & relationships
- Hobbies & interests
- School & work
- Hotel bookings
- Doctor visits
- ... and 30+ more real-world scenarios

## 📖 Learning Features

### Grammar Guide
Complete reference for:
- **SOV Word Order** - Subject + Object + Verb structure
- **Particles (조사)** - 은/는, 을/를, 에, etc.
- **Formality Levels** - Formal vs. Informal speech
- **Tense & Participles** - Present, past, future forms

### Hangul Alphabet
Interactive cards for all 24 basic characters:
- **14 Consonants** (초성)
- **10 Vowels** (모음)
- Pronunciation guidance
- Listen button for each character

### Spaced Repetition
- Review system picks phrases from Days 1-5+
- Scales difficulty as you progress
- Reinforces vocabulary at optimal intervals

## 🎮 Gamification System

- **🔥 Combo Meter** - Build streaks on correct answers
- **⭐ Points System** - Earn 10-15 points per exercise
- **📊 Progress Bar** - Visual track of daily completion
- **🏆 Best Combo** - Leaderboard (personal best)

## 🛠 Customization

### Add Your Own Phrases
Edit the `lessons` array in `Korean.html`:
```javascript
{
  day: X,
  title: "Your Situation",
  korean: "당신의 한글",
  english: "Your English",
  grammar: "Grammar pattern",
  formality: "formal" or "informal",
  ...
}
```

### Change Colors
Tailwind classes use purple/pink theme. To change:
1. Find `from-purple-600`, `to-pink-600` throughout HTML
2. Replace with your colors (e.g., `from-blue-600 to-cyan-600`)

### Add New Map Locations
In the `initializeMap()` function, add to the `locations` array:
```javascript
{ lat: 37.5665, lng: 126.9780, title: "Place", phrase: "한글 구문 (English meaning)" }
```

## ⚡ Performance

- **First Load**: ~2-3 seconds (downloads Tailwind CSS, fonts)
- **Subsequent Loads**: Instant (from cache)
- **Offline**: Instant (all content cached)
- **Bundle Size**: ~150KB total

## 🔒 Security Notes

### About the Unlock Codes
The original version had unlock codes visible in source. **This improved version removed that**:
- Days 1-5 are always available
- Days 6-45 are also available (no restrictions)
- If you want restricted progression, implement:
  - Backend verification
  - Obfuscated token validation
  - Time-based unlocks

## 🐛 Known Limitations

1. **Speech Recognition** - Requires microphone permission (some phones may deny)
2. **TTS Quality** - Uses browser Web Speech API (varying quality by browser)
3. **iOS PWA** - Limited offline support on Safari (Apple restrictions)
4. **Map Imagery** - External tiles required (doesn't work fully offline)

## 🚧 Future Improvements

- [ ] Quiz mode with difficulty levels
- [ ] User-generated content (custom vocabulary)
- [ ] Progress analytics dashboard
- [ ] Leaderboard (Firebase integration)
- [ ] Video lessons from native speakers
- [ ] Conversation practice with AI chatbot
- [ ] Export progress as PDF
- [ ] Dark mode toggle

## 📄 License

This project is open source. Feel free to fork, modify, and distribute.

## 🤝 Contributing

Found a bug? Have a suggestion?
1. Test thoroughly
2. Document the issue clearly
3. Submit with before/after examples

## 📚 Resources Used

- **Tailwind CSS** - Styling framework
- **Lucide Icons** - Icon set
- **Leaflet.js** - Interactive maps
- **Web Speech API** - Speech recognition & synthesis
- **Canvas Confetti** - Celebration animations
- **GSAP** - Smooth animations

## 💡 Tips for Learners

1. **Consistency is key** - 15 minutes daily > 2 hours once weekly
2. **Practice pronunciation** - Use the speak exercises daily
3. **Watch K-dramas** - Listen for phrases you've learned
4. **Join communities** - Find Korean learners online
5. **Track progress** - Check your score and combo regularly

## 🌍 Korean Learning Resources

- **Naver Dictionary** - nadictionary.naver.com
- **Korean Grammar** - learn-korean.net
- **Newsagency** - readkorean.as
- **Language Exchange** - tandem-app.com, speaky.com

---

**Made for Sara with ❤️**

Happy learning! 화이팅! (Hwaiting!)
