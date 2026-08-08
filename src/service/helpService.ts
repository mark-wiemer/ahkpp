// openHelp adapted from thqby/vscode-autohotkey2-lsp, used under GNU LGPLv3
// https://github.com/thqby/vscode-autohotkey2-lsp/blob/fa0782e8a221e54e5755358eb594ae9cc872ca1a/client/src/extension.ts#L348
import { ConfigKey, Global } from '../common/global';
import { existsSync } from 'fs';
import * as vscode from 'vscode';
import * as child_process from 'child_process';
import { isV1 } from '../common/codeUtil';
import { findInterpreterPath } from '../common/utils';

/**
 * Returns the text to use as a search.
 * If there is selected text that's not all whitespace, it's trimmed and returned.
 * If the selected text is empty or whitespace, the word at the cursor is returned.
 * If there is no word immediately before or after the cursor, empty string is returned.
 */
const getSearchText = (
    document: vscode.TextDocument,
    selection: vscode.Selection,
): string => {
    const selectedText = document.getText(selection).trim();
    if (selectedText) {
        return selectedText;
    }
    // vscode.Document.getWordRangeAtPosition() returns the whole file if there is no word at the cursor
    const wordAtCursor = document.getText(
        document.getWordRangeAtPosition(selection.active),
    );
    if (!wordAtCursor.includes('\n')) {
        return wordAtCursor;
    }

    return '';
};

const buildScriptV1 = (
    searchText: string,
    helpPath: string,
    launchHelp = true,
) => `
SetWinDelay 10
SetKeyDelay 0
searchText := "${searchText.replaceAll('"', '""')}" ; Escape double quotes 
searchText := StrReplace(searchText, "#", "{#}")
${
    launchHelp
        ? `IfWinNotExist, AutoHotkey Help
{
    Run ${helpPath}
}`
        : ''
}
WinWait AutoHotkey Help
WinActivate
WinWaitActive
Send, !s
Sleep 200
Send {home}
Sleep 10
Send +{end}%searchText%{enter}
ExitApp
`;

const buildScriptV2 = (
    searchText: string,
    helpPath: string,
    launchHelp = true,
) => `
SetWinDelay(10)
SetKeyDelay(0)
searchText := "${searchText}"
helpWindow := "ahk_class HH Parent"
${
    launchHelp
        ? `if (not WinExist(helpWindow))
{
    Run "${helpPath}"
}`
        : ''
}
WinWait helpWindow
WinActivate helpWindow
WinWaitActive helpWindow
StrReplace(searchText, "#", "{#}")
Send "!s"
Sleep 200
Send "{home}"
Sleep 10
Send "+{end}" searchText "{enter}"
ExitApp()
`;

export async function openHelp() {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
        return;
    }
    const searchText = getSearchText(editor.document, editor.selection);
    const helpPath = isV1()
        ? Global.getConfig<string>(ConfigKey.helpPathV1)
        : Global.getConfig<string>(ConfigKey.helpPathV2);
    const configuredInterpreterPath = Global.getConfig<string>(
        isV1() ? ConfigKey.interpreterPathV1 : ConfigKey.interpreterPathV2,
    );
    const storeAlias = isV1() ? 'AutoHotkeyV1.exe' : 'AutoHotkeyV2.exe';
    const interpreterPath = findInterpreterPath(
        configuredInterpreterPath,
        storeAlias,
    );
    const buildFunc = isV1() ? buildScriptV1 : buildScriptV2;
    const useStoreHelp =
        !existsSync(helpPath) && interpreterPath === storeAlias;
    if (!existsSync(helpPath) && !useStoreHelp) {
        vscode.window.showErrorMessage(
            `Help path "${helpPath}" does not exist`,
        );
        return;
    }
    if (!interpreterPath) {
        vscode.window.showErrorMessage(
            `Interpreter path "${configuredInterpreterPath}" does not exist`,
        );
        return;
    }
    if (useStoreHelp) {
        const launcherPath = `C:\\Program Files\\AutoHotkey\\UX\\LaunchHelpV${
            isV1() ? 1 : 2
        }.ahk`;
        child_process.spawn(interpreterPath, [launcherPath], {
            detached: true,
        });
    }
    try {
        // Using this as its own file is difficult with esbuild
        child_process.execSync(`"${interpreterPath}" /ErrorStdOut *`, {
            input: buildFunc(searchText, helpPath, !useStoreHelp),
        });
    } catch {
        // If user selects value starting with `"`, we get here
        child_process.execSync(`"${interpreterPath}" /ErrorStdOut *`, {
            input: buildFunc('', helpPath, !useStoreHelp),
        });
    }
}
