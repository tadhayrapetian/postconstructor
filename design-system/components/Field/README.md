# Field

Labelled text input, select and textarea rows, all inset in `ui-input` with a 1px `ui-border` edge.

**Use** a `.row` with a fixed 120px `ui-muted` label on the left and the control filling the rest. The phrases textarea stands alone, full width, in `mono`.

**Consumer provides:** the `<label>` text and the control (`input[type=text]`, `select` with `optgroup`s, `input[type=range]`, `input[type=color]`, or `textarea`). Controls must sit inside a `.panel`, which scopes their styles.

- Selects are 600 weight; `optgroup` labels are `ui-accent` at 13px.
- The textarea's minimum height is 170px; resize is vertical only.
- Field borders are below 3:1 against the panel (a source value): the fill shows the field's edge.
