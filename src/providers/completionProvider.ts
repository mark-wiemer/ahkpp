import * as vscode from 'vscode';
import { Parser } from '../parser/parser';
import { SnippetString } from 'vscode';
import { FuncDef } from '../parser/model';

type SimpleFuncDef = Pick<
    FuncDef,
    'params' | 'name' | 'full' | 'comment' | 'uriString' | 'line' | 'endLine'
> & { variables: string[] };

/** A completion item for the function itself. */
const completionItemForFunction = (
    funcDef: Pick<
        SimpleFuncDef,
        'params' | 'name' | 'full' | 'comment' | 'variables'
    >,
): vscode.CompletionItem => {
    // if no params, just name. Else include parens and sample args. e.g.:
    // foo() -> foo
    // foo(bar) -> foo(bar)
    const completionItem = new vscode.CompletionItem(
        funcDef.params.length === 0 ? funcDef.name : funcDef.full,
        vscode.CompletionItemKind.Function,
    );
    completionItem.insertText = funcDef.params.length
        ? new SnippetString(`${funcDef.name}($1)`)
        : `${funcDef.name}()`;
    completionItem.detail = funcDef.comment;
    return completionItem;
};

/**
 * True if the line number is within the function definition
 * and the function is defined in the same file.
 */
const shouldSuggestFunctionLocals = (
    funcDef: Pick<
        SimpleFuncDef,
        'uriString' | 'line' | 'endLine' | 'variables'
    >,
    uriString: string,
    lineNumber: number,
): boolean =>
    funcDef.uriString === uriString &&
    funcDef.line <= lineNumber &&
    lineNumber <= funcDef.endLine;

/** A completion item for each of the function's local variables and parameters. */
const completionItemsForFunctionLocals = (
    funcDef: Pick<SimpleFuncDef, 'params' | 'variables'>,
): vscode.CompletionItem[] =>
    funcDef.params
        .concat(funcDef.variables)
        .map(
            (local) =>
                new vscode.CompletionItem(
                    local,
                    vscode.CompletionItemKind.Variable,
                ),
        );

/**
 * A completion item for a function call.
 * Also one for each of its locals if the line number is within the function.
 */
const completionItemsForFunction = (
    funcDef: SimpleFuncDef,
    uriString: string,
    lineNumber: number,
): vscode.CompletionItem[] => {
    const result: vscode.CompletionItem[] = [
        completionItemForFunction(funcDef),
    ];

    if (shouldSuggestFunctionLocals(funcDef, uriString, lineNumber)) {
        result.push(...completionItemsForFunctionLocals(funcDef));
    }

    return result;
};

const completionItemForVariable = (variable: string): vscode.CompletionItem =>
    new vscode.CompletionItem(variable, vscode.CompletionItemKind.Variable);

/**
 * Suggests all functions and the locals of the current function, if any.
 * Suggests all variables provided.
 * @param funcDefs The functions to suggest
 * @param uriString The URI of the current file
 * @param lineNumber The line number of the cursor
 * @param variables The variables to suggest
 * @returns The completion items
 *
 * todo should only suggest included and library functions
 */
export const provideCompletionItemsInner = (
    funcDefs: SimpleFuncDef[],
    uriString: string,
    lineNumber: number,
    variables: string[],
): vscode.CompletionItem[] =>
    funcDefs
        .map((m) => completionItemsForFunction(m, uriString, lineNumber))
        .reduce((a, b) => a.concat(b), []) // reduce from 2D array to 1D array
        .concat(variables.map(completionItemForVariable));

export class CompletionProvider implements vscode.CompletionItemProvider {
    // TODO add tests
    public async provideCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
    ): Promise<vscode.CompletionItem[]> {
        // If the cursor is just after a dot, don't suggest anything.
        // Default suggestions will still apply.
        const preChar = document.getText(
            new vscode.Range(position.translate(0, -1), position),
        );
        if (preChar === '.') {
            return [];
        }

        // Suggest all functions and the locals of the current function, if any
        // Suggest all variables in the current file
        const funcDefs = await Parser.getAllFuncDefs();
        const script = await Parser.buildScript(document, { usingCache: true });
        return provideCompletionItemsInner(
            funcDefs.map((m) => ({
                ...m,
                variables: m.variables.map((v) => v.name),
            })),
            document.uri.toString(),
            position.line,
            script.variables.map((v) => v.name),
        );
    }
}
