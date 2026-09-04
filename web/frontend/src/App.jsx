import React, { useState, useEffect, useCallback } from "react";
import El from "./lib/El.jsx";
import { cssToObj } from "./lib/style.js";
import { DOCS, THREADS, PROJECTS, PILL, NAVBTN } from "./data.js";

const BADGE_MAP = {
  current: ["#5fe3a1", "rgba(95,227,161,.14)", "Current"],
  outdated: ["#ffb058", "rgba(255,176,88,.16)", "Outdated"],
  review: ["#a9b4ff", "rgba(169,180,255,.16)", "In review"],
  answered: ["#5fe3a1", "rgba(95,227,161,.14)", "Answered"],
  open: ["#ffb058", "rgba(255,176,88,.16)", "Open"],
};

function badge(status) {
  const [fg, bg, label] = BADGE_MAP[status] || BADGE_MAP.current;
  return {
    style: `display:inline-flex;align-items:center;height:22px;padding:0 9px;border-radius:8px;font-size:11px;font-weight:600;letter-spacing:.02em;color:${fg};background:${bg};border:1px solid ${fg}33`,
    label,
  };
}

export default function App() {
  const [state, setState] = useState({
    view: "search",
    query: "",
    project: "All projects",
    types: [],
    status: "Any status",
    docId: null,
    threadId: null,
    upload: false,
    ask: false,
    signedIn: false,
    authReady: false,
    authError: "",
    navOpen: true,
    collapsed: false,
    w: 1440,
    outdated: { 3: true },
    target: "Platform",
  });

  const set = useCallback((o) => setState((s) => ({ ...s, ...o })), []);
  const s = state;

  useEffect(() => {
    const onResize = () =>
      set({ w: window.innerWidth, navOpen: window.innerWidth > 1000 });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    let active = true;

    const loadSession = async () => {
      try {
        let response = await fetch("/web/me", { credentials: "include" });

        if (response.status === 401) {
          const refresh = await fetch("/web/auth/refresh", {
            method: "POST",
            credentials: "include",
          });
          if (refresh.ok) {
            response = await fetch("/web/me", { credentials: "include" });
          }
        }

        if (!active) return;
        set({
          signedIn: response.ok,
          authReady: true,
          authError: "",
        });
      } catch {
        if (active) set({ signedIn: false, authReady: true, authError: "Unable to connect to Atlas." });
      }
    };

    loadSession();
    return () => {
      active = false;
    };
  }, [set]);

  const statusOf = (d) =>
    s.outdated[d.id] ? "outdated" : d.status === "outdated" ? "current" : d.status;

  const matches = (d) => {
    const q = s.query.trim().toLowerCase();
    if (s.project !== "All projects" && d.project !== s.project) return false;
    if (s.types.length && !s.types.includes(d.type)) return false;
    if (s.status !== "Any status" && statusOf(d) !== s.status.toLowerCase()) return false;
    if (!q) return true;
    return (d.title + " " + d.excerpt + " " + d.tags.join(" ") + " " + d.type + " " + d.project)
      .toLowerCase()
      .includes(q);
  };

  // ---- derived values (mirrors renderVals() in the original) ----
  const narrow = s.w < 1000;
  const mini = !narrow && s.collapsed;
  const hide = mini ? "display:none" : "flex:1 1 auto;text-align:left";
  const hideCount = mini ? "display:none" : "font-family:'DM Mono',monospace;font-size:11px;opacity:.5";

  const results = DOCS.filter(matches).map((d) => {
    const b = badge(statusOf(d));
    return {
      ...d,
      badge: b.label,
      badgeStyle: b.style,
      meta: d.updated,
      cardStyle:
        "display:flex;gap:14px;padding:16px 18px;border-radius:20px;cursor:pointer;background:linear-gradient(165deg, rgba(255,255,255,.10), rgba(255,255,255,.04));backdrop-filter:blur(24px) saturate(170%);-webkit-backdrop-filter:blur(24px) saturate(170%);border:1px solid rgba(255,255,255,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.24), 0 16px 40px rgba(0,0,0,.3);transition:transform .18s ease, background .18s ease",
      open: () => set({ docId: d.id }),
    };
  });

  const doc = DOCS.find((d) => d.id === s.docId);
  const docVals = doc
    ? (() => {
        const st = statusOf(doc);
        const b = badge(st);
        return { ...doc, badge: b.label, badgeStyle: b.style, isOutdated: st === "outdated" };
      })()
    : null;

  const th = THREADS.find((t) => t.id === s.threadId);
  const thVals = th
    ? (() => {
        const b = badge(th.status);
        return { ...th, badge: b.label, badgeStyle: b.style };
      })()
    : null;

  const navItems = [
    ["search", "⌕", "Search", DOCS.length],
    ["threads", "◇", "Threads", THREADS.length],
    ["sources", "⧉", "Sources", 5],
  ];

  const loginPoints = [
    { icon: "⌕", t: "One search box", d: "PDFs, READMEs, Drive docs, Medium and dev.to saves — and every accepted answer." },
    { icon: "◇", t: "Ask when search fails", d: "Threads route to the people who own the area; accepted answers get indexed." },
    { icon: "⧗", t: "Trust what you find", d: "Version history on every doc, and anything stale is flagged outdated." },
  ];

  const query = s.query;
  const onQuery = (e) => set({ query: e.target.value });
  const project = s.project;
  const resultCount = results.length;
  const isSearch = s.view === "search";
  const isThreads = s.view === "threads";
  const isSources = s.view === "sources";
  const heroTitle = s.query ? `Results for "${s.query}"` : "What are you looking for?";
  const heroSub = s.query
    ? "Ranked across docs, READMEs, imported articles and accepted answers."
    : "Search 214 indexed documents and 68 answered threads. Filter by project, source or freshness.";
  const suggestions = ["payout retry window", "SSO onboarding", "parser plugin", "refund timeline EU"].map((l) => ({
    label: l,
    go: () => set({ query: l, view: "search" }),
  }));

  const sidebarStyle = narrow && !s.navOpen
    ? "display:none"
    : narrow
    ? "position:fixed;left:12px;right:12px;top:70px;z-index:30;max-height:76vh;overflow-y:auto"
    : `flex:0 0 ${mini ? 68 : 262}px;position:sticky;top:88px;transition:flex-basis .22s ease`;
  const toggleNav = () => set(narrow ? { navOpen: !s.navOpen } : { collapsed: !s.collapsed });
  const wide = !mini;
  const sectionStyle = mini
    ? "display:none"
    : "margin:16px 4px 8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(238,240,255,.42)";
  const syncCardStyle = mini
    ? "margin-top:14px;padding:12px 0;border-radius:20px;background:linear-gradient(165deg, rgba(56,208,214,.16), rgba(255,255,255,.04));backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.12);display:flex;justify-content:center"
    : "margin-top:14px;padding:16px;border-radius:22px;background:linear-gradient(165deg, rgba(56,208,214,.16), rgba(255,255,255,.04));backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.25)";

  const nav = navItems.map(([id, icon, label, count]) => ({
    id,
    icon,
    label,
    count,
    labelStyle: hide,
    countStyle: hideCount,
    title: label,
    style:
      NAVBTN +
      (s.view === id
        ? "background:linear-gradient(160deg, rgba(255,255,255,.22), rgba(255,255,255,.08));border:1px solid rgba(255,255,255,.2);box-shadow:inset 0 1px 0 rgba(255,255,255,.3)"
        : "background:transparent;border:1px solid transparent;color:rgba(238,240,255,.72)"),
    go: () => set({ view: id, navOpen: narrow ? false : true }),
  }));

  const projectList = PROJECTS.map((p) => ({
    name: p.name,
    count: p.name === "All projects" ? DOCS.length : DOCS.filter((d) => d.project === p.name).length,
    labelStyle: hide,
    countStyle: hideCount,
    title: p.name,
    dot: `width:8px;height:8px;border-radius:50%;background:${p.color};box-shadow:0 0 8px ${p.color}88`,
    style:
      NAVBTN +
      (s.project === p.name
        ? "background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.16)"
        : "background:transparent;border:1px solid transparent;color:rgba(238,240,255,.7)"),
    pick: () => set({ project: p.name, view: "search", navOpen: narrow ? false : true }),
  }));

  const typeFilters = ["PDF", "README", "Google Doc", "Medium", "Dev.to"].map((t) => ({
    label: t,
    style:
      PILL +
      (s.types.includes(t)
        ? "background:linear-gradient(160deg, rgba(255,255,255,.26), rgba(255,255,255,.1));border:1px solid rgba(255,255,255,.28);color:#fff"
        : "background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(238,240,255,.75)"),
    toggle: () => set({ types: s.types.includes(t) ? s.types.filter((x) => x !== t) : [...s.types, t] }),
  }));

  const statusFilters = ["Any status", "Current", "Outdated", "Review"].map((f) => ({
    label: f,
    style:
      PILL +
      (s.status === f
        ? "background:rgba(169,180,255,.22);border:1px solid rgba(169,180,255,.4);color:#dfe3ff"
        : "background:rgba(255,255,255,.05);border:1px solid rgba(255,255,255,.1);color:rgba(238,240,255,.62)"),
    pick: () => set({ status: f }),
  }));

  const threads = THREADS.map((t) => {
    const b = badge(t.status);
    return { ...t, badge: b.label, badgeStyle: b.style, open: () => set({ threadId: t.id }) };
  });

  const sources = [
    { icon: "◲", name: "Google Drive", detail: "3 folders · auto-sync hourly", action: "Sync now", ok: true },
    { icon: "›_", name: "GitHub READMEs", detail: "12 repos · on push", action: "Configure", ok: true },
    { icon: "✎", name: "Medium", detail: "Saved links · manual", action: "Add link", ok: true },
    { icon: "✎", name: "Dev.to", detail: "Saved links · manual", action: "Add link", ok: true },
    { icon: "◇", name: "Accepted answers", detail: "68 threads indexed", action: "View rules", ok: true },
  ].map((x) => ({
    ...x,
    dotStyle: "width:8px;height:8px;border-radius:50%;background:#5fe3a1;box-shadow:0 0 10px #5fe3a1",
    act: () => set({ view: "sources" }),
  }));

  const target = s.target;
  const projectChips = PROJECTS.slice(1).map((p) => ({
    name: p.name,
    style:
      PILL +
      (s.target === p.name
        ? "background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.3)"
        : "background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(238,240,255,.72)"),
    pick: () => set({ target: p.name }),
  }));

  const docOpen = !!docVals;
  const docV = docVals || { versions: [], links: [] };
  const threadOpen = !!thVals;
  const threadV = thVals || { replies: [] };
  const uploadOpen = s.upload;
  const askOpen = s.ask;
  const openUpload = () => set({ upload: true, target: s.project === "All projects" ? s.target : s.project });
  const openAsk = () => set({ ask: true, target: s.project === "All projects" ? s.target : s.project });
  const goSources = () => set({ view: "sources", navOpen: narrow ? false : true });
  const closePanel = () => set({ docId: null, threadId: null, upload: false, ask: false });
  const stop = (e) => e.stopPropagation();
  const toggleOutdated = () => {
    if (!doc) return;
    const st = statusOf(doc);
    set({ outdated: { ...s.outdated, [doc.id]: st !== "outdated" } });
  };
  const outdatedBtnLabel = docVals && docVals.isOutdated ? "Restore as current" : "Mark as outdated";
  const outdatedBtnStyle =
    "height:38px;padding:0 15px;border-radius:12px;cursor:pointer;font-size:13px;font-weight:600;" +
    (docVals && docVals.isOutdated
      ? "border:1px solid rgba(95,227,161,.4);background:rgba(95,227,161,.16);color:#8ff0c0"
      : "border:1px solid rgba(255,176,88,.4);background:rgba(255,176,88,.16);color:#ffcf94");

  const signedIn = s.signedIn;
  const signedOut = s.authReady && !s.signedIn;
  const signIn = () => {
    window.location.assign("/web/auth/google/login");
  };
  const signOut = async () => {
    await fetch("/web/auth/logout", { method: "POST", credentials: "include" }).catch(() => {});
    set({ signedIn: false, docId: null, threadId: null, upload: false, ask: false });
  };

  // ---------------------------------------------------------------------

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#eef0ff", background: "#05060c", overflowX: "hidden" }}>

      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", overflow: "hidden", zIndex: 0 }}>
        <div style={{ position: "absolute", top: "-18vh", left: "-6vw", width: "52vw", height: "52vw", borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, rgba(139,123,255,.85), rgba(139,123,255,0) 68%)", filter: "blur(30px)", animation: "drift1 26s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-24vh", right: "-10vw", width: "56vw", height: "56vw", borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(56,208,214,.6), rgba(56,208,214,0) 70%)", filter: "blur(40px)", animation: "drift2 32s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "28vh", right: "22vw", width: "34vw", height: "34vw", borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(255,106,168,.45), rgba(255,106,168,0) 70%)", filter: "blur(40px)", animation: "drift3 22s ease-in-out infinite" }} />
        <div style={{ position: "absolute", inset: 0, background: "radial-gradient(120% 90% at 50% 0%, rgba(5,6,12,0) 20%, rgba(5,6,12,.75) 100%)" }} />
      </div>

      {!s.authReady && (
        <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "grid", placeItems: "center", color: "rgba(238,240,255,.72)" }}>
          Checking your Atlas session…
        </div>
      )}

      {s.authError && (
        <div role="alert" style={{ position: "fixed", zIndex: 60, top: 18, left: "50%", transform: "translateX(-50%)", padding: "12px 16px", borderRadius: 12, background: "rgba(255,106,168,.16)", border: "1px solid rgba(255,106,168,.4)", color: "#ffd4e5", fontSize: 13 }}>
          {s.authError}
        </div>
      )}

      {signedOut && (
        <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "clamp(20px,4vw,48px)" }}>
          <div style={{ width: "min(1080px,100%)", display: "flex", flexWrap: "wrap", alignItems: "stretch", gap: "clamp(18px,3vw,32px)" }}>

            <div style={{ flex: "1 1 380px", minWidth: 300, display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(8px,2vw,20px)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{ width: 38, height: 38, borderRadius: 13, display: "grid", placeItems: "center", background: "linear-gradient(160deg, rgba(255,255,255,.4), rgba(255,255,255,.08))", border: "1px solid rgba(255,255,255,.24)", fontSize: 17 }}>◈</div>
                <div style={{ fontWeight: 700, letterSpacing: "-.02em", fontSize: 17 }}>Atlas</div>
              </div>
              <div style={{ marginTop: 26, fontSize: "clamp(30px,4.6vw,46px)", fontWeight: 700, letterSpacing: "-.035em", lineHeight: 1.08, textWrap: "pretty" }}>Every answer your team already wrote down.</div>
              <div style={{ marginTop: 14, fontSize: 15, lineHeight: 1.6, color: "rgba(238,240,255,.62)", maxWidth: "44ch", textWrap: "pretty" }}>Atlas indexes your uploads, Drive folders, READMEs and saved articles — plus the threads your colleagues have already answered.</div>

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

            <div style={{ flex: "0 1 400px", minWidth: 300, display: "flex" }}>
              <div style={{ width: "100%", padding: "clamp(24px,3vw,36px) clamp(22px,3vw,32px) 28px", borderRadius: 30, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", backdropFilter: "blur(34px) saturate(185%)", WebkitBackdropFilter: "blur(34px) saturate(185%)", border: "1px solid rgba(255,255,255,.17)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.38), 0 34px 80px rgba(0,0,0,.55)", display: "flex", flexDirection: "column", justifyContent: "center", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", top: 0, left: 0, width: "45%", height: "100%", background: "linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.09), rgba(255,255,255,0))", animation: "sheen 8s ease-in-out infinite", pointerEvents: "none" }} />
                <div style={{ fontSize: 22, fontWeight: 700, letterSpacing: "-.025em" }}>Sign in</div>
                <div style={{ marginTop: 7, fontSize: 13.5, lineHeight: 1.55, color: "rgba(238,240,255,.6)" }}>Use your work Google account. Access follows your existing project groups.</div>

                <El as="button" onClick={signIn}
                  style="margin-top:24px;width:100%;height:52px;border-radius:16px;border:1px solid rgba(255,255,255,.22);background:linear-gradient(160deg, rgba(255,255,255,.94), rgba(255,255,255,.74));color:#12142a;font-weight:600;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;gap:11px;box-shadow:0 14px 34px rgba(0,0,0,.42)"
                  hoverStyle="filter:brightness(1.06)">
                  <span style={{ width: 22, height: 22, borderRadius: "50%", background: "conic-gradient(from -35deg,#ea4335,#fbbc05,#34a853,#4285f4,#ea4335)", display: "inline-block" }} /> Continue with Google
                </El>

                <div style={{ marginTop: 22, display: "flex", alignItems: "center", gap: 9, fontSize: 12, lineHeight: 1.5, color: "rgba(238,240,255,.5)" }}>
                  <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5fe3a1", boxShadow: "0 0 8px #5fe3a1", flex: "0 0 auto" }} />
                  Drive stays read-only until you choose folders to sync.
                </div>
                <div style={{ marginTop: 14, fontSize: 11.5, lineHeight: 1.6, color: "rgba(238,240,255,.38)" }}>By continuing you agree to the internal <a href="#terms">usage policy</a>. Trouble signing in? <a href="#help">Ask IT</a>.</div>
              </div>
            </div>

          </div>
        </div>
      )}

      {signedIn && (
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

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

        <div style={{ flex: "1 1 auto", display: "flex", alignItems: "flex-start", gap: "clamp(12px,2vw,22px)", padding: "clamp(14px,2.4vw,24px)", maxWidth: 1560, width: "100%", margin: "0 auto" }}>

          <El as="aside" style={sidebarStyle}>
            <div style={{ padding: 14, borderRadius: 22, background: "linear-gradient(165deg, rgba(255,255,255,.11), rgba(255,255,255,.045))", backdropFilter: "blur(26px) saturate(170%)", WebkitBackdropFilter: "blur(26px) saturate(170%)", border: "1px solid rgba(255,255,255,.13)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.28), 0 20px 50px rgba(0,0,0,.4)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {nav.map((n) => (
                  <El as="button" key={n.id} onClick={n.go} title={n.title} style={n.style}>
                    <span style={{ width: 22, textAlign: "center", opacity: .9, flex: "0 0 auto" }}>{n.icon}</span>
                    <span style={cssToObj(n.labelStyle)}>{n.label}</span>
                    <span style={cssToObj(n.countStyle)}>{n.count}</span>
                  </El>
                ))}
              </div>

              <div style={cssToObj(sectionStyle)}>Projects</div>
              <div style={{ height: 14 }} />
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                {projectList.map((p) => (
                  <El as="button" key={p.name} onClick={p.pick} title={p.title} style={p.style}>
                    <span style={cssToObj(p.dot)} />
                    <span style={cssToObj(p.labelStyle)}>{p.name}</span>
                    <span style={cssToObj(p.countStyle)}>{p.count}</span>
                  </El>
                ))}
              </div>
            </div>

            <div style={cssToObj(syncCardStyle)}>
              {mini && (
                <button onClick={goSources} title="Drive sync — manage sources" style={{ width: 38, height: 38, borderRadius: 12, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.08)", cursor: "pointer", fontSize: 14, position: "relative", color: "inherit" }}>
                  ◲<span style={{ position: "absolute", top: 5, right: 5, width: 6, height: 6, borderRadius: "50%", background: "#5fe3a1", boxShadow: "0 0 8px #5fe3a1" }} />
                </button>
              )}
              {wide && (
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, fontWeight: 600 }}>Drive sync <span style={{ width: 7, height: 7, borderRadius: "50%", background: "#5fe3a1", boxShadow: "0 0 10px #5fe3a1" }} /></div>
                  <div style={{ marginTop: 6, fontSize: 12, lineHeight: 1.5, color: "rgba(238,240,255,.6)" }}>3 folders · last synced 12 min ago</div>
                  <button onClick={goSources} style={{ marginTop: 12, width: "100%", height: 34, borderRadius: 11, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.09)", cursor: "pointer", fontSize: 12.5, fontWeight: 600, color: "inherit" }}>Manage sources</button>
                </div>
              )}
            </div>
          </El>

          <main style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>

            {isSearch && (
              <>
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

                <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: 8 }}>
                  {typeFilters.map((t) => (
                    <El as="button" key={t.label} onClick={t.toggle} style={t.style}>{t.label}</El>
                  ))}
                  <div style={{ flex: "1 1 auto" }} />
                  {statusFilters.map((f) => (
                    <El as="button" key={f.label} onClick={f.pick} style={f.style}>{f.label}</El>
                  ))}
                </div>

                <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "0 4px" }}>
                  <div style={{ fontSize: 13, color: "rgba(238,240,255,.6)" }}>{resultCount} results in <strong style={{ color: "#eef0ff" }}>{project}</strong></div>
                </div>

                <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                  {results.map((r) => (
                    <El as="div" key={r.id} onClick={r.open} style={r.cardStyle} hoverStyle="background:rgba(255,255,255,.13);transform:translateY(-2px)">
                      <div style={{ flex: "0 0 auto", width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", fontSize: 16, background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.14)" }}>{r.icon}</div>
                      <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                          <div style={{ fontSize: 15.5, fontWeight: 600, letterSpacing: "-.01em" }}>{r.title}</div>
                          <span style={cssToObj(r.badgeStyle)}>{r.badge}</span>
                        </div>
                        <div style={{ marginTop: 5, fontSize: 13.5, lineHeight: 1.55, color: "rgba(238,240,255,.62)", textWrap: "pretty", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{r.excerpt}</div>
                        <div style={{ marginTop: 9, display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11.5, color: "rgba(238,240,255,.5)", fontFamily: "'DM Mono',monospace" }}>
                          <span>{r.type}</span><span>·</span><span>{r.project}</span><span>·</span><span>{r.meta}</span>
                        </div>
                      </div>
                      <div style={{ flex: "0 0 auto", alignSelf: "center", opacity: .4, fontSize: 15 }}>›</div>
                    </El>
                  ))}
                </div>
              </>
            )}

            {isThreads && (
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
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}><span style={cssToObj(t.badgeStyle)}>{t.badge}</span><span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11, color: "rgba(238,240,255,.45)" }}>{t.project}</span></div>
                      <div style={{ marginTop: 10, fontSize: 16, fontWeight: 600, letterSpacing: "-.01em", lineHeight: 1.35, textWrap: "pretty" }}>{t.q}</div>
                      <div style={{ marginTop: 8, fontSize: 13, lineHeight: 1.55, color: "rgba(238,240,255,.6)", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{t.preview}</div>
                      <div style={{ marginTop: 14, display: "flex", alignItems: "center", gap: 8, fontSize: 11.5, fontFamily: "'DM Mono',monospace", color: "rgba(238,240,255,.5)" }}>{t.meta}</div>
                    </El>
                  ))}
                </div>
              </>
            )}

            {isSources && (
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
                  <El as="div" onClick={openUpload}
                    style="cursor:pointer;padding:18px;min-height:150px;border-radius:22px;border:1px dashed rgba(255,255,255,.22);background:rgba(255,255,255,.03);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;text-align:center"
                    hoverStyle="background:rgba(255,255,255,.08)">
                    <div style={{ fontSize: 22 }}>⤒</div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Upload documents</div>
                    <div style={{ fontSize: 12, color: "rgba(238,240,255,.55)", maxWidth: 220 }}>Drop PDFs, READMEs or Markdown — we index the text and tag the project.</div>
                  </El>
                </div>
              </>
            )}

          </main>
        </div>
      </div>
      )}

      {docOpen && (
        <>
          <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(4,5,12,.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />
          <div style={{ position: "fixed", zIndex: 41, top: 0, right: 0, bottom: 0, width: "min(560px,100%)", padding: "clamp(18px,3vw,30px)", overflowY: "auto", background: "linear-gradient(180deg, rgba(22,24,44,.9), rgba(12,13,26,.92))", backdropFilter: "blur(34px) saturate(180%)", WebkitBackdropFilter: "blur(34px) saturate(180%)", borderLeft: "1px solid rgba(255,255,255,.14)", boxShadow: "-30px 0 80px rgba(0,0,0,.6)" }}>
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

            <div style={{ marginTop: 18, display: "flex", flexWrap: "wrap", gap: 8 }}>
              <El as="button" onClick={toggleOutdated} style={outdatedBtnStyle}>{outdatedBtnLabel}</El>
              <button style={{ height: 38, padding: "0 15px", borderRadius: 12, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.08)", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "inherit" }}>Open source</button>
              <button style={{ height: 38, padding: "0 15px", borderRadius: 12, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.08)", cursor: "pointer", fontSize: 13, fontWeight: 600, color: "inherit" }}>Ask about this</button>
            </div>

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
      )}

      {threadOpen && (
        <>
          <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 40, background: "rgba(4,5,12,.55)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }} />
          <div style={{ position: "fixed", zIndex: 41, top: 0, right: 0, bottom: 0, width: "min(560px,100%)", padding: "clamp(18px,3vw,30px)", overflowY: "auto", background: "linear-gradient(180deg, rgba(22,24,44,.9), rgba(12,13,26,.92))", backdropFilter: "blur(34px) saturate(180%)", WebkitBackdropFilter: "blur(34px) saturate(180%)", borderLeft: "1px solid rgba(255,255,255,.14)", boxShadow: "-30px 0 80px rgba(0,0,0,.6)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span style={cssToObj(threadV.badgeStyle)}>{threadV.badge}</span>
              <span style={{ fontFamily: "'DM Mono',monospace", fontSize: 11.5, color: "rgba(238,240,255,.5)" }}>Thread · {threadV.project}</span>
              <div style={{ flex: "1 1 auto" }} />
              <button onClick={closePanel} style={{ width: 34, height: 34, borderRadius: 11, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.08)", cursor: "pointer", color: "inherit" }}>✕</button>
            </div>
            <div style={{ marginTop: 16, fontSize: "clamp(19px,3vw,25px)", fontWeight: 700, letterSpacing: "-.025em", lineHeight: 1.3, textWrap: "pretty" }}>{threadV.q}</div>
            <div style={{ marginTop: 8, fontSize: 11.5, fontFamily: "'DM Mono',monospace", color: "rgba(238,240,255,.45)" }}>{threadV.meta}</div>
            <div style={{ marginTop: 14, fontSize: 13.5, lineHeight: 1.65, color: "rgba(238,240,255,.66)", textWrap: "pretty" }}>{threadV.body}</div>

            <div style={{ marginTop: 22, padding: 18, borderRadius: 20, background: "linear-gradient(160deg, rgba(95,227,161,.16), rgba(255,255,255,.04))", border: "1px solid rgba(95,227,161,.32)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.24)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 600, color: "#8ff0c0" }}>✓ Accepted answer</div>
              <div style={{ marginTop: 10, fontSize: 14, lineHeight: 1.65, textWrap: "pretty" }}>{threadV.answer}</div>
              <div style={{ marginTop: 12, fontSize: 11.5, fontFamily: "'DM Mono',monospace", color: "rgba(238,240,255,.5)" }}>{threadV.answerMeta}</div>
            </div>

            <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              {threadV.replies.map((rp, i) => (
                <div key={i} style={{ padding: "14px 16px", borderRadius: 16, background: "rgba(255,255,255,.06)", border: "1px solid rgba(255,255,255,.11)" }}>
                  <div style={{ fontSize: 13.5, lineHeight: 1.6, color: "rgba(238,240,255,.8)" }}>{rp.body}</div>
                  <div style={{ marginTop: 6, fontSize: 11.5, fontFamily: "'DM Mono',monospace", color: "rgba(238,240,255,.45)" }}>{rp.who}</div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: 18, display: "flex", gap: 8, alignItems: "center" }}>
              <El as="input" placeholder="Write an answer…"
                style="flex:1 1 auto;height:44px;padding:0 16px;border-radius:14px;border:1px solid rgba(255,255,255,.14);background:rgba(255,255,255,.07);outline:none;font-size:13.5px;color:#eef0ff"
                focusStyle="border-color:rgba(169,180,255,.55)" />
              <button style={{ height: 44, padding: "0 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,.22)", background: "linear-gradient(160deg, rgba(255,255,255,.9), rgba(255,255,255,.7))", color: "#12142a", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Post</button>
            </div>
          </div>
        </>
      )}

      {uploadOpen && (
        <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(4,5,12,.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20, overflowY: "auto" }}>
          <div onClick={stop} style={{ width: "min(520px,100%)", maxHeight: "calc(100vh - 40px)", overflowY: "auto", padding: "clamp(20px,3vw,30px)", borderRadius: 28, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", backdropFilter: "blur(34px) saturate(180%)", WebkitBackdropFilter: "blur(34px) saturate(180%)", border: "1px solid rgba(255,255,255,.17)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 34px 80px rgba(0,0,0,.6)" }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em" }}>Add to the hub</div>
            <div style={{ marginTop: 6, fontSize: 13.5, color: "rgba(238,240,255,.62)" }}>Upload files or paste a link — Medium, dev.to and Drive URLs are indexed automatically.</div>
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
      )}

      {askOpen && (
        <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(4,5,12,.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20, overflowY: "auto" }}>
          <div onClick={stop} style={{ width: "min(560px,100%)", maxHeight: "calc(100vh - 40px)", overflowY: "auto", padding: "clamp(20px,3vw,30px)", borderRadius: 28, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", backdropFilter: "blur(34px) saturate(180%)", WebkitBackdropFilter: "blur(34px) saturate(180%)", border: "1px solid rgba(255,255,255,.17)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 34px 80px rgba(0,0,0,.6)" }}>
            <div style={{ fontSize: 20, fontWeight: 700, letterSpacing: "-.02em" }}>Ask the team</div>
            <div style={{ marginTop: 6, fontSize: 13.5, color: "rgba(238,240,255,.62)" }}>Once an answer is accepted, the thread becomes searchable alongside the docs.</div>

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
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#5fe3a1", boxShadow: "0 0 8px #5fe3a1" }} /> 3 docs in {target} look related — they'll be suggested to responders.
            </div>

            <div style={{ marginTop: 20, display: "flex", gap: 10, justifyContent: "flex-end" }}>
              <button onClick={closePanel} style={{ height: 42, padding: "0 18px", borderRadius: 14, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.07)", cursor: "pointer", fontSize: 13.5, fontWeight: 600, color: "inherit" }}>Cancel</button>
              <button onClick={closePanel} style={{ height: 42, padding: "0 20px", borderRadius: 14, border: "1px solid rgba(255,255,255,.22)", background: "linear-gradient(160deg, rgba(255,255,255,.92), rgba(255,255,255,.72))", color: "#12142a", fontWeight: 600, fontSize: 13.5, cursor: "pointer" }}>Post to {target}</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
