import { useAppState } from "./hooks/useAppState.js";

import BackgroundOrbs       from "./components/layout/BackgroundOrbs.jsx";
import AppHeader            from "./components/layout/AppHeader.jsx";
import Sidebar              from "./components/layout/Sidebar.jsx";
import LoginPage            from "./components/views/LoginPage.jsx";
import SearchView           from "./components/views/SearchView.jsx";
import ThreadsView          from "./components/views/ThreadsView.jsx";
import SourcesView          from "./components/views/SourcesView.jsx";
import UploadsView          from "./components/views/UploadsView.jsx";
import DocPanel             from "./components/panels/DocPanel.jsx";
import ThreadPanel          from "./components/panels/ThreadPanel.jsx";
import UploadModal          from "./components/panels/UploadModal.jsx";
import AskModal             from "./components/panels/AskModal.jsx";
import ProjectCreateModal from "./components/panels/ProjectCreateModal.jsx";

export default function App() {
  const v = useAppState();

  return (
    <div style={{ position: "relative", minHeight: "100vh", fontFamily: "'DM Sans',system-ui,sans-serif", color: "#eef0ff", background: "#05060c", overflowX: "hidden" }}>

      <BackgroundOrbs />

      {/* Loading state */}
      {!v.s.authReady && (
        <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "grid", placeItems: "center", color: "rgba(238,240,255,.72)" }}>
          Checking your Atlas session…
        </div>
      )}

      {/* Auth error toast */}
      {v.s.authError && (
        <div role="alert" style={{ position: "fixed", zIndex: 60, top: 18, left: "50%", transform: "translateX(-50%)", padding: "12px 16px", borderRadius: 12, background: "rgba(255,106,168,.16)", border: "1px solid rgba(255,106,168,.4)", color: "#ffd4e5", fontSize: 13 }}>
          {v.s.authError}
        </div>
      )}

      {/* Sign-in screen */}
      {v.signedOut && (
        <LoginPage loginPoints={v.loginPoints} signIn={v.signIn} />
      )}

      {/* Main app shell */}
      {v.signedIn && (
        <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

          <AppHeader
            query={v.query}
            onQuery={v.onQuery}
            toggleNav={v.toggleNav}
            openUpload={v.openUpload}
            signOut={v.signOut}
          />

          <div style={{ flex: "1 1 auto", display: "flex", alignItems: "flex-start", gap: "clamp(12px,2vw,22px)", padding: "clamp(14px,2.4vw,24px)", maxWidth: 1560, width: "100%", margin: "0 auto" }}>

            <Sidebar
              sidebarStyle={v.sidebarStyle}
              sectionStyle={v.sectionStyle}
              syncCardStyle={v.syncCardStyle}
              nav={v.nav}
              projectList={v.projectList}
              mini={v.mini}
              wide={v.wide}
              goSources={v.goSources}
              openProjectModal={v.openProjectModal}
            />

            <main style={{ flex: "1 1 auto", minWidth: 0, display: "flex", flexDirection: "column", gap: 16 }}>
              {v.isSearch && (
                <SearchView
                  heroTitle={v.heroTitle}
                  heroSub={v.heroSub}
                  suggestions={v.suggestions}
                  typeFilters={v.typeFilters}
                  statusFilters={v.statusFilters}
                  resultCount={v.resultCount}
                  project={v.project}
                  results={v.results}
                />
              )}
              {v.isThreads && (
                <ThreadsView threads={v.threads} openAsk={v.openAsk} />
              )}
              {v.isSources && (
                <SourcesView sources={v.sources} openUpload={v.openUpload} />
              )}
              {v.isUploads && (
                <UploadsView
                  documents={v.uploadedDocs}
                  loading={v.uploadsLoading}
                  error={v.uploadsError}
                  refresh={v.refreshUploadedDocs}
                  openUpload={v.openUpload}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Panels & modals — rendered outside the shell so they overlay everything */}
      {v.docOpen    && <DocPanel    docV={v.docV} closePanel={v.closePanel} toggleOutdated={v.toggleOutdated} outdatedBtnLabel={v.outdatedBtnLabel} outdatedBtnStyle={v.outdatedBtnStyle} />}
      {v.threadOpen && <ThreadPanel threadV={v.threadV} closePanel={v.closePanel} />}
      {v.uploadOpen && <UploadModal closePanel={v.closePanel} stop={v.stop} projectChips={v.projectChips} target={v.target} onUploaded={v.refreshUploadedDocs} />}
      {v.askOpen    && <AskModal    closePanel={v.closePanel} stop={v.stop} projectChips={v.projectChips} target={v.target} />}
      {v.projectModalOpen && <ProjectCreateModal closePanel={v.closePanel} stop={v.stop} onCreated={v.refreshUploadedDocs} />}
    </div>
  );
}
