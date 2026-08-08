import { suite, test } from 'mocha';
import assert from 'assert';
import {
    executableExists,
    findInterpreterPath,
    getIncludedPath,
    resolveIncludedPath,
} from './utils';

suite(executableExists.name, () => {
    test('accepts an existing executable', () =>
        assert.strictEqual(executableExists(process.execPath), true));

    test('rejects a missing executable', () =>
        assert.strictEqual(
            executableExists('definitely-not-an-autohotkey-executable.exe'),
            false,
        ));
});

suite(findInterpreterPath.name, () => {
    test('prefers the configured executable', () =>
        assert.strictEqual(
            findInterpreterPath(process.execPath, 'AutoHotkeyV2.exe'),
            process.execPath,
        ));
});

suite(getIncludedPath.name, () => {
    const tests: [
        name: string,
        args: Parameters<typeof getIncludedPath>,
        expected: ReturnType<typeof getIncludedPath>,
    ][] = [
        ['comma', ['#include , a b.ahk'], 'a b.ahk'],
        ['no hash', ['include , a b.ahk'], undefined],
        [
            'no comma nor extra space',
            ['#include path/to/file.ahk'],
            'path/to/file.ahk',
        ],
        ['ah1', ['#include a.ah1'], 'a.ah1'],
        ['ahk1', ['#include a.ahk1'], 'a.ahk1'],
        ['ext', ['#include a.ext'], 'a.ext'],
        ['preceding whitespace', ['   #include a.ahk'], 'a.ahk'],
        ['directory', ['#include a'], 'a'],
        ['non-whitespace preceding char', [';#include a'], undefined],
        ['escaped `;` with whitespace', ['#include a `;b.ahk'], 'a `;b.ahk'],
        ['escaped `;` without whitespace', ['#include a`;b.ahk'], 'a`;b.ahk'],
        ['unescaped `;` without whitespace', ['#include a;b.ahk'], 'a;b.ahk'],
        ['unescaped `;` with preceding whitespace', ['#include a ;b.ahk'], 'a'],
        ['unescaped `;` with trailing whitespace', ['#include a ; b.ahk'], 'a'],
        [
            'escaped `;` with trailing whitespace',
            ['#include a `; b.ahk'],
            'a `; b.ahk',
        ],
        ['unescaped valid `%`', ['#include %A_ScriptDir%'], '%A_ScriptDir%'],
        ['unescaped `<` and `>`', ['#include <foo>'], '<foo>'],
    ];
    tests.forEach(([name, args, expected]) =>
        test(name, () =>
            assert.strictEqual(getIncludedPath(...args), expected),
        ),
    );
});

suite(resolveIncludedPath.name, () => {
    const tests: [
        name: string,
        args: Parameters<typeof resolveIncludedPath>,
        expected: ReturnType<typeof resolveIncludedPath>,
    ][] = [
        ['relative file', ['/c:/main.ahk', 'a.ahk'], 'c:\\a.ahk'],
        ['absolute file', ['/c:/users/main.ahk', 'd:/b.ahk'], 'd:\\b.ahk'],
        [
            'A_ScriptDir',
            ['/c:/users/main.ahk', '%A_ScriptDir%/AutoXYWH.ahk'],
            'c:\\users\\AutoXYWH.ahk',
        ],
        [
            'A_WorkingDir',
            ['/c:/users/main.ahk', '%A_WorkingDir%/AutoXYWH.ahk'],
            'c:\\users\\AutoXYWH.ahk',
        ],
        [
            'A_LineFile',
            ['/c:/users/main.ahk', '%A_LineFile%/../other.ahk'],
            // Starting with a forward slash still works :)
            '\\c:\\users\\other.ahk',
        ],
        ['with single dot', ['/c:/main.ahk', './c.ahk'], 'c:\\c.ahk'],
        ['with double dot', ['/c:/users/main.ahk', '../d.ahk'], 'c:\\d.ahk'],
    ];
    tests.forEach(([name, args, expected]) =>
        test(name, () =>
            assert.strictEqual(
                resolveIncludedPath(args[0], `#include ${args[1]}`),
                expected,
            ),
        ),
    );
});
