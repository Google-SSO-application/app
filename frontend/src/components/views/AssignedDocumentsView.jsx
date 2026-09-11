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
    return "bg-[#5fe3a1]/[0.14] border border-[#5fe3a1]/[0.2] text-[#5fe3a1]";
  }
  return "bg-[#ffb058]/[0.16] border border-[#ffb058]/[0.2] text-[#ffb058]";
}

export default function AssignedDocumentsView({ documents = [], loading, error, refresh, updateStatus }) {
  const [viewingFile, setViewingFile] = useState(null);

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="flex-1 text-[clamp(20px,2.6vw,26px)] font-bold">Assigned to me</div>
        <button
          onClick={refresh}
          disabled={loading}
          className="h-[34px] rounded-[11px] border border-white/[0.16] bg-white/[0.08] px-3 text-[12.5px] font-semibold text-inherit"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>
      {error && (
        <div role="alert" className="rounded-2xl bg-[#ff6aa8]/[0.12] p-3.5 text-[13px] text-[#ffd4e5]">
          {error}
        </div>
      )}
      {!loading && !error && !documents.length && (
        <div className="rounded-[22px] border border-dashed border-white/20 p-[34px] text-center text-white/[0.58]">
          No documents assigned for review.
        </div>
      )}
      <div className="flex flex-col gap-2.5">
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

                <span className={`rounded-lg px-2 py-0.5 text-[11px] font-semibold ${statusClass(doc.status)}`}>
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
              <button
                type="button"
                onClick={() => updateStatus(doc.id, "published")}
                className="
    inline-flex h-8 items-center gap-1.5
    rounded-lg
    border border-[#5fe3a1]/30
    bg-[#5fe3a1]/[0.10]
    px-3
    text-[12px] font-semibold
    text-[#8ff0c0]
    shadow-[inset_0_1px_0_rgba(255,255,255,.08)]
    transition-all duration-150
    hover:-translate-y-[1px]
    hover:bg-[#5fe3a1]/[0.18]
    hover:border-[#5fe3a1]/40
    hover:shadow-[0_4px_14px_rgba(95,227,161,.12)]
    active:translate-y-0
  "
              >
                <span className="text-[13px]">✓</span>
                Approve
              </button>
              <button
                type="button"
                onClick={() => updateStatus(doc.id, "rejected")}
                className="
    inline-flex h-8 items-center gap-1.5
    rounded-lg
    border border-[#ff6b7a]/30
    bg-[#ff6b7a]/[0.08]
    px-3
    text-[12px] font-semibold
    text-[#ff9da7]
    shadow-[inset_0_1px_0_rgba(255,255,255,.06)]
    transition-all duration-150
    hover:-translate-y-[1px]
    hover:bg-[#ff6b7a]/[0.15]
    hover:border-[#ff6b7a]/40
    hover:shadow-[0_4px_14px_rgba(255,107,122,.12)]
    active:translate-y-0
  "
              >
                <span className="text-[13px]">×</span>
                Reject
              </button>
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
