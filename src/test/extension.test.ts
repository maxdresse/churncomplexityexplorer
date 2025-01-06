import * as assert from 'assert';
import path from 'path';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';
export const churnComplexityRepoPath = path.resolve(__dirname, '..', '..');

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Complexity smoke test', async () => {
		await vscode.commands.executeCommand('churncomplexityexplorer.computeLoc');
		//vscode.window.createTreeView('cc-explorer', { treeDataProvider: new CCExplorerProvider() });
		assert.strictEqual(1, 1);
	});
});
