import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class WorkspaceTreeProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | void> = new vscode.EventEmitter();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    // Refresh the tree view (optional)
    refresh(): void {
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

    private getFilesAndDirectories(folderPath: string): TreeItem[] {
        const items = fs.readdirSync(folderPath);
        return items.map(item => {
            const fullPath = path.join(folderPath, item);
            const isDirectory = fs.statSync(fullPath).isDirectory();

            return new TreeItem(
                item,
                isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                vscode.Uri.file(fullPath)
            );
        });
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
        this.description = path.basename(this.resourceUri.fsPath);
        this.resourceUri = resourceUri;

        if (collapsibleState === vscode.TreeItemCollapsibleState.None) {
            this.command = {
                command: 'vscode.open',
                title: 'Open File',
                arguments: [this.resourceUri],
            };
        }
    }
}
