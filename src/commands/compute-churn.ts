import * as vscode from 'vscode';

export class ComputeChurnCommand {

    static id = 'churncomplexityexplorer.computeChurn';

    async execute() {
        async () => {
            await vscode.window.withProgress(
                {
                    location: vscode.ProgressLocation.Notification,
                    title: "Computing churn...",
                    cancellable: true,
                },
                async (progress, token) => {
                    for (let i = 0; i <= 100; i++) {
                        if (token.isCancellationRequested) {
                            break;
                        }
                        progress.report({ increment: 1, message: `Progress: ${i}%` });
                        await new Promise(resolve => setTimeout(resolve, 200));
                    }
                    vscode.window.showInformationMessage("Task completed!");
                }
            );
        }
    }

}