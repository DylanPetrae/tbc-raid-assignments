import ladyVashj from "./bosses/lady-vashj";

// Registry of fully-built boss templates, keyed by slug. Add an entry here
// (and a matching ready: true in bosses.js) once a boss's data file exists.
export const bossDataBySlug = {
  "lady-vashj": ladyVashj,
};
