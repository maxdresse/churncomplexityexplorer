import * as vscode from 'vscode';
import { RegularFileMetric } from './regular-file-metric';
import { FilerFilter } from '../file-filter';
import { forAllFiles } from './for-all-files';
import * as path from 'path';
import { getWorkspaceFolder } from '../get-ws-folder';
import { StorageAccess } from '../persistence/storage-access';

export class FileMetric {

    /**
     * extend a file metric that applies only to regular files
     * to directories. The value of a directory is the maximum
     * of its children, recursively, child-to-parent
     * @param rfm 
     * @returns 
     */
    static extendRegularFileMetricByMax(rfm: RegularFileMetric): FileMetric {
        const workspaceFolder = getWorkspaceFolder();
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
				const getVal = (s: string) => resultObject.get(s) ?? 0;
				const maximumAmongChildren = childrenRelative.reduce((prev, current) => {
					return getVal(current) > getVal(prev) ? current : prev;
				}, childrenRelative[0]);
				resultObject.set(folderRelative, getVal(maximumAmongChildren));
			},
			onRegularFile: p => {
				const relP = path.relative(workspaceFolder, p);
				resultObject.set(relP, rfm.getValue(relP));
			}
		});
		return new FileMetric(resultObject);
    }

	static fromPersistence(basename: string, context: vscode.ExtensionContext): FileMetric | undefined {
		const sa = new StorageAccess(context);
		let fileToValue: Map<string, number> | undefined;
		try {
			const obj = sa.load(basename);
			fileToValue = obj instanceof Map ? obj as Map<string, number> : undefined;
		} catch(e) {
			console.error(e);
		}
		return fileToValue ? new FileMetric(fileToValue) : undefined;
	}

    constructor (private filePathToValue: Map<string, number>) {}

    getValue(path: string) {
        return this.filePathToValue.get(path) ?? 0;
    }

    serialize(): string {
        return JSON.stringify(Array.from(this.filePathToValue));
    }

	getExponentialQuintiles(): [number, number, number, number, number] {
		const numbers = [...this.filePathToValue.values()];
		if (numbers.length === 0) {
			const inf = Number.POSITIVE_INFINITY;
			return [inf, inf, inf, inf, inf];
		}
		const sorted = [...numbers].sort((a, b) => a - b);
		// Compute the indices for the desired percentiles
		// percentiles grow closer exponentially as they increase
		// => basically a logarithmic scale
		const percentiles = [50, 75, 87.5, 93.75, 96.875];
		const indices = percentiles.map(p => Math.floor((p / 100) * (sorted.length - 1)));
		return indices.map(i => sorted[i]) as [number, number, number, number, number];
	}

	saveToPersistence(basename: string, context: vscode.ExtensionContext) {
		const sa = new StorageAccess(context);
		sa.save(basename, this.serialize());
	}

}
