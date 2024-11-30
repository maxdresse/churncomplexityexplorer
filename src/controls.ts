import * as vscode from 'vscode';

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
            console.log(message.command === 'runTask');
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
                    body {
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        height: 100%;
                        padding: 0;
                        margin: 0;
                    }
                    button {
                        font-size: 16px;
                        padding: 10px 20px;
                        cursor: pointer;
                    }
                </style>
            </head>
            <body>
                <button id="runTaskButton">Run Task</button>
                <script>
                    const vscode = acquireVsCodeApi();
                    document.getElementById('runTaskButton').addEventListener('click', () => {
                        vscode.postMessage({ command: 'runTask' });
                    });
                </script>
            </body>
            </html>
        `;
    }
}