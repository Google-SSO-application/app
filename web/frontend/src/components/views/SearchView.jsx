import El from "../../lib/El.jsx";
import { cssToObj } from "../../lib/style.js";

export default function SearchView({
  heroTitle, heroSub, suggestions,
  typeFilters, statusFilters,
  resultCount, project,
  results,
}) {
  return (
    <>
      {/* Hero / search prompt card */}
      <div style={{ padding: "clamp(18px,2.6vw,30px)", borderRadius: 26, background: "linear-gradient(160deg, rgba(255,255,255,.13), rgba(255,255,255,.045))", backdropFilter: "blur(30px) saturate(180%)", WebkitBackdropFilter: "blur(30px) saturate(180%)", border: "1px solid rgba(255,255,255,.14)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.3), 0 24px 60px rgba(0,0,0,.42)", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", top: 0, left: 0, width: "40%", height: "100%", background: "linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.10), rgba(255,255,255,0))", animation: "sheen 7s ease-in-out infinite", pointerEvents: "none" }} />
        <div style={{ fontSize: "clamp(22px,3vw,32px)", fontWeight: 700, letterSpacing: "-.03em" }}>{heroTitle}</div>
        <div style={{ marginTop: 8, fontSize: 14, color: "rgba(238,240,255,.62)" }}>{heroSub}</div>
        <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8 }}>
          {suggestions.map((sg, i) => (
            <El as="button" key={i} onClick={sg.go}
              style="height:32px;padding:0 14px;border-radius:11px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);cursor:pointer;font-size:12.5px;color:rgba(238,240,255,.85)"
              hoverStyle="background:rgba(255,255,255,.15)">{sg.label}</El>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
        {typeFilters.map((t) => (
          <El as="button" key={t.label} onClick={t.toggle} style={t.style}>{t.label}</El>
        ))}
        <div style={{ flex: "1 1 auto" }} />
        {statusFilters.map((f) => (
          <El as="button" key={f.label} onClick={f.pick} style={f.style}>{f.label}</El>
        ))}
      </div>

      {/* Result count */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "0 4px" }}>
        <div style={{ fontSize: 13, color: "rgba(238,240,255,.6)" }}>
          {resultCount} results in <strong style={{ color: "#eef0ff" }}>{project}</strong>
        </div>
      </div>

      {/* Result cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {results.map((r) => (
          <El as="div" key={r.id} onClick={r.open} style={r.cardStyle}
            hoverStyle="background:rgba(255,255,255,.13);transform:translateY(-2px)">
            <div style={{ flex: "0 0 auto", width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", fontSize: 16, background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.14)" }}>{r.icon}</div>
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: "-.01em" }}>{r.title}</div>
                <span style={cssToObj(r.badgeStyle)}>{r.badge}</span>
              </div>
              <div style={{ marginTop: 5, fontSize: 13.5, lineHeight: 1.55, color: "rgba(238,240,255,.62)", textWrap: "pretty", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.excerpt}</div>
              {r.tags?.length > 0 && (
                <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {r.tags.map((tag) => (
                    <span key={tag} style={{ padding: "3px 8px", borderRadius: 8, background: "rgba(169,180,255,.12)", border: "1px solid rgba(169,180,255,.25)", color: "#dfe3ff", fontSize: 11, fontWeight: 600 }}>#{tag}</span>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 9, display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11.5, color: "rgba(238,240,255,.5)", fontFamily: "'DM Mono',monospace" }}>
                <span>{r.type}</span><span>·</span><span>{r.project}</span><span>·</span><span>{r.meta}</span>
              </div>
            </div>
            <div style={{ flex: "0 0 auto", alignSelf: "center", opacity: .4, fontSize: 15 }}>›</div>
          </El>
        ))}
      </div>
    </>
  );
}
