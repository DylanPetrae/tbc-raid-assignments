"use client";

import { useEffect, useRef, useState } from "react";
import styles from "./BossTemplate.module.css";

// Shared boss-position template. Fed entirely by a per-boss data object
// (see /data/bosses/lady-vashj.js for the reference shape): image, an array
// of pins (id, role color key, tag, sidebarLabel, x%, y%), groups (how pins
// are bucketed in the sidebar roster panel), and roles (legend entries).
//
// Carries forward the lessons from the Vashj prototype:
//  - pin inputs are mirrored by a hidden <span class="name-display"> that's
//    shown (and the <input> hidden) only while exporting, because
//    html2canvas does not reliably paint live form-control text.
//  - "Export as image" / "Save roster" / "Load roster" / "Clear all" all
//    operate on the same in-memory state object, keyed by pin id.
export default function BossTemplate({ boss }) {
  const [values, setValues] = useState({});
  const [week, setWeek] = useState("");
  const [exporting, setExporting] = useState(false);
  // Autosave status surfaced to the user: "" (nothing), "restored" (loaded a
  // previous fill on mount), or "saved" (the current fill is persisted).
  const [saveStatus, setSaveStatus] = useState("");
  // Snapshot of the fill before the last "Clear all", so it can be undone.
  const [undoData, setUndoData] = useState(null);
  // True if the boss image failed to load (e.g. asset not added yet).
  const [imgError, setImgError] = useState(false);
  const frameRef = useRef(null);
  const undoTimer = useRef(null);
  // Gate the autosave effect so it doesn't clobber storage on the very first
  // commit (before the load effect has had a chance to restore).
  const hasMounted = useRef(false);

  const pinById = Object.fromEntries(boss.pins.map((p) => [p.id, p]));
  const storageKey = `tbc-raid:roster:${boss.slug}`;
  // CSS aspect-ratio string (e.g. "1672 / 941") from the boss's real image
  // dimensions, used to size the missing-image fallback to the right shape.
  const imageRatio =
    boss.imageWidth && boss.imageHeight
      ? `${boss.imageWidth} / ${boss.imageHeight}`
      : undefined;

  // Restore the last fill for this boss from localStorage on mount. Officers
  // type ~13 names per week; a refresh or stray back-button must not wipe them.
  // This deliberately sets state after mount (not via a useState initializer)
  // so the server-rendered empty markup matches the first client render and
  // we avoid a hydration mismatch — the one intended cascading render.
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
    } catch {
      // Corrupt/blocked storage — start clean rather than crash.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [boss.slug]);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist on every change. Skipped on the first commit (hasMounted gate) so
  // the initial empty state can't overwrite a saved fill before it's restored.
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
    const frame = frameRef.current;
    if (!frame) return;
    const { default: html2canvas } = await import("html2canvas");
    setExporting(true);
    // Let the .exporting class swap input -> name-display before capture.
    await new Promise((resolve) => setTimeout(resolve, 50));
    try {
      const canvas = await html2canvas(frame, { backgroundColor: null, scale: 2 });
      const link = document.createElement("a");
      const weekPart = week.replace(/[^a-z0-9]+/gi, "_") || "roster";
      link.download = `${boss.slug}_positions_${weekPart}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  }

  return (
    <div className={styles.wrap}>
      <h1 className={styles.h1}>{boss.name.toUpperCase()} — POSITION TEMPLATE</h1>
      <div className={styles.subtitle}>{boss.subtitle}</div>

      <div className={styles.layout}>
        <div className={styles.mapCol}>
          <div
            ref={frameRef}
            className={`${styles.mapFrame} ${exporting ? styles.exporting : ""}`}
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

            {boss.pins.map((pin) => (
              <div
                key={pin.id}
                className={styles.pin}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <span className={styles.tag} style={{ color: `var(--${pin.role}-role)` }}>
                  {pin.tag}
                </span>
                {/* labelOnly pins (e.g. the boss marker, the DPS stack) are
                    map annotations with no player name — render just the tag. */}
                {!pin.labelOnly && (
                  <>
                    <input
                      type="text"
                      placeholder="Name"
                      aria-label={`${pin.tag} — player name`}
                      value={values[pin.id] || ""}
                      onChange={(e) => setValue(pin.id, e.target.value)}
                      style={{ color: `var(--${pin.role}-role)` }}
                    />
                    <span className={styles.nameDisplay} style={{ color: `var(--${pin.role}-role)` }}>
                      {values[pin.id] || ""}
                    </span>
                  </>
                )}
              </div>
            ))}
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
            <div className={styles.btnRow}>
              <button
                className={styles.primary}
                onClick={handleExport}
                disabled={exporting}
              >
                {exporting ? "Exporting…" : "Export as image"}
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
            <h2>Roster — type names here too</h2>
            {boss.groups.map((group) => (
              <div className={styles.quadBlock} key={group.id}>
                <div className={styles.quadTitle}>{group.title}</div>
                {group.pins.map((pinId) => {
                  const pin = pinById[pinId];
                  const fieldId = `sidebar-${pinId}`;
                  return (
                    <div className={styles.roleRow} key={pinId}>
                      <span
                        className={styles.dot}
                        style={{ background: `var(--${pin.role}-role)` }}
                      />
                      <label htmlFor={fieldId}>{pin.sidebarLabel}</label>
                      <input
                        id={fieldId}
                        placeholder="Name"
                        aria-label={`${group.title}: ${pin.sidebarLabel}`}
                        value={values[pinId] || ""}
                        onChange={(e) => setValue(pinId, e.target.value)}
                      />
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

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
