import * as assert from 'assert';
import path from 'path';

// You can import and use all API from the 'vscode' module
// as well as import your extension to test it
import * as vscode from 'vscode';
import { WorkspaceTreeProvider } from '../views/explorer';
export const churnComplexityRepoPath = path.resolve(__dirname, '..', '..');

async function getLabelForSrcFolder() {
	const provider = (global as any)._cctesting_.workspaceTreeProvider as WorkspaceTreeProvider;
	assert.notEqual(provider, undefined);		
	const children = await provider.getChildren();
	assert.notStrictEqual(children.length, 0);
	const srcFolder = children.find(child => {
		const label = child.label?.toString() ?? '';
		return label.includes('src');
	});
	assert.notEqual(srcFolder, undefined);
	return srcFolder?.label?.toString() ?? '';
}

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Complexity smoke test', async () => {
		await vscode.commands.executeCommand('churncomplexityexplorer.clearLoc');
		assert.doesNotMatch(await getLabelForSrcFolder(), /^🐘+/);
		await vscode.commands.executeCommand('churncomplexityexplorer.computeLoc');
		assert.match(await getLabelForSrcFolder(), /^🐘+/);
	});

	test.skip('Churn smoke test', async () => {
		await vscode.commands.executeCommand('churncomplexityexplorer.clearChurn');
		assert.doesNotMatch(await getLabelForSrcFolder(), /^🔥+/);
		await vscode.commands.executeCommand('churncomplexityexplorer.computeChurn');
		assert.match(await getLabelForSrcFolder(), /^🔥+/);
	});
});
