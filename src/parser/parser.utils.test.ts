import { suite, test } from 'mocha';
import * as assert from 'assert';
import { getFuncDefByName, pathsToBuild } from './parser.utils';
import sinon from 'sinon';
import { Dir, Dirent, promises } from 'fs';
import path from 'path';
import { FuncDef, Script } from './model';

const rootPath = path.join(__dirname, '..', '..', '..');
const mockDirName = 'e2e';
const mockPath = path.join(rootPath, mockDirName);

/**
 * Keys corresponding to arrays are seen as files.
 * Keys corresponding to objects are seen as directories.
 */
const mockDirStructure = {
    [mockDirName]: {
        'main.ahk': [],
        'main.ah1': [],
        'main.ext': [],
        'main.txt': [],
        sub: {
            'sub.ahk': [],
            'sub.ah1': [],
            'sub.ext': [],
            'sub.txt': [],
        },
    },
};

const createMockDir = (structure: Record<string, object | string[]>): Dir =>
    ({
        async *[Symbol.asyncIterator]() {
            for (const key of Object.keys(structure)) {
                yield createMockDirent(key, structure[key]);
            }
        },
    }) as Dir;

const createMockDirent = (name: string, value: object | string[]): Dirent =>
    ({
        name,
        isDirectory: () => typeof value === 'object' && !Array.isArray(value),
        isFile: () => Array.isArray(value),
    }) as Dirent;

sinon
    .stub(promises, 'opendir')
    .callsFake(async (path: string): Promise<Dir> => {
        const relativePath = path.replace(rootPath, '').replace(/\\/g, '/');
        const parts = relativePath.split('/').filter(Boolean);
        let currentDir = mockDirStructure;

        for (const part of parts) {
            if (typeof currentDir === 'object' && part in currentDir) {
                currentDir = currentDir[part];
            } else {
                throw new Error(
                    `Path ${path} not found in mock directory structure`,
                );
            }
        }

        return createMockDir(currentDir as Record<string, object | string[]>);
    });

suite('pathsToBuild', () => {
    after(() => {
        sinon.restore();
    });

    const tests: [
        name: string,
        exclusions: string[],
        expected: Awaited<ReturnType<typeof pathsToBuild>>,
    ][] = [
        [
            'no exclusions',
            [],
            [
                'main.ahk',
                'main.ah1',
                'main.ext',
                'sub/sub.ahk',
                'sub/sub.ah1',
                'sub/sub.ext',
            ],
        ],
        [
            'exclude .ext',
            ['*.ext'],
            ['main.ahk', 'main.ah1', 'sub/sub.ahk', 'sub/sub.ah1'],
        ],
        ['exclude sub', ['sub/*'], ['main.ahk', 'main.ah1', 'main.ext']],
        ['exclude all', ['*'], []],
    ];
    tests.forEach(([name, exclusions, relativeExpected]) =>
        test(name, async () => {
            const result = await pathsToBuild(mockPath, exclusions);
            const absoluteExpected = relativeExpected.map((e) =>
                path.join(mockPath, e),
            );
            assert.deepStrictEqual(result, absoluteExpected);
        }),
    );
});

