import { Dir, promises } from 'fs';
import { resolve } from 'path';
import { FuncDef, Script } from './model';
export const documentCache = new Map<string, Script>();

interface Exclude {
    file: RegExp[];
    folder: RegExp[];
}

/**
 * Recursively returns absolute paths of all apparent v1 scripts under `rootDirPath`.
 * Behavior undefined if `rootDirPath` is not a valid directory path.
 */
export async function pathsToBuild(
    rootDirPath: string,
    excludeConfig: string[],
    log: (val: string) => void = () => {},
): Promise<string[]> {
    const funcName = 'pathsToBuild';
    const paths: string[] = [];
    if (!rootDirPath) {
        return paths;
    }
    const exclude = parseExcludeConfig(excludeConfig);
    const folderStr = exclude.folder.map((re) => re.toString()).join('\n');
    log(`${funcName}.exclude.folder: ${folderStr}`);
    const file = exclude.file.map((re) => re.toString()).join('\n');
    log(`${funcName}.exclude.file: ${file}`);

    const pathsToBuildInner = async (rootPath: string) => {
        log(`${funcName} checking root ` + rootPath);
        let dir: Dir;
        try {
            dir = await promises.opendir(rootPath);
        } catch (e) {
            log(`${funcName} error opening root ` + rootPath);
            log(e);
            return paths;
        }
        log(`${funcName} opened root ` + rootPath);
        for await (const dirent of dir) {
            const path = resolve(rootPath, dirent.name);
            log('Checking ' + path);
            if (
                dirent.isDirectory() &&
                !exclude.folder.some((re) => re.test(path))
            ) {
                await pathsToBuildInner(path);
            } else if (
                dirent.isFile() &&
                dirent.name.match(/\.(ahk|ah1|ahk1|ext)$/i) &&
                !exclude.file.some((re) => re.test(path))
            ) {
                log('Adding ' + path);
                paths.push(path);
            } else {
                log('Ignoring ' + path);
            }
        }
        return paths;
    };

    return await pathsToBuildInner(rootDirPath);
}

function parseExcludeConfig(exclude: string[] = []): Exclude {
    const fileExclude: RegExp[] = [];
    const folderExclude: RegExp[] = [];
    for (const s of exclude)
        try {
            (/[\\/]$/.test(s) ? folderExclude : fileExclude).push(
                glob2regexp(s),
            );
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            console.log(`[Error] Invalid glob pattern: ${s}`);
        }
    return { file: fileExclude, folder: folderExclude };
}

// Copied from AHK2
// todo add tests or replace with known library
function glob2regexp(glob: string) {
    let reStr = '',
        inGroup = false,
        isNot: boolean,
        c: string;
    if ((isNot = glob.startsWith('!'))) glob = glob.slice(1);
    for (let i = 0, j, len = glob.length; i < len; i++) {
        switch ((c = glob[i])) {
            case '/':
            case '\\':
                reStr += '[\\x5c/]';
                break;
            case '$':
            case '^':
            case '+':
            case '.':
            case '(':
            case ')':
            case '=':
            case '|':
                reStr += '\\' + c;
                break;
            case '?':
                reStr += '.';
                break;
            case '!':
                if (!i) isNot = true;
                else if (reStr.endsWith('[')) reStr += '^';
                else reStr += '\\' + c;
                break;
            case '{':
                inGroup = true;
                reStr += '(';
                break;
            case '}':
                inGroup = false;
                reStr += ')';
                break;
            case ',':
                reStr += inGroup ? '|' : ',';
                break;
            case '*':
                j = i;
                while (glob[i + 1] === '*') i++;
                if (
                    i > j &&
                    /^[\x5c/]?\*+[\x5c/]?$/.test(glob.substring(j - 1, i + 2))
                ) {
                    reStr += '((?:[^\\x5c/]*(?:[\\x5c/]|$))*)';
                    i++;
                } else {
                    reStr += '([^\\x5c/]*)';
                }
                break;
            default:
                reStr += c;
        }
    }
    if (/^([a-zA-Z]:|\*\*)/.test(glob)) reStr = '^' + reStr;
    else if (!/[\\/]/.test(glob[0])) reStr = '[\\x5c/]' + reStr;
    if (!/[\\/]$/.test(glob)) reStr += '$';
    if (isNot) reStr = reStr.startsWith('^') ? `^(?!${reStr})` : `(?!${reStr})`;
    return new RegExp(reStr, 'i');
}

/**
 * Finds the best reference to the function.
 * If a function of this name exists in the current file, returns that function.
 * Otherwise, searches through document cache to find the matching function.
 * Matches are not case-sensitive and only need to match function name.
 * Note that duplicate function definitions are not allowed in AHK v1.
 *
 * todo should only search included files and library files
 * - https://github.com/mark-wiemer/ahkpp/issues/205
 */
export function getFuncDefByName(
    path: string,
    name: string,
    localCache = documentCache,
): FuncDef | undefined {
    name = name.toLowerCase();
    // defined in this file (original logic)
    for (const func of localCache.get(path).funcDefs) {
        if (func.name.toLowerCase() === name) {
            return func;
        }
    }

    // defined in an included file (experimental logic)
    // this only searches one level deep, but it's a start
    // todo nested searching with cycle detection
    // todo tests!
    localCache.get(path).includedPaths.forEach((path) => {
        const includedDocument = documentCache.get(path);
        if (includedDocument) {
            for (const func of includedDocument.funcDefs) {
                if (func.name.toLowerCase() === name) {
                    return func;
                }
            }
        }
    });

    // global search (original logic)
    for (const filePath of localCache.keys()) {
        for (const func of localCache.get(filePath).funcDefs) {
            if (func.name.toLowerCase() === name) {
                return func;
            }
        }
    }
    return undefined;
}
