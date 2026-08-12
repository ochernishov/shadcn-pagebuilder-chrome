# Privacy

Shadcn Page Collector is local-first.

## Data collected

The extension stores the project name, page name, target route, selected language, captured block metadata, ordering, and notes that you enter.

## Where data is stored

- Working state: `chrome.storage.local` in your browser profile.
- Finished exports: the directory configured by `EXPORT_DIRECTORY` through the local Native Messaging host.

## Network activity

The extension has no analytics, telemetry, advertising, account system, or remote application backend. It does not upload collected specifications.

Normal browsing requests made by the Shadcn Blocks website are controlled by that website and Chrome, not this extension.

## Source library content

The collector records metadata such as page URL, slug, registry identifier, and install command. It does not extract or redistribute paid source code.
