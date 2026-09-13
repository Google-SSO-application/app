import { useAppState } from "./hooks/useAppState.js";

import BackgroundOrbs       from "./components/layout/BackgroundOrbs.jsx";
import AppHeader            from "./components/layout/AppHeader.jsx";
import Sidebar              from "./components/layout/Sidebar.jsx";
import LoginPage            from "./components/views/LoginPage.jsx";
import SearchView           from "./components/views/SearchView.jsx";
import ThreadsView          from "./components/views/ThreadsView.jsx";
import SourcesView          from "./components/views/SourcesView.jsx";
import UploadsView          from "./components/views/UploadsView.jsx";
import AssignedDocumentsView from "./components/views/AssignedDocumentsView.jsx";
import DocPanel             from "./components/panels/DocPanel.jsx";
import ThreadPanel          from "./components/panels/ThreadPanel.jsx";
import UploadModal          from "./components/panels/UploadModal.jsx";
import GlobalTagModal       from "./components/panels/GlobalTagModal.jsx";
import AskModal             from "./components/panels/AskModal.jsx";
import ProjectCreateModal from "./components/panels/ProjectCreateModal.jsx";
import ReviewerAssignmentPanel from "./components/panels/ReviewerAssignmentPanel.jsx";
import { ConfirmDialogProvider, useConfirm } from "./hooks/useConfirmDialog.jsx";
import Toast from "./components/common/Toast.jsx";
import { useToast } from "./hooks/useToast.js";
import { useCurrentUser } from "./hooks/useCurrentUser.js"

function AppShell() {
  const v = useAppState();
  const { toast, showToast, closeToast } = useToast();
  const confirm = useConfirm();
  const { currentUser } = useCurrentUser(v.signedIn);

  const handleUpdateReviewStatus = async (id, status) => {
    const isApprove = status === "published";
    const ok = await confirm({
      title: isApprove ? "Approve this document?" : "Reject this document?",
      message: isApprove
        ? "It will be published and become searchable across the hub."
        : "The uploader will need to make changes and resubmit for review.",
      confirmLabel: isApprove ? "Approve" : "Reject",
      danger: !isApprove,
    });
    if (!ok) return;

    if (isApprove) {
      showToast("Processing document — chunking & embedding…", "processing");
    }

    try {
      await v.updateReviewStatus(id, status);
      showToast(isApprove ? "Document approved & published." : "Document rejected.");
    } catch (error) {
      showToast(error.message || "Unable to update review status.", "error");
    }
  };

  return (
    <div className="relative min-h-screen overflow-x-hidden bg-[#05060c] font-sans text-[#eef0ff]">

      <BackgroundOrbs />

      {/* Loading state */}
      {!v.authReady && (
        <div className="relative z-[2] grid min-h-screen place-items-center text-white/[0.72]">
          Checking your Atlas session…
        </div>
      )}

      {/* Auth error toast */}
      {v.authError && (
        <div
          role="alert"
          className="fixed left-1/2 top-[18px] z-[60] -translate-x-1/2 rounded-xl border border-[#ff6aa8]/40 bg-[#ff6aa8]/[0.16] px-4 py-3 text-[13px] text-[#ffd4e5]"
        >
          {v.authError}
        </div>
      )}

      {/* Sign-in screen */}
      {v.signedOut && (
        <LoginPage loginPoints={v.loginPoints} signIn={v.signIn} />
      )}

      {/* Main app shell */}
      {v.signedIn && currentUser && (
        <div className="relative z-[2] flex min-h-screen flex-col">

          <AppHeader
            query={v.query}
            onQuery={v.onQuery}
            toggleNav={v.toggleNav}
            openUpload={v.openUpload}
            openGlobalTag={v.openGlobalTag}
            signOut={v.signOut}
            currentUser={currentUser}
          />

          <div className="mx-auto flex w-full max-w-[1560px] flex-1 items-start gap-[clamp(12px,2vw,22px)] p-[clamp(14px,2.4vw,24px)]">

            <Sidebar
              narrow={v.narrow}
              navOpen={v.navOpen}
              mini={v.mini}
              wide={v.wide}
              nav={v.nav}
              projectList={v.projectList}
              goSources={v.goSources}
              openProjectModal={v.openProjectModal}
              goAssigned={v.goAssigned}
            />

            <main className="flex min-w-0 flex-1 flex-col gap-4">
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
                  searchLoading={v.searchLoading}
                  searchError={v.searchError}
                />
              )}
              {v.isAssigned && (
                <AssignedDocumentsView
                  documents={v.assignedDocuments}
                  loading={v.assignedLoading}
                  error={v.assignedError}
                  refresh={v.refreshAssignedDocuments}
                  updateStatus={handleUpdateReviewStatus}
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
                  onAssignReviewer={v.openReviewerModal}
                />
              )}
            </main>
          </div>
        </div>
      )}

      {/* Panels & modals — rendered outside the shell so they overlay everything */}
      {v.docOpen    && <DocPanel    docV={v.docV} closePanel={v.closePanel} toggleOutdated={v.toggleOutdated} />}
      {v.threadOpen && <ThreadPanel threadV={v.threadV} closePanel={v.closePanel} />}
      {v.uploadOpen && (
        <UploadModal 
          closePanel={v.closePanel} 
          stop={v.stop} 
          projectChips={v.projectChips} 
          target={v.target} 
          onProjectSelected={v.selectProject} 
          onUploaded={v.refreshUploadedDocs} 
          showToast={showToast}

          masterTags={v.masterTags}
          newTagFields={v.newTagFields}
          tagError={v.tagError}
          setTagError={v.setTagError}
          toggleMasterTagSelection={v.toggleMasterTagSelection}
          handleTagFieldChange={v.handleTagFieldChange}
          addAnotherTagField={v.addAnotherTagField}
          removeTagField={v.removeTagField}
          resetTagFieldsForm={v.resetTagFieldsForm}
        />
      )}
      {v.globalTagOpen && (
        <GlobalTagModal
          closePanel={() => v.setGlobalTagOpen(false)}
          stop={v.stop}
          onCreated={v.refreshUploadedDocs}
          showToast={showToast}
        />
      )}
      {v.askOpen    && <AskModal    closePanel={v.closePanel} stop={v.stop} projectChips={v.projectChips} target={v.target} />}
      {v.projectModalOpen && <ProjectCreateModal closePanel={v.closePanel} stop={v.stop} onCreated={v.refreshUploadedDocs} showToast={showToast} />}
      {v.reviewerModalOpen && <ReviewerAssignmentPanel documentItem={v.activeReviewerDoc} closePanel={v.closePanel} stop={v.stop} onAssignmentSuccess={async () => { await Promise.all([v.refreshUploadedDocs(), v.refreshAssignedDocuments()]); }} showToast={showToast} />}
      {toast && <Toast key={toast.key} message={toast.message} type={toast.type} onClose={closeToast} />}
    </div>
  );
}

export default function App() {
  return (
    <ConfirmDialogProvider>
      <AppShell />
    </ConfirmDialogProvider>
  );
}