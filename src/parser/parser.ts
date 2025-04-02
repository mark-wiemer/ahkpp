import { ConfigKey, Global } from '../common/global';
import * as vscode from 'vscode';
import { CodeUtil } from '../common/codeUtil';
import { Script, FuncDef, FuncRef, Label, Block, Variable } from './model';
import { scriptCache, pathsToBuild } from './parser.utils';
import { resolveIncludedPath } from '../common/utils';
import { debug, warn } from '../common/log';

const startBlockComment = / *\/\*/;
// todo does endBlockComment work on lines like `; */` ?
const endBlockComment = / *\*\//;

export const clearCache = () => {
    debug('Clearing cache');
    scriptCache.clear();
};

export interface BuildScriptOptions {
    /** Defaults to false. If true, short-circuits when document is in cache. */
    usingCache?: boolean;
    /** Lines to parse. Defaults to extension setting. -1 for unlimited parsing. 0 for no parsing. */
    maximumParseLength?: number;
}

const buildPaths = async (
    paths: string[],
    options: BuildScriptOptions = {},
): Promise<void> => {
    const funcName = 'buildPaths';
    debug(`${funcName}(${paths.length} paths)`);
    for (const path of paths) {
        debug(
            `${funcName} building ${path} with options: ${JSON.stringify(options)}`,
        );
        try {
            const document = await vscode.workspace.openTextDocument(
                vscode.Uri.file(path),
            );
            debug(`buildPaths opened` + document);
            await Parser.buildScript(document, options);
        } catch (e) {
            warn(`${funcName} error building ${path}`);
            warn(e);
        }
    }
};

/**
 * Build all scripts in the given directory path, accounting for exclusion rules
 * Behavior undefined if `rootDirPath` is not a valid directory path.
 */
export async function buildByPath(rootDirPath: string) {
    const excludeConfig = Global.getConfig<string[]>(ConfigKey.exclude);
    const paths = await pathsToBuild(rootDirPath, excludeConfig);
    debug(`Building ${paths.length} ${paths.length === 1 ? 'file' : 'files'}`);
    buildPaths(paths);
}

/** Parses v1 files */
export class Parser {
    /**
     * Parse the document into a Script and add it to the cache
     * @param document
     */
    // todo add tests
    public static async buildScript(
        document: vscode.TextDocument,
        options: BuildScriptOptions = {},
    ): Promise<Script> {
        const funcName = 'buildScript';
        const lang = document.languageId;
        const docPath = document.uri.path;
        if (lang !== 'ahk' && lang !== 'ahk1') {
            debug(`${funcName} skipping ${lang} doc at ${docPath}`);
            return undefined;
        }

        const cachedDocument = scriptCache.get(docPath);
        if (options.usingCache && cachedDocument) {
            debug(`${funcName} returning cached document for ${docPath}`);
            return cachedDocument;
        }

        const maxParseLength =
            options.maximumParseLength ??
            Global.getConfig<number>(ConfigKey.maximumParseLength);
        // limit parse length for performance
        /** Count of lines to parse */
        const linesToParse =
            maxParseLength >= 0
                ? Math.min(document.lineCount, maxParseLength)
                : document.lineCount;

        const funcDefs: FuncDef[] = [];
        const funcRefs: FuncRef[] = [];
        const labels: Label[] = [];
        const variables: Variable[] = [];
        const blocks: Block[] = [];
        const includedPaths: string[] = [];
        let currentFuncDef: FuncDef;
        /** Tracks scope of newly-defined variables */
        let deep = 0;
        let blockComment = false;
        for (let line = 0; line < linesToParse; line++) {
            const lineText = document.lineAt(line).text;
            if (lineText.match(startBlockComment)) {
                blockComment = true;
            }
            if (lineText.match(endBlockComment)) {
                blockComment = false;
            }
            if (blockComment) {
                continue;
            }
            const defOrCall = Parser.detectFunctionByLine(document, line);
            if (defOrCall) {
                if (defOrCall instanceof FuncDef) {
                    funcDefs.push(defOrCall);
                    funcRefs.push(
                        new FuncRef(
                            defOrCall.name,
                            document,
                            line,
                            defOrCall.character,
                        ),
                    );
                    currentFuncDef = defOrCall;
                    if (defOrCall.withQuote) {
                        deep++;
                    }
                    continue;
                } else {
                    CodeUtil.join(funcRefs, defOrCall);
                }
            }
            const label = Parser.getLabelByLine(document, line);
            if (label) {
                labels.push(label);
                continue;
            }
            const block = Parser.getBlockByLine(document, line);
            if (block) {
                blocks.push(block);
            }
            const include = resolveIncludedPath(docPath, lineText);
            if (include) {
                includedPaths.push(include);
            }

            // todo won't work on lines with comments
            if (lineText.includes('{')) {
                deep++;
            }
            if (lineText.includes('}')) {
                deep--;
                if (currentFuncDef) {
                    currentFuncDef.endLine = line;
                }
            }
            const variable = Parser.detectVariableByLine(document, line);
            if (variable) {
                if (deep === 0 || !currentFuncDef) {
                    this.joinVars(variables, variable);
                } else {
                    currentFuncDef.pushVariable(variable);
                }
            }
        }
        const script: Script = {
            funcDefs,
            labels,
            funcRefs,
            variables,
            blocks,
            includedPaths,
        };
        scriptCache.set(docPath, script);

        // we can build included paths at the end because we don't store
        // definition locations of all function calls
        // in the cache, we search and find them as needed based on user action
        debug(`Building included paths:`);
        debug('\t' + (includedPaths.join('\n\t') || '(none)'));
        await buildPaths(includedPaths, { usingCache: true });

        debug(`${funcName} document.uri.path: ${docPath}`);
        debug(`${funcName} script: ${JSON.stringify(script)}`);

        return script;
    }

