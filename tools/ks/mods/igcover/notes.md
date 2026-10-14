# igcover — «Instagram → Обложки»

Covers for the owner's Instagram pages (the print shop and the English-learning page, more can be added): own fonts
(TTF / OTF / WOFF / WOFF2), Gemini backgrounds from a reference cover, an editable text layer, five formats, export.

Build (full production): `cd $S && python3 ks/build13.py v24b.html <out.html> --mods photos,passport,pos,stats,home,stamps,postcard,nav,neuro,logo,ux,pcai,pcbatch,pcmock,pcseries,notebook,nbcover,nbextra,nbshop,vpdf,envth,instamock,insta,igcover`
Sources `p1_core.js … p8_wire.js` → `./make.sh` concatenates them into `mod.js` (+ syntax check). `./build.sh` = make + `app_full.html`
(full build) + `app.html` (only `neuro,igcover`: no «Лента», used for the no-key / standalone checks). CSS `mod.css` (prefix `igc-`),
data attributes `data-igc*` only. No changes outside this folder.

## Files / parts
- `p1_core.js` state (`KS.store('igcover')`), pages, formats, docs, colours, helpers. `p2_fonts.js` own fonts (IDB + FontFace), sfnt reader
  (name + cmap of TTF/OTF, WOFF tables inflated with `DecompressionStream('deflate')`), glyph coverage, app font list, font strings, `fontsReady`.
- `p3_render.js` the one renderer for screen and export: text layout (wrap, `**accent**` markup, case, letter-spacing, auto-fit), effects,
  17 shapes, 32 icons + text icons + emoji, 22 background templates, background cache, `drawSlide`, `renderSlide`.
- `p4_ai.js` references, history of backgrounds, own photos, Gemini: vision → layout JSON → editable layout, compose → background without text,
  hooks for English covers. `p5_actions.js` undo/redo, formats, elements, presets + series, carousel slides, highlights, templates, export, «В ленту».
- `p6_panel.js` side panel. `p7_screen.js` work area: canvas editor (pointer events = mouse + touch), inspector, slide strip, modals.
- `p8_wire.js` events (click / input / change / drop / keys), the tab, ⌘K, `KS.igcover` API.

## Tab
Group `insta` (the existing «Instagram» rail button), sub-tab `igcover` «Обложки», `screen:true`, registered on `boot` after insta's three tabs and
instamock's «Мокапы» → «Лента · Стиль · Подписи · Мокапы · Обложки» (one row: `mod.css` lets the five seg buttons shrink). Without insta/instamock it
creates the «Instagram» rail button itself (before «Печать»).

## Panel
- **Страница**: switcher chips (avatar in the page accent colour), «+» new page, «Настроить» → modal: name, @handle, theme (Типография /
  Английский / Другая), 5 brand colours (`bg, ink, accent, accent2` = marker, `soft`), title / text fonts, reset colours, delete page (two taps).
  Defaults: «Типография» (`@` from insta's brand handle, cream + wax red, Cormorant Garamond / Montserrat, paper) and «Английский» (current on first
  start; cream + navy + coral + highlighter yellow, Rubik / Manrope, grid paper, LESSON preset). References, backgrounds, templates and series
  numbers are per page.
- **Обложка по образцу**: 1–12 references per page (picker or drag & drop; tap = use, up to 4, number badges), mode «Как на образце» / «Только фон»,
  variants 1–4, the button shows `n × price ≈ total` (+ analysis ≈ $0,001) before anything is spent, today/month spend, progress, Russian errors,
  variant picker, «Цвета страницы» / «Шрифты страницы» after a layout from a reference. No key: explanation + «Подключить ИИ» (`KS.neuro.settings()`).
- **Фон**: «Шаблоны» (22 procedural templates in the page colours: однотон, градиент, мягкие пятна, бумага, крафт, тетрадь в клетку, в линейку,
  точки, карточка, стикер, полароид, доска, маркер, дуотон фото, две половины, рамка, полосы, арка, рваная бумага, кляксы, словарь, солнце),
  «История» (all generated backgrounds and own photos of the page, reuse free, delete), «Фото» (upload / drop, «Из «Мои фото»» via `KS.photos`,
  as is / duotone / polaroid). Sliders «Осветлить» / «Затемнить», for pictures zoom + shift. Dark backgrounds swap `ink`↔`bg` text colours.
