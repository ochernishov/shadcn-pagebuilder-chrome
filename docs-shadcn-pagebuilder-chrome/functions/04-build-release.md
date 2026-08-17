# 4. Сборка и релиз

> **Статус:** ✅ работает
> **Зависимости:** [01-extension](01-extension.md), [02-native-host](02-native-host.md), [03-shadcn-collector-skill](03-shadcn-collector-skill.md) — упаковывает все три

## Назначение

Скрипты, превращающие исходники (`extension/`, `native-host/`, `skills/`) в
самодостаточный Chrome-бандл и релизный архив, и устанавливающие/удаляющие
Native Host локально.

## Архитектура

- `scripts/build.mjs` — читает `.env`, подставляет токены шаблонов
  (`manifest.template.json`, `config.template.js`), копирует статику в
  `dist/extension/`.
- `scripts/install-host.mjs` / `scripts/uninstall-host.mjs` — регистрируют
  Native Messaging host в системе (ID выводится из `EXTENSION_PUBLIC_KEY`),
  ставят/убирают `skills/shadcn-collector/` в каталоги Codex/Claude Code.
- `scripts/package-release.mjs` — собирает релизный архив.

## API / Интерфейс

CLI через `npm run build | install:host | uninstall:host | package | setup`.

## Данные

Не хранит пользовательские данные; читает только `.env` и исходники репозитория.

## Конфигурация

Все переменные `.env.example` — единственный источник конфигурации сборки.

## Последние изменения

- **2026-08-18** — файл заведён при аудите документации (модуль уже существовал).
