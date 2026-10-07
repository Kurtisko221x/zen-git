import chalk from "chalk";
import gradient from "gradient-string";

export const vibe = gradient(["#7f00ff", "#e100ff", "#ff6ec7"]);
export const ocean = gradient(["#00d4ff", "#7f00ff"]);
export const sunset = gradient(["#ff9a00", "#ff2e88", "#7f00ff"]);
export const mint = gradient(["#4ade80", "#00d4ff"]);

export const dim = chalk.dim;
export const bold = chalk.bold;

export const LOGO = `
 ███████╗███████╗███╗   ██╗
 ╚══███╔╝██╔════╝████╗  ██║
   ███╔╝ █████╗  ██╔██╗ ██║
  ███╔╝  ██╔══╝  ██║╚██╗██║
 ███████╗███████╗██║ ╚████║
 ╚══════╝╚══════╝╚═╝  ╚═══╝`;

export function logo() {
  console.log(vibe.multiline(LOGO));
  console.log(dim("   git, but make it aesthetic ✿\n"));
}

/** A rounded box whose border is painted with a gradient. */
export function box(lines: string[], paint = vibe) {
  // eslint-disable-next-line no-control-regex
  const visible = (s: string) => s.replace(/\x1b\[[0-9;]*m/g, "").length;
  const width = Math.max(...lines.map(visible)) + 2;
  console.log(paint(`╭${"─".repeat(width)}╮`));
  for (const l of lines) console.log(`${paint("│")} ${l}${" ".repeat(width - visible(l) - 1)}${paint("│")}`);
  console.log(paint(`╰${"─".repeat(width)}╯`));
}

export function ago(date: Date): string {
  const s = (Date.now() - date.getTime()) / 1000;
  const units: [number, string][] = [
    [31536000, "y"],
    [2592000, "mo"],
    [604800, "w"],
    [86400, "d"],
    [3600, "h"],
    [60, "m"],
  ];
  for (const [secs, label] of units) if (s >= secs) return `${Math.floor(s / secs)}${label} ago`;
  return "just now";
}

const AUTHOR_COLORS = ["#ff6ec7", "#7dd3fc", "#4ade80", "#ffd166", "#c77dff", "#ff9a00"];
export function authorColor(name: string) {
  let h = 0;
  for (const ch of name) h = (h * 31 + ch.charCodeAt(0)) >>> 0;
  return chalk.hex(AUTHOR_COLORS[h % AUTHOR_COLORS.length]);
}

const HYPE = [
  "another one. you're on fire 🔥",
  "clean commit, clean mind ✨",
  "future you says thanks 💜",
  "ship it like it's hot 🚀",
  "that diff? immaculate.",
  "small commits, big energy ⚡",
  "the codebase grows stronger 🌱",
  "you didn't break anything. probably. 😌",
  "vibes: committed ✅",
  "keep going, legend 👑",
];
export const hype = () => HYPE[Math.floor(Math.random() * HYPE.length)];
