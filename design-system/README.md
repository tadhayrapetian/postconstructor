Post Constructor makes bilingual Instagram carousels: an English phrase on top, its Armenian translation beneath, one idea per slide, 1080 × 1350. The system has two layers. **Slides** are the product: a cream-and-ink page, a generated accent pair, Armenian display type. **Tool chrome** is the warm-dark workbench around them, built to stay out of the slide's way.

## Content fundamentals

- **Two languages, fixed roles.** The English phrase is the subject (`phrase`, Montserrat arm 800); the Armenian line is the gloss (`translation`, DM Serif Display Italic). Never swap their styles.
- **Armenian leads the brand voice.** Cover titles, the follow slide and CTA copy are written in Armenian: «Հավանեցի՞ր փոստը», «Հետևիր, որպեսզի բաց չթողնես նոր և օգտակար գրառումները». The tool's own interface is in Russian, informal *ты*: «Пришли скриншот с цветовыми плашками — я сама распознаю основные цвета».
- **Casing.** Cover titles, eyebrows, tags and labels are UPPERCASE with wide tracking (`eyebrow` .22em, `tag` .16em, `label` .12em). Phrases and translations keep sentence case and their own punctuation (Armenian full stop `։`).
- **Numbers are zero-padded** (`01`, `02`) and set in `number` (Atyan Dsegh) in the item's accent. Page counters read `3/10`.
- **The handle closes every slide** bottom-left in `handle`; the page counter sits bottom-right in `page`.
- **Highlight one word** on a cover by wrapping it in `**…**`: it becomes a `.plate`, a solid block behind the word.

## Visual foundations

### Slide colour is generated, not chosen

Each post gets a fresh six-colour palette from one base hue, so the tokens `bg`, `ink`, `a0`–`a3` describe *roles*. The values shown are one reference generation (hue 28, in the light and dark moods).

- `bg` is near-white with a trace of the hue; `ink` is the same hue taken nearly black. Body text is always `ink` on `bg`, `a2` or `a3`.
- `a0` is the signature accent: eyebrows, numbers, dots, plates, the card's left border. `a1` comes from the scheme's second hue and alternates with `a0` item by item through `--acc`. Use `a1` as a fill or a mark, not as small text: the generator does not guarantee its contrast.
- `a2` and `a3` are pale tints for striped rows and soft fills; text on them stays `ink`.
- `paper` (#fffdf8) is fixed card stock for cards, tiles, steps and stickers, so a card reads as a card on any palette.
- Schemes: analogous ±35° with a complement, triadic, or split-complement. Moods shift saturation and lightness: pastel, vivid, earthy, mono, dark (dark mood swaps `bg` and `ink` lightness).
- The tool checks `ink` on `bg` live against WCAG AA and AAA. Keep that pair at 4.5:1 or better before exporting.

### Type

- `display` (Atyan Dsegh) is the brand face: a single-weight Armenian display, used only for cover titles (`cover-title`) and item numbers (`number`).
- `sans` (Montserrat arm, 400–900) does everything else on a slide. Weight carries hierarchy: 900 for poster phrases, 800 for card phrases, 700 for labels and handle, 600 for counters, 500 for supporting lines.
- `serif` (DM Serif Display Italic) is used only for the translation and the cover subtitle. It is the one soft note on the slide.
- Slide sizes scale together through `--fs` (content) and `--covfs` (cover, 60–150%).
- The chrome uses the system UI stack (`ui`) at 15/1.5, with `mono` for the phrases textarea.

### Space, shape, depth

- Slides are generous: insets of `space-slide-sm` (64), `space-slide-md` (74) or `space-slide-lg` (90), with content centred vertically between the tag and the footer.
- Radii grow with the object: `radius-slide-tile` 24 → `radius-slide-card` 32 → `radius-slide-sticker` 36; pills use `radius-pill`, dots and avatars 50%.
- Depth is a soft, low black shadow (`shadow-card`, `shadow-sticker`, `shadow-tile`, `shadow-step`), only under `paper` surfaces. Poster templates use no shadow at all: rules in `currentColor` and colour fields do the work.
- Rules are `currentColor` (2px between items, 1px above the footer) or `rgba(0,0,0,.14)` on paper.

### Tool chrome

- Warm dark by default (`ui-bg` → `ui-panel` → `ui-input`, each a step darker or lighter), amber `ui-accent` for the one primary action per panel and for panel headings. The light theme keeps the same structure in cream and rust.
- Panels are `radius-ui-panel` with `space-ui-xl` padding and a `space-ui-sm` rhythm; fields and buttons share `radius-ui-field`.
- One primary `.btn` per panel (Собрать пост, Сгенерировать новую палитру). Everything else is `.btn.ghost`.
- Field borders (`ui-border`) are below 3:1 against the panel in both themes, a source value. The field's darker or whiter fill is what shows its edge. Add a stronger border if you build new controls that sit directly on `ui-panel` with no fill.
- No custom focus ring is defined: the source relies on the browser default. Keep it.

## Iconography

- There is no icon set. Chrome buttons lead with an emoji glyph (🎲 Сгенерировать, 🔒 Закрепить, 🌗 Инвертировать, 📁 Загрузить, ↩ / ↪ undo/redo, ← / → slide nav). Keep to one glyph per label, at the start.
- On slides, the only icons are the follow slide's social chips: inline 48 × 48 SVG paths filled with `a0`. They are not extracted here.
- Decoration is made of shapes, not pictures: dots (`.dots`, three circles in `a0`, `a1`, `a2`), plates, bars and rules.
- There is no logo. The brand mark is the handle `@tadhayrapetian` set in `handle` and the author avatar on the follow slide.

## Not synced

- Slide templates: 4 of 27 have cards here (cover, card, editorial, pills). The other 23 (badge, frame, bubble, tab, ticket, grid, ledger, list, timeline, ladder, checklist, numbered, stack, underline, bignum, hero, marker, split, duotone, newspaper, corner, diagonal, sidebar, stamp) and the CTA and follow slides live in `build.py` `TEMPLATE_CSS` and `buildSlides`.
- The follow-slide social icons and the author avatar (embedded PNG) are not copied.
- `.tplbtn` (the template tile grid) is styled in the source but no longer rendered, so it has no card.
- Components are static renditions in plain HTML and CSS: the app has no component library to bundle.
