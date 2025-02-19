# Debugging

You can use AHK++ as a [debugger](https://en.wikipedia.org/wiki/Debugger) for AHK scripts.

## Via keyboard shortcut

When an AHK file is open, use the `Ctrl+Alt+F9` keyboard shortcut to start debugging

## Via title bar

AHK++ adds run and debug buttons to the editor's title bar whenever an AHK file is opened.

1. Open an AHK file
1. Find the run button near the top right of the editor
1. Click the dropdown alt of the run button
1. Click "Debug AHK Script"

![](../image/debugTitleBar.png)

## Via launch.json

VS Code supports debug configurations definitions in `.vscode/launch.json`. This can be a useful way to run your `main.ahk` script from wherever you are in your workspace with a single keystroke.

⚠️ There are some known issues with AHK++ support for debug configurations, refer to [#603](https://github.com/mark-wiemer/ahkpp/issues/603) for details.

1. Create `.vscode/launch.json` in your workspace
1. Populate it with whatever launch config you prefer, for example:

    ```jsonc
    {
        "version": "0.2.0",
        "configurations": [
            {
                "type": "ahk", // or ahk2
                "request": "launch",
                "name": "AutoHotkey debugger",
                "program": "${workspaceFolder}\\main.ahk1", // requires backslashes for now
                "stopOnEntry": true,
            },
        ],
    }
    ```

1. Press `F5` to debug your project
