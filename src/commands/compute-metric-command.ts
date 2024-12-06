import * as vscode from 'vscode';
import { FileMetric } from '../file-metrics/file-metric';
import { RegularFileMetric } from '../file-metrics/regular-file-metric';

export interface CommandConfig {
    progressTitle: string;
    messageIsComputing: string;
    messageIsProcessing: string;
    messageIsSaving: string;
    persistenceFileName: string;
}

export class ComputeMetricCommand {

	constructor(private context: vscode.ExtensionContext,
                private config: CommandConfig,
                private regularFileMetric: RegularFileMetric,
		        private onComplete: () => void) {}

    async execute() {
        const { 
            progressTitle, 
            messageIsComputing,
            messageIsProcessing, 
            messageIsSaving,
            persistenceFileName } = this.config;
        await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: progressTitle,
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("User canceled the computation");
			});
			progress.report({ increment: 0, message: messageIsComputing });
			if (typeof this.regularFileMetric.init === 'function') {
                await this.regularFileMetric.init();
            }
			progress.report({ increment: 50, message: messageIsProcessing });
			const metric = FileMetric.extendRegularFileMetricByMax(this.regularFileMetric);
			progress.report({ increment: 80, message: messageIsSaving });
			
			metric.saveToPersistence(persistenceFileName, this.context);
			this.onComplete();
			});
    }

}