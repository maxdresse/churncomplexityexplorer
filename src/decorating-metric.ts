import * as vscode from 'vscode';
import { churnPersistenceFilename, commandIdChurn, commandIdClearChurn, getClearChurnCommand, getComputeChurnComand } from './commands/compute-churn';
import { LabelDecoratorFactory } from './views/label-decorator';
import { getLabelDecoratorFactory } from './load-label-decorator';
import { commandIdClearLoc, commandIdLoc, getClearLocCommand, getComputeLocComand, locPersistenceFilename } from './commands/compute-loc';
import { StorageAccess } from './persistence/storage-access';

export interface DecoratingMetric {
    id: string;
    isDataPresent: () => boolean;
    computationCommandIdToFactory: Record<string, (onComplete:() => void) => { execute(): Promise<void> }>;
    labelDecoratorFactory: LabelDecoratorFactory;
}

export function getAllDecoratingMetrics(context: vscode.ExtensionContext): Array<DecoratingMetric> {
    return [
        // churn
        {
            id: "churn",
            computationCommandIdToFactory: {
                [commandIdChurn]: (onComplete) =>  getComputeChurnComand(context, onComplete),
                [commandIdClearChurn]: (onComplete) => getClearChurnCommand(context, onComplete)
            },
            labelDecoratorFactory: getLabelDecoratorFactory(churnPersistenceFilename, '🔥', context),
            isDataPresent: () => new StorageAccess(context).exists(churnPersistenceFilename)
        },
        // loc (=complexity)
        {
            id: "loc",
            computationCommandIdToFactory: {
                [commandIdLoc]: (onComplete) =>  getComputeLocComand(context, onComplete),
                [commandIdClearLoc]: (onComplete) => getClearLocCommand(context, onComplete)
            },
            labelDecoratorFactory: getLabelDecoratorFactory(locPersistenceFilename, '🐘', context),
            isDataPresent: () => new StorageAccess(context).exists(locPersistenceFilename)
        }
    ];
}