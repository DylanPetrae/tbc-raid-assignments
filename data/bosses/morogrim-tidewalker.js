// Morogrim Tidewalker (Serpentshrine Cavern). Built on the lady-vashj.js
// contract; uses labelOnly markers, role icons, and labelDx/labelDy fan-outs.
//
// Fight model (from the user's annotated reference + strategy video):
//  - Two phases: P1 100%→25%, P2 25%→0%.
//  - Morogrim is tanked center-right by the MAIN TANK (who keeps the boss's
//    frontal Tidal Wave pointed away from the raid). MELEE stack on him.
//  - The RAID (ranged DPS + the rest of the healers) stacks at the opposite
//    pillar, upper-right.
//  - An ADD TANK (paladin ideal) picks up the murloc packs that spawn from both
//    sides on Earthquake and drags them onto Morogrim's back for raid AoE.
//  - WATERY GRAVE bubbles 4 random players to the middle of the arena; a
//    dedicated healer sits at the foot of the ramp to reach all four.
//
// GEOMETRY: pin x/y read from the user's annotated reference
// (references/morogrim_arena_positions.png) via color/blob detection — the raid
// square, melee, add tank and the 4 watery-grave spawns were auto-detected; the
// main tank and ramp healer were placed from the user's description and
// confirmed. Verified against the clean plate with a rendered sharp overlay.
// The clean plate keeps the baked-in murloc spawn cards + Morogrim's icon.

const morogrim = {
  slug: "morogrim-tidewalker",
  name: "Morogrim Tidewalker",
  raidShort: "SSC",
  subtitle:
    "Coilfang Reservoir · Serpentshrine Cavern — tank & spank with murloc adds and Watery Grave",
  image: "/images/ssc/morogrim-tidewalker.webp",
  imageAlt: "Morogrim Tidewalker arena diagram",
  imageWidth: 1114,
  imageHeight: 627,

  roles: [
    { key: "blue", name: "Tank", desc: "Main tank on Morogrim · Add tank on the murlocs" },
    { key: "green", name: "Healer", desc: "Watery Grave healer at the foot of the ramp" },
    { key: "yellow", name: "Melee", desc: "Melee DPS stacked on Morogrim" },
    { key: "orange", name: "Ranged", desc: "Ranged DPS + remaining healers, opposite pillar" },
    { key: "red", name: "Watery Grave", desc: "Where the 4 graved players land (mid-arena)" },
  ],

  pins: [
    // Watery Grave spawn locations — map markers only (mechanic, not an assignment).
    { id: "grave1", role: "red", tag: "Grave", labelOnly: true, x: 25, y: 54 },
    { id: "grave2", role: "red", tag: "Grave", labelOnly: true, x: 41, y: 61 },
    { id: "grave3", role: "red", tag: "Grave", labelOnly: true, x: 41, y: 31 },
    { id: "grave4", role: "red", tag: "Grave", labelOnly: true, x: 46, y: 15 },

    // Tanks (fillable). Main tank sits directly below Morogrim's portrait; the
    // add tank's label is fanned up (leader line) so it doesn't cover the portrait.
    { id: "tank-mt", role: "blue", icon: "tank", tag: "Main Tank", sidebarLabel: "Main tank (on Morogrim)", x: 68, y: 63 },
    { id: "tank-add", role: "blue", icon: "tank", tag: "Add Tank", sidebarLabel: "Add tank (murlocs — paladin best)", x: 73, y: 54, labelDx: 5, labelDy: -7 },

    // Watery Grave healer (fillable) — middle of the bottom of the ramp.
    { id: "heal-wg", role: "green", icon: "healer", tag: "WG Healer", sidebarLabel: "Watery Grave healer (foot of ramp)", x: 51, y: 64 },

    // Group stack positions — map markers only.
    { id: "z-melee", role: "yellow", icon: "melee", tag: "Melee DPS", labelOnly: true, x: 69, y: 50, labelDx: -3, labelDy: -7 },
    { id: "z-raid", role: "orange", icon: "ranged", tag: "Ranged + Healers", labelOnly: true, x: 72, y: 37 },
  ],

  // Sidebar roster: tanks + the Watery Grave healer (map-only markers excluded).
  groups: [
    { id: "tanks", title: "Tanks", pins: ["tank-mt", "tank-add"] },
    { id: "healers", title: "Healers", pins: ["heal-wg"] },
  ],

  // Fight priorities surfaced in the on-page "Fight Notes & Priorities" panel.
  notes: [
    {
      heading: "Phase 1 (100% → 25%)",
      items: [
        "Tidal Wave — frontal frost cone that adds a 15-sec attack-speed slow to anyone hit. Keep the boss pointed away from the raid.",
        "Watery Grave — bubbles 4 random players to the middle of the arena, stuns them, and deals fall damage on landing. The ramp healer covers them.",
        "Earthquake — 4,000 damage to the whole raid and summons two packs of 6 murlocs, one from each side.",
      ],
    },
    {
      heading: "Phase 2 (25% → 0%)",
      items: [
        "No more Watery Grave — Earthquake and the murloc summons continue.",
        "Water Globules replace the bubbles: they chase their target and only explode on that player, not on random raiders.",
        "When a globule closes on the raid, the tank kites it away. Otherwise just keep tanking and spanking until he dies.",
      ],
    },
    {
      heading: "Murlocs (Earthquake adds)",
      items: [
        "They're drawn to healers by aggro — the add tank must grab them ASAP or they melt a healer. Paladin is the best add tank (AoE threat).",
        "Drag the packs onto Morogrim's back and AoE them down fast (level 71, low health post-nerf).",
        "Hunters can frost-trap both packs to buy pickup time. A prot paladin can build murloc threat by healing a life-tapping warlock.",
      ],
    },
    {
      heading: "Tanks & tips",
      items: [
        "2–3 tanks: beefiest on Morogrim, the others on murlocs. Add tanks gear fully for threat (cap ~5.2% to be crit-immune vs level-71 mobs).",
        "Keep Thunderclap + Demo Shout on the boss — he hits hard; reducing incoming damage helps.",
        "A third tank helps if the add tank gets Watery Graved while the murlocs are out.",
      ],
    },
  ],
};

export default morogrim;
