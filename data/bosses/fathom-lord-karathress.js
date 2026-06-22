// Fathom-Lord Karathress (Serpentshrine Cavern). Built from the lady-vashj.js
// contract; uses the labelOnly pin feature added for Void Reaver.
//
// Fight model (from the SSC cheat sheet + the user's raid strategy):
//  - Council fight, 4 mobs. Kill order: Tidalvess (1) → Sharkiss (2) →
//    Caribdis (3, skippable) → Karathress (4). Karathress dying ends the fight.
//  - The main tank holds KARATHRESS + SHARKISS together at the top of the
//    central ramp; both face the tank. Melee DPS stack to their right.
//  - TIDALVESS is tanked to the right of the melee, facing right (own tank).
//  - CARIBDIS is pulled out to the far-right hallway entrance to break line of
//    sight from the boss/other guards; her tank holds her there, and her healer
//    stands a little back into the room so they can still reach the raid.
//  - Ranged DPS + the rest of the healers sit mid-ramp, center of the room.
//  - Healers (video weighting): Tidalvess tank is the heaviest (2), then the
//    K+Sharkiss main tank (2), 1 dedicated Caribdis healer who floats to the
//    raid, and 1 raid/float healer. Only Caribdis's healer is positioned on the
//    map (she's away from the group); the rest are sidebarOnly assignments.
//  - Full priorities live in the `notes` array → on-page Fight Notes panel.
//
// GEOMETRY: pin x/y verified against the clean arena plate
// (public/images/ssc/fathom-lord-karathress.webp, 1681x935) with a rendered
// sharp overlay, placed from the user's spatial description. (An earlier pass
// used a marker-laden cheat-sheet screenshot whose center overlay turned out to
// be a legend, not positions — replaced with this clean top-down plate.)

