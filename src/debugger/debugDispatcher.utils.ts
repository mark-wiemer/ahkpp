/**
 * Returns the user-friendly "name" of the file instead of its path
 * @param path slash-delimited path (backslash, forward slash, or mixed)
 * @returns last segment of the path
 * @example ('c:\\Users\\mark\\myScript.ahk') => 'myScript.ahk'
 */
export const getFileNameOnly = (path: string): string => {
    const splitPath = path.split(/\\|\//);
    return splitPath[splitPath.length - 1];
};
