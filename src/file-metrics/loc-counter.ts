import * as path from 'path';
import * as fs from 'fs';
import sloc from 'sloc';
import { RegularFileMetric } from './regular-file-metric';
import { getWorkspaceFolder } from '../get-ws-folder';

function getFileExtension(filename: string) {
    const ext = path.extname(filename);
    return ext.startsWith('.') ? ext.slice(1) : ext;
}

export class LocCounter implements RegularFileMetric {
    
    wsFolder: string;

    constructor() {
        this.wsFolder = getWorkspaceFolder();
    }        

    getValue(relativePath: string) {
        const absPath = path.resolve(this.wsFolder, relativePath);
        const code = fs.readFileSync(absPath, { encoding: 'utf-8' });
        
        const loc = sloc(code, getFileExtension(relativePath));
        return loc?.source ?? 0
    }
    
}
