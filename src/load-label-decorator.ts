import * as vscode from 'vscode';
import * as path from 'path';
import { LabelDecorator, LabelDecoratorFactory } from './views/label-decorator';
import { FileMetric } from './file-metrics/file-metric';
import { getWorkspaceFolder } from './get-ws-folder';

export function getLabelDecoratorFactory(metricPersistenceFilename: string, decoratingChar: string, context: vscode.ExtensionContext): LabelDecoratorFactory {
    return () => {
        const metric = FileMetric.fromPersistence(metricPersistenceFilename, context);
        if (!metric) {
            // metric not yet computed or file is corrupt
            return [(l, _afp) => l] as Array<LabelDecorator>;
        }
        const quintiles = metric.getExponentialQuintiles();
        const wsFolder = getWorkspaceFolder();
        if (!wsFolder) {
            return [];
        }
        return [(label, absoluteFilePath) => {
            const relativeFilePath = path.relative(wsFolder, absoluteFilePath);
            const value = metric.getValue(relativeFilePath);
            let largestIdx = 0;
            for (let idx = 0; idx < quintiles.length; ++idx) {
                if (value > quintiles[idx]) {
                    largestIdx = idx;
                }
            }
            return decoratingChar.repeat(largestIdx) + label;
        }] as Array<LabelDecorator>;
    };
}