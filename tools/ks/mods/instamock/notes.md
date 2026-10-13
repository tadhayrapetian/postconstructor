# instamock — «Instagram → Мокапы» + local photo-mockup engine (`KS.instaMock`)

Local (no AI, no network, free, instant) engine that puts the owner's real designs into natural-looking product photos for
Instagram, in the same 9 named looks the «insta» module uses, plus the «Мокапы» sub-tab of the «Instagram» rail section.

Build (full): `cd $S && python3 ks/build13.py v24b.html <out.html> --mods photos,passport,pos,stats,home,stamps,postcard,nav,neuro,logo,ux,pcai,pcbatch,pcmock,pcseries,notebook,nbcover,nbextra,nbshop,vpdf,envth,instamock,insta`
Sources: `p1_core.js … p8_ui.js` → `bash make.sh` writes `mod.js` (+ syntax check) and `dev/engine.js` (engine only, for the dev
loop in `dev/`: `dev.html`, `shot.js`, `lab.js`, `perf.js`, `dump.js`). CSS `mod.css` (prefix `igm-`), data attributes `data-igm*`.
Tests: `node test.js [app.html]` (screenshots + every scene in `shots/`, output in `test_out.txt`). `fontmock.js` is a Google-Fonts
mock that returns only the requested families (the shared harness returns all ~50 families for every request, which makes the app's
font embedding take ~2 minutes; real Google Fonts behave like the mock).

## Files / parts
- `p1_core.js` helpers, seeded RNG, value noise + fbm, Safari-safe blur (box ×3 on a reduced premultiplied copy, no `ctx.filter`),
  homography, image cache, **LOOKS** (shared definition).
- `p2_surf.js` procedural surfaces (per-pixel / low-res fields + canvas detail): linen (real plain weave with per-thread slubs, creases),
  Carrara marble (turbulent domain-warped veins, halos, hairlines), kraft (fibres, flecks, cockle), wood planks (oak, walnut, birch,
  vintage desk; latewood lines, pores, seams), card paper, velvet, concrete (stains, pits), plaster/tadelakt (trowel relief); cached (≤3).
  Light pass (directional falloff + warm glow) and window light: window panes, leaf shadows, blinds, candle glow.
