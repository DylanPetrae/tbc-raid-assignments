# Handoff: map-markers + linked assignment panel redesign

Spec for a Claude Code session to implement in this repo. Read `PROJECT_PLAN.md` first
(section 3 = the per-boss data contract; section 6 = decisions to preserve).

## Why
On mobile (narrow viewport) the on-map **text labels overlap badly**. The `labelDx`/`labelDy`
fan-out helps on desktop but doesn't scale down. Fix the root cause: stop putting text on the
map. Show **only markers** (colored dot + role icon + a short key badge) on the arena, move **all
names into a panel**, and link the two with interactive highlighting.

## Current state (what exists today)
- One shared client component `components/BossTemplate.jsx` + `BossTemplate.module.css`, driven by
  per-boss data files in `data/bosses/*.js` (see contract in `PROJECT_PLAN.md` §3).
- Pins currently render **on the map** as a colored tag (text) + optional name `<input>`, plus a
  duplicate **sidebar roster** grouped by `groups`. Export uses html2canvas with an `.exporting`
  swap (input → mirrored `<span>`), because it won't paint live form-control text.
- Optional pin fields already in the contract: `labelOnly`, `icon` (tank/healer/melee/ranged
  inline-SVG), `labelDx`/`labelDy` (label offset + dot + leader line), `sidebarOnly`. Plus a
  `notes` array → on-page "Fight Notes & Priorities" panel.

## Target UX
1. **Map = markers only.** Each positioned pin renders as a small colored dot (role color) with its
   role `icon` if present, and a short **key badge** (see Keys below). No text labels on the map.
   Drop the on-map text tag and the `labelDx`/`labelDy` leader-line rendering for screen display.
2. **Assignment panel** holds every assignment (the existing grouped roster is the basis). Each row:
   key badge + role dot/icon + `sidebarLabel` + the name `<input>`. Keep the current grouping
   (`groups`) and the `Fight Notes` panel.
3. **Bidirectional highlight (tap-first):**
   - Tap/click a panel row → highlight its map marker (scale/pulse/ring) and vice-versa.
   - Tap/click a map marker → highlight its panel row and scroll it into view.
   - **Hover is a desktop-only enhancement**, not required — the primary interaction is tap, since
     touch has no hover. Use `@media (hover: hover)` for hover affordances.
   - A second tap / tap-elsewhere / Esc clears the highlight.

### Keys (how a dot maps to a name)
Every map marker needs a stable visible identifier so the **static export** is legible:
- Add an optional `mapKey` string per pin (e.g. `"T1"`, `"H2"`, `"1"`). If absent, auto-assign a
  number in pin order. Render it as a tiny badge on the dot and as the leading badge on the panel
  row. (Council markers already encode kill order in their text — fold that into `mapKey`, e.g.
  Karathress council = `1`–`4`, so there's one numbering scheme, not two.)

## Export (selectable, with a default)
Default and recommended: **map + key**. Optional toggle: **names on map**.
- **Map + key (default):** export the clean marker map **and** a compact key/legend (the assignment
  rows: badge + role + name) composed into **one image**, so it's self-contained and never overlaps
  regardless of density. Layout: key beside the map on wide aspect, stacked under it on tall.
- **Names on map (toggle):** at export time only, paint names onto the map at each pin (reuse the
  existing `.exporting` span-swap / label path). Best readability on sparse fights; will crowd on
  dense ones — that's the user's call.
- Surface the choice as a small control near the existing "Export as image" button (e.g. a segmented
  toggle or a checkbox "Include names on map"). Persist the choice in `localStorage` like other prefs.
- html2canvas notes: the inline-SVG icons and the dot badges must be in the captured node; verify
  both export modes actually render (icons, badges, highlight state should NOT be captured —
  clear/﻿ignore active highlight during capture).

## Mobile & accessibility
- Tap targets ≥44px (panel rows already meet this; ensure map markers have a ≥44px hit area even if
  the visible dot is smaller — use a transparent padded hit box).
- Keyboard: panel rows and markers focusable; Enter/Space toggles highlight; Esc clears. Move focus
  sensibly (marker→row) so keyboard users get the same linking.
- Use `aria-current`/`aria-selected` (or `aria-describedby`) to express the active link; respect
  `prefers-reduced-motion` for the pulse/scroll animation (the project already has a reduced-motion
  block).

## Backward compatibility & migration
- All existing bosses must keep working. `labelOnly`, `icon`, `sidebarOnly`, `notes` stay valid.
- `labelDx`/`labelDy` become **no-ops for screen display** in the new model (markers don't need
  offset). Leave the fields parsed-but-ignored for now; optionally strip them from
  `data/bosses/fathom-lord-karathress.js` once the redesign lands. Don't break if present.
- `labelOnly` markers (boss position, DPS/melee/ranged zones) still render as map markers — they just
  won't have a panel input row (they're not in `groups`). Give them a `mapKey`/badge too if you want
  them keyed in the export legend, or render them as un-keyed zone markers — your call, document it.

## Acceptance criteria
- No overlapping text on the map at any viewport (test ~375px wide, e.g. iPhone SE, and desktop).
- Tap a panel row ↔ tap a marker: both directions highlight + (row) scroll into view; works on touch.
- Export in **both** modes produces a self-contained, legible PNG (icons + badges render; no stray
  highlight). Default mode = map + key.
- Vashj, Void Reaver, and Karathress all render correctly and export correctly.
- `npm run build` passes; lint clean.

## Verification
- `npm run build` + open `npm run dev`; check all three built bosses on desktop and a 375px mobile
  emulation. Take before/after screenshots of Karathress on mobile (the overlap case).
- Export each boss in both modes and eyeball the PNGs.

## Coordination
This heavily edits the shared `BossTemplate.jsx` + `.module.css`. Make sure no other session is
editing those concurrently. Commit the current tree as a checkpoint **before** starting, and commit
the redesign as its own focused commit.
