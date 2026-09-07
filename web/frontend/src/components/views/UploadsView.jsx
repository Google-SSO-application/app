import El from "../../lib/El.jsx";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function statusStyle(status) {
  if (status === "published") {
    return "background:rgba(95,227,161,.14);border:1px solid rgba(95,227,161,.32);color:#8ff0c0";
  }
  return "background:rgba(255,176,88,.14);border:1px solid rgba(255,176,88,.32);color:#ffcf94";
}

export default function UploadsView({ documents = [], loading, error, refresh, openUpload }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ flex: "1 1 auto", fontSize: "clamp(20px,2.6vw,26px)", fontWeight: 700, letterSpacing: "-.02em" }}>My uploads</div>
        <button onClick={refresh} disabled={loading}
          style={{ height: 34, padding: "0 12px", borderRadius: 11, border: "1px solid rgba(255,255,255,.16)", background: "rgba(255,255,255,.08)", color: "inherit", cursor: loading ? "wait" : "pointer", fontSize: 12.5, fontWeight: 600 }}>
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div role="alert" style={{ padding: 14, borderRadius: 14, background: "rgba(255,106,168,.12)", border: "1px solid rgba(255,106,168,.3)", color: "#ffd4e5", fontSize: 13 }}>
          {error}
        </div>
      )}

      {loading && !documents.length && (
        <div style={{ padding: 28, textAlign: "center", color: "rgba(238,240,255,.58)", fontSize: 13 }}>Loading your documents…</div>
      )}

      {!loading && !error && !documents.length && (
        <div style={{ padding: 34, textAlign: "center", borderRadius: 22, border: "1px dashed rgba(255,255,255,.2)", background: "rgba(255,255,255,.03)" }}>
          <div style={{ fontSize: 24 }}>⤒</div>
          <div style={{ marginTop: 8, fontSize: 15, fontWeight: 600 }}>No uploads yet</div>
          <div style={{ marginTop: 5, fontSize: 13, color: "rgba(238,240,255,.58)" }}>Upload a PDF or Markdown document to see it here.</div>
          <button onClick={openUpload} style={{ marginTop: 16, height: 36, padding: "0 14px", borderRadius: 11, border: "1px solid rgba(255,255,255,.18)", background: "rgba(255,255,255,.1)", color: "inherit", cursor: "pointer", fontSize: 12.5, fontWeight: 600 }}>Upload document</button>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {documents.map((doc) => (
          <El as="div" key={doc.id} style="display:flex;gap:14px;align-items:center;padding:16px 18px;border-radius:20px;background:linear-gradient(165deg,rgba(255,255,255,.1),rgba(255,255,255,.04));backdrop-filter:blur(24px) saturate(170%);-webkit-backdrop-filter:blur(24px) saturate(170%);border:1px solid rgba(255,255,255,.12);box-shadow:inset 0 1px 0 rgba(255,255,255,.24),0 16px 40px rgba(0,0,0,.25)">
            
            {/* Visual Anchor Link wrapper surrounding the icon box */}
            <a 
              href={`/web/uploads/${doc.fileName}`} 
              target="_blank" 
              rel="noopener noreferrer" 
              style={{ textDecoration: "none", color: "inherit", display: "block" }}
            >
              <div style={{ flex: "0 0 auto", width: 44, height: 44, borderRadius: 14, display: "grid", placeItems: "center", fontSize: 16, background: "rgba(255,255,255,.09)", border: "1px solid rgba(255,255,255,.14)", cursor: "pointer" }}>
                {doc.fileType === "pdf" ? "▤" : "≡"}
              </div>
            </a>

            <div style={{ flex: "1 1 auto", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 9, flexWrap: "wrap" }}>
                {/* 
                  Converted title text to an active hyperlink. 
                  Points directly to your Go static volume route path context mapping.
                */}
                <a 
                  href={`/web/uploads/${doc.fileName}`} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  style={{ 
                    fontSize: "15.5px", 
                    fontWeight: 600, 
                    overflow: "hidden", 
                    textOverflow: "ellipsis", 
                    whiteSpace: "nowrap", 
                    color: "#eef0ff", 
                    textDecoration: "none", 
                    cursor: "pointer"
                  }}
                  onMouseEnter={(e) => e.target.style.textDecoration = "underline"}
                  onMouseLeave={(e) => e.target.style.textDecoration = "none"}
                >
                  {doc.title || doc.fileName}
                </a>

                <span style={{ padding: "4px 8px", borderRadius: 999, fontSize: 11, fontWeight: 600, ...Object.fromEntries(statusStyle(doc.status).split(";").filter(Boolean).map((rule) => rule.split(":").map((part) => part.trim()))) }}>{doc.status}</span>
              </div>
              <div style={{ marginTop: 6, fontSize: 12.5, color: "rgba(238,240,255,.58)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{doc.fileName}</div>
              <div style={{ marginTop: 8, display: "flex", flexWrap: "wrap", gap: 8, fontSize: 11.5, color: "rgba(238,240,255,.45)", fontFamily: "'DM Mono',monospace" }}>
                <span>{(doc.fileType || "file").toUpperCase()}</span><span>·</span><span>uploaded {formatDate(doc.createdAt)}</span>
              </div>
            </div>
          </El>
        ))}
      </div>
    </>
  );
}
