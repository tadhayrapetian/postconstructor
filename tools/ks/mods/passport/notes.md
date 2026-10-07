# Модуль `passport` — «Фото на документы»

Rail button «Фотосалон» (group `salon`, camera icon, before `prep`), sub-tab «Документы». It opens a big work screen (`screen:true`) with the cropper and a side panel.

## What was built
- **Loading a photo**: file picker, a «Снять» button (camera, `capture=environment`, shown only on touch devices), drag-and-drop onto the screen, paste with ⌘V, and «Мои фото», which opens the photos-module library from IndexedDB `files` / `ph:*` and can filter by album. HEIC that the browser cannot decode gets a clear message.
- **15 presets** in groups: Паспорт РА / ID РА, Паспорт РФ, Загранпаспорт РФ, Шенген, США/DV (2×2″, eye band 28–35 mm from the bottom), Великобритания, Канада 50×70, Китай 33×48 (head width, ≥7 mm below the chin), Индия, 3×4, 3×4 с уголком, 4×6, 9×12, 10×15 and «Свой размер» (size, head range and top margin all editable). The spec line appears in the screen header and as a spec card in the panel, with the preset's note.
- **Cropper** (CSS transform only; no re-render while panning):
  - drag to pan, wheel or trackpad pinch to zoom at the pointer, two-finger touch pinch and pan, Safari `gesture*` events
  - rotation slider ±15°, which rotates around the head
  - arrow keys nudge 0.1 mm (Shift = 1 mm); `+`/`−` zoom, `0` fits again
  - guides: face oval, crown band, eye band, chin band, centre line, head-width lines (China), corner circle (уголок)
  - zoom % and buttons for «заполнить кадр», hide guides, and hold for before/after
- **Two-tap fit**: «Макушка и подбородок», then tap the crown, then the chin. It scales and positions to the preset's ideal head height and top margin and centres the head. The handles can be dragged afterwards and the fit is redone. Chips show green/red checks (head height, top margin, below-chin, centring, frame filled), and a dimension line shows the head height in mm.
- **Correction**: brightness, contrast, cold ↔ warm, «Авто» (percentile levels plus white balance from a neutral top border), Ч/Б and reset. This is LUT based and runs on a ≤2000 px proxy for the preview.
- **«Осветлить фон»** to white, light grey or light blue. It region-grows from the top, left and right borders, using segment medians as references, a colour-distance tolerance, a step limit and a Sobel edge stop. It dilates by 1 px and then feathers. An ellipse around the marked head is always protected. Sliders: «Допуск» and «Мягкость края».
- **Sheet**: 10×15 (102×152), 13×18, A4, or «Один» (one exact-size page).
  - photo count stepper and «Весь лист»; gap 0–6 mm; cut marks (outer ticks and gutter marks); the layout is centred and may rotate photos 90° if that fits more
  - stays inside the current printer's printable area (`PRINTERS[..].m/mp`). G3410 can print borderless on 10×15, 13×18 and A4 (toggle «Без полей»); GX4040 always keeps its margins
  - a «Кадр / Лист» toggle switches to a live sheet preview, with the printable area drawn dashed
- **Print**: `KS.print([KS.page(w,h,…)])` at the exact page size with photos at exact mm; the hint «Печатайте на фотобумаге, масштаб 100%» is shown. The app's own «Печать» button / ⌘P also prints the photo sheet while this tab is open (wraps `printNow`).
- **Export**: a JPEG of one photo at 600 dpi (35×45 → 827×1063 px, JFIF density set to 600), a JPEG of the sheet at 300 dpi, and «В мои фото» (album «Документы», with a ≤360 px thumbnail) plus `KS.emit('photosChanged')`.
- **Order**: price per set (`KS.store('passport').price`, default 1500), number of sets, client and phone. «Добавить в заказ» calls `newOrder({product:'Фото на документы · <preset> · N шт', qty, price, paper, note})` and shows a confirmation with an «Открыть» link. «В кассу» appears only when `KS.mods.pos` exists and emits `posAdd {name,price,qty}`.
- The last preset and all settings are remembered. The current job (photo, position, marks, corrections) is kept across tab switches and reloads. It is not part of undo.

## Data stored
- `st.ks.passport` (`KS.store('passport')`): `preset, custom{w,h,h0,h1,t0,t1}, bgMode('off'|'white'|'grey'|'blue'), tol, feather, bw, sheet('10x15'|'13x18'|'A4'|'single'), count(0 = whole sheet), gap, cut, bl, corner('off'|'br'|'bl'|'tr'|'tl'), price, sets, guides`.
- IndexedDB `kv`, key `passport:job`: `{src(dataURL ≤3600 px), name, iw, ih, cx, cy, s, r, marks{crown,chin}(image px), adj{b,c,t,auto}, pre, ts}`.
- IndexedDB `files`, key `ph:<id>` (photos convention), written by «В мои фото».
- No new design-element properties.

