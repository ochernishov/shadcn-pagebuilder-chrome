# 1. Chrome-расширение

> **Статус:** ✅ работает
> **Зависимости:** [02-native-host](02-native-host.md) (экспорт), [03-shadcn-collector-skill](03-shadcn-collector-skill.md) (потребитель пакета)

## Назначение

Manifest V3 расширение: собирает факты о просматриваемой странице (URL, заголовок,
хостнейм, выделенный текст, время захвата, заметки пользователя) и скриншоты в
упорядоченную спецификацию страницы, без классификации подписок и без
самостоятельной генерации кода. См. [ADR-0001](../adr/0001-mv3-extension-native-host-local-first.md).

## Архитектура

- `background/service worker` (`extension/collector-worker.js`) — команда
  `capture-block`, контекстное меню, обработка `activeTab`/`scripting`,
  инъекция overlay для ручного захвата области скриншота.
- Side panel (`extension/panel.html` + `extension/panel.js`) — два независимых
  режима: `page` (текущая спецификация страницы + экспорт через Native Host) и
  `single` (один подготовленный автономный блок, копируется в буфер обмена как
  структурированный JSON + опционально PNG).
- `extension/i18n.js` — единственный источник строк интерфейса (EN/RU/FR/IT/ZH).
- `extension/config.template.js`, `extension/manifest.template.json` — шаблоны,
  заполняемые сборкой из `.env`.

## API / Интерфейс

Публичного HTTP API нет — расширение общается с Native Host через Chrome Native
Messaging (`chrome.runtime.connectNative`) и передаёт действия `choose-directory`,
`export`.

## Данные

- `chrome.storage.local` — текущая спецификация страницы, черновики режимов
  `page`/`single`, выбранный каталог проекта.
- Экспортируемые данные (JSON/Markdown/PNG) владеет Native Host — расширение их
  не хранит после успешного экспорта.

## Конфигурация

`ALLOWED_HOST_PATTERN`, `CAPTURE_HOST_PERMISSION`, `DEFAULT_PROJECT`,
`DEFAULT_PAGE`, `DEFAULT_ROUTE` — из `.env`, подставляются `scripts/build.mjs`.

## Последние изменения

- **2026-08-18** — файл заведён при аудите документации (модуль уже существовал).
