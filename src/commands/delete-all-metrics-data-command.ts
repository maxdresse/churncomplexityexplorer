import * as vscode from 'vscode';
import { StorageAccess } from '../persistence/storage-access';

export class DeleteAllMetricsDataCommand {

	constructor(private context: vscode.ExtensionContext,
		        private onComplete: () => void) {}

    async execute(persistenceFileBasenames: Array<string>) {
        await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Deleting all metrics data",
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0, message: 'begin deletion' });
            const sa = new StorageAccess(this.context);
            persistenceFileBasenames.forEach(bn => sa.delete(bn));
			progress.report({ increment: 100, message: "done" });			
			this.onComplete();
			});
    }

}