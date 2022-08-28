import * as vscode from 'vscode';
import { CodeUtil } from '../common/codeUtil';
import { ConfigKey, Global } from '../common/global';
import {
    braceNumber,
    buildIndentedLine,
    hasMoreCloseParens,
    hasMoreOpenParens,
    removeEmptyLines,
    trimExtraSpaces,
} from './formattingProvider.utils';

function fullDocumentRange(document: vscode.TextDocument): vscode.Range {
    const lastLineId = document.lineCount - 1;
    return new vscode.Range(
        0,
        0,
        lastLineId,
        document.lineAt(lastLineId).text.length,
    );
}

export class FormatProvider implements vscode.DocumentFormattingEditProvider {
    /** Special keywords that can trigger one-line commands */
    private static oneCommandList = [
        'ifnotexist',
        'ifexist',
        'ifwinactive',
        'ifwinnotactive',
        'ifwinexist',
        'ifwinnotexist',
        'ifinstring',
        'ifnotinstring',
        'if',
        'else',
        'loop',
        'for',
        'while',
        'catch',
    ];

    public provideDocumentFormattingEdits(
        document: vscode.TextDocument,
        options: vscode.FormattingOptions,
        token: vscode.CancellationToken,
    ): vscode.TextEdit[] {
        let formattedDocument = '';
        /** Current level of indentation. 0 = top-level, no indentation */
        let depth = 0;
        /** ??? */
        let tagDepth = 0;
        /**
         * `True` if this line is an one-statement block. Example:
         * ```ahk
         * if (var)   ; false
         *     MsgBox ; true
         * SoundBeep  ; false
         *  ```
         */
        let oneCommandCode = false;
        let blockComment = false;
        /** Base indent, that block comment had in original code */
        let blockCommentIndent = '';
        /**
         * Detect or not detect `oneCommandCode`.
         * Every iteration it's `true`, but become `false` if formatter increase indent for next line for open brace `{`.
         * It's prevents wrong extra indent, if `{` present after `oneCommandCode` code:
         * one indent for `{` and additional indent for `oneCommandCode`.
         */
        let detectOneCommandCode = true;
        /**
         * Formatter's directive:
         * ```ahk
         * ;@AHK++FormatBlockCommentOn
         * ;@AHK++FormatBlockCommentOff
         * ```
         * Format text inside block comment like regular code
         */
        let formatBlockComment = false;
        // Save important values to this variables on block comment enter, restore them on exit
        let preBlockCommentDepth = 0;
        let preBlockCommentTagDepth = 0;
        let preBlockCommentDetectOneCommandCode = true;
        let preBlockCommentOneCommandCode = false;

        const trimSpaces = Global.getConfig<boolean>(ConfigKey.trimExtraSpaces);

        for (let lineIndex = 0; lineIndex < document.lineCount; lineIndex++) {
            const originalLine = document.lineAt(lineIndex).text;
            const purifiedLine = CodeUtil.purify(originalLine.toLowerCase());
            /** The line comment. Empty string if no line comment exists */
            const comment = /;.+/.exec(originalLine)?.[0] ?? '';
            let formattedLine = originalLine.replace(/;.+/, ''); // Remove single line comment
            formattedLine = trimExtraSpaces(formattedLine, trimSpaces) // Remove extra spaces between words
                .concat(comment) // Add removed single line comment back
                .trim();
            /** Line is empty or this is single comment line */
            const emptyLine = purifiedLine === '';

            detectOneCommandCode = true;

            const moreCloseParens = hasMoreCloseParens(purifiedLine);
            const moreOpenParens = hasMoreOpenParens(purifiedLine);

            // This line

            // Stop directives for formatter
            if (emptyLine) {
                if (comment.match(/;\s*@AHK\+\+FormatBlockCommentOff/i)) {
                    formatBlockComment = false;
                }
            }

            // Block comments
            // The /* and */ symbols can be used to comment out an entire section,
            // but only if the symbols appear at the beginning of a line (excluding whitespace),
            // as in this example:
            // /*
            // MsgBox, This line is commented out (disabled).
            // MsgBox, Common mistake: */ this does not end the comment.
            // MsgBox, This line is commented out.
            // */
            if (!blockComment && originalLine.match(/^\s*\/\*/)) {
                // found start '/*' pattern
                blockComment = true;
                // Save first capture group (original indent)
                blockCommentIndent = originalLine.match(/(^\s*)\/\*/)?.[1];
                if (formatBlockComment) {
                    // save indent values on block comment enter
                    preBlockCommentDepth = depth;
                    preBlockCommentTagDepth = tagDepth;
                    preBlockCommentDetectOneCommandCode = detectOneCommandCode;
                    preBlockCommentOneCommandCode = oneCommandCode;
                    // reset indent values to default values with added current 'depth' indent
                    oneCommandCode = false;
                }
            }

            if (blockComment) {
                // Save block comment line only if user don't want format it content
                if (!formatBlockComment) {
                    let blockCommentLine = '';
                    if (originalLine.startsWith(blockCommentIndent)) {
                        blockCommentLine = originalLine.substring(
                            blockCommentIndent.length,
                        );
                    } else {
                        blockCommentLine = originalLine;
                    }
                    formattedDocument += buildIndentedLine(
                        lineIndex,
                        document.lineCount,
                        blockCommentLine,
                        depth,
                        options,
                    );
                }
                if (originalLine.match(/^\s*\*\//)) {
                    // found end '*/' pattern
                    blockComment = false;
                    if (formatBlockComment) {
                        // restore indent values on block comment exit
                        depth = preBlockCommentDepth;
                        tagDepth = preBlockCommentTagDepth;
                        detectOneCommandCode =
                            preBlockCommentDetectOneCommandCode;
                        oneCommandCode = preBlockCommentOneCommandCode;
                    }
                }
                if (!formatBlockComment) {
                    continue;
                }
            }

            // #IfWinActive, #IfWinNotActive
            if (
                purifiedLine.match(/#ifwinactive$/) ||
                purifiedLine.match(/#ifwinnotactive$/)
            ) {
                if (tagDepth > 0) {
                    depth -= tagDepth;
                } else {
                    depth--;
                }
            }

            // return or ExitApp
            if (
                purifiedLine.match(/\b(return|ExitApp)\b/i) &&
                tagDepth === depth
            ) {
                tagDepth = 0;
                depth--;
            }

            // switch-case, hotkeys
            if (purifiedLine.match(/^\s*case.+?:\s*$/)) {
                // case
                tagDepth--;
                depth--;
            } else if (purifiedLine.match(/:\s*$/)) {
                // default or hotkey
                if (tagDepth > 0 && tagDepth === depth) {
                    // De-indent label or hotkey, if they not end with 'return' command.
                    // This is fall-through scenario. Example:
                    // Label1:
                    //     code
                    // Label2:
                    //     code
                    // return
                    depth--;
                }
            }

            // Check close braces
            if (purifiedLine.includes('}')) {
                const braceNum = braceNumber(purifiedLine, '}');
                depth -= braceNum;
            }

            if (moreCloseParens) {
                depth--;
            }

            // One command code and open braces
            if (oneCommandCode && purifiedLine.includes('{')) {
                const braceNum = braceNumber(purifiedLine, '{');
                if (braceNum > 0) {
                    oneCommandCode = false;
                    depth--;
                }
            }

            if (depth < 0) {
                depth = 0;
            }
            if (preBlockCommentDepth < 0) {
                preBlockCommentDepth = 0;
            }

            // Save indented line
            formattedDocument += buildIndentedLine(
                lineIndex,
                document.lineCount,
                formattedLine,
                depth,
                options,
            );

            // Next line

            // Start directives for formatter
            if (emptyLine) {
                if (comment.match(/;\s*@AHK\+\+FormatBlockCommentOn/i)) {
                    formatBlockComment = true;
                }
            }

            // One command code
            if (
                oneCommandCode &&
                // Don't change indentation on empty lines (single line comment is equal to empty line) after one command code.
                !emptyLine &&
                // Don't change indentation on block comment after one command code.
                // Change indentation inside block comment, if user wants to format block comment.
                (!blockComment || formatBlockComment)
            ) {
                oneCommandCode = false;
                depth--;
            }

            // Block comments
            // Must be after 'One command code' check, because it reset flag 'blockComment' that tests there!
            // if (blockComment && originalLine.match(/^\s*\*\//)) {
            //     // found end '*/' pattern
            //     blockComment = false;
            // }

            // #IfWinActive, #IfWinNotActive
            if (
                purifiedLine.match(/#ifwinactive.*?\s/) ||
                purifiedLine.match(/#ifwinnotactive.*?\s/)
            ) {
                depth++;
            }

            // Check open braces
            if (purifiedLine.includes('{')) {
                const braceNum = braceNumber(purifiedLine, '{');
                depth += braceNum;
                if (braceNum > 0) {
                    // Do not detect 'oneCommandCode', because it will produce extra indent for next line:
                    // if (true) {
                    // |   |   wrong_extra_indented_code
                    // |   code
                    // }
                    detectOneCommandCode = false;
                }
            }

            if (moreOpenParens) {
                depth++;
            }

            // default or hotkey
            if (!moreOpenParens && purifiedLine.match(/:\s*$/)) {
                depth++;
                tagDepth = depth;
            }

            if (detectOneCommandCode) {
                for (const oneCommand of FormatProvider.oneCommandList) {
                    let temp: RegExpExecArray;
                    // 1. Before 'oneCommandCode' allowed only optional close brace
                    //    Example: '} else' or '} if'
                    // 2. After 'oneCommandCode' not allowed semicolon
                    //    Example: 'If:', 'Else:', 'Loop:', etc are valid labels, not 'oneCommandCode'
                    //    Skip such labels, because they produce wrong additional level of indent
                    if (
                        purifiedLine.match('^}?\\s*' + oneCommand + '\\b(?!:)')
                    ) {
                        oneCommandCode = true;
                        depth++;
                        break;
                    }
                }
            }
        }

        formattedDocument = removeEmptyLines(
            formattedDocument,
            Global.getConfig<number>(ConfigKey.allowedNumberOfEmptyLines),
        );

        return [
            new vscode.TextEdit(fullDocumentRange(document), formattedDocument),
        ];
    }
}
