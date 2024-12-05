import * as vscode from 'vscode';
import { AbsoluteChurnCounter } from '../file-metrics/absolute-churn-counter';
import { FileMetric } from '../file-metrics/file-metric';

const progressTitle = "Computing project churn. ";
const msgRetrieveGitLogs = "Retrieving git logs";
const msgProcessing = "Processing results";
const msgSaving = "Saving results";

export const churnPersistenceFilename = "_churn";

export class ComputeChurnCommand {

    static id = 'churncomplexityexplorer.computeChurn';

	constructor(private context: vscode.ExtensionContext,
		        private onComplete: () => void) {}

    async execute() {
        await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: progressTitle,
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("User canceled the computation");
			});
			progress.report({ increment: 0, message: msgRetrieveGitLogs });
			const counter = new AbsoluteChurnCounter();
			await counter.init();
			progress.report({ increment: 50, message: msgProcessing });
			const metric = FileMetric.extendRegularFileMetricByMax(counter);
			progress.report({ increment: 80, message: msgSaving });
			
			metric.saveToPersistence(churnPersistenceFilename, this.context);
			this.onComplete();
			});
    }

}