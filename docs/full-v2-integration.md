# Full v2 integration

This page serves as a migration guide from AHK++ 5.0.7 to AHK++ 6.0.0. It may not be fully up-to-date with the latest version of AHK++, but breaking changes will only be present in AHK++ 7 and later.

This doc covers all the new features as a result of integrating with thqby's AHK v2 Language Support extension in AHK++ 6. See [known issues](#known-issues) at the bottom of this file for more details.

## The big changes

-   AHK v2 formatting support
-   AHK v2 snippets support
-   Better v2 IntelliSense support: rename, better hovers, and more

## package.json contributions

### New commands

-   Debug AHK and Attach (`ahk++.debugAttach`): Debug and attach to the debug session for advanced use-cases. Requires zero-plusplus.vscode-autohotkey-debug.
-   Debug AHK with Params (`ahk++.debugParams`): Debug and add user-provided command-line arguments to the debugger for advanced use-cases. Requires zero-plusplus.vscode-autohotkey-debug.
-   Run AHK++ Diagnostic (`ahk++.diagnostic.full`): Effectively restart the AHK v2 features of the app.
-   Export AHK Symbols (`ahk++.exportSymbols`): Export application functions and classes to a new file. Only for AHK v2.
-   Stop AHK Script (`ahk++.stop`): Stop an AHK script of user choice ran via `Run AHK Script` or any of the `Debug AHK ...` commands. If only one script is running, stop that without asking for confirmation.
-   Add Doc Comment (`ahk++.addDocComment`): Add a function header comment for the current function
-   Update File Version Info (`ahk++.updateVersionInfo`): Add or update a file header comment
-   Switch AHK Version (`ahk++.switchAhkVersion`): Change between AHK v1 and v2 for the current file
-   Select AHK Syntaxes (`ahk++.selectSyntaxes`): Select custom AHK v2 syntax files for advanced use-cases. PRs are welcomed if the default syntaxes aren't sufficient!
-   Set A_ScriptDir Here (`ahk++.setAScriptDir`): Set [`A_ScriptDir`](https://www.autohotkey.com/docs/v2/Variables.htm#ScriptDir) to the path of the current file. Only for AHK v2.
-   Set AHK v2 Interpreter (`ahk++.setV2Interpreter`): Open a quick pick to change the AHK v2 interpreter for all scripts.

### New settings

All new settings are in the `V2` settings category

-   Action When V1 Detected: Action when v1 script is detected
-   Library Suggestions: Whether to suggest functions included in library files
-   Comment Tag Regex: The regular expression for custom symbols to appear in the breadcrumb and elsewhere. Default matches any line that starts with `;;`
-   Complete Function Calls: Whether to automatically add parentheses when calling a function
-   Completion Commit Characters: Characters which commit auto-completion
-   Debug Configuration: The [launch configuration](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations) to use when debugging
-   Diagnostics
    -   Class Non Dynamic Member Check: Check whether non-dynamic members of a class exist when lexing
    -   Params Check: Check that the function call has the correct number of arguments
-   Formatter: Options for how to format a file. v1 and v2 formatters have their own settings due to very different implementations.
-   File
    -   Exclude: Glob patterns for excluding files and folders when scanning AHK files.
    -   Max Scan Depth: Depth of folders to scan for IntelliSense. Negative values mean infinite depth.
-   Warn
    -   Var Unset: Display a warning when referencing an unassigned variable. Changes take effect after restart.
    -   Local Same As Global: Display warnings for each undeclared local variable that has the same name as a global variable. Changes take effect after restart.
    -   Call Without Parentheses: Display warnings for each function call without parentheses. Changes take effect after restart.
-   Symbol Folding From Open Brace: Fold parameter lists separately from definitions. Recommended false for consistency with other languages.
-   Working Directories: The directories containing referenced AHK files

### Configuration defaults

```json
{
    "[ahk2]": {
        "editor.defaultFormatter": "mark-wiemer.vscode-autohotkey-plus-plus",
        "editor.quickSuggestions": {
            "other": true,
            "comments": false,
            "strings": true
        }
    }
}
```

### Grammars

-   Added `embeddedLanguages` to `ahk2`
-   Added `~ahk2-output` (debug output syntax)

### Keybindings

See [commands](#commands) for duplicates

-   ahk++.debugParams
-   ahk++.stop

### Languages

-   ahk2.configuration.json

### Menus

See [commands](#commands) for duplicates

editor/context:

-   ahk++.debugAttach
-   ahk++.debugParams
-   ahk++.stop
-   ahk++.addDocComment
-   ahk++.updateVersionInfo

editor/title:

-   ahk++.stop

### Semantic token scopes

New, added:

```json
[
    {
        "language": "ahk2",
        "scopes": {
            "operator": ["keyword.operator.wordlike.ahk2"]
        }
    }
]
```

## Known issues

### Low priority

These issues will be backlogged and resolved after a full release

-   Exclude setting doesn't work, ref [issue #488](https://github.com/mark-wiemer/ahkpp/issues/488)
-   No newline at end of file when formatting (inconsistent with v1 and industry standards)
-   Issue with custom folding and comment blocks (see v2/settings.ahk2)
-   Cleanup `indentString` to be "spaces" vs "tabs" with a `tabSize` option as well
-   Error message: `Request textDocument/foldingRange failed.` on files that switch from AHK v2 to v1, see manualTests/languageVersion

### Cut

-   No browser support. AHK++ did not have this before, we can add it later if users want it
