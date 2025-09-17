# JuiceIT Beta Testing Guide

## QA Test Steps

### 1. Guest User Limit Test
**Steps:**
1. Open app without signing in
2. Generate 3 recipes (select any mood/goal combinations)
3. Attempt 4th generation

**Expected:** 
- Generations 1-3 show "Free uses today: X/3 • Y left"
- 4th attempt triggers paywall with "Out of free recipes today"

### 2. Free Authenticated User Test
**Steps:**
1. Sign up/sign in with new account
2. Generate 3 recipes, watching usage counter
3. Attempt 4th generation

**Expected:**
- Counter shows: "2/3 • 1 left" → "1/3 • 0 left" → "0/3 • 0 left"
- 4th attempt triggers paywall

### 3. Stripe Upgrade Flow Test
**Steps:**
1. From paywall, tap "Go Unlimited • $10/yr"
2. Complete Stripe sandbox checkout
3. Return to app, check badge status
4. Generate 4th recipe

**Expected:**
- Stripe checkout opens in browser
- Return to app shows "Pro • Unlimited" badge
- 4th+ generations work without limit

### 4. Pro Unlimited Test
**Steps:**
1. With Pro account, generate 4th, 5th, 6th recipes
2. Check usage badge throughout

**Expected:**
- Badge always shows "Pro • Unlimited"
- No generation limits enforced

### 5. Offline Mode Test
**Steps:**
1. Save 2-3 favorite recipes while online
2. Enable airplane mode
3. Try to generate new recipe
4. Check favorites tab

**Expected:**
- Generation shows friendly error + retry button
- Favorites tab shows cached recipes with "(offline)" note
- No infinite spinners or crashes

### 6. Device UI Fit Test
**Test on:** iPhone SE, iPhone 15 Pro Max, Pixel 4a (or similar size ranges)

**Steps:**
1. Navigate through all screens
2. Check tap target sizes (especially small buttons)
3. Verify no content cut off by notches/safe areas

**Expected:**
- All buttons minimum 44pt tap targets
- Content respects safe areas
- Text scales properly with system font size

## Bug Report Template

**Device/OS:** iPhone 15 Pro / iOS 17.2
**Steps:** 
1. 
2. 
3. 

**Expected:** 
**Actual:** 
**Screenshot:** [Attach if helpful]
**Would you pay $10/year for this app?** Y/N - Why?

## Known Limitations
- Analytics events require authentication (guest actions not tracked)
- Offline favorites limited to last 10 saved recipes
- Deep linking requires manual testing with actual Stripe checkout

## Success Criteria
- [ ] All 6 test scenarios pass
- [ ] No crashes or infinite loading states
- [ ] UI fits properly on test devices
- [ ] Paywall conversion flow works end-to-end