import { useEffect, useCallback, useState } from "react";
import { DOCS, THREADS } from "../data.js";
import { badge } from "../lib/badge.js";
import { useAuth } from "./useAuth.js";
import { useProjects } from "./useProjects.js";
import { useResponsiveLayout } from "./useResponsiveLayout.js";
import { useUploads } from "./useUploads.js";
import useUploadDocs from "./useTags.js";
import { useUiState } from "./useUiState.js";
import useAssignedDocuments from "./useAssignedDocuments.js";
import { usePublishedDocs } from "./usePublishedDocs.js";
import { useSemanticSearch } from "./useSemanticSearch.js";

export function useAppState() {
  const { state: s, set, openReviewerModal, handlePickProject, closePanel, toggleNav, stop } = useUiState();
  const authState = useAuth();
  const { narrow } = useResponsiveLayout();
  const { uploadedDocs, uploadsLoading, uploadsError, uploadedDocsCount, refreshUploadedDocs } = useUploads(authState.signedIn);
  const assignedState = useAssignedDocuments(authState.signedIn);
  const setTarget = useCallback((target) => set({ target }), [set]);
  const { projects: dynamicProjects, refreshProjects } = useProjects(authState.signedIn, s.target, setTarget);
  const uploadTagState = useUploadDocs(authState, refreshUploadedDocs, refreshProjects);
  const [globalTagOpen, setGlobalTagOpen] = useState(false);
  const { publishedDocs, projectCounts, publishedLoading, publishedError, refreshPublishedData } = usePublishedDocs(s.project, authState.signedIn);
  const { searchResults, searchLoading, searchError } = useSemanticSearch(s.query, s.project, authState.signedIn);
  const isSemanticSearch = s.query.trim().length > 0;

  useEffect(() => {
    if (authState.authReady && authState.signedIn) {
      refreshUploadedDocs();
      refreshProjects();
      assignedState.refreshAssignedDocuments();

      if (s.view === "uploads") {
        refreshUploadedDocs();
      }
    }
  }, [authState.authReady, authState.signedIn, refreshUploadedDocs, refreshProjects, assignedState.refreshAssignedDocuments]);

  // ── helpers ──────────────────────────────────────────────────────────────
  const statusOf = (d) =>
    s.outdated[d.id] ? "outdated" : d.status === "outdated" ? "current" : d.status;

  // ── layout flags ─────────────────────────────────────────────────────────
  const mini = !narrow && s.collapsed;
  const wide = !mini;

  // ── search results ───────────────────────────────────────────────────────
  const baseDocs = isSemanticSearch
  ? searchResults.map((r) => ({
      ...r.document,
      distance: r.distance,

      projectName:
        r.document.projectName ||
        r.document.project_name ||
        "Unassigned",

      fileType:
        r.document.fileType ||
        r.document.file_type ||
        "",

      fileName:
        r.document.fileName ||
        r.document.file_name ||
        r.document.title ||
        "Untitled document",

      createdAt:
        r.document.createdAt ||
        r.document.created_at ||
        "",
    }))
  : publishedDocs;

  const passesTypeStatus = (d) => {
    if (s.types.length && !s.types.includes(d.fileType)) return false;
    if (s.status !== "Any status" && statusOf(d) !== s.status.toLowerCase()) return false;
    return true;
  };

  const filteredDocs = baseDocs.filter(passesTypeStatus);

  const results = filteredDocs.map((d) => {
    const b = badge(statusOf(d));
    return {
      ...d,
      badge: b.label,
      badgeClassName: b.className,
      meta: new Date(d.createdAt).toLocaleDateString(),
      open: () => set({ docId: d.id }),
    };
  });

  // ── doc / thread detail ──────────────────────────────────────────────────
  const doc = publishedDocs.find((d) => d.id === s.docId) || uploadedDocs.find((d) => d.id === s.docId);
  const docVals = doc
    ? (() => {
      const st = statusOf(doc);
      const b = badge(st);
      return { ...doc, badge: b.label, badgeClassName: b.className, isOutdated: st === "outdated" };
    })()
    : null;

  const th = THREADS.find((t) => t.id === s.threadId);
  const thVals = th
    ? (() => {
      const b = badge(th.status);
      return { ...th, badge: b.label, badgeClassName: b.className };
    })()
    : null;

  // ── nav items ────────────────────────────────────────────────────────────
  const navItems = [
    ["search", "⌕", "Search", DOCS.length],
    ["threads", "◇", "Threads", THREADS.length],
    ["sources", "⧉", "Sources", 5],
    ["uploads", "⤒", "My uploads", uploadedDocsCount],
  ];

  const nav = navItems.map(([id, icon, label, count]) => ({
    id, icon, label, count,
    title: label,
    active: s.view === id,
    go: () => {
      if (id === "uploads") {
        refreshUploadedDocs();
      }
      set({ view: id, navOpen: narrow ? false : true });
      },
  }));

  const allProjectsCombined = [
    { id: "all", name: "All projects", color: "#8ff0c0" },
    ...dynamicProjects
  ];

  const projectList = allProjectsCombined.map((p) => {
    const count = projectCounts[p.name] || 0;
    const isCurrentSelection = s.project === p.name;
    const dotColor = getProjectColor(p.name);

    return {
      name: p.name,
      count,
      title: p.name,
      active: isCurrentSelection,
      dotColor,
      pick: () => set({ project: p.name, view: "search", navOpen: narrow ? false : true }),
    };
  });

  // ── filters ──────────────────────────────────────────────────────────────
  const typeFilters = ["PDF", "README", "Google Doc", "Medium", "Dev.to"].map((t) => ({
    label: t,
    active: s.types.includes(t),
    toggle: () =>
      set({
        types: s.types.includes(t)
          ? s.types.filter((x) => x !== t)
          : [...s.types, t],
      }),
  }));

  const statusFilters = ["Any status", "Current", "Outdated", "Review"].map((f) => ({
    label: f,
    active: s.status === f,
    pick: () => set({ status: f }),
  }));

  // ── threads list ─────────────────────────────────────────────────────────
  const threads = THREADS.map((t) => {
    const b = badge(t.status);
    return { ...t, badge: b.label, badgeClassName: b.className, open: () => set({ threadId: t.id }) };
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
    act: () => set({ view: "sources" }),
  }));

  // ── project chips (modals) ── REMAPPED TO DYNAMIC DATABASE ARRAY ───────
  const projectChips = dynamicProjects.map((p) => ({
    name: p.name,
    active: s.target === p.name,
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
      target: s.project === "All projects" ? fallbackTarget : s.project
    });
  };

  const openGlobalTag = () => setGlobalTagOpen(true);

  const openProjectModal = () => set({ projectModal: true });
  const openAsk = () => set({ ask: true, target: s.project === "All projects" ? s.target : s.project });
  const goSources = () => set({ view: "sources", navOpen: narrow ? false : true });
  const goUploads = () => set({ view: "uploads", navOpen: narrow ? false : true });
  const goAssigned = () => set({ view: "assigned", navOpen: narrow ? false : true });
  const toggleOutdated = () => {
    if (!doc) return;
    const st = statusOf(doc);
    set({ outdated: { ...s.outdated, [doc.id]: st !== "outdated" } });
  };

  // Triggers synchronization re-fetch tasks concurrently
  const refreshAllStates = async () => {
    await Promise.all([refreshUploadedDocs(), refreshPublishedData(), refreshProjects()]);
  };

  const updateReviewStatusAndRefresh = async (docId, status) => {
    await assignedState.updateReviewStatus(docId, status);
    await Promise.all([
      refreshPublishedData(),
      assignedState.refreshAssignedDocuments(),
      refreshUploadedDocs(),
    ]);
  };

  const signOut = async () => {
    await authState.signOut();
    set({ docId: null, threadId: null, upload: false, ask: false });
  };

  return {
    s,
    narrow, mini, wide,
    navOpen: s.navOpen,
    isSearch: s.view === "search",
    isThreads: s.view === "threads",
    isSources: s.view === "sources",
    isUploads: s.view === "uploads",
    isAssigned: s.view === "assigned",
    query: s.query,
    onQuery: (e) => set({ query: e.target.value }),
    project: s.project,
    resultCount: results.length,
    heroTitle: s.query ? `Results for "${s.query}"` : "What are you looking for?",
    heroSub: s.query
      ? "Ranked across docs, READMEs, imported articles and accepted answers."
      : "Search 214 indexed documents and 68 answered threads. Filter by project, source or freshness.",
    searchError: isSemanticSearch ? searchError : publishedError,
    searchLoading: isSemanticSearch ? searchLoading : publishedLoading,
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
    uploadedDocsCount,
    uploadsLoading,
    uploadsError,
    assignedDocuments: assignedState.assignedDocuments,
    assignedLoading: assignedState.assignedLoading,
    assignedError: assignedState.assignedError,
    refreshAssignedDocuments: assignedState.refreshAssignedDocuments,
    updateReviewStatus: assignedState.updateReviewStatus,
    projectModalOpen: s.projectModal,
    resultCount: filteredDocs.length,
    refreshUploadedDocs: refreshAllStates,
    updateReviewStatus: updateReviewStatusAndRefresh,
    projectChips,
    ...uploadTagState,
    target: s.target,
    docOpen, docV,
    threadOpen, threadV,
    uploadOpen, askOpen, globalTagOpen, setGlobalTagOpen,
    reviewerModalOpen: s.reviewerModal,
    activeReviewerDoc: s.activeReviewerDoc,
    openReviewerModal,
    toggleNav, toggleOutdated, openProjectModal,
    openUpload, openGlobalTag, openAsk, goSources, goUploads, goAssigned, closePanel, stop,
    selectProject: handlePickProject,
    ...authState,
    signOut,
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