- **Мои шрифты**: upload (multi, drag & drop anywhere in the section), rows with «Aa» preview, format, size, coverage badges Lat / Кир / Հայ
  (✓ / ~ / ✗) and a warning («Нет кириллицы — эти буквы будут запасным шрифтом»), «Загол.» / «Текст» = page fonts, delete (two taps).
  Page font buttons and «Все шрифты и предпросмотр» → font modal: search, own fonts first with «Aa Bb The quick brown fox — Привет — Բարեւ»,
  then the 47 app fonts (`FONTS`, incl. fonts uploaded into the app itself).
- **Для английской страницы / Быстрый старт**: presets Lesson N, Word of the day, Common mistakes, Phrasal verbs, Idioms (chalkboard), Grammar
  (shop page: Новинка, Акция, Как мы делаем, Отзыв) — each press = next number of that series (`page.series`), «Номер выпуска» −/+, «Следующий
  выпуск». «Идеи заголовков»: topic → `KS.neuro.text(…,{json:true})` → 5 English hooks with `**key words**` + Russian subtitle (local templates
  without Gemini / on error); tap = title + subtitle on the cover.
- **Мои шаблоны**: save the current design (name = title), open, duplicate, delete (two taps); per page.

## Work area
Header: page · @handle · format · size, JPG / PNG, «Скачать» («Скачать ZIP» + «Слайд» for carousel / highlights), «В ленту», «В ленте · открыть».
Bar: formats Пост 4:5 (1080×1350), Квадрат (1080×1080), Reels 9:16 (1080×1920, zones: 3:4 profile-grid crop, 1:1, Reels UI areas), Карусель
(4:5 or 1:1; cover + inner slides), Highlights (1080×1920 each, circle guides: what the round bubble shows and the safe circle); undo / redo.
Canvas (devicePixelRatio, fits the area, ResizeObserver) + overlay of boxes: tap selects, drag moves (mouse, pen, touch — pointer events,
`touch-action:none`), snapping to the centre lines and 64 px safe margins with pink guides (Alt = no snap), handles: width, corner = scale
(text: size too; shape: free w/h), bottom = box height for auto-fit; double tap / Enter → text field. Keys while «Обложки» is on screen (window
capture, so the hidden Макет does not get them): arrows (Shift ×5), Delete, ⌘D, Esc, ⌘Z / ⇧⌘Z (own undo, 80 steps per design).
Side column: «Добавить» (Заголовок, Подзагол., Метка, Номер, @ник, Текст, Эмодзи, Фигура ▾ with 17 shapes) and the inspector:
- text: role, text (`**слово**` / `*слово*` = accent colour, `{num}` series number, `{handle}`, `{n}/{N}` slide, `{name}` highlight name, emoji),
  font button (own fonts first; «Шрифт страницы» by default; warning with the letters the own font lacks), size, weight (only weights the Google
  font really has, own fonts as they are), alignment, case, italic, colour + accent colour (page colours, white, black, any colour), letter-spacing,
  line height, width, «Вписать в рамку» (auto-fit: shrinks until the longest word and all lines fit the box), effects: Маркер (behind the accent
  words, else whole lines), Контур (+ thickness), Тень, Плашка (rounded pill per line), Волна (squiggle underline), Только контур; opacity, rotation.
- shape: kind, colour, size, stroke / radius, opacity, rotation. Icon: 32 line icons + Aa, A–Z, ABC, ?!, 1·2·3, EN + emoji, colour, size, line, fill.
- nothing selected: highlight name, carousel slide background (как у обложки / спокойный), layers list (select, hide).
Slide strip (carousel / highlights; highlights as round profile bubbles with names): select, add (Слово + перевод, Список, Ошибка → правильно,
Текст, Финал «подпишись», Копия; for highlights a new circle / copy), move, duplicate, delete.

## Text safety (no overlaps, always readable)
- Draw order: background → shapes / icons / emoji (in their order) → text blocks (in their order) — decor and pictures are always behind text
  (layers list and canvas hit-testing follow the same order).
