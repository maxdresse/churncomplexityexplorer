import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';

export class StorageAccess {

    constructor(private context: vscode.ExtensionContext) {
        const storageUri = this.context.storageUri;
        if (storageUri === undefined) {
            return;
        }
        this.storageUriPath = storageUri.fsPath;
    }

    private storageUriPath = '';

    save(basename: string, payload: string): void {
        this.ensureStorageDirExists();
        const targetFile = this.getFilename(basename);
        if (!targetFile) {
            return;
        }
        try {
            fs.writeFileSync(targetFile, payload, { encoding: 'utf-8'} );
        } catch (e) {
            vscode.window.showErrorMessage('Could not write to storage');
        }
    }

    load(basename: string): object | undefined {
        let result = undefined;
        try {
            const filename = this.getFilename(basename);
            if (!filename) {
                return undefined;
            }
            const payload = fs.readFileSync(filename, { encoding: 'utf-8' });
            const entriesArray = JSON.parse(payload);
            result = new Map<string, number>(entriesArray);
        } catch(e) {
            vscode.window.showErrorMessage('Could not load from storage');
            return undefined;
        }
        return result;
    }

    exists(basename: string): boolean {
        const filename = this.getFilename(basename);
        if (!filename) {
            return false;
        }
        return fs.existsSync(filename);
    }

    delete(basename: string): void {
        const filename = this.getFilename(basename);
        if (filename && this.exists(basename)) {
            fs.unlinkSync(filename);
        }
    }

    private ensureStorageDirExists() {
        if (!fs.existsSync(this.storageUriPath)) {
            fs.mkdirSync(this.storageUriPath);
        }
    }

    private getFilename(basename: string) {
        if (!this.storageUriPath) {
            return null;
        }
        return path.resolve(this.storageUriPath, basename);
    }

}