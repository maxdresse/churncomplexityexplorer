import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { commandIdChurn, commandIdClearChurn } from '../commands/compute-churn';
import { commandIdClearLoc, commandIdLoc } from '../commands/compute-loc';
import { ObservableLike } from '../observable-like';
import { ReadableAppState } from '../app-state';
import { getWorkspaceFolder } from '../get-ws-folder';

export class ControlsWebViewProvider implements vscode.WebviewViewProvider {

    constructor(private readonly context: vscode.ExtensionContext,
                private readonly computationState$: ObservableLike<ReadableAppState>
    ) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        // Set up the Webview
        webviewView.webview.options = {
            enableScripts: true
        };

        // HTML content for the Webview
        webviewView.webview.html = this.getHtmlContent();

        const webviewMsgHandlers: Record<string, () => void | Thenable<void>> = {
            computeChurn: () => vscode.commands.executeCommand(commandIdChurn),
            clearChurn: () => vscode.commands.executeCommand(commandIdClearChurn),
            computeLoc: () => vscode.commands.executeCommand(commandIdLoc),
            clearLoc: () => vscode.commands.executeCommand(commandIdClearLoc),
            computeAll: async () => {
                await vscode.commands.executeCommand(commandIdChurn);
                await vscode.commands.executeCommand(commandIdLoc);
            },
            clearAll: async () => {
                await vscode.commands.executeCommand(commandIdClearChurn);
                await vscode.commands.executeCommand(commandIdClearLoc);
            }
        };

        // Handle messages from the Webview
        webviewView.webview.onDidReceiveMessage(async message => {
            const handler = webviewMsgHandlers[message.command];
            if (typeof handler === 'function') {
                await handler();
            }
        });

        this.computationState$.subscribe(s => {
            webviewView?.webview?.postMessage?.({ computationState: s, hasWorkspaceFolder: !!getWorkspaceFolder() });
        })
    }

    private getHtmlContent(): string {
        const htmlPath = path.join(this.context.extensionPath, 'src', 'views', 'controls.html');
        return fs.readFileSync(htmlPath, 'utf8');
    }
}