- Anti-collision flow (`flowText`, render-time, non-destructive, same for screen and export): visual bounds of every text block (real lines,
  pill / squiggle included); blocks that overlap horizontally keep a gap (≈ 0.6 × the smaller size); a block below is pushed down, then an
  upward pass keeps everything inside the cover (16 px). Blocks the owner dragged or nudged get `man:1` and stay exactly where he put them
  (inspector «Авто-место» clears it); rotated blocks are fixed too. `doc.flow:false` would switch it off (no UI).
- Readability scrim (`scrimFor`): the background under each text block is sampled (1/8 copy of the cached background); when > 16 % of it has
  contrast < 2.6:1 with the text colour, a soft feathered scrim (dark for light text, page-background colour for dark text) is drawn behind
  that block. Not for pills / outlines. Checkbox «Подложка под текстом, если фон мешает читать» in «Фон» (`doc.scrim:false` = off).
- `KS.igcover.textBounds(i, doc?, page?)` → effective bounds `{id, role, man, dy, scrim, x0, x1, y0, y1}`; `KS.igcover.withTpl(doc, id)` = a copy
  with a template applied like the panel does (text colours follow dark / light).

## Gemini (through `KS.neuro` only; the key is never touched here)
- «Как на образце»: `KS.neuro.vision(refs, prompt, {json:true})` → `{background{type,colors,gradient,texture,illustration,dark}, palette, mood,
  text[{role,text,box{x,y,w,h} 0–1,align,case,weight,style,color,size (fraction of height),letter_spacing,line_height,accent_words,accent_color,
  highlight,pill,outline,underline,shadow,rotation}], shapes[{kind,box,color,rotation}], empty_areas}` → editable blocks: same boxes / colours /
  case / weight / spacing / effects, auto-fit, text of the same role is the owner's current text (reference text otherwise, accent words wrapped in
  `**`), handwritten small text → Caveat / Marck Script, titles stay in the page (own) font; shapes behind the text; an immediate local background
  (solid / gradient from the reference colours) until the art arrives. Then n × `KS.neuro.compose(refs, prompt, {aspect})` (2 in parallel; the first
  result is applied, the rest are variants). The prompt: same style / palette / textures / mood, fresh picture, ABSOLUTELY NO text / letters /
  numbers / logos / watermarks, edge to edge, the background description from the analysis, and the text areas as positions («centre 22–45% from
  the top; …») that must stay calm and EMPTY.
- «Только фон»: the same style rules, a calm empty upper-middle area (centre circle for highlights), page palette hint; text untouched.
- Key / billing / quota / network errors stop the remaining variants; safety refusals show neuro's Russian message in the card.

## Export
`renderSlide(doc, i)` draws at exact size (1080 × 1350 / 1080 / 1920) after `document.fonts.load()` of every font + the real text of every
block (Google Fonts are split by unicode-range) and after the background bitmaps are decoded. JPG (q .93) or PNG. Carousel / highlights → ZIP
(jszip 3.10.1 via `loadLib`, files one by one without it): `01_cover.jpg, 02.jpg …` / `01_uroki.png …`; name `<handle>_<format>_<date>`.
«В ленту»: `KS.insta.addPosts([{id, src: JPEG dataURL, name:'Обложка «…»', look: <feed look>, scene:'', from:'igcover', page, w, h, added}])`
(cover / first slide; not for highlights). insta has one feed (no pages), so the cover goes to that feed; passing the feed's look keeps insta from
grading it a second time (its colour harmonisation still applies, see limitations).

## Data
- `KS.store('igcover')` = `st.ks.igcover`: `{v, page, ui{bgTab, ai, nvar, zones, type, topic}, fonts:[{id,name,family:'igc-<id>',file,fmt,size,added,
  cov{lat,cyr,arm:{n,of,miss}},src:'cmap'|'measure'}], pages:[{id, kind:'shop'|'en'|'other', name, handle, col{bg,ink,accent,accent2,soft},
  fonts{title,text}, series{<preset>:n}, refs:[id], bgs:[{id,mode,ar,created}], tpls:[{id,name,created,fmt,doc}], fmt, work{main:doc, hl:doc}}]}`.
