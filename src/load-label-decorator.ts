import * as vscode from 'vscode';
import * as path from 'path';
import { LabelDecorator } from './views/label-decorator';
import { FileMetric } from './file-metrics/file-metric';
import { getWorkspaceFolder } from './get-ws-folder';

export function loadLabelDecorator(metricPersistenceFilename: string, context: vscode.ExtensionContext): LabelDecorator {
    const metric = FileMetric.fromPersistence(metricPersistenceFilename, context);
    if (!metric) {
        console.error('failed to load metric from persistence');
        return (l, _afp) => l;
    }
    const quintiles = metric.getQuintiles();
    const wsFolder = getWorkspaceFolder();
    return (label, absoluteFilePath) => {
        const relativeFilePath = path.relative(wsFolder, absoluteFilePath);
        const value = metric.getValue(relativeFilePath);
        let largestIdx = 0;
        for (let idx = 0; idx < quintiles.length; ++idx) {
            if (value > quintiles[idx]) {
                largestIdx = idx;
            }
        }
        return '🔥'.repeat(largestIdx) + label;
    };
}