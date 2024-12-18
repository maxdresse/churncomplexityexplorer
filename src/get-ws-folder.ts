import * as vscode from 'vscode';

export function getWorkspaceFolder(): string | undefined {
	const wsFolders = vscode.workspace.workspaceFolders;
	if (!wsFolders) {
		return undefined;
	}
	const workspaceFolder = wsFolders[0].uri.fsPath;
	return workspaceFolder;
}