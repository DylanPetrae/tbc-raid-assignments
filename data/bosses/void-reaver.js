// Void Reaver (Tempest Keep — The Eye). Built from the lady-vashj.js contract.
//
// Fight model (per officer brief):
//  - One TANK holds Void Reaver near the middle of the inner circle.
//  - VOID REAVER (the boss) is marked for reference; he faces the tank.
//  - The DPS STACK is every remaining raid member stacked immediately behind
//    the boss. It's a position, not a named assignment — so it's a map LABEL
//    with no name input (labelOnly).
//  - Three ORB BAITERS sit OUTSIDE the inner circle, spread apart. Void Reaver
//    periodically hurls an Arcane Orb at one of them; that player baits it onto
//    themselves and strafes clear so the raid never gets hit, then returns for
//    the next orb (the "dance"). They never want to be hit — hence "baiter".
//
// GEOMETRY: pin x/y verified against the arena screenshot
// (public/images/tk/void-reaver.webp, 1672x941) via a rendered pin overlay.
// The tank holds Void Reaver just off-center; the boss + DPS markers sit tightly
// together (~4 yards apart, since the DPS stack is right on his back in-game) just
// above-and-left of the tank, clear of the tank's name-input box. The boss/DPS
// pair is offset only enough that their two labels don't collide at display size —
// any tighter and the tags overlap. Baiters numbered 1→2→3 left to right.

const voidReaver = {
  slug: "void-reaver",
  name: "Void Reaver",
  raidShort: "TK",
  subtitle:
    "Tempest Keep · The Eye — tank the boss center, raid stacks behind, 3 orb baiters work the outer ring",
  image: "/images/tk/void-reaver.webp",
  imageAlt: "Void Reaver arena diagram — central circle platform",
  imageWidth: 1672,
  imageHeight: 941,

  roles: [
    { key: "blue", name: "Tank", desc: "Holds Void Reaver in the inner circle" },
    { key: "purple", name: "Void Reaver", desc: "The boss — faces the tank (reference marker)" },
    { key: "red", name: "DPS Stack", desc: "All remaining raid, stacked behind the boss" },
    { key: "yellow", name: "Orb Baiter", desc: "Outside the circle; bait the orb, strafe clear, then reset" },
  ],

  pins: [
    { id: "tank", role: "blue", tag: "Tank", sidebarLabel: "Main Tank", x: 60, y: 62 },
    { id: "boss", role: "purple", tag: "Void Reaver", labelOnly: true, x: 54, y: 52 },
    { id: "dps", role: "red", tag: "DPS Stack", labelOnly: true, x: 50, y: 46.5 },

    { id: "orb1", role: "yellow", tag: "Orb 1", sidebarLabel: "Orb Baiter 1", x: 16, y: 76 },
    { id: "orb2", role: "yellow", tag: "Orb 2", sidebarLabel: "Orb Baiter 2", x: 32, y: 25 },
    { id: "orb3", role: "yellow", tag: "Orb 3", sidebarLabel: "Orb Baiter 3", x: 82, y: 28 },
  ],

  // Only fillable assignments appear in the sidebar roster. The boss + DPS-stack
  // markers are map-only labels, so they're intentionally not grouped here.
  groups: [
    { id: "tank-group", title: "Tank", pins: ["tank"] },
    { id: "orb-group", title: "Orb Baiters", pins: ["orb1", "orb2", "orb3"] },
  ],
};

export default voidReaver;
