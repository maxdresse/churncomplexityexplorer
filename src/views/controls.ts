import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { commandIdChurn, commandIdClearChurn } from '../commands/compute-churn';
import { commandIdClearLoc, commandIdLoc } from '../commands/compute-loc';
import { ObservableLike } from '../observable-like';
import { ReadableAppState } from '../app-state';

export class ControlsWebViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext,
                private readonly computationState$: ObservableLike<ReadableAppState>
    ) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        // Set up the Webview
        webviewView.webview.options = {
            enableScripts: true
        };

        // HTML content for the Webview
        webviewView.webview.html = this.getHtmlContent();

        const webviewMsgHandlers: Record<string, () => void> = {
            computeChurn: () => vscode.commands.executeCommand(commandIdChurn),
            clearChurn: () => vscode.commands.executeCommand(commandIdClearChurn),
            computeLoc: () => vscode.commands.executeCommand(commandIdLoc),
            clearLoc: () => vscode.commands.executeCommand(commandIdClearLoc),
        };

        // Handle messages from the Webview
        webviewView.webview.onDidReceiveMessage(async message => {
            const handler = webviewMsgHandlers[message.command];
            if (typeof handler === 'function') {
                handler();
            }
        });
        // example for posting a message to webview
        //webviewView.webview.postMessage({ asdf: 3 })
    }

    private getHtmlContent(): string {
        const htmlPath = path.join(this.context.extensionPath, 'src', 'views', 'controls.html');
        return fs.readFileSync(htmlPath, 'utf8');
    }
}