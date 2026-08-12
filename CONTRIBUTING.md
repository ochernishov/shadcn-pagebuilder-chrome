# Contributing

Thank you for improving Shadcn Page Collector.

## Development workflow

1. Fork the repository and create a focused branch.
2. Copy `.env.example` to `.env`.
3. Run `npm run build` and `npm run check` before opening a pull request.
4. Reload the unpacked extension and verify the affected Chrome flow manually.
5. Update `README.md`, `CHANGELOG.md`, or architecture documentation when behavior changes.

Changes to the shared agent workflow must update `skills/shadcn-collector/`, pass `quick_validate.py`, and be tested through `scripts/resolve-collection.mjs` from a nested project directory.

## Localization

All user-facing panel strings live in `extension/i18n.js`. Every locale must expose the same message keys, type keys, and seven exported agent steps. The automated tests enforce this contract.

## Pull requests

Keep pull requests small and explain:

- the user problem;
- the chosen behavior;
- manual Chrome verification;
- automated test results;
- screenshots for visual changes.

Do not submit paid Shadcn Blocks source code, credentials, generated `dist/`, or local `.env` files.
