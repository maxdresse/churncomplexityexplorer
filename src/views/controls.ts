import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { commandIdChurn, commandIdClearChurn } from '../commands/compute-churn';
import { commandIdClearLoc, commandIdLoc } from '../commands/compute-loc';
import { ObservableLike } from '../observable-like';
import { ReadableAppState } from '../app-state';
import { getWorkspaceFolder } from '../get-ws-folder';

interface WebViewState {
    computationState: ReadableAppState;
    hasWorkspaceFolder: boolean;
}

export class ControlsWebViewProvider implements vscode.WebviewViewProvider {

    constructor(private readonly context: vscode.ExtensionContext,
                private readonly computationState$: ObservableLike<ReadableAppState>
    ) {}

    private latestWebViewState: WebViewState | undefined;

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

        const sub = this.computationState$
            .subscribe(s => {
                const webViewState = { computationState: s, hasWorkspaceFolder: !!getWorkspaceFolder() };
                this.latestWebViewState = webViewState;
                webviewView?.webview?.postMessage?.(webViewState);
        });

        webviewView.onDidDispose(() => {
            sub.unsubscribe();
        });

        webviewView.onDidChangeVisibility(() => {
            if (this.latestWebViewState && webviewView?.webview) {
                webviewView.webview.postMessage(this.latestWebViewState);
            }
        });
    }

    private getHtmlContent(): string {
        const htmlFilePath = path.join(this.context.extensionPath, 'media', 'controls.html');
        return fs.readFileSync(htmlFilePath, 'utf8');
    }
}