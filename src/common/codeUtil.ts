import * as vscode from 'vscode';
import { Selection } from 'vscode';

export class CodeUtil {
    /**
     * Trim non-formatted chars out of original line of code
     * @param original Original line of code
     */
    public static purify(original: string): string {
        if (!original) {
            return '';
        }
        return original
            .replace(/;.+/, '')
            .replace(/".*?"/g, '""') // replace string literals with empty string literal
            .replace(/{.*}/g, '') // remove matching braces
            .replace(/ +/g, ' ')
            .replace(/\bgui\b.*/gi, '')
            .replace(/\b(msgbox)\b.+?%/gi, '$1');
    }

    /**
     * Concats an array and an item or array of items. Impure, @see array is modified
     * @param array The initial array
     * @param items Either an item to add to the end of the array,
     * or another array to concat to the end of @see array
     */
    public static join(array: unknown[], items: unknown) {
        if (!array || !items) {
            return;
        }
        if (Array.isArray(items)) {
            for (const item of items) {
                array.push(item);
            }
        } else {
            array.push(items);
        }
    }

    public static matchAll(regex: RegExp, text: string): RegExpExecArray[] {
        if (!regex.global) {
            throw new Error('Only support global regex!');
        }

        let regs = [];
        let temp: RegExpExecArray;
        while (!!(temp = regex.exec(text))) {
            regs.push(temp);
        }

        return regs;
    }

    /** Align variable assignment by = operator in selected text
     * @param selection Text selection in editor
     * @returns Aligned selection
     */
    public static alignTextAssignOperator(selection: Selection): string {
        const document = vscode.window.activeTextEditor.document;
        /** Right-most `=` operator position in line from all assignments */
        let maxPosition = 0;
        for (
            let lineIndex = selection.start.line;
            lineIndex <= selection.end.line;
            lineIndex++
        ) {
            const line = this.normalizeLineAssignOperator(
                document.lineAt(lineIndex).text,
            );

            // Find right-most = operator position
            let position = line.indexOf('='); // = operator position
            if (position > maxPosition) {
                maxPosition = position;
            }
        }

        let text = '';
        for (
            let lineIndex = selection.start.line;
            lineIndex <= selection.end.line;
            lineIndex++
        ) {
            let line = document.lineAt(lineIndex).text;
            text += this.alignLineAssignOperator(line, maxPosition);
            if (lineIndex !== selection.end.line) {
                text += '\n';
            }
        }

        return text;
    }

    /** Remove comment, remove extra spaces around first = or := operator,
     * add spaces around first = or := operator (if they missing).
     * Remove extra spaces, but not touch leading and trailing spaces.
     * @param original Original line of code
     * @returns Normalized line of code
     */
    public static normalizeLineAssignOperator(original: string): string {
        return (
            original // Clean up text with regex
                // Remove single line comment
                .replace(/(?<!`);.+/, '') // skip escaped semicolon '`;', it's text, not comment
                // Remove extra spaces, but not touch leading and trailing spaces.
                // Leading spaces - saves code indent.
                // Trailing spaces - saves comment indent. User can add new variable
                // assignment, align assignments and comments will stay in place
                // (manually aligned before).
                .replace(/(?<=\S) {2,}(?=\S)/g, ' ')
                // Add space before = and := operators (if it absent).
                .replace(/\s?(?=:?=)/, ' ')
                // Same process after = and := operators.
                .replace(/(?<=:?=)\s?/, ' ')
        );
    }

    /** Add spaces before = and := operators to move it to target position.
     * Remove extra spaces between symbol and operator,
     * remove spaces before comment (if present),
     * trim end spaces.
     * @param original Original line of code
     * @param targetPosition Target position of = operator
     * @returns Aligned line
     */
    public static alignLineAssignOperator(
        original: string,
        targetPosition: number,
    ): string {
        /** The line comment. Empty string if no line comment exists */
        const comment = /;.+/.exec(original)?.[0] ?? ''; // Save comment
        original = this.normalizeLineAssignOperator(original);
        let position = original.search('='); // = operator position
        return original
            .replace(/\s(?=:?=)/, ' '.repeat(targetPosition - position + 1)) // Align assignment
            .concat(comment) // Restore comment
            .trimEnd();
    }
}
