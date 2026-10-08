# Module `home` — «Главная»

Start screen of «Типография». Rail button «Главная» (house icon), group `home`, `before:'shop'`, `screen:true`, `app:'print'`.

## What was built
- **Big screen (dashboard)**
  - Hero: date, greeting by time of day (утро/день/вечер/ночь) + `st.shop.name` (or «Типография»), a search button (focuses the
    side search, shows the `/` hint) and KPI cards: «К выдаче сегодня» (active orders due today, «готово N из M»),
    «Просрочено», «Оплачено сегодня», «Мало на складе» (only when `st.ks.stock` exists). KPI cards are buttons
    (→ Сводка/Сроки if `stats` is present, otherwise Заказы; paid → Касса/Смена if `pos` is present).
  - «Оплачено сегодня» = `order.paid` of orders dated today + POS `sale` totals today (minus the «в долг» part, including split
    payments) − POS `refund`s today. POS `type:'order'` payments and `in`/`out` cash moves are not added (they are already in
    `order.paid`) — same rule as the `stats` module, no double counting.
  - Quick actions (tiles with gradient icon chips, 4/3/2 columns by screen width via container queries, last tile stretches so the
    grid never ends with a hole): Продолжить макет (live thumbnail of the current design via `dzHTML`, → Макет), Новый заказ
    (`#ordNew` flow), Визитки `bc90`, Листовка `fA5`, Наклейки `stR40`, Приглашение `inv210` (→ `applyProduct` + Шаблоны),
    Фото на документы (`KS.show('salon','passport')` when the passport module exists, else product `phD35`), Печать фото
    (`ph10`; Фотосалон sub-tab «Печать фото» if a `photoprint` module exists), Касса (only with `pos`), Найти фото
    (only with `photos`), Все шаблоны, Проверить и напечатать (Печать tab + `runPreflight(true)` + highlight).
  - «Сегодня и ближайшие сроки»: active orders that are overdue / due today / due tomorrow (done and cancelled hidden),
    with number, client, product, status chip, due label and debt; tap → Заказы with that order expanded and flashed
    (filter/search of the orders list are relaxed if they would hide it). Empty state with «+ Новый заказ».
  - «Последние проекты» (`proj.list`, newest first, thumbnails loaded lazily from the app's project IndexedDB, current one marked;
    tap → `switchProj`) and «Последние шаблоны» (thumbnails; tap → applies the template with a matching product and opens Макет).
  - «Знаете ли вы?» carousel: 11 base tips + up to 6 module tips (Магия, Фото, Фото на документы, Касса, Склад,
    Сводка — only when those modules exist), capped at 15, arrows, dots, swipe on touch, «Показать» opens the feature. Starts at a tip that changes daily.
- **Side panel**: «Поиск по всему» + «Сегодня» summary (срок сегодня, просрочено, в работе, готовы, оплачено сегодня, долг клиентов,
  мало на складе; each row clickable) + setting «Открывать Главную при запуске».
- **Search**: templates (`st.myTpl` + `DZT` by name, tags, kind), products, orders (№, client, product, note, phone digits),
  clients (name, contact, phone), projects, commands (`allCmds()`, incl. other modules' KS commands). Grouped results with
  counts of hidden extras, match highlighting, ё/е-insensitive, ↑/↓ + Enter, Esc clears, ✕ button. `/` focuses it when Главная
  is open (ignored while typing in inputs or when a dialog is open). ⌘K command «Поиск по всему (Главная)».
- **Boot**: on `boot`, when the app is in «Типография» and the setting is on, `KS.show('home')` (no focus stealing; later renders
  never switch tabs; the tour still runs on top). Switching to «Конверты» and back does not force Главная.

## Data stored
- `st.ks.home` (`KS.store('home')`): `{boot:true, recent:[{id, kind, ts}]}` — up to 16 recently applied templates.
- No IndexedDB keys of its own (reads the app's `idb` store `projects` for project thumbnails, read-only).
- No new element properties.

## App globals wrapped
- `dzApplyTpl` (records the template in `recent`, always calls the original).
- Reads (defensively): `st.orders`, `st.clients`, `st.shop`, `st.myTpl`, `st.ks.pos.sales`, `st.ks.stock`, `proj`, `DZT`, `PRODUCTS`,
  `ORD_ST`, `DZ_KINDS`. Uses `ordOpen`/`cliOpen`/`renderOrders` to open an order/client.

## Known limitations
- Low-stock count reads `st.ks.stock` heuristically (`lowCount`, or arrays `items|mats|materials|list|inks` with
  `qty|q|left|level` vs `min|low|minQty|warn`) — the stock module isn't written yet; adjust when it is.
- «Оплачено сегодня» attributes `order.paid` to the order date (as the spec says), not to the actual payment date.
- At 820 px and phone widths the base app's header is wider than the viewport (base-app behaviour, also without this module);
  the Главная screen itself has no horizontal overflow.
- Project thumbnails exist only for projects whose design is in «Типография» mode.

## Tests
```
cd $S && python3 ks/build13.py v24.html ks/mods/home/app.html --mods home
python3 ks/build13.py v24.html ks/mods/home/app_all.html --mods passport,photos,pos,stats,home
node ks/mods/home/test.js          # 75 checks, Mac mouse + iPad touch, ≈1.5 min
bash ks/regress.sh $S/ks/mods/home/app.html   # 4× "no errors"
```
Covers: boot on/off across reload, rail order, KPIs from seeded orders + POS + stock (exact numbers), due list order and escaping,
every tile (activeTab / st.prod / sub-tab), module tiles with passport/photos/pos/stats built in, order/client opening,
recent templates, search (template, order №, phone, client, command with arrow keys, products, empty), tips (next/prev/dots/swipe/«Показать»),
touch targets ≥ 34 px, no horizontal overflow, Макет move, print capture, mode switch, zero page errors.
Screenshots: `s_light.png`, `s_light_bottom.png`, `s_dark.png`, `s_dark_bottom.png`, `s_search_dark.png`, `s_empty.png`,
`s_ipad.png`, `s_ipad_dark.png`, `s_portrait.png`, `s_phone.png`.
