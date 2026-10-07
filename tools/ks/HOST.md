# Konvert Studio — writing a module (KS host)

## The product
«Конверт Студия» is a single-file HTML/JS app (PWA) used by ONE operator who runs a small print shop
(prints everything: business cards, flyers, invitations, stickers, photos, documents…) on two Canon
inkjets: **MAXIFY GX4040** (A4, auto duplex, no borderless, rear flat tray up to 300 g/m²) and
**PIXMA G3410** (A4, borderless on photo paper A4/10×15/13×18/Letter, manual duplex only, ≤275 g/m²).
The operator works on a **Mac (Safari/Chrome)** and an **iPad (Safari, touch, installed as PWA)**.
UI language: **Russian** (short, plain, friendly; the app also has Armenian/English translation by
dictionary — just write Russian). Currency is in `st.shop.cur` (default `֏`, Armenian dram); use `KS.money(n)`.
The app has two modes (header switch): **«Типография»** (print shop: design studio with 150 templates,
products, imposition, prices, orders) and **«Конверты»** (legacy envelope designer). Modules almost always
target «Типография» (`app:'print'`).

The user wants the program to feel like a serious, beautiful, professional tool — "мега суперское".
Quality bar: every feature fully works end to end, looks polished in light AND dark theme, works with touch
on iPad, never throws, never loses data.

## Files and build (paths relative to the scratchpad dir `$S`)
- Base app: `$S/v24.html` (do NOT edit). Design engine sources for reading: `$S/dz/dz.js`, `$S/dz/extra.js`,
  `$S/dz/events.js`, `$S/dz/panels.html`, `$S/dz/dz.css`, data model: `$S/dz/SCHEMA.md`.
- Module host: `$S/ks/host.js` + `$S/ks/host.css` (read host.js fully — it is short). Do NOT edit them.
- Your module: `$S/ks/mods/<name>/mod.js` (+ optional `mod.css`). Write ONLY inside `$S/ks/mods/<name>/`
  (tests, screenshots, notes too). Never touch other modules' folders.
- Build your test copy (own output file, never shared):
  `cd $S && python3 ks/build13.py v24.html ks/mods/<name>/app.html --mods <name>`
  (to test together with other finished modules: `--mods other,<name>`).
- mod.js is wrapped by the builder in `try{ (function(){ 'use strict'; …your code… })(); }catch(e){…}` and
  inserted into the app's main script just before boot, after all app functions exist. So you can call every
  app global directly. Your own top-level declarations are private to the module.
- mod.js must not contain the text `</script`.

## Host API (`KS`, global)
- `KS.mod(name,{title})` — register (call first).
- `KS.tab({id, title, icon, app:'print'|'env'|'both', group, groupTitle, groupIcon, seg, before, screen, render})`
  adds a rail button (one per `group`; several tabs with the same `group` become sub-tabs shown as a segmented
  control). `before`: data-tab of an existing rail button to insert before (default `'orders'`; existing:
  `shop` Шаблоны, `dz` Макет, `prep` Печать, `calc` Цена, `orders` Заказы, `docs`, `batch`, `ui`).
  KS tabs get data-tab `ks-<group>`. `render(box,{reason,screen})` is called with reason `'show'` when the tab
  opens and `'update'` after every app `renderAll()` (very frequent, e.g. on every keystroke in other inputs):
  on `'update'` do only cheap refreshes and never rebuild inputs that have focus (use `KS.keepFocus(box,fn)`).
  `screen:true` gives the tab a big work-area overlay (`opts.screen`, covers the layout preview) — use it for
  dashboards, boards, photo grids, croppers. The side panel (`box`, ~340px wide) holds controls.
- `KS.show(group, subId)` — open a tab programmatically (switches app mode if needed).
- `KS.modal({id,title,wide,full,onClose})` → `{el, root, open(), close(), title(t)}` (Esc/backdrop close).
- `KS.tool({id,label,title,app,run})` — button in the toolbar above the layout (before «Мокап»). Keep labels short.
- `KS.cmd(name, kind, fn)` — command in the ⌘K palette.
- `KS.insp({id,title,order,when(e),html(e),bind(div,e)})` — extra section in the Макет inspector for the selected
  design element `e`. Apply changes with `KS.changed()` (save + re-render preview, keeps the inspector and focus)
  or `KS.changed(true)` (full update). Inspector is rebuilt on selection change.