    public static async getAllFuncDefs(): Promise<FuncDef[]> {
        const funcs = [];
        for (const filePath of scriptCache.keys()) {
            for (const func of scriptCache.get(filePath).funcDefs) {
                funcs.push(func);
            }
        }
        return funcs;
    }

    public static async getLabelByName(
        document: vscode.TextDocument,
        name: string,
    ) {
        name = name.toLowerCase();
        for (const label of scriptCache.get(document.uri.path).labels) {
            if (label.name.toLowerCase() === name) {
                return label;
            }
        }
        for (const filePath of scriptCache.keys()) {
            for (const label of scriptCache.get(filePath).labels) {
                if (label.name.toLowerCase() === name) {
                    return label;
                }
            }
        }
        return undefined;
    }

    public static getAllRefByName(name: string): FuncRef[] {
        const refs = [];
        name = name.toLowerCase();
        for (const filePath of scriptCache.keys()) {
            const document = scriptCache.get(filePath);
            for (const ref of document.funcRefs) {
                if (ref.name.toLowerCase() === name) {
                    refs.push(ref);
                }
            }
        }
        return refs;
    }

    private static getBlockByLine(
        document: vscode.TextDocument,
        line: number,
    ): Block {
        const { text } = document.lineAt(line);
        const blockMatch = text.match(/;;(.+)/);
        if (blockMatch) {
            return {
                document,
                line,
                name: blockMatch[1],
                character: text.indexOf(blockMatch[1]),
            };
        }
        return undefined;
    }

    private static getLabelByLine(document: vscode.TextDocument, line: number) {
        const text = CodeUtil.purify(document.lineAt(line).text);
        // [\u4e00-\u9fa5] Chinese unicode characters
        const label = /^[ \t]*([\u4e00-\u9fa5_a-zA-Z0-9]+):{1}(?!(:|=))/.exec(
            text,
        );
        if (label) {
            const labelName = label[1];
            if (
                labelName.toLowerCase() === 'case' ||
                labelName.toLowerCase() === 'default'
            ) {
                return undefined;
            }
            return new Label(label[1], document, line, text.indexOf(labelName));
        }
        return undefined;
    }

    private static varDefPattern =
        /[ \t]*(\w+?)\s*([+\-*/.:])?(?<![=!])=(?![=!]).+/;
    private static varCommandPattern = /(\w+)[ \t,]+/g;
    private static keywords = ['and', 'or', 'new', 'extends', 'if', 'loop'];
    private static detectVariableByLine(
        document: vscode.TextDocument,
        line: number,
    ): Variable | Variable[] {
        const lineText = CodeUtil.purify(document.lineAt(line).text);

        const defMatch = lineText.match(Parser.varDefPattern);
        if (defMatch) {
            const varName = defMatch[1];
            return {
                line,
                document,
                isGlobal: true,
                funcDef: null,
                name: varName,
                character: lineText.indexOf(varName),
            };
        } else {
            const vars: Variable[] = [];
            const commandMatchAll = CodeUtil.matchAll(
                Parser.varCommandPattern,
                lineText.replace(/\(.+?\)/g, ''),
            );
            for (let index = 0; index < commandMatchAll.length; index++) {
                if (index === 0) {
                    continue;
                }
                const varName = commandMatchAll[index][1];
                if (this.keywords.includes(varName.toLowerCase())) {
                    continue;
                }
                vars.push({
                    line,
                    document,
                    isGlobal: true,
                    funcDef: null,
                    name: varName,
                    character: lineText.indexOf(commandMatchAll[index][0]),
                });
            }
            return vars;
        }
    }

