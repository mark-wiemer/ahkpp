import * as vscode from 'vscode';
import { Parser } from '../parser/parser';

export class SymbolProvider implements vscode.DocumentSymbolProvider {
    public async provideDocumentSymbols(
        document: vscode.TextDocument,
    ): Promise<vscode.DocumentSymbol[]> {
        const result = [];

        const script = await Parser.buildScript(document, { usingCache: true });

        for (const funcDef of script.funcDefs) {
            result.push(
                new vscode.SymbolInformation(
                    funcDef.full,
                    vscode.SymbolKind.Function,
                    funcDef.comment,
                    new vscode.Location(
                        vscode.Uri.parse(funcDef.uriString),
                        new vscode.Position(funcDef.line, funcDef.character),
                    ),
                ),
            );
        }

        for (const label of script.labels) {
            result.push(
                new vscode.SymbolInformation(
                    label.name,
                    vscode.SymbolKind.Field,
                    null,
                    new vscode.Location(
                        label.document.uri,
                        new vscode.Position(label.line, label.character),
                    ),
                ),
            );
        }

        for (const block of script.blocks) {
            result.push(
                new vscode.SymbolInformation(
                    block.name,
                    vscode.SymbolKind.Module,
                    null,
                    new vscode.Location(
                        block.document.uri,
                        new vscode.Position(block.line, block.character),
                    ),
                ),
            );
        }

        // TODO meet the contract, stop casting
        return result as unknown as vscode.DocumentSymbol[];
    }
}
