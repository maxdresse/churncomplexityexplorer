import * as vscode from 'vscode';

export function getWorkspaceFolder() {
	const wsFolders = vscode.workspace.workspaceFolders;
	if (!wsFolders) {
		throw Error("Unexpected empty workspace");
	}
	const workspaceFolder = wsFolders[0].uri.fsPath;
	return workspaceFolder;
}