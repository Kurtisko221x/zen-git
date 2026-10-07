#!/usr/bin/env node
import chalk from "chalk";
import { cmdCommit, cmdHelp, cmdLog, cmdPull, cmdPush, cmdStats, cmdStatus } from "./commands.js";
import { GitError, isRepo, passthrough } from "./git.js";

const [cmd, ...args] = process.argv.slice(2);

const commands: Record<string, (args: string[]) => Promise<void> | void> = {
  status: cmdStatus,
  st: cmdStatus,
  commit: cmdCommit,
  c: cmdCommit,
  push: cmdPush,
  pull: cmdPull,
  log: cmdLog,
  stats: cmdStats,
  help: cmdHelp,
  "--help": cmdHelp,
  "-h": cmdHelp,
};

async function main() {
  if (cmd && !commands[cmd]) {
    process.exitCode = await passthrough([cmd, ...args]);
    return;
  }
  if (cmd !== "help" && cmd !== "--help" && cmd !== "-h" && !(await isRepo())) {
    console.log(chalk.hex("#ff6b81")("✖ not a git repository") + chalk.dim("  — run `zen init` to start one"));
    process.exitCode = 1;
    return;
  }
  await commands[cmd ?? "status"](args);
}

main().catch((err) => {
  console.error(chalk.hex("#ff6b81")(`✖ ${err instanceof GitError ? err.message : (err as Error).stack}`));
  process.exitCode = 1;
});
