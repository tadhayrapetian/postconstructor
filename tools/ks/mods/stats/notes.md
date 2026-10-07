# Module `stats` — «Сводка»

Rail button «Сводка» (group `svodka`, chart icon, before `orders`, Типография only), three sub-tabs, all `screen:true`:

## Обзор (`ov`)
- Period chips: Сегодня / Неделя / Месяц / Квартал / Год / Всё время / Свой период (two date inputs). Every period
  except «Всё время» is compared with the previous period of the same length (month-to-date vs the same days of last
  month, etc.): ▲/▼ % plus «было N» in each KPI.
- KPIs for the period: Выручка (hero, with a sparkline and a split «заказы · касса»), Заказов (+ number of POS checks),
  Средний чек, Прибыль (+ cost, margin, «N из M» when only some orders have `cost`; «—» when none).
- KPIs right now: В работе (new+work), Готово к выдаче (+ money to collect), Просрочено (+ oldest due),
  Долги клиентов (sum price−paid of every not-cancelled order, incl. already issued). These KPI tiles are buttons
  that open the board with the matching filter.
- Revenue rule (shown in one hint line): `order.paid` of orders dated in the period + POS `sale` totals − POS `refund`;
  POS `type:'order'` payments are never added again (they are already inside `order.paid`); a POS sale paid «в долг»
  (`pay:'debt'` or a debt part of a split payment) is not money received; `in`/`out` cash moves are ignored.
- Hand-made SVG charts (theme tokens `--sv-s1…`, crisp 1px grid, hover tooltips on Mac, tap-to-pin tooltips on iPad):
  revenue by day (30 / 90 days) or by month (12 мес), stacked orders + POS, bars outside the period dimmed, peak label,
  «Таблица» toggle shows the same data as a table; products top 8 + «Прочее» (by sum or by count); payment methods donut
  (only when POS data exists); load by weekday (orders + POS checks). Tables: top clients (click → board filtered by
  client) and top products.
- Exports for the period: CSV of orders, CSV of POS operations (UTF-8 BOM, `;`, Excel-friendly), and one Excel workbook
  (`loadXLSX()` → xlsx 0.18.5) with sheets Сводка, Заказы, Продажи, По дням, Изделия, Клиенты. If the library cannot be
  loaded (offline) a toast suggests CSV.

## Доска (`board`)
- Columns Новый / В работе / Готов / Выдан (+ «Отменён», collapsed into a thin vertical strip; click to expand).
  «Выдан» shows the last 30 / 90 days / all (segmented control). Long columns paginate by 40 («Показать ещё»).
- Card: №, due chip (red «5 окт · −2 дн» when overdue, orange «сегодня»/«завтра»), client, product × qty, note snippet,
  money badge (оплачен / долг N ֏), price, actions: Позвонить (`tel:`), Написать (menu: WhatsApp `wa.me/<digits>?text=…`,
  Telegram — text copied to clipboard + `t.me/+<digits>`, SMS, copy text), next-status button (В работу › / Готов › / Выдан ›).
  Message text uses shop name/phone/address: «Здравствуйте! Ваш заказ №… (…) готов. К оплате: … Можно забирать…».
  Phone normalisation for wa.me: Armenian `0XX…` → `374…`, 8-digit local → `374…`, Russian `8…` → `7…`, `+…` kept.
- Drag & drop with pointer events: mouse starts after 5 px; touch/pen starts after a 300 ms long press (a quick swipe
  still scrolls the board), ghost card, drop highlight, horizontal and vertical auto-scroll near edges, Esc cancels.
  Drop → `status` updated, `update()` (saved), snackbar «№ … → Готов» with «Отменить» (and «Написать клиенту» when
  moved to Готов). Renders are deferred while a drag is in progress.
- Card click/tap (or Enter) opens the order in the existing Заказы editor (`ordOpen=id; goTab('orders')`, switches the
  orders filter to «все» if the order would be hidden, scrolls to it and flashes it).
- Filters (side panel): search (№, client, phone, product, note), client select, only overdue, only unpaid, show
  cancelled; active filters also appear as removable chips above the board.

## Сроки (`due`)
- Month calendar (Mon-first) with per-day count, up to 3 order chips and status-coloured dots (red = overdue); click a
  day → list on the right (tap an item → order editor; «+» creates an order with that due date); an «Просрочено» list.
- «Неделя» agenda view (7 days + overdue block), navigation ‹ › and «Сегодня», option «Показывать выданные».
- «В Календарь (.ics)»: all not-finished orders (new/work/ready) with a due date, all-day events
  (`DTSTART;VALUE=DATE`), description with client/phone/product/price/debt/note, `VALARM` `TRIGGER:-PT15H`
  (= 9:00 the day before), RFC 5545 escaping and 75-octet line folding, CRLF. Apple Calendar on Mac/iPad imports it.

## Other
- Rail badge: red count of overdue orders on the «Сводка» button, refreshed on every `render`, on order edits and every 5 min.
- Empty data: friendly hero/banners with «Создать заказ» (creates an order via `newOrder()` and focuses its client field).
- ⌘K commands: Сводка, Доска заказов, Сроки, export .ics, Excel за период.
- Performance: 500 orders → each screen renders in well under the 1.5 s test limit; on `'update'` screens are re-rendered
  only when a signature of orders/sales changed, and inputs with focus are kept (`KS.keepFocus`).

## Data stored
- `st.ks.stats` (`KS.store('stats')`): `{per, from, to, rv, pm, board:{client, over, unpaid, cancel, done}, cal:{view, ym, sel, done}}` —
  UI preferences only. The search text is kept in memory.
