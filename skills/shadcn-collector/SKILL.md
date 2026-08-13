---
name: shadcn-collector
description: Implement a captured Shadcn Page Collector reference. Two modes - a numbered page package exported to Collector/<number>/, or a standalone single-block JSON payload pasted from the side panel. Use for `$shadcn-collector 482731`, `/shadcn-collector 482731`, `Shadcn Collector 482731`, `Collector 482731`, a pasted `kind: "single-block"` payload, or a request to change one section using a captured block reference.
---

# Shadcn Collector

The Chrome side panel has two workflows, and this skill mirrors them. Pick the mode from the input before doing anything else.

| Input | Mode | Where the spec lives |
|---|---|---|
| Six digits (`482731`) | **A — page package** | `Collector/<number>/` in the current project |
| Pasted JSON with `"kind": "single-block"`, or a block URL plus an instruction | **B — one block** | The payload itself; nothing is written to disk |

If both could apply, ask once. Never run mode A's resolver on a mode B payload: a single-block capture never creates a `Collector/` folder and never touches Native Messaging.

## 0. Before any install (both modes)

Blocks from a paid registry require real authorized access. Check for credentials the project already has, in this order:

1. The project's ignored `.env` (for example a `SHADCNBLOCKS_API_KEY` entry).
2. The registry entry already present in `components.json`.
3. The credential location this environment documents for the user's own key store.

Read a key only to place it in the project's ignored `.env`. Never print it, never write it into `components.json`, a Collector folder, a tracked file, or a log.

Shadcn CLI v3 installs from a namespaced registry that references the variable, not the value:

```json
{
  "registries": {
    "@shadcnblocks": {
      "url": "https://www.shadcnblocks.com/r/{name}",
      "headers": { "Authorization": "Bearer ${SHADCNBLOCKS_API_KEY}" }
    }
  }
}
```

Then `npx shadcn add @shadcnblocks/<slug>`.

If `components.json` is missing, create the minimal file the project's stack needs: style, the real Tailwind CSS entry, and aliases that match the project's actual `tsconfig` and bundler paths. Do not run `shadcn init` on a project that already has its own design system — it rewrites the CSS entry. Check first for `src/components/ui`, Radix/cva dependencies, and the project's own stylesheet, and say plainly when the block will need adaptation instead of a drop-in.

When authorized access is unavailable, build an original implementation from the visible reference. Never bypass a paywall, authentication, or access control, and never copy proprietary source.

## 1A. Mode A — resolve the page package

Validate the argument against `^[0-9]{6}$`, then run from the current working directory:

```bash
node <skill-directory>/scripts/resolve-collection.mjs <number>
```

Replace `<skill-directory>` with this skill's actual directory. The resolver checks only the exact `Collector/<number>/` path in the current directory and its parents. Never scan the user's home directory or sibling projects.

If the package is missing, stop and ask the user to open the correct project, verify the folder selected in the extension, click **Finish page** again, and provide the displayed number.

Then read, in order:

1. `Collector/<number>/page-spec.json` — the structured source of truth.
2. `Collector/<number>/PAGE_SPEC.md` — ordered sections and implementation notes.
3. Every image in `Collector/<number>/references/`.

Confirm that `collectionId` in the JSON equals the requested number. Do not continue with mismatched or invalid JSON.

## 1B. Mode B — read the single-block payload

The payload is the whole spec; there is no folder to resolve. Read:

- `source.url` / `source.slug` — block identity;
- `section.typeKey` — its role on the page;
- `implementationNotes` — what the user wants changed, and where;
- `selectedText` — the exact copy they highlighted, when present;
- `accessPolicy` — the access rule for this item.

**Open `source.url` before implementing.** The block's own page carries a prose description of the composition — layout, responsive behavior, connectors, gradients, type hierarchy — that is more precise than a screenshot and survives a failed image transfer. Read it even when a screenshot did arrive; it routinely names details an image hides.

**Expect `screenshotIncluded: true` with no visible image.** The side panel writes the text and the PNG as two representations of a single clipboard item, so pasting into a chat that takes `text/plain` drops the picture. This is normal, not a capture failure. Say once that the image did not arrive, then get the structure from the block page. Never infer a composition from the block title alone — a title is a label, not a spec, and the result will look "almost right" in a way that is expensive to find later.

When the user names a block by URL in conversation instead of pasting a payload, treat it as mode B with `implementationNotes` taken from their message.

## 2. Decide how to implement each item

In mode A, process items strictly in their saved order.

- Use an official install command only with real authorized access and a permitted license.
- For a `visual-reference`, infer structure, responsive behavior, states, and accessible interactions from the image.
- Replace demo content with the target project's real content. Never ship lorem ipsum.
- **An installed block is a starting point, not the deliverable.** When the project has its own design system (a `DESIGN.md`, design tokens, a stylesheet of its own), port the block's structure and interaction onto the project's tokens and class conventions instead of shipping the vendor's palette, fixed pixel sizes, and utility soup. Delete vendor demo files you do not use, and keep only the parts you actually wired in.

## 3. Implement the work

Follow the task workflow and repository instructions required by the current agent. Read the repository instructions (`AGENTS.md`, `CLAUDE.md`, or equivalent) first. Before editing, inspect existing routes, components, design tokens, dependencies, and nearby patterns.

Mode A implements the complete page or requested edit according to `pageMode` (`create` or `edit`), `route`, saved item order, per-item notes, and attached images.

Mode B changes exactly the section named in `implementationNotes` and leaves the rest of the page alone.

Reuse existing primitives and assets. Preserve responsive behavior, accessibility, and project architecture.

## 4. Verify and report

Run the repository's applicable lint, typecheck, tests, and visual checks. Update documentation when project rules require it.

Report:

- the mode, plus the Collector number (mode A) or block slug (mode B);
- what was installed from an authorized source;
- **what you rewrote onto the project's own design system, and what you deliberately dropped**;
- the implemented route or section;
- verification results;
- any remaining limitation, including a reference image that never arrived.
