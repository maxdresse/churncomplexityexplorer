import * as vscode from 'vscode';
import { ComputeMetricCommand } from './compute-metric-command';
import { LocCounter } from '../file-metrics/loc-counter';

const progressTitle = "Computing lines of code. ";
const msgRetrieveGitLogs = "Retrieving loc data";
const msgProcessing = "Processing results";
const msgSaving = "Saving results";
export const locPersistenceFilename = "_loc";
export const commandIdLoc = 'churncomplexityexplorer.computeLoc';

export function getComputeLocComand(context: vscode.ExtensionContext, onComplete: () => void) {
	return new ComputeMetricCommand(context, {
		progressTitle,
		messageIsComputing: msgRetrieveGitLogs,
		messageIsProcessing: msgProcessing,
		messageIsSaving: msgSaving,
		persistenceFileName: locPersistenceFilename
	}, new LocCounter(), onComplete);
}
