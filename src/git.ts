import { execFile, spawn } from "node:child_process";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

export class GitError extends Error {}

/** Run git without a shell (no injection) and return trimmed stdout. */
export async function git(...args: string[]): Promise<string> {
  try {
    const { stdout } = await execFileAsync("git", args, { maxBuffer: 16 * 1024 * 1024 });
    return stdout.trimEnd();
  } catch (err) {
    const e = err as { stderr?: string; message: string };
    throw new GitError((e.stderr || e.message).trim());
  }
}

/** Hand the terminal to git for anything zen doesn't restyle. */
export function passthrough(args: string[]): Promise<number> {
  return new Promise((resolve) => {
    spawn("git", args, { stdio: "inherit" }).on("close", (code) => resolve(code ?? 1));
  });
}

export async function isRepo(): Promise<boolean> {
  try {
    return (await git("rev-parse", "--is-inside-work-tree")) === "true";
  } catch {
    return false;
  }
}

export interface FileStatus {
  path: string;
  index: string;
  worktree: string;
}

export interface Status {
  branch: string;
  upstream?: string;
  ahead: number;
  behind: number;
  files: FileStatus[];
}

export async function status(): Promise<Status> {
  const out = await git("status", "--porcelain=v2", "--branch", "--untracked-files=all");
  const s: Status = { branch: "(detached)", ahead: 0, behind: 0, files: [] };
  for (const line of out.split("\n")) {
    if (line.startsWith("# branch.head ")) s.branch = line.slice(14);
    else if (line.startsWith("# branch.upstream ")) s.upstream = line.slice(18);
    else if (line.startsWith("# branch.ab ")) {
      const [a, b] = line.slice(12).split(" ");
      s.ahead = Math.abs(Number(a));
      s.behind = Math.abs(Number(b));
    } else if (line.startsWith("1 ") || line.startsWith("2 ")) {
      const parts = line.split(" ");
      const xy = parts[1];
      // v2 format: path is the 9th field (ordinary) or 10th, tab-separated from the original (rename)
      const rest = parts.slice(line.startsWith("1 ") ? 8 : 9).join(" ");
      s.files.push({ index: xy[0], worktree: xy[1], path: rest.split("\t")[0] });
    } else if (line.startsWith("? ")) {
      s.files.push({ index: "?", worktree: "?", path: line.slice(2) });
    } else if (line.startsWith("u ")) {
      s.files.push({ index: "U", worktree: "U", path: line.split(" ").slice(10).join(" ") });
    }
  }
  return s;
}

export interface Commit {
  hash: string;
  author: string;
  date: Date;
  subject: string;
  refs: string;
}

export async function log(limit: number): Promise<Commit[]> {
  const SEP = "\x1f";
  const out = await git("log", `-n${limit}`, `--pretty=format:%h${SEP}%an${SEP}%aI${SEP}%s${SEP}%D`);
  if (!out) return [];
  return out.split("\n").map((line) => {
    const [hash, author, date, subject, refs] = line.split(SEP);
    return { hash, author, date: new Date(date), subject, refs };
  });
}
