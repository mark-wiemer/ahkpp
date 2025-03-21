import * as vscode from 'vscode';
import { ConfigKey, Global } from './global';

/** Logs messages to IDE output channel */
// Name of this class is referenced in docs, update if changed
export class Out {
    private static outputChannel: vscode.OutputChannel;

    public static verbose(value: Error | string) {
        if (Global.getConfig<boolean>(ConfigKey.verboseLogging)) {
            Out.log(value, false);
        }
    }

    /**
     * Logs the given value without focusing the output view.
     * Prepends all logs with `new Date().toISOString()`.
     */
    // Name of this func is referenced in docs, update if changed
    public static info(value: Error | string) {
        Out.log(value, false);
    }

    public static warn(value: Error | string) {
        Out.log(value, true);
    }

    /**
     * Logs the given value. Traces errors to console before logging.
     * Prepends all logs with `new Date().toISOString()`.
     * @param value The value to log
     * @param focus whether to focus the output view. Defaults to true.
     */
    private static log(value: Error | string, focus: boolean) {
        if (value instanceof Error) {
            console.trace(value);
            value = value.message;
        }
        if (!this.outputChannel) {
            this.outputChannel =
                vscode.window.createOutputChannel('AHK++ (v1)');
        }
        if (focus) {
            this.outputChannel.show(focus);
        }
        this.outputChannel.appendLine(`${new Date().toISOString()} ${value}`);
    }
}
