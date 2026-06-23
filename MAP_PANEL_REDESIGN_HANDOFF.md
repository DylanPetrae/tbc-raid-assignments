# Handoff (v2): map-markers + linked assignment panel redesign

Spec for a Claude Code session. Read `PROJECT_PLAN.md` first (§3 contract, §6 decisions).

> **v2 note — read this first.** The first build layered the new markers/keys/panel **on top of**
> the existing on-map text labels and name inputs, so every pin showed 4 things at once (dot + key
> badge + role label + Name box) plus a floating panel. That's the busyness. This redesign is a
> **REPLACE, not an ADD.** There is exactly **one** representation of a pin on the map (a marker),
> and names live in **one** place (the panel). If you ever see a text label *and* a marker for the
> same pin, that's the bug.

## The rule (single source of truth)
- **Map shows markers only** — a colored dot (role color) + role `icon` (if any) + a short **key
  badge**. No role text labels on the map. No name `<input>` on the map. Ever (except the
  names-on-map *export* mode below).
- **Names live only in the panel.** Every fillable assignment is a row in the docked panel.
- **Same on all viewports.** No desktop-vs-mobile label mode. (Earlier we considered keeping labels
  on desktop — dropped: running both representations is what caused the overlap.)

## What to REMOVE from the current component
- The on-map text tag rendering for pins (the `.tag` text on the map) — markers replace it.
- The on-map name `<input>` / `.nameDisplay` (move name entry entirely to the panel).
- The old wide-label fan-out is gone, BUT keep the `labelDx`/`labelDy` + leader-line + true-spot-dot
  mechanism — it is **repurposed to declutter crowded markers** (see "Crowded markers" below). Don't
  delete `.posDot`/`.leaders`; reuse them for markers.

## Markers (on the map)
Per positioned pin: a tap-target (≥44px hit area, dot can be smaller) containing the role-colored
dot, the role `icon` inline-SVG if present, and the **key badge** text.

### Key badge scheme
- Format: **role letter + index**, e.g. `T1 T2` (tanks), `H1 H2` (healers), `M` (lone melee), `R`
  (lone ranged). Index is added **only when a role has more than one member** (a single member is
  just the letter).
- **Derive the letter from the role, do NOT hardcode T/H/M/R** — use the first letter of the
  role's `name`, with an optional `keyLetter` field on the role definition to break ties (two roles
  starting with the same letter). This makes Vashj read K / C1 / C2 / G automatically and works for
  any future boss.
