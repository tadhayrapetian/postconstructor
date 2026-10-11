# Module `nbshop` — «Блокноты → Производство»

The business side of the «Блокноты» section ("типография внутри типографии"). One sub-tab `nbshop` («Производство»,
`screen:true`) in group `notebook` (rail «Блокноты», `before:'prep'`; if the notebook module is absent nbshop creates the
group itself with its own icon). Inside the sub-tab there is an own navigation (side panel) with 7 views; the current view is
remembered in `KS.store('nbshop').view`.

## Landing sub-tab (first + default) — done without editing host.js
host.js has no order option for sub-tabs (items are kept in registration order, nbshop is built last). Two small, safe tricks:
- **First in the segmented control**: a `MutationObserver` on `.kspanel[data-panel="ks-notebook"]` (childList only — the host
  rebuilds the panel with `innerHTML` when the sub-tab changes) moves the `[data-kssub="notebook:nbshop"]` button to the front.
- **Opened by default**: on `boot` nbshop sets `st.ui.ksSub.notebook='nbshop'`, so a click on «Блокноты» after app start lands on
  the dashboard. Within a session the host's normal «remember last sub-tab» still works. Setting `KS.store('nbshop').land=false`
  disables the boot landing. A proper host option (e.g. `order`/`first` for sub-tabs) would make both tricks unnecessary.

## Views
1. **Сводка** — KPIs (в работе + просрочено, готовы к выдаче, выручка за месяц + оплачено, средняя цена блокнота, материалы на
   исходе — tiles are buttons to the board/stats/calc/stock), quick actions (Новый блокнот → «Блок», Открыть последний →
   `KS.nb.load`, Очередь печати → board filter, Расчёт, Витрина, Подбор пружины), production pipeline (count + pcs per stage,
   click → board scrolled to the column), recent orders, low materials + «Список покупок».
2. **Заказы и производство** — kanban with 8 stages Макет → Печать блока → Печать обложки → Резка → Переплёт → Упаковка → Готов
   → Выдан. Card: №, due chip (red overdue «−N дн», orange today, amber ≤2 days), client, notebook line, cover thumbnail (or a
   tinted placeholder), qty × price, debt badge when ready/issued, a checklist for the current stage (generated from the job:
   duplex mode by printer, card gsm, lamination, punch pitch, spiral size, elastic/ribbon…), progress bar, «Открыть блокнот»,
   «Печать», ‹ previous / next stage › (next turns primary when the checklist is complete). Mouse/pen drag & drop (6 px threshold,
   ghost, column highlight, edge auto-scroll, Esc cancels); on touch the buttons are used (no long-press conflicts with scrolling).
   Filters: Все / В печати / Просроченные / Срок ≤ 2 дн + search (panel). «Выдан» shows the last 30 days (+ «Показать ещё»).
   Card tap → job dialog: edit client/phone/qty/due/sum/stage/note (written to the linked order), all stage checklists, history,
   materials written off, «В «Заказах»», «Отменить заказ» (order → cancel), «Убрать с доски» (order kept).
3. **Прайс и расчёт** — calculator (panel) from the current notebook (`KS.nb.snapshot()`: fmt, w, h, pages/padded, paperGsm,
   binding, sides; page coverage from `KS.nb.pages()` + `KS.nb.types()` ink l/m/h) or manual input; cover card, cover print
   sides, lamination, extras, qty (± and 1/5/10/25/50/100 chips). Screen: price per piece, total, profit + margin, facts (A4 sheets,
   block thickness, chosen spiral/Wire-O), warnings (staple > 96 pages, too thick for coil…), cost breakdown with minutes, price per
   piece for every discount step. Editable price list: paper per A4 sheet by gsm (add/remove rows), ink per A4 side by coverage,
   cover card by gsm, lamination matte/gloss/soft-touch, plastic coil by diameter (per 297 mm piece, scaled by bound edge), Wire-O
   by diameter, binding material + minutes (staple per staple, rings per ring, discs per disc, glue for A5 scaled), extras
   (corners, elastic, ribbon, pocket, packaging) material + minutes, labour ֏/min, setup/side/cut/lamination minutes, markup %,
   rounding (auto 10/50/100/500 or fixed), volume discounts. «Прайс для клиентов» prints an A4 price sheet (formats × pages table,
   binding prices for A5/96, extras, discount tiles, shop contacts).
