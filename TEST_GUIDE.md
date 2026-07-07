# Manual Test Guide: Language Toggle Fix

## Quick Test (2 minutes)

### Desktop
1. Open browser → http://localhost:3000 (or production URL)
2. Look at page content (should be in English)
3. Click **"العربية"** button in top-right header
4. **Expected:** 
   - Header text changes immediately ✓
   - Page shows brief loading spinner ✓
   - After ~1-2 seconds, entire page reloads in Arabic ✓
   - All text on page is now Arabic ✓
5. Click **"EN"** button to switch back
6. **Expected:** Page reloads in English ✓

### Mobile (if available)
1. Open browser on mobile → same URL
2. Tap hamburger menu (three lines) in top-right
3. Scroll down in menu to find language toggle
4. Tap language button
5. **Expected:** Same behavior as desktop ✓

---

## Detailed Test Checklist

### Test 1: Basic Language Toggle

**Setup:**
- Clear browser cache (Cmd+Shift+Delete on Chrome)
- Open homepage fresh

**Steps:**
1. Load page
2. Verify page is in English
3. Check header text
4. Check hero section headline
5. Scroll down and check other sections

**Toggle to Arabic:**
6. Click "العربية" in header
7. Wait for reload (browser URL bar shows activity)
8. Page should reload in Arabic

**Verify Arabic:**
9. Header should show "EN" (not "العربية")
10. Hero section should show Arabic headline
11. All text should be right-aligned (RTL layout)
12. `<html dir="rtl">` should be set
13. `<html lang="ar">` should be set

**Toggle back to English:**
14. Click "EN" in header
15. Page reloads
16. Back to English layout (LTR)
17. Header shows "العربية" again

**Pass Criteria:** ✅
- Page visibly reloads (you can see it)
- All content updates to new language
- Layout direction changes (RTL ↔ LTR)
- No console errors

---

### Test 2: Persistence (Refresh Test)

**Setup:**
- After toggle to Arabic (from Test 1)

**Steps:**
1. Press F5 to manually refresh page
2. Wait for page to load
3. Verify page is still in Arabic
4. Check `localStorage.getItem('loversdc:locale')` in console
5. Check `document.cookie` in console for `ldc_locale=ar`

**Pass Criteria:** ✅
- Page loads in Arabic (not English)
- Cookie is preserved
- Language persists across page refresh

---

### Test 3: Landing Sections Update

**Setup:**
- Page in English

**Steps:**
1. Scroll down to each section and note the English text:
   - Hero: "Make a healthy life"
   - Services: "Nutrition", "Meals", "Snacks", etc.
   - How it Works: "Step 1", "Step 2", etc.
   - Testimonials: Customer names and quotes
   - FAQ: Question titles
   - Footer: Footer links

**Toggle to Arabic:**
2. Click "العربية"
3. Wait for reload

**Verify All Sections Updated:**
4. Hero: "اصنع حياة صحية"
5. Services: "استشارات", "وجبات صحية", etc.
6. How it Works: Arabic text
7. Testimonials: Arabic text
8. FAQ: Arabic questions
9. Footer: Arabic text

**Pass Criteria:** ✅
- Every section on page updates to Arabic
- No hardcoded English text remains
- All translatable content is translated

---

### Test 4: No False Reloads

