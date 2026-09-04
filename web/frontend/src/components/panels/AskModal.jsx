import El from "../../lib/El.jsx";

export default function AskModal({ closePanel, stop, projectChips, target }) {
  return (
    <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(4,5,12,.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20, overflowY: "auto" }}>
      <div onClick={stop} style={{ width: "min(560px,100%)", maxHeight: "calc(100vh - 40px)", overflowY: "auto", padding: "clamp(20px,3vw,30px)", borderRadius: 28, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", backdropFilter: "blur(34px) saturate(180%)", WebkitBackdropFilter: "blur(34px) saturate(180%)", border: "1px solid rgba(255,255,255,.17)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 34px 80px rgba(0,0,0,.6)" }}>

        <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em" }}>Ask the team</div>
        <div style={{ marginTop: 6, fontSize: 13.5, color: "rgba(238,240,255,.62)" }}>
          Once an answer is accepted, the thread becomes searchable alongside the docs.
        </div>

        <El as="input" placeholder="Question — e.g. Why do payouts stall at 'pending_capture'?"
          style="margin-top:18px;width:100%;height:46px;padding:0 16px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);outline:none;font-size:14px;color:#eef0ff"
          focusStyle="border-color:rgba(169,180,255,.55);background:rgba(255,255,255,.11)" />

        <El as="textarea" placeholder="Add context: what you tried, error messages, which environment…" rows={5}
          style="margin-top:10px;width:100%;padding:14px 16px;border-radius:16px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);outline:none;font-size:13.5px;line-height:1.6;resize:vertical;font-family:'DM Sans',system-ui,sans-serif;color:#eef0ff"
          focusStyle="border-color:rgba(169,180,255,.55);background:rgba(255,255,255,.11)" />

        <div style={{ marginTop: 16, fontSize: 11, letterSpacing: ".12em", textTransform: "uppercase", color: "rgba(238,240,255,.42)" }}>Project</div>
        <div style={{ marginTop: 8, display: "flex", gap: 8, flexWrap: "wrap" }}>
          {projectChips.map((c) => (
            <El as="button" key={c.name} onClick={c.pick} style={c.style}>{c.name}</El>
          ))}
        </div>

        <El as="input" placeholder="Tags — payouts, retry, settlement"
          style="margin-top:14px;width:100%;height:42px;padding:0 16px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);outline:none;font-size:13.5px;color:#eef0ff"
          focusStyle="border-color:rgba(169,180,255,.55)" />

        <div style={{ marginTop: 10, display: "flex", alignItems: "center", gap: 9, fontSize: 12.5, color: "rgba(238,240,255,.6)" }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#5fe3a1", boxShadow: "0 0 8px #5fe3a1" }} />
          3 docs in {target} look related — they'll be suggested to responders.
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button onClick={closePanel} style={{ height: 42, padding: "0 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.07)", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "inherit" }}>Cancel</button>
          <button onClick={closePanel} style={{ height: 42, padding: "0 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,.22)", background: "linear-gradient(160deg, rgba(255,255,255,.92), rgba(255,255,255,.72))", color: "#12142a", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Post to {target}</button>
        </div>
      </div>
    </div>
  );
}
