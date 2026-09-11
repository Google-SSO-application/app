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
            className="
              group relative flex cursor-pointer items-start gap-3.5
              rounded-[20px]
              border border-white/[0.12]
              bg-gradient-to-br from-white/10 to-white/[0.04]
              px-[18px] py-4
              shadow-[inset_0_1px_0_rgba(255,255,255,.24),0_16px_40px_rgba(0,0,0,.25)]
              backdrop-blur-2xl
              backdrop-saturate-[1.7]
              transition-all duration-200 ease-out
              hover:-translate-y-[1px]
              hover:border-white/[0.22]
              hover:from-white/[0.15]
              hover:to-white/[0.065]
              hover:shadow-[inset_0_1px_0_rgba(255,255,255,.30),0_20px_48px_rgba(0,0,0,.35)]
            "
          >
            {/* File icon */}
            <div
              className="
                grid h-11 w-11 flex-none place-items-center
                rounded-xl
                border border-white/[0.11]
                bg-gradient-to-br from-white/[0.12] to-white/[0.025]
                shadow-[inset_0_1px_0_rgba(255,255,255,.18),0_5px_14px_rgba(0,0,0,.22)]
                backdrop-blur-xl
                backdrop-saturate-[1.4]
                transition-all duration-200
                group-hover:border-white/[0.18]
                group-hover:bg-white/[0.14]
              "
            >
              <FileTypeMark
                fileType={doc.fileType || doc.file_type}
                size={22}
              />
            </div>

            {/* Document information */}
            <div className="min-w-0 flex-1">
              {/* Title + status */}
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setViewingFile(doc)}
                  className="
                    truncate
                    text-left
                    text-[15px]
                    font-semibold
                    leading-[1.35]
                    tracking-[-0.01em]
                    text-[#eef0ff]
                    transition-colors duration-150
                    hover:text-[#d8dcff]
                  "
                >
                  {doc.title || doc.fileName}
                </button>

                <span
                  className={`
                    rounded-lg
                    px-2 py-0.5
                    text-[11px]
                    font-semibold
                    leading-[1.4]
                    tracking-[0.02em]
                    ${statusClass(doc.status)}
                  `}
                >
                  {doc.status}
                </span>
              </div>

              {/* Filename */}
              <div
                className="
                  mt-1
                  truncate
                  text-[12px]
                  leading-[1.45]
                  text-white/[0.45]
                  transition-colors duration-150
                  group-hover:text-white/[0.52]
                "
              >
                {doc.fileName}
              </div>

              {/* Tags */}
              {doc.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="
                        rounded-md
                        border border-white/[0.08]
                        bg-white/[0.045]
                        px-2 py-[3px]
                        text-[11px]
                        font-medium
                        leading-none
                        text-white/[0.60]
                        transition-all duration-150
                        group-hover:border-white/[0.11]
                        group-hover:bg-white/[0.065]
                        group-hover:text-white/[0.68]
                      "
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Metadata */}
              <div
                className="
                  mt-2
                  flex flex-wrap items-center gap-2
                  font-mono
                  text-[11px]
                  leading-[1.4]
                  text-white/[0.40]
                  transition-colors duration-150
                  group-hover:text-white/[0.48]
                "
              >
                <span>{doc.projectName || "Unassigned"}</span>
                <span>·</span>
                <span>
                  {(doc.fileType || "file").toUpperCase()}
                </span>
                <span>·</span>
                <span>uploaded {formatDate(doc.createdAt)}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="ml-auto flex flex-none items-center gap-2">
              <button
                type="button"
                onClick={() => setViewingFile(doc)}
                className="
                  h-8
                  rounded-md
                  border border-[#4cc2ff]/40
                  bg-[#4cc2ff]/10
                  px-3
                  text-xs
                  font-semibold
                  text-[#8fd8ff]
                  transition-all duration-150
                  hover:border-[#4cc2ff]/55
                  hover:bg-[#4cc2ff]/20
                  hover:text-[#a9e3ff]
                "
              >
                View file
              </button>

              {doc.status !== "published" && (
                <button
                  type="button"
                  onClick={() => onAssignReviewer?.(doc)}
                  className="
                    h-8
                    rounded-md
                    border border-white/[0.12]
                    bg-white/[0.05]
                    px-3
                    text-xs
                    font-semibold
                    text-white/80
                    transition-all duration-150
                    hover:border-white/[0.18]
                    hover:bg-white/[0.10]
                    hover:text-white
                  "
                >
                  {doc.reviewer_id
                    ? "Change assigned user"
                    : "Assign Reviewer"}
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
