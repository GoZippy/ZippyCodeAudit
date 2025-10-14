# 🚀 Quick Start Guide - Vibe Mode Features

## Getting Started in 5 Minutes

### Step 1: Build the Dashboard
```bash
cd ZippyCodeAudit-Main
node scripts/build-dashboard.js
```

Expected output: ✅ Dashboard build completed!

### Step 2: Start the API Server
```bash
node simple-api.js
```

Expected output: Server running on http://localhost:3006

### Step 3: Open the Dashboard
Open your browser and go to:
```
http://localhost:3006
```

## 🎯 Features to Try

### 1. Onboarding Wizard (First Visit)
On your first visit, you'll see:
- Welcome screen
- Three skill level options
- Quick feature tour

**Try This:**
1. Select "Just Starting Out" → Gets Vibe & Chill mode
2. Select "Power User" → Gets Developer Tech mode
3. Follow the spotlight tour

### 2. Mode Switcher
**Location:** Top-right header

**Try This:**
1. Click the mode toggle button (shows emoji and text)
2. Watch the smooth animation
3. Notice how metrics change (emojis in Vibe mode, technical in Tech mode)
4. **Keyboard Shortcut:** Press `M` anywhere to toggle

### 3. Tooltips
**Everywhere you see icons or buttons!**

**Try This:**
1. Hover over the "Health Score" metric
2. Hover over the "Files Analyzed" card
3. Hover over any icon in the header
4. See helpful explanations pop up
5. **Mobile:** Tap icons to see tooltips

### 4. Keyboard Shortcuts
**Press `?` to see all shortcuts**

**Try These:**
- Press `1` → Go to Overview
- Press `2` → Go to Reports
- Press `3` → Go to Tasks
- Press `R` → Refresh data
- Press `M` → Toggle mode
- Press `T` → Toggle theme
- Press `ESC` → Close overlays

### 5. Enhanced Visuals
**Check out the new UI elements:**

**In Vibe & Chill Mode:**
- Colorful gradient cards
- Emoji indicators
- Friendly language
- Simple metrics

**In Developer Tech Mode:**
- Clean professional cards
- Detailed metrics
- Technical language
- Advanced options

### 6. CLI Enhanced Output
**Open a new terminal:**

```bash
# Run audit with beautiful output
zippy-audit analyze

# See enhanced formatting:
# - ASCII art banners
# - Color-coded issues
# - Summary cards
# - Progress indicators
```

## 🎨 Visual Tour

### Dashboard Elements

**Header (Top)**
```
┌─────────────────────────────────────────────┐
│ 🧩 ZippyCodeAudit  [Nav]  [😎 Mode] [?]   │
└─────────────────────────────────────────────┘
```

**Metrics Cards**
```
┌──────────────┐  ┌──────────────┐
│ 📁 Files     │  │ ⚠️  Issues   │
│    150       │  │     12       │
└──────────────┘  └──────────────┘
```

**Tooltips (on hover)**
```
┌────────────────────────┐
│ Files Analyzed         │
│ Total files scanned    │
│ during audit           │
└────────────────────────┘
```

### CLI Output

**Success Banner**
```
╔════════════════════════════════════╗
║   ✓ Audit Completed Successfully  ║
║   Your code has been analyzed      ║
╚════════════════════════════════════╝
```

**Summary Card**
```
╔═══════════════════════════════════╗
║  AUDIT SUMMARY                    ║
╠═══════════════════════════════════╣
║  🎉 Health Score: 85% (Good)      ║
║  📁 Files:    150                 ║
║  ⚠️  Issues:   12                  ║
╚═══════════════════════════════════╝
```

## 🧪 Testing Checklist

### Dashboard Features
- [ ] Open dashboard at http://localhost:3006
- [ ] See onboarding wizard (first visit)
- [ ] Select a skill level
- [ ] Follow feature tour
- [ ] Toggle mode with button
- [ ] Toggle mode with `M` key
- [ ] Hover over metrics to see tooltips
- [ ] Press `?` to see keyboard shortcuts
- [ ] Press `1-6` to navigate pages
- [ ] Press `R` to refresh data
- [ ] Press `T` to toggle theme
- [ ] Press `ESC` to close overlays

### CLI Features
- [ ] Run `zippy-audit analyze`
- [ ] See success banner
- [ ] See summary card with emojis
- [ ] See color-coded issues
- [ ] See recommendations section

### Responsive Design
- [ ] Resize browser window
- [ ] Check mobile view (< 768px)
- [ ] Mode toggle text hides on mobile
- [ ] Tooltips work on touch
- [ ] All buttons accessible

### Accessibility
- [ ] Tab through all elements
- [ ] See focus indicators
- [ ] Press Enter to activate buttons
- [ ] Use arrow keys in lists
- [ ] Screen reader announces elements

## 🐛 Troubleshooting

### Dashboard won't load
```bash
# Check if build completed
ls -la dist/dashboard/

# Rebuild if needed
node scripts/build-dashboard.js

# Check if API is running
curl http://localhost:3006/health
```

### Mode switcher not working
```bash
# Clear localStorage and refresh
# In browser console:
localStorage.clear();
location.reload();
```

### Tooltips not showing
```bash
# Check console for errors
# Verify tooltip-manager.js loaded
# Check browser dev tools → Console
```

### CLI colors not showing
```bash
# Check if terminal supports colors
# Try with --no-color flag
zippy-audit analyze --no-color
```

## 💡 Pro Tips

1. **Quick Toggle:** Double-tap `M` to cycle through modes quickly
2. **Export Fast:** Press `E` then Enter to export with defaults
3. **Keyboard Master:** Learn 3-4 shortcuts, you'll love them
4. **Tooltip Explorer:** Hover over EVERYTHING to learn features
5. **Reset Onboarding:** Clear localStorage to see wizard again

## 📚 More Information

- **Full Feature Guide:** See `VIBE_MODE_FEATURES.md`
- **Implementation Details:** See `IMPLEMENTATION_SUMMARY.md`
- **User Documentation:** See `docs/guides/user-guide.md`
- **API Reference:** See `docs/api/reference.md`

## 🎉 Success Indicators

You'll know it's working when:
- ✅ Onboarding wizard appears on first visit
- ✅ Mode toggle shows emoji and text
- ✅ Tooltips appear on hover
- ✅ Keyboard shortcuts work
- ✅ CLI shows colorful output
- ✅ Metrics change with mode
- ✅ Animations are smooth
- ✅ No console errors

## 🚀 Next Steps

Once you've tested the basics:
1. Try all keyboard shortcuts
2. Explore both modes
3. Test on mobile device
4. Run a real audit on a project
5. Export results in different formats
6. Customize your preferences

---

**Happy Vibe Coding! 😎🚀**

Need help? Press `?` in the dashboard or check the docs!

