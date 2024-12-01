import * as vscode from 'vscode';
import * as path from 'path';
import { AbsoluteChurnCounter } from '../file-metrics/absolute-churn-counter';
import { forAllFiles } from '../file-metrics/for-all-files';
import { FilerFilter } from '../file-filter';

export class ComputeChurnCommand {

    static id = 'churncomplexityexplorer.computeChurn';

	constructor(private context: vscode.ExtensionContext) {}

    async execute() {
        await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Computing project churn!",
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("User canceled the long running operation");
			});
			progress.report({ increment: 0, message: "Retrieving git logs" });
			const counter = new AbsoluteChurnCounter();
			await counter.init();
			progress.report({ increment: 50, message: "Saving results" });
			const wsFolders = vscode.workspace.workspaceFolders;
			if (!wsFolders) {
				throw Error("Unexpected empty workspace");
			}
			const workspaceFolder = wsFolders[0].uri.fsPath
			const ff = new FilerFilter();
			const resultObject: Record<string, number> = {};
			forAllFiles(workspaceFolder, { 
				fileFilter: p => ff.isHandledByPlugin(p),
				onFolder: p => {
					//
				},
				onRegularFile: p => {
					// just smoke test
					resultObject[p] = counter.getValue(p) ?? 0;
				}
			});
			// use context to save to storage uri
			
			});
			return;
    }

}