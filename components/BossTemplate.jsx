"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import styles from "./BossTemplate.module.css";

// Shared boss-position template. Fed entirely by a per-boss data object
// (see /data/bosses/lady-vashj.js for the reference shape): image, an array
// of pins (id, role color key, tag, sidebarLabel, x%, y%), groups (how pins
// are bucketed in the sidebar roster panel), and roles (legend entries).
//
// Two-layer map model:
//  - MARKER LAYER (always on, every viewport): each positioned pin renders as a
//    small role-colored marker (dot + role icon + a short KEY BADGE). This is the
//    canonical, tappable representation and the only thing shown on mobile.
//  - LABEL LAYER (desktop only, hidden under the mobile breakpoint via CSS): the
//    old tag + name <input>, positioned with labelDx/labelDy + leader line. Names
//    overlapping on narrow screens was the original problem, so the label layer is
//    suppressed there and the panel becomes the single source for names.
//  Tapping a marker highlights its panel row (and scrolls it into view) and vice
//  versa, so a dot and a name are always linkable even with no on-map text.
//
// Carries forward the Vashj-prototype lessons:
//  - pin inputs are mirrored by a hidden <span class="name-display"> shown (and
//    the <input> hidden) only while exporting, because html2canvas does not
//    reliably paint live form-control text.
//  - "Export as image" / "Save roster" / "Load roster" / "Clear all" all operate
//    on the same in-memory state object, keyed by pin id.

// Optional generic role glyphs for pins that set an `icon` key. Inline SVG
// (not external assets) so they inherit the current color via currentColor and
// render reliably under html2canvas at export. Generic on purpose — tank /
// healer / melee / ranged — so they're reusable across every boss.
function RoleIcon({ icon }) {
  if (!icon) return null;
  const common = {
    viewBox: "0 0 16 16",
    width: "1.05em",
    height: "1.05em",
    "aria-hidden": true,
    focusable: "false",
    style: { verticalAlign: "-0.14em", flexShrink: 0 },
  };
  switch (icon) {
    case "tank": // shield
      return (
        <svg {...common} fill="currentColor">
          <path d="M8 1l5.5 2v4.2c0 3.7-2.4 6-5.5 7.3C4.9 13.2 2.5 10.9 2.5 7.2V3L8 1z" />
        </svg>
      );
    case "healer": // cross
      return (
        <svg {...common} fill="currentColor">
          <path d="M6.3 2h3.4v4.3H14v3.4H9.7V14H6.3V9.7H2V6.3h4.3V2z" />
        </svg>
      );
    case "melee": // crossed swords
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
          <path d="M3 3l10 10M13 3L3 13" />
        </svg>
      );
    case "ranged": // arrow
      return (
        <svg {...common} fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 13L13 3M13 3H8.5M13 3V7.5" />
        </svg>
      );
    default:
      return null;
  }
}

