// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { WorkspaceTreeProvider } from './views/explorer';
import { ControlsWebViewProvider } from './views/controls';
import { getAllDecoratingMetrics } from './decorating-metric';
import { combineDecoratorFactories } from './views/label-decorator';
import { AppState, MetricComputationState, MetricState } from './app-state';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const decoratingMetrics =  getAllDecoratingMetrics(context);
    const factory = combineDecoratorFactories(decoratingMetrics.map(dm => dm.labelDecoratorFactory));
    const treeProvider = new WorkspaceTreeProvider(factory);
    // Register the TreeDataProvider for the custom view
    const disposableForExp = vscode.window.registerTreeDataProvider(
        'cc-explorer', 
        treeProvider
    );
    context.subscriptions.push(disposableForExp);
    const appCompState = new AppState();
    // register the controls webview
    const disposableForCont = vscode.window.registerWebviewViewProvider(
        'cc-controls',
        new ControlsWebViewProvider(context, appCompState)
    );
    context.subscriptions.push(disposableForCont);
    // register the commands for the metrics
    decoratingMetrics.forEach(({ computationCommandIdToFactory: commandIdToFactory, id, isDataPresent }) => {
        Object.entries(commandIdToFactory).forEach(([commandId, factory]) => {
            context.subscriptions.push(
                vscode.commands.registerCommand(commandId, async () => {
                    const updateState = (computation: MetricComputationState) => {
                        const ms: MetricState = { isDataPresent: isDataPresent(),  computation };
                        appCompState.updateMetricState(id, ms);
                    };
                    // update state before ...
                    updateState(MetricComputationState.RUNNING);
                    await factory(() => treeProvider.refresh()).execute();
                    // ... and after command execution
                    updateState(MetricComputationState.IDLE);
                })
            );
        });
    });
}

// This method is called when your extension is deactivated
export function deactivate() {}
