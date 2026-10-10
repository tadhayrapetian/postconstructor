# Module `pcseries` — Серия открыток, конверт к открытке, каталог PDF

Build: `python3 ks/build13.py v24b.html ks/mods/pcseries/app.html --mods photos,passport,pos,stats,home,stamps,postcard,nav,neuro,logo,pcseries`
Needs the `postcard` module, which provides the templates pcH/pcV, `KS.postcard.apply` and `KS.thSVG`. If `KS.postcard` is missing, the module falls back to applyProduct + dzApplyTpl.
Test: `node test.js [app]` (real clicks: file chooser, typing, ticks, print capture, PDF download, reload, iPad taps). Regression: `regress.sh` printed `no errors` ×4.

## Серия (sub-tab `pcser` of «Открытки», screen)
- Panel cards: Фото (optional: drop/click/drag onto the screen; stored in IndexedDB `kv` key `pcseries:photo` = {full ≤2000px, prev ≤720px JPEG, name}), Текст (optional; preset chips), Подбор (orientation, theme, 6/9/12, «Другие варианты» pages through the matching templates), «Конверт к открытке», a link to the catalog.
- Variants are deep copies of matching templates (DZT + st.myTpl, kinds pcH/pcV; series-saved ones are excluded). When a photo is given, templates with photo frames come first. The photo goes into every non-logo `img`. The text replaces the biggest front text element (a split twin heading with the same font and ≥95% size is hidden). Its size is fitted by a real DOM measure in the card's fonts, and measured again once the web fonts have loaded.
- Thumbnails: like `dzThumb`, but at the template's own size. dzThumb rescales to the current product, which would squash a postcard into a business-card shape.
- Ticks (in memory, `SEL`). Bar: «В макет» (exactly one → KS.postcard.apply with the full-size photo), «В мои шаблоны» (st.myTpl, tags `мои`,`Серия`, `mine:true`, photo re-encoded at ≤1200px to keep localStorage small), «Конверт», «Печать (n)»: front pages, one copy each, page size = postcard size (152×102 / 102×152), via KS.print.

## Конверт к открытке (modal `pcsenv`; panel button, bar button, ⌘K «Конверт к открытке»)
- Source: the first ticked series variant → else the current design if it is a postcard → else the first variant. Palette roles bg/ink/acc/acc2/soft and the heading font come from it. Brand mark: KS.thSVG with the postcard module's logo settings.
- Size 162×114 by default (allowed: width 120–174, height 90–140). The form shows the clearance around 152×102 and warns when it is too small.
- Pages (all vector HTML/SVG in mm): «Дизайн A4» = front (address lines, «Кому», index boxes, stamp box, postmark, sender + brand, inscription) and back (flap with a seal), with crop marks. «Развёртка A4» = die-cut net: cut outline (solid), fold lines (dashed), side, top and bottom flaps, hatched glue zones, scissors, legend and steps. The decoration can be switched off. Upright content on the flaps is rotated 180° on purpose so it reads correctly once folded. «На конверт W×H» prints straight onto a ready envelope. «Скачать PDF».
- Store `st.ks.pcseries.env` = {to,addr,city,from,from2,note,deco,w,h}.

## Каталог (sub-tab `pccat`, screen)
- Sources: Все / Тема / Избранные (stars, `st.ks.pcseries.fav` = template ids) / Мои (st.myTpl). Orientation filter. Order is horizontal first, then vertical, so rows stay clean; screen numbers = PDF numbers.
- Per card: include switch (renumbers live), star, editable name (`c.names`), price (`c.prices`; empty = default `c.price`, 500 by default). Shop name, phone and address are edited in `st.shop`; Instagram/site goes in `c.extra`.
- PDF: cover (cream panel, brand mark, title, fan of 3 cards, count, price «от …», contacts, year) + A4 pages with 6 (2×3) or 9 (3×3) cards. Rows adapt to card heights. Each card has a number, name and price; empty photo frames show a camera placeholder and «с вашим фото». Header has the brand and the range «№ 01–09», footer has contacts and «стр / всего».
- «Печать каталога» = KS.print (vector). «Скачать PDF» = own jsPDF loop over `pageCanvasH2C` at 200 dpi. The app's `exportPDF` rasterises through pageSVG, which inlines every used web font: 18 families ≈ 170 MB, about 140 s per page here. `exportPDF` would also name the file `konvert-eksport.pdf`. Files: `katalog-otkrytok.pdf`, `konvert.pdf`.

## Store `st.ks.pcseries`
`{ori,cat,n,text,seed,fav[], c:{src,cat,ori,per,price,title,sub,extra,prices{},names{},off{}}, env:{…}}`. S() fills missing keys itself (KS.store without defaults creates an empty object).
`KS.pcseries = {list, makeVar, envPages, envOpen, catBuild, catItems, sel, photo}`.
