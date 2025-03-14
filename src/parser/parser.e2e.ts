import { getDocument } from '../test/utils';
import * as assert from 'assert';
import * as path from 'path';
import * as vscode from 'vscode';
import { Parser } from './parser';

suite('Parser', () => {
    suite('detectVariableByLine', () => {
        const tests = [
            {
                // Space at end of input test string is important: regex that detects variables
                // inside command is not ideal. Whole symbol detection are not ideal and produce
                // many false-positive detects. It does not have simple fix, needs whole refactor.
                input: 'MouseGetPos, OutputVarX, OutputVarY, OutputVarWin, OutputVarControl ',
                expected: 4,
            },
        ];
        tests.forEach(({ input, expected }) => {
            test(`'${input}' => ${expected}`, async () => {
                const document = await vscode.workspace.openTextDocument({
                    language: 'ahk',
                    content: input,
                });
                // Use array access for the private members
                const variables = Parser['detectVariableByLine'](document, 0);
                // 'variables' can be single object or array of objects
                if (Array.isArray(variables)) {
                    assert.strictEqual(variables.length, expected);
                } else {
                    assert.strictEqual(1, expected);
                }
            });
        });
    });

    suite('getLabelByLine', () => {
        const tests = [
            { input: 'ValidLabel:', expected: 'ValidLabel' },
            { input: 'NotValidLabel :', expected: undefined },
        ];
        tests.forEach(({ input, expected }) => {
            test(`${input} -> ${expected}`, async () => {
                const document = await vscode.workspace.openTextDocument({
                    language: 'ahk',
                    content: input,
                });
                // Use array access for the private members
                const label = Parser['getLabelByLine'](document, 0);
                if (label === undefined) {
                    assert.equal(label, expected);
                } else {
                    assert.strictEqual(label.name, expected);
                }
            });
        });
    });

    suite('getFullLineComment', () => {
        const tests = [
            { input: ';comment', expected: 'comment' },
            { input: '; comment', expected: 'comment' },
            { input: ' ;comment', expected: 'comment' },
            { input: ' ; comment', expected: 'comment' },
        ];
        tests.forEach(({ input, expected }) => {
            test(`'${input}' -> '${expected}'`, async () => {
                const document = await vscode.workspace.openTextDocument({
                    language: 'ahk',
                    content: input,
                });
                // Use array access for the private members
                const comment = Parser['getFullLineComment'](document, 0);
                assert.strictEqual(comment, expected);
            });
        });
    });

    suite('buildScript', () => {
        // Currently in `out` folder, need to get back to main `src` folder
        const samplesPath = path.join(
            __dirname, // ./out/src/parser
            '..', // ./out/src
            '..', // ./out
            '..', // .
            'src', // ./src
            'parser', // ./src/parser
            'samples', // ./src/parser/samples
        );

        const parseLenTests: {
            name: string;
            maximumParseLength: number;
            expectedFuncDefCount: number;
        }[] = [
            {
                name: 'stops at provided max parse length',
                maximumParseLength: 10_000,
                expectedFuncDefCount: 1,
            },
            {
                name: 'respects parse lengths higher than ten thousand',
                maximumParseLength: 11_000,
                expectedFuncDefCount: 2,
            },
            {
                name: '-1 means unlimited parsing',
                maximumParseLength: -1,
                expectedFuncDefCount: 2,
            },
            {
                name: '0 means no parsing',
                maximumParseLength: 0,
                expectedFuncDefCount: 0,
            },
        ];

        parseLenTests.forEach(
            ({ name, maximumParseLength, expectedFuncDefCount }) =>
                test(name, async () => {
                    const filename = '117-ten-thousand-lines.ahk1';
                    const document = await getDocument(
                        path.join(samplesPath, filename),
                    );
                    const result = await Parser.buildScript(document, {
                        maximumParseLength: maximumParseLength,
                    });
                    assert.strictEqual(
                        result.funcDefs.length,
                        expectedFuncDefCount,
                    );
                }),
        );

        const includeTests: {
            name: string;
            filename: string;
            /** Expected included files */
            expectedRelativePaths: string[];
        }[] = [
            {
                name: 'nonexistent file is still added',
                filename: '205-main.ahk1',
                expectedRelativePaths: ['included.ahk1'],
            },
        ];

        includeTests.forEach(({ name, filename, expectedRelativePaths }) =>
            test(name, async () => {
                const document = await getDocument(
                    path.join(samplesPath, filename),
                );
                const result = await Parser.buildScript(document);
                const expected = expectedRelativePaths.map((relPath) =>
                    path.join(samplesPath, relPath),
                );
                assert.deepStrictEqual(result.includedPaths, expected);
            }),
        );
    });
});
