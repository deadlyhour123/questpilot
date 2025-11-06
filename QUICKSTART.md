# 🚀 QUICK START - Get QuestPilot Running NOW!

Follow these steps to get QuestPilot working in the next 10 minutes:

## ⚡ Step 1: Install Dependencies (2 minutes)

Open terminal in the QuestPilot folder and run:

```bash
npm install
```

Wait for it to finish installing packages.

---

## ⚡ Step 2: Start the Server (30 seconds)

```bash
npm run serve
```

You should see:
```
Serving "/home/claude/QuestPilot" at http://127.0.0.1:8080
```

**Keep this terminal window open!**

---

## ⚡ Step 3: Add to Alt1 (1 minute)

### Option A: Via Browser
1. Open Alt1 Toolkit
2. Click the "+" button or "Add App"
3. Paste this URL: `http://localhost:8080/index.html`
4. Click "Add"

### Option B: Via Direct Link
1. Click this link in your browser:
   ```
   alt1://addapp/http://localhost:8080/index.html
   ```

---

## ⚡ Step 4: Test It! (30 seconds)

1. **Look for QuestPilot window** in Alt1
2. **You should see**:
   - QuestPilot header
   - Overview tab with progress bars
   - 8 sample quests in the Quests tab
3. **Click around** to test the UI

---

## ⚡ Step 5: Set Your Account (1 minute)

1. Go to **Settings tab**
2. Enter your RS3 username
3. Click **Save**
4. Go back to **Overview tab** - you should see your name!

---

## 🎮 Step 6: Test Quest Features (2 minutes)

1. Go to **Quests tab**
2. You should see 8 sample quests
3. Try the filters:
   - Search for "Cook"
   - Filter by "Novice" difficulty
   - Check "F2P Only"
4. Click on a quest to see details

---

## ✅ You're Done!

QuestPilot is now running. Here's what works:

✅ **UI and navigation** - All tabs working
✅ **Quest database** - 8 sample quests loaded
✅ **Filters** - Search and filter quests
✅ **Progress tracking** - Manual for now
✅ **Settings** - Save your account name

---

## 🔮 Next Steps

### To Get ALL Quests (~10 minutes):

```bash
npm run scrape
```

This will:
- Connect to RuneScape Wiki
- Download data for ALL 257 quests
- Save to `data/quests.json`
- Take about 5-10 minutes

**Note**: Requires internet connection

---

### To Enable Auto-Tracking:

QuestPilot detects Alt1 automatically. To use auto features:

1. Make sure **RS3 is running**
2. Make sure **Alt1 has permissions**:
   - Right-click QuestPilot window
   - Check permissions are granted
3. Click **"Scan Progress"** button

**Current Version (v0.1)**: Auto-detection is simulated
**Coming in v0.2**: Full OCR integration

---

## 🐛 Troubleshooting

### "Cannot GET /"
- Make sure you're using the full URL: `http://localhost:8080/index.html`

### "Quest database not found"
- The 8 sample quests should work immediately
- Run `npm run scrape` to get all quests

### "Alt1 not detected"
- This is normal when testing in browser
- Add to Alt1 properly using Step 3 above

### Port 8080 already in use
- Change port: `npx live-server --port=8081`
- Update Alt1 URL to use port 8081

---

## 🎯 What You Can Do Right Now

1. ✅ **Browse quests** - See all available quests
2. ✅ **Use filters** - Find quests you want
3. ✅ **Track manually** - Mark quests as complete (Settings)
4. ✅ **See progress** - View your completion %
5. ✅ **Get recommendations** - See suggested quests

---

## 📝 Development Mode

Want to edit code and see live changes?

```bash
npm run dev
```

This auto-reloads when you save files!

---

## 🚀 Ready to Use!

Your QuestPilot is now set up and ready. Start exploring quests and tracking your progress!

**Need help?** Check the main README.md for full documentation.

---

**Happy Questing! 🧭**