suite('getFuncDefByName', () => {
    type RetType = ReturnType<typeof getFuncDefByName>;
    const mockScriptPath = 'mockScriptPath';
    const mockFuncName = 'testFunc';
    const mockFuncDef = {
        name: mockFuncName,
        uriString: mockScriptPath,
    } as FuncDef;

    const getMockScript = () => ({
        funcDefs: [mockFuncDef],
        includedPaths: [],
    });

    const getMockCache = () => makeCache([[mockScriptPath, getMockScript()]]);

    const makeCache = (pairs: [string, Partial<Script>][]) => {
        return new Map<string, Script>(pairs as [string, Script][]);
    };

    suite('common behavior', () => {
        const tests: [string, (ns: boolean) => void][] = [
            [
                'finds function in the same file',
                (newSearch: boolean) => {
                    const result = getFuncDefByName(
                        mockScriptPath,
                        mockFuncName,
                        newSearch,
                        getMockCache(),
                    );
                    assert.strictEqual(result, mockFuncDef);
                },
            ],
            [
                'returns undefined for non-existent function',
                (newSearch: boolean) => {
                    const result = getFuncDefByName(
                        mockScriptPath,
                        'nonExistentFunc',
                        newSearch,
                        getMockCache(),
                    );
                    assert.strictEqual(result, undefined);
                },
            ],
            [
                'finds function in included file',
                (newSearch: boolean) => {
                    const includedFuncDef = { name: 'includedFunc' } as FuncDef;
                    const includedScript = {
                        funcDefs: [includedFuncDef],
                        includedPaths: [],
                    } as Script;

                    const script = getMockScript();
                    script.includedPaths.push('includedPath');

                    const cache = makeCache([[mockScriptPath, script]]);
                    cache.set('includedPath', includedScript);

                    const result = getFuncDefByName(
                        mockScriptPath,
                        'includedFunc',
                        newSearch,
                        cache,
                    );
                    assert.strictEqual(result, includedFuncDef);
                },
            ],
        ];

        suite('new search', () => {
            tests.forEach(([name, testFunc]) => {
                test(name, () => {
                    testFunc(true);
                });
            });
        });

        suite('old search', () => {
            tests.forEach(([name, testFunc]) => {
                test(name, () => {
                    testFunc(false);
                });
            });
        });
    });

    suite('differing behavior', () => {
        const tests: {
            oldName: string;
            newName: string;
            oldResult: RetType;
            newResult: RetType;
            testFunc: (ns: boolean) => RetType;
        }[] = [
            {
                oldName: 'finds non-included function in global search',
                newName: `does not find function that isn't included`,
                oldResult: { name: 'globalFunc' } as FuncDef,
                newResult: undefined,
                testFunc: (newSearch: boolean) => {
                    const globalFuncDef = { name: 'globalFunc' } as FuncDef;
                    const globalScript = {
                        funcDefs: [globalFuncDef],
                        includedPaths: [],
                    } as Script;

                    const cache = getMockCache();
                    cache.set('globalPath', globalScript);

                    return getFuncDefByName(
                        mockScriptPath,
                        'globalFunc',
                        newSearch,
                        cache,
                    );
                },
            },
            {
                oldName: 'does not prioritize included files',
                newName: `prioritizes included files`,
                oldResult: {
                    name: 'includedFunc',
                    uriString: 'globalPath',
                } as FuncDef,
                newResult: {
                    name: 'includedFunc',
                    uriString: 'includedPath',
                } as FuncDef,
                testFunc: (newSearch: boolean) => {
                    const includedFuncDef = { name: 'includedFunc' } as FuncDef;
                    const includedScript: Script = {
                        funcDefs: [
                            { ...includedFuncDef, uriString: 'includedPath' },
                        ],
                        includedPaths: [],
                    } as Script;

                    const globalScript: Script = {
                        funcDefs: [
                            { ...includedFuncDef, uriString: 'globalPath' },
                        ],
                        includedPaths: [],
                    } as Script;

                    // same func def name in two files--test which is prioritized
                    // set global first so that it's searched first
                    const script = getMockScript();
                    script.includedPaths.push('includedPath');
                    const cache = makeCache([[mockScriptPath, script]]);
                    cache.set('globalPath', globalScript);
                    cache.set('includedPath', includedScript);

                    return getFuncDefByName(
                        mockScriptPath,
                        'includedFunc',
                        newSearch,
                        cache,
                    );
                },
            },
        ];

        tests.forEach(
            ({ oldName, newName, oldResult, newResult, testFunc }) => {
                test(`old search ` + oldName, () => {
                    const result = testFunc(false);
                    assert.deepStrictEqual(result, oldResult);
                });

                test(`new search ` + newName, () => {
                    const result = testFunc(true);
                    assert.deepStrictEqual(result, newResult);
                });
            },
        );
    });
});
