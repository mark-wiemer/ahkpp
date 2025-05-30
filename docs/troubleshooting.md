# Troubleshooting guide

If AHK++ isn't behaving as you expect, here are some things you can try.

## AHK language version mismatch

If you only use one version of AHK (e.g. only AHK v1 or only AHK v2), we recommend manually configuring the file association of `.ahk` files. This allows AHK++ to correctly process scripts according to your preferred AHK version.

1. Open a `.ahk` file
1. F1 > "Change Language Mode" (Ctrl+K, M)
1. Configure file association for ".ahk"
1. Choose your preferred version

All files should now be updated. Unfortunately, this isn't a VS Code setting, so you may have to redo this step if you change profiles, reinstall VS Code, etc.

## AHK v2: Validate your interpreter

For AHK v2, the language server may not behave correctly if it fails to identify a valid path to an interpreter like `AutoHotkey.exe`. The status bar at the bottom left of your IDE should show the current interpreter or an option to "Select AHK v2 Interpreter".

> Currently, the "Select AHK v2 Interpreter" command does not work, ref [#571](https://github.com/mark-wiemer/ahkpp/issues/571).
> To ensure the extension fully recognizes your interpreter, try to run (not debug) an AHK v2 script. If you get a "... does not exist" error message, the corresponding quick pick will work.

> Currently, AHK++ does not support the Windows Store edition of AHK v2, but there are plans to support it by the end of 2024, ref [#496](https://github.com/mark-wiemer/ahkpp/issues/496).

Interpreter found:

![AHK v2 interpreter version and path](../image/ahkV2InterpreterAndPath.png)

Interpreter not found:

![Select AHK v2 Interpreter in status bar](../image/selectAHKV2Interpreter.png)

## Restart extensions

Some settings changes only take effect after restart. Other issues may arise that are mitigated with a restart.

To restart all extensions, press `F1` to open the command palette and enter "Developer: Restart Extension Host". Extensions should restart within a few seconds.

If you're able to consistently reproduce the issue, please [open a bug](https://github.com/mark-wiemer/ahkpp/issues/new/choose).

## Install specific version of AHK++

If a recent release is causing issues, you can revert to a previous version via your IDE's extensions view.

1. Select AHK++
1. Near "uninstall", click the small caret (down arrow)
1. Select "Install Specific Version..."
1. A quick pick will open with all versions, select whichever one you like.
    > Note that changing the major version (e.g. from 6.x to 5.x) will likely result in some issues. Refer to [changelog.md](../changelog.md) for details.

![IDE extensions view, showing uninstall alt > install specific version](../image/installSpecificVersion.png)

The current installed version of AHK++ is also shown to the right of the extension name for clarity, outlined above in red.

If the issue goes away with the older version of AHK++, please [open a bug](https://github.com/mark-wiemer/ahkpp/issues/new/choose).

## Advanced troubleshooting

These steps shouldn't be necessary for most issues, and may be difficult to execute. Feel free to open an issue without trying these :)

### Debug logs

If you're having issues, you can restart AHK++ in debug mode for more logs. Set `AHK++.general.logLevel` to `debug` to see all logs. Then restart the extension using `F1 > Developer: Restart Extension Host`.

Using `Ctrl+Shift+U` to open the output view, you can select either of the AHK++ channels to see all debug logs. You're welcome to map these logs to calls in the source code. Please include your findings if you [open a bug](https://github.com/mark-wiemer/ahkpp/issues/new/choose).

### Full uninstall and reinstall

VS Code automatically caches your extensions, even when uninstalled. You can use an app called [Everything](https://www.voidtools.com/downloads/) to quickly find and delete any cached versions, or navigate to them however you like. The default cache location is `~\AppData\Roaming\Code\CachedExtensionVSIXs\mark-wiemer.vscode-autohotkey-plus-plus`, where `~` is the path to your home folder, like `C:\Users\mark`, so the absolute path would start with `C:\Users\mark\AppData\...`.

After deleting these cache locations and restarting VS Code, you should be able to get a fully fresh installation from the registry. This should resolve any issues if you believe your installed extension files got corrupted.

![Everything search results showing two cached versions of AHK++](../image/cached-extensions-everything.png)
