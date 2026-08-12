# Public screenshot brief

Place the seven final PNG files in this directory with the exact names below. README links are already prepared for these slots.

## Shared requirements

- Use Chrome at 100% zoom and a consistent 16:10 or 16:9 crop.
- Use a neutral demo project such as `acme-demo`; do not show real client or personal projects.
- Hide bookmarks, profile photos, email addresses, notifications, tokens, local personal paths, and paid source code.
- A paid product's public preview may be visible, but never show its proprietary code or an account-only download.
- Use the English interface for screenshots 01–06.
- Keep the side panel wide enough that labels and controls are not clipped.
- Prefer PNG at 1600 px or wider; do not add artificial browser mockup frames.

## Required files

### `01-project-setup.png`

Open the project settings. Show a sanitized selected folder named `acme-demo`, page `Landing Page`, route `/`, and **Create** mode. The saved-pages selector and **+ Project / + Page** actions must be visible.

### `02-source-capture.png`

Open a public component-library detail page with the Collector side panel. Show the pending source title/domain, semantic section type, position, implementation notes, enabled screenshot option, **Discard**, and **Add block**.

### `03-region-capture.png`

Use an ordinary public website or gallery. Show the visible rectangle-selection overlay around one section. An inset may show the resulting cropped preview expanded in Collector.

### `04-page-outline.png`

Show at least five ordered items, including at least one normal source and one **Visual reference**. Expand one item so its source link, notes, screenshot state, and preview are visible. Include reorder and remove controls.

### `05-finish-page.png`

Show the successful result card after **Finish page**, including a demo six-digit number and **Copy number**. The displayed path must contain only a sanitized demo path; no `/Users/<real-name>/...` path.

### `06-agent-skill.png`

Show Codex or Claude Code opened in the same demo project after the command `Collector 482731`. The response should visibly confirm the matching route, item count, source/reference split, and planned authorized-install/original-implementation decisions. Hide unrelated tasks and account data.

### `07-languages.png`

Create a clean contact sheet with five equal frames: EN, RU, FR, IT, and 中文. Use the untouched built-in project/page values so the frames visibly show `My Website / Landing Page`, `Мой сайт / Лендинг`, `Mon site / Page d’accueil`, `Il mio sito / Pagina di destinazione`, and `我的网站 / 落地页`. The bottom language switcher must be visible in every frame.

## Before committing

Inspect every image at 100% size. Search visible text for personal names, email, API keys, bearer tokens, private domains, filesystem paths, and customer data. Only sanitized documentation screenshots belong in the public repository.
