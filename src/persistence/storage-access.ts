import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class StorageAccess {

    constructor(private context: vscode.ExtensionContext) {
        const storageUri = this.context.storageUri;
        if (storageUri === undefined) {
            vscode.window.showErrorMessage('Unexpected empty storage uri, abort');
            return;
        }
        this.storageUriPath = storageUri.path;
    }

    private storageUriPath = '';

    save(basename: string, payload: string): void {
        this.ensureStorageDirExists();
        const targetFile = this.getFilename(basename);
        try {
            fs.writeFileSync(targetFile, payload, { encoding: 'utf-8'} );
        } catch (e) {
            vscode.window.showErrorMessage('Could not write to storage');
        }
    }

    load(basename: string): object {
        let result = [];
        try {
            const payload = fs.readFileSync(this.getFilename(basename), { encoding: 'utf-8' });
            result = JSON.parse(payload);
        } catch(e) {
            vscode.window.showErrorMessage('Could not load from storage');
        }
        return result;
    }

    private ensureStorageDirExists() {
        if (!fs.existsSync(this.storageUriPath)) {
            fs.mkdirSync(this.storageUriPath);
        }
    }

    private getFilename(basename: string) {
        return path.resolve(this.storageUriPath, basename);
    }

}