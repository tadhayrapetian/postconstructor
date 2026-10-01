# Swatches

A wrapping row of 44px rounded squares that shows the current slide palette in order: `bg`, `ink`, `a0`, `a1`, `a2`, `a3`.

**Use** under the palette controls, and again for favourites and manual editing.

**Consumer provides:** one `.swatch` per colour with its `background` set inline and a `title` naming the role and hex (Фон, Текст, Акцент 1–4).

- The border is a neutral `rgba(128,128,128,.3)`, so a swatch that matches the panel still shows.
- Pair the row with the contrast readout (`.hint`, left-aligned) for `ink` on `bg`.
