# insta — «Instagram» (Лента · Стиль · Подписи)

The owner's Instagram studio: one click plans and produces 9 posts (a full 3×3 grid) in one consistent, natural-looking
style with HIS real products, previews them as a real Instagram profile, writes captions and exports a ZIP.

Build (full production): `cd $S && python3 ks/build13.py v24b.html <out.html> --mods photos,passport,pos,stats,home,stamps,postcard,nav,neuro,logo,ux,pcai,pcbatch,pcmock,pcseries,notebook,nbcover,nbextra,nbshop,vpdf,envth,instamock,insta`
(leave out `instamock` while it does not exist). Sources: `p1_core.js … p8_import.js` → `./make.sh` concatenates them into `mod.js` (+ syntax check). CSS: `mod.css` (prefix `ig-`).
Tests: `node ks/mods/insta/test.js [app.html]` (mocked Gemini; screenshots in `shots/`), neuro tests: `node ks/mods/insta/neuro_tests/<t_neuro|t_ref|t_fal|t_fit|t_neuro_new>.js <app.html>`
(copies of `ks/t_*.js` that take the app path from argv — the originals hard-code v34/v39). Regression: `bash ks/regress.sh <app>`.

## Rail and tabs
One rail button «Instagram» (group `insta`, `app:'print'`, `before:'prep'` → right after «Блокноты»). Sub-tabs (all `screen:true`):
`igfeed` «Лента» (default), `igstyle` «Стиль», `igcap` «Подписи». instamock adds «Мокапы» to the same group; whoever registers
first, a MutationObserver on the panel keeps «Лента · Стиль · Подписи» first, and `st.ui.ksSub.insta` defaults to `igfeed`.

## Лента (panel)
- **Ключ API**: status badge, provider + model (`KS.neuro.modelName()`), spend line (`KS.neuro.spendLine()`), note that Gemini gives
  the best result (exact product, style anchor, style analysis); fal.ai warning when fal is the provider; button → `KS.neuro.settings()`.
  Refreshes on `neuroKey`.
- **Исходники**: drop zone (click = multi-select file picker, drag & drop anywhere on the section), «Из «Мои фото»» (`KS.photos.list/get`,
  multi-select), «Из программы» (`KS.instaMock.sources()`), «Узнать изделия» (one `KS.neuro.vision` call classifies all photos).
  Each source: thumbnail, kind select (auto-guessed from the file name / cut-out proportions, editable), on/off, delete.
- **Создать ленту**: mode «С ИИ» / «Без ИИ · бесплатно», format 4:5 (1080×1350) / 1:1, current look (→ «Стиль»), the big button
  («Создать 9 постов» / «Создать оставшиеся (n)» / «Повторить ошибки (n)»), cost line `n × price ≈ total`, «Остановить» while running.
- **Набор**: name, «Скачать все (ZIP)», «Новая лента», history (3×3 thumbnails, open, delete).

## Лента (screen)
- Header: «Профиль | План», «Телефон» (device frame), «Поменять местами» (tap two posts — the iPad way), «Скачать все». Progress bar
  with spend and «Стоп» during generation; 3-step onboarding strip while nothing is made yet.
- **Profile preview**: handle bar, avatar (TH monogram via `KS.thSVG` with the story ring; or the hero post when «Без логотипа»),
  posts/followers/following, name, category, bio, link, buttons, 5 highlights (crops of the posts), tabs, the 3×3 grid in Instagram's
  3:4 profile crop + the owner's older posts below + «Старые посты» tile. Light/dark like Instagram. Day badges (posting day) optional.
  Tiles show live states: queued, drawing (shimmer + seconds), error (short Russian reason + «Повторить»), lock.
  Mouse drag swaps posts (desktop); tap opens the post window.
- **Гармония ленты**: score ring + Цвет / Свет / Ритм bars, colour map (mean colour of each frame), tips (frame warmer/colder,
  darker/lighter, dark frames side by side, heavy row, missing frames), «Выровнять цвет» (stronger harmonisation, +0.12),
  «Расставить для баланса» (hill-climbing over swaps of unlocked frames for light/dark + busy/calm alternation).