const karathress = {
  slug: "fathom-lord-karathress",
  name: "Fathom-Lord Karathress",
  raidShort: "SSC",
  subtitle:
    "Coilfang Reservoir · Serpentshrine Cavern — council fight: 3 tanks, Caribdis pulled for line-of-sight",
  image: "/images/ssc/fathom-lord-karathress.webp",
  imageAlt: "Fathom-Lord Karathress council room diagram",
  imageWidth: 1681,
  imageHeight: 935,

  roles: [
    { key: "purple", name: "Council", desc: "The 4 mobs — number shows kill order" },
    { key: "blue", name: "Tank", desc: "K+Sharkiss (main), Tidalvess, Caribdis (pull far)" },
    { key: "green", name: "Healer", desc: "2 main-tank · 2 Tidalvess · 1 Caribdis · 1 raid (see assignments)" },
    { key: "red", name: "Melee", desc: "Melee DPS — right of the main stack" },
    { key: "orange", name: "Ranged", desc: "Ranged DPS — mid-ramp with the raid healers" },
  ],

  // x/y are the TRUE positions detected from the user's annotated reference
  // (references/fathom-lord-karathress-positions.png). The bottom group (tanks,
  // council, melee) genuinely stacks in a small area, so each of those carries a
  // SMALL labelDx/labelDy that nudges its MARKER out of the pile (a dot + leader
  // line mark the real spot). These are re-tuned much smaller than the old
  // wide-label fan-out — a dot + 2-char badge needs only a fraction of the nudge.
  // The far-right Caribdis pair is also pulled left so the markers don't clip the
  // frame edge. The center square (ranged + raid healers) and the lone Caribdis
  // healer aren't crowded, so no offset.
  pins: [
    // Council members — map markers only (no name input). mapKey = kill order, so
    // the marker badge reads 1–4 (matching the tag) instead of an auto "C#".
    { id: "m-karathress", role: "purple", mapKey: "4", tag: "4 · Karathress", labelOnly: true, x: 57, y: 76.5, labelDx: -2, labelDy: 4 },
    { id: "m-sharkiss", role: "purple", mapKey: "2", tag: "2 · Sharkiss", labelOnly: true, x: 56.8, y: 68.6, labelDx: -3, labelDy: -4 },
    { id: "m-tidalvess", role: "purple", mapKey: "1", tag: "1 · Tidalvess", labelOnly: true, x: 65.3, y: 72.2, labelDx: -1, labelDy: -5 },
    { id: "m-caribdis", role: "purple", mapKey: "3", tag: "3 · Caribdis", labelOnly: true, x: 97, y: 49, labelDx: -6, labelDy: -2 },

    // Tanks (fillable)
    { id: "tank-ks", role: "blue", icon: "tank", tag: "MT", sidebarLabel: "Karathress + Sharkiss tank", x: 53, y: 75, labelDx: -4, labelDy: 1 },
    { id: "tank-tid", role: "blue", icon: "tank", tag: "Tank", sidebarLabel: "Tidalvess tank", x: 69.2, y: 71.7, labelDx: 5, labelDy: 1 },
    { id: "tank-car", role: "blue", icon: "tank", tag: "Tank", sidebarLabel: "Caribdis tank (far-right hallway)", x: 97.4, y: 58, labelDx: -7, labelDy: 1 },

    // Healers. Only Caribdis's healer has a map position (she's pulled away from
    // the group); the rest are roster assignments only (sidebarOnly = no map pin).
    // Weighting per the video: Tidalvess tank is the heaviest (windfury + frost
    // shock), the main K+Sharkiss tank next, Caribdis's healer floats to raid.
    // cardLabel is the short label used in the on-image "Healers" overlay card.
    { id: "heal-car", role: "green", icon: "healer", tag: "Heal", sidebarLabel: "Caribdis tank's healer (floats to raid)", cardLabel: "Caribdis", x: 83.8, y: 39.3 },
    { id: "heal-mt1", role: "green", sidebarOnly: true, sidebarLabel: "Main-tank healer 1 (K + Sharkiss)", cardLabel: "MT 1" },
    { id: "heal-mt2", role: "green", sidebarOnly: true, sidebarLabel: "Main-tank healer 2 (K + Sharkiss)", cardLabel: "MT 2" },
    { id: "heal-tid1", role: "green", sidebarOnly: true, sidebarLabel: "Tidalvess healer 1", cardLabel: "Tidal 1" },
    { id: "heal-tid2", role: "green", sidebarOnly: true, sidebarLabel: "Tidalvess healer 2", cardLabel: "Tidal 2" },
    { id: "heal-raid1", role: "green", sidebarOnly: true, sidebarLabel: "Raid / float healer", cardLabel: "Raid" },

    // Group stack positions — map markers only (no individual name input).
    { id: "z-melee", role: "red", icon: "melee", tag: "Melee DPS", labelOnly: true, x: 61.4, y: 73.1, labelDx: 2, labelDy: 6 },
    { id: "z-ranged", role: "orange", icon: "ranged", tag: "Ranged DPS", labelOnly: true, x: 57, y: 44 },
    { id: "z-raidheal", role: "green", icon: "healer", tag: "Raid Healers", labelOnly: true, x: 64, y: 49.5 },
  ],

  // Sidebar roster: tanks + all healers (map-only council/zone markers excluded).
  groups: [
    { id: "tanks", title: "Tanks", pins: ["tank-ks", "tank-tid", "tank-car"] },
    {
      id: "healers",
      title: "Healers",
      pins: ["heal-mt1", "heal-mt2", "heal-tid1", "heal-tid2", "heal-car", "heal-raid1"],
    },
  ],

  // Note: grouped healers are sidebarOnly (no map pin); their names reach the PNG
  // via the map+key export's key panel (the old on-image overlay card was dropped
  // in the v2 redesign — no floating overlays on the map). `cardLabel` is retained
  // for the compact label used in that export key.

  // Fight priorities surfaced in the on-page "Fight Notes & Priorities" panel.
  // Sourced from the user's strategy video for the current (post-nerf) tier.
  notes: [
    {
      heading: "Kill order",
      items: [
        "Spitfire Totem always first — the whole raid stops and kills it on sight (AoE fire on random targets).",
        "Then Tidalvess or Sharkiss (your call), then the other. Killing Sharkiss first removes his Leeching Throw (mana/health drain, not dispellable).",
        "Caribdis is optional/skippable.",
        "Karathress last — the fight ends when he dies.",
      ],
    },
    {
      heading: "Priorities & mechanics",
      items: [
        "75% rule: if Karathress reaches 75% while any lord is alive he gains Blessing of the Tides (+65% damage & speed, stacks per living lord). Kill the lords before pushing him past 75%.",
        "When a lord dies, Karathress absorbs its main mechanic. None of the lords are tauntable.",
        "Caribdis: interrupt her heals and keep Curse of Tongues on her (her heal is a 1-sec cast without it).",
        "Sharkiss: pets can be taunted — the least-damaged tank grabs them. Karathress: Cataclysmic Bolt hits a random mana user for 50% HP + 1s stun; Sear Nova is melee-range fire.",
      ],
    },
    {
      heading: "Opener",
      items: [
        "First misdirect goes to the Caribdis tank so she's pulled far enough to dodge the 45-yd Waterbolt Volley.",
        "Extra hunters misdirect Tidalvess and Sharkiss to their tanks; the main tank picks up Karathress naturally.",
        "Bloodlust at the start if killing all lords, or at 75% if keeping Caribdis up.",
      ],
    },
    {
      heading: "Tank & healer tips",
      items: [
        "Tidalvess tank takes the most (2–4.5k swings + windfury procs + ~5.5k frost shock) — weight healers here (2–3).",
        "Sharkiss is light (~2k/swing); Caribdis hits soft, so her healer can float to the raid and other tanks.",
        "Tanks: stack stamina/mitigation and use Nightmare Seeds (Tidalvess tank at the start; Caribdis tank below 75% if not killing her).",
        "DPS watch threat on passive AoE and pet spawns. Warriors: Thunderclap + Demo Shout.",
      ],
    },
  ],
};

export default karathress;
