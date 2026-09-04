import El from "../../lib/El.jsx";

export default function UploadModal({ closePanel, stop, projectChips, target }) {
  return (
    <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(4,5,12,.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20, overflowY: "auto" }}>
      <div onClick={stop} style={{ width: "min(520px,100%)", maxHeight: "calc(100vh - 40px)", overflowY: "auto", padding: "clamp(20px,3vw,30px)", borderRadius: 28, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", backdropFilter: "blur(34px) saturate(180%)", WebkitBackdropFilter: "blur(34px) saturate(180%)", border: "1px solid rgba(255,255,255,.17)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 34px 80px rgba(0,0,0,.6)" }}>

        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em" }}>Add to the hub</div>
        <div style={{ marginTop: 6, fontSize: 13.5, color: "rgba(238,240,255,.62)" }}>
          Upload files or paste a link — Medium, dev.to and Drive URLs are indexed automatically.
        </div>

        {/* Drop zone */}
        <div style={{ marginTop: 18, padding: 28, borderRadius: 20, border: "1px dashed rgba(255,255,255,.25)", background: "rgba(255,255,255,.05)", textAlign: "center" }}>
          <div style={{ fontSize: 24 }}>⤒</div>
          <div style={{ marginTop: 8, fontSize: 14, fontWeight: 600 }}>Drop PDFs, .md or README files</div>
          <div style={{ marginTop: 4, fontSize: 12, color: "rgba(238,240,255,.55)" }}>or click to browse — up to 50 MB each</div>
        </div>

        <El as="input" placeholder="https://medium.com/@team/post…"
          style="margin-top:12px;width:100%;height:44px;padding:0 16px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);outline:none;font-size:13.5px;color:#eef0ff"
          focusStyle="border-color:rgba(169,180,255,.55)" />

        <div style={{ marginTop: 12, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {projectChips.map((c) => (
            <El as="button" key={c.name} onClick={c.pick} style={c.style}>{c.name}</El>
          ))}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={closePanel} style={{ height: 42, padding: "0 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.07)", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "inherit" }}>Cancel</button>
          <button onClick={closePanel} style={{ height: 42, padding: "0 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,.22)", background: "linear-gradient(160deg, rgba(255,255,255,.92), rgba(255,255,255,.72))", color: "#12142a", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Add to {target}</button>
        </div>
      </div>
    </div>
  );
}
