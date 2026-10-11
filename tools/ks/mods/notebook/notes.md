# Module `notebook` — «Блокноты» (agent A)

Rail button «Блокноты» (group `notebook`, `before:'prep'`, `app:'print'`), three sub-tabs, all with `screen:true`:
**Блок** (inner-page builder + spread preview), **Готовые** (presets, «Мои блокноты», own templates), **Печать**
(binding, imposition, duplex, print, PDF, cover, refill packs, cost, order). nbcover / nbextra / nbshop add their sub-tabs after these.

Sources: `core.js` (formats, store, i18n, drawing list → SVG), `gen.js` (page types + page composition),
`imp.js` (imposition, sheets, vector PDF, costs), `ui.js` (tabs, panels, screens, API) → `python3 make.py` concatenates them into `mod.js`.
CSS prefix `nb-`.

## Features
- **Formats**: A4, A5, A6, A7, B5, B6, Тетрадь 170×205, Letter, Half Letter, Moleskine L 130×210, Pocket 90×140, Traveler's 110×210,
  Паспорт 89×124, квадрат 140 and 210, 10×15, custom W×H; portrait/landscape; visual proportional tiles.
- **51 page types**, each a vector generator with its own parameters (auto-generated controls: steppers, selects, quick presets):
  blank, lined (узкая/College/широкая/школьная), grid (4/5/7/¼″, bold every N, dashed), school grid 5 мм with red outer margin,
  dots, dots+lines, lines+dots half/half, isometric (lines/dots), hex, graph paper 1/5/10, music staff / guitar TAB, Cornell,
  calligraphy (x-height, ascender/descender ratios, slant angle and spacing, presets), прописи 3-line with trace sample,
  косая линейка (4 мм, interline, helper line, 65° slants, margin), 米字格/田字格/九宫格 (+pinyin band), 原稿用紙 genkō yōshi,
  daily planner (real dates), week (horizontal/vertical, page or spread), monthly calendar (real dates, Monday-first,
  optional spread with monthly log), year at a glance, habit tracker, year in pixels, gratitude, goals, checklist, meal plan,
  budget, cash book/ledger, reading log, recipe, contacts, passwords, workout, fitness measurements, travel itinerary,
  packing list, wedding planner (checklist/budget/guests), baby log, garden planner, storyboard, Gantt, mind map,
  Zettelkasten card, attendance register, school timetable, школьный дневник (week spread Пн–Сб with real dates),
  lab notebook, title page («Этот блокнот принадлежит…» + owner), contents (auto-filled from sections), notes.
- Printed labels/months/weekdays in **Russian, Armenian, English** (`lang`). Week starts on Monday; ISO week numbers.
- **Style**: line colour palette + custom, weight, saturation, font (Golos/PT Serif/Montserrat/Caveat), margin line (colour,
  side, distance, snaps to grid), header strip with custom text (`{n} {i} {title} {sec}` tokens) and date field,
  per-section header text, **per-page header override** (click a page in the preview), page numbers (outer/centre/inner/none,
  start number, on title), mirrored margins + gutter, min 5 mm everywhere (GX4040 border), TH logo via `KS.thSVG({v:'mono'},dzPal({ink:'#888'}))`
  (only when the postcard module is built in), perforation / tear-off guide (inner/top/bottom), hole guides for spiral (4:1),
  wire-o (3:1), disc and rings (2 or 4 holes, ISO 80 mm), gutter warning with one-tap fix.
- **Block builder**: ordered sections (type, count, params, header, alternate type for left pages, TOC name); add via a
  visual type picker (categories, lazy thumbnails); reorder by drag (mouse) or ↑/↓ (iPad); duplicate; delete with «Вернуть».
  Spread-based types (week spread, month spread, школьный дневник) automatically get a filler page so they start on a left page.
- **Preview**: real spreads with gutter shadow (page 1 alone on the right), zoom, lazy SVG via IntersectionObserver,
  thumbnail strip, click page → its section opens in the panel. Dots/grids use SVG `<pattern>`s.
- **Presets** (26): тетради 48/18, bullet journal, ежедневник (365 days), weekly planner, sketchbook, recipes, прописи, music,
  Cornell, travel book, школьный дневник, lab, cash book, attendance, wedding, baby, fitness, gratitude, Zettelkasten cards,
  graph paper, calligraphy, hanzi, pocket, project notebook, «два в одном» (alternating). Own templates («Сохранить как шаблон»).
- **Мои блокноты**: every notebook autosaves (debounced) into IndexedDB; list with live thumbnails, open, rename, duplicate,
  delete. Applying a preset creates a new project and keeps the old one. Module data lives in `st.ks`, so app undo never touches it.
