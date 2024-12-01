import { SimpleGit } from 'simple-git';
import { execRawGitCommand } from '../git';
import { FilerFilter } from '../file-filter';
import { FileMetric } from './file-metric';

// git log --all --find-renames --find-copies --name-only --format=format: --since="2 years ago" --until=HEAD LICENSE
const since = "2 years ago";

export class AbsoluteChurnCounter implements FileMetric {
    
    private fileToChurn?: Map<string, number>;

    getValue(path: string) {
        return this.getChurn(path);
    }

    // adapted from 
    // https://github.com/CarlosBonetti/vscode-uplift-code/blob/d69fe5147519ba02d492bf60bf22e76093111966/src/metrics/git/churn.ts
    async init(git: SimpleGit) {
        const rawLines = await execRawGitCommand(git, [
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
          this.fileToChurn = rawLines.filter(p => fileFilter.isHandledByPlugin(p))
            .reduce((map, fileName) => {
            map.set(fileName, (map.get(fileName) ?? 0) + 1);
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
