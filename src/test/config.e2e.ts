import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import {
    addAndSelectSnippet,
    closePanel,
    getCompletionSuggestionLabels,
    getDocument,
    isOutputVisible,
    showDocument,
    sleep,
    updateConfig,
} from './utils';
import { ConfigKey, LibIncludeType, ShowOutput } from '../common/global';
import { suite, before, test } from 'mocha';

/** Currently in `/out/src/test`, want to get to `/` */
const rootPath = path.join(__dirname, '..', '..', '..');
const samplesParentPath = path.join(rootPath, 'src/test/samples');

/** Snippet text that should result in `funcName` being suggested (based on config) */
const snippetText = 'MyExclu';

/** Func name included in a local library in the `excludedFileName` */
const funcName = 'MyExcludedFunc';

// CI does not have AHK installed
suite('general.showOutput @ignoreCI', () => {
    const before = async (show: ShowOutput) => {
        await updateConfig<{ showOutput: ShowOutput }>(ConfigKey.general, {
            showOutput: show,
        });
        const filePath = path.join(samplesParentPath, 'ahk2.ahk2');
        const doc = await getDocument(filePath);
        await showDocument(doc);
    };

    const runTests: [name: string, show: ShowOutput][] = [
        ['always + run', 'always'],
        ['never + run', 'never'],
    ];

    runTests.forEach(([name, show]) => {
        test(name, async () => {
            await before(show);

            // run cmd opens panel when `showOutput` is 'always'
            await closePanel();

            await vscode.commands.executeCommand(`ahk++.run`);

            assert.equal(await isOutputVisible(), show === 'always');
        });
    });
});

suite('exclude', () => {
    /** Name of file containing library functions for `exclude` testing */
    const excludedFileName = 'excluded.ahk';
    const excludedList = ['1', '2'].map((i) => `${excludedFileName}${i}`);
    /**
     * These tests run in a specific order to update the config correctly
     * Config does not update on v2 for speed
     */
    const tests: [
        name: string,
        version: 1 | 2,
        exclude: string[],
        expected: boolean,
    ][] = [
        ['v1 no exclusions', 1, [], true],
        ['v2 no exclusions', 2, [], true],
        ['v1 exclusions', 1, excludedList, false],
        ['v2 exclusions', 2, excludedList, false],
        ['back to v1 no exclusions', 1, [], true],
        ['back to v2 no exclusions', 2, [], true],
    ];

    before(async () => {
        await updateConfig<{ librarySuggestions: LibIncludeType }>(
            ConfigKey.generalV2,
            { librarySuggestions: LibIncludeType.All },
        );
    });

    tests.forEach(([name, version, exclude, expected]) => {
        test(name, async () => {
            if (version === 1) {
                await updateConfig<string[]>(ConfigKey.exclude, exclude);
            }
            const filePath = path.resolve(rootPath, `./e2e/main.ahk${version}`);
            const doc = await getDocument(filePath);
            const editor = await showDocument(doc);
            await sleep(1_000); // todo only these tests are extra flaky
            await addAndSelectSnippet(editor, snippetText);

            const labels = await getCompletionSuggestionLabels(editor);

            assert.strictEqual(labels.includes(funcName), expected);
        });
    });
});

suite('v2.general.librarySuggestions', () => {
    let editor: vscode.TextEditor;
    before(async () => {
        await updateConfig<string[]>(ConfigKey.exclude, []);
        const filePath = path.resolve(rootPath, './e2e/main.ahk2');
        const doc = await getDocument(filePath);
        editor = await showDocument(doc);
        await sleep(1_000);
    });

    const tests: [name: string, libType: LibIncludeType, expected: boolean][] =
        [
            ['Disabled', LibIncludeType.Disabled, false],
            ['Local', LibIncludeType.Local, true],
            ['User and Standard', LibIncludeType.UserAndStandard, false],
            ['All', LibIncludeType.All, true],
        ];

    tests.forEach(([name, libType, expected]) => {
        test(name, async () => {
            await updateConfig<{ librarySuggestions: LibIncludeType }>(
                ConfigKey.generalV2,
                { librarySuggestions: libType },
            );
            await addAndSelectSnippet(editor, snippetText);

            const labels = await getCompletionSuggestionLabels(editor);

            assert.strictEqual(labels.includes(funcName), expected);
        });
    });
});
