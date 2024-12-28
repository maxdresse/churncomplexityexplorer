import { workspace, Uri, type WorkspaceFolder } from 'vscode';

export function mockVsWorkspaceFolder() {
    const rootUri = Uri.file('/');
    const workspaceFolder1: WorkspaceFolder = {
    uri: Uri.joinPath(rootUri, 'Folder1'),
    name: 'Folder1',
    index: 0,
    };
    const spy = jest.spyOn(workspace, 'workspaceFolders', 'get');
    spy.mockReturnValue([workspaceFolder1]);
}
