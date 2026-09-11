import { useCallback, useState } from "react";

const initialState = {
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
  reviewerModal: false,
  activeReviewerDoc: null,
  navOpen: true,
  collapsed: false,
  outdated: { 3: true },
  target: "",
};

export function useUiState() {
  const [state, setState] = useState(initialState);
  const set = useCallback((updates) => setState((current) => ({ ...current, ...updates })), []);

  const openReviewerModal = useCallback((doc) => {
    setState((current) => ({ ...current, reviewerModal: true, activeReviewerDoc: doc }));
  }, []);

  const handlePickProject = useCallback((projectName) => {
    set({ target: projectName });
  }, [set]);

  const closePanel = useCallback(() => {
    set({
      docId: null,
      threadId: null,
      upload: false,
      ask: false,
      projectModal: false,
      reviewerModal: false,
      activeReviewerDoc: null,
    });
  }, [set]);

  const toggleNav = useCallback((narrow) => {
    set(narrow ? { navOpen: !state.navOpen } : { collapsed: !state.collapsed });
  }, [set, state.navOpen, state.collapsed]);

  const stop = useCallback((event) => event.stopPropagation(), []);

  return {
    state,
    set,
    openReviewerModal,
    handlePickProject,
    closePanel,
    toggleNav,
    stop,
  };
}