- **План** (storyboard): 9 cards in grid order: shot type select, product chooser (up to 3 for «Коллекция»), editable Russian
  description, lock, tags «насыщенный/спокойный · светлый/тёмный», «Перемешать», «Создать n · ≈ $».
- **Post window** (`#ksm-igpost`): big frame (drag to pan, zoom slider, 4:5 / 1:1 per post), «Ещё раз · ≈ $», «Своё фото»
  (graded into the look), lock, JPG, brightness / warmth / style strength, caption + hashtags + alt text, copy, move earlier/later in
  the grid, ←/→ navigation (keyboard too).

## Planning (pro content designer)
12 shot types: flat lay, 45°, macro detail, hands, lifestyle, gift, process, collection, negative space, stack/fan, light & shadows,
ready-to-send. Base 9 = flat, angle, macro, hands, life, gift, process, group, space («Коллекция» → «Стопка» with one product);
«Перемешать» swaps 1–2 for extras (keeps life or hands). Arrangement = random search (1600 tries) minimising: busy frames on corners +
centre and calm ones on edges (checkerboard), no equal neighbours, no two dark neighbours, hero (collection/flat/lifestyle) in the
centre, negative space on an edge. Products: affinity table shot×kind, balanced use (cap ⌈9/n⌉), no same product side by side, every
product at least once, collection gets up to 3. Locked / made frames stay. Manual edits are kept when sources change (only frames
with missing products are re-planned).

## Generation
- Confirmation window with the 3×3 plan (shot, product, description) and the cost before every AI batch (single «Ещё раз» shows the
  price on the button instead).
- Per frame `KS.neuro.compose([product photo(s)…, anchor?], prompt, {aspect})`. Prompt = studio context + EXACT product (same
  design/text/colours/proportions, no invented text, real sizes) + shot + the look's scene card (surfaces, props, light, palette,
  mood, lens) + the owner's note + photographic realism (real camera, contact shadows, paper fibres, imperfections, not CGI/plastic/
  AI look) + natural colours (the grade comes later) + no added text/logos/watermarks/faces + format and «keep subject in the central
  3:4». The hero frame (centre first) is made alone; the first good frame becomes IMAGE n+1 «same photo shoot» style anchor for the
  rest (2–3 parallel, `st.ks.insta.conc`, default 3). Custom styles send their first example photo as a mood reference to the first
  frame. fal.ai: only the first product image, no anchor.
- Errors per tile in Russian (from neuro). Key/billing/quota/network errors stop the batch (frames not started go back to the plan,
  button «Создать оставшиеся»); safety refusals / empty answers mark only that frame («Повторить»).
