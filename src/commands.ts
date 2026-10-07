import chalk from "chalk";
import ora from "ora";
import { git, log, status, type FileStatus } from "./git.js";
import { ago, authorColor, bold, box, dim, hype, logo, mint, ocean, sunset, vibe } from "./theme.js";

const LABEL: Record<string, [string, (s: string) => string]> = {
  M: ["modified", chalk.hex("#ffd166")],
  A: ["added", chalk.hex("#4ade80")],
  D: ["deleted", chalk.hex("#ff6b81")],
  R: ["renamed", chalk.hex("#7dd3fc")],
  C: ["copied", chalk.hex("#7dd3fc")],
  T: ["typechange", chalk.hex("#c77dff")],
  U: ["conflict", chalk.bgRed.white],
};

function printGroup(title: string, icon: string, files: FileStatus[], pick: (f: FileStatus) => string) {
  if (!files.length) return;
  console.log(`\n ${icon} ${bold(title)} ${dim(`(${files.length})`)}`);
  for (const f of files) {
    const [label, color] = LABEL[pick(f)] ?? ["untracked", chalk.hex("#8b7fb8")];
    console.log(`   ${color(label.padEnd(10))} ${f.path}`);
  }
}

export async function cmdStatus() {
  logo();
  const s = await status();
  const sync =
    s.ahead || s.behind
      ? `${s.ahead ? chalk.hex("#4ade80")(`↑${s.ahead}`) : ""} ${s.behind ? chalk.hex("#ff6b81")(`↓${s.behind}`) : ""}`.trim()
      : s.upstream
        ? mint("in sync ✓")
        : dim("no upstream");
  box([`${vibe("⎇")}  ${bold(s.branch)}  ${dim(s.upstream ? `→ ${s.upstream}` : "")}`, `${dim("sync")}  ${sync}`]);

  const staged = s.files.filter((f) => f.index !== "." && f.index !== "?" && f.index !== "U");
  const unstaged = s.files.filter((f) => f.worktree !== "." && f.worktree !== "?" && f.worktree !== "U");
  const untracked = s.files.filter((f) => f.index === "?");
  const conflicts = s.files.filter((f) => f.index === "U");

  if (!s.files.length) {
    console.log(`\n ${mint("✿ working tree clean — pure zen")}\n`);
    return;
  }
  printGroup("conflicts", "💥", conflicts, () => "U");
  printGroup("staged", "🟢", staged, (f) => f.index);
  printGroup("changes", "🟡", unstaged, (f) => f.worktree);
  printGroup("untracked", "🌱", untracked, () => "?");
  console.log();
}

export async function cmdCommit(args: string[]) {
  const all = args.includes("-a") || args.includes("--all");
  const message = args.filter((a) => a !== "-a" && a !== "--all").join(" ").trim();
  if (!message) {
    console.log(sunset('✖ give your commit a message: zen commit "add cool thing"'));
    process.exitCode = 1;
    return;
  }

  const spinner = ora({ text: dim("crafting your commit…"), spinner: "dots12", color: "magenta" }).start();
  if (all) await git("add", "-A");
  const staged = await git("diff", "--cached", "--numstat");
  if (!staged) {
    spinner.fail(dim("nothing staged — use `zen commit -a \"msg\"` to stage everything"));
    process.exitCode = 1;
    return;
  }

  let added = 0;
  let removed = 0;
  const files = staged.split("\n").length;
  for (const line of staged.split("\n")) {
    const [a, r] = line.split("\t");
    added += Number(a) || 0;
    removed += Number(r) || 0;
  }

  await git("commit", "-m", message);
  const hash = await git("rev-parse", "--short", "HEAD");
  const today = (await git("log", "--since=midnight", "--oneline")).split("\n").filter(Boolean).length;
  spinner.stop();

  console.log();
  box(
    [
      `${vibe("✦ committed")}  ${chalk.hex("#c77dff")(hash)}`,
      `${bold(message)}`,
      `${dim(`${files} file${files === 1 ? "" : "s"}`)}  ${chalk.hex("#4ade80")(`+${added}`)} ${chalk.hex("#ff6b81")(`-${removed}`)}`,
      "",
      `${sunset(hype())}`,
      dim(`commits today: ${"▮".repeat(Math.min(today, 20))} ${today}`),
    ],
    vibe,
  );
  console.log();
}

