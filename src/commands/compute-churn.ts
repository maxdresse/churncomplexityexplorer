import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { AbsoluteChurnCounter } from '../file-metrics/absolute-churn-counter';
import { forAllFiles } from '../file-metrics/for-all-files';
import { FilerFilter } from '../file-filter';

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
			const wsFolders = vscode.workspace.workspaceFolders;
			if (!wsFolders) {
				throw Error("Unexpected empty workspace");
			}
			const workspaceFolder = wsFolders[0].uri.fsPath
			const ff = new FilerFilter();
			const resultObject = new Map<string, number>();
			forAllFiles(workspaceFolder, {
				fileFilter: p => ff.isHandledByPlugin(p),
				onFolder: (p, folderChildren) => {
					const { childRegularFiles: cr, childFolders: cf } = folderChildren;
					const folderRelative = path.relative(workspaceFolder, p);
					const childrenRelative = [...cr, ...cf].map(c => path.relative(workspaceFolder, c));
					if (!childrenRelative.length) {
						resultObject.set(folderRelative, 0);
						return;
					}
					const maximumAmongChildren = childrenRelative.reduce((prev, current) => {
						return counter.getValue(current) > counter.getValue(prev) ? current : prev;
					}, childrenRelative[0]);
					resultObject.set(folderRelative, counter.getValue(maximumAmongChildren));
				},
				onRegularFile: p => {
					resultObject.set(p, counter.getValue(path.relative(workspaceFolder, p)));
				}
			});
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
			fs.writeFileSync(targetFile, JSON.stringify(Array.from(resultObject)), { encoding: "utf-8"} );
			
			});
			return;
    }

}