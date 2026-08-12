# Public screenshot brief

Place the 13 final JPEG files in this directory with the exact names below. The root README already lists these slots. [`images.manifest.json`](images.manifest.json) is the source of truth for filenames, readiness, placement, and intended content.

## Shared requirements

- Save every file as JPEG with the lowercase `.jpg` extension. Do not use `.jpeg`, `.png`, or camera-generated filenames.
- Use Chrome at 100% zoom. Prefer a full-resolution 16:10 or 16:9 frame at least 1600 px wide; the language contact sheet may use a wider canvas.
- Use a neutral demo project such as `acme-demo`; do not show real client or personal projects.
- Hide bookmarks, profile photos, email addresses, notifications, tokens, local personal paths, private domains, and paid source code.
- A paid product's public preview may be visible, but never show its proprietary code or an account-only download.
- Use the English interface for screenshots 01–12.
- Keep the side panel wide enough that labels and controls are not clipped.
- Do not add artificial browser mockup frames, arrows, annotations, or decorative captions to the source JPEGs.
- Keep one continuous demo scenario: project `acme-demo`, page `Landing Page`, route `/`, task `Create`, and Collector number `482731`.

## Required files

### `01-workflow-modes.jpg`

Show the full top of the side panel immediately after opening the extension. The application title and both **Page** and **One block** tabs must be visible, with **Page** selected. Include the beginning of the project-settings card so the relationship between workflow and setup is clear.

### `02-project-settings-expanded.jpg`

Open project settings. Show the saved-pages selector, **+ Project**, **+ Page**, a selected demo folder ending in `acme-demo`, page `Landing Page`, route `/`, and **Create** intent. Every label and button must fit inside the panel.

### `03-project-folder-picker.jpg`

Click **Choose folder** and capture the native macOS folder picker with `acme-demo` selected once. Crop or redact the Finder sidebar, real username, recent folders, cloud accounts, and any client names. The dialog's choose/confirm action must be visible.

### `04-project-settings-collapsed.jpg`

After choosing the folder, collapse settings. Show the compact summary with demo project, page, route, and **Create** intent. Directly below it, show `Landing Page` plus the **Add current page** and **Add screenshot** buttons, demonstrating that page creation remains the primary workspace.

### `05-chrome-shortcut-settings.jpg`

Open `chrome://extensions/shortcuts`. Show only the **Shadcn Page Collector** card and **Capture the active page** command with `Command+Shift+K` assigned. Hide other extensions and any Chrome profile information.

### `06-website-access-permission.jpg`

Show Chrome's website-access request caused by the first explicit **Add current page** or **Add screenshot** click. The screenshot must make clear that access is requested by the user's capture action. Do not include unrelated permission prompts or browser-account data.

### `07-source-capture.jpg`

Open a public component-library detail page with the Collector side panel. Show the pending source title/domain, semantic section type, position, implementation notes, enabled screenshot option, **Discard**, and **Add block**.

### `08-region-screenshot-selection.jpg`

Use an ordinary public website or gallery. Show the visible rectangle-selection overlay around one section. An inset may show the resulting cropped preview expanded in Collector.

### `09-page-outline-editing.jpg`

Show at least five ordered items, including at least one source block and one **Visual reference**. Expand one saved item so its source link, editable implementation-notes field, save action, screenshot state, and preview are visible. Include reorder and remove controls.

### `10-single-block-mode.jpg`

Switch to **One block** and prepare a standalone item. Show its source, semantic type, implementation notes, optional screenshot preview, and **Copy for agent** action. The page collection must not appear changed in this mode.

### `11-finish-page.jpg`

Show the successful result card after **Finish page**, including a demo six-digit number and **Copy number**. The displayed path must contain only a sanitized demo path; no `/Users/<real-name>/...` path.

### `12-agent-skill.jpg`

Show Codex or Claude Code opened in the same demo project after the command `Collector 482731`. The response should visibly confirm the matching route, item count, source/reference split, and planned authorized-install/original-implementation decisions. Hide unrelated tasks and account data.

### `13-languages.jpg`

Create a clean contact sheet with five equal frames: EN, RU, FR, IT, and 中文. Use the untouched built-in project/page values so the frames visibly show `My Website / Landing Page`, `Мой сайт / Лендинг`, `Mon site / Page d’accueil`, `Il mio sito / Pagina di destinazione`, and `我的网站 / 落地页`. The bottom language switcher must be visible in every frame.

## Before committing

Inspect every image at 100% size. Search visible text for personal names, email, API keys, bearer tokens, private domains, filesystem paths, and customer data. Only sanitized documentation screenshots belong in the public repository. After adding or replacing a JPEG, change its manifest status from `missing` to `final` and record its source.