- `labelOnly` markers (boss position, DPS/melee/ranged zones, Vashj generators) stay on the map as
  markers but have **no panel row** (they're not in `groups`). The council keeps its existing
  **kill-order number** as its badge (1–4) — don't renumber it into the role scheme.

### Crowded markers (decluttering)
Markers are small, so most bosses need no separation — but genuinely stacked spots (Karathress's
council cluster) still overlap. Handle it with **manual per-pin offsets**, not an auto-layout:
- Reuse **`labelDx`/`labelDy`** to nudge the **marker** off its true spot, with a thin **leader
  line** from the nudged marker back to a small dot at the true position (so positional accuracy is
  preserved — the dot is "where you stand", the marker is just moved out for legibility).
- **Default is 0** (marker sits exactly on the true spot). Only the handful of pins that actually
  collide get an offset.
- **Re-tune the values smaller than the old ones.** The existing Karathress `labelDx`/`labelDy`
  were sized to fan out wide *text labels*; a dot + 2-char badge needs only a fraction of that
  nudge. Re-tune against a rendered overlay; don't paste the old magnitudes.
- Chosen over automatic declutter on purpose: this is a curated ~10-boss set where only one or two
  fights are dense, so deterministic hand-tuning beats an algorithm that can fight the intended
  layout. (If the boss count ever grows a lot, this can later become auto-default + manual override.)

## Panel (the assignments)
- **Docked, never a floating overlay.** Beside the map on wide screens, below it on narrow screens
  — reuse/extend the existing roster sidebar layout (it already flexes this way). Rationale: arena
  images differ in where free space is, so any on-map overlay covers markers on some boss.
- **Collapsible**, primarily for mobile, so the user can fold the list to see the whole map.
- Each row: key badge + role dot/icon + `sidebarLabel` + name `<input>`, grouped by `groups`.
- Keep the existing on-page **Fight Notes & Priorities** panel (`notes`) below everything.

## Linked highlight (tap-first)
- Tap/click a panel row → highlight its marker (ring/scale/pulse). Tap/click a marker → highlight
  its row and scroll it into view.
- **Tap is primary** (touch has no hover). Hover is a desktop-only enhancement behind
  `@media (hover: hover)`. Second tap / tap-elsewhere / Esc clears.
- A11y: rows and markers focusable; Enter/Space toggles, Esc clears; express the active link with
  `aria-current`/`aria-selected`; respect `prefers-reduced-motion`.

## Zone / quadrant labels (e.g. Lady Vashj A/B/C/D)
Some bosses divide the arena into named areas (Vashj P2 quadrants A–D). Those areas currently have
no on-map label, so the user can't tell which quadrant is which without cross-referencing the panel.
Add an optional, reusable **`zones`** field on the boss object:

`zones?: [{ id, label, x, y, group? }]` — `label` is the text (e.g. "A"), `x`/`y` the centroid in
image %, `group` the matching `groups` id (optional, for the highlight link).

- **Render each as a large, faint watermark letter** centered at its `x`/`y` — roughly 40–60px,
  ~25–35% opacity, neutral white/grey so it doesn't fight the red dividing lines or role-colored
  markers. Layer it **above the image but below the markers** (z-index between them) and mark it
  `aria-hidden` (the panel grouping already names the area for AT).
- **Must appear in BOTH export modes** — it's part of the map, so it's in the captured node.
- **Highlight link (reuses the existing system):** hover/tap a zone letter *or* its panel group
  header → highlight all markers whose `group` matches (and lightly emphasize the letter). This is
  cheap because it reuses the marker-highlight infra. Tinting the actual quadrant **area** (a
  translucent wedge) needs real region geometry per quadrant — treat that as a later nice-to-have,
  not part of this pass.
- **Backward compatible:** optional; bosses without `zones` are unaffected. Add `zones` to the
  contract in `PROJECT_PLAN.md` §3 when implemented.
- **Apply to Lady Vashj:** add zones A/B/C/D at the four quadrant centroids (place via a rendered
  overlay against `lady-vashj.jpg`, same as pin verification — don't eyeball), each linked to its
  quadrant `group`.

## Export (selectable, with a default)
- **Default — map + key:** export the clean marker map **and** the assignment rows (badge + role +
  name) composed into **one** image (key beside the map on wide aspect, stacked under on tall).
  Self-contained and overlap-proof at any density.
- **Toggle — names on map:** the *only* mode where names render on the map; paint them at each
  marker at export time (reuse the old span-swap path). Best for sparse fights; will crowd dense
  ones — user's choice. Surface as a small control by the Export button; persist in `localStorage`.
- html2canvas: ensure inline-SVG icons + badges render; clear any active highlight before capture.

## Backward compatibility
- `icon`, `sidebarOnly`, `notes` stay valid and used. `labelOnly` markers still render (map-only).
- `labelDx`/`labelDy` are **kept and repurposed** as marker declutter offsets (see "Crowded
  markers"); re-tune Karathress's smaller. Vashj / Void Reaver / Karathress must all still render
  and export correctly.

## Acceptance criteria
- No pin ever shows both a text label and a marker. No overlapping text on the map at any viewport
  (test ~375px wide AND desktop).
- Panel is docked (never covers markers) and collapsible; map fully visible when panel is collapsed.
- Tap a row ↔ tap a marker highlights both directions (works on touch); row scrolls into view.
- Export in both modes is self-contained and legible; default = map + key.
- Vashj, Void Reaver, Karathress all render + export correctly. `npm run build` passes; lint clean.

## Verification
- `npm run build`, then `npm run dev`; check all three bosses on desktop and a 375px emulation.
- Before/after mobile screenshots of Karathress + Vashj (the overlap cases).
- Export each boss in both modes; eyeball the PNGs.

## Coordination
Heavy edits to the shared `BossTemplate.jsx` + `.module.css`. Commit the current tree as a
checkpoint **before** starting; no other session should edit those files concurrently; land the
redesign as its own focused commit.