    /**
     * Return function definition or function call(s) on the given line
     * @param textToParse Optional text to parse. Defaults to the line text. Used for recursion.
     */
    private static detectFunctionByLine(
        document: vscode.TextDocument,
        lineNum: number,
        textToParse?: string,
    ): FuncDef | FuncRef | FuncRef[] {
        const thisFuncName = 'detectFunctionByLine';
        debug(
            `${thisFuncName}(${document.uri.path.split('/').pop()}, ${lineNum}${textToParse === undefined ? '' : `, "${textToParse}"`})`,
        );
        textToParse ??= document.lineAt(lineNum).text;
        const text = CodeUtil.purify(textToParse);
        // [\u4e00-\u9fa5] Chinese unicode characters
        // Matches function definitions and calls:
        // - one or more function name characters
        // - that aren't the words "if" or "while"
        // - parentheses around 0 or more arguments (matching up to the first closing paren)
        // - optional opening curly brace (for func definition)
        const funcPattern =
            /\s*(([\u4e00-\u9fa5_a-zA-Z0-9]+)(?<!if|while)\(.*?\))\s*(\{)?\s*/i;
        const match = text.match(funcPattern);
        if (!match) {
            return undefined;
        }
        debug(`${thisFuncName}#text: ${text}`);
        debug(`${thisFuncName}#match: ['${match.join(`', '`)}']`);
        const funcName = match[2];
        const charNum = textToParse.indexOf(funcName);
        if (text.length !== match[0].length) {
            // multiple function calls on the same line
            // regex does not match parens, so text is longer due to extra paren
            // note the lack of closing paren in the example:
            // Foo(Bar()).length !== Foo(Bar().length
            debug(`${thisFuncName}#multiple function calls on line ${lineNum}`);
            debug(`${thisFuncName}#text: ${text}, match[0]: ${match[0]}`);
            const refs = [new FuncRef(funcName, document, lineNum, charNum)];
            // Recursively unravel all function calls on this line
            const newRef = this.detectFunctionByLine(
                document,
                lineNum,
                // remove the call to the outermost function
                textToParse.replace(new RegExp(funcName + '\\s*\\('), ''),
            );
            // Join to a flat array of references
            CodeUtil.join(refs, newRef);
            return refs;
        }
        const funcFullName = match[1];
        const isDefinition = match[3];
        if (isDefinition) {
            return new FuncDef(
                funcFullName,
                funcName,
                document.uri.toString(),
                lineNum,
                charNum,
                true,
                Parser.getFullLineComment(document, lineNum - 1),
            );
        }
        for (let i = lineNum + 1; i < document.lineCount; i++) {
            const nextLineText = CodeUtil.purify(document.lineAt(i).text);
            if (!nextLineText.trim()) {
                continue;
            }
            if (nextLineText.match(/^\s*{/)) {
                return new FuncDef(
                    funcFullName,
                    funcName,
                    document.uri.toString(),
                    lineNum,
                    charNum,
                    false,
                    Parser.getFullLineComment(document, lineNum - 1),
                );
            } else {
                return new FuncRef(funcName, document, lineNum, charNum);
            }
        }
        return undefined;
    }

    /**
     * Returns the full-line comment, excluding the `;` and leading space.
     * Returns null if line has non-comment text or if lineNum is invalid.
     * @param document
     * @param lineNum
     */
    private static getFullLineComment(
        document: vscode.TextDocument,
        lineNum: number,
    ) {
        if (lineNum < 0) {
            return null;
        }
        const { text } = document.lineAt(lineNum);
        const match = text.match(/^\s*;\s*(.+)/);
        if (match) {
            return match[1];
        }
        return null;
    }

    public static joinVars(
        variables: Variable[],
        items: Variable | Variable[],
    ) {
        if (!variables || !items) {
            return;
        }

        if (!Array.isArray(items)) {
            items = [items];
        }

        loop: for (const item of items) {
            for (const variable of variables) {
                if (variable.name === item.name) {
                    continue loop;
                }
            }
            variables.push(item);
        }
    }
}