- Writes to app data: only `order.status` (drag & drop / quick buttons / undo) and new orders via `newOrder()`.
- No IndexedDB keys, no new design-element properties.
- Reads (defensively): `st.orders`, `st.clients`, `st.shop` (name, phone, addr, cur, filter), `st.ks.pos.sales`.

## App globals used / wrapped
- Nothing wrapped or reassigned. Uses `newOrder`, `update`, `goTab`, `ordOpen`, `ordOver`, `ordStName`, `normKey`,
  `loadXLSX`, `saveFile` (via `KS.download`), `allCmds` (via `KS.cmd`).
- `window.__svStats` — read-only helpers for tests (agg, period, icsText, waDigits, msgText).

## Host issue found (worked around)
`host.js` creates screens with `$('.work')`. When the Заказы list was rendered first, that selector matches an
order card (`class="item order work"`) in `#ordList`, so the screen ended up inside a hidden order card (0×0, invisible).
The module moves its screens into `section.work` on every render (`homeScreen()`). Other modules with `screen:true`
are likely affected the same way — the proper fix is `$('section.work')` in host.js.

## Known limitations
- Revenue by day attributes `order.paid` to the order date (as the spec requires), not to the actual payment date.
- Telegram cannot prefill a message to a phone number; the text is copied to the clipboard and the chat is opened.
- Excel export needs the xlsx library from cdnjs (internet the first time); CSV works offline.
- `tel:`/`sms:` links do nothing on a Mac without iPhone continuity.

## Tests
`node ks/mods/stats/test.js` (≈2.5 min; `PART=mac|dark|ipad|empty|big` runs one part). Seed: `seed.js` (60 deterministic
orders over ~3 months with all statuses, partial payments, costs, notes, plus POS sales incl. debt sales, order
payments, refunds, cash in/out). Covers: KPIs vs an independent calculation (month, all time, custom period),
no double counting, all period buttons, charts + hover/tap tooltips, 30/90/12m + table, CSV columns/rows, xlsx sheets
(xlsx served from `review/merge/package/dist`), mouse drag + undo, touch long-press drag (CDP touch events), swipe does
not drag, quick status button, WhatsApp/tel/Telegram, all filters, cancelled column, card opens order editor, calendar
day list, week view, navigation, ICS content (envelope, DTSTART set = not-done orders, VALARM, folding), ⌘K, empty
states + «Создать заказ», badge, 500-order timings, touch target sizes, zero page errors.
Screenshots: `s_{ov,board,due}.png`, `*_dark.png`, `*_ipad.png`, `s_empty.png`.
Core regression: `bash ks/regress.sh $S/ks/mods/stats/app.html` → «no errors» ×4.

## QA (independent review)
`node ks/mods/stats/qa.js` (PART=core|edge|touch|phone|dark), ≈4 min, 64 checks, screenshots `q_*.png`.
It covers: screens appear after the Заказы list was rendered first, a reversed or empty custom period, prefs kept after a reload, filter chips synced
with the panel, search keeps focus during `update()`, mouse drag, app undo/redo, the snackbar «Отменить», Esc cancel, card → editor,
the badge after a due-date edit, project switch (`newProj`), Конверты round trip, ⌘K, ICS folding, Макет + print capture
(no module markup), weird data (strings, NaN, unknown status, invalid dates, HTML/XSS in fields, split POS payment with debt part), CSV/xlsx
with that data, empty states + «Создать заказ», 500 orders (<1.3 s per screen, 20× update 0.27 s), iPad tap menu / wa.me / long-press drag /
week «+», tap targets ≥34 px, phone width, dark theme. Zero page/console errors. test.js (68) and regress.sh (4× «no errors») stay green.

Found and fixed:
- **Undo/redo showed reverted statuses** (high): `travel()` re-renders while `st.orders` still holds the history snapshot; the host restores
  live orders only afterwards, so the board and badge showed the old status until the next render. stats now wraps `travel` and re-renders
  and refreshes the badge after it.
- **Dark theme: selected period chip invisible** (medium): `:root[data-theme=dark] .sv-chipb` outranked `.sv-chipb.on`. Fixed with `:not(.on)`.
- **Dark theme: overdue cards lost their red tint** (same specificity bug on `.sv-card`). Fixed, and a dark tint was added.
- **Dark theme: money badges unreadable** (host `.ks-badge` has no dark colours). Added dark colours scoped to `.sv`/`.svp`.
- Long debt badge was clipped without an ellipsis («долг 123» for 123 456 789). The money row now wraps.
- The «Создать заказ» button in the empty-state banners was squeezed and clipped (`flex:none`).
- KPI delta said «▲ было 0 · было 0» when the previous period was zero. It now says «▲ рост · было 0».
- Средний чек showed kopecks (23 272,73). The display is rounded (the raw value is still exact).
- Column header sums were truncated («252 ты…»). They are now compact (`252 тыс`), with the full sum in the tooltip.
- Cards with an unknown status had no next-status button. They are treated as «Новый».
- «Всё время» left out orders without a date (KPIs and CSV/xlsx). They are now included.
- Empty money row on cards without a price was removed.
- iPad (`pointer:coarse`): segmented buttons, the table toggle, small icon buttons, filter chips and checkboxes are now ≥34 px.

Remaining / notes:
- Phone width: the app itself lays out at ≈954 px (its own min-width), so on a 390 px phone the whole app is wider than the screen. That is
  app-level. Inside it the module screens adapt through container queries.
- In dark theme the app's side panel `.hint` text and rail labels have low contrast. These are app styles, not module styles.
- Host issues to fix centrally: `screenEl()` uses `$('.work')` (worked around here), `travel()` re-renders before the shared data is put back
  (worked around here), and `.ks-badge` has no dark-theme colours.
