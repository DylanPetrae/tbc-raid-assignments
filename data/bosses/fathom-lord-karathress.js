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
    { key: "green", name: "Healer", desc: "Caribdis tank healer + raid healers mid-ramp" },
    { key: "red", name: "Melee", desc: "Melee DPS — right of the main stack" },
    { key: "orange", name: "Ranged", desc: "Ranged DPS — mid-ramp with the raid healers" },
  ],

  // x/y are the TRUE positions detected from the user's annotated reference
  // (fathom-lord-karathress-positions.png). The bottom group (tanks, council,
  // melee) genuinely stacks in a small area, so each of those carries a
  // labelDx/labelDy that fans its LABEL out (with a dot + leader line marking
  // the real spot) to keep the cluster readable. The center square (ranged +
  // raid healers) and the lone Caribdis healer aren't crowded, so no offset.
  pins: [
    // Council members — map markers only (no name input). Tag = kill order.
    { id: "m-karathress", role: "purple", tag: "4 · Karathress", labelOnly: true, x: 57, y: 76.5, labelDx: -4, labelDy: 10 },
    { id: "m-sharkiss", role: "purple", tag: "2 · Sharkiss", labelOnly: true, x: 56.8, y: 68.6, labelDx: -10, labelDy: -6 },
    { id: "m-tidalvess", role: "purple", tag: "1 · Tidalvess", labelOnly: true, x: 65.3, y: 72.2, labelDx: 2, labelDy: -8 },
    { id: "m-caribdis", role: "purple", tag: "3 · Caribdis", labelOnly: true, x: 97, y: 49, labelDx: -12, labelDy: -1 },

    // Tanks (fillable)
    { id: "tank-ks", role: "blue", icon: "tank", tag: "MT", sidebarLabel: "Karathress + Sharkiss tank", x: 53, y: 75, labelDx: -9, labelDy: 2 },
    { id: "tank-tid", role: "blue", icon: "tank", tag: "Tank", sidebarLabel: "Tidalvess tank", x: 69.2, y: 71.7, labelDx: 9, labelDy: 3 },
    { id: "tank-car", role: "blue", icon: "tank", tag: "Tank", sidebarLabel: "Caribdis tank (far-right hallway)", x: 97.4, y: 58, labelDx: -10, labelDy: 3 },

    // Caribdis tank's healer (fillable) — back from Caribdis, still in raid range.
    { id: "heal-car", role: "green", icon: "healer", tag: "Heal", sidebarLabel: "Caribdis tank's healer", x: 83.8, y: 39.3 },

    // Group stack positions — map markers only (no individual name input).
    { id: "z-melee", role: "red", icon: "melee", tag: "Melee DPS", labelOnly: true, x: 61.4, y: 73.1, labelDx: 5, labelDy: 10 },
    { id: "z-ranged", role: "orange", icon: "ranged", tag: "Ranged DPS", labelOnly: true, x: 57, y: 44 },
    { id: "z-raidheal", role: "green", icon: "healer", tag: "Raid Healers", labelOnly: true, x: 64, y: 49.5 },
  ],

  // Only the fillable assignments (tanks + Caribdis healer) appear in the sidebar.
  groups: [
    { id: "tanks", title: "Tanks", pins: ["tank-ks", "tank-tid", "tank-car"] },
    { id: "healers", title: "Healers", pins: ["heal-car"] },
  ],
};

export default karathress;
