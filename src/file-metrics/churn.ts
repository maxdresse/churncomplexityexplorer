import { SimpleGit } from 'simple-git';
import { execRawGitCommand } from '../git';

// git log --all --find-renames --find-copies --name-only --format=format: --since="2 years ago" --until=HEAD LICENSE
const since = "2 years ago";

export class AbsoluteChurnCounter {
    // adapted from 
    // https://github.com/CarlosBonetti/vscode-uplift-code/blob/d69fe5147519ba02d492bf60bf22e76093111966/src/metrics/git/churn.ts
    async init(git: SimpleGit) {
        const result = await execRawGitCommand(git, [
            "log",
            "--all",
            "--find-renames",
            "--find-copies",
            "--name-only",
            "--format=format:",
            `--since=${since}`,
            "--until=HEAD"
          ]);
    }
    
}
