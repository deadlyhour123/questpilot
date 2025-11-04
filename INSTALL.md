# 🚀 Alt1 Installation Guide

## Method 1: Local Installation (EASIEST & MOST RELIABLE)

### Step 1: Download Files
1. Click the green **"Code"** button on GitHub
2. Select **"Download ZIP"**
3. Extract to a folder like `C:\Alt1Apps\questpilot\`

### Step 2: Add to Alt1
1. **Open Alt1 Toolkit** (make sure it's running)
2. Open RuneScape 3
3. Click the **Alt1 Toolkit** button in your RS3 toolbar
4. Click **Browser** in the menu
5. In the address bar, type:
   ```
   file:///C:/Alt1Apps/questpilot/index.html
   ```
   (Adjust path to where you extracted the files)
6. The app should load - click **"Add App"** in the top-right

### Step 3: Done!
QuestPilot is now installed! Access it anytime from the Alt1 menu.

---

## Method 2: GitHub Pages (If Enabled)

### Prerequisites
- GitHub Pages must be enabled in repository settings
- Wait 2-3 minutes after enabling for deployment

### Option A: Browser Method
1. **Open Alt1 Toolkit**
2. Click **Alt1 Toolkit** → **Browser**
3. Navigate to:
   ```
   https://deadlyhour123.github.io/questpilot/
   ```
4. Click **"Add App"** when it appears

### Option B: Direct Link
1. **Ensure Alt1 is running**
2. Click this link:
   ```
   alt1://addapp/https://deadlyhour123.github.io/questpilot/appconfig.json
   ```
3. Confirm installation when prompted

---

## ⚠️ Troubleshooting

### Problem: "Add App" button doesn't appear

**Solution 1:** Check appconfig.json
```bash
# Visit this URL in your browser:
https://deadlyhour123.github.io/questpilot/appconfig.json

# You should see the JSON content
# If you get 404, GitHub Pages isn't working
```

**Solution 2:** Check file structure
```
questpilot/
├── index.html          ✓ Must exist
├── appconfig.json      ✓ Must be in root
├── .nojekyll           ✓ Helps GitHub Pages
├── css/
│   └── styles.css      ✓ Must exist
└── js/
    └── *.js files      ✓ Must exist
```

**Solution 3:** Enable GitHub Pages
1. Go to repository Settings
2. Click "Pages" in sidebar
3. Source: Deploy from branch "main"
4. Folder: / (root)
5. Save and wait 2-3 minutes

### Problem: alt1:// link does nothing

**Cause:** Alt1 isn't running or link is malformed

**Solutions:**
- Make sure Alt1 Toolkit is open BEFORE clicking
- Try the Browser method instead (more reliable)
- Use local installation (always works)

### Problem: "CORS error" in browser

**This is normal!** 
- RuneMetrics API requires Alt1's browser
- Don't test in Chrome/Firefox
- Must use Alt1's built-in browser

### Problem: App loads but features don't work

**Check permissions:**
1. Click Alt1 → Settings → Apps
2. Find QuestPilot
3. Ensure these permissions are enabled:
   - ✓ View screen (pixel)
   - ✓ Show overlay
   - ✓ Get game state

### Problem: GitHub Pages shows 404

**Solutions:**

1. **Check deployment status:**
   - Settings → Pages
   - Look for green checkmark
   - Wait a few minutes after enabling

2. **Check branch:**
   - Make sure files are in `main` branch
   - Not in a different branch

3. **Check file names:**
   - Must be exactly `appconfig.json` (lowercase)
   - Must be exactly `index.html` (lowercase)

---

## 🎯 Verification Checklist

Before trying to install, verify:

- [ ] All files uploaded to GitHub
- [ ] Files are in `main` branch
- [ ] `appconfig.json` is in root directory (not in a subfolder)
- [ ] GitHub Pages is enabled in Settings
- [ ] Waited 2-3 minutes after enabling Pages
- [ ] Can access `https://deadlyhour123.github.io/questpilot/` in browser
- [ ] Can access `https://deadlyhour123.github.io/questpilot/appconfig.json` in browser
- [ ] Alt1 Toolkit is running
- [ ] RuneScape 3 is open

---

## 📝 Quick Commands

### Test if GitHub Pages is working:
```
# Open these in your browser:
https://deadlyhour123.github.io/questpilot/
https://deadlyhour123.github.io/questpilot/appconfig.json
https://deadlyhour123.github.io/questpilot/css/styles.css
```

All three should load without 404 errors.

### Alt1 Browser Address:
```
# For local install:
file:///C:/Alt1Apps/questpilot/index.html

# For GitHub Pages:
https://deadlyhour123.github.io/questpilot/index.html
```

### Alt1 Direct Link:
```
alt1://addapp/https://deadlyhour123.github.io/questpilot/appconfig.json
```

---

## 💡 Best Practice: Use Local Installation

**Why local is better:**
- ✅ Always works instantly
- ✅ No waiting for GitHub Pages
- ✅ No CORS issues
- ✅ Faster loading
- ✅ Can modify files easily
- ✅ No internet required

**Only use GitHub Pages if:**
- You want to share with others
- You want auto-updates
- You're hosting for multiple users

---

## 🆘 Still Not Working?

1. **Share the error message:** Take a screenshot and share it
2. **Check browser console:** Press F12 in Alt1 browser, check for errors
3. **Verify Alt1 version:** Make sure Alt1 is up to date
4. **Try the example apps:** See if other Alt1 apps work (like Clue Solver)
5. **Ask for help:** 
   - Alt1 Discord: https://discord.gg/f9yfXv9
   - RuneApps Forums: https://runeapps.org/forums/

---

## ✅ Success Indicators

You'll know it's working when:
- You see the QuestPilot interface with the blue theme
- The Fresh Account Mode tab is visible
- You can enter your username
- The app doesn't show any error messages

---

**Need more help? Let me know what error you're seeing!**
