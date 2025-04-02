import { Dir, promises } from 'fs';
import { resolve } from 'path';
import { FuncDef, Script } from './model';

/**
 * Caches scripts by their document.uri.path:
 * case-sensitive, forward-slash delimited, absolute paths
 * @example '/c:/Users/mark/myFile.ahk'
 */
export const scriptCache = new Map<string, Script>();

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
): Promise<string[]> {
    const paths: string[] = [];
    if (!rootDirPath) {
        return paths;
    }
    const exclude = parseExcludeConfig(excludeConfig);

    const pathsToBuildInner = async (rootPath: string) => {
        let dir: Dir;
        try {
            dir = await promises.opendir(rootPath);
        } catch {
            return paths;
        }
        for await (const dirent of dir) {
            const path = resolve(rootPath, dirent.name);
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
                paths.push(path);
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
 * Note that duplicate function definitions are not allowed in AHK v1 or v2.
 *
 * @param newSearch Only look at local files and local library, not entire workspace
 * ref https://www.autohotkey.com/docs/v1/Functions.htm#lib
 */
export function getFuncDefByName(
    /** Forward-slash delimited path */
    path: string,
    name: string,
    /** Use the new search algorithm instead of global search */
    newSearch: boolean,
    //* Local value is used for testing
    localCache?: Map<string, Pick<Script, 'includedPaths' | 'funcDefs'>>,
): FuncDef | undefined {
    name = name.toLowerCase();
    const cache = localCache ?? scriptCache;
    // defined in this file (original logic)
    const script = cache.get(path);

    for (const func of script.funcDefs) {
        if (func.name.toLowerCase() === name) {
            return func;
        }
    }

    if (!newSearch) {
        // global search (original logic)
        for (const filePath of cache.keys()) {
            for (const func of cache.get(filePath).funcDefs) {
                if (func.name.toLowerCase() === name) {
                    return func;
                }
            }
        }
        // end here so that users see the difference between new and old
        return undefined;
    }

    // defined in an included file (experimental logic)
    const visitedPaths = new Set<string>();
    const queue: string[] = script.includedPaths;
    while (queue.length > 0) {
        const currentPath = queue.shift();
        if (visitedPaths.has(currentPath)) {
            continue;
        }
        visitedPaths.add(currentPath);

        const includedScript = cache.get(currentPath);
        if (!includedScript) {
            continue;
        }
        // search this included path
        for (const func of includedScript.funcDefs) {
            if (func.name.toLowerCase() === name) {
                return func;
            }
        }
        // add the deeper included paths to the queue
        for (const includedPath of includedScript.includedPaths) {
            if (!visitedPaths.has(includedPath)) {
                queue.push(includedPath);
            }
        }
    }

    // full name defined in a local library file of the same name
    // library file must end in `.ahk` in this case to be found by AHK v1
    const libPath = path.replace(/\/[^/]+$/, `/lib/`);
    const fullPath = libPath + name + '.ahk';
    for (const filePath of cache.keys()) {
        if (filePath.toLowerCase() !== fullPath.toLowerCase()) {
            continue;
        }
        for (const func of cache.get(filePath).funcDefs) {
            if (func.name.toLowerCase() === name) {
                return func;
            }
        }
    }

    // partial name (prefix) defined in a local library file
    // this is the last step--if it fails, return undefined
    // in theory we could expand to search user and standard libraries in future
    const prefixPath = name.includes('_')
        ? libPath + name.split('_')[0] + '.ahk'
        : undefined;
    if (!prefixPath) {
        return undefined;
    }
    for (const filePath of cache.keys()) {
        if (filePath.toLowerCase() !== prefixPath.toLowerCase()) {
            continue;
        }
        for (const func of cache.get(filePath).funcDefs) {
            if (func.name.toLowerCase() === name) {
                return func;
            }
        }
    }
}
