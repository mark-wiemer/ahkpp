import { ConfigKey, Global } from '../common/global';
import * as vscode from 'vscode';
import { CodeUtil } from '../common/codeUtil';
import { Script, FuncDef, FuncRef, Label, Block, Variable } from './model';
import { pathsToBuild } from './parser.utils';
import { Out } from '../common/out';

const startBlockComment = / *\/\*/;
// todo does endBlockComment work on lines like `; */` ?
const endBlockComment = / *\*\//;
const documentCache = new Map<string, Script>();

export const clearCache = () => {
    Out.debug('Clearing cache');
    documentCache.clear();
};

export interface BuildScriptOptions {
    /** Defaults to false. If true, short-circuits when document is in cache. */
    usingCache?: boolean;
    /** Lines to parse. Defaults to extension setting. -1 for unlimited parsing. 0 for no parsing. */
    maximumParseLength?: number;
}

/** Parses v1 files */
export class Parser {
    /** Build all scripts in the given path */
    public static async buildByPath(buildPath: string) {
        const excludeConfig = Global.getConfig<string[]>(ConfigKey.exclude);
        const paths = await pathsToBuild(
            buildPath,
            [],
            excludeConfig,
            Out.debug,
        );
        Out.debug(`Building ${paths.length} files`);
        for (const path of paths) {
            Out.debug(`Building ${path}`);
            const document = await vscode.workspace.openTextDocument(
                vscode.Uri.file(path),
            );
            this.buildScript(document);
        }
    }

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
        if (lang !== 'ahk' && lang !== 'ahk1') {
            Out.debug(
                `${funcName} skipping ${lang} doc at ${document.uri.path}`,
            );
            return undefined;
        }

        const cachedDocument = documentCache.get(document.uri.path);
        if (options.usingCache && cachedDocument) {
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
        };
        Out.debug(`${funcName} document.uri.path: ${document.uri.path}`);
        Out.debug(`${funcName} script: ${JSON.stringify(script)}`);
        documentCache.set(document.uri.path, script);
        return script;
    }

    /**
     * Finds the best reference to the function.
     * If a function of this name exists in the current file, returns that function.
     * Otherwise, searches through document cache to find the matching function.
     * Matches are not case-sensitive and only need to match function name.
     * Note that duplicate function definitions are not allowed in AHK v1.
     *
     * todo should only search included files and library files
     * - https://github.com/mark-wiemer/ahkpp/issues/205
     */
    public static async getFuncDefByName(
        document: vscode.TextDocument,
        name: string,
        localCache = documentCache,
    ) {
        name = name.toLowerCase();
        for (const func of localCache.get(document.uri.path).funcDefs) {
            if (func.name.toLowerCase() === name) {
                return func;
            }
        }
        for (const filePath of localCache.keys()) {
            for (const func of localCache.get(filePath).funcDefs) {
                if (func.name.toLowerCase() === name) {
                    return func;
                }
            }
        }
        return undefined;
    }

    public static async getAllFuncDefs(): Promise<FuncDef[]> {
        const funcs = [];
        for (const filePath of documentCache.keys()) {
            for (const func of documentCache.get(filePath).funcDefs) {
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
        for (const label of documentCache.get(document.uri.path).labels) {
            if (label.name.toLowerCase() === name) {
                return label;
            }
        }
        for (const filePath of documentCache.keys()) {
            for (const label of documentCache.get(filePath).labels) {
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
        for (const filePath of documentCache.keys()) {
            const document = documentCache.get(filePath);
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

    /** Return function definition or function call(s) on the given line */
    private static detectFunctionByLine(
        document: vscode.TextDocument,
        lineNum: number,
        original?: string,
    ): FuncDef | FuncRef | FuncRef[] {
        const thisFuncName = 'detectFunctionByLine';
        // todo strip out of prod build entirely for perf
        Out.debug(
            `${thisFuncName}(${document.uri.path.split('/').pop()}, ${lineNum}${original === undefined ? '' : `, "${original}"`})`,
        );
        original ??= document.lineAt(lineNum).text;
        const text = CodeUtil.purify(original);
        // [\u4e00-\u9fa5] Chinese unicode characters
        // Matches function definitions and calls
        // start of line
        // one or more function name characters
        // that aren't the words "if" or "while"
        // parentheses around 0 or more arguments (matching up to the first closing paren)
        // optional opening curly brace (for func definition)
        const funcPattern =
            /\s*(([\u4e00-\u9fa5_a-zA-Z0-9]+)(?<!if|while)\(.*?\))\s*(\{)?\s*/i;
        const match = text.match(funcPattern);
        if (!match) {
            return undefined;
        }
        Out.debug(`${thisFuncName}#match: ${match}`);
        const funcName = match[2];
        const charNum = original.indexOf(funcName);
        if (text.length !== match[0].length) {
            // multiple function calls on the same line
            // regex does not match parens, so text is longer due to extra paren
            // Foo(Bar()), for example
            const refs = [new FuncRef(funcName, document, lineNum, charNum)];
            // Recursively unravel all function calls on this line
            const newRef = this.detectFunctionByLine(
                document,
                lineNum,
                // remove the call to the outermost function
                original.replace(new RegExp(funcName + '\\s*\\('), ''),
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
