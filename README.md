<div align="center">

# ✿ zen-git

**Git, but make it aesthetic.**
Gradients, spinners, ASCII art, commit stats — and a little hype after every commit.

<img src="https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white"/>
<img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white"/>
<img src="https://img.shields.io/badge/chalk-e100ff?style=for-the-badge"/>
<img src="https://img.shields.io/badge/gradient--string-7f00ff?style=for-the-badge"/>

</div>

---

```
 ███████╗███████╗███╗   ██╗
 ╚══███╔╝██╔════╝████╗  ██║
   ███╔╝ █████╗  ██╔██╗ ██║
  ███╔╝  ██╔══╝  ██║╚██╗██║
 ███████╗███████╗██║ ╚████║
 ╚══════╝╚══════╝╚═╝  ╚═══╝
   git, but make it aesthetic ✿

╭──────────────────────────────╮
│ ✦ committed  a3f9c21         │
│ add aurora background        │
│ 3 files  +128 -12            │
│                              │
│ ship it like it's hot 🚀     │
│ commits today: ▮▮▮▮ 4        │
╰──────────────────────────────╯
```
*(in your terminal it's all gradients 💜)*

## Install

```bash
git clone https://github.com/Kurtisko221x/zen-git
cd zen-git
npm install
npm run build
npm link         # now `zen` works everywhere
```

## Commands

| Command | What it does |
|---|---|
| `zen` | Pretty status — branch, sync state, staged / changes / untracked groups |
| `zen commit "msg"` | Commit staged changes with stats + a hype line. `-a` stages everything first |
| `zen push [args]` | Push with a spinner and a celebration box |
| `zen pull [args]` | Pull with a spinner |
| `zen log [n]` | Timeline view of the last *n* commits with colored authors & relative times |
| `zen stats` | Commits by weekday (bar chart), by hour (sparkline + night-owl detector), top authors |
| `zen <anything>` | Everything else passes straight through to `git` |

## Under the hood

- Git runs via `execFile` (no shell → no injection) and status is parsed from `--porcelain=v2`
- `gradient-string` paints the logo, boxes and charts; `ora` handles spinners
- Gradient-bordered boxes measure visible width with ANSI codes stripped, so emojis and colors line up

## License

MIT
