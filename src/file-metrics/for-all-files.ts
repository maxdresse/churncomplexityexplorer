import * as vscode from 'vscode';
import * as fs from 'fs';

export function forAllFilesPostOrder(folderPath: string | undefined, fileFct: (p: string) => void) {
    if (!folderPath) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            console.error("empty path and empty workspace path, abort");
            return;
        }
        folderPath = workspaceFolder;
    }
    const { childFolders, childFiles } = getChildren(folderPath);
    // recursion
    childFolders.forEach(folder => {
        forAllFilesPostOrder(folder, fileFct);
    });
    // then, call function for files (post order)
    childFiles.forEach(file => fileFct(file));
}

function getChildren(path: string) {
    const childFilesAndFolders: Array<string> = fs.readdirSync(path);
    const childFiles: Array<string> = [];
    const childFolders: Array<string> = [];
    childFilesAndFolders.forEach(child => {
        if (fs.statSync(child).isDirectory()) {
            childFolders.push(child);
        } else {
            childFiles.push(child);
        }
    });
    return { childFolders, childFiles };
}
