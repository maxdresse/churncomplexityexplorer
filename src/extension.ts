// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { WorkspaceTreeProvider } from './views/explorer';
import { ControlsWebViewProvider } from './views/controls';
import { DecoratingMetric, getAllDecoratingMetrics } from './decorating-metric';
import { combineDecoratorFactories } from './views/label-decorator';
import { AppState, MetricComputationState, MetricState } from './app-state';

function registerExplorerView(decoratingMetrics: Array<DecoratingMetric>, context: vscode.ExtensionContext) {
    const factory = combineDecoratorFactories(decoratingMetrics.map(dm => dm.labelDecoratorFactory));
    const treeProvider = new WorkspaceTreeProvider(factory);
    // Register the TreeDataProvider for the custom view
    const disposableForExp = vscode.window.registerTreeDataProvider(
        'cc-explorer',
        treeProvider
    );
    context.subscriptions.push(disposableForExp);
    return treeProvider;
}

function registerControlsView(context: vscode.ExtensionContext, appCompState: AppState) {
    const disposableForCont = vscode.window.registerWebviewViewProvider(
        'cc-controls',
        new ControlsWebViewProvider(context, appCompState)
    );
    context.subscriptions.push(disposableForCont);
}

function registerMetricCommands(decoratingMetrics: Array<DecoratingMetric>, appCompState: AppState, context: vscode.ExtensionContext, treeProvider: WorkspaceTreeProvider) {
    decoratingMetrics.forEach(({ computationCommandIdToFactory: commandIdToFactory, id, isDataPresent }) => {
        Object.entries(commandIdToFactory).forEach(([commandId, factory]) => {
            const updateState = (computation: MetricComputationState) => {
                const ms: MetricState = { isDataPresent: isDataPresent(), computation };
                appCompState.updateMetricState(id, ms);
            };
            // first state init
            updateState(MetricComputationState.IDLE);
            context.subscriptions.push(
                vscode.commands.registerCommand(commandId, async () => {

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

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    const decoratingMetrics =  getAllDecoratingMetrics(context);
    // register tree view
    const treeProvider = registerExplorerView(decoratingMetrics, context);
    (global as any)._cctesting_ = { workspaceTreeProvider: treeProvider };
    
    const appCompState = new AppState();
    // register the controls webview
    registerControlsView(context, appCompState);
    // register the commands for the metrics
    registerMetricCommands(decoratingMetrics, appCompState, context, treeProvider);
}

// This method is called when your extension is deactivated
export function deactivate() {}
