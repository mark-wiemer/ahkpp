# Settings

AHK++ has a lot of configuration options, and they can be hard to understand
within VS Code's default settings editor. This page covers every setting in
detail. If you have any questions, feel free to
[start a discussion](https://github.com/mark-wiemer/ahkpp/discussions/new?category=q-a)
🤓

For advanced users, all settings can be found in
[package.json](../package.json), under the `contributes.configuration` and
`contributes.configurationDefault` sections. A description of each property is
in [package.nls.json](../package.nls.json). This page aggregates all that
information while removing the fluff :)

## AHK++ settings reference

All settings, alphabetically by section ID:

<!-- Values are user-facing from VS Code's settings editor, hence `v1: File` instead of `v1.file`. Note that users **do** see camelCase property names! -->

| Section                          | Property                      | Type                                                   | Default                                             | Description                                                                                                                                                                                                                                                            |
| -------------------------------- | ----------------------------- | ------------------------------------------------------ | --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Compiler                         | compileIcon                   | path                                                   | (empty string)                                      | Icon path for the compiled AHK file (optional).                                                                                                                                                                                                                        |
| Compiler                         | compilerPath                  | path                                                   | C:/Program Files/AutoHotkey/Compiler/Ahk2Exe.exe    | Path to the AHK compiler. This is the same for both v1 and v2.                                                                                                                                                                                                         |
| Compiler                         | useMpress                     | boolean                                                | false                                               | Use [MPRESS](https://www.autohotkey.com/mpress/mpress_web.htm) (if available) to compress the resulting executable.                                                                                                                                                    |
| Exclude                          | (n/a)                         | string array                                           | (empty array)                                       | [Glob patterns](<https://en.wikipedia.org/wiki/Glob_(programming)>) for excluding files and folders from completion suggestions. Applies even when files are opened. Scripts included with `#Include` are never excluded.                                              |
| Experimental                     | funcDefSearch                 | boolean                                                | false                                               | Get function info and definitions based on included and library files only. When false, reads from the entire workspace. Changes take effect after restart.                                                                                                            |
| General                          | showOutput                    | <ul><li>always</li><li>never</li></ul>                 | always                                              | Automatically show output view when running a script. View can always be toggled with F1 > 'View: Toggle Output' (`Ctrl+Shift+U`). <ul><li>always: Always open the output view when running a script</li><li>never: Never automatically show the output view</li></ul> |
| General                          | logLevel                      | enum, see note 1                                       | info                                                | Level of logs to display in the output view. Changes take effect after restart.                                                                                                                                                                                        |
| Menu                             | showDebugButton               | boolean                                                | true                                                | Show the debug buttons in the editor title menu.                                                                                                                                                                                                                       |
| v1: File                         | compileBaseFile               | path                                                   | (empty string)                                      | Base file path for compiling v1 scripts (optional).                                                                                                                                                                                                                    |
| v1: File                         | helpPath                      | path                                                   | C:/Program Files/AutoHotkey/AutoHotkey.chm          | Path to the AHK v1 help document.                                                                                                                                                                                                                                      |
| v1: File                         | interpreterPath               | path                                                   | C:/Program Files/AutoHotkey/AutoHotkeyU64.exe       | Path to the AHK v1 interpreter.                                                                                                                                                                                                                                        |
| v1: File                         | templateSnippetName           | string                                                 | AhkTemplateV1                                       | The name of the [template snippet](./template-snippet.md) to populate new AHK v1 files. If blank, no snippet will be applied.                                                                                                                                          |
| v1: Formatter                    | allowedNumberOfEmptyLines     | number                                                 | 1                                                   | Allowed number of empty lines. <ul><li>-1: Ignore empty lines.</li><li>0: No empty lines.</li></ul>                                                                                                                                                                    |
| v1: Formatter                    | indentCodeAfterIfDirective    | boolean                                                | true                                                | Indent code after a directive that creates context-sensitive hotkeys or hotstrings (`#If`, `#IfWinActive`, `#IfWinNotActive`, `#IfWinExist`, `#IfWinNotExist`).                                                                                                        |
| v1: Formatter                    | indentCodeAfterLabel          | boolean                                                | true                                                | Indent code after hotkeys and labels in top-level code blocks.                                                                                                                                                                                                         |
| v1: Formatter                    | preserveIndent                | boolean                                                | false                                               | Preserve indentation on empty line.                                                                                                                                                                                                                                    |
| v1: Formatter                    | trimExtraSpaces               | boolean                                                | false                                               | Trim extra spaces between words and symbols                                                                                                                                                                                                                            |
| v1: IntelliSense                 | maximumParseLength            | number                                                 | 10000                                               | Number of lines to parse each AHK file for IntelliSense. <ul><li>-1: Unlimited parsing</li><li>0: No parsing</li></ul>Changes take effect after restart.                                                                                                               |
| v2: Completion commit characters | Class                         | string                                                 | .(                                                  | Characters which commit auto-completion for classes                                                                                                                                                                                                                    |
| v2: Completion commit characters | Function                      | string                                                 | (                                                   | Characters which commit auto-completion for functions                                                                                                                                                                                                                  |
| v2: Debug configuration          | (n/a)                         | object                                                 | (see note 2)                                        | The [launch configuration](https://code.visualstudio.com/docs/editor/debugging#_launch-configurations) to use when debugging                                                                                                                                           |
| v2: Diagnostics                  | classNonDynamicMemberCheck    | boolean                                                | true                                                | Check whether non-dynamic members of a class exist                                                                                                                                                                                                                     |
| v2: Diagnostics                  | paramsCheck                   | boolean                                                | true                                                | Check that the function call has the correct number of arguments                                                                                                                                                                                                       |
| v2: File                         | compileBaseFile               | path                                                   | (empty string)                                      | Base file path for compiling v2 scripts (optional)                                                                                                                                                                                                                     |
| v2: File                         | helpPath                      | path                                                   | C:/Program Files/AutoHotkey/v2/AutoHotkey.chm       | Path to the AHK v2 help document                                                                                                                                                                                                                                       |
| v2: File                         | interpreterPath               | path                                                   | C:\\Program Files\\AutoHotkey\\v2\\AutoHotkey64.exe | Path to the AHK v2 interpreter                                                                                                                                                                                                                                         |
| v2: File                         | maxScanDepth                  | number                                                 | 2                                                   | Depth of folders to scan for IntelliSense                                                                                                                                                                                                                              |
| v2: File                         | templateSnippetName           | string                                                 | AhkTemplateV2                                       | The name of the snippet to populate new AHK v2 files                                                                                                                                                                                                                   |
| v2: Formatter                    | arrayStyle                    | <ul><li>collapse</li><li>expand</li><li>none</li></ul> | none                                                | Line break style for array formatting                                                                                                                                                                                                                                  |
| v2: Formatter                    | braceStyle                    | enum, see note 3                                       | One True Brace                                      | Line break style for brace placement                                                                                                                                                                                                                                   |
| v2: Formatter                    | breakChainedMethods           | boolean                                                | false                                               | Whether to break chained function calls onto new lines. Methods are just functions associated with an object, this setting will be renamed to `breakChainedFunctions` in a future AHK version.                                                                         |
| v2: Formatter                    | ignoreComment                 | boolean                                                | false                                               | Whether to ignore formatting within comments                                                                                                                                                                                                                           |
| v2: Formatter                    | indentBetweenHotIfDirectives  | boolean                                                | false                                               | Whether to indent code between HotIf directives                                                                                                                                                                                                                        |
| v2: Formatter                    | indentString                  | string                                                 | (four spaces)                                       | String to use for indentation (usually one tab or some spaces)                                                                                                                                                                                                         |
| v2: Formatter                    | keywordStartWithUppercase     | boolean                                                | false                                               | Whether keywords should start with uppercase                                                                                                                                                                                                                           |
| v2: Formatter                    | maxPreserveNewlines           | number                                                 | 2                                                   | Maximum number of consecutive empty lines to preserve                                                                                                                                                                                                                  |
| v2: Formatter                    | objectStyle                   | <ul><li>collapse</li><li>expand</li><li>none</li></ul> | none                                                | Line break style for object formatting                                                                                                                                                                                                                                 |
| v2: Formatter                    | preserveNewlines              | boolean                                                | true                                                | Whether to preserve existing line breaks                                                                                                                                                                                                                               |
| v2: Formatter                    | spaceAfterDoubleColon         | boolean                                                | true                                                | Whether to add space after double colons                                                                                                                                                                                                                               |
| v2: Formatter                    | spaceBeforeConditional        | boolean                                                | true                                                | Whether to add space before conditional statements                                                                                                                                                                                                                     |
| v2: Formatter                    | spaceInEmptyParen             | boolean                                                | false                                               | Whether to add space in empty parentheses                                                                                                                                                                                                                              |
| v2: Formatter                    | spaceInOther                  | boolean                                                | true                                                | Whether to add spaces in other contexts                                                                                                                                                                                                                                |
| v2: Formatter                    | spaceInParen                  | boolean                                                | false                                               | Whether to add spaces inside parentheses                                                                                                                                                                                                                               |
| v2: Formatter                    | switchCaseAlignment           | boolean                                                | false                                               | Whether to align switch case statements                                                                                                                                                                                                                                |
| v2: Formatter                    | symbolWithSameCase            | boolean                                                | false                                               | Whether to maintain case consistency in symbols                                                                                                                                                                                                                        |
| v2: Formatter                    | whitespaceBeforeInlineComment | string                                                 | (empty string)                                      | Whitespace to add before inline comments                                                                                                                                                                                                                               |
| v2: Formatter                    | wrapLineLength                | number                                                 | 120                                                 | Maximum line length before wrapping (0 to disable)                                                                                                                                                                                                                     |
| v2: General                      | actionWhenV1Detected          | enum, see note 4                                       | "SwitchToV1"                                        | Action when v1 script is detected                                                                                                                                                                                                                                      |
| v2: General                      | commentTagRegex               | regex                                                  | `^;;\\s\*(?<tag>.+)`                                | The regular expression for custom symbols to appear in the breadcrumb and elsewhere. Default matches any line that starts with `;;`. Changes take effect after restart.                                                                                                |
| v2: General                      | completeFunctionCalls         | boolean                                                | false                                               | Whether to automatically add parentheses when calling a function                                                                                                                                                                                                       |
| v2: General                      | librarySuggestions            | enum, see note 5                                       | Disabled                                            | Which libraries to suggest functions from, if any. In case of issues, please restart your IDE.                                                                                                                                                                         |
| v2: General                      | symbolFoldingFromOpenBrace    | boolean                                                | false                                               | Fold parameter lists separately from definitions                                                                                                                                                                                                                       |
| v2: General                      | syntaxes                      | path                                                   | (empty string)                                      | Path to the folder containing ahk2.json, ahk2.d.ahk, and \*.snippet.json files used by IntelliSense.                                                                                                                                                                   |
| v2: Warn                         | callWithoutParentheses        | <ul><li>Off</li><li>Parentheses</li><li>On</li></ul>   | Off                                                 | Display warnings for each function call without parentheses. <ul><li>Parentheses: warn when parentheses appear after a space, e.g. `MsgBox ("hi")`</li></ul> Changes take effect after restart.                                                                        |
| v2: Warn                         | localSameAsGlobal             | boolean                                                | false                                               | Display warnings for each undeclared local variable that has the same name as a global variable. Changes take effect after restart.                                                                                                                                    |
| v2: Warn                         | varUnset                      | boolean                                                | true                                                | Display a warning when referencing an unassigned variable. Changes take effect after restart.                                                                                                                                                                          |
| v2: Working directories          | (n/a)                         | path array                                             | (empty array)                                       | Additional directories containing referenced AHK files, separate from the [script library folders](https://www.autohotkey.com/docs/v2/Scripts.htm#lib).                                                                                                                |

Note 1: Log level: Log level values track [Microsoft.Extensions.Logging.LogLevel](https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.logging.loglevel).
Logs may include filenames on your local machine, so always be careful before sharing them with others.
Logs are never sent over any network and are never visible outside of your machine unless you actively share them.

Note 2: Default `AHK++.v2.debugConfiguration`:

```json
{
    "port": "9002-9100",
    "useAnnounce": "detail",
    "useAutoJumpToError": true,
    "useDebugDirective": true,
    "usePerfTips": true
}
```

Note 3: Possible values of v2: Formatter `braceStyle`:

-   One True Brace
-   Allman
-   One True Brace Variant

Note 4: Possible values of v2: General `actionWhenV1Detected`:

-   Continue
-   Warn
-   StopParsing
-   SwitchToV1
-   SkipLine

Note 5: Possible values of v2: General `librarySuggestions`:

-   Disabled
-   Local
-   User and Standard
-   All

## Experimental settings

Experimental settings enable functionality with known issues. If you see an issue that isn't known, please [report it](https://github.com/mark-wiemer/ahkpp/issues/new/choose)!

### funcDefSearch

This setting fixes [issue #205](https://github.com/mark-wiemer/ahkpp/issues/205), where Ctrl+clicking a function call sometimes takes users to the wrong function definition.

Known issues with this feature:

-   It does not account for `#include <dir>` directives which change the base path of inclusion ([#628](https://github.com/mark-wiemer/ahkpp/issues/628))

Related issues:

-   Functions declared in user or standard libraries are not found unless they're located in the workspace or referenced by `#include path/to/libFile.ahk`. `#include <lib>` is not recognized by AHK++. ([#629](https://github.com/mark-wiemer/ahkpp/issues/629))

## Other IDE settings

It's always good to explore your IDE! There are a million settings to learn,
here are some VS Code favorites picked by the community:

-   `editor.quickSuggestions`: Whether to show inline suggestions as you type.
-   `editor.parameterHints.enabled`: Whether to show a pop-up that shows
    parameter documentation and type information as you type.
-   `editor.hover.enabled`: Whether the hover is shown. The hover suggests
    autocompletion for symbol names.

### Formatting

These settings control when code is formatted. You can disable AHK formatting entirely by setting the default formatter to "None (null)":

-   `editor.formatOnPaste`
-   `editor.formatOnSave`
-   `@id:editor.defaultFormatter @lang:ahk`
-   `@id:editor.defaultFormatter @lang:ahk2`

See [#619](https://github.com/mark-wiemer/ahkpp/discussions/619) for a detailed discussion.
