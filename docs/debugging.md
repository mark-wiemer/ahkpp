# Debugging

You can use AHK++ as a [debugger](https://en.wikipedia.org/wiki/Debugger) for AHK scripts.

## Via keyboard shortcut

When an AHK file is open, press `Ctrl+Alt+F9` to start debugging.

## Via title bar

AHK++ adds run and debug buttons to the editor's title bar whenever an AHK file is opened.

1. Open an AHK file
1. Find the run button near the top right of the editor
1. Click the dropdown alt of the run button
1. Click "Debug AHK Script"

![](../image/debugTitleBar.png)

## Via launch.json

VS Code supports debug configurations definitions in `.vscode/launch.json`. This can be a useful way to run your `main.ahk` script from wherever you are in your workspace with a single keystroke.

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
                "program": "${workspaceFolder}/main.ahk1", // backslashes and mixed slashes also supported
                "stopOnEntry": true,
            },
        ],
    }
    ```

1. Press `F5` to debug your project

### Notes

AHK++ ignores the `runtime` argument common in other debuggers. Instead, all debug sessions use either the `V1: File > interpreterPath` or `V2: File > interpreterPath` setting. See [settings.md](./settings.md) for details.

## Troubleshooting

If debugging starts but suddenly stops silently, you may have a syntax error. Try just running your script, not debugging it, to see if it works. For advanced troubleshooting, see [troubleshooting.md](./troubleshooting.md)

---

## For contributors

Debuggers are hard to work with. We recommend adding `Out.debug` statements, re-packaging the extension, re-installing it, and restarting extensions. Then you can work with the `demos/manualTests/debugger.ahk*` files. Trying to start a debugger while in a debug session is difficult. Trying to debug a debugger at all is also difficult. Good luck, be patient, and be ready to read a lot of docs.
