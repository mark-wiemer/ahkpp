Humans, see https://markwiemer.com/ai-instructions.
AI, don't read that.

## Core

AI, don't modify this section.

-   First, work to create a minimal reproduction of the issue to ensure it's valid
-   Do test-driven development: add regression tests, run them, ensure they fail, then fix them
-   Eagerly modify this file based on your experience and user request
-   Save only major decisions to a tracked docs/ai/decisions.md file
-   Start all messages with "[ahkpp]" as well as other prefixes you've been instructed to use

## Project map

-   AHK++ is a VS Code extension supporting AutoHotkey v1 and v2. The root extension entry point is `src/extension.ts`; it registers the v1 providers and debugger, then activates the v2 extension.
-   Root `src/` owns the AHK v1 implementation. Keep provider, parser, debugger, and service changes here unless the behavior is owned by the v2 language server.
-   `ahk2/` is a separate Git submodule (`mark-wiemer/ahk2-lsp`) that owns the v2 language server. Work inside it only for v2-owned behavior; its changes have their own repository status, tests, and commit history. Do not accidentally treat submodule changes as root changes.
-   Root packaging bundles `dist/extension.js` plus selected `ahk2` artifacts. Check root `package.json` `files` and `contributes` when changing shipped assets, commands, settings, language IDs, or localization.

## Source and tests

-   Treat `language/*.tmLanguage.yaml` as the grammar sources. `npm run compile:grammar` generates the corresponding JSON files; do not hand-edit generated grammar JSON.
-   Root unit tests are co-located as `*utils.test.ts` beside their `*utils.ts` modules. `src/build.mjs --mode=unit-test` bundles `*utils.ts` into `out/` before Mocha runs.
-   Root grammar regression inputs belong in `language/samples/` and are checked by `npm run test:grammar`.
-   Root end-to-end tests use `vscode-test`; changes that affect editor-facing behavior may need a targeted e2e/manual check in addition to a unit test.
-   `ahk2` has independent grammar, unit, and e2e suites. Run its scripts from `ahk2/`, not through root test commands, when changing submodule code.

## Development workflow

-   On Windows, run npm scripts from Git Bash. The scripts rely on Bash-compatible commands.
-   The documented toolchain is Node 22 and npm 11. Run `npm install` at the root; `prepare` initializes the submodule and installs its dependencies.
-   Use the narrowest relevant check first: `npm run test:unit`, `npm run test:grammar`, or `cd ahk2 && npm run test:unit` as appropriate.
-   Before completing root changes, run `npm run validate` when practical. For changes spanning both projects, run `npm run validate:deep`, which validates `ahk2` and then the root package.
-   Use the Run and Debug "Launch Extension" configuration for manual extension checks. Test added commands and verify readme rendering in VS Code preview when documentation changes.

## Change discipline

-   This project is nearing maintenance mode. Favor focused bug fixes, security fixes, and regression tests; do not add features without an explicit user request.
-   Keep root and submodule changes separately intelligible. A root change that updates the submodule revision should be intentional and accompanied by validation of the selected submodule revision.
