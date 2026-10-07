# Module `photos` — «Фото» (поиск фото, Pinterest, «Мои фото»)

## What was built
Rail tab **Фото** (group `photo`, before `prep`, `app:'print'`) with two sub-tabs, both `screen:true`:

**Поиск фото** (`phsearch`)
- Side panel: search box (Enter / «Найти», clear ×), live «Ищем: …» line with RU→EN translation
  (523-entry dictionary, phrase matches first, stemming for Russian endings, stop-words dropped, words without
  translation listed; «искать как написано» toggle), 24 theme chips, source chips Все / Openverse / Wikimedia /
  Pexels / Unsplash / Pixabay (keyed ones locked with a dashed style + lock icon until a key is set; clicking a
  locked chip opens the keys box), filters: orientation (seg), 13 colours (Pexels/Unsplash/Pixabay; hint says
  which sources understand it), «Только для коммерческого использования» (Openverse `license_type=commercial`).
- «Ключи фотобанков» (details): key field, status badge (не проверен / работает / неверный ключ / лимит исчерпан …),
  «Проверить» (real 3-result query), «Получить бесплатный ключ» links (pexels.com/api, unsplash.com/developers,
  pixabay.com/api/docs). Keys stored only in `st.ks.photos.keys`.
- Pinterest card: «Найти в Pinterest» (opens pins search for the current query in a new tab — Split View on iPad),
  2-line hint, large drop zone, «Вставить ссылку на картинку» field, «Вставить из буфера» button
  (navigator.clipboard.read), one-line rights note.
- Screen: header with result summary («цветы» → flowers · N фото · sources) and print-quality legend for the
  CURRENT target (selected image frame on the layout → else product/design size → else A4).
  Justified-row grid (flex rows with aspect boxes), lazy thumbnails, source badge, dpi badge
  (≥300 отлично / 150–300 нормально / <150 только мелко), author + px on hover (always on touch), hover action
  icons (В макет, Фоном, Палитра, В мои фото), skeletons while loading, «Показать ещё» paging across all
  sources (results interleaved), per-source error banners (401/400 bad key with «Ключи» button, 429 limit,
  offline, timeout, CORS/network, HTTP), full-screen states for nothing found / all failed / offline, hero
  empty state with chips + recent queries, source credits footer.
- Photo card (modal, ←/→ navigation): large preview (loads larger version), title, author (link), license (link),
  source, size, dpi verdict for the current target, actions **В макет** (KS.addImage auto — fills an empty frame or
  a selected photo), **Заменить выбранное фото** (also replaces a selected logo), **Сделать фоном**, **Палитра из фото**
  (shows swatches), **В мои фото** + album select, **Открыть источник**. Download chain: largest variant (≤3200 px)
  via KS.fetchImage → `<img crossOrigin>`→canvas → smaller variants (thumbnail) with a «копия поменьше» warning →
  clear message + «Открыть источник» link. Low-dpi warning toast after placing.
- Unsplash API rule: on every USE (В макет / фон / палитра / в мои фото) `links.download_location&client_id=` is
  pinged once per photo; Unsplash links carry utm params.
- Inspector section «Автор фото» (KS.insp) for img elements with `credit`: author, license, source links,
  «Подпись на макет» (adds a small caption text element under the photo), «Скопировать подпись».

**Pinterest / web pictures**: drop zone + whole screen accept image files, `text/uri-list`, `text/plain` URLs and
`text/html` with `<img src/srcset>` (Pinterest drags). `i.pinimg.com/<236x|474x|736x|…>/` is rewritten to
`/originals/` with fallback to `/736x/` and then the original URL. Page-of-pin links are recognised and explained.
Blocked → «Pinterest не отдал картинку. Нажмите на неё правой кнопкой → «Скопировать изображение», потом ⌘V здесь».
⌘V anywhere on the Фото tab (not in a text field) imports an image / image URL / html. Imported pictures go to
«Мои фото» → «Разное» (or the open album) with `credit.source='Pinterest'` and open in the same action card.

