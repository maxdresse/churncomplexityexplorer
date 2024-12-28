jest.mock('fs', () => ({ readFileSync: jest.fn(() => `
    import { abc } from 'def';

    export class A {
        constructor() {
            console.log('Hello, World!');
        }
    }
    `) })
);
import { LocCounter } from './loc-counter';
import { workspace, Uri, type WorkspaceFolder } from 'vscode';
describe('loc-counter', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("should correctly count the lines of code for a .ts file", () => {
        const filePath = 'myboguspath.ts';
        const rootUri = Uri.file('/');
        const workspaceFolder1: WorkspaceFolder = {
        uri: Uri.joinPath(rootUri, 'Folder1'),
        name: 'Folder1',
        index: 0,
        };
        const spy = jest.spyOn(workspace, 'workspaceFolders', 'get');
        spy.mockReturnValue([workspaceFolder1]);
        
        const counter = new LocCounter();
        const count = counter.getValue(filePath)
        expect(count).toBe(6);
    })
});