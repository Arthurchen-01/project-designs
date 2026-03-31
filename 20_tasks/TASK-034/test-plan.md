# TASK-034 Test Plan

## TC1: No console errors
- Open `index.html`
- Open DevTools console
- Expect: zero ReferenceError messages

## TC2: Video section renders
- Click "视频" nav item
- Expect: empty state message shown, no crash

## TC3: Other sections unaffected
- Navigate: 首页 → 比赛库 → 选手库 → 荣誉 → 视频
- Expect: all sections render correctly, no regression