**Мои фото** (`phmine`)
- Add (multi file picker), Вставить (clipboard), drop many files on panel or screen, ⌘V.
- Albums: Клиенты, Фоны, Логотипы, Документы, Разное + custom (create, rename, delete → photos go to «Разное»),
  counters; search by name; sort new/old/А–Я; select mode (button, ⌘/Ctrl/Shift-click, ⌘A, ✓ on tile) →
  «Общая палитра» (up to 6 photos, sampled with dzExtract, distinct colours merged, applied via dzSetPalette),
  move to album, delete (Delete key too) with «Вернуть» undo bar (9 s).
- Card: rename, change album, В макет / Заменить / Фоном / Палитра / Скачать файл / Открыть источник / Удалить.
- Storage card: navigator.storage.estimate meter + own size, «Не удалять мои фото» (navigator.storage.persist).
- Listens to `photosChanged` from other modules (`{id}`/`{ids}` → incremental, otherwise full reload).

**Commands / toolbar**: ⌘K «Найти фото», «Мои фото», «Палитра из фото» (selected photo, else pick a file);
toolbar button «Фото» (opens search and focuses the box).

**Public helper for other modules**: `KS.photos = {list(), get(id), add({data,name,album,credit}), translate(q),
dictSize(), open('mine'|'search')}`.

## Data stored
- `st.ks.photos` (KS.store): `keys{pexels,unsplash,pixabay}`, `kst{…}` key check status, `src`, `q`, `orient`,
  `color`, `comm`, `raw`, `recent[]` (8 queries), `albums[]` (custom album names), `album` (open album), `sort`,
  `saveAlb`, `persist`.
- IndexedDB (KS.idb): store `files`, key `ph:<id>` → `{id,name,type,data,thumb(≤360px),w,h,album,added,credit?,suid?}`
  (HOST.md convention; `suid` = `<source>:<id>` of a stock photo to avoid duplicates).
  Store `kv`, key `ph:index` → light index array (metadata + thumbs) for fast grid; self-healing against the
  `files` store (missing entries rebuilt, deleted ones dropped, missing thumbs generated).
- New element prop: `credit` on `img` elements: `{author,authorUrl,source,via,url,license,licUrl}`.

## App globals wrapped
None. Uses KS hooks only (KS.tab/tool/cmd/insp/on/modal) and calls app functions (dzExtract, dzSetPalette,
dzAdd, dzSelect, dzOn, update, prodById, KS.addImage/palette/fetchImage). Capture-phase window listeners for
paste / keydown are active only while the Фото tab is open (and never in text fields).

## Known limitations
- Pinterest has no public search API and forbids framing — search opens pinterest.com in a new tab; pictures come
  in by drag/drop, ⌘V or link. If Pinterest's CDN refuses CORS, the picture can't be read by a web page; the user
  is told to «Скопировать изображение» + ⌘V (works in Safari/Chrome).
- Stock originals are taken via CORS; when a site blocks it the module falls back to a smaller copy or explains.
- Wikimedia has no colour filter; Openverse/Wikimedia ignore colour (hint shown). Pixabay caps API images at 1280 px.
- HEIC files are accepted only where the browser can decode them (Safari).
- In the test sandbox the network is mocked; real API behaviour (rate limits etc.) follows the documented formats.

## Tests
- `cd $S && python3 ks/build13.py v24.html ks/mods/photos/app.html --mods photos`
- `node ks/mods/photos/test.js [app.html] [mac|dark|ipad|all]` — 101 checks: all 5 APIs mocked in their real
  formats (`_mock.js`, incl. 401, 400 bad key, 429, offline, wikimedia pdf/webm, image hosts with/without CORS and
  with a wrong content type, Pinterest originals 403 → 736x), translation, paging, filters, keys, card actions,
  credit + inspector, drops (html pinimg, uri-list, files), paste (file, URL), link field, library CRUD, albums,
  palette, undo, reload persistence, iPad touch; screenshots `s_*.png` (light), `d_*.png` (dark), `i_*.png` (iPad).
