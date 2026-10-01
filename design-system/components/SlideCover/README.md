# SlideCover

The first slide of every post: eyebrow, uppercase Atyan title with one highlighted word, italic subtitle, three accent dots.

**Use** as slide 1 (toggle «Обложка»).

**Consumer provides:** `eyebrow` (count + topic, e.g. «10 արտահայտություն»), the title, with `**word**` marking the word to put on a `.plate`, the subtitle, and an optional emoji above the eyebrow (76px).

- The title is `cover-title` (Atyan, 60px × `--covfs`); the eyebrow is `eyebrow` in `a0`; the subtitle is `translation` at 32px and 75% opacity.
- The plate fills with `a0` by default; the user can pick another colour. The plate's text is `bg`.
- The dots are always `a0`, `a1`, `a2`, in that order.
- Content is centred in a 90px inset (`space-slide-lg`).
