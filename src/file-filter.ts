import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import ignore, { Ignore } from 'ignore';
import * as isbinaryfile from 'isbinaryfile';

export class FilerFilter  {

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
        if (!this.isGitRepo) {
            vscode.window.showInformationMessage("Workspace is no git repo, churncomplexityexplorer won't work");
        }
        // Load .gitignore rules from the workspace (if available)
        const gitIgnorePath = path.join(workspaceFolder, '.gitignore');
        if (fs.existsSync(gitIgnorePath)) {
            const gitIgnoreContent = fs.readFileSync(gitIgnorePath, 'utf-8');
            this.gitIgnore.add(gitIgnoreContent);
        }
    }

    isHandledByPlugin(absolutePath: string): boolean {
        if (!this.isGitRepo) {
            return false;
        }
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
    }

}