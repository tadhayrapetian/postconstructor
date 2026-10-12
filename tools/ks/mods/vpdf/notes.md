# Module `vpdf` — true vector PDF engine

Every PDF the app downloads is now a vector PDF: shapes, lines, borders, gradients, QR codes, barcodes **and text**
(text = glyph outlines taken from the very same web-font files, so the file needs no embedded fonts and looks the same
in every viewer, RIP and print shop). Raster stays raster only where it is a picture: photos / AI pictures / `<img>` /
CSS `url()` images (original data, full resolution, JPEG passed through untouched), soft shadows, procedural textures
(conic gradients, gradients whose transparency varies, SVG `feTurbulence` stamps) and the rare effect svg2pdf cannot draw.

Build with: `--mods photos,passport,pos,stats,home,stamps,postcard,nav,neuro,logo,ux,pcai,pcbatch,pcmock,pcseries,notebook,nbcover,nbextra,nbshop,vpdf`
(`vpdf` last is fine — it wraps app globals at load time and the other modules call them at click time).

## API
- `KS.vpdf.pdf(pages,{name,prog}) → Promise<Blob>` — pages are app page objects `{pw,ph,name,html,cls}` (`KS.page`),
  mixed sizes/orientations allowed; `prog(i,n)` before each page.
- `KS.vpdf.save(pages,name)` — builds and saves with `saveFile` + toast «PDF сохранён: …».
- `KS.vpdf.svg(page)` — the intermediate SVG of one page (debug). `KS.vpdf.stats()` — counters of the last run
  (`glyphs, images, symbols, rasterEls, rasterTex, rasterText, stdText, rasterPages, tp:[[prep,emit,svg2pdf,svgLen]…]`).
  `KS.vpdf.log()` — notes (fallbacks, skipped things). `KS.vpdf.debug(true)` logs to the console.

## Wiring
- **`exportPDF` is wrapped**: the app's export dialog «PDF», nbcover, nbextra (and anything else calling `exportPDF`)
  get the vector engine with the same `(pages,dpi,prog)` contract, the same file name
  (`pages[0].name` or `konvert-eksport`), `saveFile` (looked up at call time, so nbextra's temporary rename works)
  and the same toast. If the vector path throws, the original raster `exportPDF` runs and the toast says
  «PDF сохранён картинкой: векторный режим здесь не сработал».
- **Export dialog**: option `pdf` relabelled «PDF вектор — файл, точный размер», the hint explains it, the dpi select is
  hidden for it; «PDF через окно печати» (`vectorPDF`) is kept (wrap of `expInfo`).
- **Notebook** (`notebook/ui.js → nbDownloadPDF`): uses `KS.vpdf.pdf(outs.map(nbPrintPage))` (sheets or trim pages,
  as chosen in «PDF: Листы для печати / Страницы»); the old jsPDF path (`nbPDF`) stays as fallback.
- **Guard for modules with their own raster PDF** (pcseries catalog / envelopes): `pageCanvasH2C`/`pageCanvas` are
  wrapped to remember the page objects they rasterise; when `KS.download` gets a `.pdf` whose page count and MediaBox
  sizes match the last rasterised pages (≤15 min), the PDF is rebuilt with the vector engine (falls back to the original
  blob on any error).

## Engine (per page)
1. **Mount** the page HTML offscreen in the live document (`.printing <cls>` host, opacity 0) so the browser lays it
   out with the real fonts; wait for `document.fonts.load()` of every used face/text and for images.
2. **Prepare**: parse `@font-face` rules (CSSOM; cross-origin Google Fonts sheet fetched as text; user fonts from
   `st.fonts`), pick the face per character exactly like CSS (family list → style → weight → `unicode-range`, glyph
   presence; generic `monospace/sans-serif/serif/cursive` → PT Mono / PT Sans / PT Serif / Caveat), load the font files
   with **fontkit** (WOFF2/WOFF/TTF; cached by URL; glyph outlines cached per font+glyph). Images: data URLs kept as is;
   other formats/URLs converted; CSS `filter` on images baked into pixels (grayscale/sepia/saturate/hue-rotate/brightness/
   contrast/invert/opacity — works in Safari, no `ctx.filter`); SVG images (`<img>`, `<image>`, CSS `url()`) are mounted live
   and converted as **vector**.
3. **Emit** one SVG per page in CSS px: HTML boxes → paths (background colour, linear/radial/repeating gradients,
   per-side borders incl. dashed/dotted/double/collapsed table borders, outline, border-radius, `overflow` clips, CSS `clip-path`
   shapes), CSS transforms (removed while measuring, re-applied as `matrix()` about `transform-origin`), opacity,
   grayscale filter (`.gray .page`) as colour mapping, `background-clip:text` (gradient-filled glyphs), box/text/drop
   shadows as small raster underlays beneath vector content. Inline SVG is re-serialised with computed paints
   (`currentColor`, CSS classes resolved), ids namespaced, nested `<svg>`/`use`/`symbol` flattened, `vector-effect:
   non-scaling-stroke` honoured, `<pattern>` tile offsets fixed for svg2pdf, grid/ruled patterns expanded to long lines
   (no tile seams).
   **Text**: HTML — every character's pen position comes from `Range` rects (identical to the screen layout, incl.
   justify, letter-spacing, kerning), the baseline from a per-font probe, glyphs from fontkit (`text-transform`,
   ligatures off when letter-spacing ≠ 0, synthetic bold/italic, underline/line-through from font metrics, `text-overflow:
   ellipsis`, `-webkit-text-stroke`). SVG `<text>` — exact layout from the font (x/y/dx/dy, `text-anchor`,
   `dominant-baseline`, `letter-spacing`, `textLength` both modes, tspans with own fonts/fills); `textPath`, `rotate`
   and per-glyph position lists use the browser's `getStartPositionOfChar/getRotationOfChar`.
   Characters no web font has: common dingbats (★☆✦✓✔✕✖✗✂✉♥●○■□▲▼►◄◆◇→←☐☑☒) are drawn from built-in vector outlines;
   anything else (emoji, ☎) → Latin-1 as standard PDF text, other scripts as a tiny 576-dpi raster of that run.
