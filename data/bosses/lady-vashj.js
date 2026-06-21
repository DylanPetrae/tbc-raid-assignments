// Lady Vashj (Serpentshrine Cavern) — ported 1:1 from the validated
// vashj_position_template.html prototype. Pin x/y are percentages of the
// image's width/height, taken directly from the prototype's geometry work
// (platform center, dividing-line angles, crystal/generator cluster).

const vashj = {
  slug: "lady-vashj",
  name: "Lady Vashj",
  raidShort: "SSC",
  subtitle: "Coilfang Reservoir · Serpentshrine Cavern — fill in names, then export or save",
  image: "/images/ssc/lady-vashj.jpg",
  imageAlt: "Lady Vashj platform diagram",
  imageWidth: 520,
  imageHeight: 931,

  roles: [
    { key: "white", name: "White", desc: "Strider kiter (perimeter)" },
    { key: "red", name: "Red", desc: "Tainted Core runners (2 per quadrant)" },
    { key: "yellow", name: "Yellow", desc: "Healer disabling the generator" },
  ],

  pins: [
    { id: "kiter", role: "white", tag: "Kiter", sidebarLabel: "Kiter", x: 18, y: 30 },

    { id: "a1", role: "red", tag: "A · Core 1", sidebarLabel: "Core Runner 1", x: 56.4, y: 24.5 },
    { id: "a2", role: "red", tag: "A · Core 2", sidebarLabel: "Core Runner 2", x: 56.4, y: 31.0 },
    { id: "ah", role: "yellow", tag: "A · Healer", sidebarLabel: "Generator Healer", x: 65.5, y: 40.0 },

    { id: "b1", role: "red", tag: "B · Core 1", sidebarLabel: "Core Runner 1", x: 78.0, y: 46.5 },
    { id: "b2", role: "red", tag: "B · Core 2", sidebarLabel: "Core Runner 2", x: 78.0, y: 52.5 },
    { id: "bh", role: "yellow", tag: "B · Healer", sidebarLabel: "Generator Healer", x: 66.5, y: 57.5 },

    { id: "c1", role: "red", tag: "C · Core 1", sidebarLabel: "Core Runner 1", x: 34.2, y: 64.5 },
    { id: "c2", role: "red", tag: "C · Core 2", sidebarLabel: "Core Runner 2", x: 34.2, y: 70.5 },
    { id: "ch", role: "yellow", tag: "C · Healer", sidebarLabel: "Generator Healer", x: 39.5, y: 58.0 },

    { id: "d1", role: "red", tag: "D · Core 1", sidebarLabel: "Core Runner 1", x: 13.0, y: 46.0 },
    { id: "d2", role: "red", tag: "D · Core 2", sidebarLabel: "Core Runner 2", x: 13.0, y: 52.0 },
    { id: "dh", role: "yellow", tag: "D · Healer", sidebarLabel: "Generator Healer", x: 33.0, y: 41.0 },
  ],

  groups: [
    { id: "kiter-group", title: "Strider Kiter", pins: ["kiter"] },
    { id: "quad-a", title: "Quadrant A", pins: ["a1", "a2", "ah"] },
    { id: "quad-b", title: "Quadrant B", pins: ["b1", "b2", "bh"] },
    { id: "quad-c", title: "Quadrant C", pins: ["c1", "c2", "ch"] },
    { id: "quad-d", title: "Quadrant D", pins: ["d1", "d2", "dh"] },
  ],
};

export default vashj;
