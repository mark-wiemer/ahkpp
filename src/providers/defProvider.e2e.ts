import assert from 'assert';
import { tryGetFileLink } from './defProvider';
import path from 'path';
import {
    getActiveEditor,
    getDocument,
    goToDefinition,
    goToLine,
    showDocument,
    sleep,
} from '../test/utils';

/** Currently in `/out/src/providers`, want to get to `/` */
const rootPath = path.join(__dirname, '..', '..', '..');

suite('provideDefinition', () => {
    test('go to definition', async () => {
        const filePath = path.resolve(
            rootPath,
            `./e2e/definitionProvider/main.ahk1`,
        );
        const doc = await getDocument(filePath);
        const editor = await showDocument(doc);
        await sleep(1000); // wait for workspace to be indexed

        goToLine(editor, 10);

        await goToDefinition();
        assert(getActiveEditor().document.fileName.includes('included.ahk1'));
    });
});

// Unit test masked as e2e test due to dependency on vscode types
suite(tryGetFileLink.name, () => {
    const tests: [
        name: string,
        args: Parameters<typeof tryGetFileLink>,
        expected: ReturnType<typeof tryGetFileLink>,
    ][] = [['non-match', ['/c:/path/to/file.ahk', 'foo'], undefined]];
    tests.forEach(([name, args, expected]) =>
        test(name, async () => {
            assert.strictEqual(await tryGetFileLink(...args), expected);
        }),
    );
});
