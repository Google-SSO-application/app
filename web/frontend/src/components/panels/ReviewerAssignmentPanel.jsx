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

  if (assignedReviewer) {
    return (
      <div onClick={closePanel} style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(4,5,12,.6)", backdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20 }}>
        <div onClick={stop} style={{ width: "min(420px,100%)", padding: 24, borderRadius: 24, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", border: "1px solid rgba(255,255,255,.17)", boxShadow: "0 34px 80px rgba(0,0,0,.6)" }}>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Assigned reviewer</div>
          <div style={{ marginTop: 16, display: "flex", alignItems: "center", gap: 12 }}>
            {assignedReviewer.picture ? (
              <img src={assignedReviewer.picture} alt={assignedReviewer.name} style={{ width: 48, height: 48, borderRadius: "50%", objectFit: "cover" }} />
            ) : (
              <div style={{ width: 48, height: 48, borderRadius: "50%", background: "rgba(255,255,255,.1)", display: "grid", placeItems: "center", fontWeight: 700 }}>
                {assignedReviewer.name?.charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div style={{ fontSize: 14, fontWeight: 600 }}>{assignedReviewer.name || "Assigned user"}</div>
              <div style={{ marginTop: 4, fontSize: 12, color: "rgba(238,240,255,.55)" }}>{assignedReviewer.email}</div>
            </div>
          </div>
          <button type="button" onClick={closePanel} style={{ marginTop: 22, height: 36, padding: "0 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.07)", color: "inherit", cursor: "pointer", fontWeight: 600 }}>
            Close
          </button>
        </div>
      </div>
    );
  }

  const { teammates, loading, error, isSubmitting, assignReviewer } = useReviewers(
    documentItem.id,
    onAssignmentSuccess,
    closePanel,
    showToast,
  );

  return (
    <div 
      onClick={closePanel} 
      style={{ position: "fixed", inset: 0, zIndex: 100, background: "rgba(4,5,12,.6)", backdropFilter: "blur(8px)", WebkitBackdropFilter: "blur(8px)", display: "grid", placeItems: "center", padding: 20 }}
    >
      <div 
        onClick={stop} 
        style={{ width: "min(640px,100%)", maxHeight: "85vh", display: "flex", flexDirection: "column", padding: 24, borderRadius: 24, background: "linear-gradient(160deg, rgba(255,255,255,.14), rgba(255,255,255,.05))", border: "1px solid rgba(255,255,255,.17)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.35), 0 34px 80px rgba(0,0,0,.6)" }}
      >
        <div>
          <div style={{ fontSize: 18, fontWeight: 700, letterSpacing: "-.02em" }}>Assign Reviewer Partner</div>
          <div style={{ marginTop: 4, fontSize: 13, color: "rgba(238,240,255,.62)" }}>
            Select a fellow teammate to review: <span style={{ color: "#fff", fontWeight: 600 }}>{documentItem.title || documentItem.file_name}</span>
          </div>
        </div>

        {error && (
          <div role="alert" style={{ marginTop: 12, padding: 10, borderRadius: 10, background: "rgba(255,106,168,.12)", border: "1px solid rgba(255,106,168,.3)", color: "#ff6aa8", fontSize: 12 }}>
            {error}
          </div>
        )}

        {/* Scrollable list container area */}
        <div style={{ flex: "1 1 auto", overflowY: "auto", marginTop: 16, display: "flex", flexDirection: "column", gap: 8, paddingRight: 4, minHeight: 180 }}>
          {loading && (
            <div style={{ textAlign: "center", color: "rgba(238,240,255,.45)", fontSize: 13, padding: 20 }}>Scanning team matrix...</div>
          )}

          {!loading && !teammates.length && (
            <div style={{ textAlign: "center", color: "rgba(238,240,255,.45)", fontSize: 13, padding: 20 }}>
              No available teammates matching your role parameters found.
            </div>
          )}

          {!loading && teammates.map((user) => (
            <div 
              key={user.ID} 
              style={{ display: "flex", alignItems: "center", justifyItems: "center", gap: 12, padding: 10, borderRadius: 14, background: "rgba(255,255,255,.04)", border: "1px solid rgba(255,255,255,.06)" }}
            >
              {user.Picture ? (
                <img src={user.Picture} alt={user.Name} style={{ width: 34, height: 34, borderRadius: "50%", objectFit: "cover" }} />
              ) : (
                <div style={{ width: 34, height: 34, borderRadius: "50%", background: "rgba(255,255,255,.1)", display: "grid", placeItems: "center", fontSize: 12, fontWeight: 600 }}>
                  {user.Name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div style={{ flex: "1 1 auto", minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.Name}</div>
                <div style={{ fontSize: 11.5, color: "rgba(238,240,255,.45)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{user.Email}</div>
              </div>
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => assignReviewer(user.ID)}
                style={{ height: 28, padding: "0 10px", borderRadius: 8, background: "#8ff0c0", color: "#12142a", border: "none", fontSize: 11.5, fontWeight: 600, cursor: isSubmitting ? "wait" : "pointer" }}
              >
                Assign
              </button>
            </div>
          ))}
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 20 }}>
          <button 
            type="button" 
            onClick={closePanel} 
            disabled={isSubmitting}
            style={{ height: 36, padding: "0 14px", borderRadius: 10, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.07)", cursor: "pointer", fontSize: 12.5, color: "inherit", fontWeight: 600 }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
