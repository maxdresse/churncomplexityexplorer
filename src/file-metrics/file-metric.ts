import * as vscode from 'vscode';
import { RegularFileMetric } from './regular-file-metric';
import { FilerFilter } from '../file-filter';
import { forAllFiles } from './for-all-files';
import * as path from 'path';

export class FileMetric {

    /**
     * extend a file metric that applies only to regular files
     * to directories. The value of a directory is the maximum
     * of its children, recursively, child-to-parent
     * @param rfm 
     * @returns 
     */
    static extendRegularFileMetricByMax(rfm: RegularFileMetric): FileMetric {
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
						return rfm.getValue(current) > rfm.getValue(prev) ? current : prev;
					}, childrenRelative[0]);
					resultObject.set(folderRelative, rfm.getValue(maximumAmongChildren));
				},
				onRegularFile: p => {
					resultObject.set(p, rfm.getValue(path.relative(workspaceFolder, p)));
				}
			});
            return new FileMetric(resultObject);
    }

    constructor (private filePathToValue: Map<string, number>) {}

    getValue(path: string) {
        return this.filePathToValue.get(path);
    }

    serialize(): string {
        return JSON.stringify(Array.from(this.filePathToValue));
    }

}