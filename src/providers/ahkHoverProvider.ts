import { readFileSync } from 'fs';
import { join } from 'path';
import {
    ExtensionContext,
    Hover,
    HoverProvider,
    MarkdownString,
    Position,
    Range,
    TextDocument,
} from 'vscode';
import { getFuncDefByName } from '../parser/parser.utils';
import { ConfigKey, Global } from '../common/global';

interface Snippet {
    prefix: string;
    body: string;
    description?: string;
}

interface Context {
    /** The character after the word */
    charAfter: string;
    word: string;
}

export class AhkHoverProvider implements HoverProvider {
    private snippetCache: Map<string, Snippet>;
    public constructor(context: ExtensionContext) {
        this.initSnippetCache(context);
    }

    /**
     * - If there's no context, return null.
     * - If there's a snippet hover, return it.
     * - If there's a function hover, return it.
     * - Otherwise, return null.
     */
    public async provideHover(
        document: TextDocument,
        position: Position,
    ): Promise<Hover | null> {
        const context = this.buildContext(document, position);
        if (!context) {
            return null;
        }

        const snippetHover = this.tryGetSnippetHover(context);
        if (snippetHover) {
            return snippetHover;
        }

        const docPath = document.uri.path;
        const newSearch = Global.getConfig<boolean>(ConfigKey.funcDefSearch);
        const funcDef = getFuncDefByName(docPath, context.word, newSearch);
        if (!funcDef) {
            return null;
        }
        const contents = new MarkdownString('', true).appendCodeblock(
            funcDef.full,
        );
        if (funcDef.comment) {
            contents.appendText(funcDef.comment);
        }
        return new Hover(contents);
    }

    /**
     * Returns the matching snippet hover, if it exists.
     * Otherwise returns undefined.
     */
    private tryGetSnippetHover(context: Context): Hover | undefined {
        let snippetKey = context.word.toLowerCase();
        if (context.charAfter === '(') {
            snippetKey += '()';
        }
        const snippet = this.snippetCache.get(snippetKey);
        if (!snippet) {
            return undefined;
        }
        const content = new MarkdownString('', true).appendCodeblock(
            snippet.body,
            'ahk',
        );
        if (snippet.description) {
            content.appendText(snippet.description);
        }
        return new Hover(content);
    }

    /**
     * Gets the `Context` for the provided document and position
     *
     * @returns `undefined` if the position is not on a word
     */
    private buildContext(
        document: TextDocument,
        position: Position,
    ): Context | undefined {
        const line = position.line;
        const wordRange = document.getWordRangeAtPosition(position);
        if (!wordRange) {
            return undefined;
        }
        let word = document.getText(wordRange);
        if (wordRange.start.character > 0) {
            const charBefore = document.getText(
                new Range(
                    line,
                    wordRange.start.character - 1,
                    line,
                    wordRange.start.character,
                ),
            );
            if (charBefore === '#') {
                word = '#' + word;
            }
        }
        const charAfter = document.getText(
            new Range(
                line,
                wordRange.end.character,
                line,
                wordRange.end.character + 1,
            ),
        );
        return { word, charAfter };
    }

    /**
     * Loads built-in snippets from the extension.
     * @see [snippetsV1.json](../../language/snippetsV1.json)
     */
    private initSnippetCache(context: ExtensionContext) {
        const ahk = JSON.parse(
            readFileSync(
                join(context.extensionPath, 'language', 'snippetsV1.json'),
                'utf8',
            ),
        );
        this.snippetCache = new Map<string, Snippet>();
        for (const key in ahk) {
            const snip = ahk[key] as Snippet;
            if (typeof snip.body === 'string') {
                snip.body = snip.body?.replace(/\d{1}:/g, '');
            }
            this.snippetCache.set(key.toLowerCase(), snip);
        }
    }
}
