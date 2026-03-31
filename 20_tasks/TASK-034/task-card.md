# TASK-034: Fix VIDEOS undefined bug

## Goal
Fix the one blocking bug preventing release of the Fighting Achievement platform.

## Problem
`renderVideos()` in `app.js` references `VIDEOS` array, but `data.js` does not define it.
This causes a `ReferenceError` in console and makes the video page unusable.

## Fix
Add to `data.js` (near the other data arrays):
```js
const VIDEOS = [];
```

## Verification
- `npm run serve` or open `index.html`
- Open console — no ReferenceError
- Navigate to video section — renders empty state gracefully
- All other pages still work

## Scope
One line. Agent 2 should commit + push to the fighting-achievement repo.
