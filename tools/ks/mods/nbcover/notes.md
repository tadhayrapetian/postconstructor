# nbcover — «Блокноты → Обложка»

Sub-tab `nbcover` in group `notebook` (rail «Блокноты», before «Печать», app print, `screen:true`).
Sources: `p1_core.js` (settings, geometry, textures, QR/barcode), `p2_tpl.js` (38 vector templates),
`p3_render.js` (composition, text/back/spine layers, endpapers, print sheets), `p4_data.js` (art, AI, history,
my covers, raster, series, names), `p5_ui.js` (panel, screen, 3D, mockup, API). `bash make.sh` concatenates them into `mod.js`.
CSS prefix `nbc-`; data attributes prefixed `data-nb*` (app already uses `data-pal`, `data-view` …).

## Shared contract
- Reads `KS.nb.get()/coverSize()/spineMM()` (agent A); without it uses `st.ks.notebook` fields; without both, its own
  format picker (A5 spiral by default, `KS.store('nbcover').own`). Re-renders on `nbChanged`.
- Geometry: `wrap` from coverSize → back | spine | front; not wrap → separate front/back (overhang included in coverSize);
  `staple` → one wrap with a fold line (spine 0). Bleed 3 mm, safe zone 5 mm, punching zone shown for coil bindings.
- Saves `KS.idb.set('nb:cover',{front,back,wrap,w,h,spine,binding,tpl,updated},'files')` (JPEG 150 dpi, trimmed, no bleed)
  automatically 3.5 s after changes and on «Сохранить для блокнота» / print; emits `nbCoverChanged`.
- `KS.nbCover = { pages(), forName(name, field?), series(n), snapshot(), load(snap), save(), thumb(dpi), mockup(), geo(), open(), templates() }`
  — all return promises where async. `pages()` = print pages via `KS.page` (outer + inside interleaved for duplex).

## Storage
- `KS.store('nbcover')`: design settings only (no bitmaps). `art` holds meta `{id,w,h,lum,kind,name}`.
- IDB 'files': `nbc:art` current picture `{id,src}`; `nbc:hist` index + `nbc:h:<id>` AI images; `nbc:my` saved designs +
  `nbc:myart:<id>`; `nb:cover` contract record. API keys are never stored here (neuro module).

## Features
- «Ключ API» card (KS.neuro.hasKey/provider/spendLine, button → KS.neuro.settings()); hidden without KS.neuro.
- 38 templates in 8 categories (minimal, kraft/marble/leather/linen/terrazzo/wash textures baked to canvas, patterns,
  botanical, topo, mountains, space, mesh, aurora, Bauhaus, Memphis, art deco, kids, school «ТЕТРАДЬ», year planner
  with real calendars, lined paper, TH monogram/brand via `KS.thSVG`, Armenian rosette/pomegranates/Ararat — original drawings),
  4–5 palettes each + custom background/accent.
- Text: title (« / » = line break), subtitle, owner, year; any app font; size; colour; foil (gold/silver/rose/copper
  gradient), emboss; positions top/centre/bottom/label/left/none; plates white/round/frame/band; spine text ≥ 5 mm (both directions).
- Back: TH logo (variant), info line + shop contacts, QR or barcode (EAN-13 auto). Endpapers: tint, pattern,
  «Этот блокнот принадлежит», studio contacts + QR, TH brand.
- Photo (file, drag-drop, photo library), AI art: fit/fill, position (sliders or drag on preview), zoom,
  darken/lighten, picture on front or whole cover, back = template / colour / mirrored continuation.
- AI: 20 style chips, subject, colour moods (incl. template colours), «своими словами» → `KS.neuro.text` strong English prompt
  (editable), «без текста» always appended, aspect = nearest supported ratio of the real cover (panorama for wraps),
  1–4 variants or «4 стиля сразу», cost shown before running (`price()×n`), picker, IDB history (reuse free, delete).
- Materials (matte/gloss/soft-touch/kraft/linen) → print hints + 3D sheen + mockup.
- Views: flat spread with guides; CSS-3D book (drag/touch rotate, presets; spiral/wire-o/rings/disc coils, spine face,
  staples); print-sheet preview. Mockup PNG (canvas, 1800×1350).
- Output: A4 sheets with crop + spine marks, footer hint (card 250–300 g, rear tray); wrap bigger than A4 → warning +
  choice A3 / tile 2×A4 with 16 mm overlap and glue line / scale; duplex inside cover mirrored correctly;
  G3410 → two-step manual duplex. Print (KS.print), PDF (app `exportPDF`, 300 dpi), PNG 300 dpi with bleed.
- Series (2–12 colour variants, preview strip, print/PDF), names list → one cover per name (print/PDF), «Мои обложки».
- ⌘K: «Обложка для блокнота», «Обложка блокнота: ИИ-генератор».

## Tests
`node test.js [app.html] [--int]` — mocked Gemini (image + text), 61 checks, screenshots in `shots/` (standalone build)
and `shots_int/` (full build with notebook, nbextra, nbshop). Both: ALL OK. `regress.sh` on `app.html` and `app_full.html`: 4× no errors.

## Known limitations
- First raster export (PNG/PDF/mockup/auto-save) embeds web fonts and can take 10–20 s in a slow network; later ones ~2 s.
- Series uses template palettes (pictures are not recoloured). Tiling is offered only for wrap covers.
- 3D book is CSS 3D (no real page curl); mockup PNG is a 2D angled render, not a screenshot of the 3D view.
