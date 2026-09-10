import { useState } from "react";
import FileViewerPanel from "../panels/FileViewerPanel.jsx";
import { FileTypeMark } from "../common/FileTypeIcon.jsx";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function statusClass(status) {
  if (status === "published") {
    return "bg-[#0f3321] border border-[#6ccb5f]/40 text-[#8fdc82]";
  }
  return "bg-[#3a2a10] border border-[#ffb84d]/40 text-[#ffcf87]";
}

export default function UploadsView({ documents = [], loading, error, refresh, openUpload, onAssignReviewer }) {
  const [viewingFile, setViewingFile] = useState(null);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3 font-['Segoe_UI',system-ui,sans-serif]">
        <div className="flex-1 text-[clamp(20px,2.6vw,26px)] font-bold tracking-[-.02em] text-[#f5f5f5]">My uploads</div>
        <button
          onClick={refresh}
          disabled={loading}
          className="h-8 rounded-md border border-white/[0.12] bg-white/[0.05] px-3 text-xs font-semibold text-white/80 transition-colors hover:bg-white/[0.1] hover:text-white disabled:cursor-wait disabled:opacity-60"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-lg border border-[#c42b1c]/40 bg-[#442726] p-3.5 text-[13px] text-[#ff99a4]">
          {error}
        </div>
      )}

      {loading && !documents.length && (
        <div className="p-7 text-center text-[13px] text-white/[0.55]">Loading your documents…</div>
      )}

      {!loading && !error && !documents.length && (
        <div className="rounded-lg border border-dashed border-white/[0.15] bg-[#202020] p-[34px] text-center">
          <div className="text-2xl">⤒</div>
          <div className="mt-2 text-[15px] font-semibold text-white">No uploads yet</div>
          <div className="mt-[5px] text-[13px] text-white/[0.55]">Upload a PDF or Markdown document to see it here.</div>
          <button
            onClick={openUpload}
            className="mt-4 h-9 rounded-md border border-[#4cc2ff]/40 bg-[#4cc2ff]/10 px-3.5 text-[12.5px] font-semibold text-[#8fd8ff] transition-colors hover:bg-[#4cc2ff]/20"
          >
            Upload document
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-start gap-3.5 rounded-3xl border border-white/[0.12] bg-gradient-to-br from-white/10 to-white/[0.04] px-[18px] py-4 shadow-[inset_0_1px_0_rgba(255,255,255,.24),0_16px_40px_rgba(0,0,0,.25)] backdrop-blur-2xl backdrop-saturate-[1.7]"
          >
            <div
              className="
                grid
                h-11
                w-11
                flex-none
                place-items-center
                rounded-xl
                border
                border-white/[0.11]
                bg-gradient-to-br
                from-white/[0.12]
                to-white/[0.025]
                shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_5px_14px_rgba(0,0,0,.22)]
                backdrop-blur-xl
                backdrop-saturate-[1.4]
              "
            >
              <FileTypeMark
                fileType={doc.fileType || doc.file_type}
                size={22}
              />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingFile(doc)}
                  className="truncate text-left text-[15px] font-semibold text-[#f5f5f5] transition-colors hover:text-[#8fd8ff] hover:underline"
                >
                  {doc.title || doc.fileName}
                </button>

                <span className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${statusClass(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
              <div className="mt-1 truncate text-[12px] text-white/[0.5]">{doc.fileName}</div>
              {doc.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="rounded border border-white/[0.08] bg-white/[0.05] px-2 py-[3px] text-[11px] font-semibold text-white/[0.65]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2 font-mono text-[11px] text-white/40">
                <span>{doc.projectName || "Unassigned"}</span><span>·</span><span>{(doc.fileType || "file").toUpperCase()}</span><span>·</span><span>uploaded {formatDate(doc.createdAt)}</span>
              </div>
            </div>

            <div className="ml-auto flex flex-none items-center gap-2">
              <button
                type="button"
                onClick={() => setViewingFile(doc)}
                className="h-8 rounded-md border border-[#4cc2ff]/40 bg-[#4cc2ff]/10 px-3 text-xs font-semibold text-[#8fd8ff] transition-colors hover:bg-[#4cc2ff]/20"
              >
                View file
              </button>
              
              {/* Conditionally render reviewer action only if the status is NOT published */}
              {doc.status !== "published" && (
                <button
                  type="button"
                  onClick={() => onAssignReviewer?.(doc)}
                  className="h-8 rounded-md border border-white/[0.12] bg-white/[0.05] px-3 text-xs font-semibold text-white/80 transition-colors hover:bg-white/[0.1] hover:text-white"
                >
                  {doc.reviewer_id ? "Change assigned user" : "Assign Reviewer"}
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      {viewingFile && (
        <FileViewerPanel file={viewingFile} onClose={() => setViewingFile(null)} />
      )}
    </>
  );
}
