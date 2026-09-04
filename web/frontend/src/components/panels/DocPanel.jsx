import El from "../../lib/El.jsx";
import { cssToObj } from "../../lib/style.js";

export default function DocPanel({ docV, closePanel, toggleOutdated, outdatedBtnLabel, outdatedBtnStyle }) {
  return (
    <>
      <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(4,5,12,.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />
      <div style={{ position: "fixed", zIndex: 41, top: 0, right: 0, bottom: 0, width: "min(560px,100%)", padding: "clamp(18px,3vw,30px)", overflowY: "auto", background: "linear-gradient(180deg, rgba(22,24,44,.9), rgba(12,13,26,.92))", backdropFilter: "blur(34px) saturate(180%)", WebkitBackdropFilter: "blur(34px) saturate(180%)", borderLeft: "1px solid rgba(255,255,255,.14)", boxShadow: "-30px 0 80px rgba(0,0,0,.6)" }}>

        {/* Header row */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={cssToObj(docV.badgeStyle)}>{docV.badge}</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5, color: "rgba(238,240,255,.5)" }}>{docV.type} · {docV.project}</span>
          <div style={{ flex: "1 1 auto" }} />
          <button onClick={closePanel} style={{ width: 34, height: 34, borderRadius: 11, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.08)", cursor: "pointer", color: "inherit" }}>✕</button>
        </div>

        <div style={{ marginTop: 16, fontSize: "clamp(20px,3vw,26px)", fontWeight: 700, letterSpacing: "-.025em", lineHeight: 1.25, textWrap: "pretty" }}>{docV.title}</div>
        <div style={{ marginTop: 10, fontSize: 13.5, lineHeight: 1.65, color: "rgba(238,240,255,.66)", textWrap: "pretty" }}>{docV.excerpt}</div>

        {docV.isOutdated && (
          <div style={{ marginTop: 16, padding: "14px 16px", borderRadius: 16, background: "linear-gradient(160deg, rgba(255,176,88,.22), rgba(255,255,255,.04))", border: "1px solid rgba(255,176,88,.35)", fontSize: 13, lineHeight: 1.55 }}>
            <strong>Marked outdated</strong> by Priya M. — superseded by v{docV.version} of the platform runbook.
          </div>
        )}

        {/* Action buttons */}
        <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8 }}>
          <El as="button" onClick={toggleOutdated} style={outdatedBtnStyle}>{outdatedBtnLabel}</El>
          <button style={{ height: 38, padding: "0 15px", borderRadius: 12, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.08)", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "inherit" }}>Open source</button>
          <button style={{ height: 38, padding: "0 15px", borderRadius: 12, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.08)", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "inherit" }}>Ask about this</button>
        </div>

        {/* Version history */}
        <div style={{ marginTop: 26, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(238,240,255,.42)" }}>Version history</div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {docV.versions.map((v, i) => (
            <div key={i} style={{ display: "flex", gap: 12, padding: "13px 15px", borderRadius: 16, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.11)" }}>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 12.5, color: "#a9b4ff", flex: "0 0 auto" }}>{v.v}</div>
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div style={{ fontSize: 13.5, lineHeight: 1.5 }}>{v.note}</div>
                <div style={{ marginTop: 4, fontSize: 11.5, fontFamily: "'DM Mono',monospace", color: "rgba(238,240,255,.45)" }}>{v.who} · {v.date}</div>
              </div>
              <div style={{ fontSize: 11.5, color: "rgba(238,240,255,.5)", alignSelf: "center" }}>{v.tag}</div>
            </div>
          ))}
        </div>

        {/* Linked threads */}
        <div style={{ marginTop: 26, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(238,240,255,.42)" }}>Linked threads</div>
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          {docV.links.map((l, i) => (
            <div key={i} style={{ padding: "13px 15px", borderRadius: 16, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.11)", fontSize: 13.5, lineHeight: 1.5 }}>
              {l.q}
              <div style={{ marginTop: 4, fontSize: 11.5, fontFamily: "'DM Mono',monospace", color: "rgba(238,240,255,.45)" }}>{l.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
