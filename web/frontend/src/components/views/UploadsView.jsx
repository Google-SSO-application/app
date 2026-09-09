function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(date);
}

function statusClass(status) {
  if (status === "published") {
    return "bg-[#5fe3a1]/[0.14] border border-[#5fe3a1]/[0.32] text-[#8ff0c0]";
  }
  return "bg-[#ffb058]/[0.14] border border-[#ffb058]/[0.32] text-[#ffcf94]";
}

export default function UploadsView({ documents = [], loading, error, refresh, openUpload, onAssignReviewer }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 text-[clamp(20px,2.6vw,26px)] font-bold tracking-[-.02em]">My uploads</div>
        <button
          onClick={refresh}
          disabled={loading}
          className="h-[34px] rounded-[11px] border border-white/[0.16] bg-white/[0.08] px-3 text-[12.5px] font-semibold text-inherit disabled:cursor-wait"
        >
          {loading ? "Refreshing…" : "Refresh"}
        </button>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl border border-[#ff6aa8]/30 bg-[#ff6aa8]/[0.12] p-3.5 text-[13px] text-[#ffd4e5]">
          {error}
        </div>
      )}

      {loading && !documents.length && (
        <div className="p-7 text-center text-[13px] text-white/[0.58]">Loading your documents…</div>
      )}

      {!loading && !error && !documents.length && (
        <div className="rounded-[22px] border border-dashed border-white/20 bg-white/[0.03] p-[34px] text-center">
          <div className="text-2xl">⤒</div>
          <div className="mt-2 text-[15px] font-semibold">No uploads yet</div>
          <div className="mt-[5px] text-[13px] text-white/[0.58]">Upload a PDF or Markdown document to see it here.</div>
          <button
            onClick={openUpload}
            className="mt-4 h-9 rounded-[11px] border border-white/[0.18] bg-white/10 px-3.5 text-[12.5px] font-semibold text-inherit"
          >
            Upload document
          </button>
        </div>
      )}

      <div className="flex flex-col gap-2.5">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="flex items-center gap-3.5 rounded-[20px] border border-white/[0.12] bg-gradient-to-br from-white/10 to-white/[0.04] px-[18px] py-4 shadow-[inset_0_1px_0_rgba(255,255,255,.24),0_16px_40px_rgba(0,0,0,.25)] backdrop-blur-2xl backdrop-saturate-[1.7]"
          >
            <a
              href={`/web/uploads/${doc.fileName}`}
              target="_blank"
              rel="noopener noreferrer"
              className="block text-inherit no-underline"
            >
              <div className="grid h-11 w-11 flex-none cursor-pointer place-items-center rounded-2xl border border-white/[0.14] bg-white/[0.09] text-base">
                {doc.fileType === "pdf" ? "▤" : "≡"}
              </div>
            </a>

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-[9px]">
                <a
                  href={`/web/uploads/${doc.fileName}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cursor-pointer truncate text-[15.5px] font-semibold text-[#eef0ff] no-underline hover:underline"
                >
                  {doc.title || doc.fileName}
                </a>

                <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${statusClass(doc.status)}`}>
                  {doc.status}
                </span>
              </div>
              <div className="mt-1.5 truncate text-[12.5px] text-white/[0.58]">{doc.fileName}</div>
              {doc.tags?.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <span key={tag} className="rounded-lg border border-[#5fe3a1]/25 bg-[#5fe3a1]/[0.12] px-2 py-[3px] text-[11px] font-semibold text-[#8ff0c0]">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              <div className="mt-2 flex flex-wrap gap-2 font-mono text-[11.5px] text-white/45">
                <span>{doc.projectName || "Unassigned"}</span><span>·</span><span>{(doc.fileType || "file").toUpperCase()}</span><span>·</span><span>uploaded {formatDate(doc.createdAt)}</span>
              </div>
            </div>

            <div className="ml-auto flex-none">
              <button
                type="button"
                onClick={() => onAssignReviewer?.(doc)}
                className="h-8 rounded-[9px] border border-white/[0.14] bg-white/[0.06] px-3 text-xs font-semibold text-white/80 transition-colors hover:bg-white/[0.12] hover:text-white"
              >
                {doc.reviewer_id ? "Change assigned user" : "Assign Reviewer"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
