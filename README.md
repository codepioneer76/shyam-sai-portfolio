# SHYAM SAI TATIPARTI — THE CASTLE

A gothic-castle portfolio for an AI / software engineer. Seven rooms on one
continuous walk, each joined to the next by a doorway you scroll through.
Next.js 14 + TypeScript + Tailwind. Three.js is used for exactly one object —
the travelling case that holds the skill set — and nothing else.

## Running it in VS Code

1. **Install Node.js 18.17 or newer** — <https://nodejs.org> (LTS is fine).
   Check it with `node -v`.
2. **Open this folder in VS Code** — `File → Open Folder…` → select
   `shyam-sai-portfolio`.
3. **Open the integrated terminal** — `Ctrl + ~` (macOS: `Cmd + ~`), or
   `Terminal → New Terminal`. It opens in the project root.
4. **Install dependencies:**
   ```bash
   npm install
   ```
5. **Start the dev server:**
   ```bash
   npm run dev
   ```
6. **Open <http://localhost:3000>** — `Ctrl + click` the URL in the terminal.

### All commands

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server with hot reload on :3000 |
| `npm run build` | Production build |
| `npm run start` | Serve the production build (run `build` first) |
| `npm run typecheck` | Strict TypeScript, no emit |
| `npm run lint` | ESLint (next/core-web-vitals) |

### If the dev server will not start

Two things go wrong when this project is unzipped over an older copy of itself:

```powershell
Remove-Item -Recurse -Force node_modules, .next
npm install
npm run dev
```

`node_modules` carries the previous version's dependency tree, so imports that
exist in this `package.json` are missing on disk (`Can't resolve 'lenis'`), and
`.next` carries a stale build cache, which shows up as hot-update 404s and
"Fast Refresh had to perform a full reload".

If Next reports **"Port 3000 is in use, trying 3001"**, an old dev server is
still running and still serving the old site. Stop it before judging anything
you see:

```powershell
Get-NetTCPConnection -LocalPort 3000 -State Listen | Select-Object -ExpandProperty OwningProcess | ForEach-Object { Stop-Process -Id $_ -Force }
```

### Optional: the archive desk

`ASK` (or the `K` key) opens a desk that answers questions about Shyam using
BM25 retrieval over the portfolio's own data. With no key it returns the
matching records; with `ANTHROPIC_API_KEY` in `.env.local` it composes an answer
from them. Either way, anything outside the record gets exactly one reply:
*That information is not recorded in the archive.*

---

## The seven rooms

| | Room | Answers | What happens |
| --- | --- | --- | --- |
| I | THE ENTRANCE | Who is he? | Doors swing open on the great hall; the personal record, languages and experience on file |
| II | SKILL SET | What can he build with? | The 3D travelling case: release each latch, the lid lifts, sixteen objects inside |
| III | PROJECTS BUILT | What has he built? | PipeGuard and RiverSight as leather dossiers: the seal splits, the cover swings, pages slide out |
| IV | RESEARCH & AI | What is he exploring? | Manuscripts on a scholar's desk; each opens and inks its own diagram |
| V | CERTIFICATIONS | What has he completed? | Drawers of certificates, each sealed across its fold; drawing one breaks the seal and unfolds it |
| VI | HOW I BUILD | How does he think? | An engineering sheet that draws itself as you scroll: seven stages, stamped as the line reaches them |
| VII | THE FINAL ROOM | How do you reach him? | The candles burn down, the great door opens onto daylight; contact |

Each room's former name (The Arsenal, Case Files, The Lab, The Archive, The
System, Extraction) appears for a moment as you enter and dissolves into the new one.

Keys: `M` map · `K` archive desk · `Esc` close. The map, the room index at the
left edge and the numerals along the bottom on phones all jump straight to a room.

## The case

Built in `src/inventory/`. A genuinely hollow leather shell — wall thickness,
floor, lining — with procedural leather (grain, scuffs, polish), velvet lining,
brass corners, hinges, handle and two latches. The mechanism is a small state
machine: each latch is released individually with its own click; only when both
are free does the lid lift, on a heavy under-damped spring that overshoots once
and settles. The hinge creak, the leather and the thud are triggered by the
lid's actual position, not by the click.

The 3D chunk is only downloaded when the visitor is a room away, and stops
rendering when off screen. On machines where WebGL runs on a software
rasteriser — measured at about 2 fps — or where a real GPU cannot hold 20 fps,
the room quietly uses a drawn 2D case with the identical mechanism instead.
Every object is also a button in the manifest below the case, so the whole
thing works by keyboard and screen reader.

For testing: `/?case=3d` forces the 3D case, `/?case=2d` forces the drawn one.

## Dependencies, and why each exists

| Package | Why |
| --- | --- |
| next, react, react-dom | The application |
| three, @react-three/fiber | The travelling case — the one object that needs real 3D |
| lenis | Momentum scrolling that feels right across wheel, trackpad and touch (~3 kB) |

No GSAP, no Drei, no physics engine, no image or audio assets. Tweens, springs,
scroll choreography and every sound are written in the project; every texture
is drawn at runtime.

## Filling in your details

Everything unknown renders as PENDING VERIFICATION. Filling it in is a data
edit — no component changes.

| What | Where |
| --- | --- |
| GitHub, email, resume (LinkedIn is already set) | `src/data/contact.ts` |
| PipeGuard: architecture, technologies, current state, lessons | `src/data/caseFiles.ts` |
| RiverSight: architecture | `src/data/caseFiles.ts` |
| Repository and demo links | `src/data/caseFiles.ts` → `links` |
| IIT Kharagpur role and dates | `src/data/profile.ts` → `attachments` |
| Certificate issue dates | `src/data/archive.ts` |
| A photograph for the portrait frame | not yet wired — the frame shows a monogram |

## Verification done on this build

Clean install, `tsc --noEmit`, `next lint` and `next build` all pass. The
site was then driven in headless Chromium at 1440×900, 1366×768, tablet
(820×1180) and phone (390×844): every room screenshotted, zero console errors,
zero horizontal overflow, the case opened latch by latch, a dossier's seal
broken, a certificate drawn and unfolded, the blueprint scrolled mid-draw, the
map opened, and the archive desk asked something it should refuse.
