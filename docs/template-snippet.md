# Template snippet

The template snippet is applied to the top of each new AHK file. Here is a sample:

```ahk
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%
```

AHK++ includes two default templates: one for each AHK version. The default templates are provided by extension-owned snippets, so VS Code does not show or allow editing them through the Command Palette. To customize a template snippet, create a user snippet and configure AHK++ to use it:

1. In VS Code, open the command palette (F1) and go to "Snippets: Configure Snippets".

1. Choose a global snippets file or create a new one.

1. Create a new snippet with a unique name, for example:

    ```json
    "MyAhkTemplate": {
        "body": [
            "; My new script with no directives",
            "; Here is a second comment line",
            ""
        ]
    }
    ```

1. Update your VS Code settings: Both `AHK++.v1.file` and `AHK++.v2.file` have a `templateSnippetName` entry. Update that to the name of your snippet (`MyAhkTemplate`)

To test, just create a new file! If you have any issues, please [open a discussion](https://github.com/mark-wiemer/ahkpp/discussions).

## Troubleshooting

The name of the snippet must be unique, not used by any other extension. This extension uses the names `AhkTemplateV1` and `AhkTemplateV2`. Other extensions may use similar names.

## Reference

The default templates are as follows:

v1:

```ahk
#NoEnv
#SingleInstance, Force
SendMode, Input
SetBatchLines, -1
SetWorkingDir, %A_ScriptDir%
```

v2:

```ahk
#Requires AutoHotkey v2.0
```
