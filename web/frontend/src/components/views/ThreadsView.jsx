import El from "../../lib/El.jsx";
import { cssToObj } from "../../lib/style.js";

export default function ThreadsView({ threads, openAsk }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 700, letterSpacing: "-.02em" }}>Threads</div>
        <div style={{ fontSize: 13, color: "rgba(238,240,255,.55)" }}>Ask the team — accepted answers become searchable docs.</div>
        <div style={{ flex: "1 1 auto" }} />
        <button onClick={openAsk} style={{ height: 38, padding: "0 16px", borderRadius: 12, border: "1px solid rgba(255,255,255,.2)", background: "linear-gradient(160deg, rgba(255,255,255,.2), rgba(255,255,255,.07))", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "inherit" }}>＋ Ask a question</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 12 }}>
        {threads.map((t) => (
          <El as="div" key={t.id} onClick={t.open}
            style="cursor:pointer;padding:18px;border-radius:22px;background:linear-gradient(165deg, rgba(255,255,255,.11), rgba(255,255,255,.045));backdrop-filter:blur(26px) saturate(170%);-webkit-backdrop-filter:blur(26px) saturate(170%);border:1px solid rgba(255,255,255,.13);box-shadow:inset 0 1px 0 rgba(255,255,255,.26), 0 18px 44px rgba(0,0,0,.36);transition:transform .18s ease, background .18s ease"
            hoverStyle="transform:translateY(-3px);background:rgba(255,255,255,.14)">
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={cssToObj(t.badgeStyle)}>{t.badge}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(238,240,255,.45)" }}>{t.project}</span>
            </div>
            <div style={{ marginTop: 10, fontSize: 16, fontWeight: 600, letterSpacing: "-.01em", lineHeight: 1.35, textWrap: "pretty" }}>{t.q}</div>
            <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: "rgba(238,240,255,.6)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.preview}</div>
            <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, fontFamily: "'DM Mono',monospace", color: "rgba(238,240,255,.5)" }}>{t.meta}</div>
          </El>
        ))}
      </div>
    </>
  );
}
