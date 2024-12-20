import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import simpleGit, { SimpleGit } from 'simple-git';
import { execRawGitCommand } from '../git';
import { FilerFilter } from '../file-filter';
import { RegularFileMetric } from './regular-file-metric';

// git log --all --find-renames --find-copies --name-only --format=format: --since="2 years ago" --until=HEAD LICENSE
const since = "2 years ago";

const maxGitTimeout = 30000;
const maxGitConcurrentProcesses = 5;
export class AbsoluteChurnCounter implements RegularFileMetric {
    
    private fileToChurn?: Map<string, number>;
    private git: SimpleGit;
    private wsFolders: typeof vscode.workspace.workspaceFolders;

    constructor() {
        this.wsFolders = vscode.workspace.workspaceFolders;
        if (!this.wsFolders) {
            throw Error('workspace root not found');
        }
        this.git = simpleGit({
            baseDir: this.wsFolders[0].uri.fsPath,
            maxConcurrentProcesses: maxGitConcurrentProcesses,
            timeout: { block: maxGitTimeout },
          });
    }        

    getValue(relativePath: string) {
        return this.getChurn(relativePath) ?? 0;
    }

    // adapted from 
    // https://github.com/CarlosBonetti/vscode-uplift-code/blob/d69fe5147519ba02d492bf60bf22e76093111966/src/metrics/git/churn.ts
    async init() {
        const rawLines = await execRawGitCommand(this.git, [
            "log",
            "--all",
            "--find-renames",
            "--find-copies",
            "--name-only",
            "--format=format:",
            `--since=${since}`,
            "--until=HEAD"
          ]);
          const fileFilter = new FilerFilter();
          this.fileToChurn = rawLines.map(p => {
              // assemble path
              const basePath = this.wsFolders![0].uri.fsPath;
              const absPath = path.resolve(basePath, p);
              return absPath; })
          .filter(absPath => {
              // filter out non-existent paths
              if (!fs.existsSync(absPath)) {
                return false;
              }
            return fileFilter.isHandledByPlugin(absPath);
            })
            .reduce((map, fileName) => {
                const basePath = this.wsFolders![0].uri.fsPath;
                const relPath = path.relative(basePath, fileName);
                map.set(relPath, (map.get(relPath) ?? 0) + 1);
            return map;
          }, new Map<string, number>());
    }

    private getChurn(path: string): number | undefined {
        if (!this.fileToChurn) {
            throw Error("unitialized, did you call and await init?");
        }
        return this.fileToChurn.get(path);
    }
    
}
