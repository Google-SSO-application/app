import El from "../../lib/El.jsx";
import { cssToObj } from "../../lib/style.js";

export default function SourcesView({ sources, openUpload }) {
  return (
    <>
      <div style={{ fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 700, letterSpacing: "-.02em" }}>Sources</div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(300px,1fr))", gap: 12 }}>
        {sources.map((src) => (
          <div key={src.name} style={{ padding: 18, borderRadius: 22, background: "linear-gradient(165deg, rgba(255,255,255,.11), rgba(255,255,255,.045))", backdropFilter: "blur(26px) saturate(170%)", WebkitBackdropFilter: "blur(26px) saturate(170%)", border: "1px solid rgba(255,255,255,.13)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.26)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 13, display: "grid", placeItems: "center", background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.14)", fontSize: 15 }}>{src.icon}</div>
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}>{src.name}</div>
                <div style={{ fontSize: 12, color: "rgba(238,240,255,.55)" }}>{src.detail}</div>
              </div>
              <span style={cssToObj(src.dotStyle)} />
            </div>
            <div style={{ marginTop: 14, display: "flex", gap: 8 }}>
              <button onClick={src.act} style={{ flex: "1 1 auto", height: 34, borderRadius: 11, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.09)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "inherit" }}>{src.action}</button>
            </div>
          </div>
        ))}

        {/* Upload drop zone */}
        <El as="div" onClick={openUpload}
          style="cursor:pointer;padding:18px;min-height:150px;border-radius:22px;border:1px dashed rgba(255,255,255,.22);background:rgba(255,255,255,.03);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center"
          hoverStyle="background:rgba(255,255,255,.08)">
          <div style={{ fontSize: 22 }}>⤒</div>
          <div style={{ fontSize: 14, fontWeight: 600 }}>Upload documents</div>
          <div style={{ fontSize: 12, color: "rgba(238,240,255,.55)", maxWidth: 220 }}>Drop PDFs, READMEs or Markdown — we index the text and tag the project.</div>
        </El>
      </div>
    </>
  );
}
