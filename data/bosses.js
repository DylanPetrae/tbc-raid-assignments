// Boss listings for each raid. A boss is "ready" (renders a full BossTemplate
// instead of a "coming soon" placeholder) iff a per-boss data file is registered
// in /data/bossData.js. `ready` is derived from that registry — single source of
// truth — so adding a boss only requires registering its data file there.

import { bossDataBySlug } from "./bossData";

const withReady = (list) =>
  list.map((b) => ({ ...b, ready: Boolean(bossDataBySlug[b.slug]) }));

export const sscBosses = withReady([
  { slug: "lady-vashj", name: "Lady Vashj" },
  { slug: "hydross-the-unstable", name: "Hydross the Unstable" },
  { slug: "the-lurker-below", name: "The Lurker Below" },
  { slug: "leotheras-the-blind", name: "Leotheras the Blind" },
  { slug: "fathom-lord-karathress", name: "Fathom-Lord Karathress" },
  { slug: "morogrim-tidewalker", name: "Morogrim Tidewalker" },
]);

export const tkBosses = withReady([
  { slug: "al-ar", name: "Al'ar" },
  { slug: "void-reaver", name: "Void Reaver" },
  { slug: "high-astromancer-solarian", name: "High Astromancer Solarian" },
  { slug: "kael-thas-sunstrider", name: "Kael'thas Sunstrider" },
]);

export const raids = {
  ssc: { name: "Serpentshrine Cavern", short: "SSC", bosses: sscBosses },
  tk: { name: "Tempest Keep", short: "TK", bosses: tkBosses },
};
