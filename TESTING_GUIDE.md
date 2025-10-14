# ZippyCodeAudit Testing Guide

## Quick Start Testing

Follow these steps to test all newly implemented features:

## Prerequisites

```bash
cd K:\Projects\ZippyCodeAudit\ZippyCodeAudit-Main
npm install
```

---

## Test 1: Dashboard - Dual Mode UI

### Steps:
1. Start the API server:
   ```bash
   node simple-api.js
   ```
   
2. In a new terminal, serve the dashboard:
   ```bash
   node scripts/serve-dashboard.js
   ```

3. Open browser to `http://localhost:3657` (or displayed port)

4. **Test Mode Switcher:**
   - Click the "😎 Vibe & Chill" button in the header
   - Verify it changes to "🔧 Developer Tech"
   - Check that metric labels change (e.g., "Files Checked" vs "Total Files Analyzed")
   - Refresh page - verify mode persists

### Expected Results:
- ✅ Mode toggle works
- ✅ UI text changes based on mode
- ✅ Toast notification appears on mode change
- ✅ Mode persists after refresh

---

## Test 2: Tooltips

### Steps:
1. With dashboard open, hover over metric cards:
   - Total Files card
   - Total Issues card
   - Project Health card
   - Completed Tasks card

2. Hover over buttons:
   - Mode Toggle button
   - Refresh button
   - Export button

3. Toggle between Vibe & Chill and Developer Tech modes
4. Hover over same elements again