- Core regression: `bash ks/regress.sh $S/ks/mods/photos/app.html` → «no errors» ×4.

## QA (independent review, 2026-10-07)
Own adversarial script: `node ks/mods/photos/qa.js [app.html] [mac|phone|ipad|all]` (43 checks): typing+Enter search,
empty/garbage/HTML/very long queries, card «В макет» → credit → inspector caption (inside the card) → undo/redo (module
data untouched), print capture (photo + caption in `#printRoot`, `@page` in mm), hover «В мои фото», invalid links
(text, pin page, 404), 60-photo library (counters, name search, select all, move), new project via «Проекты»
(library + recent shared), Конверты ↔ Типография, delete-all + «Вернуть», two separate deletions + one «Вернуть»,
reload persistence, phone 390×844, iPad dark touch-target audit (every visible button ≥ 34 px).

Issues found and fixed:
- Openverse requested `page_size=30`; anonymous Openverse allows ≤ 20 per page and the first 240 results only
  (larger requests are refused with 401) → page_size 20, paging stops at 240.
- A failure on page 2+ (e.g. the Openverse 240 cap) showed «ключ не подошёл» for a source without keys → later-page
  errors just end that source's paging; auth errors of keyless sources say «отказал в доступе», no «Ключи» button.
- Wikimedia search now adds `filetype:bitmap` (no PDFs/videos/SVG eating the 30 slots); very large originals are
  taken through the 3840 px standard thumbnail instead of a multi-MB original.
- After deleting/moving selected photos the select mode stayed on, so the next tap selected instead of opening the
  card → select mode ends after delete/move.
- Two deletions in a row: the first one could no longer be undone → deletions are accumulated in one «Вернуть».
- Batch import rewrote the whole thumbnail index after every file → index saved once per batch.
- Storage meter was not refreshed after `KS.photos.add` (other modules) → debounced refresh.
- Every opaque PNG was shown on a checkerboard with «contain» padding → checkerboard only when the picture really
  has transparency (PNG thumb is produced only for transparent pictures).
- Success messages appeared three times (panel + banner + toast) → one place: screen banner (toast when no screen).
- Card: preview area was translucent (blurred UI showed through, PNG checker on glass) → opaque backdrop; nav
  arrows got a ring (invisible on dark checker); saved stock photo now shows «Уже в «Мои фото» → «альбом»» (opens the
  library) instead of a second «В мои фото».
- iPad: sub-tab segment (29 px), screen header «Выбрать/Добавить» (28 px), clear × (32 px), «искать как написано»
  link (17 px), modal close, selects → all ≥ 34 px; tile check circles no longer clutter every tile on touch
  (visible only in select mode).
- Dark theme: side-panel hints were barely readable on the glass panel → higher-contrast hint colour.
- Search placeholder was clipped → «Например: цветы, свадьба».
- test.js: hover check waited a fixed 400 ms (flaky) → waits for the state; selection flow updated for the new
  select-mode behaviour.

Results: test.js 103/103, qa.js 43/43, zero page/console errors; core regression «no errors» ×4.

Remaining / honest limits:
- Real APIs were never reachable from the sandbox; formats follow the docs (Openverse anonymous limits from its docs).
  Real-world rate limits/CORS of individual image hosts may still force the «копия поменьше»/«Открыть источник» path.
- At phone width (390 px) the base app itself lays out wider than the screen (layout viewport ≈ 950 px); the module
  follows the app — it is designed for Mac and iPad.
- Wikimedia thumbnails use `iiurlwidth=480` as specified; Wikimedia prefers standard widths and may round it.
