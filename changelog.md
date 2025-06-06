# Changelog

## 6.7.1 - 2025-05-16 🎓

-   Make "Configuration changed" log debug-level instead of info-level ([#625 (comment)](https://github.com/mark-wiemer/ahkpp/issues/625#issuecomment-2772599772))
-   Remove "Invalid setting" log if `logLevel` setting was not found ([#644](https://github.com/mark-wiemer/ahkpp/issues/644))
-   Fix excessive logs when `#include` files aren't found by AHK++ ([#641](https://github.com/mark-wiemer/ahkpp/issues/641), [#646](https://github.com/mark-wiemer/ahkpp/issues/646), [#649](https://github.com/mark-wiemer/ahkpp/issues/649), and [#657](https://github.com/mark-wiemer/ahkpp/issues/646))
    -   Logic to detect these files has improved but still has at least one known issue: [#628](https://github.com/mark-wiemer/ahkpp/issues/628)
    -   When a file isn't found, the log is now `debug` level instead of `warn` level to reduce noise
-   Improve AHK v1 snippet for `CoordMode` ([PR #651](https://github.com/mark-wiemer/ahkpp/pull/651))

## 6.7.0 - 2025-04-01 🤡

-   Add `AHK++ > General > logLevel` for logs in output channels ([#625](https://github.com/mark-wiemer/ahkpp/issues/625), [#635](https://github.com/mark-wiemer/ahkpp/issues/635))

## 6.6.0 - 2025-03-21 🎩

All changes in 6.6.0 are exclusive to AHK v1.

-   Add experimental `funcDefSearch` setting that improves function definition resolution. For known issues, see [`settings.md`](./docs/settings.md). ([Issue #205](https://github.com/mark-wiemer/ahkpp/issues/205))
-   Improve extension performance when loading AHK v1 scripts ([PR #615](https://github.com/mark-wiemer/ahkpp/pull/615))
-   Change `Method` to `Function` in document symbols and internal references. This changes the document outline slightly, but should not change most theme icons and is more correct. ([PR #620](https://github.com/mark-wiemer/ahkpp/pull/620))
-   Have scripts referenced by `#include` bypass the `exclude` setting ([PR #623](https://github.com/mark-wiemer/ahkpp/pull/623))

## 6.5.0 - 2025-02-23 💞

### Debugger

-   Add [docs/debugging.md](./docs/debugging.md) and [docs/\_welcome.md](./docs/_welcome.md)
-   Fix `.vscode/launch.json` support for AHK v1 ([Issue #603](https://github.com/mark-wiemer/ahkpp/issues/603))
-   Add `.vscode/launch.json` support for AHK v2 ([Issue #603](https://github.com/mark-wiemer/ahkpp/issues/603))
-   Change "AutoHotkey execute bin not found: ..." to "AutoHotkey interpreter not found" with a preceding message showing the interpreter path. ([PR #606](https://github.com/mark-wiemer/ahkpp/pull/606))
-   Remove the `runtime` argument from `launch.json` for both AHK v1 and AHK v2 due to issues with cross-version debugging ([PR #606](https://github.com/mark-wiemer/ahkpp/pull/606))
    -   We are not considering this a breaking change as this behavior didn't work before. If you'd like to use different AHK interpreters across different workspaces, use IDE workspace settings. If you'd like to use different AHK interpreters within a single workspace, please [open a discussion](https://github.com/mark-wiemer/ahkpp/discussions/new/choose) and we'll be happy to help.

### IntelliSense

-   Add detailed `__New` docs for `InputHook` and basic `__New` docs for all `Object` descendants that didn't have it ([Issue #586](https://github.com/mark-wiemer/ahkpp/issues/586))

## 6.4.3 - 2025-01-18 🎆

-   Fix IniWrite IntelliSense ([#590](https://github.com/mark-wiemer/ahkpp/issues/590))
-   Add [comprehensive settings reference](./docs/settings.md) in Markdown and improve docs within the settings editor ([#581](https://github.com/mark-wiemer/ahkpp/issues/581))
-   Update internal dependencies to Node 22, npm 11, and Mocha 11 to improve developer security and developer experience ([#583](https://github.com/mark-wiemer/ahkpp/issues/583))

## 6.4.2 - 2024-12-16 🎄

-   Reduce required VS Code version to 1.68 ([#574](https://github.com/mark-wiemer/ahkpp/issues/574))
-   Update internal dependencies for security ([#577](https://github.com/mark-wiemer/ahkpp/issues/577))

## 6.4.1 - 2024-11-09 🛠️

### Known issues

-   If your AHK v2 interpreter is not recognized and you try to debug an AHK v2 script, an "AutoHotkey execute bin not found: ..." output log will appear and take focus in the AHK++ (v1) output channel (open issue [#570](https://github.com/mark-wiemer/ahkpp/issues/570))

(Previously, this changelog noted [#571](https://github.com/mark-wiemer/ahkpp/issues/571), an issue with the "Set AHK v2 Interpreter" command. However, further review shows that was likely a false positive report.)

### Fixes

-   Add [troubleshooting guide](docs/troubleshooting.md)
-   Fix go to definition in AHK v1 files ([#559](https://github.com/mark-wiemer/ahkpp/issues/559))
-   Remove unnecessary error message "Couldn't resolve AHK v2 interpreter" ([#493](https://github.com/mark-wiemer/ahkpp/issues/493))
    -   This has been moved to a output log visible in the AHK++ (v2) output channel
    -   A "... does not exist" error message will still appear when trying to run an AHK v2 script with an unrecognized interpreter path
-   Fix quick pick for "... does not exist" error message on run AHK v2 script ([PR #569](https://github.com/mark-wiemer/ahkpp/issues/569))
    > Note: this fix copies your config into your workspace settings. If you don't like this, please manually enter the path via the settings, and don't use the quick pick. Learn more at [PR #569](https://github.com/mark-wiemer/ahkpp/issues/569).

## 6.4.0 - 2024-11-02 🗳️

### New features

-   Hovering over a filename in a `#include` directive now provides a link to that document in your IDE
    -   If the file doesn't exist, the underline doesn't appear
    -   Does not work for `#include <lib>` syntax yet.

### Bugfixes

-   Update thqby's extension from 2.5.3 to 2.5.4, adding new bugfixes
    -   Improve "go to definition" in v2 files ([thqby #610](https://github.com/thqby/vscode-autohotkey2-lsp/issues/610))
    -   Improve environment variables when debugging via IDE for parity with running outside of IDE ([thqby #615](https://github.com/thqby/vscode-autohotkey2-lsp/issues/615))
    -   Add hover tip for `switch` keyword in v2 files ([thqby #623](https://github.com/thqby/vscode-autohotkey2-lsp/issues/623))

## 6.3.0 - 2024-10-19 🕳️

### New features

-   Rewrite AutoHotkey v2 definition files using [GroggyOtter](https://github.com/GroggyOtter/ahkv2_definition_rewrite)'s syntaxes ([#521](https://github.com/mark-wiemer/ahkpp/issues/521))
-   Add exclude setting ([#488](https://github.com/mark-wiemer/ahkpp/issues/488))
    -   Excluded files are not included in IntelliSense completion suggestions, even when they're added via `#include`
    -   Changed `v2.exclude` setting to `exclude`
    -   One setting works for both v1 and v2
    -   Changes to this setting take effect immediately, no need to restart your IDE (different than thqby's extension)
    -   v2 will exclude excluded files from suggestions even if they're opened in the IDE (different than thqby's extension)
    -   v1 no longer automatically ignores files with `out`, `target`, or `node_modules` in their name

### Fixes

-   Fix v1 formatter removing extra spaces in strings ([#411](https://github.com/mark-wiemer/ahkpp/issues/411))
-   Fix v2 formatter moving closing brackets/braces when `arrayStyle` or `objectStyle` were set to "none" (the default) ([#499](https://github.com/mark-wiemer/ahkpp/issues/499))
-   Fixup output channel names: "AHK++ (v1)" and "AHK++ (v2)" instead of "AHK" and "AHK++" respectively
-   Fix duplicate output channels (the "AHK" channel used to be created twice)

### Other

-   Rename extension to `AHK++ (AutoHotkey Plus Plus)` to provide a clear short name while retaining previous brand
    -   In 6.2.0, only the settings were renamed. This release renames the extension display name on registries as well.

## 6.2.3 - 2024-10-08 📖

-   Restore readme to marketplaces once again ([#537](https://github.com/mark-wiemer/ahkpp/issues/537))
-   Link to external licenses for better context

### Developer changes

-   Update workflows to have consistent filenames and workflow names
-   Update actions in workflows to latest stable versions

## 6.2.2 - 2024-10-07 🤏

-   Reduce extension size on marketplaces by ~100x (yes, really) ([#533](https://github.com/mark-wiemer/ahkpp/issues/533))

## 6.2.1 - 2024-10-07 📚

-   Restore readme to marketplaces (lost due to [auto-publish error](https://github.com/mark-wiemer/ahkpp/actions/runs/11225795502/job/31205122158))

### Developer changes

-   Update some dependencies to reduce risk of publishing errors in the future

## 6.2.0 - 2024-10-07 🫡

-   Update thqby's extension from 2.4.9 to 2.5.3, adding new features and bugfixes

### New features

-   Watch files for changes, improving `#Includes` support ([thqby #564](https://github.com/thqby/vscode-autohotkey2-lsp/issues/564))
-   "Update File Version Info" now updates all `;@ahk2exe` directives as well ([thqby #565](https://github.com/thqby/vscode-autohotkey2-lsp/issues/565))
-   Context menu items organized into AHK++ submenu ([thqby #570](https://github.com/thqby/vscode-autohotkey2-lsp/issues/570))
-   Support `;@format` formatter directives in v2 files
    -   Directive names are `array_style` and `brace_style` for compatibility with thqby's extension

### Fixes

-   Fix TraySetIcon definition ([thqby #591](https://github.com/thqby/vscode-autohotkey2-lsp/issues/591))
-   Fix ternary operator parsing ([thqby #594](https://github.com/thqby/vscode-autohotkey2-lsp/issues/594))
-   Improve completion provider for DllCall.Bind ([thqby #595](https://github.com/thqby/vscode-autohotkey2-lsp/issues/595))
-   Add Help and Sleep as key names ([thqby #596](https://github.com/thqby/vscode-autohotkey2-lsp/issues/596))
-   Fix debug when `launch.json` is present ([thqby #584](https://github.com/thqby/vscode-autohotkey2-lsp/issues/584))
-   Fix debug not using selected launch config ([thqby #533](https://github.com/thqby/vscode-autohotkey2-lsp/issues/533))
-   Fix "Update File Version Info" when more than one space is present ([thqby #562](https://github.com/thqby/vscode-autohotkey2-lsp/issues/562))
-   Fix "Update File Version Info" when placed after directive ([thqby #563](https://github.com/thqby/vscode-autohotkey2-lsp/issues/563))
-   Fix hover provider for `this` in classes ([thqby #571](https://github.com/thqby/vscode-autohotkey2-lsp/issues/571))
-   Fix formatting inside conditional function definition ([thqby #574](https://github.com/thqby/vscode-autohotkey2-lsp/issues/574))
-   Fix other unreported bugs in AHK v2 support. These changes weren't fully documented, see the diff or open a discussion for details.

### Developer changes

-   Add true unit tests that don't require opening VS Code to run (`npm run test-unit`)
-   Move to new branch of ahk2-lsp with 100% thqby-compatible changes. All changes are submitted as PRs against thqby's repo. This makes improvements much easier in the future.

### Other notes

This changelog incorrectly included this entry:

-   Rename to `AHK++ (AutoHotkey Plus Plus)` to provide a clear short name while retaining previous brand

Although the settings name changed, the extension name did not change until 6.3.0

## 6.1.1 - 2024-09-22 😤

-   No changes, just working around technical limitations with VS Marketplace as 6.1.0 failed to deploy without detailed errors.

## 6.1.0 - 2024-09-22 🫙

-   Add `General > showOutput` setting to toggle automatically showing the output view when running a script ([#492](https://github.com/mark-wiemer/ahkpp/issues/492))
-   Fix quick help when selecting quoted strings ([#376](https://github.com/mark-wiemer/ahkpp/issues/376))
-   Fix description for `V2 > General > actionWhenV1Detected` setting key
-   Fix `V2 > Syntaxes` setting

## 6.0.0 - 2024-09-01 🥂

### Full AHK v2 support is here!

AHK++ 6 incorporates [AutoHotkey v2 Language Support 2.4.9 by thqby](https://marketplace.visualstudio.com/items?itemName=thqby.vscode-autohotkey2-lsp) to deliver full v2 support, including formatting, enhanced IntelliSense and debug support, and more!

All changes are compared to AHK++ 5.0.7.

-   v2 formatting support
-   v2 IntelliSense support
-   Start and stop scripts via VS Code keybindings

More changes are listed below the breaking changes...

### ⛓️‍💥 Breaking changes

Settings are now organized into flat objects for a better user experience. Unfortunately, this means settings will have to be replaced when upgrading to AHK++ 6. This is a one-time fixup. Below are sample settings matching the new schema and default values of AHK++. You can learn more about the settings via VS Code's settings UI (`Ctrl+,`)

<details open><summary>Default AHK++ settings</summary>

```json
// settings.json
{
    // ...other settings...
    "AHK++.compiler": {
        "compileIcon": "",
        "compilerPath": "C:/Program Files/AutoHotkey/Compiler/Ahk2Exe.exe",
        "useMpress": false
    },
    "AHK++.menu": {
        "showDebugButton": true
    },
    "AHK++.v1.file": {
        "compileBaseFile": "",
        "helpPath": "C:/Program Files/AutoHotkey/AutoHotkey.chm",
        "interpreterPath": "C:/Program Files/AutoHotkey/AutoHotkeyU64.exe",
        "templateSnippetName": "AhkTemplateV1"
    },
    "AHK++.v1.formatter": {
        "allowedNumberOfEmptyLines": 1,
        "indentCodeAfterIfDirective": true,
        "indentCodeAfterLabel": true,
        "preserveIndent": false,
        "trimExtraSpaces": true
    },
    "AHK++.v1.intellisense": {
        "maximumParseLength": 10000
    },
    "AHK++.v2.completionCommitCharacters": {
        "Class": ".(",
        "Function": "("
    },
    "AHK++.v2.debugConfiguration": {
        "port": "9002-9100",
        "useAnnounce": "detail",
        "useAutoJumpToError": true,
        "useDebugDirective": true,
        "usePerfTips": true
    },
    "AHK++.v2.diagnostics": {
        "classNonDynamicMemberCheck": true,
        "paramsCheck": true
    },
    // ⚠️ Not yet supported, ref [issue #488](https://github.com/mark-wiemer/ahkpp/issues/488)
    "AHK++.v2.exclude": [],
    "AHK++.v2.file": {
        "compileBaseFile": "",
        "helpPath": "C:/Program Files/AutoHotkey/v2/AutoHotkey.chm",
        "interpreterPath": "C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey64.exe",
        "maxScanDepth": 2,
        "templateSnippetName": "AhkTemplateV2"
    },
    "AHK++.v2.formatter": {
        "arrayStyle": "none",
        "braceStyle": "One True Brace",
        "breakChainedMethods": false,
        "ignoreComment": false,
        "indentString": "    ",
        "indentBetweenHotIfDirectives": false,
        "keywordStartWithUppercase": false,
        "maxPreserveNewlines": 2,
        "objectStyle": "none",
        "preserveNewlines": true,
        "spaceBeforeConditional": true,
        "spaceAfterDoubleColon": true,
        "spaceInEmptyParen": false,
        "spaceInOther": true,
        "spaceInParen": false,
        "switchCaseAlignment": false,
        "symbolWithSameCase": false,
        "whitespaceBeforeInlineComment": "",
        "wrapLineLength": 120
    },
    "AHK++.v2.general": {
        "actionWhenV1Detected": "SwitchToV1",
        "commentTagRegex": "^;;\\s*(?<tag>.+)",
        "completeFunctionCalls": false,
        "librarySuggestions": "Disabled",
        "symbolFoldingFromOpenBrace": false,
        "syntaxes": ""
    },
    "AHK++.v2.warn": {
        "callWithoutParentheses": "Off",
        "localSameAsGlobal": false,
        "varUnset": true
    },
    "AHK++.v2.workingDirectories": []
}
```

</details>

### New commands

-   Debug AHK and Attach: Debug and attach to the debug session for advanced use-cases. Requires zero-plusplus.vscode-autohotkey-debug.
-   Debug AHK with Params (`Ctrl+F5`): Debug and add user-provided command-line arguments to the debugger for advanced use-cases. Requires zero-plusplus.vscode-autohotkey-debug.
-   Run AHK++ Diagnostic: Effectively restart the AHK v2 features of the app.
-   Export AHK Symbols: Export application functions and classes to a new file. Only for AHK v2.
-   Stop AHK Script (`Ctrl+F6`): Stop an AHK script of user choice ran via `Run AHK Script` or any of the `Debug AHK ...` commands. If only one script is running, stop that without asking for confirmation.
-   Add Doc Comment: Add a function header comment for the current function. Only for AHK v2.
-   Update File Version Info: Add or update a file header comment
-   Switch AHK Version: Change between AHK v1 and v2 for the current file
-   Select AHK Syntaxes: Select custom AHK v2 syntax files for advanced use-cases. PRs are welcomed if the default syntaxes aren't sufficient!
-   Set A_ScriptDir Here: Set [`A_ScriptDir`](https://www.autohotkey.com/docs/v2/Variables.htm#ScriptDir) to the path of the current file. Only for AHK v2.
-   Set AHK v2 Interpreter: Open a quick pick to change the AHK v2 interpreter for all scripts.

### Other changes

-   Context menu commands are now organized near the top of the menu

### Developer changes

-   Use ESLint 9 and typescript-eslint 8 for better code hygiene checks
-   Upgrade from Node 16 to Node 20
-   Remove husky and lint-staged for simplicity
-   Modernize unit tests with @vscode/test-cli
-   Add recommended VS Code extensions for working in this codebase
-   Simplify launch configurations
-   Improve manual tests and add manual tests for new AHK v2 capabilities
-   Add [full v2 integration docs](docs/full-v2-integration.md)
-   Clarify [license](license.md): even more open-source than before!

### 💚 Thank you!

Special thanks to [thqby](https://github.com/thqby), as this would not have been possible without thqby's open-source [AutoHotkey v2 Language Support](https://marketplace.visualstudio.com/items?itemName=thqby.vscode-autohotkey2-lsp)!

## 5.1.3 - 2024-08-30 🧪

<details><summary>5.1.3</summary>

> 🧪 means this is a [pre-release](https://code.visualstudio.com/updates/v1_63#_pre-release-extensions)!

### ⛓️‍💥 Breaking changes

Fixup new command names and IDs:

-   Debug AHK and Attach (`ahk++.debugAttach`): Debug and attach to the debug session for advanced use-cases. Requires zero-plusplus.vscode-autohotkey-debug.
-   Debug AHK with Params (`ahk++.debugParams`): Debug and add user-provided command-line arguments to the debugger for advanced use-cases. Requires zero-plusplus.vscode-autohotkey-debug.
-   Run AHK++ Diagnostic (`ahk++.diagnostic.full`): Effectively restart the AHK v2 features of the app.
-   Export AHK Symbols (`ahk++.exportSymbols`): Export application functions and classes to a new file.
-   Stop AHK Script (`ahk++.stop`): Stop an AHK script of user choice ran via `Run AHK Script` or any of the `Debug AHK ...` commands. If only one script is running, stop that without asking for confirmation.
-   Add Doc Comment (`ahk++.addDocComment`): Add a function header comment for the current function
-   Update File Version Info (`ahk++.updateVersionInfo`): Add or update a file header comment
-   Switch AHK Version (`ahk++.switchAhkVersion`): Change between v1 and v2 for the current file
-   Select AHK Syntaxes (`ahk++.selectSyntaxes`): Select custom syntax files for advanced use-cases. PRs are welcomed if the default syntaxes aren't sufficient!
-   Set A_ScriptDir Here (`ahk++.setAScriptDir`): Set [`A_ScriptDir`](https://www.autohotkey.com/docs/v2/Variables.htm#ScriptDir) to the path of the current file. Only for AHK v2.
-   Set AHK v2 Interpreter (`ahk++.setV2Interpreter`): Open a quick pick to change the AHK v2 interpreter for all scripts.

</details>

## 5.1.2 - 2024-08-29 🧪

<details><summary>5.1.2</summary>

> 🧪 means this is a [pre-release](https://code.visualstudio.com/updates/v1_63#_pre-release-extensions)!

### ⛓️‍💥 Breaking changes

-   Remove duplicate commands
    -   ahk2.debug (use ahk++.debug)
    -   ahk++.run (use ahk2.run)
    -   ahk++.runSelection (use ahk2.selection.run)
    -   ahk2.compile (use ahk++.compile)
    -   Commands may be renamed in the future for consistency

### Other changes

-   Reduce extension size from 1.34 MB to 533 KB, compared to 534 KB for AHK++ 5.0.7

</details>

## 5.1.1 - 2024-08-27 🧪

<details><summary>5.1.1</summary>

> 🧪 means this is a [pre-release](https://code.visualstudio.com/updates/v1_63#_pre-release-extensions)!

-   Fix global function recognition ([#472](https://github.com/mark-wiemer/ahkpp/issues/472))

</details>

## 5.1.0 - 2024-08-22 🧪🎂

<details><summary>5.1.0</summary>

> 🧪 means this is a [pre-release](https://code.visualstudio.com/updates/v1_63#_pre-release-extensions)!

This is a very early pre-release, expect significant issues. Commands may not work as expected and features may be missing.

### ⛓️‍💥 Breaking changes

For [technical reasons](https://code.visualstudio.com/api/working-with-extensions/publishing-extension#prerelease-extensions), this is tagged with `5.1.0`, but it may be a breaking release and the full release will be tagged `6.0.0`

-   I haven't found any yet! Please [🐛 report any issues](https://github.com/mark-wiemer/ahkpp/issues/new/choose) you find 🤓

### Other changes

-   Add full v2 support via [thqby's AutoHotkey v2 Language Support](https://marketplace.visualstudio.com/items?itemName=thqby.vscode-autohotkey2-lsp)
    -   No need to install that extension, all features are bundled into this extension
    -   Future work will de-dupe commands like "debug", "run selection", and "open help"
    -   Known issues and all new features are documented at [full v2 integration](docs/full-v2-integration.md)

</details>

## 5.0.7 - 2024-08-17 😬

-   Fix readme: v2 debugger works via commands, just not via "run and debug" viewlet

## 5.0.6 - 2024-08-17 📝

Changes to the marketplace page require a new version. This version has no user-facing changes, just documentation updates:

-   Update package description to clarify v2 support is in preview
-   Update readme to clarify v2 support is in preview

Full v2 support (IntelliSense, debugging, formatting) is coming later this month! ([Issue #453](https://github.com/mark-wiemer/ahkpp/issues/453))

## 5.0.5 - 2024-05-24 🏝️

-   Fix formatter in single line hotkey fall-through scenario ([#440](https://github.com/mark-wiemer/ahkpp/issues/440), [#442](https://github.com/mark-wiemer/ahkpp/issues/442))
-   Fix outline showing invalid labels ([#438](https://github.com/mark-wiemer/ahkpp/issues/438))

## 5.0.4 - 2024-05-23 😎

-   Add "PixelSearch" to V1 snippets ([PR #427](https://github.com/mark-wiemer/ahkpp/pull/427))
-   Fix two minor formatting issues ([Issue #432](https://github.com/mark-wiemer/ahkpp/issues/432), [#429](https://github.com/mark-wiemer/ahkpp/issues/429))
-   Update internal dependencies for security ([PR #435](https://github.com/mark-wiemer/ahkpp/pull/435))

## 5.0.3 - 2023-08-21 🏄

-   Fix extension crash when switching to a nullish editor ([Issue #398](https://github.com/mark-wiemer/ahkpp/issues/398))

## 5.0.2 - 2023-08-10 🐈

-   Fix language mode resetting when VS Code restarts ([Issue #392](https://github.com/mark-wiemer/ahkpp/issues/392))

## 5.0.1 - 2023-08-08 😶‍🌫️

-   `ahk++.file.interpreterPathV2` now defaults to `C:/Program Files/AutoHotkey/v2/AutoHotkey64.exe` ([Issue #387](https://github.com/mark-wiemer/ahkpp/issues/387))
-   Add breakpoint support for AHK v2 files ([Issue #384](https://github.com/mark-wiemer/ahkpp/issues/384))

## 5.0.0 - 2023-08-07 ✌️

AutoHotkey v2 support now in preview! Please test it out and [report any issues](https://github.com/mark-wiemer/ahkpp/issues/new?assignees=mark-wiemer&labels=AHK+v2&projects=&template=v2.md&title=%5Bv2%5D+), you'll help the community of 120,000+ users of this extension!

Be sure to go to the settings and update the new `V2` settings in case the defaults aren't correct 😊

### ⛓️‍💥 Breaking changes

-   Rename some settings. Users will have to manually adjust these new settings from the defaults to match their old settings:
    -   `ahk++.compiler.compileBaseFile` is now `ahk++.compiler.compileBaseFileV1`
    -   `ahk++.file.compilePath` is now `ahk++.file.compilerPath`
    -   `ahk++.file.executePath` is now `ahk++.file.interpreterPathV1`
    -   `ahk++.file.helpPath` is now `ahk++.file.helpPathV1`
    -   `ahk++.file.templateSnippetName` is now `ahk++.file.templateSnippetNameV1` with default value `AhkTemplateV1`

### Other changes

-   Allow `.ahk1` and `.ah1` extensions for v1 scripts, `.ahk2` and `.ah2` for v2 scripts. `.ahk` and `.ext` can be used for either version, but default to AHK v2 ([Issue #396](https://github.com/mark-wiemer/ahkpp/issues/396))
    -   The original changelog entry mentioned that the shared file extensions defaulted to AHK v1--this was incorrect
    -   You can add a `#Requires AutoHotkey v1` directive to the top of an of `.ahk` file to have it automatically load in AHK v1 independent of VS Code settings ([Issue #392](https://github.com/mark-wiemer/ahkpp/issues/392))
    -   The same can be done with `#Requires AutoHotkey v2`
    -   Alternatively, you can follow the below steps to associate all `.ahk` files with AHK v1:
        1. Open a `.ahk` file
        1. `F1` -> "Change language mode"
        1. "Configure file association for `.ahk` files"
        1. "AutoHotkey v1"
-   Automatically change AHK version to match the `#Requires` directive near the top of any script the first time that script is opened
-   Allow running and debugging v1 or v2 scripts without changing settings
-   "Open help" (Ctrl+F1) now opens version-specific help
-   Add full syntax highlighting for v2 scripts thanks to [AutoHotkey v2 Language Support by thqby](https://marketplace.visualstudio.com/items?itemName=thqby.vscode-autohotkey2-lsp)
-   Update icons (found next to a script's name in the explorer)
    -   v2 scripts will have official green icons, while v1 scripts now have modified blue icons
    -   Icons are a bit smaller to align with existing VS Code icons

### Known issues

Some features are not added to this initial preview release, but will be coming soon!

-   Missing features for AHK v2:
    -   Formatting ([Issue #381](https://github.com/mark-wiemer/ahkpp/issues/381))
    -   Snippets ([Issue #382](https://github.com/mark-wiemer/ahkpp/issues/382))

### Thank you!

This update relies heavily on open-source code from [thqby](https://github.com/thqby) and [Steve Gray (Lexikos)](https://github.com/Lexikos). Thank you for your awesome work!

## 4.1.0 - 2023-08-03 🙋

-   Add quick help, adapted from thqby's AutoHotkey v2 Language Support
    -   Selected text (or word at cursor) is now searched within the help documentation
    -   Known limitation: if selected text would cause a syntax error when injected into a script, help is activated but no search is made. [Issue #376](https://github.com/mark-wiemer/ahkpp/issues/376)
-   Update file icon to match [official AHK repository](https://github.com/AutoHotkey/AutoHotkey/blob/446829bc730aa002635d3d36bfd17e892b6981c0/source/resources/icons.svg)

## 4.0.0 - 2023-07-29 🍀

### ⛓️‍💥 Breaking changes

-   Rename some settings. Users will have to manually adjust these new settings from the defaults to match their old settings:
    -   `ahk++.formatter.indentCodeAfterSharpDirective` is now `ahk++.formatter.indentCodeAfterIfDirective`
    -   `ahk++.language.enableIntellisense` is now `ahk++.intellisense.enableIntellisense`
    -   `ahk++.file.maximumParseLength` is now `ahk++.intellisense.maximumParseLength`

### Other changes

-   IntelliSense no longer suggests words when a user presses space ([Issue #110](https://github.com/mark-wiemer/ahkpp/issues/110))
-   IntelliSense now suggests `foo(p1, p2)` instead of `foo (p1,p2)`
-   Improved descriptions of settings

## 3.3.3 - 2023-07-27 🏖️

-   Restore changes from 3.3.1. This release is the same as 3.3.1, except the debugger works.

## 3.3.2 - 2023-06-21 🪲

-   Revert changes in 3.3.1. This release is the same as 3.3.0. Ref [Issue #369](https://github.com/mark-wiemer/ahkpp/issues/369)

## 3.3.1 (yanked) - 2023-06-20 🌞

> This release has been yanked, meaning it's not supported. Use 3.3.3 instead.

-   Various syntax highlighting improvements ([PR #354](https://github.com/mark-wiemer/ahkpp/pull/354), [PR #358](https://github.com/mark-wiemer/ahkpp/pull/358))
-   Running `Open help` while `tutorial` text is selected now opens the Tutorial page ([PR #348](https://github.com/mark-wiemer/ahkpp/pull/348))
-   Unexpected change: Break debugger.

## 3.3.0 - 2023-03-11 🪴

-   Add `ahk++.file.maximumParseLength` setting to support unlimited file size ([Issue #117](https://github.com/mark-wiemer/ahkpp/issues/117))

Fixes:

-   Fix several syntax highlighting issues ([#85](https://github.com/mark-wiemer/ahkpp/issues/85), [#318](https://github.com/mark-wiemer/ahkpp/issues/318))
-   Fix minor debugger issues introduced in 3.1.0 ([#279](https://github.com/mark-wiemer/ahkpp/issues/279))
-   Fix debugging a file with a space in its name ([#134](https://github.com/mark-wiemer/ahkpp/issues/134))
-   Fix formatting for some bad labels (two colons) ([PR #325](https://github.com/mark-wiemer/ahkpp/pull/325))

## 3.2.0 - 2023-01-29 ❄️

-   Debug keyboard shortcut is now `Ctrl+Alt+F9` (was `F9`) to avoid conflicts with VS Code default shortcuts.
-   New setting: Snippet template name. Create your own template for new AHK files, including no template at all.
-   [Moving lines of code via commands](https://code.visualstudio.com/docs/getstarted/keybindings#_basic-editing) now (almost) correctly indents ([PR #306](https://github.com/mark-wiemer/ahkpp/pull/306), issue [#319](https://github.com/mark-wiemer/ahkpp/issues/319))
-   Snippets and keywords updated to AutoHotkey v1.1.36.0 ([PR #288](https://github.com/mark-wiemer/ahkpp/pull/288), [PR #298](https://github.com/mark-wiemer/ahkpp/pull/298))

Fixes:

-   Fix syntax highlighting for:

    -   strings with double colons in them ([PR #278](https://github.com/mark-wiemer/ahkpp/pull/278))
    -   conditional directives ([#69](https://github.com/mark-wiemer/ahkpp/issues/69))
    -   #Include and #IncludeAgain ([#86](https://github.com/mark-wiemer/ahkpp/issues/86))
    -   semi-colons without a preceding space (usually meant to be comments) ([#295](https://github.com/mark-wiemer/ahkpp/issues/295))

-   Fix formatting for:

    -   comments at the beginning of a code block ([#291](https://github.com/mark-wiemer/ahkpp/issues/291))
    -   `IfMsgBox` ([#290](https://github.com/mark-wiemer/ahkpp/issues/290))
    -   complex hotkeys ([#303](https://github.com/mark-wiemer/ahkpp/issues/303))
    -   object assignment within unbraced code blocks ([#316](https://github.com/mark-wiemer/ahkpp/issues/316))
    -   nested, unbraced code blocks ([PR #287](https://github.com/mark-wiemer/ahkpp/pull/287))

-   Fix hover message for doc comments to always be trimmed ([PR #308](https://github.com/mark-wiemer/ahkpp/pull/308))

## 3.1.0 - 2022-11-21 🦃

**Compiler**:

-   New compiler options in settings: Choose base file, file icon, and "use [MPRESS](https://www.autohotkey.com/mpress/mpress_web.htm)"
-   Add "Compiler GUI" command in context menu to use the AHK GUI when compiling

**Snippets**: Update snippets for AHK 1.1.35.00 and fix broken `InStr()` snippet ([#263](https://github.com/mark-wiemer/ahkpp/issues/263))

**Grammar**: Fix `#Requires` not being recognized ([#268](https://github.com/mark-wiemer/ahkpp/issues/268))

**Editor**: New AHK file icon (green square with white H)

**Debugger**: Minor debugger improvements

**Formatter**: Close the following bugs:

-   Formatter incorrectly indents object literals ([#184](https://github.com/mark-wiemer/ahkpp/issues/184), [#222](https://github.com/mark-wiemer/ahkpp/issues/222))
-   Nested one command code flow control ([#255](https://github.com/mark-wiemer/ahkpp/issues/255))

**Miscellaneous**: Extension should start up faster

## 3.0.0 - 2022-10-01 👻

This is "The Kyklish Release" because Kyklish wrote most of this code. Thank you!

### ⛓️‍💥 Breaking changes

-   Update file template: Add `#NoEnv` and `SetBatchLines, -1` ([PR #202](https://github.com/mark-wiemer/ahkpp/pull/202))

> Formatter bugfixes may be considered breaking if you wanted the old behaviors. If you want the old behavior, please [open an issue](https://github.com/mark-wiemer/ahkpp/issues/new?assignees=mark-wiemer&labels=bug%2C+formatter&template=formatting-bug.md&title=).

### Features

-   Add [formatter directive](./readme.md#formatter-directives) for "Format Block Comment" ([PR #164](https://github.com/mark-wiemer/ahkpp/pull/164))
-   Add "allowed number of empty lines" setting to preserve any number of lines. Defaults to `1`, `-1` means "preserve all empty lines" ([PR #194](https://github.com/mark-wiemer/ahkpp/pull/194))
-   Add "preserve indent" setting to preserve spaces before a comment. Defaults to `false`. ([PR #192](https://github.com/mark-wiemer/ahkpp/pull/192))
-   Add "trim extra spaces" to trim spaces between words. Defaults to `true`. ([PR #191](https://github.com/mark-wiemer/ahkpp/pull/191))
-   Trim end of line when formatting ([PR #190](https://github.com/mark-wiemer/ahkpp/pull/190))

### Fixes

-   Fix some snippets ([PR #138](https://github.com/mark-wiemer/ahkpp/pull/138), [PR #201](https://github.com/mark-wiemer/ahkpp/pull/201), [PR #210](https://github.com/mark-wiemer/ahkpp/pull/210))
-   Fix formatting bugs with semi-colon as part of a string ([PR #159](https://github.com/mark-wiemer/ahkpp/pull/159))
-   Fix some formatting bugs with `if`, `else`, etc. without braces ([PR #181](https://github.com/mark-wiemer/ahkpp/pull/181))
-   Fix formatter issue with non-label colon at end of line ([PR #162](https://github.com/mark-wiemer/ahkpp/pull/162))
-   Even more formatter fixes ([PR #164](https://github.com/mark-wiemer/ahkpp/pull/164))
-   Use default debug icon (was yanked in 2.8.3, now it returns!) ([PR #149](https://github.com/mark-wiemer/ahkpp/pull/149))

## 2.8.4 - 2022-07-07

-   Revert to 2.8.2 due to issues with 2.8.3

## 2.8.3 (yanked) - 2022-07-04 🦅

> This release has been yanked, meaning it's not supported. Use 2.8.4 instead.

-   Change to use default debug icon ([#100](https://github.com/mark-wiemer/ahkpp/issues/100))

-   ⛓️‍💥 Unexpected breaking change: Break "step into" function of debugger.

## 2.8.2 - 2022-06-11 🎂

-   No user-facing changes
-   Security fixes in dependencies
-   Update internal dependencies: Node v16, npm v8
-   Close #126

## 2.8.1 - 2021-05-09

-   Fix indentation with `(::` ([#72](https://github.com/mark-wiemer/ahkpp/issues/72))

## 2.8.0 - 2021-03-14

-   Add setting to toggle debug button in editor title menu ([#10](https://github.com/mark-wiemer/ahkpp/issues/10))

## 2.7.2 - 2021-03-02

-   Fix indentation with parentheses again (sorry!) ([#58](https://github.com/mark-wiemer/ahkpp/issues/58))

## 2.7.1 - 2021-02-28

-   Fix indentation with parentheses ([#25](https://github.com/mark-wiemer/ahkpp/issues/25))

## 2.7.0 - 2021-02-21

-   Respect user choice to indent with either tabs or spaces ([#49](https://github.com/mark-wiemer/ahkpp/issues/49))

## 2.6.3 - 2021-02-20

-   Fix IntelliSense ([#48](https://github.com/mark-wiemer/ahkpp/issues/48))
-   Move `Run Selection` command to same category as all other commands (Thanks [@fade2gray](https://github.com/fade2gray)!)

## 2.6.2 - 2021-01-30

-   Fix formatting after ternary operator ([#18](https://github.com/mark-wiemer/ahkpp/issues/18))
-   Fix formatting after multiple close braces on one line ([#26](https://github.com/mark-wiemer/ahkpp/issues/26))

## 2.6.1 - 2021-01-23

-   Fix hover provider ([#16](https://github.com/mark-wiemer/ahkpp/issues/16))

## 2.6.0 - 2021-01-18

### Features

-   Add `Open Help` command
-   Add `Run Selection` command
-   Add foldable region comments

### Fixes

-   Improve formatting for using `ExitApp` to end subroutines
-   Fix function coloring for functions whose names were also keywords ([#11](https://github.com/mark-wiemer/ahkpp/issues/11))
-   Fix function coloring for calls with a space before the parentheses (e.g. `foo ()`)
-   Fix detection of labels indented with a tab
-   Remove confusing deprecation warning from `StrSplit` function
-   Remove variables from outline

## 2.5.12 - 2020-11-08

-   Improve settings readability
-   Fix bogus snippets
-   Improve Marketplace presence

## 2.5.11 - 2020-11-07

-   Update icon
-   Change marketplace banner color
-   Add development documentation

## 2.5.10 - 2020-11-07

-   Change ownership (from `cweijan` to `mark-wiemer`)
-   Change configuration title to 'AutoHotkey Plus Plus'
-   Update readme
-   Increase icon resolution

<details><summary>Older releases from AutoHotkey Plus</summary>

> These releases are not versions of AHK++, but carried over from [AutoHotkey Plus by cweijan](https://marketplace.visualstudio.com/items?itemName=cweijan.vscode-autohotkey-plus) and the git history of this repo.

## 2.5.6 - 2020-10-06

-   Fix syntax error.
-   Fix variable detect error.

## 2.5.5 - 2020-09-29

-   Fix rename bug.
-   Bind key to context menu command.

## 2.5.4 - 2020-09-27

-   Enable IntelliSense as default.
-   Fix switch format error.
-   fix variable detect fail.

## 2.5.3 - 2020-09-22

-   Fix rename fail when un-save.
-   Simple support variable detect.
-   Simple implement intellisense.

## 2.5.0 - 2020-09-21

-   Adaptation zero-plus debugger extension.
-   Support renaming functions.

## 2.4.5~2.4.16

-   Just fix bugs.

## 2.4.4 - 2020-06-27

-   Support find function references.
-   Fix syntax bug.

## 2.4.3 - 2020-06-25

-   Add command|function hover feature.
-   Add labels to outline.
-   More syntax support.

## 2.4.2 - 2020-06-24

-   Support restart current program.
-   Support go to label.
-   Fix bugs.

## 2.4.1 - 2020-05-31

-   Support config compiler path.
-   Show variable detail in debug evaluate

## 2.4.0 - 2020-05-30

-   Support get and modify variable in debug evaluate
-   Support pause and continue run script.
-   Support OutputDebug command.
-   Support run unsaved ahk script.

## 2.3.4 - 2020-04-15

-   Support change variable value when debug, contribute by @zero-plusplus.

## 2.3.1 - 2020-04-12

-   Support view variable when change call stack.

## 2.3.0 - 2020-04-11

-   Variable view support complex variable value, contribute by @zero-plusplus.
-   Enhance function detector.

## 2.2.2 - 2020-03-27

-   Fix path with space error.

## 2.2.0 - 2020-03-25

-   Support change default ahk execute path.
-   Support simple debug.

## 2.1.6 - 2020-03-23

-   Find definition in whole workspace.
-   Try go to include script in workspace.

## 2.1.2 - 2020-03-22

-   Update snippets.

## 2.1.0 - 2020-03-19

-   Support Run Script.

## 2.0.3 - 2020-03-10

-   Fix detecting if and while blocks as function calls.
-   Support "go to function definition" in same file.

## 2.0.2 - 2019-11-27

-   Enhance function symbol detection.

## Older

There is no changelog for versions older than 2.0.2.

</details>
