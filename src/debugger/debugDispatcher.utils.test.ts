import { suite, test } from 'mocha';
import assert from 'assert';
import { getFileNameOnly } from './debugDispatcher.utils';

suite('getFileNameOnly', () => {
    const tests: [
        name: string,
        args: Parameters<typeof getFileNameOnly>,
        expected: ReturnType<typeof getFileNameOnly>,
    ][] = [
        ['forward slash', ['c:/path/to/script.ahk'], 'script.ahk'],
        ['backslash', ['c:\\path\\to\\script.ahk'], 'script.ahk'],
        ['mixed slash', ['c:\\path/to/script.ahk'], 'script.ahk'],
        ['no slash', ['script.ahk'], 'script.ahk'],
        ['empty string', [''], ''],
    ];
    tests.forEach(([name, args, expected]) =>
        test(name, () =>
            assert.strictEqual(getFileNameOnly(...args), expected),
        ),
    );
});
