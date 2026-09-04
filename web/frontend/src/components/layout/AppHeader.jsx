import El from "../../lib/El.jsx";

export default function AppHeader({ query, onQuery, toggleNav, openUpload, signOut }) {
  return (
    <header style={{ position: "sticky", top: 0, zIndex: 20, display: "flex", alignItems: "center", gap: 16, padding: "12px clamp(14px,3vw,28px)", background: "linear-gradient(180deg, rgba(12,14,28,.75), rgba(12,14,28,.45))", backdropFilter: "blur(24px) saturate(170%)", WebkitBackdropFilter: "blur(24px) saturate(170%)", borderBottom: "1px solid rgba(255,255,255,.09)" }}>
      <button onClick={toggleNav} style={{ flex: "0 0 auto", width: 38, height: 38, borderRadius: 12, border: "1px solid rgba(255,255,255,.14)", background: "rgba(255,255,255,.07)", cursor: "pointer", fontSize: 15, color: "inherit" }}>☰</button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, flex: "0 0 auto" }}>
        <div style={{ width: 30, height: 30, borderRadius: 10, display: "grid", placeItems: "center", background: "linear-gradient(160deg, rgba(255,255,255,.4), rgba(255,255,255,.08))", border: "1px solid rgba(255,255,255,.22)", fontSize: 14 }}>◈</div>
        <div style={{ fontWeight: 700, letterSpacing: "-.02em", fontSize: 15, whiteSpace: "nowrap" }}>Atlas</div>
      </div>

      <div style={{ flex: "1 1 auto", maxWidth: 640, position: "relative", display: "flex", alignItems: "center" }}>
        <span style={{ position: "absolute", left: 16, opacity: .5, fontSize: 14 }}>⌕</span>
        <El as="input" value={query} onChange={onQuery} placeholder="Search docs, READMEs, threads…"
          style="width:100%;height:42px;padding:0 84px 0 40px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);backdrop-filter:blur(18px);outline:none;font-size:14px;color:#eef0ff"
          focusStyle="border-color:rgba(169,180,255,.55);background:rgba(255,255,255,.11)" />
        <span style={{ position: "absolute", right: 14, fontFamily: "'DM Mono',monospace", fontSize: 11, padding: "4px 8px", borderRadius: 8, border: "1px solid rgba(255,255,255,.14)", color: "rgba(238,240,255,.5)" }}>⌘K</span>
      </div>

      <div style={{ flex: "0 0 auto", display: "flex", alignItems: "center", gap: 10, marginLeft: "auto" }}>
        <El as="button" onClick={openUpload}
          style="height:38px;padding:0 16px;border-radius:12px;border:1px solid rgba(255,255,255,.2);background:linear-gradient(160deg, rgba(255,255,255,.2), rgba(255,255,255,.07));cursor:pointer;font-size:13px;font-weight:600;white-space:nowrap;color:inherit"
          hoverStyle="background:rgba(255,255,255,.18)">＋ Upload</El>
        <El as="button" onClick={signOut} title="Sign out"
          style="width:34px;height:34px;padding:0;border-radius:50%;border:1px solid rgba(255,255,255,.2);background:linear-gradient(150deg,#8b7bff,#38d0d6);display:grid;place-items:center;font-size:12px;font-weight:700;color:#0b0c18;cursor:pointer"
          hoverStyle="filter:brightness(1.1)">NR</El>
      </div>
    </header>
  );
}
