import { suite, test } from 'mocha';
import * as assert from 'assert';
import { pathsToBuild } from './parser.utils';
import sinon from 'sinon';
import { Dir, Dirent, promises } from 'fs';
import path from 'path';

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
            const result = await pathsToBuild(mockPath, [], exclusions);
            const absoluteExpected = relativeExpected.map((e) =>
                path.join(mockPath, e),
            );
            assert.deepStrictEqual(result, absoluteExpected);
        }),
    );
});
