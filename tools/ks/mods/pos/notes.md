# Module `pos` — «Касса»

Rail button «Касса» (group `kassa`, before `orders`) with 4 sub-tabs, all with a big work-area screen:

- **Продажа** — POS. Screen: tiles coloured by category (favourites first, category chips, search, «Своя позиция»),
  qty badge on tiles, second mode «Оплата заказов» (unpaid / partly paid orders with progress bar, «Принять оплату»,
  Квитанция / Акт / Счёт per order). Panel: cart with qty steppers, per-line price edit, delete, discount (% or sum,
  quick 5/10/15 %), client (autocomplete from `st.clients`, phone field for a new client → added to `st.clients`),
  payment Наличные / Карта / Перевод / В долг, «Получено» + quick banknote chips → сдача, big «Оплатить»,
  «Как заказ» (→ `newOrder`, items in the note, price), «Предоплата» (order + partial payment), «Счёт» from cart,
  toggle «Печатать товарный чек после оплаты». Success card + flash + optional chime; Enter starts the next sale.
  Keyboard (Mac): digits/Backspace type «Получено», Enter pays, Esc clears entry.
- **Смена** — open shift with cash in drawer (auto-opens on first sale if forgotten), внесение / изъятие with reasons,
  operations of this shift / today, «Возврат» (partial by lines or by sum, reason, method; negative record),
  X-отчёт, Z-отчёт (close: by payment method, by category, checks, average check, refunds, discounts, debt,
  expected vs counted cash → difference), print X/Z, history of shifts with reopenable Z reports, reopen last shift.
- **Услуги** — price list editor: ~50 default services for an Armenian copy/print shop (marked «примерные цены»),
  categories with colours (modal), add / edit (name, price, unit, cost, colour, fav, hide) / delete, drag reorder
  (mouse + touch pointer events), CSV export/import (`;`/`,`/tab, BOM, quotes; merge or replace), printable price list.
- **Документы** — shop requisites (name/phone/addr in `st.shop`; legal name, ИНН/ՀՎՀՀ, bank, account, director,
  invoice terms), journal of issued documents with reprint. Documents via `KS.print`: Товарный чек (A4), Квитанция
  (2 copies on A4 with cut line), Счёт на оплату (bank block), Акт выполненных работ; numbered by `seq`, reprints keep
  the number, sum in words (Russian, драм).

Integration: `KS.on('posAdd',{name,price,qty,cat?,unit?})` adds a line and opens `KS.show('kassa','sale')`;
«В кассу» button in «Цена» (next to «Оформить заказ»); «Принять оплату» in an opened unpaid order in «Заказы»;
⌘K commands (новая продажа, оплата заказов, X, Z, прайс, документы). Global `KS.pos` exposes helpers for other
modules/tests (`store, addLine, pay, calcRep, curShift, openShift, closeShift, allSales, archive, unpaid, payOrder,
sumWords, cartCalc, docPages, csvItems, printRec`). Emits `posDoc` after printing a document.

## Data
- `st.ks.pos` (via `KS.store('pos')`): `cats[{name,color}]`, `items[{id,cat,name,price,unit,cost?,fav,color?,hide?}]`,
  `sales[{id,ts,type:'sale'|'order'|'refund'|'in'|'out',no?,items,sub,disc,total,pay,got?,change?,orderId?,orderNo?,
  client?,shift,refOf?,reason?,prepay?,debt?,note?}]`, `shifts[{id,no,open,close,cash0,z?}]`, `cur` (open shift id),
  `seq{check,invoice,act,rcpt,shift}`, `docs[{id,kind,no,ts,src,d}]` (journal, max 400), `req{legal,tax,bank,acc,boss,terms}`,
  `set{printAfter,printKind,checkSize:'A4'|'A5'|'80'|'58',sound}`, `cart{lines,dk,dv,client,phone,pay,got}`, `arch[]` (archived month keys).
- Debt sale = order with `paid:0` + record `{type:'order',pay:'debt',total:0,debt}` (not counted as money).
  Order payments (`type:'order'`) increase `order.paid`; refunds of an order payment decrease it. Reports count each
  record once.
- IndexedDB (`KS.idb`, store `kv`): `pos:arch:<YYYY-MM>` — sales of closed shifts older than 60 days are moved there
  (keeps localStorage small); `KS.pos.allSales()` merges them back.
- Orders created from the cart get `o.posItems` (line items) for documents.

## App globals wrapped
- `travel` — keeps `st.shop.orderSeq` from going backwards on undo (orders created by the Касса are not reverted;
  host already keeps `st.ks/orders/clients`).
- `renderOrdList` — adds «Принять оплату» to unpaid orders in «Заказы».
- Document keydown listener (only when Касса is active and no modal is open).

