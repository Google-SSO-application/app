import React from "react";
import useReviewers from "../../hooks/useReviewers.js";

export default function ReviewerAssignmentPanel({ documentItem, closePanel, stop, onAssignmentSuccess, showToast }) {
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

  return (
    <div
      onClick={closePanel}
      className="fixed inset-0 z-[100] grid place-items-center bg-[#04050c]/60 p-5 backdrop-blur-[8px]"
    >
      <div
        onClick={stop}
        className="flex max-h-[85vh] w-[min(640px,100%)] flex-col rounded-3xl border border-white/[0.17] bg-gradient-to-br from-white/[0.14] to-white/5 p-6 shadow-[inset_0_1px_0_rgba(255,255,255,.35),0_34px_80px_rgba(0,0,0,.6)]"
      >
        <div>
          <div className="text-lg font-bold tracking-[-.02em]">
            {assignedReviewer ? "Change assigned reviewer" : "Assign reviewer"}
          </div>
          <div className="mt-1 text-[13px] text-white/[0.62]">
            Select a fellow teammate to review:{" "}
            <span className="font-semibold text-white">{documentItem.title || documentItem.file_name}</span>
          </div>
        </div>

        {error && (
          <div role="alert" className="mt-3 rounded-[10px] border border-[#ff6aa8]/30 bg-[#ff6aa8]/[0.12] p-2.5 text-xs text-[#ff6aa8]">
            {error}
          </div>
        )}

        {assignedReviewer && (
          <div className="mt-4 rounded-2xl border border-[#8ff0c0]/20 bg-[#8ff0c0]/[0.08] p-3">
            <div className="mb-2.5 text-[11px] font-bold uppercase tracking-[.06em] text-[#8ff0c0]">
              Currently assigned
            </div>
            <div className="flex items-center gap-3">
              {assignedReviewer.picture ? (
                <img src={assignedReviewer.picture} alt={assignedReviewer.name} className="h-[34px] w-[34px] rounded-full object-cover" />
              ) : (
                <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-white/10 text-xs font-semibold">
                  {assignedReviewer.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0">
                <div className="text-[13px] font-semibold">{assignedReviewer.name || "Assigned user"}</div>
                <div className="mt-0.5 text-[11.5px] text-white/[0.55]">{assignedReviewer.email}</div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={removeReviewer}
                className="ml-auto h-7 rounded-lg border border-[#ff6aa8]/30 bg-[#ff6aa8]/[0.12] px-2.5 text-[11.5px] font-semibold text-[#ffd4e5] disabled:cursor-wait"
              >
                Remove
              </button>
            </div>
          </div>
        )}

        <div className="mt-4 text-xs font-semibold text-white/[0.62]">Assignable users</div>
        <div className="mt-4 flex min-h-[180px] flex-1 flex-col gap-2 overflow-y-auto pr-1">
          {loading && (
            <div className="p-5 text-center text-[13px] text-white/45">Scanning team matrix...</div>
          )}

          {!loading && !assignableUsers.length && (
            <div className="p-5 text-center text-[13px] text-white/45">
              {assignedReviewer ? "No other users are available for assignment." : "No users are available for assignment."}
            </div>
          )}

          {!loading && assignableUsers.map((user) => (
            <div
              key={user.ID}
              className="flex items-center justify-items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.04] p-2.5"
            >
              {user.Picture ? (
                <img src={user.Picture} alt={user.Name} className="h-[34px] w-[34px] rounded-full object-cover" />
              ) : (
                <div className="grid h-[34px] w-[34px] place-items-center rounded-full bg-white/10 text-xs font-semibold">
                  {user.Name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold">{user.Name}</div>
                <div className="truncate text-[11.5px] text-white/45">{user.Email}</div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => assignReviewer(user.ID)}
                className="h-7 rounded-lg border-none bg-[#8ff0c0] px-2.5 text-[11.5px] font-semibold text-[#12142a] disabled:cursor-wait"
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
            className="h-9 rounded-[10px] border border-white/[0.16] bg-white/[0.07] px-3.5 text-[12.5px] font-semibold text-inherit disabled:cursor-wait"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
