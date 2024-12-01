import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
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
        // example for posting a message to webview
        //webviewView.webview.postMessage({ asdf: 3 })
    }

    private getHtmlContent(): string {
        const htmlPath = path.join(this.context.extensionPath, 'src', 'views', 'controls.html');
        return fs.readFileSync(htmlPath, 'utf8');
    }
}