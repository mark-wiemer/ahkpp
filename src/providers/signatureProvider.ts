import * as vscode from 'vscode';
import { getFuncDefByName } from '../parser/parser.utils';

export class SignatureProvider implements vscode.SignatureHelpProvider {
    public async provideSignatureHelp(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.SignatureHelp> {
        let funcDefCandidatePosition: vscode.Position;
        const lineText = document.lineAt(position.line).text;
        let splitCount = 0;
        for (let index = position.character - 1; index > 0; index--) {
            const char = lineText.charAt(index);
            if (char === '(') {
                funcDefCandidatePosition = new vscode.Position(
                    position.line,
                    index,
                );
                break;
            }
            if (char === ',') {
                splitCount++;
            }
        }
        const word = document.getText(
            document.getWordRangeAtPosition(funcDefCandidatePosition),
        );

        const funcDef = getFuncDefByName(document.uri.path, word);
        if (funcDef) {
            return {
                activeSignature: 0,
                signatures: [
                    {
                        label: funcDef.origin,
                        parameters: funcDef.params.map((param) => {
                            return { label: param };
                        }),
                    },
                ],
                activeParameter: splitCount,
            };
        }

        return null;
    }
}
