# Handoff: finalize Fathom-Lord Karathress arena geometry

Task for a Claude Code session working directly in this repo.

## Context
- No-backend Next.js raid-assignment site. One shared component
  (`components/BossTemplate.jsx`) is driven by per-boss data files in `data/bosses/`.
- **Read `PROJECT_PLAN.md` first** — section 3 has the per-boss data contract and the
  "repeatable recipe for adding a boss," especially the geometry-driven, overlay-verified
  pin-placement rule: **never eyeball percentages.**

## What's already done
- `data/bosses/fathom-lord-karathress.js` exists, is registered in `data/bossData.js`,
  and passes the contract. The page (`/ssc/fathom-lord-karathress`) is live.
- Council fight modeled as:
  - **4 council markers**, `labelOnly: true` (map labels, no name input), purple, tagged
    with kill order: `1 · Tidalvess`, `2 · Sharkiss`, `3 · Caribdis`, `4 · Karathress`.
  - **3 tank inputs** (blue): Karathress+Sharkiss (main), Tidalvess+pet, Caribdis (pull far).
  - **6 healer inputs** (green): 2 main-tank, 1 Tidalvess, 1 Caribdis resto druid, 2 raid/float.
- The pin `x`/`y` in that file are **PROVISIONAL** placeholders, and `imageWidth`/`imageHeight`
  are unset. The file's header comment flags this.

## The image
- The arena screenshot should be at `public/images/ssc/fathom-lord-karathress.png`
  (dropped in manually). **It still has the original uploader's markers baked in** — it is
  NOT a clean plate. Use those markers as position references, and/or strip them for a clean
  background (movement arrows are fine to keep, per the recipe).
- WebP is the project standard now (Void Reaver was optimized 1.7 MB → 86 KB). Convert and
  update the data file's `image` field to match (`.png` → `.webp`).

## Your task
1. Confirm/convert the image; set the `image` field to the real path + extension.
2. Set `imageWidth`/`imageHeight` on the boss object (recently added to the contract) to the
   real plate dimensions so the fallback/aspect ratio is correct.
3. **Re-place every pin** against the actual image using a rendered overlay to verify (prior
   passes used PIL or `sharp` to draw pins at the %coords, then visually checked). Target
   layout: the 3 lords clustered with their tanks/healers nearby, Caribdis pulled far with her
   tank + resto druid, raid healers floating back. **Make sure labels don't overlap** — the
   Void Reaver boss/DPS-stack labels needed extra vertical spacing for exactly this reason.
4. Run `npm run build` to confirm `/ssc/fathom-lord-karathress` generates, and spot-check that
   Vashj + Void Reaver still render (`BossTemplate` is shared).
5. Update `PROJECT_PLAN.md`: flip the Karathress status row to done, bump progress to **3/10**,
   and add a changelog entry.

## Notes
- This was scaffolded from a community SSC cheat-sheet Google Sheet; the fight strategy and the
  healer split are documented in the data file's header comment.
- `labelOnly` pins render just their tag (no input, no export span) and are intentionally left
  out of `groups` so they don't appear in the sidebar roster.
