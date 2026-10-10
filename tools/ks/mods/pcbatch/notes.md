# pcbatch — пакетная печать и склад открыток

Build (after `postcard`): `python3 ks/build13.py v24b.html ks/mods/pcbatch/app.html --mods photos,passport,pos,stats,home,stamps,postcard,nav,neuro,logo,pcbatch`
Test: `node ks/mods/pcbatch/test.js` (≈60 checks + screenshots s_*.png). Regression `ks/regress.sh`: clean.

## UI
- Открытки → seg **Пакет** (`KS.tab id:'pcbatch'`, screen) and **Склад** (`id:'pcstock'`, screen).
- Toolbar `#kst-pcbadd` «+ В пакет» (only visible when the current design is pcH/pcV). ⌘K: «Пакетная печать открыток», «Склад открыток», «Добавить открытку в пакет».
- Picker modal `#ksm-pcbpick`: tabs Шаблоны (108 pc templates) / Мои дизайны (st.myTpl of pc kinds + designs on the stock), orientation filter, search.

## Data
- `KS.store('pcbatch')` = `{items:[{id,snap,name,kind,w,h,qty,sides,two,tid,added}], paper:'1015'|'a4', a4p:<A4 paper id>, dx, dy, rev, done:{front,back}}`.
- `KS.store('pcstock')` = `{rows:{[snap]:{key,snap,name,kind,w,h,tid,auto,man,sold,min,price,ts}}, log:[{ts,key,name,t:'print'|'man'|'sale',n,price?}] (≤400), filter, q, defMin, defPrice}`.
  остаток = auto + man − sold; low = min>0 && остаток ≤ min.
- Snapshots: deep copy of `st.dz` (or `dzFromTpl` of a template) stored in IndexedDB `KS.idb` store `'kv'`, key `pcb:<id>`; id = `'d'+hash(visual content without element ids)` so the same design = same stock row and dedupes in the batch. Memory cache `KS.pcbatch.snaps`. Lost snapshot of a gallery template is rebuilt from `tid`.

## Printing
- 10×15: one page per card, exact size 152×102 / 102×152. Backs: only two-sided copies, same order.
- A4 portrait: 2 per sheet, slot 152×102 at x=29, y=41.5 / 153.5 (gap 10 mm), vertical cards rotated +90° (`translateX(cw) rotate(90deg)`), 8 cut marks per card (fronts only). Two-sided items are packed first so back sheets are the first N sheets.
- Backs for long-edge manual duplex: x mirrored `210 − x − w` (+dx), y same (+dy), vertical cards rotated −90° (top edge on the left after flip). Option «Обороты в обратном порядке» reverses the back pages.
- Print «Лицевые» adds every item qty to stock (`auto`).
- Auto «+ Напечатал» for direct postcard printing: `KS.on('print')` (printNow → postcard path, not test), capture click on postcard `[data-pcprint]` front/both, and wrapped `KS.postcard.print` (not 'back'). Count = postcard `copies`.
- «Продать» → `KS.emit('posAdd',{name:'Открытка «…»',price,qty,cat:'Открытки',unit:'шт'})` (pos opens the cart) and `sold += qty`.
- Rail badge `.pcs-railb` on `.rbtn[data-tab="ks-postcard"]` + `.pcs-segb` on the Склад seg = number of low rows.

## API
`KS.pcbatch = {add, addTpl(T), plan(), frontPages(P), backPages(P), print('front'|'back'), stock(), sell(key,qty,price), record(n), csv(), snaps, ensure()}`.
