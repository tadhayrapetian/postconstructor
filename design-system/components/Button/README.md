# Button

The tool's one button: an amber primary `.btn`, a quiet `.btn.ghost`, and `.wide` to fill the row.

**Use** `.btn` for the single action that moves the user forward in a panel (Собрать пост, Сгенерировать новую палитру); `.btn.ghost` for everything else (lock, invert, upload, undo).

**Consumer provides:** the label, optionally led by one emoji glyph; a `.btns` row around groups of buttons (wraps, `space-ui-sm` gap).

- Primary: `ui-accent` fill, `ui-accent-text` label, 15px bold, 13 × 18 padding, `radius-ui-field`.
- Ghost: `ui-border` fill, `ui-text` label.
- Light theme note: `ui-accent-text` on `ui-accent` is 4.26:1, a source pair just under 4.5:1.
