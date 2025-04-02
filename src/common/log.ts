import * as vscode from 'vscode';
import { ConfigKey, Global } from './global';

/** Logs messages to IDE output channel */
// ref https://learn.microsoft.com/en-us/dotnet/api/microsoft.extensions.logging.loglevel
enum LogLevel {
    Trace = 0,
    Debug = 1,
    Info = 2,
    Warn = 3,
    Error = 4,
    Critical = 5,
    None = 6,
}

let outputChannel: vscode.OutputChannel;
const getOutputChannel = () => {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('AHK++ (v1)');
    }
    return outputChannel;
};

const logLevelRecord: Record<string, LogLevel> = {
    trace: LogLevel.Trace,
    debug: LogLevel.Debug,
    info: LogLevel.Info,
    warn: LogLevel.Warn,
    error: LogLevel.Error,
    critical: LogLevel.Critical,
    none: LogLevel.None,
};
// Cache value once, only update on restart for perf
const configLevelStr: string | undefined = Global.getConfig<string>(
    ConfigKey.logLevel,
);

/** `trace` calls should not be deployed, only used for local testing */
export const trace = (value: Error | string) => log(value, LogLevel.Trace);
export const debug = (value: Error | string) => log(value, LogLevel.Debug);
export const info = (value: Error | string) => log(value, LogLevel.Info);
export const warn = (value: Error | string) => log(value, LogLevel.Warn);
export const error = (value: Error | string) => log(value, LogLevel.Error);
export const critical = (value: Error | string) =>
    log(value, LogLevel.Critical);

/**
 * Logs message if provided log level is valid for configured log level.
 * Logs warning if configured log level is invalid.
 */
const log = (value: Error | string, thisLevel: LogLevel) => {
    const configLevel: LogLevel | undefined = logLevelRecord[configLevelStr];
    if (configLevel === undefined) {
        logInner(`Invalid setting AHK++.general.logLevel: "${configLevelStr}"`);
        getOutputChannel().show(false);
        return;
    }
    if (configLevel === LogLevel.None) {
        return;
    }
    if (thisLevel >= configLevel) {
        if (value instanceof Error) {
            console.trace(value);
            value = value.message;
        }
        logInner(value);
        if (thisLevel >= LogLevel.Warn) {
            const focusOutput = thisLevel >= LogLevel.Error;
            getOutputChannel().show(focusOutput);
        }
    }
};

const logInner = (value: string) =>
    getOutputChannel().appendLine(`${new Date().toISOString()} ${value}`);
