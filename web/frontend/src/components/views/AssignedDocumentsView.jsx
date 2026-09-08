import El from "../../lib/El.jsx";

export default function AssignedDocumentsView({ documents = [], loading, error, refresh, updateStatus }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{ flex: "1 1 auto", fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 700 }}>Assigned to me</div>
        <button onClick={refresh} disabled={loading} style={{ height: 34, padding: "0 12px", borderRadius: 11, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.08)", color: "inherit", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && <div role="alert" style={{ padding: 14, borderRadius: 14, background: "rgba(255,106,168,.12)", color: "#ffd4e5", fontSize: 13 }}>{error}</div>}
      {!loading && !error && !documents.length && <div style={{ padding: 34, textAlign: "center", borderRadius: 22, border: "1px dashed rgba(255,255,255,.2)", color: "rgba(238,240,255,.58)" }}>No documents assigned for review.</div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {documents.map((doc) => (
          <El as="div" key={doc.id} style="display:flex;gap:14px;align-items:center;padding:16px 18px;border-radius:20px;background:linear-gradient(165deg,rgba(255,255,255,.1),rgba(255,255,255,.04));border:1px solid rgba(255,255,255,.12)">
            <a
              href={`/web/uploads/${doc.file_name}`}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`Open ${doc.title || doc.file_name}`}
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <div style={{ width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", background: "rgba(255,255,255,.09)", cursor: "pointer" }}>
                {doc.file_type === "pdf" ? "▤" : "≡"}
              </div>
            </a>
            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <a
                href={`/web/uploads/${doc.file_name}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#eef0ff", textDecoration: "none", fontSize: 15.5, fontWeight: 600 }}
              >
                {doc.title || doc.file_name}
              </a>
              <div style={{ marginTop: 6, fontSize: 12.5, color: "rgba(238,240,255,.58)" }}>{doc.project_name || doc.projectName || "Unassigned"} · submitted by {doc.owner_id}</div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={() => updateStatus(doc.id, "published")} style={{ height: 32, padding: "0 12px", borderRadius: 9, border: "1px solid rgba(95,227,161,.3)", background: "rgba(95,227,161,.12)", color: "#8ff0c0", fontWeight: 600, cursor: "pointer" }}>Approve</button>
              <button onClick={() => updateStatus(doc.id, "rejected")} style={{ height: 32, padding: "0 12px", borderRadius: 9, border: "1px solid rgba(255,106,168,.3)", background: "rgba(255,106,168,.12)", color: "#ffd4e5", fontWeight: 600, cursor: "pointer" }}>Reject</button>
            </div>
          </El>
        ))}
      </div>
    </>
  );
}
