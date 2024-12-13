import * as vscode from 'vscode';
import { churnPersistenceFilename, commandIdChurn, commandIdClearChurn, getClearChurnCommand, getComputeChurnComand } from './commands/compute-churn';
import { LabelDecoratorFactory } from './views/label-decorator';
import { getLabelDecoratorFactory } from './load-label-decorator';
import { commandIdClearLoc, commandIdLoc, getClearLocCommand, getComputeLocComand, locPersistenceFilename } from './commands/compute-loc';

export interface DecoratingMetric {
    id: string;
    commandIdToFactory: Record<string, (onComplete:() => void) => { execute(): Promise<void> }>;
    labelDecoratorFactory: LabelDecoratorFactory;
}

export function getAllDecoratingMetrics(context: vscode.ExtensionContext): Array<DecoratingMetric> {
    return [
        // churn
        {
            id: "churn",
            commandIdToFactory: {
                [commandIdChurn]: (onComplete) =>  getComputeChurnComand(context, onComplete),
                [commandIdClearChurn]: (onComplete) => getClearChurnCommand(context, onComplete)
            },
            labelDecoratorFactory: getLabelDecoratorFactory(churnPersistenceFilename, '🔥', context)
        },
        // loc (=complexity)
        {
            id: "loc",
            commandIdToFactory: {
                [commandIdLoc]: (onComplete) =>  getComputeLocComand(context, onComplete),
                [commandIdClearLoc]: (onComplete) => getClearLocCommand(context, onComplete)
            },
            labelDecoratorFactory: getLabelDecoratorFactory(locPersistenceFilename, '🐘', context)
        }
    ];
}