import * as vscode from 'vscode';
import * as fs from 'fs';

export interface ForAllFilesOpts {
    fileFilter: (p: string) => boolean;
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
    const { onFolder, onRegularFile, fileFilter } = opts;
    const { childFolders, childRegularFiles } = getChildren(folderPath, fileFilter);
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

function getChildren(path: string, fileFilter: (p: string) => boolean) {
    const childFilesAndFolders: Array<string> = fs.readdirSync(path);
    const childRegularFiles: Array<string> = [];
    const childFolders: Array<string> = [];
    childFilesAndFolders.forEach(child => {
        if (!fileFilter(child)) {
            return;
        }
        if (fs.statSync(child).isDirectory()) {
            childFolders.push(child);
        } else {
            childRegularFiles.push(child);
        }
    });
    return { childFolders, childRegularFiles };
}