4. Effects svg2pdf cannot draw (CSS filters other than grayscale/drop-shadow, CSS masks, SVG `filter`/`mask`,
   gradients with varying alpha) → that element only, already serialised by the engine (text outlined), rendered as a
   standalone SVG image at 300 dpi (600 dpi for `feTurbulence` textures) — no foreignObject, no font embedding.
5. **svg2pdf.js** draws the SVG into **jsPDF** (unit pt, exact `pw×ph` page per page, compressed, only used fonts).
   Multi-stop linear gradients are split into exact bands (jsPDF samples shadings at 21 points). A page that svg2pdf
   fails on is replaced by a 300-dpi raster of that page only (the rest stays vector).

## Libraries (lazy)
- jsPDF 2.5.1: `loadLib` from cdnjs (as the app).
- svg2pdf.js 2.8.1 UMD: `https://cdn.jsdelivr.net/npm/svg2pdf.js@2.8.1/dist/svg2pdf.umd.min.js` (unpkg fallback).
- fontkit 2.0.4 ESM: `import('https://cdn.jsdelivr.net/npm/fontkit@2.0.4/+esm')`.
- Local copies for the offline harness: `$S/cdn/svg2pdf.umd.min.js` (npm dist) and `$S/cdn/fontkit.esm.js`
  (`npx esbuild node_modules/fontkit/dist/browser-module.mjs --bundle --format=esm --minify --platform=browser`);
  tests serve them by mocking `cdn.jsdelivr.net`.

## Tests
`node test.js` (≈4 min): builds the app, exports through the real buttons (export dialog «PDF» for a business card
with photos/QR/barcode/Armenian/shadows; notebook «Скачать PDF» sheets + trim pages, Armenian title/grid/month/dots;
nbcover «Скачать PDF»; nbextra stickers; pcseries catalog via the guard; a feature page; 100-page notebook), checks
every PDF with `verify.py` (pypdf: no text operators, no fonts, path operators per page, images and the share of the
page they cover, exact page sizes), renders with `pdftoppm` and compares with browser screenshots of the same pages
(`cmp.py`, mean diff on lightly blurred images; side-by-side + overlay PNGs in `out/*-cmp-*.png`), fallbacks (no
fontkit, no svg2pdf), dark/iPad dialog screenshots, basic app regression. Fixtures: `fx_card.js`, `fx_features.js`.

## Known limits
- Fonts must be fetchable (CORS) — Google Fonts and data-URL user fonts are. Where `fetch` to the font host is
  blocked (strict CSP), text falls back to standard PDF fonts (Latin-1) / small rasters; everything else stays vector.
- Text is outlines: not selectable/searchable in the PDF.
- `mix-blend-mode`, `backdrop-filter` are ignored (drawn normally); CSS masks render via the raster path; pseudo-element
  generated content (`::before/::after` text) and list markers are not drawn (the app's pages use none).
- Gradients with varying transparency and conic gradients are high-res raster textures (PDF soft masks are not available
  in jsPDF). SVG gradients with >2 stops go through jsPDF's 21-sample shading (slight approximation).
- `<img>` of SVG and CSS SVG backgrounds are drawn with document fonts (the browser draws SVG-as-image without web fonts),
  so text inside such pictures can look *better* than on screen.
- On Linux Chrome (integer glyph advances) letter positions follow the screen exactly; on Mac/iPad they are fractional.
