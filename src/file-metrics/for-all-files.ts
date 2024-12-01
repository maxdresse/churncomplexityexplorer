import * as vscode from 'vscode';
import * as fs from 'fs';

export interface ForAllFilesOpts {
    onRegularFile: (p: string) => void;
    onFolder: (p:  string) => void;
}

export function forAllFiles(folderPath: string | undefined, opts: ForAllFilesOpts) {
    if (!folderPath) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            console.error("empty path and empty workspace path, abort");
            return;
        }
        folderPath = workspaceFolder;
    }
    const { childFolders, childRegularFiles } = getChildren(folderPath);
    const { onFolder, onRegularFile } = opts;
    // process regular (=non-folder, =leaf) files
    childRegularFiles.forEach(file => onRegularFile(file));
    // recursion
    childFolders.forEach(folder => {
        forAllFiles(folder, opts);
        // call "onFolder" after recursion step,
        // ensures "post-order" behavior
        onFolder(folder);
    });
}

function getChildren(path: string) {
    const childFilesAndFolders: Array<string> = fs.readdirSync(path);
    const childRegularFiles: Array<string> = [];
    const childFolders: Array<string> = [];
    childFilesAndFolders.forEach(child => {
        if (fs.statSync(child).isDirectory()) {
            childFolders.push(child);
        } else {
            childRegularFiles.push(child);
        }
    });
    return { childFolders, childRegularFiles };
}
