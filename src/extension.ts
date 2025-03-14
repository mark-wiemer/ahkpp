import * as vscode from 'vscode';
import { ProviderResult } from 'vscode';
import { buildByPath, clearCache } from './parser/parser';
import { RunnerService } from './service/runnerService';
import { DebugSession } from './debugger/debugSession';
import { DefProvider } from './providers/defProvider';
import { createEditorListener } from './service/templateService';
import { FormatProvider } from './providers/formattingProvider';
import { SymbolProvider } from './providers/symbolProvider';
import { FileManager } from './common/fileManager';
import { AhkHoverProvider } from './providers/ahkHoverProvider';
import { RefProvider } from './providers/refProvider';
import { ConfigKey, configPrefix, Global } from './common/global';
import { AhkRenameProvider } from './providers/ahkRenameProvider';
import { SignatureProvider } from './providers/signatureProvider';
import { CompletionProvider } from './providers/completionProvider';
import { openHelp } from './service/helpService';
import { initializeLanguageVersionService } from './service/languageVersionService';
import { activate as activateV2 } from '../ahk2/client/src/extension';

export function activate(context: vscode.ExtensionContext) {
    (async () => {
        Global.updateStatusBarItems('Indexing AutoHotkey workspace...');
        await buildByPath(vscode.workspace.workspaceFolders?.[0].uri.fsPath);
        Global.updateStatusBarItems('Indexed AutoHotkey workspace :)');
        Global.hide();
    })();

    const language = { language: 'ahk' };
    FileManager.init(context);
    initializeLanguageVersionService(context);
    context.subscriptions.push(
        vscode.languages.registerHoverProvider(
            language,
            new AhkHoverProvider(context),
        ),
        vscode.languages.registerDefinitionProvider(
            language,
            new DefProvider(),
        ),
        vscode.languages.registerRenameProvider(
            language,
            new AhkRenameProvider(),
        ),
        vscode.languages.registerSignatureHelpProvider(
            language,
            new SignatureProvider(),
            '(',
            ',',
        ),
        vscode.languages.registerDocumentSymbolProvider(
            language,
            new SymbolProvider(),
        ),
        vscode.languages.registerDocumentFormattingEditProvider(
            language,
            new FormatProvider(),
        ),
        vscode.languages.registerReferenceProvider(language, new RefProvider()),
        vscode.debug.registerDebugAdapterDescriptorFactory(
            'ahk',
            new InlineDebugAdapterFactory(),
        ),
        vscode.debug.registerDebugAdapterDescriptorFactory(
            'ahk2',
            new InlineDebugAdapterFactory(),
        ),
        createEditorListener(),
        vscode.commands.registerCommand('ahk++.compile', () =>
            RunnerService.compile(false),
        ),
        vscode.commands.registerCommand('ahk++.compilerGui', () =>
            RunnerService.compile(true),
        ),
        vscode.commands.registerCommand('ahk++.debug', () =>
            RunnerService.startDebugger(),
        ),
        vscode.commands.registerCommand('ahk++.openHelp', openHelp),
    );

    context.subscriptions.push(
        vscode.languages.registerCompletionItemProvider(
            language,
            new CompletionProvider(),
            '.',
        ),
    );

    vscode.workspace.onDidChangeConfiguration(async (e) => {
        if (!e.affectsConfiguration(`${configPrefix}.${ConfigKey.exclude}`))
            return;

        clearCache();
        await buildByPath(vscode.workspace.workspaceFolders?.[0].uri.fsPath);
    });

    activateV2(context);
}

class InlineDebugAdapterFactory
    implements vscode.DebugAdapterDescriptorFactory
{
    public createDebugAdapterDescriptor(): ProviderResult<vscode.DebugAdapterDescriptor> {
        return new vscode.DebugAdapterInlineImplementation(new DebugSession());
    }
}