- After the batch: unified local grade of all frames, harmony, history thumbnail, save.
- «Без ИИ»: `KS.instaMock.render(sources, sceneId, {aspect, look, grade:false, seed})` with a shot→scene map (env-seal, seal-macro,
  kit-box, pc-lean …, filtered by the product kind); without instamock a simple built-in mockup (product on the look's surface).

## Unified grade (harmony)
crop (pan/zoom) → **harmonise** (YCbCr: pull every frame's white balance to the set mean mixed with the look palette, contrast towards
the mean, brightness differences softened but kept for rhythm; strength `st.ks.insta.harm`, 0.75) → owner's tweaks (exposure, warmth)
→ **look grade**: `KS.instaMock.grade(img, look)` when available (instamock looks by id, custom looks converted to its units),
otherwise own LUT (temperature, tint, S-curve contrast, lift, fade, curve preset) + saturation + vignette + grain → mix by «Сила стиля»
→ optional TH mark in the corner → JPEG 1080 px, q .92.
Looks: `KS.instaMock.looks()` (object or array, sync or promise) merged with the fallback copy `LOOKS0` (same 9 ids) — prompts use
descriptive English text, instamock's grade numbers are converted (`gFromB` / `gToB`).

## Стиль
Panel: the 9 shared looks (5-colour swatch, name, description), «Мой стиль по образцу» (1–6 photos → `KS.neuro.vision` JSON style
card: name, palette ×6, surfaces, props, light, angles, mood, lens, Russian scene words, grade numbers; or «Только цвета, без ИИ»:
palette from `dzExtract` + grade numbers from the photos' statistics + text of the nearest built-in look), «Мои стили», brand
(name, handle, category, bio, link, followers, following, TH logo: on avatar / also on posts / none, caption language).
Screen: moodboard — big palette with hex, 3×3 sample (the set's frames harmonised + graded with this look, or procedural envelopes),
scene facts, grade bars; for a draft/custom style everything is editable (colour pickers, textareas, sliders) → «Сохранить стиль».
Changing the look regrades made frames.

## Подписи
Language RU / HY / EN, voice (тёплый / лаконичный / игривый), emojis, CTA, local and niche hashtags, own hashtags.
«Написать подписи (Gemini)»: one `KS.neuro.text(…,{json:true})` call for all 9 posts in posting order → caption, hashtags, alt text +
3 carousel ideas. Without Gemini / on error: templates per shot type (RU, EN, HY) and tag sets filtered by script.
Plan: start date + time; day d = grid position 9−d (bottom-right first). Screen: 9 rows by day (thumb, date, editable caption,
hashtags, alt, copy, counters 2200 chars / 30 tags), carousel ideas.
Export: ZIP (jszip 3.10.1 via `loadLib`, as the app does): `01_YYYY-MM-DD_<shot>.jpg … 09_…` in posting order (1080×1350 or ×1080),
`00_setka-prevyu.jpg` (grid preview), `captions.txt` (UTF-8 BOM; days, dates, file names, captions, hashtags, alt text, carousels).
No jszip → files one by one. Also captions.txt alone, «Скопировать всё», single JPG from the post window.

## Data
- `KS.store('insta')` (`st.ks.insta`): `{look, aspect, mode, conc, harm, cur, phone, order, view, brand{name,handle,cat,bio,link,
  followers,following,logo}, cap{lang,voice,emoji,cta,local,niche,extra,start,time}, my:[custom looks], hist:[{id,name,created,
  updated,look,n}]}` — small only.
- IndexedDB store `files`: `ig:srcs` (source index with 360 px thumbs), `ig:src:<id>` `{src}` (≤2000 px), `ig:set:<id>` (set meta:
  tiles {id,shot,src[],desc,auto,status,locked,crop{x,y,z},adj{exp,warm,str},ax?,cap{text,tags,alt,lang,ai},err,own,free}, carousel,
  look, aspect, seed, edited), `ig:img:<set>:<tile>:raw` (AI/mockup/own photo ≤1600 px) and `:img` (final 1080 JPEG),
  `ig:thumb:<set>`, `ig:old` (older posts ≤720 px), `ig:ref:<style>:<i>` (style examples).
- The API key is never stored by this module (only neuro, on the device).

## neuro additions (generic, existing behaviour unchanged)
`KS.neuro.compose(images[], prompt, {aspect,size})` → dataURL (Gemini: all images in one request labelled «IMAGE k:»,
imageConfig with the 400 fallback, safety/blocked → Russian message, spend counted; fal.ai: single-image edit of the first picture
with `aspect_ratio`), `KS.neuro.vision(images[], prompt, {json,model,max})` → text (gemini-2.5-flash; clear message without a Gemini
key), `KS.neuro.model()`, `KS.neuro.modelName()`, `KS.neuro.hasGemini()`. Backup of the original: `neuro_mod.js.orig`.

## API
`KS.insta = {open(sub), ensure, generate(ids,{confirm}), exportZip, looks, state, plan(seed,keep), harmony, captions(ai), prompt}`.
⌘K: «Instagram: …» лента, создать 9 постов, план 3×3, добавить фото изделий, стиль, мой стиль по образцу, подписи, скачать ZIP, новая лента.

## Integration with instamock (agent B)
B's sub-tab `igmock` «Мокапы» joins the group; the seg is reordered to «Лента · Стиль · Подписи · Мокапы». My event handlers only
react inside my three screens / panels (`MYZ`, `activeId()`), so B's panel and drops are untouched. Used: `looks()` (object by id),
`sources()`, `scenes()` + `render(srcs[], sceneId, {aspect, look:id, grade:false, seed})`, `grade(img, lookId | {grade in B units})`.

## Mockups from «Мокапы» → «Лента» (`KS.insta.addPosts(items, o)`)
items = instamock's `{id, src: JPEG dataURL, name, look, scene, w, h, from:'instamock', added}`.
- Enough empty, unlocked frames → they are filled in grid order. A complete set of 9 when the grid already has posts (or
  `o.mode:'new'`) → a new set (the current one stays in history, nothing is overwritten). Otherwise a window «Куда поставить N
  мокапов?» (`#ksm-igplace`): pick the frames to replace (pre-selected: empty ones, then unlocked made ones; capped at N), «Новая лента
  из этих фото» or cancel. `o.mode:'replace', o.ids` skips the window.
- Placed frames: raw ≤1600 px, `free`, `from:'instamock'`, shot type from the scene (env-seal → flat …) when it is not used yet,
  description «Мокап «…»», style strength 0 if the mockup already has the set's look (no double grade), then the usual harmonise +
  grade of the whole set, thumbnail, save. If the set had no posts and all mockups share a look, that look becomes the feed's look.
- While a batch is running the items are queued in `igm:feed:*`. Items saved by instamock while «Лента» was absent
  (`KS.instaMock.pending()`) are picked up when «Лента» opens (and on `igmPosts`); their keys are deleted afterwards.
- Returns `{added, set, tiles, newSet}` (or `{added:0, cancelled|queued}`). Test: `test_addposts.js <app_full.html>`.

## Test results (2026-10-12)
- `test.js` — 98 checks, 0 failed, no page errors — on `app.html` (without instamock: own grade + built-in mockups) and on
  `app_full.html` (with instamock: its grade, looks and scenes). Output: `test_out.txt`; screenshots: `shots/` (1440×900 light/dark,
  iPad 1180×820 touch, post window, plan, style, captions, phone frame, confirm).
  Covers: tab order/default, key card, upload (file chooser + drag & drop), kinds (guess, edit, Gemini vision), style looks,
  «Мой стиль по образцу» (vision → draft → edit → save with refs), brand, plan (9 distinct shots, hero centre, edit/lock/shuffle,
  product choice), confirm with cost, generation of 9 with 1 safety failure (2–3 parallel, first frame anchor, prompt rules,
  4:5), unified grade (colour spread 30.6 → 8.6), harmony, retry, mouse drag + swap mode + balance, post window (brightness, zoom,
  crop drag, 1:1, caption, JPG, navigation, regenerate), captions (Gemini JSON, posting order, dates, EN/HY templates), ZIP
  (9 JPG 1080×1350 in posting order + captions.txt + preview, contents inspected with JSZip), history (new/reopen), reload
  persistence, quota stop, free mode, ⌘K, core app (Макет move/undo, print capture, Конверты and back), iPad taps.
- neuro tests (copies taking argv): t_neuro, t_ref, t_fal, t_fit — output identical to the baseline v43; t_neuro_new — 10/10.
- `test_addposts.js` on the full build — 18/18 (real «В ленту» button in «Мокапы», fill empties, replace chosen frames, new set,
  automatic new set for 9, history, pending pick-up). instamock's own `test.js` on the same build — ALL OK.
- `bash ks/regress.sh app_full.html` — «no errors» ×4.

## Limitations
- Real Gemini quality can only be judged with a real key; tests use a mocked API (solid/gradient PNGs).
- The style anchor is the first good frame of the batch; very different products can still pull the AI to slightly different scenes —
  the local grade then evens out colour and light, «Ещё раз» per frame fixes the rest.
- fal.ai sees one product photo and no style reference (said in the key card).
- Video/Reels, scheduling to Instagram itself and text overlays on posts are not done (export + manual posting by the plan).
