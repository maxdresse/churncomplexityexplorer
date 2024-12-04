import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AbsoluteChurnCounter } from '../file-metrics/absolute-churn-counter';
import { FileMetric } from '../file-metrics/file-metric';

export class ComputeChurnCommand {

    static id = 'churncomplexityexplorer.computeChurn';

	constructor(private context: vscode.ExtensionContext) {}

    async execute() {
        await vscode.window.withProgress({
			location: vscode.ProgressLocation.Notification,
			title: "Computing project churn. ",
			cancellable: true
		}, async (progress, token) => {
			token.onCancellationRequested(() => {
				console.log("User canceled the long running operation");
			});
			progress.report({ increment: 0, message: "Retrieving git logs" });
			const counter = new AbsoluteChurnCounter();
			await counter.init();
			progress.report({ increment: 50, message: "Processing results" });
			const metric = FileMetric.extendRegularFileMetricByMax(counter);
			progress.report({ increment: 80, message: "Saving results" });
			// use context to save to storage uri
			const storageUri = this.context.storageUri;
			if (storageUri === undefined) {
				vscode.window.showErrorMessage("unexpected empty storage uri, abort");
				return
			}
			const storageUriPath = storageUri.path;
			if (!fs.existsSync(storageUriPath)) {
				fs.mkdirSync(storageUriPath);
			}
			const targetFile = path.resolve(storageUriPath, "testdata.json");
			fs.writeFileSync(targetFile, metric.serialize(), { encoding: "utf-8"} );
			});
    }

}