- `KS.on(event, fn)` events: `boot`, `render` (after renderAll), `preview` (after layout preview render),
  `select` (id), `mode` ('print'|'env'), `beforePrint`/`print` ({test}), `insp` (box,e), `modalOpen`/`modalClose`,
  `screenHide`. `KS.emit(name,…)` for your own events.
- Data: `KS.store(name, defaults)` → persistent object at `st.ks[name]`, shared by all projects, NOT reverted by
  undo. Call it every time you need it (the `st` object is replaced on project switch / undo) — never cache it.
  Call `KS.save()` after changing it. Big binary data (photos, fonts, files) → `KS.idb.get/set/del/keys/all(key, store)`
  stores `'kv'` (default) or `'files'`. Never put megabytes into `st` (it goes to localStorage, 5 MB limit).
- Design helpers: `KS.doc()` (= `st.dz`), `KS.side()`, `KS.sel()` (selected element), `KS.els(side)`,
  `KS.ensureDesign()` (switch to Типография + design view), `KS.addImage(dataURL,{mode:'auto'|'add'|'replace'|'bg',credit})`,
  `KS.palette(dataURL,name)` (palette from a picture → applied to the design), `KS.readImage(file,max)` → data URL,
  `KS.pick(accept,multiple)` → Promise<File[]>, `KS.imgSize(src)`, `KS.fetchImage(url)` → data URL (needs CORS).
- Printing/files: `KS.page(wmm,hmm,innerHTML,name)` → page object; `KS.print(pages,opt)` → app print engine
  (browser print dialog, exact page sizes, vector). `KS.download(name, blob)`. `KS.printer()` → current printer spec.
- Misc: `KS.icon('<path d=…/>')` (24×24 stroke icon svg), `KS.toast(msg)`, `KS.esc(s)`, `KS.money(n)`, `KS.uid(prefix)`, `KS.today()`.

## Useful app globals (read the sources for details)
`st` (whole state; `st.dz` design doc — see SCHEMA.md; `st.shop` shop settings: prices.papers/print/fin, printer,
paper, bleed, marks, cur, name/phone/addr; `st.orders` [{id,no,date,client,phone,product,qty,paper,sides,fin,price,cost,paid,status,due,note,proj}],
`ORD_ST` statuses new/work/ready/done/cancel; `st.clients`), `save()`, `saveNow()`, `update()` (save+renderAll),
`renderPreview()`, `toast()`, `esc()`, `$`, `$$`, `activeTab`, `goTab(id)`, `setView(v)`; design engine:
`dzEls(side)`, `dzFind(id)`, `dzSel`, `dzSelect(id)`, `dzAdd(type,props)`, `dzDelete()`, `dzDup()`, `dzAlign(k)`,
`dzElHTML(e,doc,pal,opt)` (one element → HTML, absolute mm), `dzHTML(doc,side,opt)` (whole side),
`dzPal(p)`, `dzCol(v,pal)`, `dzRoles(cols,dark)`, `dzSetPalette(cols,name)`, `dzExtract(src)`, `dzThumb(T,boxW,pal,brand)`,
`dzFromTpl(T,W,H,pal)`, `dzApplyTpl(T)`, `DZT` (templates), `PRODUCTS`, `prodById(id)`, `applyProduct(id,silent)`,
`PRINTERS`, `printArea(sheet)`, `printPages(P,opt)`, `newOrder(o)`, `saveFile(name,blob)`, `loadLib(url,test)`.
Libraries on the page: `qrcode` (qrcode-generator 1.4.4), `JsBarcode`; lazy via `loadLib`: html2canvas 1.4.1,
jspdf 2.5.1, jszip 3.10.1, xlsx 0.18.5 (cdnjs URLs as used in the app).

Extending app behaviour: wrap the global function and always call the original:
`const _x=dzElHTML; dzElHTML=function(e,...a){ const h=_x.call(this,e,...a); return e.myProp?decorate(h,e):h; };`
Other modules may wrap the same function — that composes fine. Never copy-paste-replace app code.
New element properties are fine (keep names short, document them in notes.md); templates are deep-copied so
they survive. Rendering must stay pure HTML/CSS/SVG in mm so the vector PDF/print path keeps working; when an
effect can't be expressed in CSS reliably for print (e.g. pixel filters), bake it into a new image data URL.