**Setup:**
- Page is in English or Arabic (doesn't matter)

**Steps:**
1. Click on different links (don't use language toggle):
   - "About" link
   - "Services" dropdown
   - "Sign In" button
   - Header logo (go to homepage)
2. Navigate around the site
3. Go back to homepage

**Pass Criteria:** ✅
- No unexpected page reloads
- Page navigates normally without reloading
- Language toggle is the only thing that causes reload

---

### Test 5: Mobile Menu

**Setup:**
- Open on mobile (or use browser DevTools mobile view)
- Phone width: 375px or similar

**Steps:**
1. Page should show English
2. Tap hamburger menu (top-right)
3. Menu should open with navigation items
4. Scroll down in menu
5. Find language toggle button
6. Tap it (might say "التبديل إلى العربية" or "Switch to English")
7. Menu should close
8. Page should reload in new language

**Verify after reload:**
9. Menu is closed
10. Entire page is in new language
11. No console errors

**Pass Criteria:** ✅
- Mobile menu works
- Language toggle in mobile menu works
- Page reloads correctly

---

### Test 6: Console & Developer Tools

**Setup:**
- Open Developer Tools (F12)
- Go to Console tab

**Steps:**
1. Load homepage (English)
2. Click "العربية"
3. Watch console as page reloads
4. Should see message: `[v0] Locale cookie changed, reloading page...`
5. Page reloads
6. No errors or warnings in console

**Pass Criteria:** ✅
- Console message appears when toggle is clicked
- No red error messages
- No yellow warnings
- Successful page reload

---

### Test 7: Cross-Tab Behavior

**Setup:**
- Open two browser tabs
- Both on homepage

**Steps:**
1. In Tab 1: Set language to Arabic
2. Go to Tab 2
3. Tab 2 should still show English (it has its own listener)
4. Click language toggle in Tab 2
5. Tab 2 should reload to Arabic
6. Go back to Tab 1
7. Tab 1 should still be Arabic

**Pass Criteria:** ✅
- Each tab manages its own language
- Tabs don't interfere with each other
- Toggling in one tab doesn't affect other tabs

---

### Test 8: Performance Check

**Setup:**
- Open DevTools → Performance tab
- Or use Lighthouse

**Steps:**
1. Record page load (English)
2. Stop recording
3. Check metrics (FCP, LCP, CLS, etc.)
4. Should be reasonable (< 3 seconds FCP)

5. Now toggle language
6. Record reload
7. Stop recording
8. Check reload metrics

**Pass Criteria:** ✅
- Reload time: 1-2 seconds (acceptable for language switch)
- No janky animations during reload
- No layout shifts during reload

---

## Failing Test Examples

### Red Flag: Page Doesn't Reload
❌ Click language toggle
❌ Header changes but page content stays English
❌ No reload happened
→ **Fix failed. Check console for errors.**

### Red Flag: Infinite Reloads
❌ Click toggle
❌ Page reloads repeatedly
❌ Gets stuck in loop
→ **Cookie sync detection broken. Check localStorage/cookie values.**

### Red Flag: Console Errors
❌ Console shows: `Cannot read property 'split' of undefined`
❌ Or similar JavaScript error
→ **Check locale.tsx syntax. May have broken during edit.**

### Red Flag: Wrong Language After Reload
❌ Click "العربية"
❌ Page reloads
❌ But still shows English
→ **Cookie not being saved correctly. Check writeCookie() function.**

---

## Browser DevTools Commands

### Check Current Locale Cookie
```javascript
// In browser console:
document.cookie
// Should show: "ldc_locale=ar" or "ldc_locale=en"

// Or more specific:
document.cookie.split(';').find(c => c.includes('ldc_locale'))
// Should show: " ldc_locale=ar" or " ldc_locale=en"
```

### Check LocalStorage
```javascript
// In browser console:
localStorage.getItem('loversdc:locale')
// Should show: "ar" or "en"
```

### Check HTML Attributes
```javascript
// In browser console:
document.documentElement.lang
// Should show: "ar" or "en"

document.documentElement.dir
// Should show: "rtl" or "ltr"
```

### Manual Cookie Manipulation (for testing)
```javascript
// To manually set cookie (don't do this in production):
document.cookie = "ldc_locale=ar; Path=/; Max-Age=31536000"
// Then reload page manually
```

---

## Quick Pass/Fail Checklist

Use this for quick validation before deploying:

```
✓ English page loads            [ ]
✓ Toggle to Arabic works        [ ]
✓ Page auto-reloads             [ ]
✓ Arabic displays correctly      [ ]
✓ RTL layout activates          [ ]
✓ Toggle back to English works  [ ]
✓ English displays correctly     [ ]
✓ LTR layout activates          [ ]
✓ Refresh maintains language    [ ]
✓ All sections translated       [ ]
✓ No console errors             [ ]
✓ Mobile view works             [ ]
✓ No false reloads on nav       [ ]

OVERALL: [ ] PASS  [ ] FAIL
```

---

## Issues & Troubleshooting

### Issue: Page reloads but still shows English

**Possible causes:**
1. Cookie not being written correctly
2. `getLocaleServer()` not reading new cookie
3. Network latency (server cached old page)

**Solutions:**
1. Check in DevTools: `document.cookie` should show new locale
2. Hard refresh: Cmd+Shift+R (bypass browser cache)
3. Clear cache manually: DevTools → Application → Clear Storage
4. Check server logs for `getLocaleServer()` execution

### Issue: Page reloads constantly

**Possible causes:**
1. Poll timeout not working (maxChecks issue)
2. Cookie value changing unexpectedly
3. Listener not stopping after 5s

**Solutions:**
1. Check console for `[v0] Locale cookie changed` messages
2. Count how many times the message appears (should be 1)
3. If appearing more than once, listener is not stopping correctly

### Issue: Mobile menu doesn't close after toggle

**Possible causes:**
1. Mobile menu state not reset on reload
2. JavaScript error in mobile menu handler

**Solutions:**
1. Clear cache and try again
2. Check DevTools for JavaScript errors
3. Manually close menu before toggle

---

## When to Declare Success

✅ You can declare the fix successful when:
- Toggle button works (header updates immediately)
- Page auto-reloads within 1-2 seconds
- All content (every section) updates to new language
- No console errors
- Mobile works the same as desktop
- Refreshing maintains the language choice
- No false reloads on other page navigation

---

## Reporting Results

If you find an issue, include:
1. **What you did:** Step-by-step reproduction
2. **What you expected:** What should have happened
3. **What actually happened:** What went wrong
4. **Browser/Device:** Chrome/Safari/Firefox on Mac/Windows/Mobile
5. **Console errors:** Any error messages (screenshot or paste)
6. **Screenshot:** Visual evidence of the issue

---

**Test Date:** _____________
**Tester Name:** _____________
**Result:** ☐ PASS ☐ FAIL
**Notes:** _________________________________
