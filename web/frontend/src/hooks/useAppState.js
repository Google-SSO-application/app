import { useState, useEffect, useCallback } from "react";
import { DOCS, THREADS, PILL, NAVBTN } from "../data.js";
import { badge } from "../lib/badge.js";
import { auth, documents, project } from "../api/index.js";

export function useAppState() {
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
    projectModal: false,
    signedIn: false,
    authReady: false,
    authError: "",
    navOpen: true,
    collapsed: false,
    w: 1440,
    outdated: { 3: true },
    target: "",
  });
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const [uploadsLoading, setUploadsLoading] = useState(false);
  const [uploadsError, setUploadsError] = useState("");
  const [dynamicProjects, setDynamicProjects] = useState([]);

  const set = useCallback((o) => setState((s) => ({ ...s, ...o })), []);
  const s = state;

  // ── window resize ────────────────────────────────────────────────────────
  useEffect(() => {
    const onResize = () =>
      set({ w: window.innerWidth, navOpen: window.innerWidth > 1000 });
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [set]);

  // ── session check ────────────────────────────────────────────────────────
  useEffect(() => {
    let active = true;
    const loadSession = async () => {
      try {
        let response = await auth.getSession();
        if (response.status === 401) {
          const refresh = await auth.refreshToken();
          if (refresh.ok) {
            response = await auth.getSession();
          }
        }
        if (!active) return;
        set({ signedIn: response.ok, authReady: true, authError: "" });
      } catch {
        if (active)
          set({ signedIn: false, authReady: true, authError: "Unable to connect to Atlas." });
      }
    };
    loadSession();
    return () => { active = false; };
  }, [set]);

  const refreshProjects = useCallback(async () => {
    if (!state.signedIn) return;
    try {
      const response = await project.getProjects();
      if (response.ok) {
        const data = await response.json();
        setDynamicProjects(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Could not fetch projects list", err);
    }
  }, [state.signedIn]);

  const refreshUploadedDocs = useCallback(async () => {
    if (!state.signedIn) return;
    setUploadsLoading(true);
    setUploadsError("");
    try {
      const response = await documents.getDashboard();
      if (!response.ok) throw new Error("Unable to load your uploads.");
      const docs = await response.json();
      setUploadedDocs(Array.isArray(docs) ? docs.map((document) => ({
        ...document,
        projectName: document.projectName || document.project_name || "Unassigned",
        fileType: document.fileType || document.file_type || "",
        fileName: document.fileName || document.file_name || document.title || "Untitled document",
        createdAt: document.createdAt || document.created_at || "",
      })) : []);
    } catch (error) {
      setUploadsError(error.message || "Unable to load your uploads.");
    } finally {
      setUploadsLoading(false);
    }
  }, [state.signedIn]);

  useEffect(() => {
    if (state.authReady && state.signedIn) {
      refreshUploadedDocs();
      refreshProjects();
    }
  }, [state.authReady, state.signedIn, refreshUploadedDocs, refreshProjects]);

  useEffect(() => {
    if (dynamicProjects.length > 0 && !s.target) {
      set({ target: dynamicProjects[0].name });
    }
  }, [dynamicProjects, s.target, set]);

  const handlePickProject = useCallback((projectName) => {
    set({ target: projectName });
  }, [set]);

  // ── helpers ──────────────────────────────────────────────────────────────
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

  // ── layout flags ─────────────────────────────────────────────────────────
  const narrow = s.w < 1000;
  const mini = !narrow && s.collapsed;
  const wide = !mini;

  const hide = mini ? "display:none" : "flex:1 1 auto;text-align:left";
  const hideCount = mini
    ? "display:none"
    : "font-family:'DM Mono',monospace;font-size:11px;opacity:.5";

  // ── sidebar style ────────────────────────────────────────────────────────
  const sidebarStyle =
    narrow && !s.navOpen
      ? "display:none"
      : narrow
        ? "position:fixed;left:12px;right:12px;top:70px;z-index:30;max-height:76vh;overflow-y:auto"
        : `flex:0 0 ${mini ? 68 : 262}px;position:sticky;top:88px;transition:flex-basis .22s ease`;

  const sectionStyle = mini
    ? "display:none"
    : "margin:16px 4px 8px;font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:rgba(238,240,255,.42)";

  const syncCardStyle = mini
    ? "margin-top:14px;padding:12px 0;border-radius:20px;background:linear-gradient(165deg, rgba(56,208,214,.16), rgba(255,255,255,.04));backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.12);display:flex;justify-content:center"
    : "margin-top:14px;padding:16px;border-radius:22px;background:linear-gradient(165deg, rgba(56,208,214,.16), rgba(255,255,255,.04));backdrop-filter:blur(24px);border:1px solid rgba(255,255,255,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.25)";

  // ── search results ───────────────────────────────────────────────────────
  const results = DOCS.filter(matches).map((d) => {
    const b = badge(statusOf(d));
    return {
      ...d,
      badge: b.label,
      badgeStyle: b.style,
      meta: d.updated,
      cardStyle:
        "display:flex;gap:14px;padding:16px 18px;border-radius:20px;cursor:pointer;" +
        "background:linear-gradient(165deg, rgba(255,255,255,.10), rgba(255,255,255,.04));" +
        "backdrop-filter:blur(24px) saturate(170%);-webkit-backdrop-filter:blur(24px) saturate(170%);" +
        "border:1px solid rgba(255,255,255,.12);" +
        "box-shadow:inset 0 1px 0 rgba(255,255,255,.24), 0 16px 40px rgba(0,0,0,.3);" +
        "transition:transform .18s ease, background .18s ease",
      open: () => set({ docId: d.id }),
    };
  });

  // ── doc / thread detail ──────────────────────────────────────────────────
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

  // ── nav items ────────────────────────────────────────────────────────────
  const navItems = [
    ["search", "⌕", "Search", DOCS.length],
    ["threads", "◇", "Threads", THREADS.length],
    ["sources", "⧉", "Sources", 5],
    ["uploads", "⤒", "My uploads", uploadedDocs.length],
  ];

  const nav = navItems.map(([id, icon, label, count]) => ({
    id, icon, label, count,
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

  const allProjectsCombined = [
    { id: "all", name: "All projects", color: "#8ff0c0" },
    ...dynamicProjects
  ];

  const projectList = allProjectsCombined.map((p) => {
    const count = p.name === "All projects"
      ? uploadedDocs.length
      : uploadedDocs.filter((d) => d.projectName === p.name || d.project === p.name).length;

    const isCurrentSelection = s.project === p.name;
    const dotColor = getProjectColor(p.name);

    return {
      name: p.name,
      count: count,
      labelStyle: hide,   
      countStyle: hideCount,
      title: p.name,
      dot: `width:8px;height:8px;border-radius:50%;background:${dotColor};box-shadow:0 0 8px ${dotColor}88`,
      style:
        NAVBTN +
        (isCurrentSelection
          ? "background:rgba(255,255,255,.13);border:1px solid rgba(255,255,255,.16)"
          : "background:transparent;border:1px solid transparent;color:rgba(238,240,255,.7)"),
      pick: () => set({ project: p.name, view: "search", navOpen: narrow ? false : true }),
    };
  });

  // ── filters ──────────────────────────────────────────────────────────────
  const typeFilters = ["PDF", "README", "Google Doc", "Medium", "Dev.to"].map((t) => ({
    label: t,
    style:
      PILL +
      (s.types.includes(t)
        ? "background:linear-gradient(160deg, rgba(255,255,255,.26), rgba(255,255,255,.1));border:1px solid rgba(255,255,255,.28);color:#fff"
        : "background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(238,240,255,.75)"),
    toggle: () =>
      set({
        types: s.types.includes(t)
          ? s.types.filter((x) => x !== t)
          : [...s.types, t],
      }),
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

  // ── threads list ─────────────────────────────────────────────────────────
  const threads = THREADS.map((t) => {
    const b = badge(t.status);
    return { ...t, badge: b.label, badgeStyle: b.style, open: () => set({ threadId: t.id }) };
  });

  // ── sources list ─────────────────────────────────────────────────────────
  const sources = [
    { icon: "◲", name: "Google Drive", detail: "3 folders · auto-sync hourly", action: "Sync now" },
    { icon: "›_", name: "GitHub READMEs", detail: "12 repos · on push", action: "Configure" },
    { icon: "✎", name: "Medium", detail: "Saved links · manual", action: "Add link" },
    { icon: "✎", name: "Dev.to", detail: "Saved links · manual", action: "Add link" },
    { icon: "◇", name: "Accepted answers", detail: "68 threads indexed", action: "View rules" },
  ].map((x) => ({
    ...x,
    dotStyle: "width:8px;height:8px;border-radius:50%;background:#5fe3a1;box-shadow:0 0 10px #5fe3a1",
    act: () => set({ view: "sources" }),
  }));

  // ── project chips (modals) ── REMAPPED TO DYNAMIC DATABASE ARRAY ───────
  const projectChips = dynamicProjects.map((p) => ({
    name: p.name,
    active: s.target === p.name,
    style:
      PILL +
      (s.target === p.name
        ? "background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.3)"
        : "background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.12);color:rgba(238,240,255,.72)"),
    pick: () => handlePickProject(p.name),
  }));

  // ── suggestions ──────────────────────────────────────────────────────────
  const suggestions = ["payout retry window", "SSO onboarding", "parser plugin", "refund timeline EU"].map((l) => ({
    label: l,
    go: () => set({ query: l, view: "search" }),
  }));

  // ── login feature points ─────────────────────────────────────────────────
  const loginPoints = [
    { icon: "⌕", t: "One search box", d: "PDFs, READMEs, Drive docs, Medium and dev.to saves — and every accepted answer." },
    { icon: "◇", t: "Ask when search fails", d: "Threads route to the people who own the area; accepted answers get indexed." },
    { icon: "⧗", t: "Trust what you find", d: "Version history on every doc, and anything stale is flagged outdated." },
  ];

  // ── panel / modal helpers ────────────────────────────────────────────────
  const docOpen = !!docVals;
  const docV = docVals || { versions: [], links: [] };
  const threadOpen = !!thVals;
  const threadV = thVals || { replies: [] };
  const uploadOpen = s.upload;
  const askOpen = s.ask;

  const openUpload = () => {
    const fallbackTarget = dynamicProjects.length > 0 ? dynamicProjects[0].name : "";
    set({ 
      upload: true, 
      target: s.project === "All projects" ? (s.target || fallbackTarget) : s.project 
    });
  };

  const openProjectModal = () => set({ projectModal: true });
  const openAsk = () => set({ ask: true, target: s.project === "All projects" ? s.target : s.project });
  const goSources = () => set({ view: "sources", navOpen: narrow ? false : true });
  const goUploads = () => set({ view: "uploads", navOpen: narrow ? false : true });
  const closePanel = () => set({ docId: null, threadId: null, upload: false, ask: false, projectModal: false });
  const toggleNav = () => set(narrow ? { navOpen: !s.navOpen } : { collapsed: !s.collapsed });
  const stop = (e) => e.stopPropagation();

  const toggleOutdated = () => {
    if (!doc) return;
    const st = statusOf(doc);
    set({ outdated: { ...s.outdated, [doc.id]: st !== "outdated" } });
  };

  const outdatedBtnLabel = docVals?.isOutdated ? "Restore as current" : "Mark as outdated";
  const outdatedBtnStyle =
    "height:38px;padding:0 15px;border-radius:12px;cursor:pointer;font-size:13px;font-weight:600;" +
    (docVals?.isOutdated
      ? "border:1px solid rgba(95,227,161,.4);background:rgba(95,227,161,.16);color:#8ff0c0"
      : "border:1px solid rgba(255,176,88,.4);background:rgba(255,176,88,.16);color:#ffcf94");

  // ── auth ─────────────────────────────────────────────────────────────────
  const signedIn = s.signedIn;
  const signedOut = s.authReady && !s.signedIn;

  const signIn = () => window.location.assign("/web/auth/google/login");

  const signOut = async () => {
    await auth.logout();
    set({ signedIn: false, docId: null, threadId: null, upload: false, ask: false });
  };

  // Triggers synchronization re-fetch tasks concurrently
  const refreshAllStates = async () => {
    await refreshUploadedDocs();
    await refreshProjects();
  };

  return {
    s,
    narrow, mini, wide,
    sidebarStyle, sectionStyle, syncCardStyle,
    isSearch: s.view === "search",
    isThreads: s.view === "threads",
    isSources: s.view === "sources",
    isUploads: s.view === "uploads",
    query: s.query,
    onQuery: (e) => set({ query: e.target.value }),
    project: s.project,
    resultCount: results.length,
    heroTitle: s.query ? `Results for "${s.query}"` : "What are you looking for?",
    heroSub: s.query
      ? "Ranked across docs, READMEs, imported articles and accepted answers."
      : "Search 214 indexed documents and 68 answered threads. Filter by project, source or freshness.",
    suggestions,
    results,
    typeFilters,
    statusFilters,
    nav,
    projectList,
    loginPoints,
    threads,
    sources,
    uploadedDocs,
    uploadsLoading,
    uploadsError,
    projectModalOpen: s.projectModal,
    refreshUploadedDocs: refreshAllStates, // Re-binded to sync both arrays
    projectChips,
    target: s.target,
    docOpen, docV,
    threadOpen, threadV,
    uploadOpen, askOpen,
    outdatedBtnLabel, outdatedBtnStyle,
    toggleNav, toggleOutdated, openProjectModal,
    openUpload, openAsk, goSources, goUploads, closePanel, stop,
    signedIn, signedOut,
    signIn, signOut,
  };
}

function getProjectColor(name) {
  if (name === "All projects") return "#8ff0c0";

  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash) % 360;
  return `hsl(${hue}, 65%, 70%)`;
}
