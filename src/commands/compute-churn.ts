import * as vscode from 'vscode';
import { AbsoluteChurnCounter } from '../file-metrics/absolute-churn-counter';
import { ComputeMetricCommand } from './compute-metric-command';

const progressTitle = "Computing project churn. ";
const msgRetrieveGitLogs = "Retrieving git logs";
const msgProcessing = "Processing results";
const msgSaving = "Saving results";
export const churnPersistenceFilename = "_churn";
export const commandIdChurn = 'churncomplexityexplorer.computeChurn';

export function getComputeChurnComand(context: vscode.ExtensionContext, onComplete: () => void) {
	return new ComputeMetricCommand(context, {
		progressTitle,
		messageIsComputing: msgRetrieveGitLogs,
		messageIsProcessing: msgProcessing,
		messageIsSaving: msgSaving,
		persistenceFileName: churnPersistenceFilename
	}, new AbsoluteChurnCounter(), onComplete);
}
