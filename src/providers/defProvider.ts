import * as vscode from 'vscode';
import { Parser } from '../parser/parser';
import { resolveIncludedPath } from '../common/utils';
import { Out } from '../common/out';
import { stat } from 'fs/promises';
import { getFuncDefByName } from '../parser/parser.utils';

export class DefProvider implements vscode.DefinitionProvider {
    public async provideDefinition(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<
        vscode.Location | vscode.Location[] | vscode.LocationLink[] | null
    > {
        const funcName = 'provideDefinition';
        Out.debug(funcName);

        const docPath = document.uri.path;
        const { text } = document.lineAt(position.line);
        const fileLink = await tryGetFileLink(docPath, text);
        if (fileLink) {
            Out.debug(`${funcName} returning fileLink`);
            return fileLink;
        }
        Out.debug(`${funcName} after tryGetFileLink`);

        const word = document.getText(
            document.getWordRangeAtPosition(position),
        );
        Out.debug(`${funcName} word: ${word}`);

        // get function definition
        if (
            new RegExp(word + '\\s*\\(.*?\\)').test(
                document.lineAt(position.line).text,
            )
        ) {
            Out.debug(`${funcName} calling getFuncDefByName for word: ${word}`);
            const funcDef = getFuncDefByName(docPath, word);
            Out.debug(`${funcName} funcDef.name: ${funcDef?.name}`);
            if (funcDef) {
                return new vscode.Location(
                    vscode.Uri.parse(funcDef.uriString),
                    new vscode.Position(funcDef.line, funcDef.character),
                );
            }
        }

        // getlabel
        const label = await Parser.getLabelByName(document, word);
        if (label) {
            const tempDocument = label.document;
            return new vscode.Location(
                tempDocument.uri,
                new vscode.Position(label.line, label.character),
            );
        }

        const script = await Parser.buildScript(document, { usingCache: true });

        for (const funcDef of script.funcDefs) {
            if (
                position.line >= funcDef.line &&
                position.line <= funcDef.endLine
            ) {
                for (const variable of funcDef.variables) {
                    if (variable.name === word) {
                        return new vscode.Location(
                            document.uri,
                            new vscode.Position(
                                variable.line,
                                variable.character,
                            ),
                        );
                    }
                }
                for (const param of funcDef.params) {
                    if (param === word) {
                        return new vscode.Location(
                            document.uri,
                            new vscode.Position(
                                funcDef.line,
                                funcDef.character +
                                    funcDef.origin.indexOf(param),
                            ),
                        );
                    }
                }
            }
        }

        for (const variable of script.variables) {
            if (variable.name === word) {
                return new vscode.Location(
                    document.uri,
                    new vscode.Position(variable.line, variable.character),
                );
            }
        }

        return null;
    }
}

//* Utilities requiring the vscode API

/**
 * If the position is on an `#Include` line
 * and the included path* is an existing file (not a directory or library include),
 * returns a Location at the beginning of the included file.
 *
 * Otherwise returns undefined.
 *
 * \* "Included path" is currently calculated with assumptions:
 * - A_WorkingDir === A_ScriptDir
 * - No previous `#Include Directory` lines changing the "include working directory"
 *
 * todo remove tryGetFileLink assumptions listed above
 */
export async function tryGetFileLink(
    /**
     * Path of the current script
     * @example '/c:/path/to/file.ahk'
     */
    docPath: string,
    text: string,
): Promise<vscode.Location | undefined> {
    const funcName = 'tryGetFileLink';
    Out.debug(`${funcName}('${docPath}', '${text}')`);

    /** @example 'c:/path/to/included.ahk' */
    const resolvedPath = resolveIncludedPath(docPath, text);
    Out.debug(`${funcName} resolvedPath: ${resolvedPath}`);
    if (!resolvedPath) return undefined;

    const fsStat = await stat(resolvedPath);
    const isFile = fsStat.isFile();
    Out.debug(`${funcName} isFile: ${isFile}`);
    return fsStat.isFile()
        ? new vscode.Location(
              vscode.Uri.file(resolvedPath),
              new vscode.Position(0, 0),
          )
        : undefined;
}
