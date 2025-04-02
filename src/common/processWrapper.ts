import * as child_process from 'child_process';
import { error as logError } from './log';

/**
 * Wrapper for Node's `child_process.exec`, includes logging.
 * Resolves if child process exits gracefully.
 * Rejects and logs error message if child process exits with error.
 */
export const exec = (
    command: string,
    options: child_process.ExecOptions = {},
): Promise<true> =>
    new Promise((resolve, reject) => {
        child_process.exec(command, options, (error) => {
            if (error) {
                logError(error.message);
                reject(error);
                return;
            }
            resolve(true);
        });
    });