## UI style
Use existing classes: `.card` (+ `.hd` header row), `.hd2` small caps label, `.hint`, `.btn`, `.btn.sm`,
`.btn.primary`, `.btn.danger`, `.seg` (segmented buttons, `.on`), `label.f` (label + input stacked), `.row2`, `.row3`,
`.chk` (checkbox label), `.flexw`. Host blocks: `.ks-grid` (`--ks-min`), `.ks-tile`, `.ks-kpis`/`.ks-kpi`,
`.ks-table`, `.ks-badge(.ok/.warn/.bad)`, `.ks-empty`, `.ks-drop(.over)`, `.ks-row`, `.ks-sp`.
CSS variables: `--ink`, `--muted`, `--line`, `--edge`, `--edge2`, `--field`, `--accent`, `--accent-ink`, `--danger`,
`--glass-rgb` (use `rgb(var(--glass-rgb) / .9)`). Dark theme: `html[data-theme=dark]` or auto by system — always check
both. Prefix your own CSS classes with a short module prefix. Touch targets ≥ 34px on iPad. Empty states must
explain what to do. No walls of text; no emoji soup.

## Testing (mandatory)
Harness: `const {open,center,drag}=require('<$S>/ks/_h.js'); const A=await open({app, mock:{'host.com':(route,url)=>route.fulfill({json:…})}})`
→ `{p, ev, W, errs, logs, close}`; fonts/cdn libs are served locally, every other network request is aborted
unless you mock it (outbound internet is blocked in this sandbox — mock API responses in the real APIs' format).
To check printing without a dialog: `await ev(()=>{ window.runPrint=()=>{ window.__printed=document.querySelector('#printRoot').innerHTML; }; })`
(verified: app globals are window properties, reassigning them works; `#pageStyle` holds the @page sizes).
Write `ks/mods/<name>/test.js` that exercises every feature through real clicks/typing where it matters,
asserts results, checks `A.errs` is empty, and takes screenshots: 1440×900 light, 1440×900 dark
(`st.ui.theme='dark'; applyUI()`), iPad 1180×820 (`{viewport:{width:1180,height:820},ctx:{hasTouch:true,isMobile:false}}`).
LOOK at the screenshots with the Read tool and fix anything ugly, clipped, overlapping or unreadable.
Also confirm the existing app still works with your module: open Макет, select/move an element, undo, print a
business card (capture), switch to Конверты and back — no page errors.

## Shared conventions between modules
- **Photo library** (owned by the `photos` module, others may read/add): IndexedDB via `KS.idb`, store `'files'`,
  key `'ph:<id>'`, value `{id,name,type,data:dataURL,thumb:dataURL(≤360px),w,h,album,added:ms,credit?:{author,source,url,license}}`.
  Album names: «Клиенты», «Фоны», «Логотипы», «Разное», «Документы». Emit `KS.emit('photosChanged')` after changes.
- **Money received**: `st.orders[].paid` is the total paid for an order. The `pos` module records every payment in
  `KS.store('pos').sales` as `{id,ts,type:'sale'|'order'|'refund'|'in'|'out',items,total,pay,orderId?,client?,shift}`;
  a payment for an order (`type:'order'`) also increases `order.paid`. Reports must not double count.
- **Print log**: the `prnhelp` module keeps `KS.store('prnhelp').log`; the `stock` module keeps `KS.store('stock')`.
  Read other modules' stores defensively (they may be absent): `(st.ks&&st.ks.pos)||{}`.
- **Rail order** in Типография (left → right / top → bottom): Главная (`home`), Шаблоны, Макет, Фото (`photo`),
  Фотосалон (`salon`), Печать, Цена, Касса (`kassa`), Сводка (`svodka`), Склад (`sklad`), Заказы, …
  Use `before:` accordingly: home→`shop`, photo→`prep`, salon→`prep`, kassa/svodka/sklad→`orders`.
- Core regression: `bash $S/ks/regress.sh /abs/path/to/your/app.html` (≈2 min) must print `no errors` four times.