## Known limitations
- No fiscal (ККМ/ՀԴՄ) integration — browsers cannot talk to fiscal devices. Documents print through the app print
  engine as A4/A5 pages, or as a roll receipt 80/58 mm for a receipt printer installed in macOS/iPadOS (marked
  «Не является фискальным чеком»).
- Default prices are approximate and meant to be edited.
- Sound feedback uses WebAudio (may be silent until the first user gesture on iPad).

## Tests
`cd $S && python3 ks/build13.py v24.html ks/mods/pos/app.html --mods pos && node ks/mods/pos/test.js`
(parts: `node test.js "" a|b|c`). 91 assertions: every payment method, change, discounts, debt, order payment,
prepayment, order from cart, partial refund, shift open/in/out, X and Z with exact numbers, document printing and
numbering, posAdd, Цена/Заказы buttons, undo, CSV, drag reorder (mouse + touch), reload + project switch persistence,
IndexedDB archive, sum in words, mode round trip, no page errors. Screenshots: `shot_*.png`, `doc_*.png`.
Core regression: `bash $S/ks/regress.sh $S/ks/mods/pos/app.html` → 4× «no errors».

## QA (independent review)
Tools: `qa.js` (parts `v` visual shots, `p` phone/iPad, `e` edge cases, `k` print geometry; `node qa.js [v|p|e|k]`, ~105 s,
141 assertions), `montage.js` (grid of screenshots for review), shots in `qa/`.

Found and fixed:
- Buttons with icons in «Услуги» (header «Открыть кассу» / «Печать прайса A4», panel «+ Услуга») rendered the SVG at full
  size (huge icons, no text) — generic icon sizing for all Касса buttons.
- «Оплатить» was below the fold with 3–4 lines in the cart (1440×900, iPad) — the pay bar now sticks to the bottom of the panel.
- Sale screen: header, search and category chips scrolled away with the tiles — now only the tile area scrolls (its scroll
  position survives background re-renders; category/mode change returns to the top).
- Long documents were clipped: товарный чек / счёт / акт with more than ~18 rows lost rows and the totals at the page
  bottom; the price list overflowed one A4. Now documents are laid out off-screen with real fonts and split into pages
  («продолжение», «Страница k из n», totals on the last page); the price list is an explicit two-column layout over
  several pages. Verified in print media: 3…75 rows, A4/A5, long names — nothing clipped, every row printed.
- New: roll receipt 80 mm / 58 mm (setting «Формат товарного чека»), page height measured from the content.
- 100 % discount on a fractional sum left 0,25 ֏ to pay; discounts now round the total, not the discount.
- Average check showed kopecks in ֏ («3 547,33») and wrapped in the KPI tile — rounded like other ֏ sums.
- Negative per-line price and negative service price were accepted — clamped to 0.
- Paying an already fully paid order (stale modal / API) recorded a 0 or negative payment — refused; the order is re-read
  by id before paying.
- Payment method stayed on «Карта»/«Перевод» for the next sale — every new sale starts with «Наличные».
- Closed shift showed an empty «Смена не открыта» operations list — it now shows today's operations.
- Cart line: unit text «֏ / компл.» was cut off — compact «֏/компл.».
- iPad: sub-tab buttons 29 px → 36 px on touch screens.
- Shift operations table was O(n²) (refund lookup per row; 0.53 s with 4000 operations) — refund sums are precomputed and
  the table shows the last 300 operations (totals still use all).
- Archive window 92 → 60 days (each save snapshots the whole state into undo history and localStorage).

Checked and fine: every payment method, change, debt without client refused, got < total refused, XSS in names/clients
(escaped in tiles, cart and printed docs), refund over the limit refused, order refund lowers `order.paid`, exact X/Z
numbers, toolbar undo/redo keep sales/prices/orders, Макет arrow-key move and business-card print still work,
Типография ⇄ Конверты via the header, new project + switch through the «Проекты» dialog (shared data), cart survives
reload, empty catalogue states, reset to defaults, 400 items + 4000 sales + 150 unpaid orders (sale screen 25 ms, shift screen 0.2 s,
state ≈ 1.1 MB), keyboard (digits, Backspace, −, Enter pay / next sale, typing searches, Esc), keys on other tabs untouched,
квитанция stays one A4. `test.js` 91/91, `qa.js` 141/141, core regression 4× «no errors».

Remaining:
- Phone width (390 px) and iPad portrait (820 px): the base app itself needs ≈1030 px (topbar/main have a min width) and
  scrolls horizontally on every tab; the Касса adds no extra overflow, but it is not a phone layout.
- With a long cart on a 900 px-high screen the sticky pay bar covers the payment-method row until the panel is scrolled.
- No fiscal device integration (browser limitation).
