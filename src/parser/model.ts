import * as vscode from 'vscode';

/** Symbols and structures parsed from a file */
export interface Script {
    funcDefs: FuncDef[];
    funcRefs: FuncCall[];
    labels: Label[];
    variables: Variable[];
    blocks: Block[];
}

export interface Variable {
    name: string;
    document: vscode.TextDocument;
    line: number;
    character: number;
    funcDef: FuncDef;
    isGlobal: boolean;
}

export class Label {
    constructor(
        public name: string,
        public document: vscode.TextDocument,
        public line: number,
        public character: number,
    ) {}
}

export class FuncCall {
    constructor(
        public name: string,
        public document: vscode.TextDocument,
        public line: number,
        public character: number,
    ) {}
}

export class Block {
    constructor(
        public name: string,
        public document: vscode.TextDocument,
        public line: number,
        public character: number,
    ) {}
}

/**
 * Represents a function definition in the script.
 * In AHK, methods are functions attached to an object,
 * so `FuncDef` includes method definitions.
 */
export class FuncDef {
    public params: string[];
    public variables: Variable[];
    public full: string;
    public endLine: number;
    constructor(
        // TODO very similar to `this.full`, maybe merge them?
        public origin: string,
        public name: string,
        public uriString: string,
        public line: number,
        public character: number,
        public withQuote: boolean,
        /** Function header comment */
        public comment: string,
    ) {
        this.buildParams();
        this.variables = [];
    }

    private buildParams() {
        /** Captures the parameters in a function header */
        const paramRegex = /\s*\((.+?)\)\s*$/;
        if (this.origin !== this.name) {
            const paramsMatch = this.origin.match(paramRegex);
            if (paramsMatch) {
                this.params = paramsMatch[1]
                    .split(',')
                    .filter((param) => param.trim())
                    .map((param) => {
                        const alphanumericRegex = /[^:=* \t]+/;
                        const paramMatch = param.match(alphanumericRegex);
                        return paramMatch?.[0] ?? param;
                    });
                this.full = this.origin.replace(
                    paramsMatch[1],
                    this.params.join(', '),
                );
            } else {
                this.params = [];
                this.full = this.origin;
            }
        }
    }

    public pushVariable(variables: Variable | Variable[]) {
        if (!Array.isArray(variables)) {
            variables = [variables];
        }
        loop: for (const variable of variables) {
            for (const curVariable of this.variables) {
                if (curVariable.name === variable.name) {
                    continue loop;
                }
            }
            for (const paramStr of this.params) {
                if (paramStr === variable.name) {
                    continue loop;
                }
            }
            this.variables.push(variable);
        }
    }
}
