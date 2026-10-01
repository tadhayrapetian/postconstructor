# Panel

A rounded `ui-panel` block that groups one step of the workflow under an uppercase amber heading.

**Use** one panel per step (1. Контент, 2. Макет, 3. Цвета…), stacked in the tool column with 18px between them.

**Consumer provides:** an `<h2>` heading (numbered when it is a workflow step) and the panel's rows, fields, hints and buttons as children. `.section` draws a `ui-border` rule to split a panel.

**Markup:** `<div class="panel"><h2>2. Макет</h2>…</div>` inside a `.pc-ui` root.

- Do keep one primary `.btn` per panel at most.
- Don't nest panels; split with `.section` instead.
- Max width is 560px (`preview-col`); padding `space-ui-xl`, gap `space-ui-sm`, radius `radius-ui-panel`.
