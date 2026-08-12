---
name: shadcn-collector
description: Resolve a numbered Shadcn Page Collector package in the current project and implement its saved page from PAGE_SPEC.md, page-spec.json, and screenshots. Use for `$shadcn-collector 482731`, `/shadcn-collector 482731`, `Shadcn Collector 482731`, `Collector 482731`, or equivalent requests to open and implement a Collector package by number.
---

# Shadcn Collector

Accept one six-digit Collector number and implement the corresponding page specification from the current project.

## 1. Resolve the package

Validate the argument against `^[0-9]{6}$`, then run from the current working directory:

```bash
node <skill-directory>/scripts/resolve-collection.mjs <number>
```

Replace `<skill-directory>` with this skill's actual directory. The resolver checks only the exact `Collector/<number>/` path in the current directory and its parents. Never scan the user's home directory or sibling projects.

If the package is missing, stop and ask the user to open the correct project, verify the folder selected in the extension, click **Finish page** again, and provide the displayed number.

## 2. Read the sources of truth

Read the repository instructions (`AGENTS.md`, `CLAUDE.md`, or equivalent) first, then read:

1. `Collector/<number>/page-spec.json` as the structured source of truth.
2. `Collector/<number>/PAGE_SPEC.md` for ordered sections and implementation notes.
3. Every image in `Collector/<number>/references/` as a visual reference.

Confirm that `collectionId` in JSON equals the requested number. Do not continue with mismatched or invalid JSON.

## 3. Decide how to implement each item

Process items strictly in their saved order.

- If an official registry or install command is present, verify that it is available in the user's environment and permitted by its license. Use it only with real authorized access.
- Never request or copy API keys into Collector. Use credentials already configured in the target project or official library tooling.
- If source access or a subscription is unavailable, create an original implementation from the screenshot, URL, visible content, and notes. Never bypass a paywall, authentication, or access control, and never copy proprietary source code.
- For a `visual-reference`, infer structure, responsive behavior, states, and accessible interactions from the image.
- Replace demo content with target-project content and follow the project's existing design system.

## 4. Implement the work

Follow the task workflow and repository instructions required by the current agent. Before editing, inspect existing routes, components, design tokens, dependencies, and nearby patterns.

Implement the complete page or requested edit according to:

- `pageMode` (`create` or `edit`);
- `route`;
- saved item order;
- per-item notes;
- attached images.

Reuse existing primitives and assets. Preserve responsive behavior, accessibility, and project architecture.

## 5. Verify and report

Run the repository's applicable lint, typecheck, tests, and visual checks. Update documentation when project rules require it.

In the final response, report:

- Collector number;
- implemented route;
- items installed from authorized sources;
- items implemented originally from references;
- verification results;
- any remaining limitation.
