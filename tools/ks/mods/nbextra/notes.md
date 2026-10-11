# nbextra — «Блокноты» → «Аксессуары»

Sub-tab `nbextra` of group `notebook` (rail «Блокноты», `before:'prep'`, `screen:true`). CSS prefix `nbx-`.
Works alone (own size + binding pickers) and with `notebook`, `nbcover`, `nbshop`.

## What it makes (all vector: one SVG per A4 sheet, mm units, via `KS.page`/`KS.print`)
| kind | content |
|---|---|
| `div` Разделители | N sections (months / subjects / weekdays / numbers / custom), staggered tabs side or top, theme colours, month mini-calendar, punch guides for rings (Filofax 6-hole), discs (mushroom), spiral 4:1, Wire-O 3:1; tab outline = cut line |
| `stk` Наклейки | checkboxes, flags, date covers 1–31 + months, weather, habits, «Важно», birthdays, numbers, arrows, washi strips; ru/hy/en; pink kiss-cut outlines (toggle); «заполнить лист» |
| `bm` Закладки | ribbon (swallow-tail, tassel hole), magnetic fold, corner (die-line + glue flap), ruler (exact 1 mm ticks) |
| `pk` Кармашки | back pocket with thumb notch, envelope, business-card pocket, pen loop (Ø 10–16) — cut solid / fold dashed / glue hatched |
| `lb` Этикетки | school «Тетрадь для работ по … ученика(цы) … класса … школы», owner, «Если найдёте» (+reward), spine (width = `KS.nb.spineMM()`, min 4 mm) |
| `rf` Сменные блоки | A5/A6/Personal/Pocket rings, A5/Half-Letter discs, Traveler's + passport (saddle booklet imposition), Hobonichi (3.7 mm grid), «как в блокноте»; pages lined/grid/dots/blank/todo/week + every `KS.nb.types()` page type via `KS.nb.typeSVG()`; duplex (backs mirrored, holes on the other edge); G3410 → «Лицевые»/«Обороты» buttons (+ reverse option) |
| `ps` По списку | paste / CSV (utf-8 or cp1251) / XLSX (app's `loadXLSX`) list; header detection (имя/фамилия/класс/предмет/школа/телефон); per name: title page «Этот блокнот принадлежит», label (owner/school/found), cover via `KS.nbCover.forName(name)` → one print job (titles, then labels, then covers); preview grid + progress bar |
| `gf` Подарок | belly band (2·w + spine + 15 mm glue; split in two strips when > 272 mm), gift tag, thank-you card 152×102 (2 per A4), care card |

Printer: everything sits inside the GX4040 5 mm border. Leaves that must reach the sheet edge (refills, title pages)
get content insets computed per cell (`place()` safe edges); cut ticks are drawn outside the grid, or right on the cut
line at the printable edge when there is no room.

## Store `KS.store('nbextra')`
`kind, theme, lang, qk{kind:qty}, size('nb'|fmt), bind, spine, holes (custom mm list), discPitch, logo,
div{src,n,custom,pos,tint,one}, stk{groups,kiss,fill}, bm{type,text,sub}, pk{type,loop}, lb{type,subj,cls,school,name,girl,phone,reward},
rf{fmt,page,sheets,step,duplex,rev}, ps{text,title,label,lkind,cover}, gf{type,brand,text,msg,bandH}`.

## Integration
- Reads `KS.nb.get()` (w, h, binding, title, owner, year), `KS.nb.spineMM()`, `KS.nb.types()/typeSVG()`; listens to `nbChanged`, `nbCoverChanged`.
- «В заказ блокнота» appears when `KS.nbShop` has `jobs()` (or `addExtra()`): pick a job in a modal → item pushed to `job.nbx[]`
  (`{id,kind,name,qty,unit,sheets,paper,theme,settings,added}`), a line appended to the linked order note, event `nbExtraAdd` emitted.
  If nbshop later exposes `KS.nbShop.addExtra(item)`, it is used instead.
- «Скачать PDF» uses the app's `exportPDF(pages,300)` (file name per kind, e.g. `etiketki.pdf`; `saveFile` is wrapped only during the call). Vector PDF: «Печать» → «Сохранить как PDF».
- API `KS.nbExtra = {build, pages(kind), print, parse, pack, holes, kinds, themes}`. ⌘K: «Аксессуары для блокнотов» + one command per kind.

## Tests
`node test.js [app.html]` — 70 checks with real clicks/typing (all 8 kinds, every sub-type, themes, languages, qty,
print capture via `runPrint` override, manual duplex, PDF download, 5 pasted names → titles+labels(+covers) sheet count,
CSV + XLSX import, order attach, ⌘K, reload persistence, dark, iPad touch + no horizontal overflow, core app smoke).
Passes on the full build and on `--mods postcard,nbextra` (siblings stubbed in the test only). `regress.sh`: 4× no errors.

## Limitations / to verify with the owner
- Punch positions are typical values, not measured: Filofax gaps A5 19/19/70/19/19, Personal 19/19/26/19/19, A6 19/19/32/19/19,
  Pocket 5×19; disc pitch 21.6 mm (editable). The «Свои отверстия» field overrides them.
- Dividers larger than A4 printable area (A4 notebooks) are scaled down with a warning.
- Sticker set with all groups fills one A4; school label text is Russian only.
- XLSX needs internet (cdnjs) like the rest of the app; CSV works offline.