export default function BossTemplate({ boss }) {
  const [values, setValues] = useState({});
  const [week, setWeek] = useState("");
  // null when idle; "mapkey" or "names" while a PNG is being captured.
  const [capture, setCapture] = useState(null);
  // The pin currently highlighted by a marker/panel tap (links the two layers).
  const [activeId, setActiveId] = useState(null);
  // Preferred export composition: "mapkey" (clean markers + a key panel) or
  // "names" (names painted on the map). Persisted per browser like other prefs.
  const [exportMode, setExportMode] = useState("mapkey");
  // Roster panel can be folded (mainly for mobile) to reveal the whole map.
  const [rosterOpen, setRosterOpen] = useState(true);
  // Autosave status: "" (nothing), "restored" (loaded a previous fill on mount),
  // or "saved" (the current fill is persisted).
  const [saveStatus, setSaveStatus] = useState("");
  // Snapshot of the fill before the last "Clear all", so it can be undone.
  const [undoData, setUndoData] = useState(null);
  // True if the boss image failed to load (e.g. asset not added yet).
  const [imgError, setImgError] = useState(false);
  const exportRootRef = useRef(null);
  const undoTimer = useRef(null);
  // Panel-row elements keyed by pin id, so a marker tap can scroll the row in.
  const rowRefs = useRef({});
  // Gate the autosave effect so it doesn't clobber storage on the very first
  // commit (before the load effect has had a chance to restore).
  const hasMounted = useRef(false);

  const pinById = useMemo(
    () => Object.fromEntries(boss.pins.map((p) => [p.id, p])),
    [boss]
  );
  const roleByKey = useMemo(
    () => Object.fromEntries(boss.roles.map((r) => [r.key, r])),
    [boss]
  );
  const storageKey = `tbc-raid:roster:${boss.slug}`;
  const exportModeKey = `tbc-raid:exportmode:${boss.slug}`;
  // CSS aspect-ratio string from the boss's real image dimensions, used to size
  // the missing-image fallback to the right shape.
  const imageRatio =
    boss.imageWidth && boss.imageHeight
      ? `${boss.imageWidth} / ${boss.imageHeight}`
      : undefined;
  // Landscape plates get the export key beside the map; portrait plates stack it
  // underneath (Vashj is the only portrait boss so far).
  const keyBeside =
    !boss.imageWidth || !boss.imageHeight || boss.imageWidth >= boss.imageHeight;

  // Key badge per on-map pin. Letter = role.keyLetter, else the role name's
  // initial (never hardcoded) — indexed (1,2,3…) only when a letter has >1 on-map
  // member. An explicit pin.mapKey overrides everything (e.g. council kill order).
  const badges = useMemo(() => {
    const onMap = boss.pins.filter((p) => !p.sidebarOnly);
    const letterFor = {};
    const counts = {};
    for (const p of onMap) {
      if (p.mapKey) continue;
      const role = roleByKey[p.role];
      const letter = (role?.keyLetter || role?.name?.[0] || p.role[0] || "?")
        .toString()
        .toUpperCase();
      letterFor[p.id] = letter;
      counts[letter] = (counts[letter] || 0) + 1;
    }
    const seen = {};
    const out = {};
    for (const p of onMap) {
      if (p.mapKey) {
        out[p.id] = p.mapKey;
        continue;
      }
      const letter = letterFor[p.id];
      if (counts[letter] > 1) {
        seen[letter] = (seen[letter] || 0) + 1;
        out[p.id] = `${letter}${seen[letter]}`;
      } else {
        out[p.id] = letter;
      }
    }
    return out;
  }, [boss, roleByKey]);

  // labelOnly pins (boss/zone markers) — keyed on the map, listed in the export
  // key under "Map markers" rather than as fillable assignment rows.
  const zonePins = useMemo(() => boss.pins.filter((p) => p.labelOnly), [boss]);

  // Resolve each role's CSS var to a literal color. html2canvas does NOT resolve
  // var(--x) inside serialized SVG (leader lines) and is more reliable with
  // literals on the marker/badge fills too, so we compute literals once on mount.
  const [roleColors, setRoleColors] = useState({});
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const cs = getComputedStyle(document.documentElement);
    const map = {};
    for (const p of boss.pins) {
      if (!map[p.role]) map[p.role] = cs.getPropertyValue(`--${p.role}-role`).trim();
    }
    setRoleColors(map);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boss.slug]);
  /* eslint-enable react-hooks/set-state-in-effect */

  function roleColor(role) {
    return roleColors[role] || `var(--${role}-role)`;
  }

  // Restore the last fill (and export-mode pref) for this boss on mount. Set
  // after mount (not via a useState initializer) so the server-rendered empty
  // markup matches the first client render and we avoid a hydration mismatch.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        const next = {};
        boss.pins.forEach((p) => {
          next[p.id] = saved[p.id] || "";
        });
        setValues(next);
        setWeek(saved.week || "");
        if (Object.values(next).some(Boolean) || saved.week) {
          setSaveStatus("restored");
        }
      }
      const mode = window.localStorage.getItem(exportModeKey);
      if (mode === "mapkey" || mode === "names") setExportMode(mode);
    } catch {
      // Corrupt/blocked storage — start clean rather than crash.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boss.slug]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist on every change. Skipped on the first commit (hasMounted gate) so the
  // initial empty state can't overwrite a saved fill before it's restored.
  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    try {
      window.localStorage.setItem(storageKey, JSON.stringify(getState()));
    } catch {
      // Storage full/blocked — JSON Save/Load remains the explicit backup path.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values, week]);

  // Clear the active highlight on Escape.
  useEffect(() => {
    function onKey(e) {
      if (e.key === "Escape") setActiveId(null);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // When a highlight is set (from either layer), bring the matching panel row
  // into view so marker→name linking works even when the panel scrolled away.
  useEffect(() => {
    if (!activeId) return;
    const el = rowRefs.current[activeId];
    if (!el) return;
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ block: "nearest", behavior: reduce ? "auto" : "smooth" });
  }, [activeId]);

  function toggleActive(id) {
    setActiveId((cur) => (cur === id ? null : id));
  }

  function setValue(id, val) {
    setValues((v) => ({ ...v, [id]: val }));
    setSaveStatus("saved");
  }

  function getState() {
    const state = {};
    boss.pins.forEach((p) => {
      state[p.id] = values[p.id] || "";
    });
    state.week = week;
    return state;
  }

  function applyState(state) {
    const next = {};
    boss.pins.forEach((p) => {
      next[p.id] = state[p.id] || "";
    });
    setValues(next);
    setWeek(state.week || "");
  }

  function handleClear() {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    const snapshot = getState();
    const hadAnything = boss.pins.some((p) => values[p.id]) || week;
    applyState({});
    setSaveStatus("");
    // Offer an undo instead of an up-front confirm — friendlier for the common
    // "clear for a new week" case while still protecting an accidental wipe.
    if (hadAnything) {
      setUndoData(snapshot);
      undoTimer.current = setTimeout(() => setUndoData(null), 8000);
    }
  }

  function handleUndo() {
    if (undoTimer.current) clearTimeout(undoTimer.current);
    if (undoData) {
      applyState(undoData);
      setSaveStatus("saved");
    }
    setUndoData(null);
  }

  // Cancel a pending undo timer if the component unmounts.
  useEffect(() => () => {
    if (undoTimer.current) clearTimeout(undoTimer.current);
  }, []);

  function chooseExportMode(mode) {
    setExportMode(mode);
    try {
      window.localStorage.setItem(exportModeKey, mode);
    } catch {
      // ignore — non-essential preference
    }
  }

  function handleSave() {
    const state = getState();
    const blob = new Blob([JSON.stringify(state, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const weekPart = state.week ? state.week.replace(/[^a-z0-9]+/gi, "_") : "roster";
    a.href = url;
    a.download = `${boss.slug}_roster_${weekPart}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function handleLoad() {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "application/json";
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          applyState(JSON.parse(ev.target.result));
          setSaveStatus("saved");
        } catch {
          window.alert("Could not read that file.");
        }
      };
      reader.readAsText(file);
    });
    input.click();
  }

  async function handleExport() {
    const root = exportRootRef.current;
    if (!root) return;
    const { default: html2canvas } = await import("html2canvas");
    // Drop any active highlight so the pulse/ring isn't baked into the PNG, and
    // switch the frame into the chosen capture mode (labels vs. key panel).
    setActiveId(null);
    setCapture(exportMode);
    // Let the capture classes apply (label layer / key panel toggle) before shot.
    await new Promise((resolve) => setTimeout(resolve, 60));
    try {
      const canvas = await html2canvas(root, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      const weekPart = week.replace(/[^a-z0-9]+/gi, "_") || "roster";
      link.download = `${boss.slug}_positions_${weekPart}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setCapture(null);
    }
  }

  // Capture-time classes on the export wrapper: which layer is painted, and how
  // the key panel is laid out relative to the map.
  const captureClass =
    capture === "mapkey"
      ? `${styles.captureMapKey} ${keyBeside ? styles.keyBeside : styles.keyStacked}`
      : capture === "names"
        ? styles.captureNames
        : "";

  return (
    <div className={styles.wrap}>
      <h1 className={styles.h1}>{boss.name.toUpperCase()} — POSITION TEMPLATE</h1>
      <div className={styles.subtitle}>{boss.subtitle}</div>

      <div className={styles.layout}>
        <div className={styles.mapCol}>
          <div ref={exportRootRef} className={`${styles.exportRoot} ${captureClass}`}>
            <div
              className={styles.mapFrame}
              onClick={() => setActiveId(null)}
            >
              {imgError ? (
                <div
                  className={styles.imgFallback}
                  role="img"
                  aria-label={boss.imageAlt || `${boss.name} platform diagram`}
                  style={imageRatio ? { aspectRatio: imageRatio } : undefined}
                >
                  Platform diagram couldn’t be loaded.
                  <br />
                  You can still fill in names below.
                </div>
              ) : (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={boss.image}
                  alt={boss.imageAlt || `${boss.name} platform diagram`}
                  onError={() => setImgError(true)}
                />
              )}

              {/* MARKER LAYER — the SINGLE on-map representation of a pin, on
                  every viewport: a tappable role-colored dot + icon + key badge.
                  No on-map text labels or name inputs (those live only in the
                  panel) — see MAP_PANEL_REDESIGN_HANDOFF.md (v2).
                  When a marker would collide in a tight cluster, labelDx/labelDy
                  (% of image) nudge the MARKER off its true spot; a small dot marks
                  the real position and a leader line connects the two. Default 0. */}
              <div className={styles.markerLayer}>
                <svg
                  className={styles.leaders}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                  aria-hidden="true"
                >
                  {boss.pins.map((pin) => {
                    if (pin.sidebarOnly) return null;
                    const dx = pin.labelDx || 0;
                    const dy = pin.labelDy || 0;
                    if (!dx && !dy) return null;
                    return (
                      <line
                        key={pin.id}
                        x1={pin.x}
                        y1={pin.y}
                        x2={pin.x + dx}
                        y2={pin.y + dy}
                        stroke={roleColor(pin.role)}
                        strokeWidth="1"
                        vectorEffect="non-scaling-stroke"
                        opacity="0.55"
                      />
                    );
                  })}
                </svg>

                {boss.pins.map((pin) => {
                  if (pin.sidebarOnly) return null;
                  const color = roleColor(pin.role);
                  const badge = badges[pin.id];
                  const isActive = activeId === pin.id;
                  const dx = pin.labelDx || 0;
                  const dy = pin.labelDy || 0;
                  const offset = dx !== 0 || dy !== 0;
                  return (
                    <Fragment key={pin.id}>
                      {offset && (
                        <span
                          className={styles.posDot}
                          style={{ left: `${pin.x}%`, top: `${pin.y}%`, background: color }}
                          aria-hidden="true"
                        />
                      )}
                      <button
                        type="button"
                        className={`${styles.marker} ${isActive ? styles.markerActive : ""}`}
                        style={{ left: `${pin.x + dx}%`, top: `${pin.y + dy}%`, borderColor: color }}
                        aria-pressed={isActive}
                        aria-label={`${badge ? badge + " · " : ""}${pin.tag || pin.sidebarLabel || pin.id}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleActive(pin.id);
                        }}
                      >
                        <span className={styles.markerDot} style={{ background: color }}>
                          <RoleIcon icon={pin.icon} />
                        </span>
                        {badge && (
                          <span className={styles.markerBadge} style={{ color }}>
                            {badge}
                          </span>
                        )}
                      </button>
                    </Fragment>
                  );
                })}
              </div>

              {/* EXPORT-ONLY NAME LAYER — hidden on screen; shown only during a
                  "names on map" capture, painting each filled name beside its
                  marker. This is the one place names appear on the map. */}
              <div className={styles.exportNames} aria-hidden="true">
                {boss.pins.map((pin) => {
                  if (pin.sidebarOnly || pin.labelOnly) return null;
                  const name = values[pin.id];
                  if (!name) return null;
                  return (
                    <span
                      key={pin.id}
                      className={styles.exportName}
                      style={{
                        left: `${pin.x + (pin.labelDx || 0)}%`,
                        top: `${pin.y + (pin.labelDy || 0)}%`,
                        color: roleColor(pin.role),
                      }}
                    >
                      {name}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* EXPORT KEY — hidden on screen; shown only during a map+key capture
                so the PNG is self-contained (badge → role → name for every
                assignment, plus a keyed list of map markers/zones). */}
            <div className={styles.exportKey} aria-hidden="true">
              <div className={styles.exportKeyHead}>
                {boss.name}
                {week ? ` — ${week}` : ""}
              </div>
              {boss.groups.map((group) => (
                <div className={styles.exportKeyGroup} key={group.id}>
                  <div className={styles.exportKeyTitle}>{group.title}</div>
                  {group.pins.map((pinId) => {
                    const pin = pinById[pinId];
                    if (!pin) return null;
                    const color = roleColor(pin.role);
                    const badge = badges[pinId];
                    return (
                      <div className={styles.exportKeyRow} key={pinId}>
                        <span
                          className={styles.exportKeyBadge}
                          style={{ color, borderColor: color }}
                        >
                          {badge || "·"}
                        </span>
                        <span className={styles.exportKeyLabel}>
                          {pin.cardLabel || pin.sidebarLabel}
                        </span>
                        <span
                          className={`${styles.exportKeyName} ${values[pinId] ? "" : styles.exportKeyEmpty}`}
                        >
                          {values[pinId] || "—"}
                        </span>
                      </div>
                    );
                  })}
                </div>
              ))}
              {zonePins.length > 0 && (
                <div className={styles.exportKeyGroup}>
                  <div className={styles.exportKeyTitle}>Map markers</div>
                  {zonePins.map((pin) => {
                    const color = roleColor(pin.role);
                    return (
                      <div className={styles.exportKeyRow} key={pin.id}>
                        <span
                          className={styles.exportKeyBadge}
                          style={{ color, borderColor: color }}
                        >
                          {badges[pin.id]}
                        </span>
                        <span className={styles.exportKeyLabel}>{pin.tag}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.sideCol}>
          <div className={styles.panel}>
            <h2>Week / Notes</h2>
            <div className={styles.weekRow}>
              <label htmlFor="weekLabel">Week of</label>
              <input
                type="text"
                id="weekLabel"
                placeholder="e.g. June 23"
                value={week}
                onChange={(e) => {
                  setWeek(e.target.value);
                  setSaveStatus("saved");
                }}
              />
            </div>
            <div className={styles.exportRow}>
              <span className={styles.exportRowLabel}>Export style</span>
              <div className={styles.segmented} role="group" aria-label="Export style">
                <button
                  type="button"
                  className={exportMode === "mapkey" ? styles.segActive : ""}
                  aria-pressed={exportMode === "mapkey"}
                  onClick={() => chooseExportMode("mapkey")}
                >
                  Map + key
                </button>
                <button
                  type="button"
                  className={exportMode === "names" ? styles.segActive : ""}
                  aria-pressed={exportMode === "names"}
                  onClick={() => chooseExportMode("names")}
                >
                  Names on map
                </button>
              </div>
            </div>
            <div className={styles.btnRow}>
              <button
                className={styles.primary}
                onClick={handleExport}
                disabled={capture !== null}
              >
                {capture !== null ? "Exporting…" : "Export as image"}
              </button>
              <button onClick={handleSave}>Save roster</button>
              <button onClick={handleLoad}>Load roster</button>
              <button className={styles.danger} onClick={handleClear}>
                Clear all
              </button>
            </div>
            <div className={styles.saveNote} aria-live="polite">
              {saveStatus === "restored" && "Restored your last entries for this boss."}
              {saveStatus === "saved" && "Auto-saved in this browser."}
            </div>
            <div className={styles.legend}>
              {boss.roles.map((r, i) => (
                <span key={r.key}>
                  {i > 0 && <>&nbsp;·&nbsp;</>}
                  <strong style={{ color: `var(--${r.key}-role)` }}>{r.name}</strong> = {r.desc}
                </span>
              ))}
            </div>
          </div>

          <div className={styles.panel}>
            <div className={styles.rosterHead}>
              <h2>Roster — tap a row to find it on the map</h2>
              <button
                type="button"
                className={styles.collapseBtn}
                aria-expanded={rosterOpen}
                onClick={() => setRosterOpen((o) => !o)}
              >
                {rosterOpen ? "Collapse" : "Expand"}
              </button>
            </div>
            {rosterOpen &&
              boss.groups.map((group) => (
              <div className={styles.quadBlock} key={group.id}>
                <div className={styles.quadTitle}>{group.title}</div>
                {group.pins.map((pinId) => {
                  const pin = pinById[pinId];
                  const fieldId = `sidebar-${pinId}`;
                  const badge = badges[pinId];
                  const isActive = activeId === pinId;
                  return (
                    <div
                      className={`${styles.roleRow} ${isActive ? styles.roleRowActive : ""}`}
                      key={pinId}
                      ref={(el) => {
                        rowRefs.current[pinId] = el;
                      }}
                    >
                      {badge ? (
                        <button
                          type="button"
                          className={`${styles.panelBadge} ${isActive ? styles.panelBadgeActive : ""}`}
                          style={{ color: roleColor(pin.role), borderColor: roleColor(pin.role) }}
                          aria-pressed={isActive}
                          aria-label={`Highlight ${badge} on the map`}
                          onClick={() => toggleActive(pinId)}
                        >
                          {badge}
                        </button>
                      ) : (
                        <span
                          className={styles.dot}
                          style={{ background: roleColor(pin.role) }}
                        />
                      )}
                      <label htmlFor={fieldId}>{pin.sidebarLabel}</label>
                      <input
                        id={fieldId}
                        placeholder="Name"
                        aria-label={`${group.title}: ${pin.sidebarLabel}`}
                        value={values[pinId] || ""}
                        onChange={(e) => setValue(pinId, e.target.value)}
                        onFocus={() => setActiveId(pinId)}
                      />
                    </div>
                  );
                  })}
                </div>
              ))}
          </div>
        </div>
      </div>

      {boss.notes && boss.notes.length > 0 && (
        <div className={styles.notes}>
          <h2 className={styles.notesTitle}>Fight Notes &amp; Priorities</h2>
          <div className={styles.notesGrid}>
            {boss.notes.map((section) => (
              <section key={section.heading} className={styles.notesSection}>
                <h3>{section.heading}</h3>
                <ul>
                  {section.items.map((item, i) => (
                    <li key={i}>{item}</li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      )}

      {undoData && (
        <div className={styles.toast} role="status">
          <span>Cleared all names.</span>
          <button type="button" className={styles.toastBtn} onClick={handleUndo}>
            Undo
          </button>
        </div>
      )}
    </div>
  );
}
