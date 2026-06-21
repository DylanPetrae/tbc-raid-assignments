// Boss listings for each raid. `ready: true` means a per-boss data file exists
// in /data/bosses/<slug>.js and the BossTemplate will render fully; otherwise
// the route shows a "coming soon" placeholder.

export const sscBosses = [
  { slug: "lady-vashj", name: "Lady Vashj", ready: true },
  { slug: "hydross-the-unstable", name: "Hydross the Unstable", ready: false },
  { slug: "the-lurker-below", name: "The Lurker Below", ready: false },
  { slug: "leotheras-the-blind", name: "Leotheras the Blind", ready: false },
  { slug: "fathom-lord-karathress", name: "Fathom-Lord Karathress", ready: false },
  { slug: "morogrim-tidewalker", name: "Morogrim Tidewalker", ready: false },
];

export const tkBosses = [
  { slug: "al-ar", name: "Al'ar", ready: false },
  { slug: "void-reaver", name: "Void Reaver", ready: false },
  { slug: "high-astromancer-solarian", name: "High Astromancer Solarian", ready: false },
  { slug: "kael-thas-sunstrider", name: "Kael'thas Sunstrider", ready: false },
];

export const raids = {
  ssc: { name: "Serpentshrine Cavern", short: "SSC", bosses: sscBosses },
  tk: { name: "Tempest Keep", short: "TK", bosses: tkBosses },
};