- doc: `{id, fmt:'post'|'square'|'reel'|'carousel'|'hl', car:'4:5'|'1:1', bg{k:'tpl',id,c1?,c2?,photo?} | {k:'img',id,ox,oy,z,dark}, dim, wash,
  num, series, layout?, slides:[{id, kind?, name?, bg?, els:[…]}]}`; element `{id, t:'text', role, text, x,y,w,h (design px, width 1080), font
  ('' = page font, 'own:<id>' or an app font name), size, weight, it, color, acc, align, case, ls (em), lh, fit, fx{hl,ol,olw,sh,pill,sq,sqc,hollow},
  op, rot, hide}` / `{t:'shape', k, x,y,w,h, color, op, rot, sw, r}` / `{t:'icon', k:'<icon>'|'txt:Aa'|'emo:📚', x,y,w,h, color, sw, fill, op, rot}`.
  Colours are page keys (follow the page palette) or `#RRGGBB`. Only small JSON goes to `st` (whole state of two pages ≈ 15–40 KB).
- IndexedDB store `files`: `igc:font:<id>` `{id,name,file,type,data:ArrayBuffer,ranges}` (binary never in `st`), `igc:ref:<id>` `{id,src ≤1600,thumb,
  name,added}`, `igc:bg:<id>` `{id,src ≤2048 JPEG,thumb,mode:'ref'|'bg'|'photo',ar,created,ref,prompt}`, `igc:tth:<id>` template thumbnail.
- Fonts are registered on boot (`FontFace(family, ArrayBuffer, {weight:'1 1000'})` → `document.fonts.add`), coverage from cmap (or measured for
  WOFF2: a glyph exists when the width does not depend on the fallback font).

## API (`KS.igcover`)
`open, S, page, doc, slide, state, render(doc,i,page) → canvas, exportFiles(onlyCurrent), toFeed, uploadFonts(files), deleteFont, coverage,
hasChar, missingIn, setFmt, applyPreset, applyLayout, addText, addShape, addIcon, addSlide, tplSave, tplOpen, useTpl, useBg, aiRun, ideas,
switchPage, undo, redo, layoutEl, atomsOf, fontStr, TPL, PRESETS, paintAll`.
⌘K (12): «Обложки Instagram: редактор обложек», «Обложки: обложка для Reels / Stories 9:16», «…: пост 4:5», «…: карусель», «…: кружки
Highlights», «…: загрузить свой шрифт», «…: обложка по образцу (Gemini)», «…: идеи заголовков (английский)», «…: скачать обложку», «…: поставить в
ленту Instagram», «…: сохранить как шаблон», «…: другая страница».

## Tests
`node test.js [app_full.html]` (mocked Gemini: vision → layout JSON, text → hooks JSON, image → inlineData PNG; Google Fonts via instamock's
`fontmock.js`; real font files in `testfonts/`: Bebas Neue TTF (Latin only), Neucha TTF + a WOFF made from it by the test, Noto Sans Armenian
WOFF2 subset). Output `test_out.txt`, screenshots `shots/`. Neighbours' tests run as copies in `ext/` (their outputs go to `ext/`, their folders
stay untouched): `node ext/insta_test.js app_full.html`, `node ext/insta_test_addposts.js app_full.html`, `node ext/instamock_test.js app_full.html`.
`node smoke.js [app] [dark] [ipad]` — quick screenshot of the tab (`shots/_smoke*.png`).

