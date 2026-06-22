import ladyVashj from "./bosses/lady-vashj";
import voidReaver from "./bosses/void-reaver";
import karathress from "./bosses/fathom-lord-karathress";
import morogrim from "./bosses/morogrim-tidewalker";

// Registry of fully-built boss templates, keyed by slug. Add an entry here once
// a boss's data file exists — bosses.js derives each boss's `ready` state from
// this registry, so no second edit is needed.
export const bossDataBySlug = {
  "lady-vashj": ladyVashj,
  "void-reaver": voidReaver,
  "fathom-lord-karathress": karathress,
  "morogrim-tidewalker": morogrim,
};
