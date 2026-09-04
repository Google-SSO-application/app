import El from "../../lib/El.jsx";

export default function LoginPage({ loginPoints, signIn }) {
  return (
    <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(20px,4vw,48px)" }}>
      <div style={{ width: "min(1080px,100%)", display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "clamp(18px,3vw,32px)" }}>

        {/* Left: marketing copy */}
        <div style={{ flex: "1 1 380px", minWidth: 300, display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(8px,2vw,20px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
            <div style={{ width: 38, height: 38, borderRadius: 13, display: "grid", placeItems: "center", background: "linear-gradient(160deg, rgba(255,255,255,.4), rgba(255,255,255,.08))", border: "1px solid rgba(255,255,255,.24)", fontSize: 17 }}>◈</div>
            <div style={{ fontWeight: 700, letterSpacing: "-.02em", fontSize: 17 }}>Atlas</div>
          </div>

          <div style={{ marginTop: 26, fontSize: "clamp(30px,4.6vw,46px)", fontWeight: 700, letterSpacing: "-.035em", lineHeight: 1.08, textWrap: "pretty" }}>
            Every answer your team already wrote down.
          </div>
          <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, color: "rgba(238,240,255,.62)", maxWidth: "44ch", textWrap: "pretty" }}>
            Atlas indexes your uploads, Drive folders, READMEs and saved articles — plus the threads your colleagues have already answered.
          </div>

          <div style={{ marginTop: 28, display: "flex", flexDirection: "column", gap: 12 }}>
            {loginPoints.map((p, i) => (
              <div key={i} style={{ display: "flex", gap: 13, alignItems: "flex-start" }}>
                <div style={{ flex: "0 0 auto", width: 34, height: 34, borderRadius: 11, display: "grid", placeItems: "center", background: "rgba(255,255,255,.08)", border: "1px solid rgba(255,255,255,.14)", fontSize: 14 }}>{p.icon}</div>
                <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{p.t}</div>
                  <div style={{ marginTop: 3, fontSize: 13, lineHeight: 1.55, color: "rgba(238,240,255,.58)", textWrap: "pretty" }}>{p.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: sign-in card */}
        <div style={{ flex: "0 1 400px", minWidth: 300, display: "flex" }}>
          <div style={{ width: "100%", padding: "clamp(24px,3vw,36px) clamp(22px,3vw,32px) 28px", borderRadius: 30, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", backdropFilter: "blur(34px) saturate(185%)", WebkitBackdropFilter: "blur(34px) saturate(185%)", border: "1px solid rgba(255,255,255,.17)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.38), 0 34px 80px rgba(0,0,0,.55)", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: 0, left: 0, width: "45%", height: "100%", background: "linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.09), rgba(255,255,255,0))", animation: "sheen 8s ease-in-out infinite", pointerEvents: "none" }} />

            <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.025em" }}>Sign in</div>
            <div style={{ marginTop: 7, fontSize: 13.5, lineHeight: 1.55, color: "rgba(238,240,255,.6)" }}>
              Use your work Google account. Access follows your existing project groups.
            </div>

            <El as="button" onClick={signIn}
              style="margin-top:24px;width:100%;height:52px;border-radius:16px;border:1px solid rgba(255,255,255,.22);background:linear-gradient(160deg, rgba(255,255,255,.94), rgba(255,255,255,.74));color:#12142a;font-weight:600;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:11px;box-shadow:0 14px 34px rgba(0,0,0,.42)"
              hoverStyle="filter:brightness(1.06)">
              <span style={{ width: 22, height: 22, borderRadius: "50%", background: "conic-gradient(from -35deg,#ea4335,#fbbc05,#34a853,#4285f4,#ea4335)", display: "inline-block" }} />
              Continue with Google
            </El>

            <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 9, fontSize: 12, lineHeight: 1.5, color: "rgba(238,240,255,.5)" }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5fe3a1", boxShadow: "0 0 8px #5fe3a1", flex: "0 0 auto" }} />
              Drive stays read-only until you choose folders to sync.
            </div>
            <div style={{ marginTop: 14, fontSize: 11.5, lineHeight: 1.6, color: "rgba(238,240,255,.38)" }}>
              By continuing you agree to the internal <a href="#terms">usage policy</a>. Trouble signing in? <a href="#help">Ask IT</a>.
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
