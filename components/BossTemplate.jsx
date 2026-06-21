"use client";

import { useRef, useState } from "react";
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
  const frameRef = useRef(null);

  const pinById = Object.fromEntries(boss.pins.map((p) => [p.id, p]));

  function setValue(id, val) {
    setValues((v) => ({ ...v, [id]: val }));
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
    if (window.confirm("Clear all names for a new week?")) applyState({});
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
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={boss.image} alt={boss.imageAlt || `${boss.name} platform diagram`} />

            {boss.pins.map((pin) => (
              <div
                key={pin.id}
                className={styles.pin}
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                <span className={styles.tag} style={{ color: `var(--${pin.role}-role)` }}>
                  {pin.tag}
                </span>
                <input
                  type="text"
                  placeholder="Name"
                  value={values[pin.id] || ""}
                  onChange={(e) => setValue(pin.id, e.target.value)}
                  style={{ color: `var(--${pin.role}-role)` }}
                />
                <span className={styles.nameDisplay} style={{ color: `var(--${pin.role}-role)` }}>
                  {values[pin.id] || ""}
                </span>
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
                onChange={(e) => setWeek(e.target.value)}
              />
            </div>
            <div className={styles.btnRow}>
              <button className={styles.primary} onClick={handleExport}>
                Export as image
              </button>
              <button onClick={handleSave}>Save roster</button>
              <button onClick={handleLoad}>Load roster</button>
              <button className={styles.danger} onClick={handleClear}>
                Clear all
              </button>
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
                  return (
                    <div className={styles.roleRow} key={pinId}>
                      <span
                        className={styles.dot}
                        style={{ background: `var(--${pin.role}-role)` }}
                      />
                      <label>{pin.sidebarLabel}</label>
                      <input
                        placeholder="Name"
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
    </div>
  );
}
