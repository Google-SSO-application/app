import El from "../../lib/El.jsx";
import { cssToObj } from "../../lib/style.js";

export default function ThreadPanel({ threadV, closePanel }) {
  return (
    <>
      <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(4,5,12,.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />
      <div style={{ position: "fixed", zIndex: 41, top: 0, right: 0, bottom: 0, width: "min(560px,100%)", padding: "clamp(18px,3vw,30px)", overflowY: "auto", background: "linear-gradient(180deg, rgba(22,24,44,.9), rgba(12,13,26,.92))", backdropFilter: "blur(34px) saturate(180%)", WebkitBackdropFilter: "blur(34px) saturate(180%)", borderLeft: "1px solid rgba(255,255,255,.14)", boxShadow: "-30px 0 80px rgba(0,0,0,.6)" }}>

        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={cssToObj(threadV.badgeStyle)}>{threadV.badge}</span>
          <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5, color: "rgba(238,240,255,.5)" }}>Thread · {threadV.project}</span>
          <div style={{ flex: "1 1 auto" }} />
          <button onClick={closePanel} style={{ width: 34, height: 34, borderRadius: 11, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.08)", cursor: "pointer", color: "inherit" }}>✕</button>
        </div>

        <div style={{ marginTop: 16, fontSize: "clamp(19px,3vw,25px)", fontWeight: 700, letterSpacing: "-.025em", lineHeight: 1.3, textWrap: "pretty" }}>{threadV.q}</div>
        <div style={{ marginTop: 8, fontSize: 11.5, fontFamily: "'DM Mono',monospace", color: "rgba(238,240,255,.45)" }}>{threadV.meta}</div>
        <div style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.65, color: "rgba(238,240,255,.66)", textWrap: "pretty" }}>{threadV.body}</div>

        {/* Accepted answer */}
        {threadV.answer && (
          <div style={{ marginTop: 22, padding: 18, borderRadius: 20, background: "linear-gradient(160deg, rgba(95,227,161,.16), rgba(255,255,255,.04))", border: "1px solid rgba(95,227,161,.32)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.24)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "#8ff0c0" }}>✓ Accepted answer</div>
            <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, textWrap: "pretty" }}>{threadV.answer}</div>
            <div style={{ marginTop: 12, fontSize: 11.5, fontFamily: "'DM Mono',monospace", color: "rgba(238,240,255,.5)" }}>{threadV.answerMeta}</div>
          </div>
        )}

        {/* Replies */}
        <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
          {threadV.replies.map((rp, i) => (
            <div key={i} style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.11)" }}>
              <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(238,240,255,.8)" }}>{rp.body}</div>
              <div style={{ marginTop: 6, fontSize: 11.5, fontFamily: "'DM Mono',monospace", color: "rgba(238,240,255,.45)" }}>{rp.who}</div>
            </div>
          ))}
        </div>

        {/* Reply composer */}
        <div style={{ marginTop: 18, display: "flex", gap: 8, alignItems: "center" }}>
          <El as="input" placeholder="Write an answer…"
            style="flex:1 1 auto;height:44px;padding:0 16px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);outline:none;font-size:13.5px;color:#eef0ff"
            focusStyle="border-color:rgba(169,180,255,.55)" />
          <button style={{ height: 44, padding: "0 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,.22)", background: "linear-gradient(160deg, rgba(255,255,255,.9), rgba(255,255,255,.7))", color: "#12142a", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Post</button>
        </div>
      </div>
    </>
  );
}