4. **Материалы** — stock by category with − / + / typed quantity, minimum, unit cost, delete; add form (name, category, unit,
   «списывать как» type + size/gsm, qty, min, price). «Нужно купить» lists items at/below minimum *after* the needs of jobs not yet
   bound, plus needs with no stock item; «Отметить купленным» refills; printable shopping list.
5. **Пружина и переплёт** — block thickness, plastic coil (4:1), Wire-O (diameter, inch, 3:1/2:1), rings, discs (count on edge),
   staple/perfect suitability, hole counts per pitch on the bound edge, table pages × gsm, punching reminders; «Взять из текущего
   блокнота».
6. **Витрина для клиента** — inline and full-screen (fixed overlay, Esc/«Закрыть»): format, page type, volume, binding (each with
   its price), cover (8 own SVG designs, the current cover from `nb:cover` or `KS.nbCover.thumb()`, and nbcover templates if it ever
   exposes thumbnails via `thumbs()/templates()` returning `{thumb|src}`), extras with prices, title on the cover, qty, live price
   → «Оформить заказ» (order dialog above the overlay).
7. **Статистика** — 3/6/12/24 months: sold pcs, revenue, profit/margin, average price, SVG bar chart revenue + profit by month
   (theme tokens, hover titles), bars by format and by binding, table by month.

## Pricing model (per notebook)
leaves = pages / sides; n-up = how many trimmed pages fit on A4 (both orientations); sheets = ceil(leaves / n-up).
Cost = paper(sheets) + ink(sheets × sides × coverage) + cover card (2 pieces, or one wrap piece 2w+spine for perfect/sewn/staple;
A3 ×2 when larger than A4) + cover ink (heavy) + lamination + binding + extras + labour (minutes × rate; setup spread over qty).
Price = nice(cost × (1 + markup) × (1 − discount(qty))). Thickness = leaves × gsm × 0.00125 + 2 × card gsm × 0.0012 mm.
Coil: smallest ≥ thickness + 3 mm; Wire-O: capacity ≈ 75 % of diameter; rings 80 %, discs 85 %.