- **Imposition** (always onto portrait sheets — A4 / Letter / A3 — so the printer's long-edge duplex is exact): 1-up,
  auto n-up (rotates pages when more fit: A5 2-up, A6 4-up, A7 8-up, custom sizes), saddle-stitch booklet (pages padded
  to ×4, sheet 1 front [N,1] back [2,N-1]), sewn signatures (sheets per signature, each a booklet, collation marks on the spine),
  creep compensation (auto from paper thickness / manual / off), order on sheet: cut & stack / sequential / identical copies,
  cut and fold marks (outside the pages when there is room, otherwise ticks on the cut lines inside the printable area),
  sheet number «лист 3 из 12 · лицо» in free margins, long/short edge flip. Back sides are computed generically:
  `Tback = Mflip ∘ Tfront ∘ Fpage`, so rotation, creep and n-up all stay aligned.
- **Printing**: GX4040 (auto duplex) → one interleaved job; G3410 → 3-step manual duplex wizard with pictures (fronts → flip
  the stack over the long edge → backs, optional reverse order); test sheet (first sheet only), sheet range «1-3, 5»,
  print via `KS.print` (exact `@page` sizes, vector SVG).
- **PDF**: «Скачать PDF» builds a real vector PDF with jsPDF (lines/grids/dots/shapes vector, text embedded as 400 dpi images,
  rotated for imposed sheets) — either print sheets or trim-size pages; plus «PDF через окно печати» (app's `vectorPDF`).
- **Cover**: «Печать обложки» → `KS.nbCover.pages()` if present; size from `KS.nb.coverSize()` shown.
- **Refill packs**: any section or page type, N sheets, notebook format or A4/A5, 1/2 sides → print or PDF.
- **Costs**: paper from `st.shop.prices.papers` (per A4 sheet, scaled for other sheets), ink coverage per page type
  (light/medium/heavy per printed A4 side), binding and cover prices, labour — all editable in «Цены для расчёта»;
  quantity, client price, cost, profit; «Создать заказ» → `newOrder({client,phone,product,qty,paper,sides,fin,price,cost,note,nb})`
  (`nb` = notebook snapshot) and emits `KS.emit('nbOrder',order)`.
- ⌘K: «Блокноты: открыть конструктор / готовые шаблоны / печать блока / мастер двусторонней печати / скачать PDF /
  добавить раздел / создать заказ / печать обложки». A «Блокноты» tile is added to Главная's quick actions (home has no API).

## Store `KS.store('notebook')`
`fmt, land, cw, ch` (custom size), `w, h` (trim size as oriented), `pages` (total inner pages), `padded` (after booklet padding),
`paperId, paperGsm, binding ('spiral'|'wireo'|'staple'|'perfect'|'sewn'|'rings'|'disc'|'none'), sides (1|2), title, owner, year,
start ('YYYY-MM'), lang ('ru'|'hy'|'en'), font, name` (project name),
`st` {c, lw, op, margin, mc, mside, mdist, hdr, hdrDate, hdrText, pn, pnStart, pnTitle, mirror, gutter, mt, mb, mo, logo, perf, holes, holes4},
`secs` [{id, type, n, p:{params}, ht (header text), alt (type for left pages), ap (its params), name}], `hov` {pageNumber: header text},
`pr` {imp, sheet, order, marks, creep, creepMM, sig, range, rev, flip, nums, gap, nup, qty, what},
`cost` {bind:{<binding>:{c,p}}, cover:{c,p}, ink:{l|m|h:{c,p}}, labor}, `my` [own templates {id,n,d,data}],
`projs` [{id,name,upd,pages,fmt}], `cur` (open project id), `ui` {sel, pg, zoom, cat, opens}.
IndexedDB (`kv`): `nb:p:<id>` → notebook snapshot.

## `KS.nb` API
`get()` store (pages synced) · `spineMM()` = leaves × gsm × 0.00125 · `coverSize()` → perfect/sewn `{w:2w+spine,h,spine,wrap:true}`,
otherwise `{w:w+over,h:h+2·over,spine,wrap:false,over}` (over 3 mm for spiral/wire-o/rings/disc) · `onChange(fn)` (= `KS.on('nbChanged')`) ·
`load(settings)` replace notebook settings (+ emit `nbChanged`, autosave) · `snapshot()` deep copy of settings ·
`pages()` [{num,type,sec,verso}] · `pageSVG(i,attrs)` · `typeSVG(type,params,attrs)` · `types()` · `plan()` imposition summary
{mode, perSheet, sheets:[{front:[page nums], back:[page nums]}]} in reading order · `printPages(kind)` print pages ('all'|'fronts'|'backs') · `show(sub)`.
Events: `nbChanged` on every change, `nbOrder` after an order is created.

## Tests
```
cd $S && python3 ks/mods/notebook/make.py
python3 ks/build13.py v24b.html ks/mods/notebook/app.html --mods photos,passport,pos,stats,home,stamps,postcard,nav,neuro,logo,ux,pcai,pcbatch,pcmock,pcseries,notebook
node ks/mods/notebook/test.js [app.html]      # 91 checks, ≈2 min
bash ks/regress.sh $S/ks/mods/notebook/app.html
```
Covers rail order, formats (tiles, landscape, custom), picker, add/stepper/quick presets, reorder by buttons and by mouse drag,
duplicate/delete/undo, alternating pages, section and per-page headers, style options, logo, perforation, calendars in ru/hy/en with
real dates, presets, projects (open/duplicate/delete), own template, API load/snapshot/onChange/coverSize, booklet order
(8 pages: [8,1]/[2,7], [6,3]/[4,5]), padding, signatures, 4-up/8-up/custom n-up and mirrored backs, GX4040 duplex job + @page size,
test sheet, range, G3410 wizard (fronts, flip, backs), 1-up/2-up/single-sided, PDF download (sheets and pages), cover hook,
refills, cost card, order with snapshot, ⌘K, home tile, 391-page diary (lazy preview, job build time), Макет move/undo, card print,
mode switch, iPad taps/targets, zero page errors. Screenshots `s_*.png`; per-type galleries `g_ru*.png`, `g_hy*.png` (`node gal.js [lang]`).

## Known limitations
- PDF text is embedded as high-res images (web fonts are woff2 and jsPDF needs TTF); all lines, grids and shapes are vector.
  For fully vector text use «PDF через окно печати». A 391-page diary PDF takes ≈15 s and ≈6 MB.
- Booklets whose spread is larger than the sheet (e.g. Тетрадь 170×205 or A4 saddle-stitch on A4) are scaled with a warning —
  choose A3 sheet for those.
- Binding edge is always the left/right edge (no top-bound calendars).
- Manual duplex order depends on how the printer feeds; the wizard offers a test sheet and a reverse-order switch.
