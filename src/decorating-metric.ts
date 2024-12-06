import * as vscode from 'vscode';

import { churnPersistenceFilename, commandIdChurn, getComputeChurnComand } from './commands/compute-churn';
import { ComputeMetricCommand } from './commands/compute-metric-command';
import { LabelDecoratorFactory } from './views/label-decorator';
import { getLabelDecoratorFactory } from './load-label-decorator';

export interface DecoratingMetric {
    commandId: string;
    commandFactory: (onComplete:() => void) => ComputeMetricCommand;
    labelDecoratorFactory: LabelDecoratorFactory;
}

export function getAllDecoratingMetrics(context: vscode.ExtensionContext): Array<DecoratingMetric> {
    return [
        {
            commandId: commandIdChurn,
            commandFactory: (onComplete) => getComputeChurnComand(context, onComplete),
            labelDecoratorFactory: getLabelDecoratorFactory(churnPersistenceFilename, '🔥', context)
        }
    ];
}