## Orders ↔ production
«Создать заказ» calls the app's `newOrder({client, phone, product:'Блокнот A5 · 96 стр.', qty, paper, sides, fin, price, cost, paid,
status:'new', due, note})` + `syncClient`, then `update()`. Stage → order status: Макет → new; Печать блока…Упаковка → work;
Готов → ready; Выдан → done. Status changes made elsewhere (Заказы, Сводка board) are pulled on every `render` (`sync()`):
done → Выдан, ready → Готов, new → Макет, work → Печать блока (or Упаковка if the job was already ready). Cancelled orders hide
the job; a deleted order shows «Заказ удалён». The linked order is the source of truth for client/phone/due/price/paid/qty.
Payments are not recorded by nbshop (prepayment from the dialog goes to `order.paid`, as the app's own order editor does).

## Materials auto write-off
When a job reaches «Переплёт» (also via sync), `usage(cfg, qty)` is written off once: paper sheets by gsm, cover card (A3 counts
×2), lamination film, the coil/Wire-O/rings/discs of the chosen diameter (nearest larger diameter in stock), staples, glue (g),
thread (m), elastic, ribbon (m), pocket, pack. Not found → listed as missing in the toast/job. Moving the job back before
«Переплёт» returns exactly what was written off. Cancelling/removing a job does not return materials (they were used).

## Data
- `st.ks.nbshop` (`KS.store('nbshop')`): `view`, `prices{paper[],ink{},card[],lam{},spiral{},wireo{},bind{},extra{},lab{},markup,
  disc[[qty,%]],round}`, `calc{src,fmt,w,h,pages,gsm,sides,cov,binding,card,coverSides,lam,edge,extras{},qty,page,title}`,
  `jobs[{id,orderId,no,date,client,phone,qty,due,price,cost,unit,cfg,src:'calc'|'show'|'api',stage,checks{stage:[bool]},
  hist[[stage,ms]],ded{ts,items[{id,n,name}],miss[]}|null,note,upd,snap,csnap,cover,gone?,cancel?}]`,
  `mats[{id,cat,name,unit,qty,min,cost,key}]` (key: `paper:80`, `card:300`, `lam`, `spiral:10`, `wireo:9.5`, `ring:25`, `disc:24`,
  `staple`, `glue`, `thread`, `elastic`, `ribbon`, `pocket`, `pack`, `x` = not written off), `show{…}`, `board{q,filter,allOut}`,
  `spine{…}`, `stats{per}`, `last`, `land`.
- IndexedDB (`KS.idb`): `kv` `nbs:snap:<jobId>` (full `KS.nb.snapshot()`), `kv` `nbs:csnap:<jobId>` (`KS.nbCover.snapshot()`),
  `files` `nbs:cov:<jobId>` (copy of `nb:cover`), `files` `nbs:covt:<jobId>` (≤160 px JPEG thumbnail). Deleted with the job.
- «Открыть блокнот»: `KS.nb.load(snapshot)` (or current settings + the job's format/pages/paper/binding when there is no
  snapshot), cover restored with `KS.nbCover.load(csnap)` or by writing the saved `nb:cover` back (+ `nbCoverChanged`), then the
  «Блок» (or «Печать») sub-tab is opened — found by its title in the segmented control.

## Globals / API
- Nothing in the app is wrapped. Uses `newOrder`, `syncClient`, `update`, `goTab`, `ordOpen`, `st.orders/clients/shop`.
- `KS.nbShop` = `{store, quote, calcCfg, showCfg, usage, findMat, setStage, createJob, sync, pricePages, shopPages, shopList,
  thickOf, pickSpiral, pickWire, openShow, closeShow, go, jobs, live, addOrder(cfg, {qty, client, phone, due, price, paid})}`.
- ⌘K: Производство, доска, прайс и калькулятор, склад, витрина, прайс для клиентов (печать).
- CSS prefix `nbs-`; data attributes `data-nba/nbk/nbp/nbm/nbj/nbjob/nbst/nbq/nbv/nbsw/nbsh` (the app itself listens to
  `data-pp`, `data-a`, `data-k`, `data-j`… globally — generic names collided, e.g. `data-pp` triggered the app's price editor).
- 'change'-triggered rebuilds wait for pointer-up, so a click that blurs an edited field is not lost.

## Tests
`node ks/mods/nbshop/test.js` (≈3 min; `PART=mac|dark|ipad|real`). mac/dark/ipad run on `app.html` (build without the other
notebook modules) with stubs of `KS.nb`, `KS.nbCover` and sub-tabs «Блок»/«Печать» injected *before* nbshop (as in the real build
order) into `app_test.html`. `PART=real` runs on `app_full.html` (full production build with notebook, nbcover, nbextra).
Builds:
```
python3 ks/build13.py v24b.html ks/mods/nbshop/app.html --mods photos,passport,pos,stats,home,stamps,postcard,nav,neuro,logo,ux,pcai,pcbatch,pcmock,pcseries,nbshop
python3 ks/build13.py v24b.html ks/mods/nbshop/app_full.html --mods photos,passport,pos,stats,home,stamps,postcard,nav,neuro,logo,ux,pcai,pcbatch,pcmock,pcseries,notebook,nbcover,nbextra,nbshop
```
Screenshots in `shots/` (`mac_*`, `dark_*`, `ipad_*`, `real_*`, `price_sheet.png`).

## Limitations
- Imposition in the calculator is a simple n-up on A4 (no signatures/creep, no gripper margins); the notebook module's own
  imposition (`KS.nb.plan()`) may differ slightly in sheet count.
- Default prices/materials are examples in ֏ and are meant to be edited.
- nbcover exposes templates without thumbnails, so the showroom uses its own 8 SVG cover designs + the current cover.
- Revenue is the order sum (price), by order date; payments are not tracked here (Касса/Сводка do that).
- The kanban shows ~3 columns at once on iPad (horizontal scroll); drag & drop is mouse/pen only by design, touch uses buttons.
