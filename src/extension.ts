// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { WorkspaceTreeProvider } from './views/explorer';
import { ControlsWebViewProvider } from './views/controls';
import { churnPersistenceFilename, commandIdChurn, getComputeChurnComand } from './commands/compute-churn';
import { getLabelDecoratorFactory } from './load-label-decorator';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    const factory = getLabelDecoratorFactory(churnPersistenceFilename, '🔥', context);
    const treeProvider = new WorkspaceTreeProvider(factory);
    // Register the TreeDataProvider for the custom view
    const disposableForExp = vscode.window.registerTreeDataProvider(
        'cc-explorer', 
        treeProvider
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
        vscode.commands.registerCommand(commandIdChurn, async () => {
            await getComputeChurnComand(context, () => treeProvider.refresh()).execute();
        })
    );
}

// This method is called when your extension is deactivated
export function deactivate() {}
