# SlideCard

One phrase per slide on a `paper` card that floats over the slide background, with a coloured left border.

**Use** when every phrase deserves its own slide (the default template, «Карточка с тенью»).

**Consumer provides:** the tag (eyebrow text), and per slide the English phrase, the Armenian translation, the item number, the handle and `i/total`.

- `--acc` alternates `a0`, `a1` per slide; it colours the number, the 9px left border and the «Հայերեն» label.
- Card: `paper`, `radius-slide-card`, `shadow-card`, 56 × 50 padding. Phrase `phrase` (800, 40px); translation `translation`.
- In the dark mood `ink` is near-white on `paper` (1.1:1), a source issue: prefer a light mood for this template.