## Test results (2026-10-14, full build `app_full.html`)
- `test.js` — 133 passed, 0 failed, no page errors (output `test_out.txt`). Covers: no overlapping text (after a manual drag, a 230 px title
  without auto-fit, iPad touch drag, every template on both pages), blocks moved by hand stay put + «Авто-место», shape / emoji over the title
  drawn behind it, automatic scrim for dark text on a dark picture (and off switch), duotone gives light text; tab order (5 sub-tabs in one row), two default pages + switcher,
  new page / edit name, @handle, colour / delete; font upload through the file chooser (TTF, WOFF made from TTF, WOFF2), names from the font,
  FontFace registration, cmap coverage (Bebas: Latin 52/52, Cyrillic 0, Armenian 0; Neucha TTF = WOFF: Latin + Cyrillic; Noto Armenian WOFF2:
  measured), warnings, binary only in IDB, font browser + search; **own font in the downloaded PNG**: title pixels differ from the fallback-font
  rendering (≈74 000 px) and equal the FontFace rendering (0 px); select by tap, `**markup**` accent runs + accent pixels, effects, case / align /
  spacing / size, auto-fit, add text + typing (emoji), Delete / ⌘Z / ⇧⌘Z, shapes, emoji element; mouse drag, snapping with guide, undo of a drag,
  width handle; references via picker + drag & drop, cost on the button before spending, progress chip, vision request (image + JSON), layout
  rebuild (5 text blocks + 3 shapes, boxes / colours / pill / underline / handwriting font, owner's text kept), 2 variants via compose (prompt:
  reference, 4:5, no text, calm empty areas with positions, style), variant picker, page colours, free reuse from history, «Только фон», refusal
  message; 22 templates, dark chalkboard ↔ light text, photo background, duotone, sliders; hooks via `KS.neuro.text` + apply, presets with series
  numbering, `{num}`, next issue, all six English presets; formats (square / reel / post sizes, Reels zones, PNG 1080×1920, JPG 1080×1350),
  carousel (cover + word slides + final, add «Ошибка → правильно», word slide content, ZIP of 5 JPG 1080×1350 checked with JSZip, `{n}/{N}`,
  1:1 option), highlights (5 circles, name, icon, ZIP of 5 PNG 1080×1920), «В ленту» (cover placed into insta's feed, «открыть» → «Лента»),
  templates save / reopen / duplicate / delete / per page, ⌘K, dark theme, reload persistence (fonts re-registered from IDB, pages, templates,
  backgrounds, references), core app (Макет move + undo, print capture, Конверты and back), iPad 1180×820 (tap select, CDP touch drag, touch
  targets ≥28 px, no horizontal overflow), standalone build without key and without «Лента».
- Neighbours on the same full build (copies in `ext/`, outputs there): insta `test.js` — 98 passed, 0 failed; insta `test_addposts.js` — 18 passed,
  0 failed; instamock `test.js` — ALL OK.
- `bash ks/regress.sh app_full.html` — «no errors» ×4 (`regress_out.txt`).
- Screenshots `shots/`: 01_mac_light, 02_mac_ref (after «Как на образце»), 02a_ai_before, 03_mac_dark, 03b_idioms, 03c_dark_carousel,
  03d_dark_inspector, 04_reel_zones, 05_carousel, 06_highlights, 07_fonts_modal, 08_page_modal, 09_ipad_carousel, 10_ipad, 10b_ipad_inspector,
  10c_ipad_panel, 11_shop_page, 12_nokey, 13_no_overlap, `_tpls_en.png` / `_tpls_shop.png` (all 22 templates in both page palettes,
  rendered by the test with the panel's colour logic).

## Limitations
- Gemini quality can only be judged with a real key; tests mock the API. The rebuilt layout is Gemini's estimate of boxes / sizes / colours;
  letters are the owner's fonts by design; illustrations and textures live in the generated background (not editable), only simple decor is vector.
- Own fonts, references, generated backgrounds and template thumbnails are kept in this browser's IndexedDB (like the photo library), not inside
  the project JSON; on another device fonts must be uploaded again (the list then says «файл не найден»).
- WOFF2 coverage is measured with the browser's fallback fonts (no Brotli parser); TTF / OTF / WOFF are read from cmap.
- insta has one feed (no pages): covers of any page go into it; insta's colour harmonisation still nudges the cover's colours a little (its own
  look grade is skipped because the feed's look is passed). Highlights and posting itself are manual (download → Instagram).
- Canvas text: no hyphenation; with letter-spacing ≠ 0 glyphs are placed one by one (no kerning); emoji look depends on the device's emoji font;
  fonts without an italic face get the browser's slanted version.
- With fal.ai instead of Gemini only «Только фон» works (fal sees the first reference only); hooks fall back to built-in templates.
- One CSS rule targets the shared «Instagram» seg (`.kspanel[data-panel="ks-insta"] .ksseg`) so the five sub-tabs fit in one row; nothing outside
  `ks/mods/igcover/` was edited.
