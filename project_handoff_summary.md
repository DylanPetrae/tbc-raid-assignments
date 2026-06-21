# TBC Classic Raid Position Templates — Project Handoff

## Background
I run a WoW TBC Classic guild and want a website with fillable boss-position
templates: a platform diagram per boss, with labeled boxes officers type
player names into, that can be exported as an image or saved/reloaded as a
roster file. We already built and validated one of these (Lady Vashj, SSC)
as a standalone HTML file — attached alongside this summary
(`vashj_position_template.html`). It works well and is the reference
implementation for everything else.

## Goal for this phase
Turn the single Vashj HTML file into a proper multi-page Next.js website,
deployed on Vercel, covering all bosses in **Serpentshrine Cavern (SSC)**
and **Tempest Keep (TK)**. Kara/Gruul's/Mag/Hyjal/BT/Sunwell are explicitly
out of scope for now — add only if asked later.

## Decisions already made (don't re-litigate these)
- **Stack:** Next.js, deployed on Vercel.
- **Scope (v1):** SSC (6 bosses: Hydross, Lurker Below, Leotheras, Fathom-Lord
  Karathress, Morogrim Tidewalker, Lady Vashj) + TK (4 bosses: Al'ar,
  Void Reaver, High Astromancer Solarian, Kael'thas Sunstrider).
- **Architecture:** One shared boss-template component, fed by a small
  per-boss data file (image path + array of pin objects: id, role color,
  label, x%, y%). NOT copy-pasted HTML per boss — that was explicitly
  rejected as unmaintainable across 10 bosses.
- **Roster/names:** Free-text input, no backend, no database. Confirmed
  Blizzard's Classic guild roster API is unreliable/broken (verified via
  web search — Classic Era and Cata Classic roster endpoints have known,
  long-standing outages), so we're not pursuing live roster sync. Officers
  type names by hand each week, same as the Vashj prototype.
- **Repo:** User has a GitHub account, hasn't created the repo yet. User
  has a Vercel account already.

## What the Vashj prototype already solved (carry these lessons forward)
1. **Pin placement is geometry-driven, not guessed.** For Vashj we detected
   the platform's actual center, the red dividing-line angles, and the
   crystal/generator cluster positions via OpenCV color thresholding on the
   source screenshot, then computed pin coordinates from that geometry so
   labels land inside the correct quadrant, away from dividing lines, and
   don't overlap each other or the perimeter circle. When adding new boss
   images, don't eyeball pin percentages — inspect the image first (center
   point, key landmarks) before placing pins, and verify with a rendered
   overlay before calling it done.
2. **Quadrant/letter mapping must match the user's actual callouts, not an
   assumed default.** We had a bug where "A/B/C/D" didn't match the
   directions the user actually uses in raid. Confirm labeling against
   a reference image from the user before building.
3. **Core-runner pairs render as a stacked pair in the outer ring of their
   quadrant; healers render near the inner-ring edge, just outside the
   generator/crystal cluster** (not on top of it). This is Vashj-specific
   positioning logic but the *pattern* — role-based placement relative to
   named landmarks — will recur for other bosses with similar "stand near
   X" mechanics.
4. **Export-as-image bug (already fixed in the attached file):** the
   original version used `html2canvas` to screenshot the live `<input>`
   elements directly, which caused text to render outside/clipped from its
   box (html2canvas doesn't reliably paint form control text). Fixed by
   adding a parallel `<span class="name-display">` per pin that mirrors the
   input's value via JS, toggling an `.exporting` class on the container
   that hides inputs and shows the display spans only during the
   `html2canvas` capture. This pattern should be reused (or built into the
   shared template) for every boss page — don't let new boss pages
   reintroduce the same input-export bug.
5. **Template features to preserve in the shared component:**
   - Click/type names directly on pins overlaid on the boss image, AND a
     synced sidebar list of the same inputs (useful for mobile/accessibility).
   - "Export as image" → PNG download via html2canvas (using the
     display-span fix above).
   - "Save roster" → downloads current name-fill as a small JSON file.
   - "Load roster" → re-uploads that JSON to refill the template next week.
   - "Clear all" → wipes all names with a confirm prompt.
   - Color-coded roles (e.g., white/red/yellow) with a legend.
   - Week label field, used in export/save filenames.

## What's NOT done yet / what Claude Code should actually build
1. Scaffold a Next.js app, structured as:
   ```
   /                 → homepage linking to SSC and TK
   /ssc              → SSC boss list page
   /ssc/[boss-slug]  → individual boss template pages (6 total)
   /tk               → TK boss list page
   /tk/[boss-slug]   → individual boss template pages (4 total)
   ```
2. Build the shared `BossTemplate` component generalized from the attached
   Vashj HTML (port the pin overlay, sidebar sync, export/save/load/clear
   logic, and the display-span export fix into reusable React code).
3. Convert the Vashj HTML into the first per-boss data file using the new
   shared component, to prove the abstraction works before building the
   other 9 bosses.
4. For each remaining boss (Hydross, Lurker, Leotheras, Fathom-Lord
   Karathress, Morogrim, Al'ar, Void Reaver, Solarian, Kael'thas): will need
   a clean platform/arena screenshot per boss (not yet sourced) and pin
   geometry worked out per the process in point 1 above. This is the bulk
   of remaining work — each boss needs its own positioning logic since
   mechanics differ.
5. Set up the GitHub repo and Vercel deployment. User is starting from
   scratch on git — needs literal step-by-step commands, not just
   instructions, the first time through.
6. Decide on basic site styling/nav once there's more than one page (the
   Vashj prototype's dark fantasy theme is a fine starting point/reference).

## Attached
- `vashj_position_template.html` — the working single-file prototype,
  fully functional, export bug already fixed. Use as the reference
  implementation when building the shared component, and as the source
  for the first boss data file.
