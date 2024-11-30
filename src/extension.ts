// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { WorkspaceTreeProvider } from './views/explorer';
import { ControlsWebViewProvider } from './views/controls';
import { ComputeChurnCommand } from './commands/compute-churn';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Register the TreeDataProvider for the custom view
    const disposableForExp = vscode.window.registerTreeDataProvider(
        'cc-explorer', 
        new WorkspaceTreeProvider()
    );
    context.subscriptions.push(disposableForExp);
    // register the controls webview
    const disposableForCont = vscode.window.registerWebviewViewProvider(
        'cc-controls',
        new ControlsWebViewProvider(context)
    );
    context.subscriptions.push(disposableForCont);
    // register the compute churn command
    context.subscriptions.push(
        vscode.commands.registerCommand(ComputeChurnCommand.id, async () => {
            await new ComputeChurnCommand().execute();
        })
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
