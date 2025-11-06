# 🧭 QuestPilot

**Complete RS3 Quest & Achievement Tracker**  
From Level 3 to Trim Comp & 5.8B XP

---

## 🎯 Features

### Current (v0.1 - MVP)
- ✅ Alt1 Toolkit integration
- ✅ Automatic account name detection (from chat)
- ✅ Quest database (pulled from RuneScape Wiki)
- ✅ Quest requirement checker
- ✅ Progress tracking UI
- ✅ Quest filters (difficulty, status, F2P)
- ✅ Recommended quest paths
- ✅ Data export/import

### Coming Soon
- 🔜 Quest log OCR scanner (v0.2)
- 🔜 Bank & inventory scanning (v0.2)
- 🔜 XP tracker integration (v0.2)
- 🔜 Achievement tracking (v0.3)
- 🔜 Comp cape requirements (v0.4)
- 🔜 Trim comp tracking (v0.5)
- 🔜 5.8B XP tracker (v0.5)
- 🔜 Ironman mode with alternate steps (v0.6)

---

## 📦 Installation

### Prerequisites
- [Alt1 Toolkit](https://runeapps.org/alt1) installed
- [Node.js](https://nodejs.org/) (v16 or higher)
- RuneScape 3 (obviously!)

### Setup Steps

1. **Clone/Download this project**
   ```bash
   cd QuestPilot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Scrape quest data from Wiki** (First time only)
   ```bash
   npm run scrape
   ```
   This will take 5-10 minutes and will create `data/quests.json`

4. **Start local server**
   ```bash
   npm run serve
   ```
   This starts a server at `http://localhost:8080`

5. **Add to Alt1**
   - Open Alt1 Toolkit
   - Click "Add App"
   - Enter URL: `http://localhost:8080/index.html`
   - Or: `alt1://addapp/http://localhost:8080/index.html`

---

## 🚀 Usage

### First Time Setup

1. **Open QuestPilot in Alt1**
   - Should appear as a window overlay

2. **Detect Your Account**
   - Option 1 (Automatic): Click "Scan Progress" while in-game
   - Option 2 (Manual): Go to Settings tab → Enter your RS3 username

3. **Start Questing!**
   - Browse quests in the "Quests" tab
   - See recommended quests in "Overview" tab
   - Track your progress automatically

### Using Quest Filters

**Quest Tab Filters:**
- 🔍 **Search**: Find quests by name
- 📊 **Difficulty**: Novice, Intermediate, Experienced, Master, Grandmaster
- ✅ **Status**: Ready to Start, In Progress, Completed, Locked
- 🆓 **F2P Only**: Show only free-to-play quests

### Quest Status Indicators

- ✅ **Ready** - You meet all requirements, can start now
- 🔒 **Locked** - Missing skill/quest requirements
- ✅ **Complete** - Quest already finished
- 🔄 **In Progress** - Currently doing this quest

---

## 🎮 Alt1 Permissions

QuestPilot requires three Alt1 permissions:

### ✅ Game State
- Read chat messages for quest completions
- Track XP gains for level detection
- Monitor account login

### ✅ Overlay
- Show quest objective markers on screen
- Display path guidance
- Show completion notifications

### ✅ Screen Pixels
- Scan quest log (detect completed quests)
- Read bank (check for required items)
- Read inventory (verify quest items)

---

## 📊 How It Works

### 1. Quest Data Collection
```
RuneScape Wiki → Wiki Scraper → Local Database (quests.json)
```

### 2. Progress Tracking
```
RS3 Game → Alt1 Toolkit → QuestPilot → Your Progress
```

### 3. Automatic Detection
- **Chat Monitoring**: Detects quest completions from chat
- **XP Tracking**: Calculates skill levels from XP drops
- **Quest Log Scanning**: Reads quest journal (when opened)

---

## 📁 Project Structure

```
QuestPilot/
├── app.json              # Alt1 manifest
├── index.html            # Main UI
├── styles.css            # Styling
├── package.json          # Dependencies
├── README.md             # This file
├── src/
│   └── app.js           # Main application logic
├── scripts/
│   └── wiki-scraper.js  # Quest data scraper
├── data/
│   ├── quests.json      # Quest database (generated)
│   └── quest-summary.json
└── assets/
    └── icon.png         # App icon
```

---

## 🛠️ Development

### Run in Development Mode
```bash
npm run dev
```
Auto-reloads when you edit files

### Update Quest Database
```bash
npm run scrape
```
Re-pulls all quest data from RS Wiki

### Debug Console
Open browser console (F12) to see logs:
```javascript
// Access app state
window.QuestPilot.state

// Force UI update
window.QuestPilot.updateAllUI()

// Reload quest database
window.QuestPilot.loadQuestDatabase()
```

---

## 🐛 Troubleshooting

### "Alt1 Not Detected"
- Make sure Alt1 Toolkit is installed and running
- Restart Alt1
- Try adding the app again

### "Quest Database Not Found"
- Run: `npm run scrape`
- Wait 5-10 minutes for it to complete
- Check `data/quests.json` exists

### "Can't See QuestPilot Window"
- Check Alt1 Apps menu
- Make sure RS3 is running
- Try resizing the window

### Quest Data Out of Date
- Run `npm run scrape` again to refresh
- QuestPilot pulls latest data from RS Wiki

---

## 🗺️ Roadmap

### Phase 1: MVP ✅ (Current - v0.1)
- Basic quest tracking
- Wiki data import
- Simple UI

### Phase 2: Smart Tracking (v0.2) - *Next*
- Quest log OCR
- Bank/inventory scanning
- Auto XP tracking
- Real-time progress updates

### Phase 3: Achievements (v0.3)
- Achievement database
- Area tasks tracking
- Achievement OCR

### Phase 4: Comp Cape (v0.4)
- 321 comp requirements
- Progress dashboard
- Boss KC tracking
- Music unlocks

### Phase 5: Ultimate (v0.5)
- Trim comp (456 requirements)
- Master Quest Cape
- 5.8B XP tracker
- Virtual levels (120s)

### Phase 6: Ironman (v0.6)
- Ironman mode toggle
- Alternate quest steps
- GE-free guidance

### Phase 7: Polish (v0.7+)
- Performance optimization
- Full testing
- Public release

---

## 💡 Tips for Best Experience

1. **Keep Alt1 Running** - QuestPilot needs it for auto-detection
2. **Update Quest Data Monthly** - RS3 adds new quests regularly
3. **Use Filters** - Find exactly what you can do right now
4. **Check Recommendations** - See optimal quest paths
5. **Enable All Permissions** - Unlock full functionality

---

## 📝 Data Sources

- **Quest Data**: [RuneScape Wiki](https://runescape.wiki)
- **Requirements**: Parsed from wiki infoboxes
- **Rewards**: Experience, items, quest points
- **Updated**: Run `npm run scrape` to refresh

---

## ⚖️ License

MIT License - Free to use and modify

---

## 🤝 Contributing

Want to help? Here's how:

1. **Report Bugs** - Open an issue
2. **Suggest Features** - Share your ideas
3. **Improve Data** - Fix quest information
4. **Code Contributions** - Submit pull requests

---

## 📮 Support

- **Issues**: Create a GitHub issue
- **Questions**: Check the troubleshooting section
- **Updates**: Watch this repo for new releases

---

## 🎉 Acknowledgments

- **Alt1 Toolkit** by Skillbert - Makes this possible
- **RuneScape Wiki** - Complete quest data
- **RS3 Community** - Testing and feedback

---

## 📊 Version History

### v0.1.0 (Current)
- Initial release
- Basic quest tracking
- Wiki data scraper
- Quest filters
- Manual account setup

### Coming Next: v0.2.0
- OCR integration
- Auto quest log scanning
- Bank/inventory reading
- Real-time XP tracking

---

**Ready to start your journey from Level 3 to Trim Comp?**  
**Let's go! 🚀**