- `p3_obj.js` paper objects: 3-layer shadows (AO + contact + cast along the look's light), sheets (tooth, bend, lit/thick edges),
  envelopes (procedural or printed with the owner's envelope; closed back with layered flaps, front, open with liner + card inside),
  wax seals (irregular spill outline, rim bevel, pressed disc, embossed monogram, gloss; side wall in angled shots), notebooks
  (spiral / elastic, page block), die-cut stickers, vellum band, postage stamps + generated fallback, postmarks, ink imprints.
- `p3b_props.js` props: two-ply twine + bow, satin / linen / velvet ribbon + bow, eucalyptus, gypsophila, lavender, wheat, fern (green/dry),
  olive, bunny tails; capped fountain pen, pencil, cup from above (coffee/latte heart/stoneware), tealight, apricots, wax stick,
  wooden rubber stamp with the design on top, ink pad, gift box (+lid), confetti.
- `p4_engine.js` camera: scene drawn on a large table plane, then a pinhole camera (tilt, yaw, zoom, focus) samples it per row with
  depth of field (two blur levels), film **grade**, generated paper goods (postcard back, handwritten envelope/letter, quote card, covers).
- `p5_scenes.js` 31 scenes + `imRenderCanvas`. `p6_src.js` sources. `p7_api.js` public API. `p8_ui.js` the sub-tab.

## Public API (`KS.instaMock`)
- `looks()` → object keyed by id (`linen, marble, kraft, moody, apricot, nordic, vintage, pastel, botanic`), each
  `{id,name,desc,palette[5],surfaces[{k,c}],bot[],props[],env[],seal[],ink,twine,ribbon,pen,cup,light{ang,soft,str,warm,shade,glow,gobo,goboStr},
  grade{temp,tint,contrast,lift,fade,sat,grain,vignette,curve[[x,y]…5],split{sh,hi,amt},halation,bloom}}`. `look(id)` one copy.
- `scenes()` → `[{id,name,cat,catName,look:null,aspect:['1:1','4:5'],needs:[kinds],angled}]`; `cats()`, `props()`, `kinds()`.
- `sources({force,photos,photoMax,onProgress})` → `Source[]` (see below). Heavy rasters are cached by content.
- `render(src|src[]|dataURL, sceneId, {look, aspect:'4:5'|'1:1', size:1080|2160, seed, props:{seal,twine,flowers,pen,cup,ribbon,stamps,gobo},
  text, brand, mark, grade:false, gradeStrength, type, quality, canvas})` → JPEG dataURL (or canvas with `canvas:true`).
  Same seed → same picture; another seed → another variant in the same look. Postage-stamp sources in the list are used as props.
- `grade(dataURL|img|canvas, look, {strength, seed, type, max, canvas, override})` → graded JPEG dataURL (same size, ≤3000 px).
  Unknown look → linen. Order: highlight bloom / halation → white balance (temp/tint) + tone curve + contrast + lift + fade (LUT)
  → saturation → split toning → luminance grain (strongest in mid-tones) → vignette.
- `set9(srcs, look, opts)` → 9 `{scene,look,src,w,h,name}` (varied scene types, sources rotated). `pending()` → posts saved for the feed.
  `open()`.
- Events: `igmPosts` (posts sent/saved for the feed).

## Sources (`Source = {id,kind,name,src,w,h,sides?,thumb?,origin,postage?,mark?}`)
- current Типография design (`dzHTML` → app `pageCanvas` at ≥1800 px, front + back when it has one; round stickers cut to a circle);
  kind from the product (pc/post → postcard, card/badge/tag → card, invite → invitation, round/label → sticker, diploma/letterhead → letter);
- current envelope from «Конверты» (`envHTML`, size from `st.envMem` when the app is in Типография; guide lines removed; when the front has
  no postage stamp one is put into the stamp box for the photo — the envelope itself is not changed);
- rubber stamps (`rsSVG` of `st.rst` + stamp elements of the design; default shop stamps when none) — rasterized, white keyed out → transparent PNG;
- postage stamps (`postageSvg` of `st.postage`, else 3 Armenian ones; fonts embedded) — transparent, perforated (`postage:true`);
- TH mark (`KS.thSVG` monoword) — transparent (`mark:true`); notebook cover (`nb:cover` in IDB or `KS.nbCover.thumb`);
- uploads (IDB 'files' `igm:up:<id>` `{id,name,kind,src,thumb,w,h,added}`) and the 24 newest photo-library items (`ph:`).

## UI «Мокапы» (`KS.tab id:'igmock'`, group `insta`, seg «Мокапы», screen)
Registered on `boot` so the «insta» tabs (Лента, Стиль, Подписи) come first; without «insta» it creates the «Instagram» rail button
itself (before «Печать», Instagram glyph). Panel: 9 looks (palette strip), «Детали в кадре» (8 prop toggles), quote text + signature,
«Готовое фото» (JPG 1080 / 2160, «В мои фото», «В ленту»: `KS.insta.addPosts(posts)` when the insta module provides it, otherwise
IDB `igm:feed:<id>` `{id,src,name,look,scene,w,h,from:'instamock',added}` + event `igmPosts`; `KS.instaMock.pending()` lists them), «Сделать 9 мокапов в одном стиле». Screen: 4:5 / 1:1, big sticky preview with
«↻ Ещё вариант» + «Скачать JPG», sources gallery (multi-select with order numbers, upload button, drag & drop, kind select and delete
for uploads, «Обновить»), category chips + live scene thumbnails (rendered one by one, cached; scenes that fit the chosen sources first).
9-set view: 3×3 grid, progress, «Другие 9», «Все в ленту», «Скачать ZIP» (jszip via `loadLib`), «← К сцене». ⌘K: «Мокапы для Instagram»,
«9 мокапов в одном стиле». Design edits → sources re-collected when the tab is visible.
Store `KS.store('instamock')`: `{look,scene,aspect,props,sel,seed,text,brand,cat,kinds}` (no bitmaps). Look defaults to the insta module's look.

## Performance (sandbox, software canvas; GPU canvases on Mac/iPad are faster)
Flat scenes 1080×1350 ≈ 0.3–0.6 s; angled (camera + depth of field) ≈ 1.0–1.7 s; 2160 ≈ 3–5 s. Plane budget 4.2 MP (10 MP at 2160,
under iPad Safari's 16.7 MP canvas limit), surface cache ≤12 MP. Workers / OffscreenCanvas are not used (main thread with `setTimeout`
yields in the per-row loops), so it runs everywhere including iPad Safari.
First `sources()` in a session rasterizes 6–8 pages with embedded fonts (≈10 s with real Google Fonts); later calls are cached.

## Limitations
- Props are procedural illustrations kept small/soft (no photo textures); hands, glass and full 3D (e.g. a standing box) are not drawn.
- Angled shots warp the flat table plane: thick props (cups) are avoided in them; seals get a fake side wall.
- The envelope back from «Конверты» is the flat printed back; flap edges are drawn over it.
- 2160 renders of angled scenes take a few seconds.

## Integration with «insta» (agent A)
- Scene ids, look ids and `render(..., {grade:false})` / `grade()` are what `insta` calls; its MutationObserver + my boot-time
  registration keep the order «Лента · Стиль · Подписи · Мокапы».
- `insta` currently has no `KS.insta.addPosts`, so «В ленту» stores posts in IDB `igm:feed:*` (+ `igmPosts` event) — the «Лента» can
  import them with `KS.instaMock.pending()` (then `KS.idb.del('igm:feed:'+id,'files')`).

## Tests (both ALL OK)
- `node test.js` (standalone build) and `node test.js app_full.html` (with `insta`): API + 9 looks + 31 scenes contract; sources from a
  postcard made in Типография + envelope with a rubber stamp in «Конверты» (≥1600 px, cut-outs transparent, stamped envelope front);
  every scene × 2 looks (62 JPGs in `shots/scenes/`, sizes, not blank); seed determinism; 2160 × 2700; `grade()`; UI clicks (multi-select,
  look, scene, «Ещё вариант», props, 1:1, JPG 1080/2160 downloads, quote text, «В ленту», «В мои фото», upload via file chooser + kind
  change + drag & drop + delete, 9-set + ZIP with 9 JPGs + all to feed, ⌘K, refresh after a design edit), dark theme, iPad touch
  (taps, ≥34 px targets, no horizontal overflow), core (move + undo, print capture, mode switch). Screenshots: `shots/mac_light.png`,
  `mac_dark.png`, `mac_set9.png`, `mac_dark_set9.png`, `mac_quote.png`, `mac_upload_sticker.png`, `ipad.png`, `ipad_set9.png`.
- `bash ks/regress.sh app_full.html` and `app.html`: «no errors» ×4.
