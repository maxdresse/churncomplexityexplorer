import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import { FilerFilter } from '../file-filter';
import { LabelDecorator, LabelDecoratorFactory } from './label-decorator';

export class WorkspaceTreeProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | void> = new vscode.EventEmitter();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private fileFilter = new FilerFilter();
    private labelDecorators: Array<LabelDecorator> = [];

    constructor(private labelDecoratorFactory: LabelDecoratorFactory) {
        this.updateLabelDecorators();
    }

    // Refresh the tree view
    refresh(): void {
        this.updateLabelDecorators();
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: TreeItem): vscode.TreeItem {
        return element;
    }

    getChildren(element?: TreeItem): Thenable<TreeItem[]> {
        if (!vscode.workspace.workspaceFolders) {
            vscode.window.showInformationMessage('No workspace open');
            return Promise.resolve([]);
        }

        const workspaceFolder = vscode.workspace.workspaceFolders[0].uri.fsPath;

        if (!element) {
            // Root level: return the workspace folder's contents
            return Promise.resolve(this.getFilesAndDirectories(workspaceFolder));
        } else {
            // Return the contents of the clicked directory
            return Promise.resolve(this.getFilesAndDirectories(element.resourceUri.fsPath));
        }
    }

    private updateLabelDecorators() {
        this.labelDecorators = this.labelDecoratorFactory();
    }

    private getFilesAndDirectories(folderPath: string): TreeItem[] {
        const baseNames = fs.readdirSync(folderPath);

        // Map items to TreeItems
        const treeItems = baseNames
            .map(name => {
                const fullPath = path.join(folderPath, name);
                const isDirectory = fs.statSync(fullPath).isDirectory();
                // apply decorators
                this.labelDecorators.forEach(d => name = d(name, fullPath));
                return new TreeItem(
                    name,
                    isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                    vscode.Uri.file(fullPath)
                );
            })
            .filter(item => {
                const absolutePath = item.resourceUri.fsPath;
                return this.fileFilter.isHandledByPlugin(absolutePath);
            });

        // Sort: Folders first, then files (alphabetically within each group)
        treeItems.sort((a, b) => {
            const aIsDir = a.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed;
            const bIsDir = b.collapsibleState === vscode.TreeItemCollapsibleState.Collapsed;

            if (aIsDir && !bIsDir) {
                return -1; // Folders come first
            } else if (!aIsDir && bIsDir) {
                return 1; // Files come later
            } else {
                const aS = typeof a.label === 'string' ? a.label : a.label?.label;
                const bS = typeof b.label === 'string' ? b.label : b.label?.label;
                return (aS ?? '').localeCompare(bS ?? ''); // Alphabetical order within group
            }
        });

        return treeItems;
    }
}

class TreeItem extends vscode.TreeItem {
    constructor(
        label: string,
        collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly resourceUri: vscode.Uri
    ) {
        super(label, collapsibleState);
        this.tooltip = this.resourceUri.fsPath;
        this.description = ''; // unused description
        this.resourceUri = resourceUri;
        // this.iconPath = vscode.ThemeIcon.Folder;

        if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
            this.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [this.resourceUri],
            };
        }
    }
}
