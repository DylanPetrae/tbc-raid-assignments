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
- The `labelDx`/`labelDy` leader-line + offset rendering and the `.posDot`/`.leaders` machinery —
  no longer needed once labels are off the map. Leave the data fields parsed-but-ignored for back-
  compat; you may strip them from `data/bosses/fathom-lord-karathress.js`.

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
- `labelDx`/`labelDy` become no-ops (parsed, ignored). Vashj / Void Reaver / Karathress must all
  still render and export correctly.

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
