import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


export interface ForAllFilesOpts {
    fileFilter: (p: string) => boolean;
    onRegularFile: (p: string) => void;
    onFolder: (p:  string, regularChildren: Array<string>) => void;
}

export function forAllFiles(folderPathAbs: string | undefined, opts: ForAllFilesOpts): Array<string> {
    if (!folderPathAbs) {
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
        if (!workspaceFolder) {
            console.error("empty path and empty workspace path, abort");
            return [];
        }
        folderPathAbs = workspaceFolder;
    }
    const { onFolder, onRegularFile, fileFilter } = opts;
    const { childFolders, childRegularFiles } = getChildren(folderPathAbs, fileFilter);
    // process regular (=non-folder, =leaf) files
    childRegularFiles.forEach(file => onRegularFile(file));
    // recursion
    childFolders.forEach(folder => {
        const regularChildrenOfFolder = forAllFiles(folder, opts);
        // call "onFolder" after recursion step,
        // ensures "post-order" behavior
        onFolder(folder, regularChildrenOfFolder);
    });
    return childRegularFiles;
}

function getChildren(dirPath: string, fileFilter: (p: string) => boolean) {
    const childFilesAndFolders: Array<string> = fs.readdirSync(dirPath);
    const childRegularFiles: Array<string> = [];
    const childFolders: Array<string> = [];
    childFilesAndFolders.forEach(childRelative => {
        const child = path.join(dirPath, childRelative);
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