### Expected Results:
- ✅ Tooltips appear on hover
- ✅ Tooltips have different content for different modes
- ✅ Tooltips position correctly (don't go off-screen)
- ✅ Tooltips disappear on mouse out

---

## Test 3: Onboarding Wizard

### Steps:
1. Clear localStorage:
   ```javascript
   localStorage.clear()
   ```

2. Refresh the page

3. Onboarding wizard should appear:
   - Select "Beginner" skill level
   - Click "Start Tour"
   - Go through all tour steps
   - Click "Got it!" on final step

4. Refresh page - verify wizard doesn't appear again

5. Clear localStorage again, refresh, click "Skip" button

### Expected Results:
- ✅ Wizard appears on first visit
- ✅ Skill level selection works
- ✅ Tour highlights key features
- ✅ Wizard doesn't appear on subsequent visits
- ✅ Skip button works

---

## Test 4: Keyboard Shortcuts

### Steps:
1. With dashboard open, press these keys:
   - `?` - Should show help overlay
   - `ESC` - Should close overlay
   - `1` - Navigate to Overview
   - `2` - Navigate to Reports
   - `3` - Navigate to Tasks
   - `M` - Toggle mode
   - `R` - Refresh data
   - `T` - Toggle theme (light/dark)

2. Press `?` again and verify shortcuts listed

### Expected Results:
- ✅ All shortcuts work as expected
- ✅ Help overlay shows all shortcuts
- ✅ ESC closes overlays
- ✅ No conflicts with browser shortcuts

---

## Test 5: Quick Wins

### Steps:
1. Ensure you have audit data with issues

2. Navigate to Overview page

3. Scroll to "Quick Wins" section

4. **Test Quick Win Card:**
   - Click "Fix Now" on a Quick Win
   - Verify loading state appears
   - Verify success animation
   - Card should disappear after fix

5. **Test Details:**
   - Click "Details" button
   - Verify modal appears with full info
   - Close modal

6. **Test Ignore:**
   - Click "Skip" button
   - Card should fade out

7. **Test Export:**
   - Click "Save List" button
   - Verify JSON file downloads

### Expected Results:
- ✅ Quick Wins section appears with issues
- ✅ Fix action shows loading then success
- ✅ Details modal shows complete information
- ✅ Ignore removes card from list
- ✅ Export downloads valid JSON file

---

## Test 6: CLI Enhancements

### Steps:
1. Run the enhanced analyze command:
   ```bash
   node src/cli/index.js analyze
   ```

2. **Verify Output:**
   - ASCII art banner
   - Color-coded health score
   - Summary card with metrics
   - Issue list grouped by severity
   - Recommendations section

3. Run quick scan:
   ```bash
   node src/cli/index.js quick
   ```

4. Run explain commands:
   ```bash
   node src/cli/index.js explain health-score
   node src/cli/index.js explain security
   node src/cli/index.js explain quick-wins
   ```

### Expected Results:
- ✅ Beautiful ASCII art displays
- ✅ Colors are applied correctly
- ✅ Summary cards show key metrics
- ✅ Issues are grouped and color-coded
- ✅ Quick command shows top 5 issues only
- ✅ Explain commands show detailed information

---

## Test 7: History Tracking & Compare

### Steps:
1. Run two audits:
   ```bash
   node src/cli/index.js analyze
   # Make a small change to code
   node src/cli/index.js analyze
   ```

2. Check history file created:
   ```bash
   cat .zippycodesaudit/history/audits.json
   ```

3. Run compare command:
   ```bash
   node src/cli/index.js compare
   ```

4. **Verify Compare Output:**
   - Shows health score change
   - Shows issue count change
   - Color-coded improvements (green) or declines (red)
   - Regression warnings if applicable

### Expected Results:
- ✅ History file created in `.zippycodesaudit/history/`
- ✅ Contains array of audit objects
- ✅ Compare command shows differences
- ✅ Regression detection works

---

## Test 8: Real-Time WebSocket Updates

### Steps:
1. **Start WebSocket server:**
   ```bash
   node src/services/websocket-server.js
   ```
   Should see: "WebSocket server listening on port 8081"

2. Open dashboard in browser

3. Check browser console for:
   ```
   WebSocket connected - ready for real-time updates
   ```

4. **Trigger an audit** (via CLI or dashboard)

5. **Observe Live Progress Card:**
   - Should appear in bottom-right corner
   - Progress bar should animate
   - File counter should increment
   - Issue counter should update
   - Current file name should change
   - Should show stage ("Analyzing files...")

6. Wait for audit to complete:
   - Progress card should auto-hide
   - Toast notification should appear
   - Dashboard should auto-refresh

7. **Test Close Button:**
   - Start another audit
   - Click X button on progress card
   - Verify it closes

### Expected Results:
- ✅ WebSocket connects successfully
- ✅ Live progress card appears on audit start
- ✅ Counters update in real-time
- ✅ Progress bar animates smoothly
- ✅ Current file updates
- ✅ Card auto-hides on completion
- ✅ Close button works
- ✅ Dashboard refreshes after audit

---

## Test 9: Export Functionality

### Steps:
1. With dashboard open and data loaded:
   - Click Export button in header (or press `E`)
   - Verify JSON file downloads
   - Open file and verify it contains:
     - Timestamp
     - Project info
     - All dashboard data

### Expected Results:
- ✅ Export button works
- ✅ JSON file downloads
- ✅ File contains valid JSON
- ✅ Data is complete and correct

---

## Test 10: Accessibility

### Steps:
1. **Keyboard Navigation:**
   - Tab through all interactive elements
   - Verify focus indicators are visible
   - Press Enter/Space on buttons
   - Navigate modals with Tab/Shift+Tab

2. **Screen Reader (if available):**
   - Enable screen reader
   - Navigate through dashboard
   - Verify ARIA labels are read
   - Check all images have alt text

3. **High Contrast Mode:**
   - Enable high contrast in OS settings
   - Refresh dashboard
   - Verify all text is readable

4. **Reduced Motion:**
   - Enable reduced motion in OS
   - Refresh dashboard
   - Verify animations are minimal

### Expected Results:
- ✅ All elements accessible via keyboard
- ✅ Focus indicators visible
- ✅ Screen reader announces elements correctly
- ✅ High contrast mode works
- ✅ Reduced motion respected

---

## Test 11: Responsive Design

### Steps:
1. Open dashboard in browser

2. **Desktop View (1920x1080):**
   - Verify layout is spacious
   - All cards visible
   - Navigation full width

3. **Tablet View (768x1024):**
   - Open DevTools
   - Set viewport to tablet size
   - Verify responsive adjustments

4. **Mobile View (375x667):**
   - Set viewport to mobile size
   - Verify:
     - Navigation collapses
     - Cards stack vertically
     - Quick Wins cards single column
     - Live progress card full width

### Expected Results:
- ✅ Desktop layout looks good
- ✅ Tablet layout adjusts appropriately
- ✅ Mobile layout is usable
- ✅ No horizontal scrolling
- ✅ All features accessible on small screens

---

## Test 12: Dark Mode

### Steps:
1. With dashboard open:
   - Click theme toggle (moon icon) or press `T`
   - Verify dashboard switches to dark mode
   - Check all elements have appropriate colors
   - Verify readability

2. Refresh page:
   - Verify dark mode persists

3. Toggle back to light mode:
   - Click theme toggle again
   - Verify smooth transition

### Expected Results:
- ✅ Theme toggle works
- ✅ Dark mode colors are readable
- ✅ All components support dark mode
- ✅ Theme persists across sessions
- ✅ Smooth transition animation

---

## Common Issues & Solutions

### Issue: Dashboard won't load
**Solution:** Ensure API server is running: `node simple-api.js`

### Issue: WebSocket not connecting
**Solution:** Start WebSocket server: `node src/services/websocket-server.js`

### Issue: No data showing
**Solution:** Run an audit first: `node src/cli/index.js analyze`

### Issue: Mode doesn't persist
**Solution:** Check localStorage isn't being cleared by browser extensions

### Issue: Tooltips not showing
**Solution:** Clear browser cache and refresh

### Issue: Quick Wins empty
**Solution:** Run audit on a project with actual code issues

---

## Performance Testing

### Load Time
```bash
# Measure dashboard load time
# Should be < 1 second on modern hardware
```

### Mode Switch Speed
```bash
# Click mode toggle rapidly
# Should feel instant (< 100ms)
```

### Tooltip Response
```bash
# Hover over elements quickly
# Tooltips should appear within 50ms
```

### WebSocket Latency
```bash
# Check console for message timestamps
# Updates should be < 50ms after event
```

---

## Regression Testing Checklist

After any code changes, verify:

- [ ] All pages load without errors
- [ ] Navigation works
- [ ] Mode switcher toggles correctly
- [ ] Tooltips appear on hover
- [ ] Keyboard shortcuts work
- [ ] Quick Wins section displays
- [ ] CLI commands run successfully
- [ ] History is saved correctly
- [ ] WebSocket connects (if server running)
- [ ] Export functionality works
- [ ] Dark mode works
- [ ] Mobile layout displays correctly

---

## Browser Testing Matrix

Test on these browsers for full compatibility:

- [ ] Chrome 90+
- [ ] Firefox 88+
- [ ] Safari 14+
- [ ] Edge 90+
- [ ] Opera 76+

---

## Automated Testing (Future)

Consider adding:
- Unit tests for utility functions
- Integration tests for API endpoints
- E2E tests for user workflows
- Visual regression tests
- Accessibility automated tests

---

## Reporting Issues

When reporting issues, include:
1. Browser and version
2. Steps to reproduce
3. Expected vs actual behavior
4. Console errors (if any)
5. Screenshots (if visual issue)

---

## Testing Completion

Once all tests pass:
1. Document any issues found
2. Fix critical bugs
3. Update documentation
4. Mark release as ready
5. Deploy to production

---

**Happy Testing!** 🚀

