//* Utilities not requiring the vscode API

import { isAbsolute, join, normalize } from 'path';

// #region `#include` utilities
/**
 ** Returns the string representing the included path after the `#include`.
 ** Only works for actual `#include` directives, not comments or strings containing `#include`.
 ** Does not escape semi-colons, returns raw string including backtick character.
 ** Does not resolve or normalize the included path.
 * @example
 * ('#include , a b.ahk') === 'a b.ahk'
 * ('  #include path/to/file.ahk') === 'path/to/file.ahk'
 * ('include , a b.ahk') === undefined // no `#`
 * ('; #include , a b.ahk') === undefined
 * ('x := % "#include , a b.ahk"') === undefined
 * ('#include a') === 'a'
 * ('#include %A_ScriptDir%') === '%A_ScriptDir%'
 * ('#include <myLib>') === '<myLib>'
 * ('#include semi-colon ;and-more.ahk') === 'semi-colon'
 * ('#include semi-colon`;and-more.ahk') === 'semi-colon`;and-more.ahk'
 */
export const getIncludedPath = (lineText: string): string | undefined =>
    lineText.match(/^\s*#include\s*,?\s*(.+?)( ;.*)?$/i)?.[1];

/**
 * Trims, escapes semi-colons, and resolves:
 * - `A_ScriptDir`
 * - `A_WorkingDir`
 * - `A_LineFile`
 */
const normalizeIncludedPath = (
    includedPath: string,
    basePath: string,
    parentGoodPath: string,
): string =>
    normalize(
        includedPath
            .trim()
            .replace(/`;/g, ';') // only semi-colons are escaped
            .replace(/(%A_ScriptDir%|%A_WorkingDir%)/, parentGoodPath)
            .replace(/(%A_LineFile%)/, basePath),
    );

/**
 * Returns the absolute, normalized path included by a `#include` directive.
 * - Does not check if that path is to a folder or if the path exists.
 * - Assumes `A_WorkingDir === A_ScriptDir`.
 *
 * @param basePath The path to include from, usually the script's path.
 * This may be a different path if the including script has a preceding `#include dir`
 *
 * @returns The absolute included path. Returns `undefined` if no path is found.
 */
export const resolveIncludedPath = (
    /**
     * The path of the current script, namely `vscode.document.uri.path`:
     * @example '/c:/path/to/file.ahk'
     */
    basePath: string,
    /** Line of text from the including script. */
    lineText: string,
): string | undefined => {
    const includedPath = getIncludedPath(lineText);
    if (!includedPath || includedPath.startsWith('<')) return undefined;

    /** @example 'c:/path/to' */
    const parentGoodPath = basePath.substring(1, basePath.lastIndexOf('/'));
    const normalizedPath = normalizeIncludedPath(
        includedPath,
        basePath,
        parentGoodPath,
    );
    const absolutePath = isAbsolute(includedPath)
        ? normalize(includedPath)
        : join(parentGoodPath, normalizedPath);
    return absolutePath;
};
// #endregion
