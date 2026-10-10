# pcai — ИИ для открыток (тексты, фон, качество фото)

Depends on: `neuro` (KS.neuro.text / edit / settings / hasKey), works with `postcard`. Build after them:
`--mods photos,passport,pos,stats,home,stamps,postcard,nav,neuro,logo,pcai`. Test: `node ks/mods/pcai/test.js` (Gemini mocked in the real generateContent format).

## 1. Текст-поздравление
- Entry points: toolbar `KS.tool` «Текст ИИ» (`#kst-pcai`), card «Тексты и фото с ИИ» injected into the «Открытки» panel
  (MutationObserver re-attaches it after the postcard module rebuilds its panel), inspector section `pcai-t` for text elements, ⌘K command.
- Modal `#ksm-pcaiText`: повод (16 + свой), кому (datalist), имя, тон (5), длина (3), язык (ru/hy/en), «что упомянуть».
- With a key: `KS.neuro.text(prompt,{json:true})` → `{"variants":[{title,text}]}` (parser also accepts arrays / fenced JSON).
  «Ещё варианты» sends previous texts as «do not repeat». Errors (429, bad key…) show the message + library fallback.
- Without a key: «Подключить Gemini» banner (opens neuro settings above the dialog) and variants from the offline library
  `PA_LIB` (51 ru, 17 hy, 17 en; scored by occasion + tone; name is prefixed). Settings saved in `KS.store('pcai')`.
- «Вставить»: (a) the text element the dialog was opened for / selected → text replaced, size shrunk to fit (never grows);
  (b) postcard (pcH/pcV) → back side: replaces the message text (`pcMsg`) or adds a new script box in the message area
  (left half on pcH, under the heading on pcV, avoiding other elements), writing lines under it get `hide:true`;
  (c) other products → new centred text box. Then switches to Макет and selects it. Font: Marck Script (Great Vibes for short English).

## 2. Убрать фон / 3. Качество для печати (inspector sections `pcai-bg`, `pcai-q` for img, not logos)
- Background: `KS.neuro.edit(src, '...pure white background')` → local cutout: border flood fill over near-white
  (so white inside the subject stays opaque), smooth alpha ramp, 1px feather, un-premultiply despill → PNG.
- Quality: effective dpi = image px / printed mm (object-fit cover/contain/fill and zoom `z` respected). Badge
  ok ≥ 250, warn 150–249, bad < 150. Under 250: «Улучшить (Gemini)» (`edit(...,{big:true})`) and «Улучшить без ИИ»
  (2× high-quality resample, max 3600 px, unsharp mask; PNG kept if transparent). Shows «Было N dpi → стало M dpi».
- Originals: same idb approach as watercolor — `KS.idb 'files'` key `'wc:'+e.wcOrig` (reuses `e.wcOrig`, so the
  existing «Вернуть фото» buttons of postcard/neuro also restore it).

## Element properties added
- text: `pcMsg:1` (message text placed by pcai), `pcMax` (max pt for refits); line: `pcaiHid:1` (hidden by pcai).
- img: `aiCut` (length of the cut-out src — shows «Фон убран» while unchanged), `aiUp:{d0,n}` (dpi before, length of upscaled src).
- API: `KS.pcai={open,lib,parse,cutout,upscale,dpi,insert}`.
