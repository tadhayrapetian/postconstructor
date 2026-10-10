# pcmock — «Мокап» и «Instagram» (sub-tabs of «Открытки»)

Build: `python3 ks/build13.py v24b.html ks/mods/pcmock/app.html --mods photos,passport,pos,stats,home,stamps,postcard,nav,neuro,logo,pcmock`
Test: `node ks/mods/pcmock/test.js` (Mac light/dark, iPad touch, core checks). Requires the `postcard` module (tab group `postcard`).

## What it does
- **Мокап** (`KS.tab id:'pcmock'`, seg «Мокап», screen): the current design (`st.dz`, front + back when `sides>1`)
  is rasterized with the app's `pageCanvas(KS.page(w,h,dzHTML(...)),200)` (~200 dpi, cached by a hash of the side HTML),
  then composed on a 2400 px canvas (4:3 = 2400×1800; 1:1 = 2000×2000; 4:5 = 1800×2250; «Авто» = 4:3 for pcH, 4:5 for pcV).
  Scenes, all procedural (no external images): `flat` (wood/linen/marble table, envelope with wax seal TH, dried-flower bundle
  with twine, optional back card under the front), `frame` (wall plaster, oak/white/black frame with mat bevel and glass sheen),
  `stack` (3 cards, bottom shows the back), `duo` (front + back side by side, column on portrait formats),
  `tilt` (perspective card via triangle-mesh warp, paper thickness edge, floating shadow, palette-tinted backdrop).
  Options: surface, envelope, frame, wall, format, «Показать оборот», «Тени листьев» (window leaf shadows).
  Buttons: PNG, JPG (`KS.download`), «В мои фото» (`KS.photos.add` → album «Разное», JPEG; falls back to writing `ph:<id>` in IDB per the convention).
  A strip of live thumbnails of all 5 scenes switches scenes.
- **Instagram** (`id:'pcig'`): post 1080×1350 and story 1080×1920 rendered side by side; background: palette tint / blurred card
  (multi-step downscale — no `ctx.filter`, works in Safari) / white / dark; card with shadow (+ optional back behind);
  brand mark = `KS.thSVG({v:'sig'})` turned into an SVG image with the Great Vibes font embedded as data URL
  (if fonts cannot be fetched, the same signature is drawn on canvas with the page's font); editable caption
  (default «Заказать: Instagram @tadhayrapetian», stored in `st.ks.pcmock.ig.cap`). PNG download per format, «Оба в мои фото».
- ⌘K: «Мокап открытки», «Открытка для Instagram».

## Data
`KS.store('pcmock')`: `{scene,surf,env,frame,wall,back,leaves,fmt,ig:{bg,cap,mark,back}}`. No design changes, no new element props.

## Notes
- Shadows are drawn with the off-canvas `shadowOffset` trick (only the blur lands on the canvas), so they work in Safari.
- The mockup re-renders on tab show and when the design hash changes (checked 450 ms after `update` renders).
- In the sandbox the first rasterization is slow (the mocked Google Fonts CSS returns every font, so `fontCSSFor` embeds all
  of them); with real Google Fonts it is one family per request.
- API for other modules: `KS.pcmock.compose(scene,cards,opts,W,H)`, `KS.pcmock.ig(kind,cards,opts)`, `KS.pcmock.cards()`.
