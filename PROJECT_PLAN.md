# TBC Raid Assignments — Living Project Document

> **Living doc.** This is the running source of truth for status, conventions, roadmap, and backlog.
> Update it as work lands. `project_handoff_summary.md` is the frozen original brief (don't edit that);
> `GIT_AND_DEPLOY.md` is the deploy runbook. This file supersedes both for "what's true now / what's next."

**Last updated:** 2026-06-22 · **Branch:** main · **Build + lint:** passing (16 routes;
Morogrim Tidewalker added) · **4/10 bosses built**
· **Backlog cleared** — P0/P1/P2 + AST-1/2/3 done; only TD-3 (html2canvas swap) deferred by design

> **Next step (2026-06-22):** Morogrim is built + deployed; the user is reviewing the latest
> label positions on the live page (Main Tank under the portrait at x73, Add Tank label
> down-left with a leader line). Awaiting their confirmation / any final nudges. After that,
> the next boss is Solarian (TK) or another from the remaining 6, via the recipe in §3.

---

## 1. What this is

A no-backend website where TBC Classic raid officers fill in player names on a per-boss
position diagram, then export a PNG or save/reload a roster JSON for next week. One shared
React component is driven by small per-boss data files. Scope is **SSC (6 bosses)** and
**TK (4 bosses)** only — everything else is explicitly out of scope until asked.

## 2. Status snapshot

| Area | State |
|---|---|
| Next.js scaffold + routing (`/`, `/ssc`, `/ssc/[boss]`, `/tk`, `/tk/[boss]`) | ✅ Done |
| Shared `BossTemplate` component (pins, sidebar sync, export/save/load/clear) | ✅ Done |
| Lady Vashj data file (reference implementation) | ✅ Done & validated |
| Void Reaver (TK) data file | ✅ Done — WebP plate (86 KB), geometry overlay-verified, `labelOnly` markers; center cluster aligned tank→boss→DPS toward ring center |
| Fathom-Lord Karathress (SSC) data file | ✅ Done — WebP plate (95 KB). Pin positions detected from the user's annotated reference (`*-positions.png`) and overlay-verified; tight bottom cluster uses `labelDx`/`labelDy` (dot + leader line) so labels stay readable. Role icons on tanks/healers/melee/ranged. Assignments: 3 tanks + 6 healers (2 main, 2 Tidalvess, 1 Caribdis on-map, 1 raid; the 5 non-Caribdis healers are `sidebarOnly`). On-page Fight Notes panel from the user's strategy video |
| Morogrim Tidewalker (SSC) data file | ✅ Done — clean WebP plate (82 KB, keeps baked murloc/boss icons). Marker positions color/blob-detected from the user's annotated reference; 2 tanks + WG healer fillable, Melee/Ranged+Healers/4 Watery-Grave map markers, role icons + leader-line label fan-outs for the center-right cluster. Notes panel from the strategy video (2 phases) |
| Other 6 bosses | ⛔ Not started — need clean arena screenshots + pin geometry each |
| GitHub repo + Vercel deploy | ⏳ Repo exists; first push/deploy per `GIT_AND_DEPLOY.md` |
| Autosave / data-loss protection | ✅ Done — per-boss localStorage, restored on load |
| Mobile/touch usability of on-image pins | ✅ Improved — 44px sidebar targets, larger pins/inputs on mobile |
| Export-as-image feedback | ✅ Done — button disables + shows "Exporting…" |

**Progress: 4 / 10 bosses fully built** (Vashj, Void Reaver, Karathress, Morogrim). The abstraction holds
across symmetric quadrants, a few fixed roles, and a 13-pin council fight — remaining work is
content (images + geometry) per the recipe.

## 3. Architecture & conventions

```
app/
  layout.js              global nav + <main> wrapper
  page.js                homepage → raid hub cards
  ssc/page.js            SSC boss list
  ssc/[boss]/page.js     renders BossTemplate or "coming soon"
  tk/…                   same shape as ssc
components/
  BossTemplate.jsx       the one shared template (client component)
  BossTemplate.module.css
data/
  bosses.js              boss listings per raid + `ready` flag
  bossData.js            registry: slug → full boss data object
  bosses/<slug>.js       per-boss data (image, pins[], groups[], roles[])
public/images/<raid>/<slug>.jpg
app/globals.css          theme tokens (--accent-fel, --*-role colors, etc.)
```

### The repeatable recipe for adding a boss
1. Source a clean top-down arena/platform screenshot → `public/images/<raid>/<slug>.<ext>`.
   `.jpg`, `.png`, and `.webp` all work (Vashj is `.jpg`, Void Reaver is `.png`); set the boss's
   `image` field to match the actual extension. A "clean" plate means no raid markers baked in —
   strip class/role icons so the template's own pins are the single source of truth (arrows that
   illustrate movement, e.g. Void Reaver's orb-kite paths, are fine to keep).
2. **Inspect the image before placing pins** — find the platform center and named landmarks;
   compute pin `x`/`y` as % of image dimensions. Do **not** eyeball percentages
   (carry-forward lesson from Vashj). Verify with a rendered overlay before calling it done.
   **When the user provides an annotated reference, detect marker positions by color/blob
   centroid (a `sharp` raw-pixel pass), not by eye** — eyeballing % off downscaled crops is
   unreliable (Morogrim's boss portrait was misread ~6% left repeatedly until color-detected at
   x≈73). The dungeon's braziers/card borders pollute simple thresholds, so use tight,
   marker-specific color tests + connected-component blobs.
3. Confirm the quadrant/letter labels against the user's *actual* raid callouts, not a default.
4. Create `data/bosses/<slug>.js` following the `lady-vashj.js` shape.
5. Register it in `data/bossData.js`. That's the only switch — `bosses.js` derives the boss's
   `ready` state from this registry automatically, so the "coming soon" placeholder flips to the
   live template with no second edit.
6. `npm run build` to confirm the route generates, eyeball the page, then commit.

### Per-boss data shape (contract)
`{ slug, name, raidShort, subtitle, image, imageAlt, imageWidth, imageHeight,
roles[{key,name,desc}],
pins[{id, role, tag, sidebarLabel, x, y, labelOnly?, icon?, labelDx?, labelDy?, sidebarOnly?, cardLabel?}],
groups[{id, title, pins[]}], notes?[{heading, items[]}], overlays?[{id, title, x, y, pins[]}] }`
`imageWidth`/`imageHeight` are the source image's pixel dimensions — record them when
adding a boss (they drive the missing-image fallback's shape; pin x/y stay as %).
Role `key` must map to a `--<key>-role` CSS var in `globals.css`
(white/red/yellow/blue/green/purple/orange exist today).

Optional pin fields (all additive — absent on normal pins, so older bosses are unaffected):

- **`labelOnly: true`** (Void Reaver) — map-only annotation: renders just its tag, **no** name
  input and no mirrored export span. For non-player markers (boss position) or a group position
  that isn't an individual assignment (DPS stack, melee/ranged zones). Left out of `groups`.
- **`icon`** (Karathress) — generic role glyph rendered inline-SVG in the tag: `tank` (shield),
  `healer` (cross), `melee` (crossed swords), `ranged` (arrow). Inherits the role color; export-safe.
- **`labelDx` / `labelDy`** (Karathress) — percent offsets that shift a pin's **label** away from
  its true spot in tight stacks. A dot marks the real position and a leader line connects them, so
  positions stay accurate while crowded labels stay readable.
- **`noLeader: true`** (Morogrim) — with `labelDx`/`labelDy`, draw the offset label + dot but **no**
  connector line. For fillable pins whose name-input box would otherwise sit on top of the line
  (the line ends at the label block's center, behind the box).
- **`sidebarOnly: true`** (Karathress) — a roster assignment with **no** map pin (e.g. floating
  healers). Appears in the sidebar via `groups` but is skipped on the map; needs no `x`/`y`.
- **`cardLabel`** (Karathress) — short label used for a pin's row in an on-image `overlays` card
  (falls back to `sidebarLabel`). Keeps the compact card readable.

`notes` (optional, Karathress) is an array of `{heading, items[]}` sections rendered in an on-page
**Fight Notes & Priorities** panel below the map + assignments — for kill order, mechanics, opener,
tank/healer tips, etc.

`overlays` (optional, Karathress) is an array of on-image assignment cards `{id, title, x, y%, pins[]}`
rendered **inside the export frame** (so they appear in the shared PNG). Each card lists its pins as
`cardLabel → typed name` rows, display-only and synced to the sidebar. This is how `sidebarOnly`
roles (e.g. grouped healers) reach the exported image; empty rows show a faint dash.

## 4. Roadmap

**Phase 1 — Ship the skeleton (now).** Push to GitHub, deploy to Vercel, confirm Vashj page
works live on desktop and phone. *(Repo + runbook ready; just needs the first push.)*

**Phase 2 — Harden the one good page.** Before mass-producing bosses, land the P0 usability
fixes on `BossTemplate` so every future boss inherits them: autosave, touch sizing, export
feedback. Cheaper to fix once on the shared component than to retrofit across 10 pages.

**Phase 3 — Content build-out.** Add the remaining bosses one at a time via the recipe
above. Each is mostly image-sourcing + geometry, not code. ✅ Void Reaver (TK) and ✅ Karathress
(SSC) done — between them they drove the optional-pin features (`labelOnly`, `icon`, `labelDx`/
`labelDy`, `sidebarOnly`) and the on-page `notes` panel, so future bosses inherit all of it.
Remaining 7: suggested order is the easiest/most iconic positioning next (Morogrim, Solarian).

**Phase 4 — Polish & accessibility pass.** Work the P1 backlog (active nav state, focus rings,
labels, reduced-motion). Re-run a UX review before declaring v1 done.

**Out of scope (don't build unless asked):** Kara, Gruul's, Mag, Hyjal, BT, Sunwell;
live roster API sync (Blizzard Classic endpoints confirmed unreliable); any backend/database/auth.

## 5. Backlog (prioritized)

Severity reflects impact on the weekly officer workflow. P0 = do before mass-producing bosses.

### P0 — High-impact usability ✅ DONE (2026-06-21, on the shared component)
- **U-1 · Autosave to `localStorage` per boss.** ✅ Done. `values` + `week` persisted under
  `tbc-raid:roster:<slug>`, restored after mount (effect, not a `useState` initializer, to
  avoid an SSR hydration mismatch). A "Restored your last entries" / "Auto-saved in this
  browser" note (aria-live) surfaces status. The JSON Save/Load remains the explicit
  cross-device/backup path.
- **U-2 · Touch targets.** ✅ Done. On `≤760px`: sidebar + week inputs go to `min-height:44px`
  with 16px font (also stops iOS focus auto-zoom), buttons to 44px, and on-image pins/tags
  enlarge for legibility and tapping. `touch-action: manipulation` added to all inputs.
- **U-3 · Export button feedback.** ✅ Done. Export button is `disabled` and shows "Exporting…"
  while html2canvas runs, preventing double-clicks / "did it hang?" confusion.

### P1 — Accessibility & polish ✅ DONE (2026-06-21)
- **A-1 · Programmatic labels on pin inputs.** ✅ Each on-map input now has
  `aria-label="<tag> — player name"` (e.g. "A · Core 1 — player name").
- **A-2 · Active nav state.** ✅ Nav extracted to a `SiteNav` client component; current section
  gets `aria-current="page"` + a fel underline. `/ssc/*` and `/tk/*` keep their parent lit.
- **A-3 · Visible focus rings sitewide.** ✅ `:focus-visible` outline in the fel accent on links
  and buttons (inputs keep their existing focus styles).
- **A-4 · Reduced motion + specific transitions.** ✅ `transition: all` replaced with explicit
  properties on buttons/cards; a `prefers-reduced-motion` block neutralizes transitions/animations.
- **A-5 · Sidebar label disambiguation.** ✅ Sidebar inputs are `aria-label`ed with their group
  ("Quadrant A: Core Runner 1") and the visible `<label>` is now `htmlFor`-associated.

### P2 — Cleanup & tech debt ✅ DONE (2026-06-21, except TD-3 deferred)
- **TD-1 · Single source of truth for "ready".** ✅ `ready` is derived from `bossData.js` via a
  `withReady()` helper — the hand-kept flag is gone (see updated recipe step 5).
- **TD-2 · Delete leftover scaffold.** ✅ Removed `app/page.module.css` and the five unused
  `public/*.svg` files. `public/` now holds only `images/`.
- **TD-3 · `html2canvas` is unmaintained.** ⏸ Deferred by design — it works today and the
  display-span workaround is stable. Revisit with `modern-screenshot`/`snapdom` if it breaks or
  export quality needs to improve. No action taken.
- **TD-4 · Undo on "Clear all."** ✅ Replaced the `confirm()` with an 8-second "Cleared all
  names — Undo" toast (`role="status"`) that restores the prior fill.
- **TD-5 · Broken-image / missing-asset fallback.** ✅ Image `onError` swaps in an
  aspect-ratio-preserving placeholder so the page stays usable if a boss image is missing.
- **TD-6 · Pin clipping near frame edges.** ✅ Verified safe on desktop/typical mobile (portrait
  image gives wide margins); added a `≤400px` clamp that narrows pin inputs so the innermost
  pins don't clip on small phones.

### New / open (surfaced by the Void Reaver build)
- **AST-1 · Optimize boss arena images.** ✅ Done (2026-06-21). Converted `void-reaver.png`
  (1.7 MB lossless PNG) to **WebP at quality 80 → 86 KB** (20× smaller, on par with Vashj's
  78 KB JPG, no visible loss) via `sharp`; old PNG removed, `image` path updated. **Standard for
  future bosses:** save arena plates as WebP q80 (`sharp(src).webp({quality:80})`). WebP renders
  fine in `html2canvas` export.
- **AST-2 · Image fallback aspect-ratio is hardcoded portrait.** ✅ Done (2026-06-21). Added
  `imageWidth`/`imageHeight` to the data contract (both bosses); `BossTemplate` sets the
  fallback's `aspect-ratio` inline from them, so a missing landscape image no longer shows a
  wrongly-tall box. CSS keeps a neutral `16/10` default for bosses that omit dimensions.
- **AST-3 · Fixed 560px map frame favors portrait plates.** ✅ Done (2026-06-21). Frame width is
  now `min(clamp(560px, 42vw, 720px), calc(100vw - 32px))`: unchanged at 560px on laptops
  (≤~1333px wide), scales up to 720px on large desktop monitors for readability, and shrinks to
  the viewport on mobile. Pins are %-based so positions/spacing are preserved at every size —
  the careful Vashj/Void Reaver layouts just scale. Easy to revert to a fixed width if preferred.

## 6. Decisions (carried forward + new)
- **Stack:** Next.js on Vercel. **No backend/DB/auth.** Names are free-text, typed weekly.
- **One shared component + per-boss data files**, not copy-pasted HTML per boss.
- **Export uses a display-span swap** (`.exporting` class hides `<input>`, shows mirrored
  `<span>`) because html2canvas won't reliably paint live form-control text. Preserve this.
- **Pin placement is geometry-driven**, verified against a real screenshot — never guessed.
- **Theme:** keep the dark-fantasy fel-green identity from the Vashj prototype. (A generic
  UX pass suggested a blue/amber "ops dashboard" palette — rejected; the WoW theme is the brand.)
- **Desktop-first** (confirmed 2026-06-21). Officers fill this in primarily at a desk; mobile
  stays supported as an occasional fallback, not the primary target. Size on-screen text for
  desktop readability first — don't carry the prototype's cramped micro-fonts forward to new
  bosses (pin tags/name text were bumped up for this reason).

## 7. Changelog
- **2026-06-22** — **Morogrim Tidewalker (SSC) — 4th boss (4/10).** Clean WebP plate (82 KB; keeps
  the baked murloc spawn cards + Morogrim's icon, per the user). Marker positions read from the
  user's annotated reference via color/blob detection (raid square, melee, add tank, 4 Watery-Grave
  spawns auto-detected; main tank + ramp healer from the user's description). Pin set: 2 tanks + WG
  healer fillable; Melee, Ranged+Healers, and 4 Watery-Grave map markers; role icons + leader-line
  label fan-outs for the tight center-right cluster. Two-phase Fight Notes panel from the strategy
  video. Lint + build passing. (No Google Sheet link was ever recorded; the provided image +
  annotated reference + transcript were sufficient.)
- **2026-06-22** — **On-image assignment cards (`overlays`) + export-safe leader colors.** Added a
  generic `overlays` template feature: positioned cards rendered inside the export frame, listing
  `cardLabel → typed name` rows (display-only, synced to the sidebar) so `sidebarOnly` roles reach
  the shared PNG. Wired a "Healers" card onto Karathress (upper-left) — the 6 healers now show in the
  export, empty rows as a faint dash. Also resolved role CSS vars to literals so the leader-line
  colors survive html2canvas export. Relocated dev reference screenshots out of `public/`. Lint +
  build passing; all pushed.
- **2026-06-21** — **Karathress: precise placement + 3 new template features.** Detected exact pin
  positions from the user's annotated reference (`fathom-lord-karathress-positions.png`, color blobs
  → %), fixing the layout. Root issue was label collision in the stacked bottom group, so added
  **`labelDx`/`labelDy`** (dot at the true spot + leader line, label offset) — accurate *and*
  readable. Added **`icon`** generic role glyphs (inline-SVG tank/healer/melee/ranged, export-safe).
  Added **`sidebarOnly`** pins so floating healers are roster assignments without a map pin. Reworked
  healers to the user's strategy-video weighting (2 main-tank, 2 Tidalvess, 1 Caribdis on-map, 1
  raid). Added a **`notes`** field + on-page **Fight Notes & Priorities** panel populated from the
  video (kill order, 75% Blessing-of-the-Tides rule, opener MDs, tank/healer tips). All five new
  fields are optional/additive — Vashj + Void Reaver unaffected. Shared `BossTemplate.jsx` +
  `.module.css` touched; not build-verified in this env (run `npm run build` locally; mind the
  parallel Code session on the same files).
- **2026-06-21** — **Karathress reworked on a clean plate.** The first finalize used the
  marker-laden cheat-sheet screenshot (blurred center = bad) and put Caribdis on the wrong side.
  User supplied a clean arena shot + the real positioning; re-placed all pins from that
  description and overlay-verified: MT + K/Sharkiss top-of-ramp, melee right, Tidalvess + tank
  further right, Caribdis at the far-right hallway with tank + healer, ranged/raid healers
  mid-ramp. Simplified to the user's pin set — 3 tank + 1 healer inputs, plus Melee/Ranged/Raid
  Healer group markers and the 4 council kill-order markers. Clean WebP (95 KB). Lint + build pass.
- **2026-06-21** — **Finalized Fathom-Lord Karathress (SSC) — 3rd boss (3/10).** The provided plate
  carried the uploader's center cheat-sheet legend (class-icon grid + boss portraits); confirmed
  it's a legend, not spatial positions, so feathered it out (sharp radial mask) and converted to
  **WebP (3.2 MB → 81 KB)**. Re-placed all 13 pins via a rendered overlay (with input-box
  footprints) to the strategic layout — 3 lords clustered center-right, Caribdis pulled far
  upper-left, MT + raid healers spaced so name boxes don't collide. Set `image` to `.webp` +
  `imageWidth/Height`; cleared the PROVISIONAL note. Lint + build passing; Vashj/Void Reaver unaffected.
- **2026-06-21** — Scaffolded **Fathom-Lord Karathress (SSC)**. `data/bosses/fathom-lord-karathress.js`
  created + registered in `bossData.js` (validated against the contract). Council fight modeled as
  4 `labelOnly` markers tagged with kill order (1·Tidalvess → 2·Sharkiss → 3·Caribdis → 4·Karathress),
  3 tanks (K+Sharkiss main, Tidalvess+pet, Caribdis pull-far), and 6 healers (2 main-tank, 1
  Tidalvess, 1 Caribdis resto druid, 2 raid/float). Fight details sourced from a community **SSC
  cheat-sheet** Google Sheet (text via the gviz CSV endpoint; the sheet's embedded arena
  screenshots don't export that way). Pin geometry is PROVISIONAL and `imageWidth`/`imageHeight`
  are unset — both pending the arena image on disk (`public/images/ssc/fathom-lord-karathress.<ext>`)
  + an overlay pass. Not yet build-verified here (sandbox can't build the Windows `node_modules`).
- **2026-06-21** — Completed remaining backlog **AST-2** + **AST-3**. Added `imageWidth`/
  `imageHeight` to the boss contract; missing-image fallback now uses the real aspect ratio.
  Map frame scales `560px → 720px` on large desktops (and down to viewport on mobile) via
  `clamp`, keeping %-based pins identical — pure readability win, no layout regression. Only
  TD-3 (html2canvas swap) remains, deferred by design. Lint + build passing.
- **2026-06-21** — Void Reaver center cluster, pass 4: nudged the tank down (`y 60→62`) to clear
  a slight Tank/Void Reaver label overlap. Overlay-verified. Lint + build passing.
- **2026-06-21** — Void Reaver center cluster, pass 3: translated the boss + DPS pair (relation
  preserved) right to sit just above-and-left of the tank, clear of the tank's name-input box.
  Boss `(47,50)→(54,52)`, DPS `(43,44.5)→(50,46.5)`. Overlay-verified. Lint + build passing.
- **2026-06-21** — Void Reaver center cluster, pass 2: tightened boss + DPS to ~4 yards apart
  (DPS stacks on his back in-game) straddling the ring center, and dropped the tank slightly
  (`y 58→60`). Boss `(48,50)→(47,50)`, DPS `(38,43.5)→(43,44.5)`. The pair is offset only as much
  as their two labels need to not collide at display size; re-verified with a realistic-scale
  `sharp` overlay (real tag text + 5-yard ring). Lint + build passing.
- **2026-06-21** — Void Reaver polish: optimized the arena plate to **WebP (1.7 MB → 86 KB)** —
  WebP is the standard for future bosses. Realigned the center cluster so **tank → boss → DPS
  stack** form a straight line aimed at the ring center; verified with a `sharp` pin/center
  overlay. Lint + build passing.
- **2026-06-21** — Added **Void Reaver (TK)** — 2nd boss (2/10). Clean `.png` plate (raid icons
  stripped, orb-kite arrows kept); `data/bosses/void-reaver.js` registered in `bossData.js`
  (auto-flips `ready`). Roles: Tank, DPS Stack, Orb Baiter, + a Void Reaver boss marker. Renamed
  the outer trio "Orb Baiter" (they bait & dodge, not soak) and ordered them 1→2→3 left to right.
  Extended the data contract with **`labelOnly`** pins (tag, no name input) on `BossTemplate` for
  the boss marker and the DPS-stack position; these stay out of the sidebar roster. Pin geometry
  set from the user's annotated reference and verified via a rendered PIL overlay; nudged the
  center markers apart vertically so their labels don't overlap. Build + lint verified passing
  locally afterward (Vashj spot-checked, unaffected by the `labelOnly` addition).
- **2026-06-21** — Completed P1 (a11y/polish) and P2 (cleanup/tech-debt) backlogs. P1: pin +
  sidebar aria-labels, active-nav `SiteNav` client component, sitewide focus-visible rings,
  reduced-motion + explicit transitions. P2: derived `ready` from the data registry, deleted
  dead scaffold files, undo toast on Clear all, broken-image fallback, small-screen pin clamp.
  TD-3 (html2canvas replacement) deferred. Lint + build passing.
- **2026-06-21** — Readability tuning: enlarged desktop pin tags (7.5→10px), name text
  (11→13px), and legend (0.72→0.78rem); mobile sizes kept a notch above. Confirmed desktop-first
  orientation. The portrait image (520×931) leaves generous vertical room, so no overlap.
- **2026-06-21** — Completed P0 usability backlog on `BossTemplate` (U-1 autosave, U-2 touch
  targets, U-3 export feedback). Lint + build passing. Backlog now leads with P1 (a11y/polish).
- **2026-06-21** — Created this living doc. Reviewed full codebase + ran UI/UX intelligence pass;
  populated the prioritized backlog above. Build + lint passing.
