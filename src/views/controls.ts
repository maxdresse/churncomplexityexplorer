import * as vscode from 'vscode';
import { ComputeChurnCommand } from '../commands/compute-churn';

export class ControlsWebViewProvider implements vscode.WebviewViewProvider {
    private _view?: vscode.WebviewView;

    constructor(private readonly context: vscode.ExtensionContext) {}

    resolveWebviewView(webviewView: vscode.WebviewView) {
        this._view = webviewView;

        // Set up the Webview
        webviewView.webview.options = {
            enableScripts: true
        };

        // HTML content for the Webview
        webviewView.webview.html = this.getHtmlContent();

        // Handle messages from the Webview
        webviewView.webview.onDidReceiveMessage(async message => {
            if (message.command === "computeChurn") {
                vscode.commands.executeCommand(ComputeChurnCommand.id);
            }
        });
    }

    private getHtmlContent(): string {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Controls</title>
                <style>
                    html, body {
                        height: 100%;
                        width: 100%
                        padding: 0;
                        margin: 0;
                    }
                    body {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                        background-color: var(--vscode-editor-background);
                    }
                    button {
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-button-foreground);
                        background: var(--vscode-button-background);
                        border: 1px solid transparent;
                        border-radius: 4px;
                        padding: 8px 16px;
                        cursor: pointer;
                        transition: background-color 0.2s ease-in-out;
                    }

                    button:hover {
                        background: var(--vscode-button-hoverBackground);
                    }

                    button:focus {
                        outline: 2px solid var(--vscode-focusBorder);
                    }

                    button:active {
                        background: var(--vscode-button-hoverBackground);
                        box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.3);
                    }

                </style>
            </head>
            <body>
                <button id="runTaskButton">Compute Churn Metrics</button>
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('runTaskButton').addEventListener('click', () => {
                        console.log('click');
                        vscode.postMessage({ command: 'computeChurn' });
                    });
                </script>
            </body>
            </html>
        `;
    }
}