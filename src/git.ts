// taken from
// https://github.com/CarlosBonetti/vscode-uplift-code/blob/d69fe5147519ba02d492bf60bf22e76093111966/src/git.ts

import { SimpleGit } from "simple-git";

export async function execRawGitCommand(
  git: SimpleGit,
  commands: string[]
): Promise<string[]> {
  const result = await git.raw(commands);
  return extractResultLines(result);
}

function extractResultLines(result: string): string[] {
  return result
    .split(/\r\n|\r|\n/) // split by new lines
    .map((line) => line.trim()) // trim empty spaces / empty lines
    .filter((line) => !!line); // return only lines with actual content
}