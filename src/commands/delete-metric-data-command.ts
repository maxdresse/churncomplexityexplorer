import * as vscode from 'vscode';
import { StorageAccess } from '../persistence/storage-access';

export class DeleteMetricDataCommand {

	constructor(private persistenceFileBasename: string,
				private context: vscode.ExtensionContext,
		        private onComplete: () => void) {}

    async execute() {
        await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Deleting metrics data",
			cancellable: false
		}, async (progress) => {
			progress.report({ increment: 0, message: 'begin deletion' });
            const sa = new StorageAccess(this.context);
            sa.delete(this.persistenceFileBasename);
			progress.report({ increment: 100, message: "done" });			
			this.onComplete();
			});
    }
}
