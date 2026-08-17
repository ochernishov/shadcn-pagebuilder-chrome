# Project instructions

🟢 **Стадия: РАЗРАБОТКА** — заказчиков и чужих данных нет. Рабочий сервер проекта
**и есть стенд**: тесты, миграции и сквозные прогоны делаются на нём, отдельный
staging не заводится. Переход в боевую стадию объявляет владелец — с этого дня
правки прямо на сервере запрещены, появляется стенд и релизный цикл.

⚖️ **Закон разработки — [RootDev.md](RootDev.md). Прочитать до первой правки:**
архитектура и границы доменов, инфраструктура и CI/CD, безопасность данных,
git flow, журнал решений. Отклонения проекта — секцией внизу того же файла;
отклоняться без записи и ADR нельзя.

⛔ **Сам `RootDev.md` не редактируется** — текст закона один на все проекты COS и
меняется только по согласованию с владельцем (правкой, автоформатом, линтером —
никак). Всё проектное живёт в производных: `docs-<проект>/memorandum.md`,
`architecture.md`, ADR и этот файл.

⚠️ **Параллельно могут идти другие сессии** — в этом проекте и в соседних: перед
правкой смотреть `git status` и чужие ветки, быть аккуратным.

## Scope

Shadcn Page Collector consists of a Chrome Manifest V3 extension and a local Node.js Native Messaging host.

## Commands

- Build: `npm run build`
- Tests: `npm run check`
- Native Host: `npm run install:host` (the ID is derived from `EXTENSION_PUBLIC_KEY`)

## Conventions

- Never add paid Shadcn Blocks source code or credentials.
- Read configurable names, host patterns, and export paths from `.env`.
- `extension/` is the source; `dist/extension/` is generated and must not be edited manually.
- Preserve Chrome Manifest V3 compatibility and never add remote code.
- Update `README.md`, `CHANGELOG.md`, and `docs/ARCHITECTURE.md` after meaningful behavior changes.
- Keep `skills/shadcn-collector/` compatible with both Codex and Claude Code; validate it after edits.
- Keep all user-facing strings in `extension/i18n.js`; English is the default locale.
- Store stable `typeKey` values instead of localized labels in block data.
- Keep public documentation screenshots as numbered lowercase JPEG files and synchronize `docs/screenshots/images.manifest.json` after every replacement.
- Never commit `.env`, `dist/`, paid block source, or fonts without a permissive redistribution license.
