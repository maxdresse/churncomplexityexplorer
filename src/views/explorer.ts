import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import ignore, { Ignore } from 'ignore';
import * as isbinaryfile from 'isbinaryfile';

export class WorkspaceTreeProvider implements vscode.TreeDataProvider<TreeItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<TreeItem | undefined | void> = new vscode.EventEmitter();
    readonly onDidChangeTreeData: vscode.Event<TreeItem | undefined | void> = this._onDidChangeTreeData.event;

    private gitIgnore: Ignore;
    private isGitRepo = false;

    constructor() {
        // Initialize gitIgnore parser
        this.gitIgnore = ignore();
        // add .git folder itself
        this.gitIgnore.add('.git');

        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            return;
        }
        const gitFolder = path.join(workspaceFolder, '.git');
        this.isGitRepo = fs.existsSync(gitFolder);

        // Load .gitignore rules from the workspace (if available)
        const gitIgnorePath = path.join(workspaceFolder, '.gitignore');
        if (fs.existsSync(gitIgnorePath)) {
            const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
            this.gitIgnore.add(gitIgnoreContent);
        }
    }

    // Refresh the tree view
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
        if (!this.isGitRepo) {
            vscode.window.showInformationMessage('Workspace is no git repo');
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

        // Map items to TreeItems
        const treeItems = items
            .map(item => {
                const fullPath = path.join(folderPath, item);
                const isDirectory = fs.statSync(fullPath).isDirectory();

                return new TreeItem(
                    item,
                    isDirectory ? vscode.TreeItemCollapsibleState.Collapsed : vscode.TreeItemCollapsibleState.None,
                    vscode.Uri.file(fullPath)
                );
            })
            .filter(item => {
                const absolutePath = item.resourceUri.fsPath;
                const isDirectory = fs.statSync(absolutePath).isDirectory();
                // Exclude binary files
                const isBinaryFile = !isDirectory && isbinaryfile.isBinaryFileSync(absolutePath);
                if (isBinaryFile) {
                    return false;
                }
                // Exclude files/directories ignored by Git
                const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath ?? '';
                const relativePath = path.relative(workspaceFolder, absolutePath);
                return !this.gitIgnore.ignores(relativePath);
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
