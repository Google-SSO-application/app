import React from "react";
import useReviewers from "../../hooks/useReviewers.js";
import { useConfirm } from "../../hooks/useConfirmDialog.jsx";

export default function ReviewerAssignmentPanel({ documentItem, closePanel, stop, onAssignmentSuccess, showToast }) {
  const confirm = useConfirm();
  const assignedReviewer = documentItem.reviewer_id
    ? {
      name: documentItem.reviewer_name,
      email: documentItem.reviewer_email,
      picture: documentItem.reviewer_picture,
    }
    : null;

  const { teammates, loading, error, isSubmitting, assignReviewer, removeReviewer } = useReviewers(
    documentItem.id,
    onAssignmentSuccess,
    closePanel,
    showToast,
  );
  const assignableUsers = teammates.filter((user) => String(user.ID) !== String(documentItem.reviewer_id));

  const handleAssign = async (userId, userName) => {
    const ok = await confirm({
      title: assignedReviewer ? "Change reviewer?" : "Assign reviewer?",
      message: `${userName} will review "${documentItem.title || documentItem.file_name}".`,
      confirmLabel: assignedReviewer ? "Change" : "Assign",
    });
    if (!ok) return;
    assignReviewer(userId);
  };

  const handleRemove = async () => {
    const ok = await confirm({
      title: "Remove reviewer?",
      message: `${assignedReviewer?.name || "This reviewer"} will no longer be asked to review this document.`,
      confirmLabel: "Remove",
      danger: true,
    });
    if (!ok) return;
    removeReviewer();
  };

  return (
    <div
      onClick={closePanel}
      className="fixed inset-0 z-[100] grid place-items-center bg-black/60 p-5 backdrop-blur-[3px]"
    >
      <div
        onClick={stop}
        className="flex max-h-[85vh] w-[min(640px,100%)] flex-col rounded-lg border border-white/10 bg-[#2b2b2b] p-6 font-['Segoe_UI',system-ui,sans-serif] shadow-[0_8px_32px_rgba(0,0,0,.5)]"
      >
        <div>
          <div className="text-[17px] font-semibold tracking-[-.01em] text-[#f5f5f5]">
            {assignedReviewer ? "Change assigned reviewer" : "Assign reviewer"}
          </div>
          <div className="mt-1 text-[13px] text-white/55">
            Select a fellow teammate to review:{" "}
            <span className="font-semibold text-white">{documentItem.title || documentItem.file_name}</span>
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-3 rounded-md border border-[#c42b1c]/40 bg-[#442726] p-2.5 text-xs text-[#ff99a4]">
            {error}
          </div>
        )}

        {assignedReviewer && (
          <div className="mt-4 rounded-md border border-[#6ccb5f]/25 bg-[#6ccb5f]/[0.08] p-3">
            <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[.06em] text-[#8fdc82]">
              Currently assigned
            </div>
            <div className="flex items-center gap-3">
              {assignedReviewer.picture ? (
                <img src={assignedReviewer.picture} alt={assignedReviewer.name} className="h-[34px] w-[34px] rounded-full object-cover" />
              ) : (
                <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
                  {assignedReviewer.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[13px] font-semibold text-white">{assignedReviewer.name || "Assigned user"}</div>
                <div className="mt-0.5 text-[11.5px] text-white/[0.5]">{assignedReviewer.email}</div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleRemove}
                className="ml-auto h-7 rounded-md border border-[#c42b1c]/40 bg-[#c42b1c]/[0.14] px-2.5 text-[11.5px] font-semibold text-[#ff99a4] transition-colors hover:bg-[#c42b1c]/25 disabled:cursor-wait"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs font-semibold text-white/55">Assignable users</div>
        <div className="mt-3 flex min-h-[180px] flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {loading && (
            <div className="p-5 text-center text-[13px] text-white/40">Scanning team matrix...</div>
          )}

          {!loading && !assignableUsers.length && (
            <div className="p-5 text-center text-[13px] text-white/40">
              {assignedReviewer ? "No other users are available for assignment." : "No users are available for assignment."}
            </div>
          )}

          {!loading && assignableUsers.map((user) => (
            <div
              key={user.ID}
              className="flex items-center justify-items-center gap-3 rounded-md border border-white/[0.08] bg-[#232323] p-2.5 transition-colors hover:bg-[#282828]"
            >
              {user.Picture ? (
                <img src={user.Picture} alt={user.Name} className="h-[34px] w-[34px] rounded-full object-cover" />
              ) : (
                <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-white/10 text-xs font-semibold text-white">
                  {user.Name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold text-white">{user.Name}</div>
                <div className="truncate text-[11.5px] text-white/40">{user.Email}</div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleAssign(user.ID, user.Name)}
                className="h-7 rounded-md border border-[#4cc2ff]/50 bg-[#4cc2ff] px-2.5 text-[11.5px] font-semibold text-[#0b1a24] transition-colors hover:bg-[#7ad4ff] disabled:cursor-wait"
              >
                {assignedReviewer ? "Change" : "Assign"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-5 flex justify-end">
          <button
            type="button"
            onClick={closePanel}
            disabled={isSubmitting}
            className="h-8 rounded-md border border-white/[0.12] bg-white/[0.05] px-3.5 text-[12.5px] font-semibold text-white/80 transition-colors hover:bg-white/[0.1] hover:text-white disabled:cursor-wait"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