export async function cmdPush(args: string[]) {
  const spinner = ora({ text: dim("beaming commits to the cloud…"), spinner: "moon" }).start();
  try {
    await git("push", ...args);
    spinner.stop();
    const s = await status();
    console.log();
    box([`${ocean("🚀 pushed")} ${bold(s.branch)} ${dim(s.upstream ? `→ ${s.upstream}` : "")}`, mint("your code is out there now ✨")], ocean);
    console.log();
  } catch (err) {
    spinner.fail(chalk.hex("#ff6b81")((err as Error).message.split("\n").slice(-3).join("\n")));
    if (/no upstream/i.test((err as Error).message)) {
      console.log(dim("\n  tip: zen push -u origin HEAD"));
    }
    process.exitCode = 1;
  }
}

export async function cmdPull(args: string[]) {
  const spinner = ora({ text: dim("pulling fresh vibes…"), spinner: "bouncingBall", color: "cyan" }).start();
  try {
    const out = await git("pull", ...args);
    spinner.succeed(mint(out.includes("Already up to date") ? "already up to date ✿" : "pulled ✓"));
  } catch (err) {
    spinner.fail(chalk.hex("#ff6b81")((err as Error).message));
    process.exitCode = 1;
  }
}

export async function cmdLog(args: string[]) {
  const n = Number(args[0]) || 15;
  const commits = await log(n);
  if (!commits.length) {
    console.log(dim("no commits yet — make history ✨"));
    return;
  }
  console.log(`\n ${vibe("◆ timeline")} ${dim(`last ${commits.length}`)}\n`);
  commits.forEach((c, i) => {
    const node = i === 0 ? vibe("◉") : chalk.hex("#7f00ff")("○");
    const refs = c.refs ? ` ${chalk.hex("#ffd166")(`(${c.refs.replace("HEAD -> ", "★ ")})`)}` : "";
    console.log(` ${node} ${chalk.hex("#c77dff")(c.hash)} ${c.subject}${refs}`);
    console.log(` ${chalk.hex("#3a2a6a")("│")}   ${authorColor(c.author)(c.author)} ${dim("·")} ${dim(ago(c.date))}`);
  });
  console.log(` ${chalk.hex("#3a2a6a")("╵")}\n`);
}

export async function cmdStats() {
  const out = await git("log", "--pretty=format:%an|%aI");
  if (!out) {
    console.log(dim("no commits yet"));
    return;
  }
  const rows = out.split("\n").map((l) => {
    const i = l.lastIndexOf("|");
    return { author: l.slice(0, i), date: new Date(l.slice(i + 1)) };
  });

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const byDay = new Array(7).fill(0);
  const byHour = new Array(24).fill(0);
  const authors = new Map<string, number>();
  for (const r of rows) {
    byDay[(r.date.getDay() + 6) % 7]++;
    byHour[r.date.getHours()]++;
    authors.set(r.author, (authors.get(r.author) ?? 0) + 1);
  }

  logo();
  console.log(` ${bold(String(rows.length))} ${dim("commits total")}\n`);
  const max = Math.max(...byDay);
  console.log(` ${vibe("▍ commits by weekday")}`);
  days.forEach((d, i) => {
    const w = max ? Math.round((byDay[i] / max) * 30) : 0;
    console.log(`   ${dim(d)} ${vibe("█".repeat(w) || " ")} ${dim(String(byDay[i]))}`);
  });

  const blocks = " ▁▂▃▄▅▆▇█";
  const hMax = Math.max(...byHour);
  const spark = byHour.map((v) => blocks[hMax ? Math.round((v / hMax) * 8) : 0]).join("");
  const peak = byHour.indexOf(hMax);
  console.log(`\n ${ocean("▍ commits by hour")}`);
  console.log(`   ${ocean(spark)}`);
  console.log(`   ${dim("0h          12h        23h")}   ${dim("peak:")} ${peak}:00 ${peak >= 0 && peak < 5 ? "🦉 night owl" : peak < 12 ? "🌅 early bird" : "☀️ day coder"}`);

  console.log(`\n ${sunset("▍ top authors")}`);
  [...authors.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .forEach(([name, count], i) => console.log(`   ${["🥇", "🥈", "🥉", "  ", "  "][i]} ${authorColor(name)(name)} ${dim(String(count))}`));
  console.log();
}

export function cmdHelp() {
  logo();
  const rows: [string, string][] = [
    ["zen", "pretty status"],
    ['zen commit "msg"', "commit staged changes (-a to stage all)"],
    ["zen push [args]", "push with a spinner + celebration"],
    ["zen pull [args]", "pull with a spinner"],
    ["zen log [n]", "timeline of the last n commits"],
    ["zen stats", "commit charts: weekdays, hours, authors"],
    ["zen <anything>", "passes straight through to git"],
  ];
  for (const [cmd, desc] of rows) console.log(`  ${vibe(cmd.padEnd(18))} ${dim(desc)}`);
  console.log();
}
