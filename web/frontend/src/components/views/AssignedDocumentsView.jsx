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
                <span>
                  uploaded {formatDate(doc.createdAt)}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="ml-auto flex flex-none items-center gap-2">
              {/* View */}
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

              {/* Approve */}
              <button
                type="button"
                onClick={() => updateStatus(doc.id, "published")}
                className="
                  h-8
                  rounded-[9px]
                  border border-[#5fe3a1]/30
                  bg-[#5fe3a1]/[0.12]
                  px-3
                  text-xs
                  font-semibold
                  text-[#8ff0c0]
                  transition-all duration-150
                  hover:border-[#5fe3a1]/45
                  hover:bg-[#5fe3a1]/[0.20]
                  hover:text-[#a8ffd2]
                "
              >
                Approve
              </button>

              {/* Reject */}
              <button
                type="button"
                onClick={() => updateStatus(doc.id, "rejected")}
                className="
                  h-8
                  rounded-[9px]
                  border border-[#ff6aa8]/30
                  bg-[#ff6aa8]/[0.12]
                  px-3
                  text-xs
                  font-semibold
                  text-[#ffd4e5]
                  transition-all duration-150
                  hover:border-[#ff6aa8]/45
                  hover:bg-[#ff6aa8]/[0.20]
                  hover:text-[#ffe2ed]
                "
              >
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
