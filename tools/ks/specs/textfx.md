# Module `textfx` — эффекты текста
Inspector section for `text` elements «Эффекты текста» (`KS.insp`), plus a gallery of style presets.
Features (all must render in the live layout, in print (`#printRoot`), and in PNG export; check both export paths `pageCanvas` and `pageCanvasH2C`):
- **Обводка**: colour (palette roles or custom) + width in mm; draw outside the letters (paint-order stroke or layered text-shadow technique — pick what prints well in Chrome and Safari).
- **Тень**: offset X/Y, blur, colour, opacity (the app has a simple `shadow` boolean — extend, keep backward compatibility).
- **Свечение / Неон**, **3D-объём** (stacked shadows, direction + depth), **Тиснение**, **Контур** (hollow letters).
- **Градиентный текст** (two palette colours + angle) and **Золото/Серебро/Бронза** metallic gradients. Make sure it prints even when the print root has the `nobg` class (background printing off) — test.
- **Текст по дуге / по кругу**: curvature slider −100…100 and «Полный круг» for round stickers/stamps (render with inline SVG `<textPath>` using the element's font, size, colour, letter-spacing; keep it in mm). Inline editing (double-click) must still work — e.g. temporarily show straight text while editing, or route editing to the inspector textarea.
- **Вертикальный текст** (writing-mode), регистр Aa/АА/аа, **«Вписать в рамку»** button (find the largest font size that fits the box without overflow).
- **Плашка** (exists: `fill`) — add padding, radius, opacity controls if missing.
- **Пресеты стилей** with live mini previews using the element's own text: Неон, Ретро 3D, Контур, Наклейка (thick white outline + shadow), Золото, Серебро, Мел, Штамп (rotated, rough-ish, outline), Мягкая тень, Глянец, Комикс (bold outline + offset shadow). One tap applies; «Сбросить эффекты».
- **Мои стили**: save the selected text's style (font, size, weight, colour, effects) under a name (`KS.store('textfx').styles`), apply to any text, delete.
Store effects in `e.tfx={…}` (document fields). Wrap `dzElHTML` to render. Keep performance OK with 40+ text elements.
Tests: each effect renders (DOM/CSS checks), arc text shows SVG with correct text, print capture contains effects, PNG export pixels show the outline/gradient (sample), inline edit still works on normal and arc text, undo, presets, my styles persist after reload; screenshots of a showcase card with several effects in light/dark and on iPad width.
