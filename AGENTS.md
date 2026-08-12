# Project Instructions

## Scope

Page Collector состоит из Chrome Manifest V3 extension и локального Node.js Native Messaging Host.

## Commands

- Build: `npm run build`
- Tests: `npm run check`
- Native Host: `npm run install:host` (ID вычисляется из `EXTENSION_PUBLIC_KEY`)

## Conventions

- Не добавлять исходники или credentials платной библиотеки Shadcn Blocks.
- Настраиваемые имена, host patterns и export paths брать только из `.env`.
- `extension/` является исходником; `dist/extension/` генерируется и не редактируется вручную.
- Сохранять совместимость с Chrome Manifest V3 и не добавлять remote code.
- После значимых изменений обновлять `README.md`, `CHANGELOG.md` и `docs/ARCHITECTURE.md`.
- Все пользовательские строки хранить в `extension/i18n.js`; английский — язык по умолчанию.
- Стабильные данные блока хранят `typeKey`, а не локализованный label.
- Публичный репозиторий не должен содержать `.env`, `dist/`, платный исходный код блоков или шрифты без разрешающей лицензии.