## App globals wrapped
- `printNow`: when the passport screen is visible and it is not a test print, it prints the photo sheet; otherwise it calls the original.
- Adds and removes the `html.pp-on` class, which hides the layout `.dzhint` that would otherwise peek out beside the screen.
- Window `keydown` and `paste` listeners run in the capture phase, but only while this screen is visible and no input or modal has focus.

## Events
Emits `passportPhoto`, `passportFit`, `passportPreset`, `passportOrder`, `posAdd`, `photosChanged`.

## Known limitations
- The background is detected by region growing, not AI segmentation. Busy or low-contrast backgrounds (grey hair on grey) may need a lower «Допуск». The marked head is always protected.
- HEIC opens only where the browser decodes it (Safari does; Chrome does not).
- The camera button uses the system camera/file sheet (`capture`); there is no live in-page camera view.
- Preset head and margin norms follow ICAO and published consular rules as best known. Check them against the latest official requirements before relying on them for unusual documents.
- In the headless sandbox, Chromium software rendering runs at about 120–160 ms per frame even when the app is idle. Smoothness was designed for (transform-only updates, one rAF per frame) but could not be measured here.
- The downloaded filename shows as «download» under Playwright on `file://` because of the app's `saveFile`. It is correct in a real browser.

## Tests
```
cd $S && python3 ks/build13.py v24.html ks/mods/passport/app.html --mods passport
node ks/mods/passport/test.js          # Mac + iPad, ~65 assertions, screenshots t_*.png
bash ks/regress.sh $S/ks/mods/passport/app.html
```
The test covers:
- picker, drag-drop, paste and library loading
- presets and the spec line
- two-tap fit (US 31/5 mm, AM 34/4 mm), refit on preset change and handle drag
- mouse pan, wheel zoom, arrow nudge 0.1 mm, rotation, iPad touch two-tap, CDP two-finger pinch and touch pan
- brightness, warmth, auto and B/W pixel checks
- whitening: border brightens 164→255 while the face centre is unchanged
- layout: 6 photos on 10×15, all inside the GX4040 area, 4-up centred, print capture with 4 photos at exact mm positions and an @page of 102×152 mm; the header «Печать» path; G3410 borderless A4; 13×18 and single page
- exports: 827×1063 px at 600 dpi and a 1205×1795 px sheet
- «В мои фото», order creation, `posAdd`
- the job surviving tab switches and a reload, settings remembered
- touch targets, and no page errors

## QA (independent review)
Run: `node ks/mods/passport/qa.js [mac|ipad|phone|all]`. It is adversarial and goes through the real UI. Screenshots are saved as `q_*.png`.

It covers:
- invalid inputs: a text file, a corrupt JPEG, and a 6000×8000 photo (capped to 3600 px, about 0.5 s)
- all 15 presets picked through the real `<select>`, each refit with every check green
- «Свой размер» with junk input (empty, 0, negative, 999), which stays finite and keeps focus
- sliders, «Авто», Ч/Б, reset, whitening, rotation and arrow-key nudges
- sheet controls (A4 inside the GX4040 area, stepper, gap)
- print capture: N photos at exactly 35×45 mm at the layout positions, `@page` 102×152
- ⌘P printing with and without a photo
- exports at 827×1063 and 1205×1795
- the library modal: album filter, non-`ph:` keys ignored, Esc closes it
- an order with an HTML-ish client name
- undo (module settings and job are kept), Макет select/move/undo
- business-card print after the module (it prints the design, not the photos)
- Конверты ↔ Типография, «Новый проект» (settings shared, job kept), dark theme, Esc to cancel marking, and a reload restoring the job
- the same flow on iPad 1180×820 touch and at 390×844
Result: zero page or console errors.

Fixed in this pass:
- The sheet caption read «10×15 мм» (wrong unit). It now reads «Лист 10×15 (102×152 мм)».
- The printer margin text showed only the max margin. It now shows the real range, e.g. «поля 3–5 мм» for GX4040 photo sizes.
- The printer/paper text and the layout did not refresh when the printer was changed with the tab open. It now refreshes on `update` when `KS.printer().id` or the paper changes.
- iPad touch targets were 30 px: `.btn.sm`, icon buttons, steppers, the checkbox rows, Кадр/Лист and the sheet/background segments. They are now ≥36 px on `(pointer:coarse)`.
- The marking tip pill wrapped into two lines because of absolute `left:50%` shrink-to-fit. It now uses `width:max-content`.
- The correction sliders looked active in the empty state. They are now disabled and dimmed until a photo is loaded.
- Library tiles: the image is now `object-fit:cover` and clipped to the rounded tile.
- Slider labels had low contrast in the dark theme. They are now raised to ink 84 %.
- Added: client autocomplete from `st.clients` (datalist) that fills the phone for a known client; the phone field is `type=tel`.

Remaining / not module issues:
- At phone width (390 px) the base app itself is about 1000 px wide (header and rail are not responsive), so the page scrolls sideways. The module's own blocks stay inside their containers.
- The known limitations above still apply: classical region-growing background, no live camera viewfinder, HEIC only where the browser decodes it, 60 fps not measurable headless.
- The library loads full records via `KS.idb.all('files')`. That is fine for typical sizes, but it may be slow with hundreds of multi-MB photos.
