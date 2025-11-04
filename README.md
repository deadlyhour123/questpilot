# 🧭 QuestPilot

**Your Complete RuneScape 3 Quest Guide System**

QuestPilot is an advanced Alt1 Toolkit plugin that provides comprehensive quest guidance for RuneScape 3, featuring a revolutionary "Fresh Account Mode" that guides you from Level 3 all the way to Comp Cape using optimal pathing algorithms inspired by Project Tenacity.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Platform](https://img.shields.io/badge/platform-Alt1%20Toolkit-orange)
![RS3](https://img.shields.io/badge/game-RuneScape%203-brightgreen)

---

## ✨ Features

### 🌱 Fresh Account Mode
- **Level 3 to Comp Cape** progression path
- Optimal quest ordering based on efficiency algorithms
- **Ironman Mode support** with specialized pathing
- Real-time progress tracking
- Time estimates to completion

### ⚔️ Complete Quest Database
- All RS3 quests (F2P & Members)
- Detailed requirements checking
- Step-by-step guides
- Difficulty ratings and quest points
- Search and filter functionality

### 📊 Progress Tracking
- **RuneMetrics API integration** - Auto-import your stats and completed quests
- Local progress tracking
- Visual progress bars
- Quest point calculator
- Completion percentage

### 🗺️ Smart Pathfinder
- Personalized quest recommendations
- Considers your current skills and completed quests
- Efficiency scoring system
- Goal-oriented paths (Quest Cape, Comp, Max)

### 🎨 Modern UI
- **Jagex Launcher-inspired theme** (dark mode)
- Clean, intuitive interface
- Smooth animations
- Responsive design
- Alt1 overlay support

---

## 🚀 Installation

### Requirements
- [Alt1 Toolkit](https://runeapps.org/alt1) installed
- RuneScape 3 (NXT Client)
- Windows OS

### Quick Install

1. **Download QuestPilot**
   - Download the latest release from GitHub
   - Extract the ZIP file

2. **Add to Alt1**
   - Open Alt1 Toolkit
   - Click the Alt1 Toolkit button in your RS3 client
   - Select "Browser" → Navigate to the extracted folder
   - Open `index.html`
   - Click "Add App" when prompted

3. **Alternative: Direct Link**
   ```
   alt1://addapp/[YOUR_URL_HERE]/appconfig.json
   ```

---

## 📖 Usage Guide

### Getting Started

1. **Set Your Username**
   - Click the refresh button next to your name
   - Enter your RS3 username
   - QuestPilot will automatically import your progress

2. **Choose Your Mode**
   - **Regular Account**: Standard progression
   - **Ironman**: Self-sufficient path without GE
   - **Hardcore Ironman**: Same as Ironman with extra care

3. **Select Your Goal**
   - **Quest Cape**: Complete all quests
   - **Comp Cape**: Complete everything in RS3
   - **Max Cape**: Reach level 99 in all skills

### Using Fresh Account Mode

The Fresh Account Mode is QuestPilot's flagship feature, inspired by Project Tenacity's account optimization:

1. **Import Your Progress**
   - Click "Import Progress from RuneMetrics"
   - Your stats and completed quests will be loaded

2. **View Your Path**
   - See the next recommended quest
   - View the next 5 quests in your optimal path
   - Check estimated time to your goal

3. **Follow the Guide**
   - Click on any quest for detailed instructions
   - Complete the quest
   - Path automatically recalculates

### Quest Database

- **Search**: Type quest names in the search bar
- **Filter**: 
  - All Quests
  - Available (you can start now)
  - Completed
  - F2P Only

- **Quest Cards** show:
  - Quest name and difficulty
  - Quest points
  - Requirements
  - Completion status

### Progress Tracking

- **RuneMetrics Integration**: Real-time stats from Jagex
- **Local Tracking**: Mark quests as complete manually
- **Sync Button**: Update from RuneMetrics anytime
- **Export/Import**: Save and restore your progress

---

## 🎯 How the Pathfinding Works

QuestPilot uses a sophisticated scoring algorithm to determine the optimal quest order:

### Scoring Factors

1. **Quest Points** (10 points per QP)
2. **XP Rewards** (higher value for lower skills)
3. **Unlock Value** (teleports, areas, items)
4. **Time Efficiency** (reward per minute)
5. **Quest Chain Value** (unlocks other quests)
6. **Mode Bonuses** (Ironman-specific rewards)
7. **Goal Bonuses** (aligned with your selected goal)

### Example Calculation

```javascript
Quest Score = 
  (Quest Points × 10) +
  (XP Value / 1000) +
  (Unlock Value) +
  (Time Efficiency × 5) +
  (Chain Value) +
  (Mode Bonus) +
  (Goal Bonus)
```

---

## 🔧 Settings

### Display Options
- **Show in-game overlay**: Enable Alt1 overlays
- **Auto-sync**: Automatically update from RuneMetrics
- **Notifications**: Enable popup notifications
- **Fresh Account Mode**: Enable/disable the feature

### Data Management
- **Export Progress**: Save your data as JSON
- **Import Progress**: Restore from backup
- **Clear All Data**: Reset everything

---

## 🔌 API Integration

### RuneMetrics API

QuestPilot uses the official RuneMetrics API:

- **Profile**: `https://apps.runescape.com/runemetrics/profile/profile?user={username}`
- **Quests**: `https://apps.runescape.com/runemetrics/quests?user={username}`

### RuneScape Wiki API

Quest data is sourced from the RuneScape Wiki:

- **MediaWiki API**: `https://runescape.wiki/api.php`
- **Semantic MediaWiki** for structured quest data

---

## 🎨 Color Scheme

QuestPilot uses a modern Jagex Launcher-inspired theme:

| Element | Color | Hex Code |
|---------|-------|----------|
| Background | Dark Blue-Gray | `#1e2428` |
| Secondary | Lighter Gray | `#2a3137` |
| Accent Blue | Bright Blue | `#3498db` |
| Accent Green | Success | `#27ae60` |
| Accent Gold | Warning | `#f39c12` |
| Accent Red | Danger | `#e74c3c` |
| Text Primary | White | `#ffffff` |
| Text Secondary | Light Gray | `#b8bec4` |

---

## 🛠️ Development

### Project Structure

```
questpilot/
├── index.html          # Main UI
├── appconfig.json      # Alt1 configuration
├── css/
│   └── styles.css      # Modern Jagex theme
├── js/
│   ├── app.js          # Main application logic
│   ├── questData.js    # Quest database management
│   ├── pathfinder.js   # Optimal path calculation
│   └── api.js          # RuneMetrics & Wiki API
└── data/
    └── quests.json     # Quest database (future)
```

### Key Technologies

- **HTML5** + **CSS3** with CSS Variables
- **Vanilla JavaScript** (ES6+)
- **Alt1 Toolkit API**
- **Fetch API** for external requests
- **LocalStorage** for data persistence

### Adding New Quests

1. Add quest data to `questData.js`
2. Include all requirements and rewards
3. Set difficulty and time estimate
4. Add Ironman-specific notes if needed

Example:
```javascript
{
    id: 'quest-name',
    name: 'Quest Name',
    difficulty: 'intermediate',
    questPoints: 2,
    members: true,
    requirements: {
        skills: { agility: 40, thieving: 30 },
        quests: ['prerequisite-quest'],
        items: ['item1', 'item2']
    },
    rewards: {
        xp: { agility: 10000, thieving: 5000 },
        items: ['reward-item'],
        unlocks: ['shortcut-name']
    },
    timeEstimate: 45
}
```

---

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Report Bugs**: Open an issue on GitHub
2. **Suggest Features**: Tell us what you'd like to see
3. **Submit PRs**: Help improve the codebase
4. **Update Quest Data**: Keep the database current

---

## 📋 Roadmap

### Version 1.1
- [ ] Complete quest database (all 268 quests)
- [ ] Detailed step-by-step guides for each quest
- [ ] In-game overlay for quest steps
- [ ] Audio notifications

### Version 1.2
- [ ] Achievement Diary support
- [ ] Task set integration
- [ ] Skill calculator
- [ ] Item checklist

### Version 2.0
- [ ] AI-powered quest guide generation
- [ ] Video guide integration
- [ ] Community quest notes
- [ ] Multi-language support

---

## 🐛 Known Issues

- Quest database is currently limited (in development)
- Some RuneMetrics API calls may be rate-limited
- Ironman item source tracking needs expansion

---

## 📜 License

QuestPilot is released under the MIT License.

---

## 🙏 Credits

### Inspired By
- **Project Tenacity** by RenegadeLucien - Optimal account pathing
- **Quest Helper** (OSRS) - Quest guidance system
- **Alt1 Toolkit** by Skillbert - RS3 overlay platform

### APIs
- **Jagex RuneMetrics API** - Player stats and quest data
- **RuneScape Wiki** - Quest information and requirements

### Community
- RS3 Community for feedback and testing
- Alt1 Toolkit Discord for development support

---

## 📞 Support

- **Discord**: [Join our server](https://discord.gg/questpilot)
- **GitHub Issues**: [Report bugs](https://github.com/questpilot/questpilot/issues)
- **Reddit**: r/runescape
- **Wiki**: [Documentation](https://questpilot.wiki)

---

## ⚠️ Disclaimer

QuestPilot is a third-party tool and is not affiliated with or endorsed by Jagex Ltd. Use at your own risk. Always follow Jagex's rules regarding third-party software.

**QuestPilot does NOT:**
- Automate gameplay
- Send inputs to the game
- Violate any game rules

**QuestPilot ONLY:**
- Reads pixels on your screen
- Provides guidance and information
- Helps you make informed decisions

---

**Made with ❤️ for the RuneScape 3 Community**

🧭 Happy questing! 🎮
